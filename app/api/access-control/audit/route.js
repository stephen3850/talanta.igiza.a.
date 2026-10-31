import {
  accessControlErrorResponse,
  authorizeAccessControlRequest,
  getAccessAuditTrail,
  verifyAccessAuditChain,
} from '../../../../lib/accessControl';

export async function GET(req) {
  const auth = authorizeAccessControlRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const records = await getAccessAuditTrail({ simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({
      success: true,
      integrityValid: verifyAccessAuditChain(records),
      mode: auth.user.isDemo ? 'SIMULATED_DEVELOPMENT' : 'HASH_LINKED_AUDIT',
      records,
    });
  } catch (error) {
    return accessControlErrorResponse(error);
  }
}
