import { NextResponse } from 'next/server';
import { authorizeHelpdeskRequest, HelpdeskError, updateTicketStatus } from '../../../../../../lib/helpdesk.js';

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const auth = await authorizeHelpdeskRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Technician or helpdesk agent authorization required.' }, { status: auth.status });
    }

    const { id } = await params;
    const ticket = await updateTicketStatus({
      ticketId: id,
      status: body.status,
      assignedTechnicianId: body.assignedTechnicianId,
      assignedTechnicianName: body.assignedTechnicianName,
      resolutionNotes: body.resolutionNotes,
      resolutionArticleId: body.resolutionArticleId,
      escalationReason: body.escalationReason,
    }, auth.user.id, auth.facilityId);

    return NextResponse.json({
      success: true,
      ticket,
      message: `Support ticket ${ticket.ticketNumber} updated to status ${ticket.status}.`,
    });
  } catch (error) {
    const status = error instanceof HelpdeskError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Support ticket update failed.' }, { status });
  }
}
