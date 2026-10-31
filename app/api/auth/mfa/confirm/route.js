import { NextResponse } from 'next/server';
import { canonicalRole } from '../../../../../lib/auth';
import { logAuditEvent } from '../../../../../lib/audit';
import { authorizeManagedUser, createManagedSession, confirmMfaEnrollment, IamError, verifyChallengeForUser } from '../../../../../lib/iam';
import { prisma } from '../../../../../lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    let user;
    let setupChallenge = false;
    if (body.challengeToken) {
      const challenge = verifyChallengeForUser(body.challengeToken, 'MFA_ENROLL');
      setupChallenge = true;
      user = await prisma.user.findUnique({
        where: { id: challenge.id },
        select: { id: true, email: true, fullName: true, role: true, isActive: true },
      });
      if (!user?.isActive || user.email !== challenge.email || user.role !== challenge.assignedRole) {
        return NextResponse.json({ success: false, message: 'Authentication challenge is invalid or expired.' }, { status: 401 });
      }
    } else {
      const auth = await authorizeManagedUser(req);
      if (!auth.authorized) return NextResponse.json({ success: false, message: 'A valid managed session is required.' }, { status: auth.status });
      if (auth.user.isDemo) return NextResponse.json({ success: false, message: 'MFA setup is not available for demo accounts.' }, { status: 409 });
      user = auth.user;
    }

    const recoveryCodes = await confirmMfaEnrollment(user.id, body.code);
    await logAuditEvent({ userId: user.id, action: 'MFA_ENABLED', entityType: 'USER', entityId: user.id, details: 'Authenticator-based MFA was enabled.' });
    if (setupChallenge) {
      const sessionUser = { id: user.id, email: user.email, fullName: user.fullName, role: canonicalRole(user.role), assignedRole: user.role };
      const { token, sessionId } = await createManagedSession(sessionUser, req);
      const response = NextResponse.json({ success: true, user: sessionUser, sessionId, recoveryCodes });
      response.cookies.set('talanta_session', token, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 8 * 60 * 60,
      });
      return response;
    }
    return NextResponse.json({ success: true, recoveryCodes, message: 'MFA enabled. Save these recovery codes; they will not be shown again.' });
  } catch (error) {
    const status = error instanceof IamError ? error.status : 503;
    if (!(error instanceof IamError)) console.error('[MFA enrollment confirmation failed]', error);
    return NextResponse.json({ success: false, message: error instanceof IamError ? error.message : 'MFA enrollment is unavailable.' }, { status });
  }
}
