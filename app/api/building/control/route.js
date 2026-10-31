import { NextResponse } from 'next/server';
import { approvedGateways } from '../../../../lib/buildingManagement';
import { authorizeRole } from '../../../../lib/auth';

const controlRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER'];

export async function GET(req) {
  const auth = authorizeRole(req, controlRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized facilities staff must sign in.' }, { status: auth.status });
  try {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      safetyPolicy: {
        philosophy: 'MONITORING_FIRST',
        rules: [
          'Verified hardware integration required for all field buses.',
          'Authorized operator permissions (SYSTEM_ADMIN or VENUE_MANAGER).',
          'Appropriate interlocks and closed-loop feedback.',
          'Physical manual override switch verification (must be in REMOTE mode).',
          'Safe failure behavior (Fail-safe state documented and active).',
          'Manufacturer and engineering approval sign-off.',
          'Never issue unverified commands to electrical, water, HVAC or life-safety equipment.',
        ],
      },
      gateways: approvedGateways.map((g) => ({
        id: g.id,
        name: g.name,
        protocol: g.protocol,
        status: g.status,
        subsystem: g.subsystem,
        localManualOverrideSwitch: g.localManualOverrideSwitch,
        failSafeMode: g.failSafeMode,
        interlockCapable: g.interlockCapable,
        isSimulated: true,
      })),
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, controlRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized facilities staff must sign in.' }, { status: auth.status });
  return NextResponse.json({
    success: false,
    safetyBlocked: true,
    message: 'Physical control is disabled because no verified hardware adapter is connected. No command was sent.',
  }, { status: 503 });
}
