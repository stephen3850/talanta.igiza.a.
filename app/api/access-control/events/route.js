import {
  accessControlErrorResponse,
  authorizeAccessControlRequest,
  listAccessEvents,
  readAccessControlJson,
  recordAccessDecision,
} from '../../../../lib/accessControl';

export async function GET(req) {
  const auth = authorizeAccessControlRequest(req, 'view');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const zone = new URL(req.url).searchParams.get('zone') || 'ALL';
    const events = await listAccessEvents({ zone, simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({
      success: true,
      events: events.map((event) => ({ ...event, subjectHash: event.subjectHash ? `${event.subjectHash.slice(0, 12)}…` : undefined })),
    });
  } catch (error) {
    return accessControlErrorResponse(error);
  }
}

export async function POST(req) {
  const auth = authorizeAccessControlRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const event = await recordAccessDecision(await readAccessControlJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({
      success: true,
      event: { ...event, subjectHash: `${event.subjectHash.slice(0, 12)}…` },
      message: 'Authorization decision recorded for audit only; no door or gate command was sent.',
    }, { status: 201 });
  } catch (error) {
    return accessControlErrorResponse(error);
  }
}
