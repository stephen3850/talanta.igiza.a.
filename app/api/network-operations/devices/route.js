import { NextResponse } from 'next/server';
import {
  getAllDevices,
  registerDevice,
  calculateNocMetrics,
  DEVICE_CATEGORIES,
  MONITORING_PROTOCOLS,
} from '../../../../lib/networkOperations';
import { authorizeNetworkRequest, networkErrorResponse, readNetworkJson, recordNetworkAccess } from '../../../../lib/networkManagement';

export async function GET(req) {
  const auth = authorizeNetworkRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';

    const devices = getAllDevices({ status, category, search });
    const metrics = calculateNocMetrics();

    await recordNetworkAccess({ user: auth.user, action: 'NOC_DEVICE_INVENTORY_VIEWED', req });
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
      categories: DEVICE_CATEGORIES,
      protocols: MONITORING_PROTOCOLS,
      count: devices.length,
      devices,
    });
  } catch (err) {
    return networkErrorResponse(err);
  }
}

export async function POST(req) {
  const auth = authorizeNetworkRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const body = await readNetworkJson(req);
    const { name, category, ipAddress, location, vendorModel, protocol } = body;

    if (!name || !ipAddress) {
      return NextResponse.json(
        { success: false, message: 'Device name and IP address are mandatory.' },
        { status: 400 }
      );
    }

    const device = await registerDevice({
      name,
      category,
      ipAddress,
      location,
      vendorModel,
      protocol,
      currentUser: auth.user,
    });

    await recordNetworkAccess({ user: auth.user, action: 'NOC_DEVICE_REGISTERED', entityId: device.id, req });
    return NextResponse.json(
      {
        success: true,
        message: `Network device ${device.id} registered in NOC inventory.`,
        device,
      },
      { status: 201 }
    );
  } catch (err) {
    return networkErrorResponse(err);
  }
}
