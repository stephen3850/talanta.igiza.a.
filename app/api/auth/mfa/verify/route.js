import { NextResponse } from 'next/server';
import { canonicalRole } from '../../../../../lib/auth';
import { logAuditEvent } from '../../../../../lib/audit';
import { prisma } from '../../../../../lib/prisma';
import { recordLoginSecurityEvent } from '../../../../../lib/securityOperations';
import { createManagedSession, IamError, verifyChallengeForUser, verifyMfaForLogin } from '../../../../../lib/iam';

export async function POST(req) {
  let challengedEmail = null;
  try {
    const body = await req.json();
    const challenge = verifyChallengeForUser(body.challengeToken, 'MFA_LOGIN');
    challengedEmail = challenge.email;
    const account = await prisma.user.findUnique({
      where: { id: challenge.id },
      select: { id: true, email: true, fullName: true, role: true, isActive: true },
    });
    if (!account?.isActive || account.email !== challenge.email || account.role !== challenge.assignedRole) {
      throw new IamError('Authentication challenge is invalid or expired.', 401);
    }
    await verifyMfaForLogin(account.id, body.code);
    const user = { id: account.id, email: account.email, fullName: account.fullName, role: canonicalRole(account.role), assignedRole: account.role };
    const { token, sessionId } = await createManagedSession(user, req);
    await recordLoginSecurityEvent({ email: user.email, success: true, req });
    await logAuditEvent({ userId: user.id, action: 'USER_LOGIN_MFA_SUCCESS', entityType: 'USER', entityId: user.id, details: 'User completed multi-factor authentication.' });
    const response = NextResponse.json({ success: true, user, sessionId, message: 'Multi-factor authentication successful.' });
    response.cookies.set('talanta_session', token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 8 * 60 * 60,
    });
    return response;
  } catch (error) {
    const status = error instanceof IamError ? error.status : 503;
    if (status === 401 && challengedEmail) {
      try { await recordLoginSecurityEvent({ email: challengedEmail, success: false, req }); }
      catch (loggingError) { console.error('[MFA failure event logging failed]', loggingError); }
    }
    if (!(error instanceof IamError)) console.error('[MFA verification failed]', error);
    return NextResponse.json({ success: false, message: error instanceof IamError ? error.message : 'Multi-factor authentication is unavailable.' }, { status });
  }
}
