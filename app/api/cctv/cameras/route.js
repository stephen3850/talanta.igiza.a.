import { NextResponse } from 'next/server';
import {
  authorizeCctvRequest, cctvErrorResponse, recordCameraAccess, readCctvBody,
  listCameras, createCamera, summarizeCameras, CAMERA_ZONES,
} from '../../../../lib/cctv';

export async function GET(req) {
  const auth = authorizeCctvRequest(req, 'view');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const zone = new URL(req.url).searchParams.get('zone') || 'ALL';
    if (zone !== 'ALL' && !CAMERA_ZONES.includes(zone)) {
      return NextResponse.json({ success: false, message: 'Select a supported stadium zone.' }, { status: 400 });
    }
    await recordCameraAccess({ user: auth.user, action: 'CCTV_INVENTORY_VIEWED', entityType: 'CAMERA_INVENTORY', req });
    const simulatedOnly = Boolean(auth.user.isDemo);
    const cameras = await listCameras({ zone, simulatedOnly });
    return NextResponse.json({
      success: true, cameras, count: cameras.length, metrics: summarizeCameras(cameras),
      zones: CAMERA_ZONES,
      permissions: {
        canManage: ['SYSTEM_ADMIN', 'VENUE_MANAGER'].includes(auth.user.role),
        canConfigureIntegrations: auth.user.role === 'SYSTEM_ADMIN' && !simulatedOnly,
      },
    });
  } catch (error) { return cctvErrorResponse(error); }
}

export async function POST(req) {
  const auth = authorizeCctvRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const camera = await createCamera(await readCctvBody(req), { simulatedOnly: Boolean(auth.user.isDemo) });
    await recordCameraAccess({ user: auth.user, action: 'CCTV_CAMERA_REGISTERED', entityType: 'CAMERA', entityId: camera.cameraId, req });
    return NextResponse.json({ success: true, camera }, { status: 201 });
  } catch (error) { return cctvErrorResponse(error); }
}