import { NextResponse } from 'next/server';
import { authorizeManagedUser, getIamDashboard, IamError } from '../../../../lib/iam';

export async function GET(req) {
  const auth = await authorizeManagedUser(req, ['SYSTEM_ADMIN']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const dashboard = await getIamDashboard();
    return NextResponse.json({ success: true, dashboard: { ...dashboard, currentUserId: auth.user.id } });
  } catch (error) {
    const status = error instanceof IamError ? error.status : 503;
    if (!(error instanceof IamError)) console.error('[IAM dashboard query failed]', error);
    return NextResponse.json({ success: false, message: error instanceof IamError ? error.message : 'IAM dashboard is unavailable.' }, { status });
  }
}
