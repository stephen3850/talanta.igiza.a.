import {
  authorizeSocRequest,
  getSecurityDashboard,
  readSocJson,
  socErrorResponse,
  updateSecurityPolicy,
} from '../../../../lib/securityOperations';

export async function GET(req) {
  const auth = authorizeSocRequest(req, 'view');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const dashboard = await getSecurityDashboard({ simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, policy: dashboard.policy });
  } catch (error) {
    return socErrorResponse(error);
  }
}

export async function PATCH(req) {
  const auth = authorizeSocRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const policy = await updateSecurityPolicy(await readSocJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, policy });
  } catch (error) {
    return socErrorResponse(error);
  }
}
