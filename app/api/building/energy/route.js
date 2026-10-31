import { NextResponse } from 'next/server';
import {
  energyMetersData,
  energyZones,
  energyIntradayHourlyProfile,
  energyAlerts,
  simulateTelemetryCycle,
} from '../../../../lib/buildingManagement';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeRole } from '../../../../lib/auth';

const facilitiesRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER'];

export async function GET(req) {
  const auth = authorizeRole(req, facilitiesRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized facilities staff must sign in.' }, { status: auth.status });
  try {
    const totalPowerKw = energyMetersData.reduce((sum, m) => sum + m.currentPowerKw, 0);
    const totalDailyKwh = energyMetersData.reduce((sum, m) => sum + m.dailyConsumptionKwh, 0);
    const peakPowerKw = Math.max(...energyMetersData.map((m) => m.peakPowerKw));
    const gridCapacityKw = 2500; // Substation Alpha & Beta combined 2.5 MW design limit
    const loadHeadroomKw = gridCapacityKw - totalPowerKw;

    // Power quality & 3-phase balance check
    const avgVoltage = (
      energyMetersData.reduce((sum, m) => sum + m.voltageV, 0) / energyMetersData.length
    ).toFixed(1);
    const avgPowerFactor = (
      energyMetersData.reduce((sum, m) => sum + m.powerFactor, 0) / energyMetersData.length
    ).toFixed(2);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      isSimulated: true,
      summary: {
        totalPowerKw: Math.round(totalPowerKw * 10) / 10,
        totalDailyKwh,
        peakPowerKw,
        peakRecordedAt: '2026-10-30T14:45:00.000Z',
        gridCapacityKw,
        loadHeadroomKw: Math.round(loadHeadroomKw * 10) / 10,
        gridFrequencyHz: 50.01,
        avgVoltageV: Number(avgVoltage),
        avgPowerFactor: Number(avgPowerFactor),
        substationStatus: 'STABLE_ONLINE',
      },
      zones: energyZones,
      meters: energyMetersData,
      trends: {
        intradayHourlyProfile: energyIntradayHourlyProfile,
      },
      historicalComparisons: {
        todayVsYesterdayPct: -4.2, // 4.2% lower today due to LED dimming optimization
        currentMatchVsLastMatchPct: -2.8,
        monthOverMonthPct: -6.5,
        targetVarianceKwh: -420,
      },
      alerts: energyAlerts,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, facilitiesRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized facilities staff must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { action, meterId, telemetry, alertId } = body;

    // Acknowledge alert
    if (action === 'ACKNOWLEDGE_ALERT') {
      const alert = energyAlerts.find((a) => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        await logAuditEvent({
          userId: auth.user.id,
          action: 'ENERGY_ALERT_ACKNOWLEDGED',
          entityType: 'ENERGY_ALERT',
          entityId: alertId,
          details: { alertId, meterId: alert.meterId },
        });
        return NextResponse.json({ success: true, message: `Alert ${alertId} acknowledged.` });
      }
      return NextResponse.json({ success: false, message: 'Alert not found' }, { status: 404 });
    }

    // Ingest or simulate meter telemetry
    if (action === 'INGEST_TELEMETRY' || action === 'SIMULATE_READINGS') {
      simulateTelemetryCycle();
      await logAuditEvent({
        userId: auth.user.id,
        action: 'ENERGY_TELEMETRY_INGESTED',
        entityType: 'ENERGY_METER',
        entityId: meterId || 'ALL_METERS',
        details: { action, isSimulated: true },
      });
      return NextResponse.json({
        success: true,
        message: 'Energy telemetry ingested and meters updated.',
        isSimulated: true,
      });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
