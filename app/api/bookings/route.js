import { NextResponse } from 'next/server';
import { initialEvents, initialOrders } from '../../../lib/mockData';
import { generateRef } from '../../../lib/utils';
import { generateDynamicQRToken } from '../../../lib/tickets';
import { initiateMpesaSTKPush } from '../../../lib/payments';
import { logAuditEvent } from '../../../lib/audit';
import { prisma, isDatabaseOnline } from '../../../lib/prisma';
import { authorizeRole } from '../../../lib/auth';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../lib/facilities';

const bookingRoles = ['CUSTOMER', 'SYSTEM_ADMIN', 'VENUE_MANAGER', 'FINANCE_OFFICER'];

function publicBooking(booking, { isStaff = false } = {}) {
  const bookingItems = booking.bookingItems || [];
  const item = bookingItems[0];
  return {
    id: booking.id,
    bookingRef: booking.bookingRef || booking.orderRef,
    orderRef: booking.orderRef || booking.bookingRef,
    eventId: booking.eventId,
    eventTitle: booking.eventTitle || booking.event?.title,
    categoryName: booking.categoryName || item?.categoryName,
    quantity: booking.quantity || item?.quantity || booking.tickets?.length || 0,
    totalAmount: booking.totalAmount,
    currency: booking.currency || 'KES',
    bookingStatus: booking.bookingStatus,
    paymentStatus: booking.paymentStatus || (
      booking.payments?.some((payment) => payment.status === 'SUCCESSFUL') ? 'PAID'
        : booking.payments?.some((payment) => payment.status === 'FAILED') ? 'FAILED'
          : booking.payments?.some((payment) => payment.status === 'CANCELLED' || payment.status === 'REVERSED') ? 'CANCELLED'
            : 'PENDING'
    ),
    mpesaReceipt: booking.mpesaReceipt || booking.payments?.find((payment) => payment.status === 'SUCCESSFUL')?.mpesaReceipt || null,
    userName: booking.userName || (isStaff ? booking.user?.fullName : undefined),
    createdAt: booking.createdAt,
    tickets: booking.tickets || [],
    ...(booking.isSimulated ? { isSimulated: true } : {}),
  };
}

export async function GET(req) {
  const auth = authorizeRole(req, bookingRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: auth.status });
  const isStaff = auth.user.role !== 'CUSTOMER';
  const { searchParams } = new URL(req.url);
  const bookingRef = searchParams.get('ref');
  const facilityId = getRequestedFacilityId(req);
  if (isStaff) {
    const facilityAuth = await authorizeFacilityAccess(req, facilityId, bookingRoles.filter((role) => role !== 'CUSTOMER'));
    if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  }

  try {
    if (await isDatabaseOnline()) {
      try {
        const where = isStaff
          ? { event: { facilityId }, ...(bookingRef ? { OR: [{ bookingRef }, { id: bookingRef }] } : {}) }
          : { userId: auth.user.id, ...(bookingRef ? { bookingRef } : {}) };
        const bookings = await prisma.booking.findMany({
          where,
          include: {
            event: { select: { title: true } },
            user: isStaff ? { select: { fullName: true } } : false,
            bookingItems: { select: { categoryName: true, quantity: true } },
            tickets: { select: { ticketNumber: true, seatNumber: true, status: true, qrToken: true } },
            payments: { select: { status: true, mpesaReceipt: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: bookingRef ? 1 : 100,
        });
        if (bookingRef && !bookings.length) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
        const result = bookings.map((booking) => publicBooking(booking, { isStaff }));
        return bookingRef
          ? NextResponse.json({ success: true, booking: result[0] })
          : NextResponse.json({ success: true, count: result.length, bookings: result });
      } catch (dbErr) {
        console.warn('[Booking DB query failed, falling back to mock store]:', dbErr.message);
      }
    }

    const facilityEventIds = new Set(initialEvents.filter((event) => (event.facilityId || 'FACILITY-TALANTA-STADIUM') === facilityId).map((event) => event.id));
    let bookings = initialOrders.filter((booking) => isStaff
      ? facilityEventIds.has(booking.eventId)
      : booking.userEmail === auth.user.email);
    if (bookingRef) bookings = bookings.filter((booking) => booking.orderRef === bookingRef || booking.bookingRef === bookingRef || booking.id === bookingRef);
    if (bookingRef && !bookings.length) return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    const result = bookings.slice(0, 100).map((booking) => publicBooking(booking, { isStaff }));
    return bookingRef
      ? NextResponse.json({ success: true, booking: result[0] })
      : NextResponse.json({ success: true, count: result.length, bookings: result });
  } catch (err) {
    console.error('[Booking query failed]', err);
    return NextResponse.json({ success: false, message: 'Booking service is unavailable.' }, { status: 503 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, ['CUSTOMER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Customer sign-in is required to book tickets.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { eventId, categoryId, mpesaPhone } = body;
    const quantity = Number(body.quantity ?? 1);
    if (typeof eventId !== 'string' || typeof categoryId !== 'string' || !Number.isInteger(quantity) || quantity < 1 || quantity > 6) {
      return NextResponse.json(
        { success: false, message: 'A valid event, ticket category, and quantity from 1 to 6 are required.' },
        { status: 400 }
      );
    }
    const bookingRef = generateRef('TLN');

    const dbAvailable = await isDatabaseOnline();

    if (!dbAvailable) {
      const event = initialEvents.find((item) => item.id === eventId || item.slug === eventId);
      const category = event?.categories?.find((item) => item.id === categoryId);
      if (!event || event.status !== 'PUBLISHED' || !category) {
        return NextResponse.json({ success: false, message: 'Event or ticket category is unavailable.' }, { status: 404 });
      }
      const booking = {
        id: `SIM-${Date.now()}`, bookingRef, orderRef: bookingRef, eventId: event.id,
        eventTitle: event.title, categoryName: category.name, quantity,
        totalAmount: category.price * quantity, currency: 'KES',
        bookingStatus: 'PENDING', paymentStatus: 'PENDING', userName: auth.user.fullName,
        createdAt: new Date().toISOString(), tickets: [], isSimulated: true,
      };
      return NextResponse.json({
        success: true,
        message: 'Development simulation only: no seats were reserved, no payment was initiated, and no tickets were issued.',
        booking,
        payment: { status: 'DISCONNECTED', simulated: true },
      }, { status: 202 });
    }

    const phoneNumber = typeof mpesaPhone === 'string' ? mpesaPhone : '';
    const phoneRegex = /^254(?:7|1)\d{8}$/;
    const normalizedPhone = phoneNumber.replace(/\D/g, '').replace(/^0/, '254');
    if (!phoneRegex.test(normalizedPhone)) {
      return NextResponse.json({ success: false, message: 'A valid Kenyan M-PESA phone number is required.' }, { status: 400 });
    }

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: auth.user.id }, select: { id: true, email: true, fullName: true, role: true, isActive: true } });
      if (!user || !user.isActive || user.role !== 'CUSTOMER') throw Object.assign(new Error('Customer account is unavailable.'), { status: 403 });
      const event = await tx.event.findFirst({
        where: { OR: [{ id: eventId }, { slug: eventId }], status: 'PUBLISHED' },
        include: { categories: true },
      });
      if (!event) throw Object.assign(new Error('Event is not active or available for booking.'), { status: 404 });
      const category = event.categories.find((item) => item.id === categoryId && item.isActive);
      if (!category) throw Object.assign(new Error('Ticket category is unavailable.'), { status: 404 });
      if (quantity > category.maxPurchaseQty) throw Object.assign(new Error(`Maximum purchase limit is ${category.maxPurchaseQty} tickets.`), { status: 400 });
      const now = new Date();
      if ((event.ticketSalesStart && now < event.ticketSalesStart) || (event.ticketSalesEnd && now > event.ticketSalesEnd)
        || (category.salesStart && now < category.salesStart) || (category.salesEnd && now > category.salesEnd)) {
        throw Object.assign(new Error('Ticket sales are not currently open.'), { status: 409 });
      }
      const reservation = await tx.ticketCategory.updateMany({
        where: { id: category.id, isActive: true, availableSeats: { gte: quantity } },
        data: { availableSeats: { decrement: quantity } },
      });
      if (reservation.count !== 1) throw Object.assign(new Error('There is insufficient ticket inventory.'), { status: 409 });
      const totalAmount = category.price * quantity;
      const booking = await tx.booking.create({
        data: {
          bookingRef, userId: user.id, userEmail: user.email, userName: user.fullName, eventId: event.id,
          totalAmount, currency: 'KES', bookingStatus: 'AWAITING_PAYMENT',
          mpesaPhone: normalizedPhone, expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          bookingItems: { create: { categoryId: category.id, categoryName: category.categoryName, quantity, unitPrice: category.price, subtotal: totalAmount } },
        },
        include: { bookingItems: true },
      });
      const payment = await tx.payment.create({
        data: { paymentRef: generateRef('PAY'), bookingId: booking.id, amount: totalAmount, currency: 'KES', phoneNumber: normalizedPhone, status: 'INITIATED' },
      });
      return { booking, payment, event, category };
    }, { isolationLevel: 'Serializable' });

    const paymentResult = await initiateMpesaSTKPush({
      phoneNumber: normalizedPhone,
      amount: created.payment.amount,
      accountReference: 'TALANTA_TICKET',
      orderRef: bookingRef,
    });
    if (!paymentResult.success) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({ where: { id: created.payment.id }, data: { status: 'FAILED' } });
        await tx.booking.update({ where: { id: created.booking.id }, data: { bookingStatus: 'CANCELLED' } });
        await tx.ticketCategory.update({ where: { id: created.category.id }, data: { availableSeats: { increment: quantity } } });
      });
      return NextResponse.json({ success: false, message: paymentResult.message || 'M-PESA payment could not be initiated.' }, { status: 502 });
    }
    await prisma.payment.update({
      where: { id: created.payment.id },
      data: { status: 'PENDING', merchantRequestId: paymentResult.merchantRequestId, checkoutRequestId: paymentResult.checkoutRequestId },
    });
    const booking = publicBooking({
      ...created.booking,
      event: created.event,
      payments: [],
      tickets: [],
      bookingStatus: 'AWAITING_PAYMENT',
      paymentStatus: 'PENDING',
    });
    await logAuditEvent({
      userId: auth.user.id,
      action: 'BOOKING_PAYMENT_INITIATED',
      entityType: 'BOOKING',
      entityId: created.booking.id,
      details: `Payment initiated for booking ${bookingRef}; amount KES ${created.payment.amount}.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment request sent. The booking and tickets remain pending until M-PESA verification succeeds.',
      booking,
      payment: { status: 'PENDING', customerMessage: paymentResult.customerMessage },
    }, { status: 202 });

  } catch (err) {
    const status = Number.isInteger(err.status) ? err.status : 503;
    if (status === 503) console.error('[Booking creation failed]', err);
    return NextResponse.json({ success: false, message: status === 503 ? 'Booking service is temporarily unavailable.' : err.message }, { status });
  }
}
