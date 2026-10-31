import { NextResponse } from 'next/server';
import { runBuildingManagementDiagnostics } from '../../../../lib/buildingManagement';
import { authorizeRole } from '../../../../lib/auth';

export async function GET(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized facilities staff must sign in.' }, { status: auth.status });
  try {
    const diagnostics = await runBuildingManagementDiagnostics();
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
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized facilities staff must sign in.' }, { status: auth.status });
  try {
    const diagnostics = await runBuildingManagementDiagnostics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
