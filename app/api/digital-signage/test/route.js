import { NextResponse } from 'next/server';
import { runDigitalSignageDiagnostics } from '../../../../lib/digitalSignage';
import { authorizeRole } from '../../../../lib/auth';

export async function GET(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'EVENT_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized signage staff must sign in.' }, { status: auth.status });
  try {
    const diagnostics = await runDigitalSignageDiagnostics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'EVENT_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized signage staff must sign in.' }, { status: auth.status });
  try {
    const diagnostics = await runDigitalSignageDiagnostics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
