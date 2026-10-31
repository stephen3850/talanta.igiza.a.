import { NextResponse } from 'next/server';
import { getAllApiLogs } from '../../../../../lib/apiGateway';
import { authorizeRole } from '../../../../../lib/auth';

export async function GET(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized integration administrators must sign in.' }, { status: auth.status });
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';

    const logs = getAllApiLogs({ status, search });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: logs.length,
      logs,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
