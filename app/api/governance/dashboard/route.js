import { NextResponse } from 'next/server';
import { authorizeGovernanceAdmin, getGovernanceDashboard, GovernanceError, recordGovernanceAudit } from '../../../../lib/dataGovernance';

export async function GET(req) {
  const auth = await authorizeGovernanceAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'A managed system administrator session is required.' }, { status: auth.status });
  try {
    const dashboard = await getGovernanceDashboard();
    await recordGovernanceAudit({ actorId: auth.user.id, action: 'GOVERNANCE_DASHBOARD_VIEWED', entityType: 'GOVERNANCE_DASHBOARD' });
    return NextResponse.json({ success: true, dashboard });
  } catch (error) {
    const status = error instanceof GovernanceError ? error.status : 503;
    if (!(error instanceof GovernanceError)) console.error('[Data governance dashboard failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Data governance dashboard is unavailable.' }, { status });
  }
}
