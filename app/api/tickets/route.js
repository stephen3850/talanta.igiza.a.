import { NextResponse } from 'next/server';
import { initialEvents, initialOrders } from '../../../lib/mockData';
import { authorizeRole } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../lib/facilities';

const ticketRoles = ['CUSTOMER', 'SYSTEM_ADMIN', 'VENUE_MANAGER', 'FINANCE_OFFICER'];

function ticketView(ticket, isStaff) {
  return {
    ticketNumber: ticket.ticketNumber,
    seatNumber: ticket.seatNumber,
    status: ticket.status,
    ...(isStaff ? {} : { qrToken: ticket.qrToken }),
    bookingRef: ticket.booking?.bookingRef || ticket.order?.orderRef || ticket.bookingRef,
    userEmail: isStaff ? ticket.user?.email || ticket.userEmail : undefined,
    userName: isStaff ? ticket.user?.fullName || ticket.userName : undefined,
    eventTitle: ticket.event?.title || ticket.eventTitle,
    categoryName: ticket.category?.categoryName || ticket.categoryName,
    mpesaReceipt: ticket.booking?.mpesaReceipt || ticket.mpesaReceipt,
    createdAt: ticket.createdAt,
  };
}

export async function GET(req) {
  const auth = authorizeRole(req, ticketRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: auth.status });
  const isStaff = auth.user.role !== 'CUSTOMER';
  const { searchParams } = new URL(req.url);
  const bookingRef = searchParams.get('bookingRef');
  const ticketNumber = searchParams.get('ticketNumber');
  const status = searchParams.get('status');
  const facilityId = getRequestedFacilityId(req);
  if (isStaff) {
    const facilityAuth = await authorizeFacilityAccess(req, facilityId, ticketRoles.filter((role) => role !== 'CUSTOMER'));
    if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  }

  try {
    if (process.env.DATABASE_URL && prisma?.ticket) {
      const where = {
        ...(isStaff ? {} : { userId: auth.user.id }),
        ...(ticketNumber ? { ticketNumber } : {}),
        ...(status && status !== 'ALL' ? { status } : {}),
        ...(bookingRef ? { booking: { bookingRef } } : {}),
        ...(isStaff ? { event: { facilityId } } : {}),
      };
      const tickets = await prisma.ticket.findMany({
        where,
        include: {
          event: { select: { title: true } },
          category: { select: { categoryName: true } },
          booking: { select: { bookingRef: true, mpesaReceipt: true } },
          order: { select: { orderRef: true } },
          ...(isStaff ? { user: { select: { email: true, fullName: true } } } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: ticketNumber ? 1 : 200,
      });
      if (ticketNumber && !tickets.length) return NextResponse.json({ success: false, message: 'Ticket not found.' }, { status: 404 });
      if (ticketNumber) return NextResponse.json({ success: true, ticket: ticketView(tickets[0], isStaff), dataMode: 'DATABASE' });
      return NextResponse.json({ success: true, count: tickets.length, tickets: tickets.map((ticket) => ticketView(ticket, isStaff)), dataMode: 'DATABASE' });
    }
    if (process.env.NODE_ENV !== 'development' || !auth.user.isDemo) {
      return NextResponse.json({ success: false, message: 'Ticket service is unavailable.' }, { status: 503 });
    }

    let tickets = initialOrders
      .filter((order) => isStaff
        ? initialEvents.some((event) => event.id === order.eventId && (event.facilityId || 'FACILITY-TALANTA-STADIUM') === facilityId)
        : order.userEmail === auth.user.email)
      .flatMap((order) => order.tickets.map((ticket) => ({ ...ticket, bookingRef: order.bookingRef || order.orderRef, userEmail: order.userEmail, userName: order.userName, eventTitle: order.eventTitle, categoryName: order.categoryName, mpesaReceipt: order.mpesaReceipt, createdAt: order.createdAt })));
    if (ticketNumber) {
      const ticket = tickets.find((item) => item.ticketNumber === ticketNumber);
      if (!ticket) return NextResponse.json({ success: false, message: 'Ticket not found.' }, { status: 404 });
      const { qrToken, ...staffSafeTicket } = ticket;
      return NextResponse.json({ success: true, ticket: isStaff ? staffSafeTicket : ticket, dataMode: 'SIMULATED', isSimulated: true });
    }
    if (bookingRef) tickets = tickets.filter((ticket) => ticket.bookingRef === bookingRef);
    if (status && status !== 'ALL') tickets = tickets.filter((ticket) => ticket.status === status);
    return NextResponse.json({ success: true, count: tickets.length, tickets: tickets.slice(0, 200), dataMode: 'SIMULATED', isSimulated: true });
  } catch (err) {
    console.error('[Ticket query failed]', err);
    return NextResponse.json({ success: false, message: 'Ticket service is unavailable.' }, { status: 503 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FINANCE_OFFICER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized staff can request ticket administration.' }, { status: auth.status });
  return NextResponse.json({
    success: false,
    message: 'Ticket credentials are issued only by the payment-verification workflow after confirmed payment.',
  }, { status: 409 });
}
