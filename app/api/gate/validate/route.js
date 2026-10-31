import { NextResponse } from 'next/server';
import { verifyDynamicQRToken } from '../../../../lib/tickets';
import { logAuditEvent } from '../../../../lib/audit';
import { prisma } from '../../../../lib/prisma';
import { authorizeRole } from '../../../../lib/auth';
import { authorizeFacilityAccess } from '../../../../lib/facilities';

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR']);
  if (!auth.authorized) return NextResponse.json({ success: false, status: 'REJECTED_UNAUTHORIZED', message: 'Authorized gate staff must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { qrToken, eventId, gateId, deviceId } = body;
    if (typeof qrToken !== 'string' || !qrToken || typeof eventId !== 'string' || !eventId
      || typeof gateId !== 'string' || !gateId || typeof deviceId !== 'string' || !deviceId
      || qrToken.length > 4096 || gateId.length > 64 || deviceId.length > 64) {
      return NextResponse.json({ success: false, status: 'REJECTED_INVALID_REQUEST', message: 'A QR credential and assigned event, gate, and scanner identifiers are required.' }, { status: 400 });
    }
    if (body.isOfflineSync) {
      return NextResponse.json({ success: false, status: 'PENDING_OFFLINE_REVIEW', message: 'Offline scans cannot be approved by this online validation API.' }, { status: 409 });
    }
    if (!process.env.DATABASE_URL || !prisma?.ticket) {
      return NextResponse.json({ success: false, status: 'VALIDATION_UNAVAILABLE', message: 'Persistent ticket validation is disconnected; no entry was approved.' }, { status: 503 });
    }
    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, facilityId: true } });
    if (!event) return NextResponse.json({ success: false, status: 'REJECTED_WRONG_EVENT', message: 'Event was not found.' }, { status: 404 });
    const facilityAuth = await authorizeFacilityAccess(req, event.facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR']);
    if (!facilityAuth.authorized) return NextResponse.json({ success: false, status: 'REJECTED_UNAUTHORIZED', message: 'You are not authorized to operate gates for this facility.' }, { status: facilityAuth.status });

    const verified = verifyDynamicQRToken(qrToken);
    if (!verified.valid) {
      await logAuditEvent({ userId: auth.user.id, action: 'GATE_SCAN_TAMPERED', entityType: 'TICKET', details: `Rejected invalid QR credential at gate ${gateId}.` });
      return NextResponse.json({ success: false, status: 'REJECTED_INVALID_TICKET', message: 'QR credential signature is invalid.' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { ticketNumber: verified.data.ticketNumber },
      include: {
        event: { select: { id: true, title: true } },
        category: { select: { categoryName: true } },
        booking: { include: { payments: { where: { status: 'SUCCESSFUL' }, select: { id: true } } } },
      },
    });
    if (!ticket || ticket.qrToken !== qrToken || !ticket.booking) {
      await logAuditEvent({ userId: auth.user.id, action: 'GATE_SCAN_UNKNOWN', entityType: 'TICKET', details: `Rejected unmatched QR credential at gate ${gateId}.` });
      return NextResponse.json({ success: false, status: 'REJECTED_INVALID_TICKET', message: 'Ticket record was not found or does not match the QR credential.' }, { status: 404 });
    }
    if (ticket.eventId !== eventId || verified.data.eventId !== ticket.eventId
      || verified.data.orderRef !== ticket.booking.bookingRef
      || verified.data.categoryName !== ticket.category.categoryName
      || (verified.data.seatNumber ?? null) !== ticket.seatNumber) {
      await logAuditEvent({ userId: auth.user.id, action: 'GATE_SCAN_WRONG_EVENT', entityType: 'TICKET', entityId: ticket.ticketNumber, details: `Rejected ticket at the wrong event or booking reference at gate ${gateId}.` });
      return NextResponse.json({ success: false, status: 'REJECTED_WRONG_EVENT', message: 'Ticket is not valid for this event.' }, { status: 409 });
    }
    if (ticket.booking.bookingStatus !== 'CONFIRMED' || !ticket.booking.payments.length) {
      return NextResponse.json({ success: false, status: 'REJECTED_UNPAID', message: 'Booking has no provider-verified successful payment.' }, { status: 409 });
    }
    if (ticket.status !== 'ISSUED') {
      await logAuditEvent({ userId: auth.user.id, action: 'GATE_SCAN_DUPLICATE_REJECTED', entityType: 'TICKET', entityId: ticket.ticketNumber, details: `Rejected previously used or inactive ticket at gate ${gateId}.` });
      return NextResponse.json({ success: false, status: 'REJECTED_ALREADY_USED', message: 'Ticket is not available for entry.' }, { status: 409 });
    }

    const validation = await prisma.$transaction(async (tx) => {
      const redeemed = await tx.ticket.updateMany({
        where: { id: ticket.id, status: 'ISSUED' },
        data: { status: 'VALIDATED', gateValidated: gateId, validatedAt: new Date() },
      });
      if (redeemed.count !== 1) return false;
      await tx.gateLog.create({
        data: { ticketNumber: ticket.ticketNumber, gateId, deviceId, validationStatus: 'APPROVED' },
      });
      return true;
    }, { isolationLevel: 'Serializable' });

    if (!validation) {
      await logAuditEvent({ userId: auth.user.id, action: 'GATE_SCAN_DUPLICATE_REJECTED', entityType: 'TICKET', entityId: ticket.ticketNumber, details: `Rejected concurrent duplicate entry attempt at gate ${gateId}.` });
      return NextResponse.json({ success: false, status: 'REJECTED_ALREADY_USED', message: 'Ticket has already been validated.' }, { status: 409 });
    }
    await logAuditEvent({ userId: auth.user.id, action: 'GATE_SCAN_APPROVED', entityType: 'TICKET', entityId: ticket.ticketNumber, details: `Approved provider-paid ticket at gate ${gateId}, scanner ${deviceId}, event ${eventId}.` });
    return NextResponse.json({
      success: true,
      status: 'APPROVED',
      message: 'Provider-paid ticket validated.',
      source: 'DATABASE_VERIFIED',
      ticket: {
        ticketNumber: ticket.ticketNumber,
        eventTitle: ticket.event.title,
        categoryName: ticket.category.categoryName,
        seatNumber: ticket.seatNumber,
        validatedAt: new Date().toISOString(),
        gateValidated: gateId,
      },
    });
  } catch (err) {
    console.error('[Gate validation failed]', err);
    return NextResponse.json({ success: false, status: 'ERROR', message: 'Ticket validation is unavailable; no entry was approved.' }, { status: 503 });
  }
}
