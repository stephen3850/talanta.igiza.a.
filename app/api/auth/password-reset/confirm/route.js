import { NextResponse } from 'next/server';
import { logAuditEvent } from '../../../../../lib/audit';
import { IamError, resetPassword } from '../../../../../lib/iam';

export async function POST(req) {
  try {
    const body = await req.json();
    if (typeof body.token !== 'string' || body.token.length > 128) {
      return NextResponse.json({ success: false, message: 'Password reset link is invalid or expired.' }, { status: 400 });
    }
    const userId = await resetPassword(body.token, body.password);
    await logAuditEvent({ userId, action: 'PASSWORD_RESET_COMPLETED', entityType: 'USER', entityId: userId, details: 'Password reset completed and existing managed sessions were revoked.' });
    const response = NextResponse.json({ success: true, message: 'Password reset completed. Sign in with your new password.' });
    response.cookies.set('talanta_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
    return response;
  } catch (error) {
    const status = error instanceof IamError ? error.status : 503;
    if (!(error instanceof IamError)) console.error('[Password reset confirmation failed]', error);
    return NextResponse.json({ success: false, message: error instanceof IamError ? error.message : 'Password reset is temporarily unavailable.' }, { status });
  }
}
