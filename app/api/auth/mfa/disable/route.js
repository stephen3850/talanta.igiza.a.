import { NextResponse } from 'next/server';
import { verifyPassword } from '../../../../../lib/auth';
import { logAuditEvent } from '../../../../../lib/audit';
import { authorizeManagedUser, disableMfa, IamError, privilegedMfaRequired, verifyMfaForLogin } from '../../../../../lib/iam';
import { prisma } from '../../../../../lib/prisma';

export async function POST(req) {
  const auth = await authorizeManagedUser(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A valid managed session is required.' }, { status: auth.status });
  if (auth.user.isDemo) return NextResponse.json({ success: false, message: 'MFA is unavailable for demo accounts.' }, { status: 409 });
  if (privilegedMfaRequired(auth.user.role)) return NextResponse.json({ success: false, message: 'MFA is enforced for this privileged role and cannot be disabled.' }, { status: 403 });
  try {
    const body = await req.json();
    const account = await prisma.user.findUnique({ where: { id: auth.user.id }, select: { passwordHash: true } });
    if (!account || !verifyPassword(body.currentPassword, account.passwordHash)) {
      return NextResponse.json({ success: false, message: 'Current password is incorrect.' }, { status: 401 });
    }
    await verifyMfaForLogin(auth.user.id, body.code);
    await disableMfa(auth.user.id);
    await logAuditEvent({ userId: auth.user.id, action: 'MFA_DISABLED', entityType: 'USER', entityId: auth.user.id, details: 'Authenticator-based MFA was disabled after password and MFA verification; managed sessions were revoked.' });
    const response = NextResponse.json({ success: true, message: 'MFA disabled. Sign in again to create a fresh session.' });
    response.cookies.set('talanta_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    return response;
  } catch (error) {
    const status = error instanceof IamError ? error.status : 503;
    if (!(error instanceof IamError)) console.error('[MFA disable failed]', error);
    return NextResponse.json({ success: false, message: error instanceof IamError ? error.message : 'MFA could not be disabled.' }, { status });
  }
}
