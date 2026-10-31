import {
  authorizeDRRequest,
  DisasterRecoveryError,
  drErrorResponse,
  updateDRPolicy,
} from '../../../../lib/disasterRecovery';

export async function PUT(req) {
  const auth = authorizeDRRequest(req);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    let input;
    try { input = await req.json(); }
    catch { throw new DisasterRecoveryError('Request body must be valid JSON.'); }
    const policy = await updateDRPolicy(input, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({
      success: true,
      message: 'Proposed RPO/RTO saved; stakeholder approval is still required.',
      policy,
    });
  } catch (error) {
    return drErrorResponse(error);
  }
}
