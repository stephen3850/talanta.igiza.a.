import { NextResponse } from 'next/server';
import { runAssetMaintenanceDiagnostics } from '../../../../lib/assetMaintenance';
import { authorizeRole } from '../../../../lib/auth';

const maintenanceRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER'];

export async function GET(req) {
  const auth = authorizeRole(req, maintenanceRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized maintenance staff must sign in.' }, { status: auth.status });
  try {
    const diagnostics = await runAssetMaintenanceDiagnostics();
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
  const auth = authorizeRole(req, maintenanceRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized maintenance staff must sign in.' }, { status: auth.status });
  try {
    const diagnostics = await runAssetMaintenanceDiagnostics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
