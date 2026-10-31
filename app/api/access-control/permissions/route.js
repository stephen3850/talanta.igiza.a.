import {
  accessControlErrorResponse,
  authorizeAccessControlRequest,
  createAccessPermission,
  listAccessPermissions,
  readAccessControlJson,
} from '../../../../lib/accessControl';

export async function GET(req) {
  const auth = authorizeAccessControlRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const zone = new URL(req.url).searchParams.get('zone') || 'ALL';
    const permissions = await listAccessPermissions({ zone, simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, permissions });
  } catch (error) {
    return accessControlErrorResponse(error);
  }
}

export async function POST(req) {
  const auth = authorizeAccessControlRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const permission = await createAccessPermission(await readAccessControlJson(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, permission, message: permission.isSimulated ? 'Simulated access permission saved.' : 'Access permission saved.' }, { status: 201 });
  } catch (error) {
    return accessControlErrorResponse(error);
  }
}
