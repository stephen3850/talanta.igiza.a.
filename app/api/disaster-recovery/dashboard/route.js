import { authorizeDRRequest, drErrorResponse, getDRDashboard } from '../../../../lib/disasterRecovery';

export async function GET(req) {
  const auth = authorizeDRRequest(req);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const dashboard = await getDRDashboard({ simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, dashboard });
  } catch (error) {
    return drErrorResponse(error);
  }
}
