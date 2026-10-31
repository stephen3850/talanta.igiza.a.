import { NextResponse } from 'next/server';
import { authorizeRole } from '../../../../lib/auth';

const signageRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'EVENT_MANAGER', 'SECURITY_OPERATOR'];

export async function POST(req) {
  const auth = authorizeRole(req, signageRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized communications staff must sign in.' }, { status: auth.status });
  return NextResponse.json({
    success: false,
    message: 'The legacy emergency override is disabled. Use the approved emergency-communications workflow; no displays were changed.',
  }, { status: 409 });
}

export async function DELETE(req) {
  const auth = authorizeRole(req, signageRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized communications staff must sign in.' }, { status: auth.status });
  return NextResponse.json({
    success: false,
    message: 'The legacy emergency override is disabled. No display state was changed.',
  }, { status: 409 });
}
