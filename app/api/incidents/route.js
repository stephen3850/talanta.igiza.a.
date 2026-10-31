import { NextResponse } from 'next/server';
import {
  getAllIncidents,
  createIncidentRecord,
  calculateIncidentMetrics,
  responseTeams,
  INCIDENT_CATEGORIES,
  INCIDENT_STATUSES,
  INCIDENT_PRIORITIES,
} from '../../../lib/incidentManagement';
import { authorizeRole } from '../../../lib/auth';

const incidentRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'SECURITY_OPERATOR', 'MEDICAL_OPERATOR'];

export async function GET(req) {
  const auth = authorizeRole(req, incidentRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized incident staff must sign in.' }, { status: auth.status });
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const priority = searchParams.get('priority') || 'ALL';
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';

    const incidents = getAllIncidents({ status, priority, category, search });
    const metrics = calculateIncidentMetrics();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
      categories: INCIDENT_CATEGORIES,
      statuses: INCIDENT_STATUSES,
      priorities: INCIDENT_PRIORITIES,
      responseTeams,
      count: incidents.length,
      incidents: incidents.map((incident) => ({ ...incident, isSimulated: true })),
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, incidentRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized incident staff must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const {
      category,
      title,
      description,
      zoneLocation,
      eventReference,
      priority,
      assignedTeamId,
      initialNote,
    } = body;

    if (!category || !title || !description || !zoneLocation) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required incident fields: category, title, description, and zoneLocation are mandatory.',
        },
        { status: 400 }
      );
    }

    const incident = await createIncidentRecord({
      category,
      title,
      description,
      zoneLocation,
      eventReference,
      priority,
      reportedByName: auth.user.fullName || auth.user.email,
      reportedByRole: auth.user.role,
      reportedByContact: auth.user.email,
      assignedTeamId,
      initialNote,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Simulated incident record ${incident.id} created.`,
        incident: { ...incident, isSimulated: true },
        dataMode: 'SIMULATED',
        isSimulated: true,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
