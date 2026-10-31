import { NextResponse } from 'next/server';
import { authorizeFacilityAccess } from '../../../../lib/facilities';
import { prisma } from '../../../../lib/prisma';

const facilityRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'FINANCE_OFFICER', 'REPORT_VIEWER'];

export async function GET(req, { params }) {
  const { facilityId } = await params;
  const auth = await authorizeFacilityAccess(req, facilityId, facilityRoles);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: auth.status });
  }
  if (!process.env.DATABASE_URL || !prisma?.facility) {
    return NextResponse.json({ success: false, message: 'Persistent facility metrics are unavailable.' }, { status: 503 });
  }

  try {
    const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
    if (!facility) return NextResponse.json({ success: false, message: 'Facility not found.' }, { status: 404 });

    const since24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [
      events,
      upcomingEvents,
      paidBookings,
      successfulPayments,
      verifiedEntries24h,
      staffAccreditations,
      registeredIoTDevices,
      reportingIoTDevices,
      registeredAssets,
      maintenanceRequired,
      activeSecurityAlerts,
      securityIncidents,
      accessPoints,
      networkDevices,
      latestGuestWifiAggregate,
    ] = await Promise.all([
      prisma.event.count({ where: { facilityId, status: 'PUBLISHED' } }),
      prisma.event.findMany({
        where: { facilityId, status: 'PUBLISHED', startDate: { gte: new Date() } },
        select: { id: true, title: true, startDate: true, venue: true, status: true },
        orderBy: { startDate: 'asc' },
        take: 5,
      }),
      prisma.booking.count({ where: { event: { facilityId }, bookingStatus: 'CONFIRMED', payments: { some: { status: 'SUCCESSFUL' } } } }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESSFUL', OR: [{ booking: { event: { facilityId } } }, { order: { event: { facilityId } } }] },
        _sum: { amount: true },
      }),
      prisma.gateLog.count({
        where: {
          validationStatus: 'APPROVED',
          scannedAt: { gte: since24Hours },
          ticket: { event: { facilityId }, booking: { bookingStatus: 'CONFIRMED', payments: { some: { status: 'SUCCESSFUL' } } } },
        },
      }),
      prisma.staffAccreditation.count({ where: { facilityId } }),
      prisma.ioTDevice.count({ where: { facilityId } }),
      prisma.ioTTelemetry.findMany({
        where: { device: { facilityId }, isSimulated: false, timestamp: { gte: since24Hours } },
        distinct: ['deviceId'],
        select: { deviceId: true },
      }),
      prisma.hardwareAsset.count({ where: { facilityId } }),
      prisma.hardwareAsset.count({ where: { facilityId, maintenanceStatus: 'REQUIRED' } }),
      prisma.securityAlert.count({ where: { facilityId, status: 'ACTIVE' } }),
      prisma.securityIncident.count({ where: { facilityId, status: { in: ['OPEN', 'INVESTIGATING'] } } }),
      prisma.accessControlPoint.count({ where: { facilityId } }),
      prisma.networkInfrastructureDevice.count({ where: { facilityId } }),
      prisma.wifiUsageAggregate.findFirst({
        where: { facilityId, isSimulated: false, source: { not: 'SIMULATED' } },
        orderBy: { windowStart: 'desc' },
        select: { connectedDevices: true, sessions: true, totalDataMb: true, windowStart: true, source: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      facility,
      metrics: {
        eventRecords: events,
        upcomingEvents,
        paidBookings,
        verifiedTicketRevenueKes: successfulPayments._sum.amount || 0,
        verifiedEntries24h,
        staffAccreditations,
        registeredIoTDevices,
        reportingIoTDevices24h: reportingIoTDevices.length,
        registeredAssets,
        maintenanceRequired,
        activeSecurityAlerts,
        openSecurityIncidents: securityIncidents,
        registeredAccessPoints: accessPoints,
        registeredNetworkDevices: networkDevices,
        guestWifiAggregate: latestGuestWifiAggregate,
      },
      dataMode: 'DATABASE_RECORDS',
      isSimulated: false,
      notes: [
        'Counts describe records associated with this facility; they do not prove physical installation or independent connectivity.',
        'Attendance counts include only successful payment-backed tickets with approved gate records.',
        'Guest Wi-Fi usage is shown only when a non-simulated aggregate is recorded.',
      ],
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Facility dashboard query failed]', error);
    return NextResponse.json({ success: false, message: 'Facility dashboard data could not be loaded.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
