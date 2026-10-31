import {
  authorizeCommunicationsRequest,
  communicationsErrorResponse,
  publishCommunicationMessage,
} from '../../../../../../lib/emergencyCommunications';

export async function POST(req, { params }) {
  const auth = authorizeCommunicationsRequest(req, 'approve');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { messageId } = await params;
    const message = await publishCommunicationMessage(messageId, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({
      success: true,
      message,
      messageText: 'Publication event recorded as SIMULATED PREVIEW. No PA system or signage display received a transmission.',
    });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}
