import { NextResponse } from 'next/server';
import {
  environmentalSensorsData,
  simulateTelemetryCycle,
} from '../../../../lib/buildingManagement';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeRole } from '../../../../lib/auth';

const facilitiesRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER'];

export async function GET(req) {
  const auth = authorizeRole(req, facilitiesRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized facilities staff must sign in.' }, { status: auth.status });
  try {
    const pitchSensors = environmentalSensorsData.filter((s) => s.zone === 'Pitch Surface');
    const avgPitchTemp = (
      pitchSensors.reduce((sum, s) => sum + s.temperatureC, 0) / pitchSensors.length
    ).toFixed(1);
    const avgSoilMoisture = (
      pitchSensors.reduce((sum, s) => sum + (s.soilMoisturePercentage || 0), 0) / pitchSensors.length
    ).toFixed(0);

    const concourseSensor = environmentalSensorsData.find((s) => s.zone === 'Concourse');
    const vipSensor = environmentalSensorsData.find((s) => s.zone === 'VIP Pavilion');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      isSimulated: true,
      summary: {
        avgPitchTempC: Number(avgPitchTemp),
        avgSoilMoisturePct: Number(avgSoilMoisture),
        concourseCo2Ppm: concourseSensor?.co2Ppm || 540,
        concoursePm25Ugm3: concourseSensor?.pm25Ugm3 || 18.4,
        pitchWbgtIndexC: pitchSensors[0]?.wbgtIndexC || 22.8,
        fifaHeatStressStatus: 'GREEN_LOW_RISK',
        vipAirChangesPerHour: vipSensor?.airChangesPerHour || 6.8,
        hvacFreshAirDamperPct: vipSensor?.damperIntakePct || 65,
        environmentalQualityStatus: 'OPTIMAL_EXCELLENT',
      },
      sensors: environmentalSensorsData,
      ventilationIndicators: [
        {
          zone: 'West Stand VIP Pavilion',
          airChangesPerHour: 6.8,
          targetAch: 6.0,
          freshAirDamperPct: 65,
          fanVfdSpeedPct: 72,
          filterDeltaPa: 145,
          filterStatus: 'CLEAN_OPTIMAL',
        },
        {
          zone: 'Spectator Concourse Turnstiles',
          airChangesPerHour: 5.2,
          targetAch: 4.5,
          freshAirDamperPct: 80,
          fanVfdSpeedPct: 60,
          filterDeltaPa: 120,
          filterStatus: 'CLEAN_OPTIMAL',
        },
        {
          zone: 'Athletes Dressing Room & Medical',
          airChangesPerHour: 8.4,
          targetAch: 8.0,
          freshAirDamperPct: 75,
          fanVfdSpeedPct: 80,
          filterDeltaPa: 185,
          filterStatus: 'HEPA_FILTER_ACTIVE',
        },
        {
          zone: 'Data Center & UPS Hall',
          airChangesPerHour: 14.5,
          targetAch: 12.0,
          freshAirDamperPct: 30,
          fanVfdSpeedPct: 85,
          filterDeltaPa: 210,
          filterStatus: 'CLEAN_OPTIMAL',
        },
      ],
      environmentalAlerts: [
        {
          id: 'ENV-ALT-01',
          sensorId: 'ENV-SENS-01',
          severity: 'INFO',
          title: 'Optimal Turf Hydration Maintained',
          message: 'Soil moisture at 42% meets FIFA Quality Pro hybrid grass agronomic recommendation (38-45%).',
          timestamp: '2026-10-30T14:00:00.000Z',
        },
      ],
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
    const { action } = body;

    if (action === 'INGEST_TELEMETRY' || action === 'SIMULATE_READINGS') {
      simulateTelemetryCycle();
      await logAuditEvent({
        action: 'ENVIRONMENTAL_TELEMETRY_INGESTED',
        entityType: 'ENVIRONMENTAL_SYSTEM',
        entityId: 'ALL_SENSORS',
        details: { action, isSimulated: true },
      });
      return NextResponse.json({
        success: true,
        message: 'Environmental telemetry ingested and sensor readings updated.',
        isSimulated: true,
      });
    }

    return NextResponse.json({ success: false, message: 'Unknown action' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
