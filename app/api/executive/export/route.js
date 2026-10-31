import { NextResponse } from 'next/server';
import { authorizeExecutiveRequest, ExecutiveError, exportExecutiveReport } from '../../../../lib/executiveIntelligence.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const reportingPeriod = searchParams.get('reportingPeriod') || 'LAST_30_DAYS';
  const format = searchParams.get('format') || 'download';

  const auth = await authorizeExecutiveRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized executive leadership access is required.' }, { status: auth.status });
  }

  try {
    const { dashData, reportText } = await exportExecutiveReport({
      facilityId: auth.facilityId,
      reportingPeriod,
      format,
    });

    if (format === 'download' || format === 'txt') {
      return new Response(reportText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="talanta-executive-report-${reportingPeriod.toLowerCase()}.txt"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json({ success: true, dashboard: dashData, reportText });
  } catch (error) {
    const status = error instanceof ExecutiveError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Executive report export failed.' }, { status });
  }
}
