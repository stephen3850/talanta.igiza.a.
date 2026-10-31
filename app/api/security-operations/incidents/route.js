import {
  authorizeSocRequest,
  createSecurityIncident,
  listSecurityIncidents,
  readSocJson,
  socErrorResponse,
} from '../../../../lib/securityOperations';

export async function GET(req) {
  const auth = authorizeSocRequest(req, 'view');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const incidents = await listSecurityIncidents({ simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, incidents });
  } catch (error) {
    return socErrorResponse(error);
  }
}

export async function POST(req) {
  const auth = authorizeSocRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const incident = await createSecurityIncident(await readSocJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, incident }, { status: 201 });
  } catch (error) {
    return socErrorResponse(error);
  }
}
