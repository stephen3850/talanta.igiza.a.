import {
  authorizeCommunicationsRequest,
  communicationsErrorResponse,
  readCommunicationsJson,
  scheduleCommunicationMessage,
} from '../../../../../../lib/emergencyCommunications';

export async function POST(req, { params }) {
  const auth = authorizeCommunicationsRequest(req, 'prepare');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { messageId } = await params;
    const message = await scheduleCommunicationMessage(messageId, await readCommunicationsJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, message, messageText: 'Approved message scheduled. Dispatch remains simulated until a verified vendor adapter is deployed.' });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}
