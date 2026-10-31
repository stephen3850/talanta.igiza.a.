import { NextResponse } from 'next/server';
import { initialIoTDevices } from '../../../../lib/mockData';
import { logAuditEvent } from '../../../../lib/audit';
import { prisma } from '../../../../lib/prisma';
import { authorizeRole } from '../../../../lib/auth';
import { authorizeFacilityAccess, getRequestedFacilityId, LEGACY_FACILITY_ID } from '../../../../lib/facilities';

const iotRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'NETWORK_OPERATOR'];

function publicDevice(device) {
  const safeDevice = { ...device, isSimulated: true };
  delete safeDevice.apiKey;
  return safeDevice;
}

export async function GET(req) {
  const auth = authorizeRole(req, iotRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized operations staff must sign in.' }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, iotRoles);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  try {
    if (process.env.DATABASE_URL && prisma?.ioTDevice) {
      const where = { facilityId };
      if (category && category !== 'ALL') where.category = category;
      if (status && status !== 'ALL') where.status = status;
      if (search) where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { deviceId: { contains: search, mode: 'insensitive' } },
        { zoneLocation: { contains: search, mode: 'insensitive' } },
        { manufacturer: { contains: search, mode: 'insensitive' } },
      ];
      const devices = await prisma.ioTDevice.findMany({ where, orderBy: { name: 'asc' }, take: 500 });
      return NextResponse.json({ success: true, count: devices.length, devices: devices.map(publicDevice), dataMode: 'DATABASE', isSimulated: false });
    }

    let list = initialIoTDevices.filter((device) => !device.facilityId || device.facilityId === LEGACY_FACILITY_ID);

    if (category && category !== 'ALL') {
      list = list.filter((d) => d.category === category);
    }

    if (status && status !== 'ALL') {
      list = list.filter((d) => d.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.deviceId.toLowerCase().includes(q) ||
          d.zoneLocation.toLowerCase().includes(q) ||
          (d.manufacturer && d.manufacturer.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      devices: list.map(publicDevice),
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const facilityId = getRequestedFacilityId(req);
  const auth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized IoT managers must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const {
      name,
      category = 'ENVIRONMENTAL',
      manufacturer = null,
      model = null,
      serialNumber,
      zoneLocation,
      gatewayId = null,
      protocol = 'HTTPS_REST',
    } = body;

    if (!name || !zoneLocation) {
      return NextResponse.json(
        { success: false, message: 'Device name and zone location are required.' },
        { status: 400 }
      );
    }

    const deviceId = `IOT-${category.substring(0, 3)}-${Math.floor(Math.random() * 900 + 100)}`;

    const newDevice = {
      id: `IOT-REC-${Date.now()}`,
      deviceId,
      name,
      category,
      manufacturer,
      model,
      serialNumber: serialNumber || null,
      zoneLocation,
      gatewayId,
      protocol,
      status: 'OFFLINE',
      installedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isSimulated: true,
      facilityId,
    };

    if (process.env.DATABASE_URL && prisma?.ioTDevice) {
      try {
        const saved = await prisma.ioTDevice.create({
          data: {
            deviceId: newDevice.deviceId,
            name: newDevice.name,
            category: newDevice.category,
            manufacturer: newDevice.manufacturer,
            model: newDevice.model,
            serialNumber: newDevice.serialNumber,
            zoneLocation: newDevice.zoneLocation,
            gatewayId: newDevice.gatewayId,
            protocol: newDevice.protocol,
            status: 'OFFLINE',
            apiKey: null,
            facilityId,
          },
        });
        await logAuditEvent({
          userId: auth.user.id,
          action: 'IOT_DEVICE_REGISTERED',
          entityType: 'IOT_DEVICE',
          entityId: saved.deviceId,
          details: `Created IoT inventory record ${saved.name} at facility ${facilityId}; physical connectivity is unverified.`,
        });
        return NextResponse.json({
          success: true,
          message: 'Inventory record created; device connectivity has not been verified.',
          device: publicDevice(saved),
          dataMode: 'DATABASE',
          isSimulated: false,
        }, { status: 201 });
      } catch (dbErr) {
        console.error('[Prisma IoT device create failed]', dbErr);
        return NextResponse.json({ success: false, message: 'IoT inventory record could not be saved.' }, { status: 503 });
      }
    }
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ success: false, message: 'Persistent IoT inventory is not configured.' }, { status: 503 });
    }

    initialIoTDevices.unshift(newDevice);
    await logAuditEvent({
      userId: auth.user.id,
      action: 'IOT_DEVICE_REGISTERED',
      entityType: 'IOT_DEVICE',
      entityId: newDevice.deviceId,
      details: `Created simulated IoT inventory record ${newDevice.name} (${deviceId}) at ${zoneLocation}.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Development record only; device is offline and no integration credential was issued.',
      device: publicDevice(newDevice),
      dataMode: 'SIMULATED',
      isSimulated: true,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
