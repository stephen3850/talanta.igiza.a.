import { NextResponse } from 'next/server';
import {
  predictEventAttendance,
  predictGateCongestion,
  generatePredictiveMaintenanceAdvisory,
  generateTicketDemandInsights,
  modelMetadata
} from '../../../../lib/aiEngine';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeRole } from '../../../../lib/auth';

const forecastRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'EVENT_MANAGER', 'REPORT_VIEWER'];

export async function GET(req) {
  const auth = authorizeRole(req, forecastRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized staff must sign in to view operational forecasts.' }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId') || 'EVT-001';

  try {
    const attendanceForecast = predictEventAttendance(eventId);
    const gateCongestionPredictions = predictGateCongestion();
    const predictiveMaintenance = generatePredictiveMaintenanceAdvisory();
    const ticketDemandInsights = generateTicketDemandInsights();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      modelMetadata,
      attendanceForecast,
      gateCongestionPredictions,
      predictiveMaintenance,
      ticketDemandInsights,
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'EVENT_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized event managers must sign in to run a scenario.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { eventId = 'EVT-001', customSalesBoost = 0 } = body;
    const salesBoost = Number(customSalesBoost);
    if (!Number.isFinite(salesBoost) || Math.abs(salesBoost) > 1000000) {
      return NextResponse.json({ success: false, message: 'Scenario adjustment is outside the supported numeric range.' }, { status: 400 });
    }

    const baseForecast = predictEventAttendance(eventId);
    const simulatedAttendance = Math.max(0, baseForecast.forecastAttendance + salesBoost);

    await logAuditEvent({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'AI_SCENARIO_SIMULATION_RUN',
      entityType: 'AI_MODEL',
      entityId: modelMetadata.modelName,
      details: `Ran an explicitly simulated attendance scenario for event ${eventId}.`,
    });

    return NextResponse.json({
      success: true,
      simulatedAttendance,
      baseForecast,
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
