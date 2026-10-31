import { NextResponse } from 'next/server';
import { initialOrders } from '../../../../lib/mockData';
import { authorizeRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

const bookingRoles = ['CUSTOMER', 'SYSTEM_ADMIN', 'VENUE_MANAGER', 'FINANCE_OFFICER'];

export async function GET(req, { params }) {
  const auth = authorizeRole(req, bookingRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: auth.status });
  const { id } = await params;
  const isStaff = auth.user.role !== 'CUSTOMER';
  try {
    if (process.env.DATABASE_URL && prisma?.booking) {
      const booking = await prisma.booking.findFirst({
        where: {
          ...(isStaff ? {} : { userId: auth.user.id }),
          OR: [{ id }, { bookingRef: id }],
        },
        include: {
          event: { select: { title: true } },
          bookingItems: { select: { categoryName: true, quantity: true } },
          tickets: { select: { ticketNumber: true, seatNumber: true, status: true, qrToken: true } },
          payments: { where: { status: 'SUCCESSFUL' }, select: { status: true, mpesaReceipt: true } },
          ...(isStaff ? { user: { select: { fullName: true } } } : {}),
        },
      });
      if (!booking) return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
      const item = booking.bookingItems[0];
      return NextResponse.json({
        success: true,
        booking: {
          id: booking.id, bookingRef: booking.bookingRef, eventId: booking.eventId, eventTitle: booking.event.title,
          categoryName: item?.categoryName, quantity: item?.quantity || 0, totalAmount: booking.totalAmount,
          currency: booking.currency, bookingStatus: booking.bookingStatus,
          paymentStatus: booking.payments.length ? 'PAID' : 'PENDING',
          mpesaReceipt: booking.mpesaReceipt, userName: isStaff ? booking.user?.fullName : undefined,
          createdAt: booking.createdAt, tickets: booking.tickets,
        },
        dataMode: 'DATABASE',
      });
    }
    if (process.env.NODE_ENV !== 'development' || !auth.user.isDemo) {
      return NextResponse.json({ success: false, message: 'Booking service is unavailable.' }, { status: 503 });
    }
    const booking = initialOrders.find((item) =>
      (item.id === id || item.orderRef === id || item.bookingRef === id)
      && (isStaff || item.userEmail === auth.user.email)
    );
    if (!booking) return NextResponse.json({ success: false, message: 'Booking not found.' }, { status: 404 });
    return NextResponse.json({ success: true, booking: { ...booking, isSimulated: true }, dataMode: 'SIMULATED' });
  } catch (err) {
    console.error('[Booking lookup failed]', err);
    return NextResponse.json({ success: false, message: 'Booking service is unavailable.' }, { status: 503 });
  }
}

export async function PATCH(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FINANCE_OFFICER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized staff can request booking administration.' }, { status: auth.status });
  return NextResponse.json({
    success: false,
    message: 'Booking payment status is controlled only by verified provider callbacks; use the approved payment/refund workflow.',
  }, { status: 409 });
}

export async function DELETE(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FINANCE_OFFICER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized staff can request booking administration.' }, { status: auth.status });
  return NextResponse.json({
    success: false,
    message: 'Bookings cannot be deleted or marked refunded outside the verified payment-provider workflow.',
  }, { status: 409 });
}
