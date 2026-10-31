import { NextResponse } from 'next/server';
import { runApiGatewayDiagnostics } from '../../../../../lib/apiGateway';
import { authorizeRole } from '../../../../../lib/auth';

function authorizeAdmin(req) {
  return authorizeRole(req, ['SYSTEM_ADMIN']);
}

export async function GET(req) {
  const auth = authorizeAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'System administrator access is required.' }, { status: auth.status });
  try {
    const diagnostics = await runApiGatewayDiagnostics();
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
  const auth = authorizeAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'System administrator access is required.' }, { status: auth.status });
  try {
    const diagnostics = await runApiGatewayDiagnostics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
