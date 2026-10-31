import { NextResponse } from 'next/server';
import { authorizeHelpdeskRequest, getHelpdeskDashboard, HelpdeskError } from '../../../../lib/helpdesk.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const auth = await authorizeHelpdeskRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized helpdesk dashboard access is required.' }, { status: auth.status });
  }

  try {
    const dashboard = await getHelpdeskDashboard({ facilityId: auth.facilityId, userRole: auth.user.role, userId: auth.user.id });
    return NextResponse.json({ success: true, dashboard }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof HelpdeskError ? error.status : 503;
    if (!(error instanceof HelpdeskError)) console.error('[Helpdesk dashboard error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Helpdesk dashboard unavailable.' }, { status });
  }
}
