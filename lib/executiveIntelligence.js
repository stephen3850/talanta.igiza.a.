import crypto from 'crypto';
import { canonicalRole } from './auth.js';
import { authorizeManagedUser } from './iam.js';
import { getRequestedFacilityId } from './facilities.js';
import facilityPolicy from './facilityPolicy.cjs';
import { predictEventAttendance, predictGateCongestion, generatePredictiveMaintenanceAdvisory, generateTicketDemandInsights } from './aiEngine.js';
import { prisma } from './prisma.js';

const EXECUTIVE_ROLES = [
  'SYSTEM_ADMIN',
  'STADIUM_ADMINISTRATOR',
  'VENUE_MANAGER',
  'FINANCE_OFFICER',
  'OPERATIONS_MANAGER',
];

const DEFAULT_KPI_TARGETS = [
  { kpiKey: 'STADIUM_OCCUPANCY_RATE', label: 'Stadium Attendance Occupancy Rate', targetValue: 85, unit: '%', category: 'EVENT_OPERATIONS' },
  { kpiKey: 'PAYMENT_RECONCILIATION_RATE', label: 'M-PESA Payment Reconciliation Rate', targetValue: 98, unit: '%', category: 'FINANCIAL' },
  { kpiKey: 'EQUIPMENT_AVAILABILITY_RATE', label: 'Hardware & Asset Availability Rate', targetValue: 95, unit: '%', category: 'INFRASTRUCTURE' },
  { kpiKey: 'NETWORK_UPTIME_RATE', label: 'NOC & Network Device Uptime', targetValue: 99.5, unit: '%', category: 'IT_NETWORK' },
  { kpiKey: 'HELPDESK_SLA_COMPLIANCE', label: 'Helpdesk SLA Resolution Compliance', targetValue: 90, unit: '%', category: 'SERVICE_SUPPORT' },
  { kpiKey: 'GATE_SCAN_VELOCITY', label: 'Peak Gate Scan Processing Velocity', targetValue: 400, unit: 'scans/min', category: 'GATE_OPERATIONS' },
];

export class ExecutiveError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ExecutiveError';
    this.status = status;
  }
}

function requireModels(...models) {
  if (!process.env.DATABASE_URL || models.some((model) => !prisma?.[model])) {
    throw new ExecutiveError('Executive intelligence schema unavailable; run prisma generate.', 503);
  }
}

export async function authorizeExecutiveRequest(req, { write = false, facilityId = null } = {}) {
  const auth = await authorizeManagedUser(req, EXECUTIVE_ROLES);
  if (!auth.authorized) return auth;

  const role = canonicalRole(auth.user.role);
  if (role === 'SYSTEM_ADMIN' && !facilityId) {
    return { ...auth, facilityId: null, isEnterpriseAdmin: true };
  }

  const requestedFacilityId = facilityId || getRequestedFacilityId(req);
  if (role === 'SYSTEM_ADMIN') {
    try {
      const facility = await prisma.facility.findUnique({ where: { id: requestedFacilityId }, select: { id: true } });
      return facility
        ? { ...auth, facilityId: requestedFacilityId, isEnterpriseAdmin: true }
        : { authorized: false, status: 404, reason: 'FACILITY_NOT_FOUND' };
    } catch (error) {
      console.error('[Executive facility lookup failed]', error);
      return { authorized: false, status: 503, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE' };
    }
  }

  if (!process.env.DATABASE_URL || !prisma?.facilityMembership) {
    return { authorized: false, status: 503, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE' };
  }

  try {
    const membership = await prisma.facilityMembership.findUnique({
      where: { facilityId_userId: { facilityId: requestedFacilityId, userId: auth.user.id } },
      select: { facilityId: true, userId: true, role: true, isActive: true },
    });

    const membershipRoles = ['FINANCE_OFFICER', 'VENUE_MANAGER', 'STADIUM_ADMINISTRATOR', 'OPERATIONS_MANAGER'];
    if (!facilityPolicy.membershipAllowsFacility({ membership, userId: auth.user.id, facilityId: requestedFacilityId, allowedRoles: membershipRoles })) {
      return { authorized: false, status: 403, reason: 'FORBIDDEN_FACILITY_ACCESS' };
    }
    return { ...auth, facilityId: requestedFacilityId, isEnterpriseAdmin: false };
  } catch (error) {
    console.error('[Executive facility authorization failed]', error);
    return { authorized: false, status: 503, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE' };
  }
}

export async function recordExecutiveAudit(tx, { actorId, facilityId, action, entityType, entityId, details }) {
  await tx.executiveAuditLog.create({
    data: {
      actorId,
      facilityId: facilityId || null,
      action,
      entityType,
      entityId: entityId || null,
      details: details || null,
    },
  });
}

// ---------------------------------------------------------------------------
// 1. UNIFIED EXECUTIVE DASHBOARD DATA ENGINE
// ---------------------------------------------------------------------------

export async function getExecutiveDashboardData({ facilityId = null, reportingPeriod = 'LAST_30_DAYS', eventId = null } = {}) {
  requireModels('event', 'payment', 'ticket', 'hardwareAsset', 'ioTDevice', 'securityIncident', 'helpdeskTicket', 'procurementRequest', 'executiveKpiConfig');

  const now = new Date();
  let startDate = new Date(now.getTime() - 30 * 86400000); // default 30 days
  if (reportingPeriod === 'LAST_7_DAYS') startDate = new Date(now.getTime() - 7 * 86400000);
  if (reportingPeriod === 'YEAR_TO_DATE') startDate = new Date(now.getFullYear(), 0, 1);

  const facilityFilter = facilityId ? { facilityId } : {};

  // Concurrent queries across all 14 stadium infrastructure sub-modules
  const [
    events,
    payments,
    ticketsCount,
    gateScansCount,
    hardwareAssets,
    iotDevices,
    securityIncidents,
    helpdeskTickets,
    procurementRequests,
    purchaseOrders,
    supplierContracts,
    kpiConfigs,
  ] = await Promise.all([
    prisma.event.findMany({
      where: facilityFilter,
      orderBy: { startDate: 'desc' },
      take: 20,
    }),
    prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(facilityId ? { OR: [
          { booking: { is: { event: { is: { facilityId } } } } },
          { order: { is: { event: { is: { facilityId } } } } },
        ] } : {}),
      },
      include: { reconciliation: true, refundRequests: true },
      take: 5000,
    }),
    prisma.ticket.count({
      where: facilityId ? { event: { facilityId } } : {},
    }),
    prisma.gateLog.count({
      where: { result: 'GRANTED', ...(facilityId ? { facilityId } : {}) },
    }),
    prisma.hardwareAsset.findMany({
      where: facilityFilter,
      select: { id: true, maintenanceStatus: true, category: true },
    }),
    prisma.ioTDevice.findMany({
      where: facilityFilter,
      select: { deviceId: true, status: true, deviceType: true },
    }),
    prisma.securityIncident.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(facilityId ? { facilityId } : {}),
      },
      select: { id: true, status: true, priority: true },
    }),
    prisma.helpdeskTicket.findMany({
      where: {
        createdAt: { gte: startDate },
        ...(facilityId ? { facilityId } : {}),
      },
      select: { id: true, status: true, priority: true, responseTargetHours: true, resolutionTargetHours: true, createdAt: true, resolvedAt: true },
    }),
    prisma.procurementRequest.findMany({
      where: facilityFilter,
      select: { id: true, status: true, totalEstimatedCost: true },
    }),
    prisma.purchaseOrder.findMany({
      where: facilityFilter,
      select: { id: true, status: true, totalAmount: true },
    }),
    prisma.supplierContract.findMany({
      where: facilityFilter,
      select: { id: true, status: true, expiryDate: true },
    }),
    prisma.executiveKpiConfig.findMany(),
  ]);

  // Aggregate Verified Figures (Measured Facts)
  const successfulPayments = payments.filter((p) => p.status === 'SUCCESSFUL');
  const grossTicketRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const reconciledPaymentsCount = successfulPayments.filter((p) => Boolean(p.reconciliation)).length;
  const paymentReconciliationRate = successfulPayments.length > 0 ? Math.round((reconciledPaymentsCount / successfulPayments.length) * 100) : 100;

  const totalAssets = hardwareAssets.length;
  const operationalAssets = hardwareAssets.filter((a) => a.maintenanceStatus === 'OPERATIONAL' || a.maintenanceStatus === 'HEALTHY' || a.maintenanceStatus === 'NOT_ASSESSED').length;
  const equipmentAvailabilityRate = totalAssets > 0 ? Math.round((operationalAssets / totalAssets) * 100) : 100;

  const totalIot = iotDevices.length;
  const onlineIot = iotDevices.filter((d) => d.status === 'ONLINE' || d.status === 'ACTIVE').length;
  const networkAvailabilityRate = totalIot > 0 ? Math.round((onlineIot / totalIot) * 100) : 100;

  const resolvedHelpdesk = helpdeskTickets.filter((t) => ['RESOLVED', 'CLOSED'].includes(t.status));
  const resolvedWithinSla = resolvedHelpdesk.filter((t) => {
    if (!t.resolvedAt) return false;
    const deadline = new Date(t.createdAt.getTime() + t.resolutionTargetHours * 3600000);
    return t.resolvedAt <= deadline;
  }).length;
  const helpdeskSlaCompliance = resolvedHelpdesk.length > 0 ? Math.round((resolvedWithinSla / resolvedHelpdesk.length) * 100) : 100;

  const openIncidentsCount = securityIncidents.filter((i) => !['RESOLVED', 'CLOSED'].includes(i.status)).length;
  const pendingProcurementValue = procurementRequests.filter((pr) => pr.status === 'PENDING_APPROVAL').reduce((sum, pr) => sum + pr.totalEstimatedCost, 0);

  const days60 = new Date(now.getTime() + 60 * 86400000);
  const expiringContractsCount = supplierContracts.filter((c) => c.status === 'ACTIVE' && c.expiryDate <= days60).length;

  // KPI Scorecard Assessment against Configured or Default Targets
  const activeKpiMap = new Map(DEFAULT_KPI_TARGETS.map((k) => [k.kpiKey, k]));
  for (const cfg of kpiConfigs) {
    activeKpiMap.set(cfg.kpiKey, cfg);
  }

  const kpiScorecard = [
    {
      kpiKey: 'PAYMENT_RECONCILIATION_RATE',
      label: 'Payment Reconciliation Rate',
      actualValue: paymentReconciliationRate,
      targetValue: activeKpiMap.get('PAYMENT_RECONCILIATION_RATE')?.targetValue || 98,
      unit: '%',
      status: paymentReconciliationRate >= (activeKpiMap.get('PAYMENT_RECONCILIATION_RATE')?.targetValue || 98) ? 'TARGET_MET' : 'BELLOW_TARGET',
    },
    {
      kpiKey: 'EQUIPMENT_AVAILABILITY_RATE',
      label: 'Equipment & Hardware Availability',
      actualValue: equipmentAvailabilityRate,
      targetValue: activeKpiMap.get('EQUIPMENT_AVAILABILITY_RATE')?.targetValue || 95,
      unit: '%',
      status: equipmentAvailabilityRate >= (activeKpiMap.get('EQUIPMENT_AVAILABILITY_RATE')?.targetValue || 95) ? 'TARGET_MET' : 'BELLOW_TARGET',
    },
    {
      kpiKey: 'NETWORK_UPTIME_RATE',
      label: 'Network & IoT Availability',
      actualValue: networkAvailabilityRate,
      targetValue: activeKpiMap.get('NETWORK_UPTIME_RATE')?.targetValue || 99.5,
      unit: '%',
      status: networkAvailabilityRate >= (activeKpiMap.get('NETWORK_UPTIME_RATE')?.targetValue || 99.5) ? 'TARGET_MET' : 'BELLOW_TARGET',
    },
    {
      kpiKey: 'HELPDESK_SLA_COMPLIANCE',
      label: 'Helpdesk SLA Compliance',
      actualValue: helpdeskSlaCompliance,
      targetValue: activeKpiMap.get('HELPDESK_SLA_COMPLIANCE')?.targetValue || 90,
      unit: '%',
      status: helpdeskSlaCompliance >= (activeKpiMap.get('HELPDESK_SLA_COMPLIANCE')?.targetValue || 90) ? 'TARGET_MET' : 'BELLOW_TARGET',
    },
  ];

  // AI-Assisted Insights with STRICT Data Source Classification
  const primaryEvent = events[0];
  const attendanceForecast = primaryEvent ? predictEventAttendance(primaryEvent.id) : null;
  const gateCongestionForecast = predictGateCongestion();
  const maintenanceAdvisories = generatePredictiveMaintenanceAdvisory();
  const demandInsights = generateTicketDemandInsights();

  const classifiedAiInsights = [
    {
      id: 'INS-001',
      classification: 'MEASURED_FACT', // Strict Label
      category: 'FINANCIAL_RECONCILIATION',
      title: 'M-PESA Revenue Reconciliation Status',
      summary: `Gross ticket revenue measured at KES ${grossTicketRevenue.toLocaleString()} with ${paymentReconciliationRate}% verified provider statement match rate.`,
      supportingData: `${reconciledPaymentsCount} of ${successfulPayments.length} successful M-PESA payments matched with verified provider statement receipts.`,
    },
    {
      id: 'INS-002',
      classification: 'MEASURED_FACT',
      category: 'SERVICE_SUPPORT',
      title: 'Helpdesk SLA Performance',
      summary: `Helpdesk technical support team achieved ${helpdeskSlaCompliance}% SLA resolution compliance across ${resolvedHelpdesk.length} resolved tickets.`,
      supportingData: `${resolvedWithinSla} tickets resolved strictly within configured priority SLA targets.`,
    },
    ...(attendanceForecast ? [{
      id: 'INS-003',
      classification: 'FORECAST', // Strict Label
      category: 'ATTENDANCE_PREDICTION',
      title: `Matchday Attendance Forecast: ${primaryEvent.title}`,
      summary: `Projected ${attendanceForecast.forecastAttendance.toLocaleString()} spectators (${attendanceForecast.occupancyPercentage}% stadium capacity) with confidence score ${attendanceForecast.confidenceScore}.`,
      supportingData: `Based on current velocity of ${attendanceForecast.currentTicketsSold.toLocaleString()} tickets sold and time-series ARIMA model.`,
    }] : []),
    ...(gateCongestionForecast?.[0] ? [{
      id: 'INS-004',
      classification: 'AI_RECOMMENDATION', // Strict Label
      category: 'CROWD_OPERATIONS',
      title: `Gate Congestion Advisory: ${gateCongestionForecast[0].gateId}`,
      summary: `Recommend deploying ${gateCongestionForecast[0].recommendedStewardAllocation} stewards to ${gateCongestionForecast[0].gateId} between ${gateCongestionForecast[0].predictedPeakTime}.`,
      supportingData: gateCongestionForecast[0].supportingEvidence,
    }] : []),
    ...(maintenanceAdvisories?.[0] ? [{
      id: 'INS-005',
      classification: 'AI_RECOMMENDATION',
      category: 'PREDICTIVE_MAINTENANCE',
      title: `Substation Advisory: ${maintenanceAdvisories[0].deviceName}`,
      summary: maintenanceAdvisories[0].recommendedAction,
      supportingData: `${maintenanceAdvisories[0].supportingEvidence} (Probability: ${maintenanceAdvisories[0].probability}).`,
    }] : []),
  ];

  return {
    generatedAt: new Date().toISOString(),
    reportingPeriod,
    facilityId,
    measuredFacts: {
      totalEvents: events.length,
      grossTicketRevenue,
      totalTicketsSold: ticketsCount,
      totalGateScans: gateScansCount,
      reconciledPaymentsCount,
      paymentReconciliationRate,
      totalHardwareAssets: totalAssets,
      operationalAssetsCount: operationalAssets,
      equipmentAvailabilityRate,
      totalIotDevices: totalIot,
      onlineIotDevicesCount: onlineIot,
      networkAvailabilityRate,
      openIncidentsCount,
      totalHelpdeskTickets: helpdeskTickets.length,
      helpdeskSlaCompliance,
      pendingProcurementValue,
      expiringContractsCount,
    },
    kpiScorecard,
    classifiedAiInsights,
    eventsSummary: events,
  };
}

// ---------------------------------------------------------------------------
// 2. CONFIGURABLE KPI MANAGEMENT
// ---------------------------------------------------------------------------

export async function configureExecutiveKpi({ kpiKey, label, targetValue, unit, category }, actorId) {
  requireModels('executiveKpiConfig', 'executiveAuditLog');
  const key = requiredText(kpiKey, 'KPI key', 50).toUpperCase();
  const val = Number(targetValue);
  if (!Number.isFinite(val)) throw new ExecutiveError('Target value must be a valid number.');

  return prisma.$transaction(async (tx) => {
    const config = await tx.executiveKpiConfig.upsert({
      where: { kpiKey: key },
      update: {
        label: label ? label.trim() : key,
        targetValue: val,
        unit: unit ? unit.trim() : '%',
        category: category ? category.trim().toUpperCase() : 'OPERATIONAL',
        updatedById: actorId,
      },
      create: {
        kpiKey: key,
        label: label ? label.trim() : key,
        targetValue: val,
        unit: unit ? unit.trim() : '%',
        category: category ? category.trim().toUpperCase() : 'OPERATIONAL',
        updatedById: actorId,
      },
    });

    await recordExecutiveAudit(tx, {
      actorId,
      facilityId: null,
      action: 'EXECUTIVE_KPI_CONFIGURED',
      entityType: 'EXECUTIVE_KPI_CONFIG',
      entityId: config.id,
      details: `Configured executive KPI ${key}: target=${val}${config.unit}`,
    });

    return config;
  });
}

function requiredText(value, label, maxLength = 500) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new ExecutiveError(`${label} is required and must be at most ${maxLength} characters.`);
  }
  return value.trim();
}

// ---------------------------------------------------------------------------
// 3. HISTORICAL EVENT PERFORMANCE COMPARISON
// ---------------------------------------------------------------------------

export async function getHistoricalEventComparison({ facilityId = null, eventIds = [] } = {}) {
  requireModels('event', 'ticket', 'payment');
  const events = await prisma.event.findMany({
    where: {
      ...(facilityId ? { facilityId } : {}),
      ...(Array.isArray(eventIds) && eventIds.length > 0 ? { id: { in: eventIds } } : {}),
    },
    take: 10,
    orderBy: { startDate: 'desc' },
  });

  const comparisons = [];
  for (const event of events) {
    const ticketsCount = await prisma.ticket.count({ where: { eventId: event.id } });
    const payments = await prisma.payment.findMany({
      where: { booking: { is: { eventId: event.id } }, status: 'SUCCESSFUL' },
      select: { amount: true },
    });
    const revenue = payments.reduce((sum, p) => sum + p.amount, 0);

    comparisons.push({
      eventId: event.id,
      title: event.title,
      category: event.category,
      startDate: event.startDate,
      ticketsSold: ticketsCount,
      grossRevenue: revenue,
      occupancyPercentage: Math.round((ticketsCount / 60000) * 100),
    });
  }

  return comparisons;
}

// ---------------------------------------------------------------------------
// 4. EXECUTIVE REPORT EXPORT GENERATOR
// ---------------------------------------------------------------------------

export async function exportExecutiveReport({ facilityId = null, reportingPeriod = 'LAST_30_DAYS', format = 'txt' } = {}) {
  const dashData = await getExecutiveDashboardData({ facilityId, reportingPeriod });

  const reportText = [
    `================================================================================`,
    `TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE - EXECUTIVE PERFORMANCE REPORT`,
    `================================================================================`,
    `Generated At      : ${dashData.generatedAt}`,
    `Reporting Period  : ${dashData.reportingPeriod}`,
    `Facility Scope    : ${dashData.facilityId || 'Enterprise Full Scope'}`,
    `================================================================================`,
    `1. MEASURED OPERATIONAL & FINANCIAL FACTS (VERIFIED DATABASE TOTALS)`,
    `--------------------------------------------------------------------------------`,
    `  * Total Verified Events Tracked     : ${dashData.measuredFacts.totalEvents}`,
    `  * Gross Ticket Sales Revenue       : KES ${dashData.measuredFacts.grossTicketRevenue.toLocaleString()}`,
    `  * Digital Tickets Issued            : ${dashData.measuredFacts.totalTicketsSold.toLocaleString()}`,
    `  * Turnstile Gate Scans Recorded     : ${dashData.measuredFacts.totalGateScans.toLocaleString()}`,
    `  * M-PESA Reconciliation Rate       : ${dashData.measuredFacts.paymentReconciliationRate}% (${dashData.measuredFacts.reconciledPaymentsCount} matched)`,
    `  * Hardware Equipment Availability  : ${dashData.measuredFacts.equipmentAvailabilityRate}% (${dashData.measuredFacts.operationalAssetsCount}/${dashData.measuredFacts.totalHardwareAssets} assets operational)`,
    `  * Network & IoT Availability       : ${dashData.measuredFacts.networkAvailabilityRate}% (${dashData.measuredFacts.onlineIotDevicesCount}/${dashData.measuredFacts.totalIotDevices} devices online)`,
    `  * Helpdesk SLA Compliance Rate      : ${dashData.measuredFacts.helpdeskSlaCompliance}%`,
    `  * Pending Procurement Value        : KES ${dashData.measuredFacts.pendingProcurementValue.toLocaleString()}`,
    `  * Supplier Contracts Expiring Soon : ${dashData.measuredFacts.expiringContractsCount}`,
    `--------------------------------------------------------------------------------`,
    `2. KEY PERFORMANCE INDICATORS SCORECARD`,
    `--------------------------------------------------------------------------------`,
    ...dashData.kpiScorecard.map(
      (k) => `  [${k.status}] ${k.label}: Actual=${k.actualValue}${k.unit} vs Target=${k.targetValue}${k.unit}`
    ),
    `--------------------------------------------------------------------------------`,
    `3. AI-ASSISTED INSIGHTS & ANALYTICAL ADVISORIES (EXPLICITLY CLASSIFIED)`,
    `--------------------------------------------------------------------------------`,
    ...dashData.classifiedAiInsights.map(
      (ins, idx) => `  ${idx + 1}. [${ins.classification}] (${ins.category}) ${ins.title}\n     Summary: ${ins.summary}\n     Evidence: ${ins.supportingData}\n`
    ),
    `================================================================================`,
    `CONFIDENTIAL EXECUTIVE BRIEFING - AUTHORIZED LEADERSHIP PERSONNEL ONLY`,
    `ST-Tech ICT Consultants - Ministry of Sports / Talanta Stadium Infrastructure`,
    `================================================================================`,
  ].join('\n');

  return { dashData, reportText };
}
