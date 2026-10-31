import {
  authorizeSocRequest,
  getSecurityDashboard,
  socErrorResponse,
} from '../../../../lib/securityOperations';

export async function GET(req) {
  const auth = authorizeSocRequest(req, 'view');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const dashboard = await getSecurityDashboard({
      simulatedOnly: Boolean(auth.user.isDemo),
      includeSensitive: auth.user.role === 'SYSTEM_ADMIN',
    });
    return Response.json({ success: true, dashboard, currentUser: { id: auth.user.id, role: auth.user.role } });
  } catch (error) {
    return socErrorResponse(error);
  }
}
