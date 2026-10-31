import { NextResponse } from 'next/server';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeManagedUser, IamError, listUserSessions, revokeUserSession } from '../../../../lib/iam';

export async function GET(req) {
  const auth = await authorizeManagedUser(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A valid managed session is required.' }, { status: auth.status });
  if (auth.user.isDemo) return NextResponse.json({ success: true, sessions: [], isSimulated: true });
  try {
    return NextResponse.json({ success: true, sessions: await listUserSessions(auth.user.id) });
  } catch (error) {
    const status = error instanceof IamError ? error.status : 503;
    if (!(error instanceof IamError)) console.error('[Session listing failed]', error);
    return NextResponse.json({ success: false, message: 'Sessions could not be loaded.' }, { status });
  }
}

export async function DELETE(req) {
  const auth = await authorizeManagedUser(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A valid managed session is required.' }, { status: auth.status });
  try {
    const body = await req.json();
    if (typeof body.sessionId !== 'string' || body.sessionId.length > 64) return NextResponse.json({ success: false, message: 'A valid session ID is required.' }, { status: 400 });
    const revoked = await revokeUserSession(auth.user.id, body.sessionId);
    if (!revoked) return NextResponse.json({ success: false, message: 'Session was not found or was already revoked.' }, { status: 404 });
    await logAuditEvent({ userId: auth.user.id, action: 'IAM_SESSION_REVOKED', entityType: 'IAM_SESSION', entityId: body.sessionId, details: 'User revoked one of their managed sessions.' });
    return NextResponse.json({ success: true, message: 'Session revoked.' });
  } catch (error) {
    const status = error instanceof IamError ? error.status : 503;
    if (!(error instanceof IamError)) console.error('[Session revocation failed]', error);
    return NextResponse.json({ success: false, message: error instanceof IamError ? error.message : 'Session could not be revoked.' }, { status });
  }
}
