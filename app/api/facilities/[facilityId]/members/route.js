import { NextResponse } from 'next/server';
import { authorizeRole } from '../../../../../lib/auth';
import { logAuditEvent } from '../../../../../lib/audit';
import { prisma } from '../../../../../lib/prisma';

const managedRoles = ['VENUE_MANAGER', 'FINANCE_OFFICER', 'STEWARD', 'GATE_OPERATOR'];

export async function POST(req, { params }) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Only enterprise administrators can manage facility memberships.' }, { status: auth.status });
  }
  if (!process.env.DATABASE_URL || !prisma?.facilityMembership) {
    return NextResponse.json({ success: false, message: 'Persistent facility memberships are unavailable.' }, { status: 503 });
  }

  try {
    const { facilityId } = await params;
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const role = body.role;
    if (!email || !managedRoles.includes(role)) {
      return NextResponse.json({ success: false, message: 'Provide an existing user email and an allowed facility role.' }, { status: 400 });
    }

    const [facility, user] = await Promise.all([
      prisma.facility.findUnique({ where: { id: facilityId }, select: { id: true } }),
      prisma.user.findUnique({ where: { email }, select: { id: true, isActive: true } }),
    ]);
    if (!facility || !user?.isActive) {
      return NextResponse.json({ success: false, message: 'Facility or active user account was not found.' }, { status: 404 });
    }

    const membership = await prisma.facilityMembership.upsert({
      where: { facilityId_userId: { facilityId, userId: user.id } },
      create: { facilityId, userId: user.id, role, isActive: true },
      update: { role, isActive: true },
      select: { facilityId: true, userId: true, role: true, isActive: true },
    });
    await logAuditEvent({
      userId: auth.user.id,
      action: 'FACILITY_MEMBERSHIP_GRANTED',
      entityType: 'FACILITY_MEMBERSHIP',
      entityId: `${facilityId}:${user.id}`,
      details: `Granted ${role} access to a facility.`,
    });
    return NextResponse.json({ success: true, membership }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Facility membership update failed]', error);
    return NextResponse.json({ success: false, message: 'Facility membership could not be saved.' }, { status: 503 });
  }
}

export async function DELETE(req, { params }) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Only enterprise administrators can manage facility memberships.' }, { status: auth.status });
  }
  if (!process.env.DATABASE_URL || !prisma?.facilityMembership) {
    return NextResponse.json({ success: false, message: 'Persistent facility memberships are unavailable.' }, { status: 503 });
  }

  try {
    const { facilityId } = await params;
    const body = await req.json();
    if (typeof body.userId !== 'string' || body.userId === auth.user.id) {
      return NextResponse.json({ success: false, message: 'Provide another user ID; administrators cannot revoke their own membership through this endpoint.' }, { status: 400 });
    }
    const result = await prisma.facilityMembership.updateMany({
      where: { facilityId, userId: body.userId, isActive: true },
      data: { isActive: false },
    });
    if (!result.count) return NextResponse.json({ success: false, message: 'Active facility membership was not found.' }, { status: 404 });
    await logAuditEvent({
      userId: auth.user.id,
      action: 'FACILITY_MEMBERSHIP_REVOKED',
      entityType: 'FACILITY_MEMBERSHIP',
      entityId: `${facilityId}:${body.userId}`,
      details: 'Revoked an active facility membership.',
    });
    return NextResponse.json({ success: true, membershipRevoked: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Facility membership revocation failed]', error);
    return NextResponse.json({ success: false, message: 'Facility membership could not be revoked.' }, { status: 503 });
  }
}
