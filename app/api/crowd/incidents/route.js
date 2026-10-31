import { NextResponse } from 'next/server';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeRole } from '../../../../lib/auth';

const crowdRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'SECURITY_OPERATOR', 'GATE_OPERATOR'];

export const initialIncidents = [
  {
    id: 'INC-2026-101',
    classification: 'CONGESTION_BOTTLENECK',
    location: 'Gate B Concourse Turnstile Lane 4',
    severity: 'WARNING',
    assignedUnit: 'G4S Crowd Management Unit 2',
    description: 'High crowd accumulation at Gate B Lower Concourse during peak pre-match arrival window.',
    responseStatus: 'IN_PROGRESS', // IN_PROGRESS, RESOLVED, ESCALATED_TIER2
    reportedAt: '2026-10-30T10:05:00.000Z',
    resolvedAt: null,
  },
  {
    id: 'INC-2026-102',
    classification: 'MEDICAL',
    location: 'Zone A Upper Deck Block 104 Row 12',
    severity: 'URGENT',
    assignedUnit: 'St John Ambulance First Aid Response Unit Alpha',
    description: 'Spectator heat exhaustion requiring medical evaluation and hydration assistance.',
    responseStatus: 'RESOLVED',
    reportedAt: '2026-10-30T09:40:00.000Z',
    resolvedAt: '2026-10-30T09:52:00.000Z',
  },
];

export async function GET(req) {
  const auth = authorizeRole(req, crowdRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized crowd-operations staff must sign in.' }, { status: auth.status });
  try {
    return NextResponse.json({
      success: true,
      count: initialIncidents.length,
      incidents: initialIncidents.map((incident) => ({ ...incident, isSimulated: true })),
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, crowdRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized crowd-operations staff must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const {
      classification = 'CONGESTION_BOTTLENECK',
      location,
      severity = 'WARNING',
      assignedUnit = 'Venue Safety Steward Unit',
      description,
    } = body;

    if (!location || !description) {
      return NextResponse.json(
        { success: false, message: 'Incident location and description are required.' },
        { status: 400 }
      );
    }

    const newIncident = {
      id: `INC-2026-${Math.floor(Math.random() * 900 + 100)}`,
      classification,
      location,
      severity,
      assignedUnit,
      description,
      responseStatus: 'IN_PROGRESS',
      reportedAt: new Date().toISOString(),
      resolvedAt: null,
    };

    initialIncidents.unshift(newIncident);

    await logAuditEvent({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'SAFETY_INCIDENT_REGISTERED',
      entityType: 'SAFETY_INCIDENT',
      entityId: newIncident.id,
      details: `Registered ${severity} incident (${classification}) at ${location}: ${description}`,
    });

    return NextResponse.json({ success: true, incident: { ...newIncident, isSimulated: true }, dataMode: 'SIMULATED', isSimulated: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = authorizeRole(req, crowdRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized crowd-operations staff must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { id, responseStatus } = body;

    const incident = initialIncidents.find((i) => i.id === id);
    if (!incident) {
      return NextResponse.json({ success: false, message: 'Incident record not found' }, { status: 404 });
    }

    if (responseStatus) {
      incident.responseStatus = responseStatus;
      if (responseStatus === 'RESOLVED') {
        incident.resolvedAt = new Date().toISOString();
      }
    }

    await logAuditEvent({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'SAFETY_INCIDENT_STATUS_UPDATED',
      entityType: 'SAFETY_INCIDENT',
      entityId: incident.id,
      details: `Updated incident ${incident.id} status to ${responseStatus}`,
    });

    return NextResponse.json({ success: true, incident: { ...incident, isSimulated: true }, dataMode: 'SIMULATED', isSimulated: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
