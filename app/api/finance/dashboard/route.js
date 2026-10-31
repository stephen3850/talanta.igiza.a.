import { NextResponse } from 'next/server';
import { FinanceError, authorizeFinanceRequest, filterDateRange, getFinancialReport, recordFinanceAudit } from '../../../../lib/financialManagement';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const auth = await authorizeFinanceRequest(req, { facilityId });
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized financial dashboard access is required.' }, { status: auth.status });
  try {
    const dates = filterDateRange(searchParams);
    const report = await getFinancialReport({ facilityId: auth.facilityId, ...dates });
    await prisma.$transaction((tx) => recordFinanceAudit(tx, {
      actorId: auth.user.id,
      facilityId: auth.facilityId,
      action: 'FINANCIAL_DASHBOARD_VIEWED',
      entityType: 'FINANCIAL_REPORT',
      details: `Financial dashboard accessed; mode=${report.dataMode}.`,
    }));
    return NextResponse.json({ success: true, report }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : 503;
    if (!(error instanceof FinanceError)) console.error('[Financial dashboard query failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Financial dashboard is unavailable.' }, { status });
  }
}
