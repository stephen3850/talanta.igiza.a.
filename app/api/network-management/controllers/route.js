import { NextResponse } from 'next/server';
import {
  authorizeNetworkRequest, createControllerConfiguration, networkErrorResponse,
  readNetworkJson, recordNetworkAccess,
} from '../../../../lib/networkManagement';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

export async function POST(req) {
  const auth = authorizeNetworkRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  if (auth.user.isDemo) {
    return NextResponse.json({ success: false, message: 'Demo sessions cannot configure wireless controllers.' }, { status: 403 });
  }
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN']);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    const controller = await createControllerConfiguration({ ...(await readNetworkJson(req)), facilityId }, auth.user);
    await recordNetworkAccess({ user: auth.user, action: 'WIRELESS_CONTROLLER_CONFIGURED', entityId: controller.id, req });
    return NextResponse.json({
      success: true,
      controller,
      message: 'Configuration saved as UNVERIFIED metadata. No controller connection or live change was made.',
    }, { status: 201 });
  } catch (error) { return networkErrorResponse(error); }
}
