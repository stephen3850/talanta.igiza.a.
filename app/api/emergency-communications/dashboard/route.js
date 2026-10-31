import {
  authorizeCommunicationsRequest,
  communicationsErrorResponse,
  getEmergencyCommunicationsDashboard,
} from '../../../../lib/emergencyCommunications';

export async function GET(req) {
  const auth = authorizeCommunicationsRequest(req, 'view');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const dashboard = await getEmergencyCommunicationsDashboard({
      simulatedOnly: Boolean(auth.user.isDemo),
      includeSensitive: auth.user.role === 'SYSTEM_ADMIN',
    });
    return Response.json({ success: true, dashboard, role: auth.user.role, userId: auth.user.id });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}
