import { NextResponse } from 'next/server';
import { addTechnicianWorkLog, authorizeHelpdeskRequest, HelpdeskError } from '../../../../../../lib/helpdesk.js';

export async function POST(req, { params }) {
  try {
    const body = await req.json();
    const auth = await authorizeHelpdeskRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Technician authorization required to log work.' }, { status: auth.status });
    }

    const { id } = await params;
    const workLog = await addTechnicianWorkLog({
      ticketId: id,
      workSummary: body.workSummary,
      equipmentAction: body.equipmentAction,
      timeSpentMinutes: body.timeSpentMinutes,
    }, auth.user.id, auth.facilityId);

    return NextResponse.json({
      success: true,
      workLog,
      message: `Technician work log added (${workLog.timeSpentMinutes} mins). Equipment action: ${workLog.equipmentAction || 'None'}.`,
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof HelpdeskError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Work log submission failed.' }, { status });
  }
}
