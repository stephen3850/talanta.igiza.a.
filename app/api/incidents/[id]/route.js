import { NextResponse } from 'next/server';
import {
  getIncidentById,
  updateIncidentStatus,
  responseTeams,
  INCIDENT_STATUSES,
} from '../../../../lib/incidentManagement';
import { authorizeRole } from '../../../../lib/auth';

const incidentRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'SECURITY_OPERATOR', 'MEDICAL_OPERATOR'];

export async function GET(req, { params }) {
  const auth = authorizeRole(req, incidentRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized incident staff must sign in.' }, { status: auth.status });
  try {
    const { id } = await params;
    const incident = getIncidentById(id);

    if (!incident) {
      return NextResponse.json({ success: false, message: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      incident: { ...incident, isSimulated: true },
      responseTeams,
      statuses: INCIDENT_STATUSES,
      dataMode: 'SIMULATED',
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  const auth = authorizeRole(req, incidentRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized incident staff must sign in.' }, { status: auth.status });
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      newStatus,
      noteText,
      assignedTeamId,
      escalationDetails,
      resolutionDetails,
    } = body;

    const result = await updateIncidentStatus({
      incidentId: id,
      newStatus,
      noteText,
      assignedTeamId,
      escalationDetails,
      resolutionDetails,
      currentUser: auth.user,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Simulated incident record ${id} updated to ${newStatus}.`,
      incident: { ...result.incident, isSimulated: true },
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
