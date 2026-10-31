import { NextResponse } from 'next/server';
import { initialIoTDevices } from '../../../../../lib/mockData';
import { logAuditEvent } from '../../../../../lib/audit';
import { authorizeRole } from '../../../../../lib/auth';
import { authorizeFacilityAccess, getRequestedFacilityId, LEGACY_FACILITY_ID } from '../../../../../lib/facilities';
import { prisma } from '../../../../../lib/prisma';

const iotRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'NETWORK_OPERATOR'];
const iotManagerRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER'];

function publicDevice(device) {
  const safeDevice = { ...device, isSimulated: true };
  delete safeDevice.apiKey;
  return safeDevice;
}

export async function GET(req, { params }) {
  const auth = authorizeRole(req, iotRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized operations staff must sign in.' }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, iotRoles);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  const { id } = await params;
  const device = process.env.DATABASE_URL && prisma?.ioTDevice
    ? await prisma.ioTDevice.findFirst({ where: { facilityId, OR: [{ id }, { deviceId: id }] } })
    : initialIoTDevices.find((d) => (d.id === id || d.deviceId === id) && (!d.facilityId || d.facilityId === LEGACY_FACILITY_ID) && facilityId === LEGACY_FACILITY_ID);

  if (!device) {
    return NextResponse.json({ success: false, message: 'IoT Device not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, device: publicDevice(device), dataMode: 'SIMULATED' });
}

export async function PUT(req, { params }) {
  const facilityId = getRequestedFacilityId(req);
  const auth = await authorizeFacilityAccess(req, facilityId, iotManagerRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized IoT managers must sign in.' }, { status: auth.status });
  try {
    const { id } = await params;
    const body = await req.json();

    if (process.env.DATABASE_URL && prisma?.ioTDevice) {
      const editableFields = ['name', 'category', 'manufacturer', 'model', 'serialNumber', 'zoneLocation', 'status'];
      const data = Object.fromEntries(editableFields.filter((field) => Object.prototype.hasOwnProperty.call(body, field)).map((field) => [field, body[field]]));
      const updated = await prisma.ioTDevice.updateMany({ where: { facilityId, OR: [{ id }, { deviceId: id }] }, data });
      if (!updated.count) return NextResponse.json({ success: false, message: 'IoT Device not found.' }, { status: 404 });
      const saved = await prisma.ioTDevice.findFirst({ where: { facilityId, OR: [{ id }, { deviceId: id }] } });
      await logAuditEvent({ userId: auth.user.id, action: 'IOT_DEVICE_UPDATED', entityType: 'IOT_DEVICE', entityId: saved.deviceId, details: `Updated IoT device inventory ${saved.deviceId} at facility ${facilityId}.` });
      return NextResponse.json({ success: true, device: publicDevice(saved), dataMode: 'DATABASE', isSimulated: false });
    }

    const deviceIndex = initialIoTDevices.findIndex((d) => (d.id === id || d.deviceId === id) && (!d.facilityId || d.facilityId === LEGACY_FACILITY_ID) && facilityId === LEGACY_FACILITY_ID);
    if (deviceIndex === -1) {
      return NextResponse.json({ success: false, message: 'IoT Device not found' }, { status: 404 });
    }

    const existing = initialIoTDevices[deviceIndex];
    const editableFields = ['name', 'category', 'manufacturer', 'model', 'serialNumber', 'zoneLocation', 'status'];
    const updated = { ...existing, updatedAt: new Date().toISOString() };
    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) updated[field] = body[field];
    }

    initialIoTDevices[deviceIndex] = updated;

    await logAuditEvent({
      userId: auth.user.id,
      action: 'IOT_DEVICE_UPDATED',
      entityType: 'IOT_DEVICE',
      entityId: updated.deviceId,
      details: `Updated IoT device ${updated.deviceId} status to ${updated.status}`,
    });

    return NextResponse.json({ success: true, device: publicDevice(updated), dataMode: 'SIMULATED' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const facilityId = getRequestedFacilityId(req);
  const auth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized IoT administrators must sign in.' }, { status: auth.status });
  try {
    const { id } = await params;
    if (process.env.DATABASE_URL && prisma?.ioTDevice) {
      const result = await prisma.ioTDevice.updateMany({ where: { facilityId, OR: [{ id }, { deviceId: id }] }, data: { status: 'DISABLED' } });
      if (!result.count) return NextResponse.json({ success: false, message: 'IoT Device not found.' }, { status: 404 });
      const saved = await prisma.ioTDevice.findFirst({ where: { facilityId, OR: [{ id }, { deviceId: id }] } });
      await logAuditEvent({ userId: auth.user.id, action: 'IOT_DEVICE_DISABLED', entityType: 'IOT_DEVICE', entityId: saved.deviceId, details: `Disabled IoT device inventory ${saved.deviceId} at facility ${facilityId}.` });
      return NextResponse.json({ success: true, message: 'IoT inventory status changed to disabled; no hardware command was sent.', device: publicDevice(saved), dataMode: 'DATABASE', isSimulated: false });
    }

    const deviceIndex = initialIoTDevices.findIndex((d) => (d.id === id || d.deviceId === id) && (!d.facilityId || d.facilityId === LEGACY_FACILITY_ID) && facilityId === LEGACY_FACILITY_ID);

    if (deviceIndex === -1) {
      return NextResponse.json({ success: false, message: 'IoT Device not found' }, { status: 404 });
    }

    const deleted = initialIoTDevices.splice(deviceIndex, 1)[0];

    await logAuditEvent({
      userId: auth.user.id,
      action: 'IOT_DEVICE_DISABLED',
      entityType: 'IOT_DEVICE',
      entityId: deleted.deviceId,
      details: `Disabled and removed IoT device ${deleted.name} (${deleted.deviceId})`,
    });

    return NextResponse.json({ success: true, message: 'Simulated IoT device record removed.', device: publicDevice(deleted), dataMode: 'SIMULATED' });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
