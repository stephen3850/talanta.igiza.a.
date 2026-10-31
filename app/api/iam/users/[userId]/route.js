import { NextResponse } from 'next/server';
import { canonicalRole } from '../../../../../lib/auth';
import { logAuditEvent } from '../../../../../lib/audit';
import { authorizeManagedUser, IAM_ROLE_OPTIONS, IamError } from '../../../../../lib/iam';
import { prisma } from '../../../../../lib/prisma';

const roles = IAM_ROLE_OPTIONS.map(({ role }) => role);

export async function PATCH(req, { params }) {
  const auth = await authorizeManagedUser(req, ['SYSTEM_ADMIN']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const { userId } = await params;
    if (!userId || userId === auth.user.id) return NextResponse.json({ success: false, message: 'Administrators cannot change their own role or account status here.' }, { status: 400 });
    const body = await req.json();
    const data = {};
    if (Object.prototype.hasOwnProperty.call(body, 'role')) {
      if (!roles.includes(body.role)) return NextResponse.json({ success: false, message: 'Select a supported platform role.' }, { status: 400 });
      data.role = body.role;
    }
    if (Object.prototype.hasOwnProperty.call(body, 'isActive')) {
      if (typeof body.isActive !== 'boolean') return NextResponse.json({ success: false, message: 'Account status must be enabled or suspended.' }, { status: 400 });
      data.isActive = body.isActive;
    }
    if (!Object.keys(data).length) return NextResponse.json({ success: false, message: 'Provide a role or account status change.' }, { status: 400 });

    const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true, isActive: true } });
    if (!target) return NextResponse.json({ success: false, message: 'User account was not found.' }, { status: 404 });
    const removingAdmin = canonicalRole(target.role) === 'SYSTEM_ADMIN' && target.isActive
      && ((data.role && canonicalRole(data.role) !== 'SYSTEM_ADMIN') || data.isActive === false);
    try {
      await prisma.$transaction(async (tx) => {
        if (removingAdmin) {
          const activeAdmins = await tx.user.count({ where: { role: { in: ['SYSTEM_ADMIN', 'PLATFORM_ADMINISTRATOR'] }, isActive: true } });
          if (activeAdmins <= 1) throw new IamError('The last active system administrator cannot be demoted or suspended.', 409);
        }
        await tx.user.update({ where: { id: userId }, data });
        if (data.role || data.isActive === false) {
          await tx.iamSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
        }
      }, { isolationLevel: 'Serializable' });
    } catch (error) {
      if (error instanceof IamError) return NextResponse.json({ success: false, message: error.message }, { status: error.status });
      throw error;
    }
    await logAuditEvent({
      userId: auth.user.id,
      action: data.role ? 'IAM_USER_ROLE_UPDATED' : 'IAM_USER_STATUS_UPDATED',
      entityType: 'USER',
      entityId: userId,
      details: data.role ? `User role changed to ${data.role}.` : `User account ${data.isActive ? 'activated' : 'suspended'}.`,
    });
    return NextResponse.json({ success: true, message: 'User access updated; managed sessions were revoked where required.' });
  } catch (error) {
    if (error instanceof IamError) return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    console.error('[IAM user update failed]', error);
    return NextResponse.json({ success: false, message: 'User access could not be updated.' }, { status: 503 });
  }
}
