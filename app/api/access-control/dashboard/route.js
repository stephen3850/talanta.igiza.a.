import {
  accessControlErrorResponse,
  authorizeAccessControlRequest,
  getAccessControlDashboard,
} from '../../../../lib/accessControl';

export async function GET(req) {
  const auth = authorizeAccessControlRequest(req, 'view');
  if (!auth.authorized) return Response.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const zone = new URL(req.url).searchParams.get('zone') || 'ALL';
    const dashboard = await getAccessControlDashboard({
      zone,
      simulatedOnly: Boolean(auth.user.isDemo),
      includeSensitive: auth.user.role === 'SYSTEM_ADMIN',
    });
    return Response.json({
      success: true,
      dashboard,
      permissions: { canManage: auth.user.role === 'SYSTEM_ADMIN' },
    });
  } catch (error) {
    return accessControlErrorResponse(error);
  }
}
