import { NextResponse } from 'next/server';
import {
  waterMetersData,
  waterZones,
  waterReservoirs,
  leakSensors,
  abnormalUsageIndicators,
  simulateTelemetryCycle,
} from '../../../../lib/buildingManagement';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeRole } from '../../../../lib/auth';

const facilitiesRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER'];

export async function GET(req) {
  const auth = authorizeRole(req, facilitiesRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized facilities staff must sign in.' }, { status: auth.status });
  try {
    const totalFlowRateLps = waterMetersData.reduce((sum, m) => sum + m.currentFlowRateLps, 0);
    const totalDailyM3 = waterMetersData.reduce((sum, m) => sum + m.dailyConsumptionM3, 0);
    const activeLeaks = leakSensors.filter((s) => s.status === 'LEAK_DETECTED' || s.moistureDetected);
    const totalReservoirStorageM3 = waterReservoirs.reduce((sum, r) => sum + r.currentVolumeM3, 0);
    const totalReservoirCapacityM3 = waterReservoirs.reduce((sum, r) => sum + r.capacityM3, 0);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      isSimulated: true,
      summary: {
        totalFlowRateLps: Math.round(totalFlowRateLps * 10) / 10,
        totalDailyM3,
        waterPressureBar: 4.25,
        leakCount: activeLeaks.length,
        totalReservoirStorageM3,
        totalReservoirCapacityM3,
        reservoirCapacityPct: Math.round((totalReservoirStorageM3 / totalReservoirCapacityM3) * 100),
        fireReserveDedicatedPct: 100,
        integrityStatus: activeLeaks.length > 0 ? 'LEAK_WARNING' : 'ALL_PIPELINES_NORMAL',
      },
      zones: waterZones,
      meters: waterMetersData,
      reservoirs: waterReservoirs,
      leakSensors,
      abnormalUsageIndicators,
      historicalComparisons: {
        dailyAverageM3: 280,
        todayVs7DayAvgPct: +7.8, // Slightly higher on matchday due to spectator attendance
        perSpectatorLiters: 4.6, // 4.6 Liters per spectator benchmark
        rainwaterUtilizationPct: 24.5,
      },
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
    const { action, sensorId, simulateLeak } = body;

    // Simulate leak trigger or clear
    if (action === 'TOGGLE_LEAK_SIMULATION') {
      const sensor = leakSensors.find((s) => s.id === sensorId) || leakSensors[0];
      if (sensor) {
        sensor.moistureDetected = simulateLeak !== undefined ? simulateLeak : !sensor.moistureDetected;
        sensor.status = sensor.moistureDetected ? 'LEAK_DETECTED' : 'NORMAL';
        sensor.acousticDbfs = sensor.moistureDetected ? -42.0 : -78.4;

        await logAuditEvent({
          action: sensor.moistureDetected ? 'LEAK_SIMULATED_TRIGGER' : 'LEAK_SIMULATED_CLEARED',
          entityType: 'WATER_LEAK_SENSOR',
          entityId: sensor.id,
          details: { sensorId: sensor.id, location: sensor.location, status: sensor.status },
        });

        return NextResponse.json({
          success: true,
          message: `Leak sensor ${sensor.id} status updated to ${sensor.status}`,
          sensor,
        });
      }
      return NextResponse.json({ success: false, message: 'Sensor not found' }, { status: 404 });
    }

    if (action === 'INGEST_TELEMETRY' || action === 'SIMULATE_READINGS') {
      simulateTelemetryCycle();
      await logAuditEvent({
        action: 'WATER_TELEMETRY_INGESTED',
        entityType: 'WATER_SYSTEM',
        entityId: 'ALL_METERS',
        details: { action, isSimulated: true },
      });
      return NextResponse.json({
        success: true,
        message: 'Water telemetry ingested and meters updated.',
        isSimulated: true,
      });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
