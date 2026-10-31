import { NextResponse } from 'next/server';
import { initialEvents } from '../../../lib/mockData';
import { logAuditEvent } from '../../../lib/audit';
import { prisma } from '../../../lib/prisma';
import { authorizeRole } from '../../../lib/auth';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../lib/facilities';

const eventManagerRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER'];

export async function GET(req) {
  const auth = authorizeRole(req, eventManagerRoles);
  const canManage = auth.authorized;
  const facilityId = getRequestedFacilityId(req);
  if (canManage) {
    const facilityAuth = await authorizeFacilityAccess(req, facilityId, eventManagerRoles);
    if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  }
  const { searchParams } = new URL(req.url);
  const isPublic = !canManage || searchParams.get('public') === 'true';
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const slug = searchParams.get('slug');

  try {
    let eventsList = [...initialEvents];

    if (process.env.DATABASE_URL && prisma?.event) {
      try {
        const whereClause = canManage ? { facilityId } : {};
        if (isPublic) whereClause.status = { notIn: ['DRAFT', 'ARCHIVED'] };
        else if (status && status !== 'ALL') whereClause.status = status;
        if (category && category !== 'ALL') whereClause.category = { contains: category, mode: 'insensitive' };
        if (slug) whereClause.slug = slug;

        const dbEvents = await prisma.event.findMany({
          where: whereClause,
          include: { categories: true },
          orderBy: { startDate: 'asc' },
        });

        if (slug && !dbEvents.length) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
        return NextResponse.json({ success: true, count: dbEvents.length, events: dbEvents, dataMode: 'DATABASE', isSimulated: false });
      } catch (dbErr) {
        console.warn('[Prisma event query failed, falling back to mock store]:', dbErr.message);
      }
    }

    // Mock Fallback Processing
    if (isPublic) {
      eventsList = eventsList.filter((e) => e.status !== 'DRAFT' && e.status !== 'ARCHIVED');
    } else if (status && status !== 'ALL') {
      eventsList = eventsList.filter((e) => e.status === status);
    }

    if (category && category !== 'ALL') {
      eventsList = eventsList.filter((e) => e.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (search) {
      const query = search.toLowerCase();
      eventsList = eventsList.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.slug.toLowerCase().includes(query) ||
          e.category.toLowerCase().includes(query) ||
          (e.description && e.description.toLowerCase().includes(query))
      );
    }

    if (slug) {
      const single = eventsList.find((e) => e.slug === slug || e.id === slug);
      if (!single) {
        return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, event: { ...single, isSimulated: true }, dataMode: 'SIMULATED' });
    }

    return NextResponse.json({
      success: true,
      count: eventsList.length,
      events: eventsList.map((event) => ({ ...event, isSimulated: true })),
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const facilityId = getRequestedFacilityId(req);
  const auth = await authorizeFacilityAccess(req, facilityId, eventManagerRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized event managers can create events.' }, { status: auth.status });
  try {
    const body = await req.json();
    const {
      title,
      slug: customSlug,
      description,
      category = 'Football',
      image,
      bannerUrl,
      startDate,
      endDate,
      venue,
      organizer,
      contactInfo,
      ticketSalesStart,
      ticketSalesEnd,
      status = 'DRAFT',
      ticketApproved = false,
      referenceLinks = [],
    } = body;

    if (!title || !startDate || !endDate || !venue) {
      return NextResponse.json(
        { success: false, message: 'Event title, verified venue, start date, and end date are required.' },
        { status: 400 }
      );
    }

    // Date Relationship Validation
    if (new Date(endDate) <= new Date(startDate)) {
      return NextResponse.json(
        { success: false, message: 'Event end date/time must be after the start date/time.' },
        { status: 400 }
      );
    }

    // Slug Generation & Uniqueness Check
    const slugBase = (customSlug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const existingSlug = initialEvents.find((e) => e.slug === slugBase);
    const finalSlug = existingSlug ? `${slugBase}-${Date.now()}` : slugBase;

    const eventCode = `EVT-2027-${Math.floor(Math.random() * 900 + 100)}`;
    const coverImage = image || bannerUrl || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop';

    const newEvent = {
      id: `EVT-${Date.now()}`,
      eventCode,
      title,
      slug: finalSlug,
      description: description || 'Official matchday fixture at Talanta Sports City.',
      category,
      venue,
      organizer,
      contactInfo,
      image: coverImage,
      bannerUrl: coverImage,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      startTime: new Date(startDate).toISOString(),
      endTime: new Date(endDate).toISOString(),
      ticketSalesStart: ticketSalesStart ? new Date(ticketSalesStart).toISOString() : new Date().toISOString(),
      ticketSalesEnd: ticketSalesEnd ? new Date(ticketSalesEnd).toISOString() : new Date(startDate).toISOString(),
      status,
      statusLabel: status.replace(/_/g, ' '),
      ticketApproved,
      referenceLinks,
      featured: false,
      isFeatured: false,
      createdAt: new Date().toISOString(),
      categories: body.categories || [],
      isSimulated: true,
      facilityId,
    };

    if (process.env.DATABASE_URL && prisma?.event) {
      try {
        await prisma.event.create({
          data: {
            eventCode: newEvent.eventCode,
            title: newEvent.title,
            slug: newEvent.slug,
            description: newEvent.description,
            category: newEvent.category,
            venue: newEvent.venue,
            organizer: newEvent.organizer || null,
            contactInfo: newEvent.contactInfo || null,
            image: newEvent.image,
            startDate: new Date(newEvent.startDate),
            endDate: new Date(newEvent.endDate),
            ticketSalesStart: new Date(newEvent.ticketSalesStart),
            ticketSalesEnd: new Date(newEvent.ticketSalesEnd),
            status: newEvent.status,
            featured: false,
            facilityId,
          },
        });
        newEvent.isSimulated = false;
      } catch (dbErr) {
        console.warn('[Prisma event create failed, saved in mock store]:', dbErr.message);
      }
    }

    initialEvents.unshift(newEvent);

    await logAuditEvent({
      action: 'EVENT_CREATED',
      entityType: 'EVENT',
      entityId: newEvent.id,
      details: `Created event "${newEvent.title}" (${newEvent.status}) with slug /events/${newEvent.slug}`,
    });

    return NextResponse.json({ success: true, event: newEvent, dataMode: newEvent.isSimulated ? 'SIMULATED' : 'DATABASE' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
