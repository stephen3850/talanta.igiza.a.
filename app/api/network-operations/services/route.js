import { NextResponse } from 'next/server';
import {
  getAllServices,
  registerService,
} from '../../../../lib/networkOperations';
import { authorizeNetworkRequest, networkErrorResponse, readNetworkJson, recordNetworkAccess } from '../../../../lib/networkManagement';

export async function GET(req) {
  const auth = authorizeNetworkRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const services = getAllServices();
    await recordNetworkAccess({ user: auth.user, action: 'NOC_SERVICES_VIEWED', req });
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: services.length,
      services,
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
    const { name, category, endpointUrl } = body;

    if (!name || !endpointUrl) {
      return NextResponse.json(
        { success: false, message: 'Service name and endpoint URL are mandatory.' },
        { status: 400 }
      );
    }

    const service = await registerService({ name, category, endpointUrl, currentUser: auth.user });
    await recordNetworkAccess({ user: auth.user, action: 'NOC_SERVICE_REGISTERED', entityId: service.id, req });
    return NextResponse.json(
      {
        success: true,
        message: `Application service ${service.id} added to NOC health monitoring.`,
        service,
      },
      { status: 201 }
    );
  } catch (err) {
    return networkErrorResponse(err);
  }
}
