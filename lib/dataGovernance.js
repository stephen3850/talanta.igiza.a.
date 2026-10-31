import crypto from 'crypto';
import { authorizeManagedUser } from './iam.js';
import { prisma } from './prisma.js';

const CLASSIFICATIONS = new Set(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED']);
const REQUEST_TYPES = new Set(['ACCESS', 'CORRECTION', 'ERASURE', 'OBJECTION', 'PORTABILITY', 'RESTRICTION', 'OTHER']);
const REQUEST_STATUSES = new Set(['RECEIVED', 'VERIFYING', 'IN_REVIEW', 'ON_HOLD', 'COMPLETED', 'DECLINED']);
const RETENTION_ACTIONS = new Set(['REVIEWED', 'PRESERVE', 'RELEASE_HOLD', 'DELETE_APPROVED']);
const INVENTORY_CATALOG = [
  {
    categoryKey: 'customer-accounts',
    label: 'Customer account information',
    description: 'Account identifiers and contact details supplied for account access and customer support.',
    purposes: ['Account administration', 'Authentication', 'Customer support'],
    modules: ['Registration', 'Authentication', 'Customer accounts'],
    systems: ['Talanta web application', 'PostgreSQL application database'],
    thirdParties: [],
    classification: 'CONFIDENTIAL',
  },
  {
    categoryKey: 'booking-payment-records',
    label: 'Booking and payment records',
    description: 'Booking references, payment states, and limited transaction metadata used to process and reconcile purchases.',
    purposes: ['Booking fulfilment', 'Payment reconciliation', 'Financial record keeping'],
    modules: ['Ticket booking', 'Orders', 'M-PESA callback handling'],
    systems: ['Talanta web application', 'PostgreSQL application database'],
    thirdParties: ['Safaricom Daraja/M-PESA only when configured; live connectivity is not asserted'],
    classification: 'RESTRICTED',
  },
  {
    categoryKey: 'ticket-credentials',
    label: 'Digital ticket credentials',
    description: 'Ticket identifiers and validation state used to issue and validate venue entry credentials.',
    purposes: ['Ticket delivery', 'Entry validation', 'Duplicate-entry prevention'],
    modules: ['Tickets', 'Gate validation'],
    systems: ['Talanta web application', 'PostgreSQL application database'],
    thirdParties: [],
    classification: 'RESTRICTED',
  },
  {
    categoryKey: 'staff-accreditation',
    label: 'Staff and contractor accreditation',
    description: 'Accreditation and assignment information supplied for workforce administration.',
    purposes: ['Accreditation review', 'Workforce administration', 'Access assignment'],
    modules: ['Staff accreditation', 'Physical access control'],
    systems: ['Talanta web application', 'PostgreSQL application database'],
    thirdParties: [],
    classification: 'CONFIDENTIAL',
  },
  {
    categoryKey: 'security-and-incident-records',
    label: 'Security, access and incident records',
    description: 'Operational event and incident metadata, including pseudonymous identifiers where supported.',
    purposes: ['Safety response', 'Security operations', 'Audit and investigation'],
    modules: ['SOC', 'Incident management', 'Access control'],
    systems: ['Talanta web application', 'PostgreSQL application database'],
    thirdParties: [],
    classification: 'RESTRICTED',
  },
  {
    categoryKey: 'cctv-event-metadata',
    label: 'CCTV integration metadata',
    description: 'Camera configuration and event metadata. This inventory does not enable facial recognition or biometric identification.',
    purposes: ['Camera integration administration', 'Operational incident review'],
    modules: ['CCTV/VMS integration'],
    systems: ['Talanta web application'],
    thirdParties: [],
    classification: 'RESTRICTED',
  },
  {
    categoryKey: 'iot-and-facility-telemetry',
    label: 'IoT and facility telemetry',
    description: 'Device and facility measurements. Occupancy measurements must remain aggregate and non-identifying.',
    purposes: ['Infrastructure monitoring', 'Maintenance planning', 'Facility operations'],
    modules: ['IoT', 'Building management', 'Energy and water monitoring'],
    systems: ['Talanta web application', 'PostgreSQL application database'],
    thirdParties: [],
    classification: 'INTERNAL',
  },
];

export class GovernanceError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'GovernanceError';
    this.status = status;
  }
}

export async function authorizeGovernanceAdmin(req) {
  return authorizeManagedUser(req, ['SYSTEM_ADMIN']);
}

function requireModels(...models) {
  if (!process.env.DATABASE_URL || models.some((model) => !prisma?.[model])) {
    throw new GovernanceError('Governance database schema is unavailable; apply its migration and regenerate Prisma Client.', 503);
  }
}

function text(value, field, max = 500) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new GovernanceError(`${field} is required and must be at most ${max} characters.`);
  }
  return value.trim();
}

function stringList(value, field, maxItems = 20) {
  if (!Array.isArray(value) || value.length > maxItems || value.some((entry) => typeof entry !== 'string' || !entry.trim() || entry.length > 200)) {
    throw new GovernanceError(`${field} must be a list of up to ${maxItems} non-empty text values.`);
  }
  return [...new Set(value.map((entry) => entry.trim()))];
}

function validDate(value, field) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw new GovernanceError(`${field} must be a valid date.`);
  return date;
}

export function validateInventoryInput(body) {
  const categoryKey = text(body.categoryKey, 'Category key', 80).toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]*$/.test(categoryKey)) throw new GovernanceError('Category key may contain lowercase letters, numbers, and hyphens only.');
  const classification = text(body.classification, 'Classification', 20).toUpperCase();
  if (!CLASSIFICATIONS.has(classification)) throw new GovernanceError('Choose a supported data classification.');
  if (body.active !== undefined && typeof body.active !== 'boolean') throw new GovernanceError('Active must be true or false.');
  return {
    categoryKey,
    label: text(body.label, 'Label', 120),
    description: text(body.description, 'Description', 4000),
    purposes: stringList(body.purposes, 'Purposes'),
    modules: stringList(body.modules, 'Modules'),
    systems: stringList(body.systems, 'Systems'),
    thirdParties: stringList(body.thirdParties, 'Third parties'),
    classification,
    ownerRole: text(body.ownerRole || 'SYSTEM_ADMIN', 'Owner role', 80),
    active: body.active === undefined ? true : body.active,
  };
}

export async function ensureInventoryCatalog() {
  requireModels('dataInventoryItem');
  await prisma.dataInventoryItem.createMany({
    data: INVENTORY_CATALOG.map((item) => ({ ...item, createdById: 'SYSTEM_CATALOG' })),
    skipDuplicates: true,
  });
}

export async function recordGovernanceAudit({ actorId, action, entityType, entityId, result = 'SUCCESS' }) {
  requireModels('governanceAccessAudit');
  await prisma.governanceAccessAudit.create({
    data: { actorId, action, entityType, entityId: entityId || null, result },
  });
}

function encryptionKey() {
  const encoded = process.env.GOVERNANCE_ENCRYPTION_KEY_B64;
  if (encoded) {
    const key = Buffer.from(encoded, 'base64');
    if (key.length !== 32) throw new GovernanceError('GOVERNANCE_ENCRYPTION_KEY_B64 must decode to exactly 32 bytes.', 503);
    return key;
  }
  if (process.env.NODE_ENV === 'production') throw new GovernanceError('GOVERNANCE_ENCRYPTION_KEY_B64 must be configured in production.', 503);
  return crypto.createHash('sha256').update('Talanta local development governance key; never use in production').digest();
}

function encryptContact(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${ciphertext.toString('base64url')}`;
}

export function decryptRequestContact(value) {
  const [encodedIv, encodedTag, encodedData] = value.split('.');
  if (!encodedIv || !encodedTag || !encodedData) throw new GovernanceError('Stored request contact is invalid.', 503);
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(encodedIv, 'base64url'));
    decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(encodedData, 'base64url')), decipher.final()]).toString('utf8');
  } catch (error) {
    if (error instanceof GovernanceError) throw error;
    throw new GovernanceError('Request contact could not be decrypted; check the configured encryption key.', 503);
  }
}

function subjectHash(reference) {
  const key = process.env.GOVERNANCE_SUBJECT_HASH_KEY;
  if ((!key || key.length < 32) && process.env.NODE_ENV === 'production') {
    throw new GovernanceError('GOVERNANCE_SUBJECT_HASH_KEY must contain at least 32 characters in production.', 503);
  }
  return crypto.createHmac('sha256', key || 'Talanta local development subject hash key').update(reference.trim().toLowerCase()).digest('hex');
}

export function validateConsentInput(body, actorId) {
  const legalBasis = text(body.legalBasis, 'Legal basis', 80);
  const status = text(body.status || 'GRANTED', 'Consent status', 20).toUpperCase();
  if (!['GRANTED', 'WITHDRAWN'].includes(status)) throw new GovernanceError('Consent status must be GRANTED or WITHDRAWN.');
  return {
    subjectHash: subjectHash(text(body.subjectReference, 'Subject reference', 320)),
    categoryKey: text(body.categoryKey, 'Data category', 80),
    purpose: text(body.purpose, 'Purpose', 1000),
    noticeVersion: text(body.noticeVersion, 'Privacy notice version', 40),
    legalBasis,
    status,
    recordedById: actorId,
    grantedAt: status === 'GRANTED' ? new Date() : null,
    withdrawnAt: status === 'WITHDRAWN' ? new Date() : null,
  };
}

export function validateRequestInput(body, actorId) {
  const requestType = text(body.requestType, 'Request type', 30).toUpperCase();
  if (!REQUEST_TYPES.has(requestType)) throw new GovernanceError('Choose a supported data-subject request type.');
  const contact = text(body.contact, 'Contact email', 320);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) throw new GovernanceError('Enter a valid contact email address.');
  const at = contact.lastIndexOf('@');
  const contactHint = `${contact.slice(0, 1)}***@${contact.slice(at + 1)}`;
  const categories = stringList(body.requestedCategories || [], 'Requested categories');
  const dueAt = body.dueAt ? validDate(body.dueAt, 'Due date') : null;
  return {
    reference: `DSR-${crypto.randomBytes(12).toString('hex').toUpperCase()}`,
    requestType,
    subjectContactCiphertext: encryptContact(contact),
    contactHint,
    requestedCategories: categories,
    dueAt,
    createdById: actorId,
  };
}

export function validateRequestUpdate(body) {
  const update = {};
  if (body.status !== undefined) {
    const status = text(body.status, 'Request status', 20).toUpperCase();
    if (!REQUEST_STATUSES.has(status)) throw new GovernanceError('Choose a supported request status.');
    update.status = status;
    update.resolvedAt = ['COMPLETED', 'DECLINED'].includes(status) ? new Date() : null;
  }
  if (body.assignedToId !== undefined) update.assignedToId = body.assignedToId === null ? null : text(body.assignedToId, 'Assignee ID', 100);
  if (body.notes !== undefined) update.notes = body.notes === '' ? null : text(body.notes, 'Notes', 4000);
  if (body.preservationHold !== undefined) {
    if (typeof body.preservationHold !== 'boolean') throw new GovernanceError('Preservation hold must be true or false.');
    update.preservationHold = body.preservationHold;
    update.holdReason = body.preservationHold ? text(body.holdReason, 'Hold reason', 1000) : null;
  }
  if (!Object.keys(update).length) throw new GovernanceError('Provide a supported request update.');
  return update;
}

export function validateProcessorInput(body, actorId) {
  const providerKey = text(body.providerKey, 'Provider key', 80).toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9_-]*$/.test(providerKey)) throw new GovernanceError('Provider key may contain uppercase letters, numbers, hyphens, and underscores only.');
  const integrationStatus = text(body.integrationStatus || 'PENDING_REVIEW', 'Integration status', 40).toUpperCase();
  const agreementStatus = text(body.agreementStatus || 'REVIEW_REQUIRED', 'Agreement status', 40).toUpperCase();
  if (!['PENDING_REVIEW', 'CONFIGURED', 'DISCONNECTED', 'SIMULATED'].includes(integrationStatus)) throw new GovernanceError('Choose a supported, non-verified integration status.');
  if (!['REVIEW_REQUIRED', 'UNDER_REVIEW', 'APPROVED', 'NOT_APPLICABLE'].includes(agreementStatus)) throw new GovernanceError('Choose a supported processor-agreement review status.');
  return {
    providerKey,
    displayName: text(body.displayName, 'Provider name', 120),
    categories: stringList(body.categories, 'Shared data categories'),
    purpose: text(body.purpose, 'Processing purpose', 2000),
    systems: stringList(body.systems, 'Systems'),
    integrationStatus,
    agreementStatus,
    responsibleAdminId: actorId,
  };
}

export function validateNoticeInput(body, actorId) {
  const status = text(body.status || 'DRAFT', 'Notice status', 20).toUpperCase();
  if (!['DRAFT', 'PUBLISHED', 'RETIRED'].includes(status)) throw new GovernanceError('Notice status must be DRAFT, PUBLISHED, or RETIRED.');
  return {
    version: text(body.version, 'Notice version', 40),
    title: text(body.title, 'Notice title', 160),
    body: text(body.body, 'Notice content', 12000),
    legalBasis: text(body.legalBasis || 'REQUIRES_REVIEW', 'Legal basis', 80),
    status,
    publishedAt: status === 'PUBLISHED' ? new Date() : null,
    createdById: actorId,
  };
}

export function validateRetentionPolicyInput(body, actorId) {
  const retentionDays = Number(body.retentionDays);
  const reviewCycleDays = Number(body.reviewCycleDays);
  if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 36500) {
    throw new GovernanceError('Retention period must be an integer from 1 to 36500 days.');
  }
  if (!Number.isInteger(reviewCycleDays) || reviewCycleDays < 1 || reviewCycleDays > 3650) {
    throw new GovernanceError('Review cycle must be an integer from 1 to 3650 days.');
  }
  if (body.enabled !== undefined && typeof body.enabled !== 'boolean') throw new GovernanceError('Enabled must be true or false.');
  if (body.preservationHold !== undefined && typeof body.preservationHold !== 'boolean') throw new GovernanceError('Preservation hold must be true or false.');
  return {
    categoryKey: text(body.categoryKey, 'Data category', 80),
    retentionDays,
    reviewCycleDays,
    enabled: body.enabled === undefined ? true : body.enabled,
    preservationHold: body.preservationHold === undefined ? false : body.preservationHold,
    preservationReason: body.preservationHold ? text(body.preservationReason, 'Preservation reason', 1000) : null,
    approvedById: actorId,
    nextReviewAt: body.nextReviewAt ? validDate(body.nextReviewAt, 'Next review date') : null,
  };
}

export function deletionApprovalBlocked(policyHold, recordHold) {
  return Boolean(policyHold || recordHold);
}

export async function getGovernanceDashboard() {
  requireModels('dataInventoryItem', 'governanceProcessor', 'privacyNotice', 'privacyConsent', 'dataSubjectRequest', 'retentionPolicy', 'retentionReview', 'governanceAccessAudit');
  await ensureInventoryCatalog();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [categories, processors, requests, retentionDue, retentionPolicies, retentionReviews, notices, recentAudits, recentAuditCount, consentCount] = await Promise.all([
    prisma.dataInventoryItem.findMany({ where: { active: true }, orderBy: { label: 'asc' } }),
    prisma.governanceProcessor.findMany({ orderBy: { displayName: 'asc' } }),
    prisma.dataSubjectRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, reference: true, requestType: true, contactHint: true, requestedCategories: true, status: true, assignedToId: true, notes: true, preservationHold: true, holdReason: true, dueAt: true, resolvedAt: true, createdAt: true, updatedAt: true },
    }),
    prisma.retentionPolicy.findMany({
      where: { enabled: true, nextReviewAt: { lte: new Date() } },
      orderBy: { nextReviewAt: 'asc' },
      take: 100,
    }),
    prisma.retentionPolicy.findMany({ orderBy: { categoryKey: 'asc' } }),
    prisma.retentionReview.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.privacyNotice.findMany({ orderBy: { updatedAt: 'desc' }, take: 50 }),
    prisma.governanceAccessAudit.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, orderBy: { createdAt: 'desc' }, take: 50 }),
    prisma.governanceAccessAudit.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.privacyConsent.count(),
  ]);
  const requestCounts = await prisma.dataSubjectRequest.groupBy({ by: ['status'], _count: { _all: true } });
  return {
    categories,
    processors,
    requests,
    retentionDue,
    retentionPolicies,
    retentionReviews,
    notices,
    consentCount,
    requestCounts: Object.fromEntries(requestCounts.map(({ status, _count }) => [status, _count._all])),
    accessAuditSummary: { lastSevenDays: recentAuditCount, recent: recentAudits },
  };
}

export async function createPrivacyRequest(body, actorId) {
  requireModels('dataSubjectRequest', 'governanceAccessAudit');
  const data = validateRequestInput(body, actorId);
  return prisma.$transaction(async (tx) => {
    const request = await tx.dataSubjectRequest.create({ data });
    await tx.governanceAccessAudit.create({
      data: { actorId, action: 'PRIVACY_REQUEST_CREATED', entityType: 'DATA_SUBJECT_REQUEST', entityId: request.id },
    });
    return { id: request.id, reference: request.reference, status: request.status, contactHint: request.contactHint, createdAt: request.createdAt };
  });
}

export async function createRetentionReview({ policyId, recordReference, action, rationale, actorId }) {
  requireModels('retentionPolicy', 'retentionReview', 'governanceAccessAudit');
  const normalizedAction = text(action, 'Retention action', 30).toUpperCase();
  if (!RETENTION_ACTIONS.has(normalizedAction)) throw new GovernanceError('Choose REVIEWED, PRESERVE, RELEASE_HOLD, or DELETE_APPROVED.');
  const reference = text(recordReference, 'Record reference', 160);
  const reason = text(rationale, 'Rationale', 2000);
  return prisma.$transaction(async (tx) => {
    const policy = await tx.retentionPolicy.findUnique({ where: { id: policyId } });
    if (!policy) throw new GovernanceError('Retention policy was not found.', 404);
    const latest = await tx.retentionReview.findFirst({
      where: { policyId, recordReference: reference },
      orderBy: { createdAt: 'desc' },
    });
    if (normalizedAction === 'DELETE_APPROVED' && deletionApprovalBlocked(policy.preservationHold, latest?.preservationHold)) {
      throw new GovernanceError('Deletion approval is blocked while a preservation hold is active.', 409);
    }
    if (normalizedAction === 'PRESERVE' && !reason.trim()) throw new GovernanceError('A preservation reason is required.');
    const preservationHold = normalizedAction === 'PRESERVE' ? true : normalizedAction === 'RELEASE_HOLD' ? false : Boolean(latest?.preservationHold);
    const review = await tx.retentionReview.create({
      data: { policyId, recordReference: reference, action: normalizedAction, rationale: reason, preservationHold, actorId },
    });
    await tx.governanceAccessAudit.create({
      data: { actorId, action: `RETENTION_${normalizedAction}`, entityType: 'RETENTION_REVIEW', entityId: review.id },
    });
    return review;
  });
}

export function maskedRequestContact(request) {
  return request.contactHint;
}

export function decryptContactForRequest(request) {
  return decryptRequestContact(request.subjectContactCiphertext);
}
