import { NextResponse } from 'next/server';
import {
  authorizeCctvRequest, cctvErrorResponse, recordCameraAccess, readCctvBody, updateCamera,
} from '../../../../../lib/cctv';

export async function PATCH(req, { params }) {
  const auth = authorizeCctvRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const { cameraId } = await params;
    const camera = await updateCamera(cameraId, await readCctvBody(req), { simulatedOnly: Boolean(auth.user.isDemo) });
    await recordCameraAccess({ user: auth.user, action: 'CCTV_CAMERA_UPDATED', entityType: 'CAMERA', entityId: camera.cameraId, req });
    return NextResponse.json({ success: true, camera });
  } catch (error) { return cctvErrorResponse(error); }
}