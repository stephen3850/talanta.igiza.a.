import { NextResponse } from 'next/server';
import { authorizeRole } from '../../../../lib/auth';

const parkingRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'PARKING_OPERATOR'];

export async function POST(req) {
  const auth = authorizeRole(req, parkingRoles);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized parking staff must sign in.' }, { status: auth.status });
  }

  return NextResponse.json({
    success: false,
    status: 'INTEGRATION_DISCONNECTED',
    message: 'Parking barrier control is not connected to verified hardware. No vehicle entry or exit was authorized.',
  }, { status: 503 });
}
