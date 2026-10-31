import {
  accessControlErrorResponse,
  authorizeAccessControlRequest,
  revokeAccessPermission,
} from '../../../../../lib/accessControl';

export async function DELETE(req, { params }) {
  const auth = authorizeAccessControlRequest(req, 'manage');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { permissionId } = await params;
    const permission = await revokeAccessPermission(permissionId, auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    return Response.json({ success: true, permission, message: 'Access permission revoked.' });
  } catch (error) {
    return accessControlErrorResponse(error);
  }
}
