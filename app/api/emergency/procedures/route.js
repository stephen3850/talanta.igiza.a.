import { NextResponse } from 'next/server';
import { emergencyProcedures, emergencyContactDirectory } from '../../../../lib/incidentManagement';

export async function GET() {
  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    dataMode: 'UNCONFIGURED',
    message: 'No venue-approved emergency procedures or contact records are configured. Follow the venue authority-approved emergency plan and use verified official contact channels.',
    safetyDirective: {
      title: 'Emergency Life-Safety Operational Mandate',
      warning: 'This digital system must support, not replace, approved stadium emergency plans, emergency services, trained personnel, physical alarms or evacuation systems. Do not automatically control evacuation or life-safety equipment through unverified software commands.',
    },
    procedures: emergencyProcedures,
    contactDirectory: emergencyContactDirectory,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
