import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { authorizeRole } from '../../../../lib/auth';

const commandRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FINANCE_OFFICER'];

export async function GET(req) {
  const auth = authorizeRole(req, commandRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized stadium staff must sign in.' }, { status: auth.status });
  if (!process.env.DATABASE_URL || !prisma) {
    return NextResponse.json({ success: false, message: 'Persistent operational data is disconnected; live metrics are unavailable.' }, { status: 503 });
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const [
      eventsPublished,
      upcomingEvents,
      paidBookings,
      verifiedPayments,
      pendingPayments,
      failedPayments,
      issuedTickets,
      verifiedEntries24h,
      activeSecurityAlerts,
      openSecurityIncidents,
      connectedIoTRecords,
      onlineIoTRecords,
      recentPhysicalTelemetry,
      registeredNetworkDevices,
      reportedNetworkDevices,
      wifiUsage,
      registeredAccessPoints,
      reportedAccessPoints,
      requiredMaintenance,
      commissionedAssets,
      latestBackup,
      latestRecoveryTest,
      cameras,
      wifiControllers,
      accessControllers,
      paSystems,
    ] = await Promise.all([
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.event.findMany({ where: { status: 'PUBLISHED', startDate: { gte: now } }, orderBy: { startDate: 'asc' }, take: 5, select: { id: true, title: true, startDate: true, venue: true } }),
      prisma.booking.count({ where: { bookingStatus: 'CONFIRMED', payments: { some: { status: 'SUCCESSFUL' } } } }),
      prisma.payment.aggregate({ where: { bookingId: { not: null }, status: 'SUCCESSFUL' }, _sum: { amount: true } }),
      prisma.payment.count({ where: { bookingId: { not: null }, status: { in: ['INITIATED', 'PENDING'] } } }),
      prisma.payment.count({ where: { bookingId: { not: null }, status: { in: ['FAILED', 'CANCELLED', 'REVERSED'] } } }),
      prisma.ticket.count({ where: { status: 'ISSUED', booking: { bookingStatus: 'CONFIRMED', payments: { some: { status: 'SUCCESSFUL' } } } } }),
      prisma.gateLog.count({ where: { validationStatus: 'APPROVED', scannedAt: { gte: dayAgo }, ticket: { booking: { bookingStatus: 'CONFIRMED', payments: { some: { status: 'SUCCESSFUL' } } } } } }),
      prisma.securityAlert.count({ where: { status: 'ACTIVE' } }),
      prisma.securityIncident.count({ where: { status: { in: ['OPEN', 'INVESTIGATING'] } } }),
      prisma.ioTDevice.count(),
      prisma.ioTDevice.count({ where: { status: 'ONLINE' } }),
      prisma.ioTTelemetry.findMany({ where: { isSimulated: false, timestamp: { gte: dayAgo } }, distinct: ['deviceId'], select: { deviceId: true } }),
      prisma.networkInfrastructureDevice.count(),
      prisma.networkInfrastructureDevice.count({ where: { isSimulated: false, statusSource: { not: 'UNVERIFIED' } } }),
      prisma.wifiUsageAggregate.findFirst({ where: { isSimulated: false, source: { not: 'SIMULATED' } }, orderBy: { windowStart: 'desc' }, select: { connectedDevices: true, sessions: true, totalDataMb: true, windowStart: true } }),
      prisma.accessControlPoint.count(),
      prisma.accessControlPoint.count({ where: { isSimulated: false, statusSource: { not: 'UNVERIFIED' } } }),
      prisma.hardwareAsset.count({ where: { maintenanceStatus: 'REQUIRED' } }),
      prisma.hardwareAsset.count({ where: { commissioningStatus: 'APPROVED' } }),
      prisma.dRBackupRecord.findFirst({ orderBy: { startedAt: 'desc' }, select: { status: true, encrypted: true, startedAt: true, completedAt: true } }),
      prisma.dRRecoveryTest.findFirst({ orderBy: { testedAt: 'desc' }, select: { status: true, testedAt: true, durationSeconds: true } }),
      prisma.vmsIntegration.findMany({ select: { providerName: true, connectionStatus: true, isSimulated: true } }),
      prisma.wirelessControllerIntegration.findMany({ select: { providerName: true, connectionStatus: true, isSimulated: true } }),
      prisma.accessControlIntegration.findMany({ select: { providerName: true, connectionStatus: true, isSimulated: true } }),
      prisma.emergencyCommunicationIntegration.findMany({ select: { providerName: true, connectionStatus: true, isSimulated: true } }),
    ]);

    const reported = (records) => records.filter((record) => !record.isSimulated && record.connectionStatus === 'CONNECTED').map((record) => record.providerName);
    const integrations = [
      { name: 'Database', status: 'AVAILABLE', evidence: 'Authenticated query succeeded.' },
      { name: 'M-PESA', status: process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET && process.env.MPESA_PASSKEY ? 'CONFIGURED_NOT_VERIFIED' : 'DISCONNECTED', evidence: 'No provider connectivity check is run by this read-only dashboard.' },
      { name: 'Ticket validation', status: 'DATABASE_BACKED', evidence: 'Counts include only successful provider payments and approved gate logs.' },
      { name: 'IoT telemetry', status: recentPhysicalTelemetry.length ? 'REPORTED' : 'NO_VERIFIED_TELEMETRY', evidence: `${recentPhysicalTelemetry.length} devices reported non-simulated telemetry during the last 24 hours.` },
      { name: 'Network monitoring', status: reportedNetworkDevices ? 'REPORTED' : 'UNVERIFIED', evidence: `${reportedNetworkDevices} non-simulated network devices have a non-default status source; connectivity is not independently tested here.` },
      { name: 'Guest Wi-Fi', status: wifiUsage ? 'AGGREGATE_REPORTED' : 'DISCONNECTED', evidence: wifiUsage ? 'Latest non-simulated aggregate record; provider source not independently verified.' : 'No non-simulated aggregate record is available.' },
      { name: 'Parking', status: 'DISCONNECTED', evidence: 'No persistent parking integration data source is available in this dashboard.' },
      { name: 'CCTV / VMS', status: reported(cameras).length ? 'REPORTED_CONNECTED' : 'UNVERIFIED', evidence: reported(cameras).length ? reported(cameras).join(', ') : 'No independently verified VMS connection.' },
      { name: 'Access control', status: reported(accessControllers).length ? 'REPORTED_CONNECTED' : 'UNVERIFIED', evidence: reported(accessControllers).length ? reported(accessControllers).join(', ') : 'No independently verified controller connection.' },
      { name: 'Public address', status: reported(paSystems).length ? 'REPORTED_CONNECTED' : 'UNVERIFIED', evidence: reported(paSystems).length ? reported(paSystems).join(', ') : 'No independently verified PA connection.' },
      { name: 'Network controllers', status: reported(wifiControllers).length ? 'REPORTED_CONNECTED' : 'UNVERIFIED', evidence: reported(wifiControllers).length ? reported(wifiControllers).join(', ') : 'No independently verified wireless controller connection.' },
      { name: 'Physical incident management', status: 'NOT_INTEGRATED', evidence: 'Only cybersecurity incidents are included in persistent summary metrics.' },
    ];

    return NextResponse.json({
      success: true,
      dataMode: 'DATABASE',
      generatedAt: now.toISOString(),
      operationalStatus: recentPhysicalTelemetry.length || reportedNetworkDevices ? 'PARTIAL_REPORTED_DATA' : 'LIMITED_NO_VERIFIED_LIVE_HARDWARE',
      metrics: {
        eventsPublished,
        paidBookings,
        verifiedTicketRevenueKes: verifiedPayments._sum.amount || 0,
        pendingPayments,
        failedPayments,
        issuedTickets,
        verifiedEntries24h,
        activeSecurityAlerts,
        openSecurityIncidents,
        registeredIoTDevices: connectedIoTRecords,
        onlineIoTRecords,
        telemetryReportingDevices24h: recentPhysicalTelemetry.length,
        registeredNetworkDevices,
        reportedNetworkDevices,
        registeredAccessPoints,
        reportedAccessPoints,
        maintenanceRequiredRecords: requiredMaintenance,
        commissioningApprovedRecords: commissionedAssets,
        wifiUsageAggregate: wifiUsage,
        latestBackup,
        latestRecoveryTest,
      },
      integrations,
      upcomingEvents,
      alerts: await prisma.securityAlert.findMany({
        where: { status: 'ACTIVE' },
        orderBy: [{ severity: 'desc' }, { lastSeenAt: 'desc' }],
        take: 10,
        select: { alertRef: true, severity: true, title: true, status: true, lastSeenAt: true, occurrenceCount: true },
      }),
      notes: [
        'Database records are reported as stored data, not independent proof of physical deployment or live connectivity.',
        'No network scans, hardware control commands, or external provider health checks are performed by this dashboard.',
        'Development fixtures are not returned as operational metrics.',
      ],
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[Command dashboard query failed]', err);
    return NextResponse.json({ success: false, message: 'Operational dashboard could not load verified database metrics.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
