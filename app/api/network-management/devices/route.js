import { NextResponse } from 'next/server';
import {
  authorizeNetworkRequest, listNetworkDevices, networkErrorResponse,
  readNetworkJson, recordNetworkAccess, registerNetworkDevice,
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
    await recordNetworkAccess({ user: auth.user, action: 'NETWORK_DEVICE_INVENTORY_VIEWED', req });
    const devices = await listNetworkDevices({ zone, simulatedOnly: Boolean(auth.user.isDemo), facilityId });
    return NextResponse.json({ success: true, devices, count: devices.length });
  } catch (error) { return networkErrorResponse(error); }
}

export async function POST(req) {
  const auth = authorizeNetworkRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN']);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    const device = await registerNetworkDevice({ ...(await readNetworkJson(req)), facilityId }, { simulatedOnly: Boolean(auth.user.isDemo) });
    await recordNetworkAccess({ user: auth.user, action: 'NETWORK_DEVICE_REGISTERED', entityId: device.deviceId, req });
    return NextResponse.json({ success: true, device }, { status: 201 });
  } catch (error) { return networkErrorResponse(error); }
}
