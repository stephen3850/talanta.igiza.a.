import { NextResponse } from 'next/server';
import { initialStaffAccreditation } from '../../../../lib/mockData';
import { logAuditEvent } from '../../../../lib/audit';
import { prisma } from '../../../../lib/prisma';
import { authorizeRole } from '../../../../lib/auth';
import { authorizeFacilityAccess, getRequestedFacilityId, LEGACY_FACILITY_ID } from '../../../../lib/facilities';

const staffManagerRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER'];

export async function GET(req, { params }) {
  const auth = authorizeRole(req, staffManagerRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized workforce managers can view accreditation records.' }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, staffManagerRoles);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  const { id } = await params;
  try {
    if (process.env.DATABASE_URL && prisma?.staffAccreditation) {
      const staff = await prisma.staffAccreditation.findFirst({ where: { OR: [{ id }, { accreditationNo: id }], facilityId } });
      if (!staff) return NextResponse.json({ success: false, message: 'Workforce record not found.' }, { status: 404 });
      return NextResponse.json({ success: true, staff, dataMode: 'DATABASE', isSimulated: false });
    }
    if (process.env.NODE_ENV !== 'development') return NextResponse.json({ success: false, message: 'Persistent workforce database is not configured.' }, { status: 503 });
    const staff = facilityId === LEGACY_FACILITY_ID ? initialStaffAccreditation.find((item) => item.id === id || item.accreditationNo === id) : null;
    if (!staff) return NextResponse.json({ success: false, message: 'Workforce record not found.' }, { status: 404 });
    return NextResponse.json({ success: true, staff: { ...staff, isSimulated: true }, dataMode: 'SIMULATED' });
  } catch (err) {
    console.error('[Workforce record query failed]', err);
    return NextResponse.json({ success: false, message: 'Workforce service is unavailable.' }, { status: 503 });
  }
}

export async function PUT(req, { params }) {
  const facilityId = getRequestedFacilityId(req);
  const auth = await authorizeFacilityAccess(req, facilityId, staffManagerRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized workforce managers can update accreditation records.' }, { status: auth.status });
  try {
    const { id } = await params;
    const body = await req.json();
    const allowed = ['fullName', 'email', 'phoneNumber', 'organisation', 'department', 'roleTitle', 'category', 'zonePermissions', 'validFrom', 'validUntil', 'status'];
    const data = Object.fromEntries(allowed.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
    if (data.status && !['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED', 'EXPIRED'].includes(data.status)) {
      return NextResponse.json({ success: false, message: 'Unsupported accreditation status.' }, { status: 400 });
    }
    for (const key of ['validFrom', 'validUntil']) {
      if (data[key] !== undefined) {
        const date = new Date(data[key]);
        if (!Number.isFinite(date.getTime())) return NextResponse.json({ success: false, message: `Invalid ${key}.` }, { status: 400 });
        data[key] = date;
      }
    }
    if (data.validFrom && data.validUntil && data.validUntil <= data.validFrom) {
      return NextResponse.json({ success: false, message: 'Permission expiry must be after its start date.' }, { status: 400 });
    }

    let updated;
    if (process.env.DATABASE_URL && prisma?.staffAccreditation) {
      const current = await prisma.staffAccreditation.findFirst({ where: { OR: [{ id }, { accreditationNo: id }], facilityId } });
      if (!current) return NextResponse.json({ success: false, message: 'Workforce record not found.' }, { status: 404 });
      updated = await prisma.staffAccreditation.update({ where: { id: current.id }, data });
    } else if (process.env.NODE_ENV === 'development') {
      const index = facilityId === LEGACY_FACILITY_ID ? initialStaffAccreditation.findIndex((item) => item.id === id || item.accreditationNo === id) : -1;
      if (index < 0) return NextResponse.json({ success: false, message: 'Workforce record not found.' }, { status: 404 });
      updated = { ...initialStaffAccreditation[index], ...data, updatedAt: new Date().toISOString(), isSimulated: true };
      for (const key of ['validFrom', 'validUntil']) if (updated[key] instanceof Date) updated[key] = updated[key].toISOString();
      initialStaffAccreditation[index] = updated;
    } else {
      return NextResponse.json({ success: false, message: 'Persistent workforce database is not configured.' }, { status: 503 });
    }
    await logAuditEvent({ userId: auth.user.id, action: 'STAFF_ACCREDITATION_UPDATED', entityType: 'STAFF_ACCREDITATION', entityId: updated.accreditationNo, details: `Updated workforce record ${updated.accreditationNo}; status ${updated.status}.` });
    return NextResponse.json({ success: true, staff: updated, dataMode: process.env.DATABASE_URL ? 'DATABASE' : 'SIMULATED' });
  } catch (err) {
    console.error('[Workforce record update failed]', err);
    return NextResponse.json({ success: false, message: 'Workforce record could not be updated.' }, { status: 503 });
  }
}

export async function DELETE(req, { params }) {
  const facilityId = getRequestedFacilityId(req);
  const auth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only a system administrator can suspend workforce accreditation.' }, { status: auth.status });
  try {
    const { id } = await params;
    let suspended;
    if (process.env.DATABASE_URL && prisma?.staffAccreditation) {
      const staff = await prisma.staffAccreditation.findFirst({ where: { OR: [{ id }, { accreditationNo: id }], facilityId } });
      if (!staff) return NextResponse.json({ success: false, message: 'Workforce record not found.' }, { status: 404 });
      suspended = await prisma.staffAccreditation.update({ where: { id: staff.id }, data: { status: 'SUSPENDED' } });
    } else if (process.env.NODE_ENV === 'development') {
      suspended = facilityId === LEGACY_FACILITY_ID ? initialStaffAccreditation.find((item) => item.id === id || item.accreditationNo === id) : null;
      if (!suspended) return NextResponse.json({ success: false, message: 'Workforce record not found.' }, { status: 404 });
      suspended.status = 'SUSPENDED';
      suspended.isSimulated = true;
    } else {
      return NextResponse.json({ success: false, message: 'Persistent workforce database is not configured.' }, { status: 503 });
    }
    await logAuditEvent({ userId: auth.user.id, action: 'STAFF_ACCREDITATION_SUSPENDED', entityType: 'STAFF_ACCREDITATION', entityId: suspended.accreditationNo, details: `Suspended workforce accreditation ${suspended.accreditationNo}.` });
    return NextResponse.json({ success: true, message: 'Workforce accreditation suspended.', staff: suspended });
  } catch (err) {
    console.error('[Workforce accreditation suspension failed]', err);
    return NextResponse.json({ success: false, message: 'Workforce accreditation could not be suspended.' }, { status: 503 });
  }
}
