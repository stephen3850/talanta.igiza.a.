import {
  authorizeSocRequest,
  getSocAuditIntegrity,
  getSocAuditTrail,
  socErrorResponse,
  verifySocAuditChain,
} from '../../../../lib/securityOperations';

export async function GET(req) {
  const auth = authorizeSocRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const records = await getSocAuditTrail({ simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({
      success: true,
      integrityValid: verifySocAuditChain(records),
      mode: auth.user.isDemo ? 'SIMULATED_DEVELOPMENT' : 'HASH_LINKED_AUDIT',
      records,
    });
  } catch (error) {
    return socErrorResponse(error);
  }
}
