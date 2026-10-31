import {
  approveInstallationTask,
  assertHardwareFacilityOwnership,
  authorizeHardwareRequest,
  createInstallationTask,
  HardwareDeploymentError,
  hardwareErrorResponse,
  recordInstallationUpdate,
} from '../../../../lib/hardwareDeployment';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

async function authorizeInstallationRequest(req, auth, input, taskAction = false, management = false) {
  const facilityId = getRequestedFacilityId(req);
  const roles = management ? ['SYSTEM_ADMIN', 'VENUE_MANAGER'] : ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD'];
  const access = await authorizeFacilityAccess(req, facilityId, roles);
  if (!access.authorized) return access;
  await assertHardwareFacilityOwnership({
    assetId: taskAction ? undefined : input.assetId,
    taskRef: taskAction ? input.taskRef : undefined,
    facilityId,
    simulatedOnly: Boolean(auth.user.isDemo),
  });
  return access;
}

export async function POST(req) {
  const auth = authorizeHardwareRequest(req, true);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    let input;
    try { input = await req.json(); }
    catch { throw new HardwareDeploymentError('Request body must be valid JSON.'); }
    const facilityAuth = await authorizeInstallationRequest(req, auth, input, false, true);
    if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
    const task = await createInstallationTask(input, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, task }, { status: 201 });
  } catch (error) { return hardwareErrorResponse(error); }
}

export async function PATCH(req) {
  const auth = authorizeHardwareRequest(req);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    let input;
    try { input = await req.json(); }
    catch { throw new HardwareDeploymentError('Request body must be valid JSON.'); }
    const facilityAuth = await authorizeInstallationRequest(req, auth, input, true);
    if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
    const task = await recordInstallationUpdate(input, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, task });
  } catch (error) { return hardwareErrorResponse(error); }
}

export async function PUT(req) {
  const auth = authorizeHardwareRequest(req, true);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    let input;
    try { input = await req.json(); }
    catch { throw new HardwareDeploymentError('Request body must be valid JSON.'); }
    const facilityAuth = await authorizeInstallationRequest(req, auth, input, true, true);
    if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
    const task = await approveInstallationTask(input.taskRef, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, message: 'Installation inspection approved.', task });
  } catch (error) { return hardwareErrorResponse(error); }
}
