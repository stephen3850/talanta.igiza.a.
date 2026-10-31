import {
  authorizeCommunicationsRequest,
  communicationsErrorResponse,
  getEmergencyCommunicationsDashboard,
  readCommunicationsJson,
  updateCommunicationsPolicy,
} from '../../../../lib/emergencyCommunications';

export async function GET(req) {
  const auth = authorizeCommunicationsRequest(req, 'view');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { dashboard } = await getEmergencyCommunicationsDashboard({ simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, policy: dashboard.policy });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}

export async function PATCH(req) {
  const auth = authorizeCommunicationsRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const policy = await updateCommunicationsPolicy(await readCommunicationsJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, policy, message: 'Operator and supervisor roles updated.' });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}
