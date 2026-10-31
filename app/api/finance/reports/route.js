import { NextResponse } from 'next/server';
import { authorizeFinanceRequest, filterDateRange, FinanceError, getFinancialReport, recordFinanceAudit, toCsvCell } from '../../../../lib/financialManagement';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const auth = await authorizeFinanceRequest(req, { facilityId });
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized finance report access is required.' }, { status: auth.status });
  try {
    const dates = filterDateRange(searchParams);
    const report = await getFinancialReport({ facilityId: auth.facilityId, ...dates });
    await prisma.$transaction((tx) => recordFinanceAudit(tx, {
      actorId: auth.user.id,
      facilityId: auth.facilityId,
      action: 'FINANCIAL_REPORT_GENERATED',
      entityType: 'FINANCIAL_REPORT',
      details: `Format ${searchParams.get('format') || 'json'}; from=${dates.from || 'all'}; to=${dates.to || 'all'}.`,
    }));
    if (searchParams.get('format') === 'csv') {
      const rows = [
        ['Report', 'Talanta Stadium Financial Report'],
        ['Data mode', report.dataMode],
        ['Generated at', report.generatedAt],
        ['Facility scope', auth.facilityId || 'ALL_AUTHORIZED_FACILITIES'],
        ['Gross ticket revenue KES', report.totals.grossTicketRevenue],
        ['Refunds KES', report.totals.refunds],
        ['Transaction fees KES', 'Unavailable'],
        ['Other approved revenue KES', report.totals.otherRevenue],
        ['Approved adjustments KES', report.totals.approvedAdjustments],
        ['Net revenue KES', report.totals.netRevenue],
        [],
        ['Payment reference', 'Status', 'Provider reference', 'Amount', 'Currency', 'Method', 'Event', 'Facility', 'Reconciled', 'Created at'],
        ...report.transactions.map((row) => [row.paymentRef, row.status, row.providerReference || '', row.amount, row.currency, row.paymentMethod, row.eventTitle, row.facilityName, row.reconciled, row.createdAt]),
      ];
      const csv = rows.map((row) => row.map(toCsvCell).join(',')).join('\r\n');
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="talanta-financial-report-${Date.now()}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }
    return NextResponse.json({ success: true, report }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : 503;
    if (!(error instanceof FinanceError)) console.error('[Financial report generation failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Financial report could not be generated.' }, { status });
  }
}
