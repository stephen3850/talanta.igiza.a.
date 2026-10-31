import { NextResponse } from 'next/server';
import { getAssetById } from '../../../../lib/assetMaintenance';
import { authorizeRole } from '../../../../lib/auth';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

export async function GET(req, { params }) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'MAINTENANCE_TECHNICIAN', 'REPORT_VIEWER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized asset staff must sign in.' }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'MAINTENANCE_TECHNICIAN', 'REPORT_VIEWER']);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    const { id } = await params;
    const asset = getAssetById(id, facilityId);

    if (!asset) {
      return NextResponse.json({ success: false, message: 'Asset not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      asset: { ...asset, isSimulated: true },
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
