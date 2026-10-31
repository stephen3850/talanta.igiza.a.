import { NextResponse } from 'next/server';
import { runVisitorAiDiagnostics } from '../../../../../lib/visitorAiAssistant';
import { authorizeRole } from '../../../../../lib/auth';

export async function GET(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Diagnostics are restricted to system administrators.' }, { status: auth.status });
  try {
    const diagnostics = await runVisitorAiDiagnostics();
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
  const auth = authorizeRole(req, ['SYSTEM_ADMIN']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Diagnostics are restricted to system administrators.' }, { status: auth.status });
  try {
    const diagnostics = await runVisitorAiDiagnostics();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnostics,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
