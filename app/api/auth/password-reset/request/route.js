import { NextResponse } from 'next/server';
import { cancelPasswordReset, createPasswordReset, IamError } from '../../../../../lib/iam';
import { prisma } from '../../../../../lib/prisma';

async function deliverResetEmail(email, token) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.IAM_PASSWORD_RESET_FROM_EMAIL;
  if (!apiKey || !from) throw new IamError('Password recovery email delivery is not configured.', 503);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  let base;
  try { base = new URL(appUrl); } catch { throw new IamError('NEXT_PUBLIC_APP_URL must be configured for password recovery.', 503); }
  if (process.env.NODE_ENV === 'production' && base.protocol !== 'https:') throw new IamError('Password recovery URL must use HTTPS.', 503);
  const resetUrl = new URL('/reset-password', base);
  resetUrl.searchParams.set('token', token);
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [email],
      subject: 'Reset your Talanta Stadium account password',
      text: `Use this one-time link within 30 minutes to reset your password: ${resetUrl.toString()}`,
    }),
  });
  if (!response.ok) throw new IamError('Password recovery email could not be delivered.', 503);
}

export async function POST(req) {
  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, message: 'Enter a valid email address.' }, { status: 400 });
    }
    if (process.env.NODE_ENV === 'production' && (!process.env.RESEND_API_KEY || !process.env.IAM_PASSWORD_RESET_FROM_EMAIL)) {
      return NextResponse.json({ success: false, message: 'Password recovery delivery is not configured.' }, { status: 503 });
    }
    if (!process.env.DATABASE_URL || !prisma?.user || !prisma?.passwordResetToken) {
      return NextResponse.json({ success: false, message: 'Password recovery service is unavailable.' }, { status: 503 });
    }
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, isActive: true } });
    if (user?.isActive) {
      const recent = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id, usedAt: null, expiresAt: { gt: new Date() }, createdAt: { gt: new Date(Date.now() - 60_000) } },
        select: { id: true },
      });
      if (!recent) {
        const { token } = await createPasswordReset(user.id);
        if (process.env.NODE_ENV === 'development') {
          return NextResponse.json({ success: true, message: 'Development-only recovery link token; not for production.', developmentToken: token });
        }
        try {
          await deliverResetEmail(user.email, token);
        } catch (error) {
          await cancelPasswordReset(token);
          throw error;
        }
      }
    }
    return NextResponse.json({ success: true, message: 'If an active account matches that email, password recovery instructions will be sent.' }, { status: 202 });
  } catch (error) {
    const status = error instanceof IamError ? error.status : 503;
    if (!(error instanceof IamError)) console.error('[Password recovery request failed]', error);
    return NextResponse.json({ success: false, message: error instanceof IamError ? error.message : 'Password recovery is temporarily unavailable.' }, { status });
  }
}
