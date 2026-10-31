import {
  authorizeSocRequest,
  createSiemIntegration,
  listSiemIntegrations,
  readSocJson,
  socErrorResponse,
} from '../../../../lib/securityOperations';

export async function GET(req) {
  const auth = authorizeSocRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const integrations = await listSiemIntegrations({ simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({
      success: true,
      integrations: integrations.map((integration) => ({
        id: integration.id,
        providerName: integration.providerName,
        protocol: integration.protocol,
        connectionStatus: integration.connectionStatus,
        isSimulated: integration.isSimulated,
        endpointUrl: 'REDACTED',
        secretReference: integration.secretReference ? 'Configured in secret manager' : null,
      })),
    });
  } catch (error) {
    return socErrorResponse(error);
  }
}

export async function POST(req) {
  const auth = authorizeSocRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const integration = await createSiemIntegration(await readSocJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({
      success: true,
      integration: { ...integration, endpointUrl: 'REDACTED', secretReference: integration.secretReference ? 'Configured in secret manager' : null },
      message: 'SIEM metadata registered. Connectivity and event forwarding are not implemented or verified.',
    }, { status: 201 });
  } catch (error) {
    return socErrorResponse(error);
  }
}
