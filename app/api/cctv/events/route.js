import { NextResponse } from 'next/server';
import {
  authorizeCctvRequest, cctvErrorResponse, recordCameraAccess, readCctvBody,
  listCameraEvents, createCameraEvent,
} from '../../../../lib/cctv';

export async function GET(req) {
  const auth = authorizeCctvRequest(req, 'view');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    await recordCameraAccess({ user: auth.user, action: 'CCTV_EVENT_METADATA_VIEWED', entityType: 'CAMERA_EVENT', req });
    const events = await listCameraEvents({ simulatedOnly: Boolean(auth.user.isDemo) });
    const visibleEvents = auth.user.role === 'STEWARD'
      ? events.map(({ vmsRecordingUrl, ...event }) => event)
      : events;
    return NextResponse.json({ success: true, events: visibleEvents });
  } catch (error) { return cctvErrorResponse(error); }
}

export async function POST(req) {
  const auth = authorizeCctvRequest(req, 'manage');
  if (!auth.authorized) return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
  try {
    const event = await createCameraEvent(await readCctvBody(req), auth.user, { simulatedOnly: Boolean(auth.user.isDemo) });
    await recordCameraAccess({ user: auth.user, action: 'CCTV_EVENT_METADATA_CREATED', entityType: 'CAMERA', entityId: event.cameraId, req });
    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) { return cctvErrorResponse(error); }
}