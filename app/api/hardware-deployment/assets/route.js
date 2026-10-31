import {
  authorizeHardwareRequest,
  HardwareDeploymentError,
  hardwareErrorResponse,
  listHardwareAssets,
  registerHardware,
} from '../../../../lib/hardwareDeployment';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

export async function GET(req) {
  const auth = authorizeHardwareRequest(req);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD']);
  if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    return Response.json({ success: true, assets: await listHardwareAssets({ simulatedOnly: Boolean(auth.user.isDemo), facilityId }) });
  } catch (error) { return hardwareErrorResponse(error); }
}

export async function POST(req) {
  const auth = authorizeHardwareRequest(req, true);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    let input;
    try { input = await req.json(); }
    catch { throw new HardwareDeploymentError('Request body must be valid JSON.'); }
    const asset = await registerHardware({ ...input, facilityId }, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, asset }, { status: 201 });
  } catch (error) { return hardwareErrorResponse(error); }
}
