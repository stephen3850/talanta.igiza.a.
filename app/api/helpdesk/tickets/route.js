import { NextResponse } from 'next/server';
import { authorizeHelpdeskRequest, createSupportTicket, getSupportTickets, HelpdeskError } from '../../../../lib/helpdesk.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const category = searchParams.get('category');
  const priority = searchParams.get('priority');
  const status = searchParams.get('status');
  const assignedTechnicianId = searchParams.get('assignedTechnicianId');
  const search = searchParams.get('search');

  const auth = await authorizeHelpdeskRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized access required.' }, { status: auth.status });
  }

  try {
    const tickets = await getSupportTickets({
      facilityId: auth.facilityId,
      category,
      priority,
      status,
      assignedTechnicianId,
      search,
    });
    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    const status = error instanceof HelpdeskError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Support tickets list unavailable.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeHelpdeskRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Authorized access required to submit support ticket.' }, { status: auth.status });
    }

    if (!auth.facilityId) {
      return NextResponse.json({ success: false, message: 'Specify target facility ID.' }, { status: 400 });
    }

    const ticket = await createSupportTicket(body, auth.user.id, auth.facilityId);
    return NextResponse.json({
      success: true,
      ticket,
      message: `Support ticket ${ticket.ticketNumber} submitted successfully under category ${ticket.category}. Priority: ${ticket.priority}.`,
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof HelpdeskError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Support ticket submission failed.' }, { status });
  }
}
