import { NextResponse } from 'next/server';
import {
  authorizeNetworkRequest, getNetworkDashboard, networkErrorResponse, recordNetworkAccess,
} from '../../../../lib/networkManagement';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

export async function GET(req) {
  const auth = authorizeNetworkRequest(req, 'view');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    const zone = new URL(req.url).searchParams.get('zone') || 'ALL';
    await recordNetworkAccess({ user: auth.user, action: 'NETWORK_DASHBOARD_VIEWED', req });
    const dashboard = await getNetworkDashboard({ zone, simulatedOnly: Boolean(auth.user.isDemo), facilityId });
    if (auth.user.role !== 'SYSTEM_ADMIN') {
      dashboard.controllers = dashboard.controllers.map(({ endpointUrl, secretReference, ...safeConfig }) => safeConfig);
    }
    return NextResponse.json({
      success: true,
      dashboard,
      permissions: { canManage: auth.user.role === 'SYSTEM_ADMIN', canConfigureController: auth.user.role === 'SYSTEM_ADMIN' && !auth.user.isDemo },
    });
  } catch (error) { return networkErrorResponse(error); }
}
