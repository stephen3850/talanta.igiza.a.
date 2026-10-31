import { NextResponse } from 'next/server';
import {
  getAllClients,
  registerClient,
  rotateClientSecret,
  calculateGatewayMetrics,
  ALLOWED_API_SCOPES,
} from '../../../../../lib/apiGateway';
import { authorizeRole } from '../../../../../lib/auth';

function authorizeAdmin(req) {
  return authorizeRole(req, ['SYSTEM_ADMIN']);
}

export async function GET(req) {
  const auth = authorizeAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'System administrator access is required.' }, { status: auth.status });
  try {
    const clients = getAllClients();
    const metrics = calculateGatewayMetrics();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
      allowedScopes: ALLOWED_API_SCOPES,
      count: clients.length,
      clients,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'System administrator access is required.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { clientName, organization, scopes, rateLimitReqPerMin } = body;

    if (!clientName || !organization) {
      return NextResponse.json(
        { success: false, message: 'clientName and organization are mandatory.' },
        { status: 400 }
      );
    }

    const { newClient, rawKey } = await registerClient({
      clientName,
      organization,
      scopes,
      rateLimitReqPerMin,
      currentUser: auth.user,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Client ${newClient.id} registered. IMPORTANT: Private API Key is displayed once below. Copy it now; it will be masked on subsequent views.`,
        client: newClient,
        unmaskedApiKey: rawKey,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = authorizeAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'System administrator access is required.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { clientId } = body;

    if (!clientId) {
      return NextResponse.json({ success: false, message: 'clientId is required for key rotation.' }, { status: 400 });
    }

    const result = await rotateClientSecret({ clientId, currentUser: auth.user });
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `API Key rotated for client ${clientId}. Copy the new unmasked API key below.`,
      client: result.client,
      newUnmaskedApiKey: result.newRawKey,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
