import {
  addInvestigationNote,
  authorizeSocRequest,
  readSocJson,
  socErrorResponse,
} from '../../../../../../lib/securityOperations';

export async function POST(req, { params }) {
  const auth = authorizeSocRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { incidentId } = await params;
    const body = await readSocJson(req);
    const note = await addInvestigationNote(incidentId, body.note, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, note }, { status: 201 });
  } catch (error) {
    return socErrorResponse(error);
  }
}
