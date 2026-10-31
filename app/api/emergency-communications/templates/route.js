import {
  authorizeCommunicationsRequest,
  communicationsErrorResponse,
  createCommunicationTemplate,
  listCommunicationTemplates,
  readCommunicationsJson,
} from '../../../../lib/emergencyCommunications';

export async function GET(req) {
  const auth = authorizeCommunicationsRequest(req, 'view');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const templates = await listCommunicationTemplates({ simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, templates });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}

export async function POST(req) {
  const auth = authorizeCommunicationsRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const template = await createCommunicationTemplate(await readCommunicationsJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, template }, { status: 201 });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}
