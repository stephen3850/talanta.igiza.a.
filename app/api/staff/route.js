import { NextResponse } from 'next/server';
import { initialStaffAccreditation } from '../../../lib/mockData';
import { logAuditEvent } from '../../../lib/audit';
import { prisma } from '../../../lib/prisma';
import { authorizeRole } from '../../../lib/auth';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../lib/facilities';

const staffManagerRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER'];

export async function GET(req) {
  const auth = authorizeRole(req, staffManagerRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized workforce managers can view accreditation records.' }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, staffManagerRoles);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const department = searchParams.get('department');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  try {
    if (process.env.DATABASE_URL && prisma?.staffAccreditation) {
      const where = { facilityId };
      if (status && status !== 'ALL') where.status = status;
      if (department && department !== 'ALL') where.department = department;
      if (search) where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { accreditationNo: { contains: search, mode: 'insensitive' } },
        { organisation: { contains: search, mode: 'insensitive' } },
        { roleTitle: { contains: search, mode: 'insensitive' } },
      ];
      const staff = await prisma.staffAccreditation.findMany({ where, orderBy: { createdAt: 'desc' }, take: 500 });
      return NextResponse.json({ success: true, count: staff.length, staff, dataMode: 'DATABASE', isSimulated: false });
    }
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, message: 'Persistent workforce database is not configured.' }, { status: 503 });
    }
    let staffList = initialStaffAccreditation.filter((staff) => !staff.facilityId || staff.facilityId === facilityId);

    if (status && status !== 'ALL') {
      staffList = staffList.filter((s) => s.status === status);
    }

    if (department && department !== 'ALL') {
      staffList = staffList.filter((s) => s.department === department);
    }

    if (search) {
      const q = search.toLowerCase();
      staffList = staffList.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.accreditationNo.toLowerCase().includes(q) ||
          s.organisation.toLowerCase().includes(q) ||
          s.roleTitle.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: staffList.length,
      staff: staffList.map((staff) => ({ ...staff, isSimulated: true })),
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const facilityId = getRequestedFacilityId(req);
  const auth = await authorizeFacilityAccess(req, facilityId, staffManagerRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Only authorized workforce managers can register staff.' }, { status: auth.status });
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phoneNumber,
      idNumber,
      organisation,
      department,
      roleTitle,
      category,
      zonePermissions,
      validFrom,
      validUntil,
    } = body;

    const validCategories = ['STADIUM_EMPLOYEE', 'SECURITY', 'EVENT_ORGANIZER', 'CONTRACTOR', 'VENDOR', 'TECHNICAL', 'MEDICAL_EMERGENCY', 'OTHER'];
    const from = new Date(validFrom);
    const until = new Date(validUntil);
    if (!fullName || !roleTitle || !idNumber || !organisation || !department || !zonePermissions
      || !validCategories.includes(category) || !Number.isFinite(from.getTime()) || !Number.isFinite(until.getTime()) || until <= from) {
      return NextResponse.json(
        { success: false, message: 'Provide verified identity, organization, role, access zones, category, and valid permission dates.' },
        { status: 400 }
      );
    }

    const accreditationNo = `TAL-STF-2026-${Math.floor(Math.random() * 900 + 100)}`;

    const newStaff = {
      id: `ACC-${Date.now()}`,
      accreditationNo,
      fullName,
      email,
      phoneNumber,
      idNumber,
      organisation,
      department,
      roleTitle,
      category,
      zonePermissions,
      validFrom,
      validUntil,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      isSimulated: !process.env.DATABASE_URL,
      facilityId,
    };

    if (process.env.DATABASE_URL && prisma?.staffAccreditation) {
      try {
        const saved = await prisma.staffAccreditation.create({
          data: {
            accreditationNo: newStaff.accreditationNo,
            fullName: newStaff.fullName,
            email: newStaff.email,
            phoneNumber: newStaff.phoneNumber,
            idNumber: newStaff.idNumber,
            organisation: newStaff.organisation,
            department: newStaff.department,
            roleTitle: newStaff.roleTitle,
            zonePermissions: newStaff.zonePermissions,
            category: newStaff.category,
            validFrom: from,
            validUntil: until,
            status: 'PENDING',
            facilityId,
          },
        });
        await logAuditEvent({
          userId: auth.user.id,
          action: 'STAFF_ACCREDITATION_REGISTERED',
          entityType: 'STAFF_ACCREDITATION',
          entityId: saved.accreditationNo,
          details: `Registered workforce pass ${saved.accreditationNo} for an approval review.`,
        });
        return NextResponse.json({ success: true, staff: saved, dataMode: 'DATABASE' }, { status: 201 });
      } catch (dbErr) {
        console.error('[Prisma staff create failed]', dbErr);
        return NextResponse.json({ success: false, message: 'Workforce record could not be saved.' }, { status: 503 });
      }
    }
    if (process.env.NODE_ENV !== 'development') return NextResponse.json({ success: false, message: 'Persistent workforce database is not configured.' }, { status: 503 });
    initialStaffAccreditation.unshift(newStaff);

    await logAuditEvent({
      userId: auth.user.id,
      action: 'STAFF_ACCREDITATION_SUBMITTED',
      entityType: 'STAFF_ACCREDITATION',
      entityId: newStaff.accreditationNo,
      details: `Registered workforce pass ${newStaff.accreditationNo} for ${fullName} (${roleTitle} • ${organisation})`,
    });

    return NextResponse.json({ success: true, staff: newStaff, dataMode: 'SIMULATED' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
