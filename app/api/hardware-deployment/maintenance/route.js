import {
  authorizeHardwareRequest,
  assertHardwareFacilityOwnership,
  HardwareDeploymentError,
  hardwareErrorResponse,
  recordHardwareMaintenance,
} from '../../../../lib/hardwareDeployment';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

export async function POST(req) {
  const auth = authorizeHardwareRequest(req, true);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    let input;
    try { input = await req.json(); }
    catch { throw new HardwareDeploymentError('Request body must be valid JSON.'); }
    const facilityId = getRequestedFacilityId(req);
    const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
    if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
    await assertHardwareFacilityOwnership({ assetId: input.assetId, facilityId, simulatedOnly: Boolean(auth.user.isDemo) });
    if (input.replacementAssetId) await assertHardwareFacilityOwnership({ assetId: input.replacementAssetId, facilityId, simulatedOnly: Boolean(auth.user.isDemo) });
    const record = await recordHardwareMaintenance(input, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, record }, { status: 201 });
  } catch (error) { return hardwareErrorResponse(error); }
}
