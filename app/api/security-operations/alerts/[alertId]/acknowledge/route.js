import {
  acknowledgeSecurityAlert,
  authorizeSocRequest,
  socErrorResponse,
} from '../../../../../../lib/securityOperations';

export async function POST(req, { params }) {
  const auth = authorizeSocRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { alertId } = await params;
    const alert = await acknowledgeSecurityAlert(alertId, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, alert });
  } catch (error) {
    return socErrorResponse(error);
  }
}
