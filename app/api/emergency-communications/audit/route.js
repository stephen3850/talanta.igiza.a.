import {
  authorizeCommunicationsRequest,
  communicationsErrorResponse,
  getCommunicationsAuditTrail,
  verifyCommunicationsAudit,
} from '../../../../lib/emergencyCommunications';

export async function GET(req) {
  const auth = authorizeCommunicationsRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const records = await getCommunicationsAuditTrail({ simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({
      success: true,
      mode: auth.user.isDemo ? 'SIMULATED_DEVELOPMENT' : 'HASH_LINKED_AUDIT',
      integrityValid: verifyCommunicationsAudit(records),
      records,
    });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}
