import { NextResponse } from 'next/server';
import { initialIoTAlerts } from '../../../../lib/mockData';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeRole } from '../../../../lib/auth';

const iotRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'NETWORK_OPERATOR'];

export async function GET(req) {
  const auth = authorizeRole(req, iotRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized operations staff must sign in.' }, { status: auth.status });
  try {
    return NextResponse.json({
      success: true,
      count: initialIoTAlerts.length,
      alerts: initialIoTAlerts,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized IoT managers must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { id, acknowledgeAll } = body;

    if (acknowledgeAll) {
      initialIoTAlerts.forEach((a) => (a.acknowledged = true));
      await logAuditEvent({
        userId: auth.user.id,
        action: 'IOT_ALERTS_ACKNOWLEDGED',
        entityType: 'IOT_ALERT',
        details: 'Acknowledged all simulated IoT alerts.',
      });
      return NextResponse.json({ success: true, message: 'All IoT alerts acknowledged' });
    }

    if (id) {
      const alert = initialIoTAlerts.find((a) => a.id === id);
      if (alert) alert.acknowledged = true;

      await logAuditEvent({
        userId: auth.user.id,
        action: 'IOT_ALERT_ACKNOWLEDGED',
        entityType: 'IOT_ALERT',
        entityId: id,
        details: `Acknowledged IoT alert ${id}`,
      });

      return NextResponse.json({ success: true, alert });
    }

    return NextResponse.json({ success: false, message: 'Alert ID required' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
