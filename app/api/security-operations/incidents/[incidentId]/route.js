import {
  authorizeSocRequest,
  socErrorResponse,
  updateSecurityIncident,
  readSocJson,
} from '../../../../../lib/securityOperations';

export async function PATCH(req, { params }) {
  const auth = authorizeSocRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { incidentId } = await params;
    const incident = await updateSecurityIncident(incidentId, await readSocJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, incident });
  } catch (error) {
    return socErrorResponse(error);
  }
}
