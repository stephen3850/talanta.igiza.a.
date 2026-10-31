import {
  accessControlErrorResponse,
  authorizeAccessControlRequest,
  createAccessIntegration,
  readAccessControlJson,
} from '../../../../lib/accessControl';

export async function POST(req) {
  const auth = authorizeAccessControlRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const integration = await createAccessIntegration(await readAccessControlJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({
      success: true,
      integration: { ...integration, endpointUrl: 'REDACTED', secretReference: integration.secretReference ? 'Configured in secret manager' : null },
      message: 'Integration metadata saved. Connectivity is unverified and no hardware commands are enabled.',
    }, { status: 201 });
  } catch (error) {
    return accessControlErrorResponse(error);
  }
}
