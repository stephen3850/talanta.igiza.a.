import { NextResponse } from 'next/server';
import { authorizeManagedUser, IamError, rotateMfaRecoveryCodes } from '../../../../../lib/iam';

export async function POST(req) {
  const auth = await authorizeManagedUser(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A valid managed session is required.' }, { status: auth.status });
  if (auth.user.isDemo) return NextResponse.json({ success: false, message: 'Recovery codes are unavailable for demo accounts.' }, { status: 409 });
  try {
    const body = await req.json();
    const recoveryCodes = await rotateMfaRecoveryCodes(auth.user.id, body.code);
    return NextResponse.json({ success: true, recoveryCodes, message: 'Save these replacement codes securely; they will not be shown again.' });
  } catch (error) {
    const status = error instanceof IamError ? error.status : 503;
    if (!(error instanceof IamError)) console.error('[Recovery code rotation failed]', error);
    return NextResponse.json({ success: false, message: error instanceof IamError ? error.message : 'Recovery codes could not be regenerated.' }, { status });
  }
}
