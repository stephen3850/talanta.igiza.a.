import { NextResponse } from 'next/server';
import { initialOrders, initialEvents, initialStaffAccreditation } from '../../../lib/mockData';
import { logAuditEvent } from '../../../lib/audit';
import { authorizeRole } from '../../../lib/auth';

const reportRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FINANCE_OFFICER', 'REPORT_VIEWER'];

export async function GET(req) {
  const auth = authorizeRole(req, reportRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized report access is required.' }, { status: auth.status });
  const { searchParams } = new URL(req.url);
  const dateRange = searchParams.get('dateRange') || 'ALL';
  const eventId = searchParams.get('eventId');
  const exportFormat = searchParams.get('export'); // 'csv' or 'json'

  try {
    // 1. Event Analytics
    const eventsCreated = initialEvents.length;
    const publishedEvents = initialEvents.filter((e) => e.status === 'PUBLISHED').length;
    const completedEvents = initialEvents.filter((e) => e.status === 'COMPLETED').length;

    // 2. Financial Analytics
    const confirmedOrders = initialOrders.filter((o) => o.paymentStatus === 'PAID' || o.bookingStatus === 'CONFIRMED');
    const grossRevenueKes = confirmedOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const refundRecordsCount = initialOrders.filter((o) => o.paymentStatus === 'REFUNDED').length;
    const refundedAmountKes = initialOrders.filter((o) => o.paymentStatus === 'REFUNDED').reduce((sum, o) => sum + o.totalAmount, 0);
    const netRevenueKes = grossRevenueKes - refundedAmountKes;

    const successfulPaymentsCount = confirmedOrders.length;
    const pendingPaymentsCount = initialOrders.filter((o) => o.paymentStatus === 'PENDING').length;
    const failedPaymentsCount = initialOrders.filter((o) => o.paymentStatus === 'FAILED' || o.paymentStatus === 'CANCELLED').length;

    // 3. Ticketing Analytics
    const totalTicketsSold = confirmedOrders.reduce((sum, o) => sum + o.quantity, 0);
    const allTickets = initialOrders.flatMap((o) => o.tickets);
    const ticketsIssuedCount = allTickets.length;
    const ticketsValidatedCount = allTickets.filter((t) => t.status === 'VALIDATED' || t.status === 'USED').length;
    const ticketsRevokedCount = allTickets.filter((t) => t.status === 'REVOKED').length;

    // 4. Gate Analytics
    const gateStats = [];

    // 5. Workforce Analytics
    const registeredStaffCount = initialStaffAccreditation.length;
    const approvedStaffCount = initialStaffAccreditation.filter((s) => s.status === 'APPROVED' || s.status === 'ACTIVE').length;
    const pendingStaffCount = initialStaffAccreditation.filter((s) => s.status === 'PENDING' || s.status === 'UNDER_REVIEW').length;
    const suspendedStaffCount = initialStaffAccreditation.filter((s) => s.status === 'SUSPENDED' || s.status === 'REJECTED').length;

    // Handle CSV Export
    if (exportFormat === 'csv') {
      await logAuditEvent({
        userId: auth.user.id,
        action: 'REPORT_EXPORTED_CSV',
        entityType: 'REPORT',
        details: `Exported financial & attendance CSV report for date range ${dateRange}`,
      });

      let csvContent = 'Data Mode,Booking Reference,Customer Name,Email,Event Title,Category,Quantity,Amount KES,M-PESA Receipt,Status,Date\n';
      initialOrders.forEach((o) => {
        csvContent += `"SIMULATED","${o.bookingRef || o.orderRef}","${o.userName}","${o.userEmail}","${o.eventTitle}","${o.categoryName}",${o.quantity},${o.totalAmount},"${o.mpesaReceipt || ''}","${o.paymentStatus}","${o.createdAt}"\n`;
      });

      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="Talanta_Stadium_SIMULATED_Financial_Report_${Date.now()}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const reportData = {
      success: true,
      dataMode: 'SIMULATED',
      isSimulated: true,
      generatedAt: new Date().toISOString(),
      filters: { dateRange, eventId },
      events: {
        eventsCreated,
        publishedEvents,
        completedEvents,
      },
      financials: {
        grossRevenueKes,
        refundedAmountKes,
        netRevenueKes,
        successfulPaymentsCount,
        pendingPaymentsCount,
        failedPaymentsCount,
        refundRecordsCount,
        currency: 'KES',
      },
      ticketing: {
        totalTicketsSold,
        ticketsIssuedCount,
        ticketsValidatedCount,
        ticketsRevokedCount,
        stadiumOccupancyCount: null,
        stadiumCapacity: null,
        attendancePercentage: null,
      },
      gates: gateStats,
      workforce: {
        registeredStaffCount,
        approvedStaffCount,
        pendingStaffCount,
        suspendedStaffCount,
      },
      note: 'Development fixtures only. No live event, payment, gate, attendance, or workforce records are reported.',
    };

    return NextResponse.json(reportData, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
