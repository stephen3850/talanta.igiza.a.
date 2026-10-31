import { NextResponse } from 'next/server';
import { initialIoTDevices, initialIoTAlerts } from '../../../../lib/mockData';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeRole } from '../../../../lib/auth';

const iotRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'NETWORK_OPERATOR'];

export async function GET(req) {
  const auth = authorizeRole(req, iotRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized operations staff must sign in.' }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get('deviceId');

  try {
    let devices = [...initialIoTDevices];

    if (deviceId) {
      devices = devices.filter((d) => d.deviceId === deviceId);
    }

    const telemetryFeed = devices.map((d) => ({
      deviceId: d.deviceId,
      name: d.name,
      category: d.category,
      zoneLocation: d.zoneLocation,
      status: d.status,
      lastSeenAt: d.lastSeenAt,
      latestReadings: d.latestReadings || {},
    }));

    return NextResponse.json({
      success: true,
      count: telemetryFeed.length,
      telemetry: telemetryFeed,
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, iotRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized operations staff must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const {
      deviceId,
      measurementType,
      measurementValue,
      unit,
    } = body;

    if (!deviceId || !measurementType || measurementValue === undefined) {
      return NextResponse.json(
        { success: false, message: 'deviceId, measurementType, and measurementValue are required.' },
        { status: 400 }
      );
    }

    const device = initialIoTDevices.find((d) => d.deviceId === deviceId);
    if (!device) {
      return NextResponse.json({ success: false, message: 'IoT Device not found' }, { status: 404 });
    }

    // Update Device Last Seen & Latest Reading
    device.lastSeenAt = new Date().toISOString();
    device.latestReadings = {
      ...(device.latestReadings || {}),
      [measurementType]: Number(measurementValue),
    };

    // THRESHOLD EVALUATION ENGINE
    let alertGenerated = null;
    const numValue = Number(measurementValue);

    if (measurementType === 'temperature' && numValue > 35) {
      alertGenerated = {
        id: `IOT-ALT-${Date.now()}`,
        deviceId,
        severity: 'CRITICAL',
        title: 'High Temperature Threshold Exceeded',
        message: `${device.name} temperature reached ${numValue} °C (Threshold: 35 °C)`,
        thresholdValue: 35,
        actualValue: numValue,
        acknowledged: false,
        createdAt: new Date().toISOString(),
      };
    } else if (measurementType === 'co2_ppm' && numValue > 1000) {
      alertGenerated = {
        id: `IOT-ALT-${Date.now()}`,
        deviceId,
        severity: 'WARNING',
        title: 'Air Quality CO2 Threshold Exceeded',
        message: `${device.name} CO2 level reached ${numValue} ppm (Threshold: 1000 ppm)`,
        thresholdValue: 1000,
        actualValue: numValue,
        acknowledged: false,
        createdAt: new Date().toISOString(),
      };
    } else if (measurementType === 'power_kw' && numValue > 800) {
      alertGenerated = {
        id: `IOT-ALT-${Date.now()}`,
        deviceId,
        severity: 'WARNING',
        title: 'Power Load Threshold Warning',
        message: `${device.name} energy consumption reached ${numValue} kW (Threshold: 800 kW)`,
        thresholdValue: 800,
        actualValue: numValue,
        acknowledged: false,
        createdAt: new Date().toISOString(),
      };
    }

    if (alertGenerated) {
      initialIoTAlerts.unshift(alertGenerated);
    }

    await logAuditEvent({
      userId: auth.user.id,
      action: 'IOT_SIMULATED_TELEMETRY_INGESTED',
      entityType: 'IOT_DEVICE',
      entityId: deviceId,
      details: { measurementType, isSimulated: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Development simulation only; this reading is not verified physical telemetry.',
      deviceId,
      measurementType,
      measurementValue,
      unit,
      isSimulated: true,
      alertGenerated,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
