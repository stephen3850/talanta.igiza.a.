import { NextResponse } from 'next/server';
import { approvedGateways } from '../../../../lib/buildingManagement';
import { authorizeRole } from '../../../../lib/auth';

export async function GET(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'NETWORK_OPERATOR']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized facilities staff must sign in.' }, { status: auth.status });
  try {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      gateways: approvedGateways.map((gateway) => ({ ...gateway, isSimulated: true })),
      isSimulated: true,
      hardwareRequirementsDoc: {
        networkSegmentation: 'ISA/IEC 62443 Level 2 (OT Network Isolated VLANs 40-50)',
        recommendedSwitches: 'Cisco Industrial Ethernet IE-3400 / Moxa EDS-510E',
        cablingStandard: 'Cat6A S/FTP Shielded Twisted Pair + Fiber Optic OS2 Single-Mode',
        groundingRequirement: 'Single-point instrumentation clean ground <= 1.0 Ohm',
        surgeProtection: 'Type 1 + Type 2 Surge Protective Devices (SPD) on all RS-485 and M-Bus field runs',
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
