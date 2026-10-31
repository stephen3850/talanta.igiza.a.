import { NextResponse } from 'next/server';
import { authorizeRole } from '../../../lib/auth';
import { logAuditEvent } from '../../../lib/audit';
import { prisma } from '../../../lib/prisma';

const facilityRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'FINANCE_OFFICER', 'REPORT_VIEWER'];
const facilityTypes = ['STADIUM', 'TRAINING_FACILITY', 'PARKING_FACILITY', 'SPORTS_FACILITY', 'OTHER'];

export async function GET(req) {
  const auth = authorizeRole(req, facilityRoles);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized facility users must sign in.' }, { status: auth.status });
  }
  if (!process.env.DATABASE_URL || !prisma?.facility) {
    return NextResponse.json({ success: false, message: 'Persistent facility records are unavailable.' }, { status: 503 });
  }

  try {
    const facilities = await prisma.facility.findMany({
      where: auth.user.role === 'SYSTEM_ADMIN'
        ? undefined
        : { memberships: { some: { userId: auth.user.id, isActive: true, role: { in: facilityRoles } } } },
      include: {
        _count: {
          select: { events: true, staffAccreditations: true, iotDevices: true, hardwareAssets: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({
      success: true,
      facilities,
      canCreateFacilities: auth.user.role === 'SYSTEM_ADMIN',
      dataMode: 'DATABASE',
      isSimulated: false,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Facility list failed]', error);
    return NextResponse.json({ success: false, message: 'Facility records could not be loaded.' }, { status: 503 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Only enterprise administrators can register facilities.' }, { status: auth.status });
  }
  if (!process.env.DATABASE_URL || !prisma?.facility) {
    return NextResponse.json({ success: false, message: 'Persistent facility records are unavailable.' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const facilityCode = typeof body.facilityCode === 'string' ? body.facilityCode.trim().toUpperCase() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const type = body.type;

    if (!/^[A-Z0-9][A-Z0-9-]{2,39}$/.test(facilityCode) || !name || name.length > 160 || !facilityTypes.includes(type)) {
      return NextResponse.json({ success: false, message: 'Provide a unique facility code, name, and supported facility type.' }, { status: 400 });
    }

    const facility = await prisma.facility.create({
      data: {
        facilityCode,
        name,
        type,
        description: typeof body.description === 'string' ? body.description.trim() || null : null,
        address: typeof body.address === 'string' ? body.address.trim() || null : null,
        city: typeof body.city === 'string' ? body.city.trim() || null : null,
        country: typeof body.country === 'string' ? body.country.trim() || null : null,
        timezone: typeof body.timezone === 'string' && body.timezone.trim() ? body.timezone.trim() : 'Africa/Nairobi',
        operationalInfo: typeof body.operationalInfo === 'string' ? body.operationalInfo.trim() || null : null,
      },
    });
    await logAuditEvent({
      userId: auth.user.id,
      action: 'FACILITY_REGISTERED',
      entityType: 'FACILITY',
      entityId: facility.id,
      details: `Registered facility ${facility.facilityCode} (${facility.type}).`,
    });

    return NextResponse.json({ success: true, facility, dataMode: 'DATABASE' }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'That facility code is already registered.' }, { status: 409 });
    }
    console.error('[Facility registration failed]', error);
    return NextResponse.json({ success: false, message: 'Facility could not be registered.' }, { status: 503 });
  }
}
