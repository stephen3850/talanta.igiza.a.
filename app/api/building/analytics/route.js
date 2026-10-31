import { NextResponse } from 'next/server';
import { generateBuildingAnalytics } from '../../../../lib/buildingManagement';
import { authorizeRole } from '../../../../lib/auth';

export async function GET(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'REPORT_VIEWER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized facilities staff must sign in.' }, { status: auth.status });
  try {
    const analytics = generateBuildingAnalytics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      reportId: `REP-BLD-${Date.now()}`,
      venue: 'Talanta Stadium Sports City',
      reportingPeriod: 'Development simulation',
      analytics,
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
