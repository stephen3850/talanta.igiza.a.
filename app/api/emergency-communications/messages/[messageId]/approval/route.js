import {
  approveCommunicationMessage,
  authorizeCommunicationsRequest,
  communicationsErrorResponse,
  readCommunicationsJson,
  submitCommunicationForApproval,
} from '../../../../../../lib/emergencyCommunications';

export async function POST(req, { params }) {
  const auth = authorizeCommunicationsRequest(req, 'prepare');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { messageId } = await params;
    const body = await readCommunicationsJson(req);
    if (!['SUBMIT', 'APPROVE'].includes(body.action)) {
      return Response.json({ success: false, message: 'Select SUBMIT or APPROVE.' }, { status: 400 });
    }
    const message = body.action === 'SUBMIT'
      ? await submitCommunicationForApproval(messageId, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) })
      : await approveCommunicationMessage(messageId, auth.user, { simulatedOnly: Boolean(auth.user.isDemo), notes: body.notes });
    return Response.json({ success: true, message, status: message.status });
  } catch (error) {
    return communicationsErrorResponse(error);
  }
}
