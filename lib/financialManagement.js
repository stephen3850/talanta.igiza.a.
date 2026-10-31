import crypto from 'crypto';
import { canonicalRole } from './auth.js';
import { authorizeManagedUser } from './iam.js';
import { getRequestedFacilityId } from './facilities.js';
import facilityPolicy from './facilityPolicy.cjs';
import { prisma } from './prisma.js';

const READ_ROLES = ['SYSTEM_ADMIN', 'FINANCE_OFFICER', 'VENUE_MANAGER', 'REPORT_VIEWER'];
const WRITE_ROLES = ['SYSTEM_ADMIN', 'FINANCE_OFFICER'];
const PAYMENT_STATUSES = new Set(['SUCCESSFUL', 'PENDING', 'INITIATED', 'FAILED', 'CANCELLED', 'EXPIRED', 'REVERSED']);
const STATEMENT_STATUSES = new Set(['SUCCESSFUL', 'PENDING', 'FAILED', 'REVERSED']);
const REVENUE_METHODS = new Set(['CASH', 'M-PESA', 'CARD', 'BANK_TRANSFER', 'OTHER']);
const FINAL_RECORD_STATES = new Set(['APPROVED', 'REJECTED']);
const BASE_REVENUE_CATEGORIES = [
  { categoryKey: 'TICKETING', label: 'Ticketing revenue', description: 'Revenue from event ticket transactions.' },
  { categoryKey: 'PARKING', label: 'Parking revenue', description: 'Parking revenue only where supported and verified.' },
  { categoryKey: 'VENUE_HIRE', label: 'Venue hire', description: 'Configurable event and facility hire revenue.' },
  { categoryKey: 'CONCESSIONS', label: 'Concessions', description: 'Configurable concession revenue.' },
  { categoryKey: 'OTHER', label: 'Other revenue', description: 'Other approved facility revenue category.' },
];

export class FinanceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'FinanceError';
    this.status = status;
  }
}

function requireModels(...models) {
  if (!process.env.DATABASE_URL || models.some((model) => !prisma?.[model])) {
    throw new FinanceError('Financial database schema is unavailable; apply the migration and regenerate Prisma Client.', 503);
  }
}

export async function authorizeFinanceRequest(req, { write = false, facilityId = null } = {}) {
  const allowedRoles = write ? WRITE_ROLES : READ_ROLES;
  const auth = await authorizeManagedUser(req, allowedRoles);
  if (!auth.authorized) return auth;
  const role = canonicalRole(auth.user.role);
  if (role === 'SYSTEM_ADMIN' && !facilityId) return { ...auth, facilityId: null, isEnterpriseAdmin: true };
  const requestedFacilityId = facilityId || getRequestedFacilityId(req);
  if (role === 'SYSTEM_ADMIN') {
    try {
      const facility = await prisma.facility.findUnique({ where: { id: requestedFacilityId }, select: { id: true } });
      return facility ? { ...auth, facilityId: requestedFacilityId, isEnterpriseAdmin: true } : { authorized: false, status: 404, reason: 'FACILITY_NOT_FOUND' };
    } catch (error) {
      console.error('[Finance facility lookup failed]', error);
      return { authorized: false, status: 503, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE' };
    }
  }
  if (!process.env.DATABASE_URL || !prisma?.facilityMembership) return { authorized: false, status: 503, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE' };
  try {
    const membership = await prisma.facilityMembership.findUnique({
      where: { facilityId_userId: { facilityId: requestedFacilityId, userId: auth.user.id } },
      select: { facilityId: true, userId: true, role: true, isActive: true },
    });
    const membershipRoles = role === 'FINANCE_OFFICER' ? ['FINANCE_OFFICER']
      : role === 'VENUE_MANAGER' ? ['VENUE_MANAGER', 'STADIUM_ADMINISTRATOR', 'OPERATIONS_MANAGER']
        : role === 'REPORT_VIEWER' ? ['REPORT_VIEWER'] : [];
    if (!facilityPolicy.membershipAllowsFacility({ membership, userId: auth.user.id, facilityId: requestedFacilityId, allowedRoles: membershipRoles })) {
      return { authorized: false, status: 403, reason: 'FORBIDDEN_FACILITY_ACCESS' };
    }
    return { ...auth, facilityId: requestedFacilityId, isEnterpriseAdmin: false };
  } catch (error) {
    console.error('[Finance facility authorization failed]', error);
    return { authorized: false, status: 503, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE' };
  }
}

export async function ensureRevenueCategories(actorId = 'SYSTEM_CATALOG') {
  requireModels('revenueCategory');
  await prisma.revenueCategory.createMany({
    data: BASE_REVENUE_CATEGORIES.map((item) => ({ ...item, createdById: actorId })),
    skipDuplicates: true,
  });
}

export async function recordFinanceAudit(tx, { actorId, facilityId, action, entityType, entityId, details }) {
  await tx.financialAuditLog.create({
    data: { actorId, facilityId: facilityId || null, action, entityType, entityId: entityId || null, details: details || null },
  });
}

function requiredText(value, label, maxLength = 500) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new FinanceError(`${label} is required and must be at most ${maxLength} characters.`);
  }
  return value.trim();
}

function positiveAmount(value, label = 'Amount') {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(Math.round(amount * 100))) {
    throw new FinanceError(`${label} must be a positive amount with at most two decimal places.`);
  }
  if (Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-7) throw new FinanceError(`${label} must have at most two decimal places.`);
  return Math.round(amount * 100) / 100;
}

function signedAmount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount === 0 || Math.abs(amount) > 1000000000
    || Math.abs(amount * 100 - Math.round(amount * 100)) > 1e-7) {
    throw new FinanceError('Adjustment amount must be non-zero, no more than KES 1 billion, and have at most two decimal places.');
  }
  return Math.round(amount * 100) / 100;
}

function dateValue(value, label) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new FinanceError(`${label} must be a valid date.`);
  return date;
}

export function validateStatementImport(body) {
  const statementReference = requiredText(body.statementReference, 'Statement reference', 120);
  const verificationNote = requiredText(body.verificationNote, 'Statement verification note', 2000);
  if (body.provider !== undefined && body.provider !== 'M-PESA') throw new FinanceError('Only the configured M-PESA payment records can currently be reconciled.');
  if (body.verified !== true) throw new FinanceError('Confirm that an authorized finance officer reviewed the provider statement before import.');
  if (!Array.isArray(body.lines) || body.lines.length < 1 || body.lines.length > 2000) throw new FinanceError('Provide between 1 and 2000 statement lines.');
  const lines = body.lines.map((line, index) => {
    const providerReference = requiredText(line.providerReference, `Line ${index + 1} provider reference`, 120);
    const providerStatus = requiredText(line.status || 'SUCCESSFUL', `Line ${index + 1} status`, 20).toUpperCase();
    if (!STATEMENT_STATUSES.has(providerStatus)) throw new FinanceError(`Line ${index + 1} has an unsupported provider status.`);
    const currency = requiredText(line.currency || 'KES', `Line ${index + 1} currency`, 3).toUpperCase();
    if (currency !== 'KES') throw new FinanceError('Only KES statement lines are supported.');
    return {
      providerReference,
      providerStatus,
      amount: positiveAmount(line.amount, `Line ${index + 1} amount`),
      currency,
      transactionAt: dateValue(line.transactionAt, `Line ${index + 1} transaction date`),
    };
  });
  if (new Set(lines.map((line) => line.providerReference)).size !== lines.length) {
    throw new FinanceError('A statement import cannot contain duplicate provider references.');
  }
  return { statementReference, verificationNote, lines, provider: 'M-PESA', currency: 'KES' };
}

export function evaluateStatementMatch(line, payment) {
  if (line.providerStatus !== 'SUCCESSFUL') return { matchStatus: 'UNMATCHED', matchReason: 'PROVIDER_STATUS_NOT_SUCCESSFUL' };
  if (!payment) return { matchStatus: 'UNMATCHED', matchReason: 'NO_APPLICATION_PAYMENT' };
  if (payment.status !== 'SUCCESSFUL') return { matchStatus: 'UNMATCHED', matchReason: 'APPLICATION_PAYMENT_NOT_SUCCESSFUL' };
  if (payment.currency !== line.currency || Math.round(payment.amount * 100) !== Math.round(line.amount * 100)) {
    return { matchStatus: 'AMOUNT_MISMATCH', matchReason: 'AMOUNT_OR_CURRENCY_MISMATCH' };
  }
  if (payment.reconciliation) return { matchStatus: 'UNMATCHED', matchReason: 'PAYMENT_ALREADY_RECONCILED' };
  return { matchStatus: 'MATCHED', matchReason: null };
}

export function validateRevenueRecord(body, facilityId) {
  const amount = positiveAmount(body.amount);
  const paymentMethod = requiredText(body.paymentMethod, 'Payment method', 30).toUpperCase();
  if (!REVENUE_METHODS.has(paymentMethod)) throw new FinanceError('Choose a supported revenue payment method.');
  return {
    reference: `REV-${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
    categoryId: requiredText(body.categoryId, 'Revenue category ID', 100),
    facilityId,
    eventId: body.eventId ? requiredText(body.eventId, 'Event ID', 100) : null,
    amount,
    currency: 'KES',
    paymentMethod,
    sourceReference: body.sourceReference ? requiredText(body.sourceReference, 'Source reference', 120) : null,
    description: requiredText(body.description, 'Description', 2000),
    status: 'PENDING_APPROVAL',
    isSimulated: body.isSimulated === true,
    occurredAt: dateValue(body.occurredAt, 'Occurrence date') || new Date(),
  };
}

export function validateAdjustment(body, facilityId) {
  return {
    reference: `ADJ-${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
    facilityId,
    eventId: body.eventId ? requiredText(body.eventId, 'Event ID', 100) : null,
    amount: signedAmount(body.amount),
    currency: 'KES',
    reason: requiredText(body.reason, 'Adjustment reason', 2000),
  };
}

export function validateRefundRequest(body) {
  return {
    paymentId: requiredText(body.paymentId, 'Payment ID', 100),
    amount: positiveAmount(body.amount, 'Refund amount'),
    reason: requiredText(body.reason, 'Refund reason', 2000),
  };
}

function reportDateWhere(searchParams) {
  const from = dateValue(searchParams.get('from'), 'Start date');
  const toRaw = searchParams.get('to');
  const to = dateValue(toRaw, 'End date');
  if (to && /^\d{4}-\d{2}-\d{2}$/.test(toRaw)) to.setUTCHours(23, 59, 59, 999);
  if (from && to && from > to) throw new FinanceError('Start date must be on or before end date.');
  return { ...(from || to ? { gte: from || new Date(0), ...(to ? { lte: to } : {}) } : {}) };
}

export async function importReconciliationStatement(body, actorId, facilityId) {
  requireModels('reconciliationBatch', 'providerStatementLine', 'paymentReconciliation', 'payment', 'financialAuditLog');
  const input = validateStatementImport(body);
  const scopeFilter = facilityId ? {
    AND: [
      { provider: 'M-PESA' },
      { OR: [
        { booking: { is: { event: { is: { facilityId } } } } },
        { order: { is: { event: { is: { facilityId } } } } },
      ] },
    ],
  } : { provider: 'M-PESA' };
  let batch;
  try {
    batch = await prisma.$transaction(async (tx) => {
      const createdBatch = await tx.reconciliationBatch.create({
        data: {
          statementReference: input.statementReference,
          provider: input.provider,
          currency: input.currency,
          facilityId,
          verificationNote: input.verificationNote,
          verifiedById: actorId,
          lineCount: input.lines.length,
        },
      });
      const inserted = await tx.providerStatementLine.createMany({
        data: input.lines.map((line) => ({ ...line, batchId: createdBatch.id })),
        skipDuplicates: true,
      });
      if (inserted.count !== input.lines.length) throw new FinanceError('This statement or one or more provider references were already imported.', 409);
      return createdBatch;
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (error instanceof FinanceError) throw error;
    if (error.code === 'P2002' || error.code === 'P2034') throw new FinanceError('This statement or one or more provider references were already imported.', 409);
    throw error;
  }
  const createdLines = await prisma.providerStatementLine.findMany({ where: { batchId: batch.id }, orderBy: { providerReference: 'asc' } });

  const matchedRefs = [];
  for (const line of createdLines) {
    let matchedPayment = null;
    if (line.providerStatus === 'SUCCESSFUL') {
      matchedPayment = await prisma.payment.findFirst({
        where: { ...scopeFilter, mpesaReceipt: line.providerReference },
        include: { reconciliation: { select: { id: true } } },
      });
    }
    const evaluation = evaluateStatementMatch(line, matchedPayment);
    let matchStatus = evaluation.matchStatus;
    let matchReason = evaluation.matchReason;
    if (matchStatus === 'MATCHED' && matchedPayment) {
        try {
          await prisma.$transaction(async (tx) => {
            const claimed = await tx.providerStatementLine.updateMany({
              where: { id: line.id, matchStatus: 'UNMATCHED', paymentId: null },
              data: { matchStatus: 'MATCHED', matchReason: null, paymentId: matchedPayment.id },
            });
            if (claimed.count !== 1) throw new FinanceError('Statement line was already processed.', 409);
            await tx.paymentReconciliation.create({
              data: {
                paymentId: matchedPayment.id,
                statementLineId: line.id,
                providerReference: line.providerReference,
                amount: line.amount,
                currency: line.currency,
                reconciledById: actorId,
              },
            });
            await recordFinanceAudit(tx, {
              actorId,
              facilityId,
              action: 'PAYMENT_RECONCILED',
              entityType: 'PAYMENT',
              entityId: matchedPayment.id,
              details: `Provider statement ${input.statementReference} matched reference ${line.providerReference}.`,
            });
          }, { isolationLevel: 'Serializable' });
          matchedRefs.push(line.providerReference);
        } catch (error) {
          if (error instanceof FinanceError) throw error;
          if (error.code !== 'P2002') throw error;
          matchStatus = 'UNMATCHED';
          matchReason = 'PAYMENT_ALREADY_RECONCILED';
        }
    }
    if (matchStatus !== 'MATCHED') {
      await prisma.providerStatementLine.update({
        where: { id: line.id },
        data: { matchStatus, matchReason },
      });
    }
  }

  const unmatchedCount = createdLines.length - matchedRefs.length;
  await prisma.$transaction(async (tx) => {
    await tx.reconciliationBatch.update({
      where: { id: batch.id },
      data: { matchedCount: matchedRefs.length, unmatchedCount },
    });
    await recordFinanceAudit(tx, {
      actorId,
      facilityId,
      action: 'PROVIDER_STATEMENT_IMPORTED',
      entityType: 'RECONCILIATION_BATCH',
      entityId: batch.id,
      details: `Finance-attested ${input.provider} statement ${input.statementReference}: ${matchedRefs.length} matched, ${unmatchedCount} unmatched.`,
    });
  });
  return {
    batch: { ...batch, matchedCount: matchedRefs.length, unmatchedCount },
    lines: await prisma.providerStatementLine.findMany({ where: { batchId: batch.id }, orderBy: { providerReference: 'asc' } }),
  };
}

function scopedEventRelation(facilityId) {
  return facilityId
    ? { OR: [
      { booking: { is: { event: { is: { facilityId } } } } },
      { order: { is: { event: { is: { facilityId } } } } },
    ] }
    : {};
}

export async function getFinancialReport({ facilityId = null, from = null, to = null } = {}) {
  requireModels('payment', 'revenueRecord', 'financialAdjustment', 'refundRequest', 'paymentReconciliation', 'providerStatementLine', 'revenueCategory');
  await ensureRevenueCategories();
  const createdAt = {};
  if (from) createdAt.gte = from;
  if (to) createdAt.lte = to;
  const hasDateRange = Object.keys(createdAt).length > 0;
  const paymentWhere = {
    ...scopedEventRelation(facilityId),
    ...(hasDateRange ? { createdAt } : {}),
  };
  const paymentRows = await prisma.payment.findMany({
    where: paymentWhere,
    orderBy: { createdAt: 'desc' },
    take: 10000,
    include: {
      reconciliation: { select: { id: true } },
      booking: { select: { event: { select: { id: true, title: true, facilityId: true, facility: { select: { name: true } } } } } },
      order: { select: { event: { select: { id: true, title: true, facilityId: true, facility: { select: { name: true } } } } } },
      refundRequests: { where: { status: 'COMPLETED' }, select: { amount: true } },
    },
  });
  const revenueRows = await prisma.revenueRecord.findMany({
    where: { status: 'APPROVED', ...(facilityId ? { facilityId } : {}), ...(hasDateRange ? { occurredAt: createdAt } : {}) },
    take: 10000,
    include: { category: { select: { categoryKey: true, label: true } }, event: { select: { id: true, title: true } }, facility: { select: { id: true, name: true } } },
  });
  const adjustmentRows = await prisma.financialAdjustment.findMany({
    where: { status: 'APPROVED', ...(facilityId ? { facilityId } : {}), ...(hasDateRange ? { approvedAt: createdAt } : {}) },
    take: 10000,
    include: { event: { select: { id: true, title: true } }, facility: { select: { id: true, name: true } } },
  });
  const [unreconciledPayments, unreconciledCount, unmatchedStatementLines, unmatchedStatementLineCount, batches, revenueCategories, refundRequests, refundsPending, refundsRejected, adjustmentQueue, revenueQueue, auditRows] = await Promise.all([
    prisma.payment.findMany({
      where: { ...paymentWhere, status: 'SUCCESSFUL', reconciliation: { is: null } },
      select: { id: true, paymentRef: true, mpesaReceipt: true, amount: true, currency: true, provider: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 250,
    }),
    prisma.payment.count({ where: { ...paymentWhere, status: 'SUCCESSFUL', reconciliation: { is: null } } }),
    prisma.providerStatementLine.findMany({
      where: { matchStatus: { in: ['UNMATCHED', 'AMOUNT_MISMATCH'] }, ...(facilityId ? { batch: { is: { facilityId } } } : {}) },
      include: { batch: { select: { statementReference: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
      take: 250,
    }),
    prisma.providerStatementLine.count({
      where: { matchStatus: { in: ['UNMATCHED', 'AMOUNT_MISMATCH'] }, ...(facilityId ? { batch: { is: { facilityId } } } : {}) },
    }),
    prisma.reconciliationBatch.findMany({ where: facilityId ? { facilityId } : {}, orderBy: { createdAt: 'desc' }, take: 25 }),
    prisma.revenueCategory.findMany({ where: { active: true }, orderBy: { label: 'asc' } }),
    prisma.refundRequest.findMany({
      where: { status: { in: ['REQUESTED', 'APPROVED', 'REJECTED'] }, payment: { is: paymentWhere } },
      include: { payment: { select: { paymentRef: true, mpesaReceipt: true, amount: true, provider: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.refundRequest.count({ where: { status: { in: ['REQUESTED', 'APPROVED'] }, payment: { is: paymentWhere } } }),
    prisma.refundRequest.count({ where: { status: 'REJECTED', payment: { is: paymentWhere } } }),
    prisma.financialAdjustment.findMany({ where: { status: 'PENDING_APPROVAL', ...(facilityId ? { facilityId } : {}) }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.revenueRecord.findMany({ where: { status: 'PENDING_APPROVAL', ...(facilityId ? { facilityId } : {}) }, include: { category: { select: { label: true } } }, orderBy: { createdAt: 'desc' }, take: 100 }),
    prisma.financialAuditLog.findMany({ where: facilityId ? { facilityId } : {}, orderBy: { createdAt: 'desc' }, take: 100 }),
  ]);
  const grossTicketRevenue = paymentRows.filter((payment) => payment.status === 'SUCCESSFUL').reduce((sum, payment) => sum + payment.amount, 0);
  const completedRefunds = paymentRows.reduce((sum, payment) => {
    const recordedRefunds = payment.refundRequests.reduce((refundSum, refund) => refundSum + refund.amount, 0);
    return sum + (payment.status === 'REVERSED' ? Math.max(payment.amount, recordedRefunds) : recordedRefunds);
  }, 0);
  const otherRevenue = revenueRows.reduce((sum, row) => sum + row.amount, 0);
  const adjustmentsTotal = adjustmentRows.reduce((sum, row) => sum + row.amount, 0);
  const feesAvailable = false;

  const byEvent = new Map();
  const byFacility = new Map();
  const byMethod = new Map();
  function addRevenue({ amount, event, facility, method, category }) {
    if (event) {
      const existing = byEvent.get(event.id) || { eventId: event.id, eventTitle: event.title, amount: 0 };
      existing.amount += amount;
      byEvent.set(event.id, existing);
    }
    if (facility) {
      const existing = byFacility.get(facility.id) || { facilityId: facility.id, facilityName: facility.name, amount: 0 };
      existing.amount += amount;
      byFacility.set(facility.id, existing);
    }
    const methodName = method || category || 'UNKNOWN';
    byMethod.set(methodName, (byMethod.get(methodName) || 0) + amount);
  }
  for (const payment of paymentRows) {
    const event = payment.booking?.event || payment.order?.event || null;
    if (!event) continue;
    const facility = { id: event.facilityId, name: event.facility.name };
    if (payment.status === 'SUCCESSFUL') {
      addRevenue({ amount: payment.amount, event, facility, method: payment.provider });
      for (const refund of payment.refundRequests) addRevenue({ amount: -refund.amount, event, facility, method: payment.provider });
    } else if (payment.status === 'REVERSED') {
      addRevenue({ amount: -payment.amount, event, facility, method: payment.provider });
    }
  }
  for (const row of revenueRows) addRevenue({ amount: row.amount, event: row.event, facility: row.facility, method: row.paymentMethod, category: row.category.label });
  for (const row of adjustmentRows) addRevenue({ amount: row.amount, event: row.event, facility: row.facility, method: 'ADJUSTMENT' });

  const paymentStatusCounts = Object.fromEntries([...PAYMENT_STATUSES].map((status) => [
    status,
    paymentRows.filter((payment) => payment.status === status).length,
  ]));
  const trendMap = new Map();
  for (const payment of paymentRows) {
    if (payment.status !== 'SUCCESSFUL') continue;
    const day = payment.createdAt.toISOString().slice(0, 10);
    trendMap.set(day, (trendMap.get(day) || 0) + payment.amount);
  }
  const byCategory = new Map();
  if (grossTicketRevenue > 0) byCategory.set('Ticketing', grossTicketRevenue);
  for (const row of revenueRows) {
    const catLabel = row.category?.label || 'Other Revenue';
    byCategory.set(catLabel, (byCategory.get(catLabel) || 0) + row.amount);
  }
  if (adjustmentsTotal !== 0) {
    byCategory.set('Adjustments', adjustmentsTotal);
  }

  return {
    generatedAt: new Date().toISOString(),
    dataMode: 'DATABASE',
    facilityId,
    currency: 'KES',
    totals: {
      grossTicketRevenue,
      refunds: completedRefunds,
      transactionFees: null,
      netRevenue: grossTicketRevenue - completedRefunds + otherRevenue + adjustmentsTotal,
      otherRevenue,
      approvedAdjustments: adjustmentsTotal,
      successfulPayments: paymentStatusCounts.SUCCESSFUL,
      pendingPayments: paymentStatusCounts.PENDING + paymentStatusCounts.INITIATED,
      failedPayments: paymentStatusCounts.FAILED + paymentStatusCounts.CANCELLED + paymentStatusCounts.EXPIRED,
      reversedPayments: paymentStatusCounts.REVERSED,
      unreconciledSuccessfulPayments: unreconciledCount,
      unmatchedStatementLines: unmatchedStatementLineCount,
      outstandingRefundRequests: refundsPending,
      rejectedRefundRequests: refundsRejected,
      pendingAdjustments: adjustmentQueue.length,
      pendingRevenueEntries: revenueQueue.length,
    },
    paymentStatusCounts,
    byEvent: [...byEvent.values()],
    byFacility: [...byFacility.values()],
    byPaymentMethod: [...byMethod.entries()].map(([paymentMethod, amount]) => ({ paymentMethod, amount })),
    byCategory: [...byCategory.entries()].map(([category, amount]) => ({ category, amount })),
    revenueCategories,
    refundRequests,
    adjustmentQueue,
    revenueQueue,
    auditRows,
    unreconciledPayments,
    unmatchedStatementLines,
    batches,
    transactions: paymentRows.map((payment) => ({
      id: payment.id,
      paymentRef: payment.paymentRef,
      eventTitle: payment.booking?.event?.title || payment.order?.event?.title || 'Unattributed payment',
      facilityName: payment.booking?.event?.facility?.name || payment.order?.event?.facility?.name || 'Unknown facility',
      paymentMethod: payment.provider,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      providerReference: payment.mpesaReceipt,
      reconciled: Boolean(payment.reconciliation),
      refunded: payment.refundRequests.reduce((sum, refund) => sum + refund.amount, 0),
      createdAt: payment.createdAt,
      isSimulated: false,
    })),
    transactionFeesAvailable: feesAvailable,
    trend: [...trendMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({ date, amount })),
    reportLimit: paymentRows.length === 10000 ? 'Payment list capped at 10,000 rows; narrow the date range.' : null,
  };
}

export async function createRevenueRecord(body, actorId, facilityId) {
  requireModels('revenueRecord', 'revenueCategory', 'event', 'financialAuditLog');
  const data = validateRevenueRecord(body, facilityId);
  const category = await prisma.revenueCategory.findFirst({ where: { id: data.categoryId, active: true } });
  if (!category) throw new FinanceError('An active revenue category is required.', 404);
  if (data.eventId) {
    const event = await prisma.event.findFirst({ where: { id: data.eventId, facilityId }, select: { id: true } });
    if (!event) throw new FinanceError('The selected event does not belong to the authorized facility.', 403);
  }
  return prisma.$transaction(async (tx) => {
    const record = await tx.revenueRecord.create({ data: { ...data, createdById: actorId } });
    await recordFinanceAudit(tx, { actorId, facilityId, action: 'REVENUE_RECORD_CREATED', entityType: 'REVENUE_RECORD', entityId: record.id, details: `Revenue record ${record.reference} entered pending second-person approval.` });
    return record;
  });
}

export async function createAdjustment(body, actorId, facilityId) {
  requireModels('financialAdjustment', 'event', 'financialAuditLog');
  const data = validateAdjustment(body, facilityId);
  if (data.eventId) {
    const event = await prisma.event.findFirst({ where: { id: data.eventId, facilityId }, select: { id: true } });
    if (!event) throw new FinanceError('The selected event does not belong to the authorized facility.', 403);
  }
  return prisma.$transaction(async (tx) => {
    const adjustment = await tx.financialAdjustment.create({ data: { ...data, createdById: actorId } });
    await recordFinanceAudit(tx, { actorId, facilityId, action: 'FINANCIAL_ADJUSTMENT_CREATED', entityType: 'FINANCIAL_ADJUSTMENT', entityId: adjustment.id, details: `Adjustment ${adjustment.reference} pending second-person approval: ${data.reason}` });
    return adjustment;
  });
}

export async function reviewFinancialRecord({ recordType, recordId, decision, reason, actorId, facilityId }) {
  requireModels('revenueRecord', 'financialAdjustment', 'financialAuditLog');
  const normalizedType = requiredText(recordType, 'Record type', 30).toUpperCase();
  const normalizedDecision = requiredText(decision, 'Decision', 20).toUpperCase();
  if (!['REVENUE', 'ADJUSTMENT'].includes(normalizedType)) throw new FinanceError('Record type must be REVENUE or ADJUSTMENT.');
  if (!['APPROVE', 'REJECT'].includes(normalizedDecision)) throw new FinanceError('Decision must be APPROVE or REJECT.');
  const rejectionReason = normalizedDecision === 'REJECT' ? requiredText(reason, 'Rejection reason', 2000) : null;
  const model = normalizedType === 'REVENUE' ? 'revenueRecord' : 'financialAdjustment';
  return prisma.$transaction(async (tx) => {
    const record = await tx[model].findFirst({ where: { id: recordId, ...(facilityId ? { facilityId } : {}) } });
    if (!record) throw new FinanceError('Financial record was not found.', 404);
    if (record.status !== 'PENDING_APPROVAL') throw new FinanceError('Finalized financial records are immutable.', 409);
    if (record.createdById === actorId) throw new FinanceError('The person who created a financial record cannot approve or reject it.', 403);
    const data = normalizedDecision === 'APPROVE'
      ? { status: 'APPROVED', approvedById: actorId, approvedAt: new Date() }
      : { status: 'REJECTED', rejectedById: actorId, rejectionReason };
    const updated = await tx[model].update({ where: { id: recordId }, data });
    await recordFinanceAudit(tx, {
      actorId,
      facilityId: record.facilityId,
      action: `${normalizedType}_${normalizedDecision}D`,
      entityType: normalizedType === 'REVENUE' ? 'REVENUE_RECORD' : 'FINANCIAL_ADJUSTMENT',
      entityId: recordId,
      details: normalizedDecision === 'REJECT' ? rejectionReason : 'Approved by a second authorized finance user.',
    });
    return updated;
  }, { isolationLevel: 'Serializable' });
}

export async function createRefundRequest(body, actorId, facilityId) {
  requireModels('refundRequest', 'payment', 'financialAuditLog');
  const data = validateRefundRequest(body);
  try {
    return await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findFirst({
        where: {
          id: data.paymentId,
          status: 'SUCCESSFUL',
          ...(facilityId ? scopedEventRelation(facilityId) : {}),
        },
        include: { refundRequests: { where: { status: { in: ['REQUESTED', 'APPROVED', 'COMPLETED'] } } } },
      });
      if (!payment) throw new FinanceError('Only a successful payment in the authorized facility can be considered for refund.', 404);
      const reserved = payment.refundRequests.reduce((sum, refund) => sum + refund.amount, 0);
      if (Math.round((reserved + data.amount) * 100) > Math.round(payment.amount * 100)) {
        throw new FinanceError('Requested and previously completed/approved refunds cannot exceed the captured payment amount.', 409);
      }
      const request = await tx.refundRequest.create({
        data: { ...data, reference: `RFD-${crypto.randomBytes(12).toString('hex').toUpperCase()}`, currency: payment.currency, requestedById: actorId },
      });
      await recordFinanceAudit(tx, { actorId, facilityId, action: 'REFUND_REQUEST_CREATED', entityType: 'REFUND_REQUEST', entityId: request.id, details: `Refund request ${request.reference} for ${data.amount} ${payment.currency}.` });
      return request;
    }, { isolationLevel: 'Serializable' });
  } catch (error) {
    if (error instanceof FinanceError) throw error;
    if (error.code === 'P2034') throw new FinanceError('Another refund request changed this payment; reload and try again.', 409);
    throw error;
  }
}

export async function reviewRefund({ refundId, decision, reason, actorId, facilityId }) {
  requireModels('refundRequest', 'payment', 'financialAuditLog');
  const normalizedDecision = requiredText(decision, 'Decision', 20).toUpperCase();
  if (!['APPROVE', 'REJECT'].includes(normalizedDecision)) throw new FinanceError('Decision must be APPROVE or REJECT.');
  const rejectionReason = normalizedDecision === 'REJECT' ? requiredText(reason, 'Rejection reason', 2000) : null;
  return prisma.$transaction(async (tx) => {
    const request = await tx.refundRequest.findFirst({
      where: { id: refundId, payment: { is: facilityId ? scopedEventRelation(facilityId) : {} } },
    });
    if (!request) throw new FinanceError('Refund request was not found in the authorized facility.', 404);
    if (request.status !== 'REQUESTED') throw new FinanceError('Only a pending refund request can be reviewed.', 409);
    if (request.requestedById === actorId) throw new FinanceError('The requester cannot approve or reject their own refund request.', 403);
    const updated = await tx.refundRequest.update({
      where: { id: refundId },
      data: normalizedDecision === 'APPROVE'
        ? { status: 'APPROVED', approvedById: actorId, reviewedAt: new Date() }
        : { status: 'REJECTED', rejectedById: actorId, reviewedAt: new Date(), providerConfirmation: rejectionReason },
    });
    await recordFinanceAudit(tx, {
      actorId,
      facilityId,
      action: `REFUND_${normalizedDecision}D`,
      entityType: 'REFUND_REQUEST',
      entityId: refundId,
      details: normalizedDecision === 'APPROVE'
        ? 'Approved for provider processing; awaiting verified provider confirmation before completion.'
        : rejectionReason,
    });
    return updated;
  }, { isolationLevel: 'Serializable' });
}

export async function completeProviderRefund({ refundId, providerRefundReference, providerConfirmation, actorId, facilityId }) {
  requireModels('refundRequest', 'payment', 'financialAuditLog');
  const ref = requiredText(providerRefundReference, 'Provider refund reference', 120);
  const conf = requiredText(providerConfirmation, 'Provider confirmation details', 2000);
  return prisma.$transaction(async (tx) => {
    const request = await tx.refundRequest.findFirst({
      where: { id: refundId, payment: { is: facilityId ? scopedEventRelation(facilityId) : {} } },
      include: { payment: true },
    });
    if (!request) throw new FinanceError('Refund request was not found in the authorized facility.', 404);
    if (request.status !== 'APPROVED') {
      throw new FinanceError('Only an approved refund request can be completed with verified provider confirmation.', 409);
    }
    const updated = await tx.refundRequest.update({
      where: { id: refundId },
      data: {
        status: 'COMPLETED',
        providerRefundReference: ref,
        providerConfirmation: conf,
        completedAt: new Date(),
      },
    });

    const allRefunds = await tx.refundRequest.findMany({
      where: { paymentId: request.paymentId, status: 'COMPLETED' },
      select: { amount: true },
    });
    const totalCompleted = allRefunds.reduce((sum, r) => sum + r.amount, 0);
    if (Math.round(totalCompleted * 100) >= Math.round(request.payment.amount * 100)) {
      await tx.payment.update({
        where: { id: request.paymentId },
        data: { status: 'REVERSED' },
      });
    }

    await recordFinanceAudit(tx, {
      actorId,
      facilityId,
      action: 'REFUND_COMPLETED',
      entityType: 'REFUND_REQUEST',
      entityId: refundId,
      details: `Refund completed with verified provider reference ${ref}. Confirmation: ${conf}`,
    });
    return updated;
  }, { isolationLevel: 'Serializable' });
}

export async function createRevenueCategory(body, actorId) {
  requireModels('revenueCategory', 'financialAuditLog');
  const categoryKey = requiredText(body.categoryKey, 'Category key', 50).toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  const label = requiredText(body.label, 'Category label', 100);
  const description = body.description ? requiredText(body.description, 'Description', 500) : null;
  return prisma.$transaction(async (tx) => {
    const existing = await tx.revenueCategory.findUnique({ where: { categoryKey } });
    if (existing) throw new FinanceError(`Revenue category key '${categoryKey}' already exists.`, 409);
    const category = await tx.revenueCategory.create({
      data: { categoryKey, label, description, createdById: actorId },
    });
    await recordFinanceAudit(tx, {
      actorId,
      facilityId: null,
      action: 'REVENUE_CATEGORY_CREATED',
      entityType: 'REVENUE_CATEGORY',
      entityId: category.id,
      details: `Created revenue category ${label} (${categoryKey}).`,
    });
    return category;
  });
}

export async function reconcileSinglePayment({ paymentId, statementLineId, actorId, facilityId }) {
  requireModels('providerStatementLine', 'paymentReconciliation', 'payment', 'financialAuditLog');
  const pid = requiredText(paymentId, 'Payment ID', 100);
  const lid = requiredText(statementLineId, 'Statement line ID', 100);
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { id: pid, ...(facilityId ? scopedEventRelation(facilityId) : {}) },
      include: { reconciliation: { select: { id: true } } },
    });
    if (!payment) throw new FinanceError('Payment not found in authorized facility.', 404);
    if (payment.reconciliation) throw new FinanceError('Payment is already reconciled.', 409);

    const line = await tx.providerStatementLine.findUnique({ where: { id: lid } });
    if (!line) throw new FinanceError('Statement line not found.', 404);
    if (line.matchStatus === 'MATCHED') throw new FinanceError('Statement line is already matched.', 409);

    const evaluation = evaluateStatementMatch(line, payment);
    if (evaluation.matchStatus !== 'MATCHED') {
      throw new FinanceError(`Cannot reconcile: ${evaluation.matchReason}`, 400);
    }

    await tx.providerStatementLine.update({
      where: { id: line.id },
      data: { matchStatus: 'MATCHED', matchReason: null, paymentId: payment.id },
    });

    const reconciliation = await tx.paymentReconciliation.create({
      data: {
        paymentId: payment.id,
        statementLineId: line.id,
        providerReference: line.providerReference,
        amount: line.amount,
        currency: line.currency,
        reconciledById: actorId,
      },
    });

    await recordFinanceAudit(tx, {
      actorId,
      facilityId,
      action: 'PAYMENT_RECONCILED',
      entityType: 'PAYMENT',
      entityId: payment.id,
      details: `Manually matched payment ${payment.paymentRef} with statement reference ${line.providerReference}.`,
    });

    return reconciliation;
  }, { isolationLevel: 'Serializable' });
}

export function toCsvCell(value) {
  const text = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function filterDateRange(searchParams) {
  const range = reportDateWhere(searchParams);
  return { from: range.gte || null, to: range.lte || null };
}

export function statusIsFinal(status) {
  return FINAL_RECORD_STATES.has(status);
}
