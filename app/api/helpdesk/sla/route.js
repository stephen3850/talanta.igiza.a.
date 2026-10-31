import { NextResponse } from 'next/server';
import { authorizeHelpdeskRequest, configureSlaTargets, evaluateOverdueAndEscalateTickets, HelpdeskError } from '../../../../lib/helpdesk.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');

  const auth = await authorizeHelpdeskRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized access required.' }, { status: auth.status });
  }

  try {
    const result = await evaluateOverdueAndEscalateTickets({ facilityId: auth.facilityId });
    return NextResponse.json({ success: true, ...result, message: `Scanned ${result.totalScanned} tickets. Overdue: ${result.overdueCount}. Auto-escalated: ${result.autoEscalatedCount}.` });
  } catch (error) {
    const status = error instanceof HelpdeskError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'SLA evaluation failed.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeHelpdeskRequest(req, { write: true });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Helpdesk administrator authorization required to configure SLA targets.' }, { status: auth.status });
    }

    const config = await configureSlaTargets(body, auth.user.id);
    return NextResponse.json({
      success: true,
      config,
      message: `SLA targets updated for priority ${config.priority}: Response=${config.responseTargetHours}h, Resolution=${config.resolutionTargetHours}h.`,
    });
  } catch (error) {
    const status = error instanceof HelpdeskError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'SLA configuration failed.' }, { status });
  }
}
