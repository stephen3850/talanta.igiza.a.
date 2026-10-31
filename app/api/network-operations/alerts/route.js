import { NextResponse } from 'next/server';
import {
  getAllAlerts,
  acknowledgeAlert,
  resolveAlert,
  NOC_ALERT_SEVERITIES,
} from '../../../../lib/networkOperations';
import { authorizeNetworkRequest, networkErrorResponse, readNetworkJson, recordNetworkAccess } from '../../../../lib/networkManagement';

export async function GET(req) {
  const auth = authorizeNetworkRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const severity = searchParams.get('severity') || 'ALL';
    const search = searchParams.get('search') || '';

    const alerts = getAllAlerts({ status, severity, search });

    await recordNetworkAccess({ user: auth.user, action: 'NOC_ALERTS_VIEWED', req });
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      severities: NOC_ALERT_SEVERITIES,
      count: alerts.length,
      alerts,
    });
  } catch (err) {
    return networkErrorResponse(err);
  }
}

export async function PATCH(req) {
  const auth = authorizeNetworkRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const body = await readNetworkJson(req);
    const { alertId, action, resolutionNote } = body;
    const currentUser = auth.user;

    if (!alertId || !action) {
      return NextResponse.json({ success: false, message: 'alertId and action (ACKNOWLEDGE / RESOLVE) are required.' }, { status: 400 });
    }

    if (action === 'ACKNOWLEDGE') {
      const result = await acknowledgeAlert({ alertId, currentUser });
      if (!result.success) return NextResponse.json({ success: false, message: result.message }, { status: 400 });
      await recordNetworkAccess({ user: auth.user, action: 'NOC_ALERT_ACKNOWLEDGED', entityId: alertId, req });
      return NextResponse.json({ success: true, message: `Alert ${alertId} acknowledged.`, alert: result.alert });
    }

    if (action === 'RESOLVE') {
      const result = await resolveAlert({ alertId, resolutionNote, currentUser });
      if (!result.success) return NextResponse.json({ success: false, message: result.message }, { status: 400 });
      await recordNetworkAccess({ user: auth.user, action: 'NOC_ALERT_RESOLVED', entityId: alertId, req });
      return NextResponse.json({ success: true, message: `Alert ${alertId} resolved.`, alert: result.alert });
    }

    return NextResponse.json({ success: false, message: 'Invalid action.' }, { status: 400 });
  } catch (err) {
    return networkErrorResponse(err);
  }
}
