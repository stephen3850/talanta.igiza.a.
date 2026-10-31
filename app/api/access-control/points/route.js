import {
  accessControlErrorResponse,
  authorizeAccessControlRequest,
  createAccessPoint,
  readAccessControlJson,
} from '../../../../lib/accessControl';

export async function POST(req) {
  const auth = authorizeAccessControlRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const point = await createAccessPoint(await readAccessControlJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, point, message: point.isSimulated ? 'Development-only access point registered.' : 'Access point registered; connectivity remains unverified.' }, { status: 201 });
  } catch (error) {
    return accessControlErrorResponse(error);
  }
}
