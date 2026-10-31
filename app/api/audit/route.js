import {
  authorizeSocRequest,
  getSecurityDashboard,
  socErrorResponse,
} from '../../../lib/securityOperations';

export async function GET(req) {
  const auth = authorizeSocRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const dashboard = await getSecurityDashboard({ simulatedOnly: Boolean(auth.user.isDemo) });
    const auditLogs = dashboard.events.map((event) => ({
      id: event.eventRef,
      action: event.eventType,
      entityType: event.source,
      details: event.summary,
      createdAt: event.occurredAt,
      severity: event.severity,
      isSimulated: event.isSimulated,
    }));
    return Response.json({ success: true, count: auditLogs.length, auditLogs });
  } catch (error) {
    return socErrorResponse(error);
  }
}
