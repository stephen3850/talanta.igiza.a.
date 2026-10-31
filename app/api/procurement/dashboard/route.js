import { NextResponse } from 'next/server';
import { authorizeProcurementRequest, getProcurementDashboard, ProcurementError } from '../../../../lib/procurement.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const auth = await authorizeProcurementRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized procurement dashboard access is required.' }, { status: auth.status });
  }

  try {
    const dashboard = await getProcurementDashboard({ facilityId: auth.facilityId });
    return NextResponse.json({ success: true, dashboard }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    if (!(error instanceof ProcurementError)) console.error('[Procurement dashboard error]', error);
    return NextResponse.json({ success: false, message: error.message || 'Procurement dashboard unavailable.' }, { status });
  }
}
