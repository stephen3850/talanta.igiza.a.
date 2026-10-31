import {
  authorizeHardwareRequest,
  getHardwareDashboard,
  hardwareErrorResponse,
} from '../../../../lib/hardwareDeployment';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

export async function GET(req) {
  const auth = authorizeHardwareRequest(req);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD']);
  if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    const dashboard = await getHardwareDashboard({ simulatedOnly: Boolean(auth.user.isDemo), facilityId });
    return Response.json({ success: true, dashboard });
  } catch (error) {
    return hardwareErrorResponse(error);
  }
}
