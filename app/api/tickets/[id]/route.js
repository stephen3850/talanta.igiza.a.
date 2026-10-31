import { NextResponse } from 'next/server';
import { initialEvents, initialOrders } from '../../../../lib/mockData';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

const ticketRoles = ['CUSTOMER', 'SYSTEM_ADMIN', 'VENUE_MANAGER', 'FINANCE_OFFICER'];

export async function GET(req, { params }) {
  const auth = authorizeRole(req, ticketRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authentication required.' }, { status: auth.status });
  const { id } = await params;
  const isStaff = auth.user.role !== 'CUSTOMER';
  const facilityId = getRequestedFacilityId(req);
  if (isStaff) {
    const facilityAuth = await authorizeFacilityAccess(req, facilityId, ticketRoles.filter((role) => role !== 'CUSTOMER'));
    if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  }
  try {
    if (process.env.DATABASE_URL && prisma?.ticket) {
      const ticket = await prisma.ticket.findFirst({
        where: { ticketNumber: id, ...(isStaff ? { event: { facilityId } } : { userId: auth.user.id }) },
        include: {
          event: { select: { title: true } },
          category: { select: { categoryName: true } },
          booking: { select: { bookingRef: true, bookingStatus: true, mpesaReceipt: true } },
        },
      });
      if (!ticket) return NextResponse.json({ success: false, message: 'Ticket not found.' }, { status: 404 });
      return NextResponse.json({
        success: true,
        ticket: {
          ticketNumber: ticket.ticketNumber,
          seatNumber: ticket.seatNumber,
          status: ticket.status,
          ...(isStaff ? {} : { qrToken: ticket.qrToken }),
          bookingRef: ticket.booking?.bookingRef,
          eventTitle: ticket.event.title,
          categoryName: ticket.category.categoryName,
          mpesaReceipt: ticket.booking?.mpesaReceipt,
          createdAt: ticket.createdAt,
        },
        dataMode: 'DATABASE',
      });
    }
    if (process.env.NODE_ENV !== 'development' || !auth.user.isDemo) {
      return NextResponse.json({ success: false, message: 'Ticket service is unavailable.' }, { status: 503 });
    }
    const order = initialOrders.find((item) => item.userEmail === auth.user.email && item.tickets.some((ticket) => ticket.ticketNumber === id));
    const ticket = order?.tickets.find((item) => item.ticketNumber === id);
    if (!ticket) return NextResponse.json({ success: false, message: 'Ticket not found.' }, { status: 404 });
    return NextResponse.json({
      success: true,
      ticket: {
        ...ticket,
        bookingRef: order.bookingRef || order.orderRef,
        eventTitle: order.eventTitle,
        categoryName: order.categoryName,
        mpesaReceipt: order.mpesaReceipt,
        createdAt: order.createdAt,
      },
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    console.error('[Ticket query failed]', err);
    return NextResponse.json({ success: false, message: 'Ticket service is unavailable.' }, { status: 503 });
  }
}

export async function PATCH(req, { params }) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized stadium administrators can revoke tickets.' }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.status !== 'REVOKED') return NextResponse.json({ success: false, message: 'Only ticket revocation is supported here; gate validation is handled by the gate workflow.' }, { status: 400 });
    let ticket;
    if (process.env.DATABASE_URL && prisma?.ticket) {
      const changed = await prisma.ticket.updateMany({ where: { ticketNumber: id, status: 'ISSUED', event: { facilityId } }, data: { status: 'REVOKED' } });
      if (changed.count !== 1) return NextResponse.json({ success: false, message: 'Ticket was not found or is no longer revocable.' }, { status: 409 });
      ticket = await prisma.ticket.findFirst({ where: { ticketNumber: id, event: { facilityId } }, select: { ticketNumber: true, status: true } });
    } else if (process.env.NODE_ENV === 'development') {
      for (const order of initialOrders.filter((item) => initialEvents.some((event) => event.id === item.eventId && (event.facilityId || 'FACILITY-TALANTA-STADIUM') === facilityId))) {
        ticket = order.tickets.find((item) => item.ticketNumber === id);
        if (ticket) break;
      }
      if (!ticket || ticket.status !== 'ISSUED') return NextResponse.json({ success: false, message: 'Ticket was not found or is no longer revocable.' }, { status: 409 });
      ticket.status = 'REVOKED';
    } else {
      return NextResponse.json({ success: false, message: 'Persistent ticket database is not configured.' }, { status: 503 });
    }
    await logAuditEvent({ userId: auth.user.id, action: 'TICKET_REVOKED', entityType: 'TICKET', entityId: ticket.ticketNumber, details: `Revoked ticket ${ticket.ticketNumber}.` });
    return NextResponse.json({ success: true, message: 'Ticket revoked.', ticket, dataMode: process.env.DATABASE_URL ? 'DATABASE' : 'SIMULATED' });
  } catch (err) {
    console.error('[Ticket revocation failed]', err);
    return NextResponse.json({ success: false, message: 'Ticket could not be revoked.' }, { status: 503 });
  }
}
