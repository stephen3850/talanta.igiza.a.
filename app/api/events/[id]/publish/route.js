import { NextResponse } from 'next/server';
import { initialEvents } from '../../../../../lib/mockData';
import { logAuditEvent } from '../../../../../lib/audit';
import { prisma } from '../../../../../lib/prisma';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../../lib/facilities';

export async function PATCH(req, { params }) {
  const facilityId = getRequestedFacilityId(req);
  const auth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized event managers can change publication status.' }, { status: auth.status });
  try {
    const { id } = await params;
    const body = await req.json();
    const eventStatus = body.status || '';
    if (!['DRAFT', 'PUBLISHED'].includes(eventStatus)) {
      return NextResponse.json({ success: false, message: 'Publication status must be DRAFT or PUBLISHED.' }, { status: 400 });
    }

    let updated;
    if (process.env.DATABASE_URL && prisma?.event) {
      const event = await prisma.event.findFirst({ where: { OR: [{ id }, { slug: id }], facilityId } });
      if (!event) return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
      updated = await prisma.event.update({ where: { id: event.id }, data: { status: eventStatus } });
    } else if (process.env.NODE_ENV === 'development') {
      const event = initialEvents.find((item) => (item.id === id || item.slug === id) && (!item.facilityId || item.facilityId === facilityId));
      if (!event) return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
      event.status = eventStatus;
      event.updatedAt = new Date().toISOString();
      event.isSimulated = true;
      updated = event;
    } else {
      return NextResponse.json({ success: false, message: 'Persistent event database is not configured.' }, { status: 503 });
    }

    await logAuditEvent({
      userId: auth.user.id,
      action: eventStatus === 'PUBLISHED' ? 'EVENT_PUBLISHED' : 'EVENT_UNPUBLISHED',
      entityType: 'EVENT',
      entityId: updated.id,
      details: `Changed event publication status to ${eventStatus}.`,
    });
    return NextResponse.json({ success: true, message: `Event status updated to ${eventStatus}.`, event: updated, dataMode: process.env.DATABASE_URL ? 'DATABASE' : 'SIMULATED' });
  } catch (err) {
    console.error('[Event publication update failed]', err);
    return NextResponse.json({ success: false, message: 'Event publication update failed.' }, { status: 503 });
  }
}
