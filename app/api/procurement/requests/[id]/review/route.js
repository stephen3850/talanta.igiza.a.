import { NextResponse } from 'next/server';
import { authorizeProcurementRequest, ProcurementError, reviewProcurementRequest } from '../../../../../../lib/procurement.js';

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const auth = await authorizeProcurementRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Authorized approver access required.' }, { status: auth.status });
    }

    const { id } = await params;
    const updated = await reviewProcurementRequest({
      requestId: id,
      action: body.action,
      comments: body.comments,
      nextStage: body.nextStage,
    }, auth.user.id, auth.facilityId);

    return NextResponse.json({
      success: true,
      procurementRequest: updated,
      message: `Procurement request ${updated.requestRef} review recorded (${body.action}). Current Stage: ${updated.currentStage}, Status: ${updated.status}.`,
    });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Procurement request review failed.' }, { status });
  }
}
