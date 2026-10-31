import { NextResponse } from 'next/server';
import { initialIncidents } from '../../../../lib/incidentManagement';
import { authorizeRole } from '../../../../lib/auth';

const incidentRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'SECURITY_OPERATOR', 'MEDICAL_OPERATOR'];

export async function GET(req) {
  const auth = authorizeRole(req, incidentRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized incident staff must sign in.' }, { status: auth.status });
  try {
    const allLogs = [];
    initialIncidents.forEach((inc) => {
      if (inc.communicationLogs) allLogs.push(...inc.communicationLogs);
    });
    const simulatedLogs = allLogs.map(({ message, ...record }) => ({
      ...record,
      messagePreview: typeof message === 'string' ? message.slice(0, 80) : record.messagePreview,
      deliveryStatus: 'SIMULATED_NOT_SENT',
      isSimulated: true,
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      channels: ['SMS', 'SMS_AND_RADIO', 'PUSH_NOTIFICATION', 'EMAIL_BROADCAST'],
      recipientGroups: [
        { id: 'STADIUM_SECURITY', name: 'Security responders (unconfigured)' },
        { id: 'MEDICAL_TEAMS', name: 'Medical responders (unconfigured)' },
        { id: 'FACILITIES_PERSONNEL', name: 'Facilities responders (unconfigured)' },
        { id: 'EVENT_OPERATIONS', name: 'Event operations (unconfigured)' },
        { id: 'MANAGEMENT', name: 'Management (unconfigured)' },
      ],
      logs: simulatedLogs,
      deliveryStatus: 'NOT_CONNECTED',
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
  return NextResponse.json({
    success: false,
    message: 'This legacy dispatcher has no verified delivery provider. Use the approved emergency-communications workflow; no notification was sent.',
  }, { status: 503 });
}
