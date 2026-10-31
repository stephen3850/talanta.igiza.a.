import { NextResponse } from 'next/server';
import { initialEvents } from '../../../lib/mockData';
import { logAuditEvent } from '../../../lib/audit';
import { prisma } from '../../../lib/prisma';
import { authorizeRole } from '../../../lib/auth';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json({ success: false, message: 'eventId query parameter required' }, { status: 400 });
  }

  if (process.env.DATABASE_URL && prisma?.event) {
    try {
      const event = await prisma.event.findFirst({
        where: { id: eventId, status: 'PUBLISHED' },
        include: { categories: { where: { isActive: true } } },
      });
      if (!event) return NextResponse.json({ success: false, message: 'Published event not found.' }, { status: 404 });
      return NextResponse.json({ success: true, categories: event.categories, dataMode: 'DATABASE', isSimulated: false });
    } catch (err) {
      console.error('[Ticket category query failed]', err);
      return NextResponse.json({ success: false, message: 'Ticket category service is unavailable.' }, { status: 503 });
    }
  }
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ success: false, message: 'Event database is not configured.' }, { status: 503 });
  const event = initialEvents.find((e) => e.id === eventId && e.status === 'PUBLISHED');
  if (!event) {
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    categories: event.categories || [],
    dataMode: 'SIMULATED',
    isSimulated: true,
  });
}

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized event managers can configure ticket categories.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { eventId, categoryName, price, capacity, maxPurchaseQty = 6 } = body;

    const parsedPrice = Number(price);
    const parsedCapacity = Number(capacity);
    const parsedMaxPurchase = Number(maxPurchaseQty);
    if (!eventId || typeof categoryName !== 'string' || !categoryName.trim()
      || !Number.isFinite(parsedPrice) || parsedPrice < 0
      || !Number.isInteger(parsedCapacity) || parsedCapacity < 1
      || !Number.isInteger(parsedMaxPurchase) || parsedMaxPurchase < 1 || parsedMaxPurchase > 6) {
      return NextResponse.json(
        { success: false, message: 'eventId, categoryName, price, and capacity are required.' },
        { status: 400 }
      );
    }

    if (process.env.DATABASE_URL && prisma?.ticketCategory) {
      const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
      if (!event) return NextResponse.json({ success: false, message: 'Event not found.' }, { status: 404 });
      const category = await prisma.ticketCategory.create({
        data: {
          eventId, categoryName: categoryName.trim(), price: parsedPrice,
          totalCapacity: parsedCapacity, availableSeats: parsedCapacity, maxPurchaseQty: parsedMaxPurchase,
        },
      });
      await logAuditEvent({ userId: auth.user.id, action: 'CATEGORY_CREATED', entityType: 'TICKET_CATEGORY', entityId: category.id, details: `Created ticket category ${category.categoryName} for event ${eventId}.` });
      return NextResponse.json({ success: true, category, dataMode: 'DATABASE' }, { status: 201 });
    }
    if (process.env.NODE_ENV !== 'development') return NextResponse.json({ success: false, message: 'Persistent event database is not configured.' }, { status: 503 });
    const event = initialEvents.find((e) => e.id === eventId);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    const newCategory = {
      id: `CAT-${Date.now()}`,
      name: categoryName,
      categoryName: categoryName.trim(),
      price: parsedPrice,
      totalCapacity: parsedCapacity,
      available: parsedCapacity,
      availableSeats: parsedCapacity,
      maxPurchaseQty: parsedMaxPurchase,
      isActive: true,
    };

    event.categories.push(newCategory);

    await logAuditEvent({
      userId: auth.user.id,
      action: 'CATEGORY_CREATED',
      entityType: 'TICKET_CATEGORY',
      entityId: newCategory.id,
      details: `Created category ${categoryName} (KES ${price}, Cap ${capacity}) for ${event.title}`,
    });

    return NextResponse.json({ success: true, category: newCategory, dataMode: 'SIMULATED', isSimulated: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
