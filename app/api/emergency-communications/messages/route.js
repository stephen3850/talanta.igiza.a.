import {
  authorizeCommunicationsRequest,
  communicationsErrorResponse,
  createCommunicationMessage,
  listCommunicationMessages,
  readCommunicationsJson,
} from '../../../../lib/emergencyCommunications';

export async function GET(req) {
  const auth = authorizeCommunicationsRequest(req, 'view');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const messages = await listCommunicationMessages({ simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, messages });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}

export async function POST(req) {
  const auth = authorizeCommunicationsRequest(req, 'prepare');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const message = await createCommunicationMessage(await readCommunicationsJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, message, messageText: 'Draft saved. Human approval is required before publication.' }, { status: 201 });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}
