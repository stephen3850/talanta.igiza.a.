import { NextResponse } from 'next/server';
import { canonicalRole, createMfaChallengeToken, hashPassword, verifyPassword } from '../../../../lib/auth';
import { logAuditEvent } from '../../../../lib/audit';
import { createManagedSession, privilegedMfaRequired } from '../../../../lib/iam';
import { prisma } from '../../../../lib/prisma';
import { recordLoginSecurityEvent } from '../../../../lib/securityOperations';

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password || password.length > 1024) {
      return NextResponse.json({ success: false, message: 'Email and password required' }, { status: 400 });
    }
    if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
      return NextResponse.json({ success: false, message: 'Authentication is not configured for production.' }, { status: 503 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isDevelopment = process.env.NODE_ENV === 'development';
    let user;
    if (isDevelopment && normalizedEmail === 'admin@sttech.co.ke' && password === '123456') {
      user = { id: 'USR-ADMIN-DEMO', email: normalizedEmail, fullName: 'Development Demo Administrator', role: 'SYSTEM_ADMIN', isDemo: true };
    } else if (isDevelopment && normalizedEmail === 'patron@example.com' && password === '123456') {
      user = { id: 'USR-PATRON-DEMO', email: normalizedEmail, fullName: 'Development Demo Patron', role: 'CUSTOMER', isDemo: true };
    } else {
      if (!process.env.DATABASE_URL || !prisma?.user) return NextResponse.json({ success: false, message: 'Authentication service is unavailable.' }, { status: 503 });
      const account = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: { mfaCredential: { select: { enabledAt: true } } },
      });
      let passwordMatches = false;
      try { passwordMatches = Boolean(account && verifyPassword(password, account.passwordHash)); }
      catch { passwordMatches = false; }
      if (!account || !account.isActive || !passwordMatches) {
        await recordLoginSecurityEvent({ email: normalizedEmail, success: false, req });
        return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
      }
      if (!account.passwordHash.startsWith('pbkdf2$')) {
        await prisma.user.updateMany({ where: { id: account.id, passwordHash: account.passwordHash }, data: { passwordHash: hashPassword(password) } });
      }
      user = { id: account.id, email: account.email, fullName: account.fullName, role: canonicalRole(account.role), assignedRole: account.role };
      if (account.mfaCredential?.enabledAt) {
        return NextResponse.json({ success: false, mfaRequired: true, challengeToken: createMfaChallengeToken(user, 'MFA_LOGIN'), message: 'Enter the authenticator code or an unused recovery code.' });
      }
      if (privilegedMfaRequired(user.role)) {
        return NextResponse.json({ success: false, mfaSetupRequired: true, challengeToken: createMfaChallengeToken(user, 'MFA_ENROLL'), message: 'MFA enrollment is required before this privileged account can sign in.' });
      }
    }

    const { token, sessionId } = await createManagedSession(user, req, { isDemo: Boolean(user.isDemo) });
    await recordLoginSecurityEvent({ email: user.email, success: true, req }, { simulatedOnly: Boolean(user.isDemo) });
    await logAuditEvent({ userId: user.id, userEmail: null, action: 'USER_LOGIN_SUCCESS', entityType: 'USER', entityId: user.id, details: `User logged in with role ${user.role}` });

    const response = NextResponse.json({ success: true, message: 'Login successful', user, sessionId });
    response.cookies.set('talanta_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60,
    });
    return response;
  } catch (err) {
    console.error('[Authentication login failed]', err);
    return NextResponse.json({ success: false, message: 'Authentication service is temporarily unavailable.' }, { status: 503 });
  }
}
