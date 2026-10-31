import {
  approveCommissioning,
  assertHardwareFacilityOwnership,
  authorizeHardwareRequest,
  HardwareDeploymentError,
  hardwareErrorResponse,
  runCommissioningChecklist,
} from '../../../../lib/hardwareDeployment';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

export async function POST(req) {
  const auth = authorizeHardwareRequest(req);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    let input;
    try { input = await req.json(); }
    catch { throw new HardwareDeploymentError('Request body must be valid JSON.'); }
    const facilityId = getRequestedFacilityId(req);
    const facilityAuth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD']);
    if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
    await assertHardwareFacilityOwnership({ assetId: input.assetId, facilityId, simulatedOnly: Boolean(auth.user.isDemo) });
    const result = await runCommissioningChecklist(input, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, result }, { status: 201 });
  } catch (error) { return hardwareErrorResponse(error); }
}

export async function PUT(req) {
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
    const asset = await approveCommissioning(input.assetId, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, message: 'Separate human acceptance approval recorded.', asset });
  } catch (error) { return hardwareErrorResponse(error); }
}
