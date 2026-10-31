import { NextResponse } from 'next/server';
import {
  authorizeCctvRequest, cctvErrorResponse, recordCameraAccess,
  listVmsIntegrations, createVmsIntegration, VMS_PROTOCOLS, readCctvBody,
} from '../../../../lib/cctv';

export async function GET(req) {
  const auth = authorizeCctvRequest(req, 'configure');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    await recordCameraAccess({ user: auth.user, action: 'CCTV_VMS_CONFIG_VIEWED', entityType: 'VMS_INTEGRATION', req });
    return NextResponse.json({ success: true, integrations: await listVmsIntegrations(), protocols: VMS_PROTOCOLS });
  } catch (error) { return cctvErrorResponse(error); }
}

export async function POST(req) {
  const auth = authorizeCctvRequest(req, 'configure');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const integration = await createVmsIntegration(await readCctvBody(req), auth.user);
    await recordCameraAccess({ user: auth.user, action: 'CCTV_VMS_CONFIG_CREATED', entityType: 'VMS_INTEGRATION', entityId: integration.id, req });
    return NextResponse.json({ success: true, integration }, { status: 201 });
  } catch (error) { return cctvErrorResponse(error); }
}
