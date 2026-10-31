import { NextResponse } from 'next/server';
import { initialEvents } from '../../../../lib/mockData';
import { logAuditEvent } from '../../../../lib/audit';
import { prisma } from '../../../../lib/prisma';
import { authorizeRole } from '../../../../lib/auth';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

const eventManagerRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER'];

export async function GET(req, { params }) {
  const auth = authorizeRole(req, eventManagerRoles);
  const facilityId = getRequestedFacilityId(req);
  if (auth.authorized) {
    const facilityAuth = await authorizeFacilityAccess(req, facilityId, eventManagerRoles);
    if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  }
  const { id } = await params;
  try {
    if (process.env.DATABASE_URL && prisma?.event) {
      const event = await prisma.event.findFirst({
        where: { OR: [{ id }, { slug: id }, { eventCode: id }], ...(auth.authorized ? { facilityId } : { status: 'PUBLISHED' }) },
        include: { categories: true },
      });
      if (!event) return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
      return NextResponse.json({ success: true, event, dataMode: 'DATABASE', isSimulated: false });
    }
    if (process.env.NODE_ENV === 'production') return NextResponse.json({ success: false, message: 'Event database is not configured.' }, { status: 503 });
    const event = initialEvents.find((item) => item.id === id || item.slug === id || item.eventCode === id);
    if (!event || (!auth.authorized && event.status !== 'PUBLISHED')) {
      return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, event: { ...event, isSimulated: true }, dataMode: 'SIMULATED' });
  } catch (err) {
    console.error('[Event query failed]', err);
    return NextResponse.json({ success: false, message: 'Event service is unavailable.' }, { status: 503 });
  }
}

export async function PUT(req, { params }) {
  const facilityId = getRequestedFacilityId(req);
  const auth = await authorizeFacilityAccess(req, facilityId, eventManagerRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized event managers can update events.' }, { status: auth.status });
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.startDate && body.endDate && new Date(body.endDate) <= new Date(body.startDate)) {
      return NextResponse.json({ success: false, message: 'Event end date must be after the start date.' }, { status: 400 });
    }
    const allowed = ['title', 'slug', 'description', 'category', 'image', 'venue', 'organizer', 'contactInfo', 'startDate', 'endDate', 'ticketSalesStart', 'ticketSalesEnd', 'featured'];
    const data = Object.fromEntries(allowed.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
    if (data.image !== undefined) data.image = body.image || body.bannerUrl;
    for (const key of ['startDate', 'endDate', 'ticketSalesStart', 'ticketSalesEnd']) {
      if (data[key] !== undefined && data[key] !== null) {
        const parsed = new Date(data[key]);
        if (!Number.isFinite(parsed.getTime())) return NextResponse.json({ success: false, message: `Invalid ${key}.` }, { status: 400 });
        data[key] = parsed;
      }
    }

    let updated;
    if (process.env.DATABASE_URL && prisma?.event) {
      const event = await prisma.event.findFirst({ where: { OR: [{ id }, { slug: id }], facilityId } });
      if (!event) return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
      updated = await prisma.event.update({ where: { id: event.id }, data });
    } else if (process.env.NODE_ENV === 'development') {
      const index = initialEvents.findIndex((item) => (item.id === id || item.slug === id) && (!item.facilityId || item.facilityId === facilityId));
      if (index < 0) return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
      updated = { ...initialEvents[index], ...data, updatedAt: new Date().toISOString(), isSimulated: true };
      if (data.image) updated.bannerUrl = data.image;
      initialEvents[index] = updated;
    } else {
      return NextResponse.json({ success: false, message: 'Persistent event database is not configured.' }, { status: 503 });
    }

    await logAuditEvent({ userId: auth.user.id, action: 'EVENT_UPDATED', entityType: 'EVENT', entityId: updated.id, details: `Updated event details for "${updated.title}".` });
    return NextResponse.json({ success: true, event: updated, dataMode: process.env.DATABASE_URL ? 'DATABASE' : 'SIMULATED' });
  } catch (err) {
    console.error('[Event update failed]', err);
    return NextResponse.json({ success: false, message: 'Event update failed.' }, { status: 503 });
  }
}

export async function DELETE(req, { params }) {
  const facilityId = getRequestedFacilityId(req);
  const auth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only a system administrator can archive events.' }, { status: auth.status });
  try {
    const { id } = await params;
    let archived;
    if (process.env.DATABASE_URL && prisma?.event) {
      const event = await prisma.event.findFirst({ where: { OR: [{ id }, { slug: id }], facilityId } });
      if (!event) return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
      archived = await prisma.event.update({ where: { id: event.id }, data: { status: 'ARCHIVED' } });
    } else if (process.env.NODE_ENV === 'development') {
      archived = initialEvents.find((item) => (item.id === id || item.slug === id) && (!item.facilityId || item.facilityId === facilityId));
      if (!archived) return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
      archived.status = 'ARCHIVED';
      archived.isSimulated = true;
    } else {
      return NextResponse.json({ success: false, message: 'Persistent event database is not configured.' }, { status: 503 });
    }
    await logAuditEvent({ userId: auth.user.id, action: 'EVENT_ARCHIVED', entityType: 'EVENT', entityId: archived.id, details: `Archived event "${archived.title}".` });
    return NextResponse.json({ success: true, message: 'Event archived.', event: archived, dataMode: process.env.DATABASE_URL ? 'DATABASE' : 'SIMULATED' });
  } catch (err) {
    console.error('[Event archive failed]', err);
    return NextResponse.json({ success: false, message: 'Event could not be archived.' }, { status: 503 });
  }
}
