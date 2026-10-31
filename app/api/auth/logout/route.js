import { NextResponse } from 'next/server';
import { authorizeRole } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export async function POST(req) {
  const auth = authorizeRole(req);
  if (auth.authorized && auth.user.sessionId && prisma?.iamSession) {
    try {
      await prisma.iamSession.updateMany({ where: { id: auth.user.sessionId, userId: auth.user.id, revokedAt: null }, data: { revokedAt: new Date() } });
    } catch (error) {
      console.error('[Logout session revocation failed]', error);
      return NextResponse.json({ success: false, message: 'Session could not be revoked; try again.' }, { status: 503 });
    }
  }
  const response = NextResponse.json({ success: true, message: 'Signed out.' });
  response.cookies.set('talanta_session', '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
