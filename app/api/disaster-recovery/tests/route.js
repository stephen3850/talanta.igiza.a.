import {
  authorizeDRRequest,
  DisasterRecoveryError,
  drErrorResponse,
  recordRecoveryTest,
} from '../../../../lib/disasterRecovery';

export async function POST(req) {
  const auth = authorizeDRRequest(req);
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    let input;
    try { input = await req.json(); }
    catch { throw new DisasterRecoveryError('Request body must be valid JSON.'); }
    const test = await recordRecoveryTest(input, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, message: 'Recovery test result recorded.', test }, { status: 201 });
  } catch (error) {
    return drErrorResponse(error);
  }
}
