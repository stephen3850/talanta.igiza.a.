import { NextResponse } from 'next/server';
import { authorizeExecutiveRequest, ExecutiveError, getExecutiveDashboardData } from '../../../../lib/executiveIntelligence.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const reportingPeriod = searchParams.get('reportingPeriod') || 'LAST_30_DAYS';

  const auth = await authorizeExecutiveRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized executive leadership access is required.' }, { status: auth.status });
  }

  try {
    const dashboard = await getExecutiveDashboardData({
      facilityId: auth.facilityId,
      reportingPeriod,
    });

    return NextResponse.json({ success: true, dashboard }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof ExecutiveError ? error.status : 503;
    if (!(error instanceof ExecutiveError)) console.error('[Executive dashboard error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Executive dashboard unavailable.' }, { status });
  }
}
