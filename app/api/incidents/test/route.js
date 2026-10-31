import { NextResponse } from 'next/server';
import { runIncidentSystemDiagnostics } from '../../../../lib/incidentManagement';
import { authorizeRole } from '../../../../lib/auth';

const incidentRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'SECURITY_OPERATOR'];

export async function GET(req) {
  const auth = authorizeRole(req, incidentRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized incident staff must sign in.' }, { status: auth.status });
  try {
    const diagnostics = await runIncidentSystemDiagnostics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, incidentRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized incident staff must sign in.' }, { status: auth.status });
  try {
    const diagnostics = await runIncidentSystemDiagnostics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
