import {
  authorizeHardwareRequest,
  HardwareDeploymentError,
  hardwareErrorResponse,
  getCommissioningTemplates,
  updateCommissioningTemplate,
} from '../../../../lib/hardwareDeployment';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../../lib/facilities';

export async function GET(req) {
  const auth = authorizeHardwareRequest(req);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityAuth = await authorizeFacilityAccess(req, getRequestedFacilityId(req), ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD']);
  if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    const templates = await getCommissioningTemplates({ simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, templates });
  } catch (error) { return hardwareErrorResponse(error); }
}

export async function PUT(req) {
  const auth = authorizeHardwareRequest(req, true);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  const facilityAuth = await authorizeFacilityAccess(req, getRequestedFacilityId(req), ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!facilityAuth.authorized) return Response.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    let input;
    try { input = await req.json(); }
    catch { throw new HardwareDeploymentError('Request body must be valid JSON.'); }
    const template = await updateCommissioningTemplate(input, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, message: 'Commissioning checklist template saved.', template });
  } catch (error) { return hardwareErrorResponse(error); }
}
