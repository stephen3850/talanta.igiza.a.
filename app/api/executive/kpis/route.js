import { NextResponse } from 'next/server';
import { authorizeExecutiveRequest, configureExecutiveKpi, ExecutiveError } from '../../../../lib/executiveIntelligence.js';

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeExecutiveRequest(req, { write: true });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Executive leadership authorization required.' }, { status: auth.status });
    }

    const config = await configureExecutiveKpi(body, auth.user.id);
    return NextResponse.json({
      success: true,
      config,
      message: `Executive KPI ${config.kpiKey} configured with target ${config.targetValue}${config.unit}.`,
    });
  } catch (error) {
    const status = error instanceof ExecutiveError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Executive KPI configuration failed.' }, { status });
  }
}
