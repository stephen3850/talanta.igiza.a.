import { NextResponse } from 'next/server';
import {
  authorizeNetworkRequest, createGuestWifiPolicy, getNetworkDashboard, networkErrorResponse,
  readNetworkJson, recordNetworkAccess,
} from '../../../../lib/networkManagement';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

export async function GET(req) {
  const auth = authorizeNetworkRequest(req, 'view');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    await recordNetworkAccess({ user: auth.user, action: 'GUEST_WIFI_POLICY_VIEWED', req });
    const dashboard = await getNetworkDashboard({ simulatedOnly: Boolean(auth.user.isDemo), facilityId });
    return NextResponse.json({ success: true, policies: dashboard.policies });
  } catch (error) { return networkErrorResponse(error); }
}

export async function POST(req) {
  const auth = authorizeNetworkRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN']);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    const policy = await createGuestWifiPolicy({ ...(await readNetworkJson(req)), facilityId }, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    await recordNetworkAccess({ user: auth.user, action: 'GUEST_WIFI_POLICY_DRAFTED', entityId: policy.id, req });
    return NextResponse.json({
      success: true,
      policy,
      message: 'Policy saved as a draft pending approval. No wireless controller configuration was changed.',
    }, { status: 201 });
  } catch (error) { return networkErrorResponse(error); }
}
