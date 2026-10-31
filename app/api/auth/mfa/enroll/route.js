import { NextResponse } from 'next/server';
import { verifyPassword } from '../../../../../lib/auth';
import { authorizeManagedUser, beginMfaEnrollment, IamError, verifyChallengeForUser } from '../../../../../lib/iam';
import { prisma } from '../../../../../lib/prisma';

export async function POST(req) {
  try {
    const body = await req.json();
    let user;
    if (body.challengeToken) {
      const challenge = verifyChallengeForUser(body.challengeToken, 'MFA_ENROLL');
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
      const account = await prisma.user.findUnique({ where: { id: user.id }, select: { email: true, passwordHash: true, isActive: true } });
      if (!account?.isActive || !body.currentPassword || !verifyPassword(body.currentPassword, account.passwordHash)) {
        return NextResponse.json({ success: false, message: 'Re-enter your current password to start MFA enrollment.' }, { status: 401 });
      }
      user.email = account.email;
    }
    const enrollment = await beginMfaEnrollment(user.id, user.email);
    return NextResponse.json({ success: true, ...enrollment, message: 'Scan the QR code in an authenticator app, then verify a current code to finish setup.' });
  } catch (error) {
    const status = error instanceof IamError ? error.status : 503;
    if (!(error instanceof IamError)) console.error('[MFA enrollment start failed]', error);
    return NextResponse.json({ success: false, message: error instanceof IamError ? error.message : 'MFA enrollment is unavailable.' }, { status });
  }
}
