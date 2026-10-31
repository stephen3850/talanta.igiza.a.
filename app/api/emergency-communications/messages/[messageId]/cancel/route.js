import {
  authorizeCommunicationsRequest,
  cancelCommunicationMessage,
  communicationsErrorResponse,
} from '../../../../../../lib/emergencyCommunications';

export async function POST(req, { params }) {
  const auth = authorizeCommunicationsRequest(req, 'prepare');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { messageId } = await params;
    const message = await cancelCommunicationMessage(messageId, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, message, messageText: 'Message cancelled and cancellation recorded.' });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}
