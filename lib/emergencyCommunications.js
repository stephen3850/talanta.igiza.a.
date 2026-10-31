import crypto from 'crypto';
import { prisma } from './prisma.js';
import { verifySessionToken } from './auth.js';
import { getIncidentById, initialIncidents } from './incidentManagement.js';

export const COMMUNICATION_CATEGORIES = ['OPERATIONAL', 'EVENT', 'SAFETY', 'EMERGENCY'];
export const COMMUNICATION_CHANNELS = ['PUBLIC_ADDRESS', 'DIGITAL_SIGNAGE', 'PA_AND_SIGNAGE'];
export const COMMUNICATION_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];
export const COMMUNICATION_STATUSES = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'CANCELLED'];
export const COMMUNICATION_SYSTEM_TYPES = ['PUBLIC_ADDRESS', 'DIGITAL_SIGNAGE'];
export const CONFIGURABLE_OPERATOR_ROLES = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD', 'FINANCE_OFFICER'];
export const CONFIGURABLE_SUPERVISOR_ROLES = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR'];

const initialPolicy = {
  operatorRoles: ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD'],
  supervisorRoles: ['SYSTEM_ADMIN', 'VENUE_MANAGER'],
};

const defaultTemplates = [
  { templateKey: 'GENERAL_OPERATIONAL', name: 'Operational update', category: 'OPERATIONAL', channel: 'PUBLIC_ADDRESS', titleTemplate: 'Operational update', bodyTemplate: 'Please follow instructions from stadium staff.' },
  { templateKey: 'EVENT_GUEST_GUIDANCE', name: 'Event guest guidance', category: 'EVENT', channel: 'PA_AND_SIGNAGE', titleTemplate: 'Guest information', bodyTemplate: 'For assistance, please contact the nearest stadium steward.' },
  { templateKey: 'SAFETY_HOLD', name: 'Safety instruction', category: 'SAFETY', channel: 'PA_AND_SIGNAGE', titleTemplate: 'Safety instruction', bodyTemplate: 'Please remain calm and follow directions from authorized stadium personnel.' },
  { templateKey: 'EMERGENCY_REVIEW', name: 'Emergency message (review required)', category: 'EMERGENCY', channel: 'PA_AND_SIGNAGE', titleTemplate: 'Emergency message — review required', bodyTemplate: 'DRAFT ONLY: enter verified, authorized instructions. Confirm wording with the incident lead before approval.' },
];

const messages = [];
const templates = defaultTemplates.map((template, index) => ({ ...template, id: `SIM-TEMPLATE-${index + 1}`, isActive: true, isSimulated: true }));
const integrations = [
  { id: 'SIM-PA-INTEGRATION', systemType: 'PUBLIC_ADDRESS', providerName: 'Development PA adapter', protocol: 'VENDOR_API_HTTPS', endpointUrl: null, connectionStatus: 'UNVERIFIED', isSimulated: true },
  { id: 'SIM-SIGNAGE-INTEGRATION', systemType: 'DIGITAL_SIGNAGE', providerName: 'Development signage adapter', protocol: 'VENDOR_API_HTTPS', endpointUrl: null, connectionStatus: 'UNVERIFIED', isSimulated: true },
];
const approvals = [];
const auditRecords = [];
let currentPolicy = { ...initialPolicy };

export class EmergencyCommunicationsError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'EmergencyCommunicationsError';
    this.status = status;
  }
}

function sessionFromRequest(req) {
  const authorization = req.headers.get('authorization') || '';
  if (authorization.startsWith('Bearer ')) return authorization.slice(7).trim();
  const cookie = (req.headers.get('cookie') || '').split(';').map((part) => part.trim())
    .find((part) => part.startsWith('talanta_session='));
  return cookie ? decodeURIComponent(cookie.slice('talanta_session='.length)) : null;
}

export function authorizeCommunicationsRequest(req, permission = 'view') {
  const user = verifySessionToken(sessionFromRequest(req));
  if (!user?.id || !user.role) {
    return { authorized: false, status: 401, message: 'A valid signed-in staff session is required.' };
  }
  if (user.isDemo && process.env.NODE_ENV === 'production') {
    return { authorized: false, status: 403, message: 'Demo sessions cannot access production emergency communications.' };
  }
  const roleSets = {
    view: [...new Set([...CONFIGURABLE_OPERATOR_ROLES, ...CONFIGURABLE_SUPERVISOR_ROLES])],
    manage: ['SYSTEM_ADMIN'],
    prepare: [...new Set([...CONFIGURABLE_OPERATOR_ROLES, ...CONFIGURABLE_SUPERVISOR_ROLES])],
    approve: [...new Set([...CONFIGURABLE_SUPERVISOR_ROLES])],
  };
  if (!roleSets[permission]?.includes(user.role)) {
    return { authorized: false, status: 403, message: 'Your role is not authorized for this emergency communications operation.' };
  }
  return { authorized: true, user };
}

export async function readCommunicationsJson(req) {
  try { return await req.json(); }
  catch { throw new EmergencyCommunicationsError('Request body must be valid JSON.'); }
}

export function communicationsErrorResponse(error) {
  const status = error instanceof EmergencyCommunicationsError ? error.status : 500;
  if (!(error instanceof EmergencyCommunicationsError)) console.error('[Emergency communications API]', error);
  return Response.json({
    success: false,
    message: error instanceof EmergencyCommunicationsError ? error.message : 'Emergency communications request failed.',
  }, { status });
}

function persistentMode(simulatedOnly = false) {
  if (simulatedOnly) return false;
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') throw new EmergencyCommunicationsError('Emergency communications database is not configured.', 503);
    return false;
  }
  if (process.env.NODE_ENV === 'production') auditKey();
  if (!prisma?.emergencyCommunicationMessage || !prisma?.emergencyCommunicationIntegration || !prisma?.emergencyCommunicationAuditLog || !prisma?.emergencyCommunicationPolicy || !prisma?.emergencyCommunicationTemplate) {
    throw new EmergencyCommunicationsError('Emergency communications Prisma client is outdated; regenerate and deploy the schema.', 503);
  }
  return true;
}

function requiredText(value, field, max = 180) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new EmergencyCommunicationsError(`${field} is required and must be at most ${max} characters.`);
  }
  return value.trim();
}

function optionalText(value, field, max = 240) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > max) throw new EmergencyCommunicationsError(`${field} must be at most ${max} characters.`);
  return value.trim() || null;
}

function reference(prefix) {
  return `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function auditKey() {
  const key = process.env.EMERGENCY_COMMS_AUDIT_KEY || (process.env.NODE_ENV === 'production' ? null : process.env.JWT_SECRET || 'local-development-emergency-comms-key');
  if (!key) throw new EmergencyCommunicationsError('EMERGENCY_COMMS_AUDIT_KEY must be configured in the production secret manager.', 503);
  return key;
}

async function getPolicy(simulatedOnly = false) {
  if (persistentMode(simulatedOnly)) {
    const saved = await prisma.emergencyCommunicationPolicy.findUnique({ where: { policyKey: 'DEFAULT' } });
    if (!saved) return { ...initialPolicy };
    return { operatorRoles: JSON.parse(saved.operatorRoles), supervisorRoles: JSON.parse(saved.supervisorRoles) };
  }
  return { operatorRoles: [...currentPolicy.operatorRoles], supervisorRoles: [...currentPolicy.supervisorRoles] };
}

export async function updateCommunicationsPolicy(input, actor, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new EmergencyCommunicationsError('A permissions policy is required.');
  const operatorRoles = normalizeRoles(input.operatorRoles, CONFIGURABLE_OPERATOR_ROLES, 'operator');
  const supervisorRoles = normalizeRoles(input.supervisorRoles, CONFIGURABLE_SUPERVISOR_ROLES, 'supervisor');
  if (!supervisorRoles.includes('SYSTEM_ADMIN')) throw new EmergencyCommunicationsError('SYSTEM_ADMIN must remain a supervisor role.');
  if (!operatorRoles.some((role) => supervisorRoles.includes(role))) throw new EmergencyCommunicationsError('At least one supervisor role must also be an operator role.');
  const data = {
    operatorRoles: JSON.stringify(operatorRoles),
    supervisorRoles: JSON.stringify(supervisorRoles),
    updatedById: actor.id,
    updatedByEmail: actor.email || 'unknown',
  };
  if (persistentMode(simulatedOnly)) {
    const policy = await prisma.emergencyCommunicationPolicy.upsert({
      where: { policyKey: 'DEFAULT' },
      create: { policyKey: 'DEFAULT', ...data },
      update: data,
    });
    await recordAudit(actor, 'PERMISSIONS_POLICY_UPDATED', null, { operatorRoles, supervisorRoles }, false);
    return { operatorRoles, supervisorRoles, updatedAt: policy.updatedAt, isSimulated: false };
  }
  currentPolicy = { operatorRoles, supervisorRoles };
  await recordAudit(actor, 'PERMISSIONS_POLICY_UPDATED', null, { operatorRoles, supervisorRoles }, true);
  return { ...currentPolicy, isSimulated: true };
}

function normalizeRoles(roles, allowed, label) {
  if (!Array.isArray(roles) || roles.length === 0 || roles.length > allowed.length || roles.some((role) => !allowed.includes(role)) || new Set(roles).size !== roles.length) {
    throw new EmergencyCommunicationsError(`Choose one or more valid ${label} roles.`);
  }
  return [...roles];
}

export async function listCommunicationTemplates({ simulatedOnly = false } = {}) {
  if (persistentMode(simulatedOnly)) {
    const stored = await prisma.emergencyCommunicationTemplate.findMany({ where: { isActive: true }, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    const storedKeys = new Set(stored.map((template) => template.templateKey));
    return [...stored, ...templates.filter((template) => !storedKeys.has(template.templateKey))];
  }
  return templates.filter((template) => template.isActive);
}

export async function createCommunicationTemplate(input, actor, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new EmergencyCommunicationsError('A message template is required.');
  const category = requiredText(input.category, 'Category', 32).toUpperCase();
  const channel = requiredText(input.channel, 'Channel', 32).toUpperCase();
  if (!COMMUNICATION_CATEGORIES.includes(category) || !COMMUNICATION_CHANNELS.includes(channel)) throw new EmergencyCommunicationsError('Select a supported message category and channel.');
  const template = {
    templateKey: requiredText(input.templateKey || reference('TPL'), 'Template key', 64).toUpperCase().replace(/[^A-Z0-9_-]/g, '_'),
    name: requiredText(input.name, 'Template name'),
    category,
    channel,
    titleTemplate: requiredText(input.titleTemplate, 'Template title', 180),
    bodyTemplate: requiredText(input.bodyTemplate, 'Template message', 2000),
    isActive: true,
    createdById: actor.id,
    createdByEmail: actor.email || 'unknown',
  };
  if (persistentMode(simulatedOnly)) {
    try {
      const saved = await prisma.emergencyCommunicationTemplate.create({ data: template });
      await recordAudit(actor, 'MESSAGE_TEMPLATE_CREATED', null, { templateKey: saved.templateKey, category }, false);
      return saved;
    } catch (error) {
      if (error.code === 'P2002') throw new EmergencyCommunicationsError('Template key already exists.', 409);
      throw error;
    }
  }
  if (templates.some((item) => item.templateKey === template.templateKey)) throw new EmergencyCommunicationsError('Template key already exists.', 409);
  const saved = { ...template, id: reference('SIM-TEMPLATE'), isSimulated: true, createdAt: new Date(), updatedAt: new Date() };
  templates.push(saved);
  await recordAudit(actor, 'MESSAGE_TEMPLATE_CREATED', null, { templateKey: saved.templateKey, category }, true);
  return saved;
}

export async function createCommunicationMessage(input, actor, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new EmergencyCommunicationsError('A message draft is required.');
  const policy = await getPolicy(simulatedOnly);
  if (!policy.operatorRoles.includes(actor.role)) throw new EmergencyCommunicationsError('Your role is not authorized to prepare messages.', 403);
  const category = requiredText(input.category, 'Category', 32).toUpperCase();
  const priority = requiredText(input.priority || 'NORMAL', 'Priority', 24).toUpperCase();
  const channel = requiredText(input.channel, 'Channel', 32).toUpperCase();
  if (!COMMUNICATION_CATEGORIES.includes(category) || !COMMUNICATION_PRIORITIES.includes(priority) || !COMMUNICATION_CHANNELS.includes(channel)) {
    throw new EmergencyCommunicationsError('Select a supported category, priority, and delivery channel.');
  }
  const incidentReference = optionalText(input.incidentReference, 'Incident reference', 64);
  if (incidentReference && !getIncidentById(incidentReference)) throw new EmergencyCommunicationsError('Linked incident was not found in the incident management register.', 404);
  const templateId = optionalText(input.templateId, 'Template ID', 128);
  const persistent = persistentMode(simulatedOnly);
  let template = null;
  if (templateId) {
    template = persistent
      ? await prisma.emergencyCommunicationTemplate.findUnique({ where: { id: templateId } }) || templates.find((item) => item.id === templateId)
      : templates.find((item) => item.id === templateId);
    if (!template || !template.isActive) throw new EmergencyCommunicationsError('Selected message template is not available.', 404);
    if (template.category !== category) throw new EmergencyCommunicationsError('Message category must match the selected template.');
  }
  const message = {
    messageRef: reference('ECM'),
    title: requiredText(input.title || template?.titleTemplate, 'Message title', 180),
    body: requiredText(input.body || template?.bodyTemplate, 'Message body', 2000),
    category,
    priority,
    channel,
    incidentReference,
    status: 'DRAFT',
    createdById: actor.id,
    createdByEmail: actor.email || 'unknown',
    createdByRole: actor.role,
    isSimulated: !persistent || Boolean(actor.isDemo),
  };
  if (persistent) {
    const saved = await prisma.emergencyCommunicationMessage.create({ data: message });
    await recordAudit(actor, 'MESSAGE_DRAFT_CREATED', saved.messageRef, { category, priority, channel, incidentReference }, false);
    return saved;
  }
  const saved = { ...message, id: reference('SIM-MSG'), createdAt: new Date(), updatedAt: new Date(), approvals: [] };
  messages.unshift(saved);
  await recordAudit(actor, 'MESSAGE_DRAFT_CREATED', saved.messageRef, { category, priority, channel, incidentReference }, true);
  return saved;
}

export async function submitCommunicationForApproval(messageId, actor, { simulatedOnly = false } = {}) {
  const message = await findMessage(messageId, simulatedOnly);
  const policy = await getPolicy(simulatedOnly);
  if (!policy.operatorRoles.includes(actor.role)) throw new EmergencyCommunicationsError('Your role is not an authorized message operator.', 403);
  if (message.status !== 'DRAFT') throw new EmergencyCommunicationsError('Only draft messages can be submitted for approval.', 409);
  message.status = 'PENDING_APPROVAL';
  message.updatedAt = new Date();
  await updatePersistentMessage(message, simulatedOnly);
  await recordAudit(actor, 'MESSAGE_SUBMITTED_FOR_APPROVAL', message.messageRef, { category: message.category }, Boolean(message.isSimulated));
  return message;
}

export async function approveCommunicationMessage(messageId, actor, { simulatedOnly = false, notes } = {}) {
  const message = await findMessage(messageId, simulatedOnly);
  const policy = await getPolicy(simulatedOnly);
  if (!policy.supervisorRoles.includes(actor.role)) throw new EmergencyCommunicationsError('Your role is not authorized to approve messages.', 403);
  if (message.status !== 'PENDING_APPROVAL') throw new EmergencyCommunicationsError('Only messages awaiting approval can be approved.', 409);
  if (message.createdById === actor.id) throw new EmergencyCommunicationsError('A different authorized supervisor must approve this message.', 403);
  if (message.category === 'EMERGENCY' && !policy.supervisorRoles.includes(actor.role)) throw new EmergencyCommunicationsError('Emergency announcements require a configured supervisor approval.');
  const approval = {
    messageId: message.id,
    approverId: actor.id,
    approverEmail: actor.email || 'unknown',
    approverRole: actor.role,
    decision: 'APPROVED',
    notes: optionalText(notes, 'Approval notes', 500),
  };
  if (persistentMode(simulatedOnly)) {
    const savedApproval = await prisma.emergencyCommunicationApproval.create({ data: approval });
    message.approvals = [...(message.approvals || []), savedApproval];
  } else {
    const savedApproval = { ...approval, id: reference('SIM-APPROVAL'), createdAt: new Date(), isSimulated: true };
    approvals.push(savedApproval);
    message.approvals = [...(message.approvals || []), savedApproval];
  }
  message.status = 'APPROVED';
  message.updatedAt = new Date();
  await updatePersistentMessage(message, simulatedOnly);
  await recordAudit(actor, 'MESSAGE_APPROVED', message.messageRef, { category: message.category, notes: approval.notes }, Boolean(message.isSimulated));
  return message;
}

export async function scheduleCommunicationMessage(messageId, input, actor, { simulatedOnly = false } = {}) {
  const message = await findMessage(messageId, simulatedOnly);
  const policy = await getPolicy(simulatedOnly);
  if (!policy.operatorRoles.includes(actor.role)) throw new EmergencyCommunicationsError('Your role is not authorized to schedule messages.', 403);
  if (!['APPROVED', 'SCHEDULED'].includes(message.status)) throw new EmergencyCommunicationsError('Only an approved message can be scheduled.', 409);
  const scheduledAt = new Date(input?.scheduledAt);
  if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) throw new EmergencyCommunicationsError('Choose a valid future schedule time.');
  message.status = 'SCHEDULED';
  message.scheduledAt = scheduledAt;
  message.updatedAt = new Date();
  await updatePersistentMessage(message, simulatedOnly);
  await recordAudit(actor, 'MESSAGE_SCHEDULED', message.messageRef, { scheduledAt: scheduledAt.toISOString(), channel: message.channel }, Boolean(message.isSimulated));
  return message;
}

export async function cancelCommunicationMessage(messageId, actor, { simulatedOnly = false } = {}) {
  const message = await findMessage(messageId, simulatedOnly);
  const policy = await getPolicy(simulatedOnly);
  if (!policy.operatorRoles.includes(actor.role) && !policy.supervisorRoles.includes(actor.role)) {
    throw new EmergencyCommunicationsError('Your role is not authorized to cancel messages.', 403);
  }
  const previousStatus = message.status;
  if (!['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED'].includes(message.status)) throw new EmergencyCommunicationsError('This message can no longer be cancelled.', 409);
  if (message.createdById !== actor.id && actor.role !== 'SYSTEM_ADMIN' && actor.role !== 'VENUE_MANAGER') {
    throw new EmergencyCommunicationsError('Only the message operator or a supervisor can cancel this message.', 403);
  }
  message.status = 'CANCELLED';
  message.cancelledAt = new Date();
  message.updatedAt = new Date();
  await updatePersistentMessage(message, simulatedOnly);
  await recordAudit(actor, 'MESSAGE_CANCELLED', message.messageRef, { previousStatus }, Boolean(message.isSimulated));
  return message;
}

export async function publishCommunicationMessage(messageId, actor, { simulatedOnly = false } = {}) {
  const message = await findMessage(messageId, simulatedOnly);
  const policy = await getPolicy(simulatedOnly);
  if (!policy.supervisorRoles.includes(actor.role)) throw new EmergencyCommunicationsError('A configured supervisor must publish messages.', 403);
  if (!['APPROVED', 'SCHEDULED'].includes(message.status)) throw new EmergencyCommunicationsError('Only an approved, uncancelled message can be published.', 409);
  if (message.status === 'SCHEDULED' && new Date(message.scheduledAt) > new Date()) throw new EmergencyCommunicationsError('Scheduled messages cannot be published before their scheduled time.');
  message.status = 'PUBLISHED';
  message.publishedAt = new Date();
  message.publicationMode = 'SIMULATED_PREVIEW_NO_TRANSMISSION';
  message.updatedAt = new Date();
  await updatePersistentMessage(message, simulatedOnly);
  await recordAudit(actor, 'MESSAGE_PUBLICATION_RECORDED', message.messageRef, {
    channel: message.channel,
    publicationMode: message.publicationMode,
    transmittedToHardware: message.publicationMode === 'VENDOR_ADAPTER',
  }, Boolean(message.isSimulated));
  return message;
}

async function findMessage(messageId, simulatedOnly) {
  const id = requiredText(messageId, 'Message reference', 128);
  if (persistentMode(simulatedOnly)) {
    const message = await prisma.emergencyCommunicationMessage.findFirst({
      where: { OR: [{ id }, { messageRef: id }] },
      include: { approvals: { orderBy: { createdAt: 'asc' } } },
    });
    if (!message) throw new EmergencyCommunicationsError('Message was not found.', 404);
    return message;
  }
  const message = messages.find((item) => item.id === id || item.messageRef === id);
  if (!message) throw new EmergencyCommunicationsError('Message was not found.', 404);
  message.approvals = approvals.filter((approval) => approval.messageId === message.id);
  return message;
}

async function updatePersistentMessage(message, simulatedOnly) {
  if (!persistentMode(simulatedOnly)) return message;
  const { id, approvals: _approvals, ...data } = message;
  return prisma.emergencyCommunicationMessage.update({ where: { id }, data });
}

export async function listCommunicationMessages({ simulatedOnly = false } = {}) {
  if (persistentMode(simulatedOnly)) {
    return prisma.emergencyCommunicationMessage.findMany({
      include: { approvals: { orderBy: { createdAt: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
      take: 200,
    });
  }
  return messages.map((message) => ({ ...message, approvals: approvals.filter((approval) => approval.messageId === message.id) }));
}

export async function createCommunicationIntegration(input, actor, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new EmergencyCommunicationsError('An integration record is required.');
  const systemType = requiredText(input.systemType, 'System type', 32).toUpperCase();
  if (!COMMUNICATION_SYSTEM_TYPES.includes(systemType)) throw new EmergencyCommunicationsError('Select public address or digital signage.');
  const protocol = requiredText(input.protocol, 'Protocol', 48).toUpperCase();
  if (!['VENDOR_API_HTTPS', 'DOCUMENTED_GATEWAY_API', 'OTHER'].includes(protocol)) throw new EmergencyCommunicationsError('Select a supported documented interface.');
  const endpointUrl = requiredText(input.endpointUrl, 'Endpoint URL', 500);
  let parsed;
  try { parsed = new URL(endpointUrl); } catch { throw new EmergencyCommunicationsError('Provide a valid HTTPS endpoint URL.'); }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new EmergencyCommunicationsError('The endpoint must use HTTPS and cannot contain credentials.');
  const data = {
    systemType,
    providerName: requiredText(input.providerName, 'Provider name'),
    protocol,
    endpointUrl: parsed.toString(),
    secretReference: optionalText(input.secretReference, 'Secret-manager reference'),
    connectionStatus: 'UNVERIFIED',
    verifiedAt: null,
    createdById: actor.id,
    createdByEmail: actor.email || 'unknown',
    isSimulated: !persistentMode(simulatedOnly),
  };
  if (persistentMode(simulatedOnly)) {
    const saved = await prisma.emergencyCommunicationIntegration.create({ data });
    await recordAudit(actor, 'INTEGRATION_METADATA_REGISTERED', null, { systemType, providerName: data.providerName }, false);
    return saved;
  }
  const saved = { ...data, id: reference('SIM-INT'), createdAt: new Date(), updatedAt: new Date() };
  integrations.push(saved);
  await recordAudit(actor, 'INTEGRATION_METADATA_REGISTERED', null, { systemType, providerName: data.providerName }, true);
  return saved;
}

export async function getEmergencyCommunicationsDashboard({ simulatedOnly = false, includeSensitive = false } = {}) {
  const persistent = persistentMode(simulatedOnly);
  const [allMessages, allApprovals, allIntegrations, policy, auditHistory] = persistent
    ? await Promise.all([
      listCommunicationMessages({ simulatedOnly }),
      prisma.emergencyCommunicationApproval.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.emergencyCommunicationIntegration.findMany({ orderBy: { systemType: 'asc' } }),
      getPolicy(simulatedOnly),
      prisma.emergencyCommunicationAuditLog.findMany({ orderBy: { sequence: 'desc' }, take: 50 }),
    ])
    : [
      await listCommunicationMessages({ simulatedOnly }),
      [...approvals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 100),
      integrations,
      await getPolicy(simulatedOnly),
      [...auditRecords].reverse().slice(0, 50),
    ];
  const safeIntegrations = allIntegrations.map((integration) => ({
    id: integration.id,
    systemType: integration.systemType,
    providerName: integration.providerName,
    protocol: integration.protocol,
    connectionStatus: integration.connectionStatus,
    isSimulated: integration.isSimulated,
    ...(includeSensitive ? { endpointUrl: 'REDACTED', secretReference: integration.secretReference ? 'Configured in secret manager' : null } : {}),
  }));
  const safeMessages = allMessages.map((message) => ({
    ...message,
    approvals: (message.approvals || []).map((approval) => ({
      id: approval.id,
      approverEmail: approval.approverEmail,
      approverRole: approval.approverRole,
      decision: approval.decision,
      notes: approval.notes,
      createdAt: approval.createdAt,
    })),
  }));
  return {
    adapter: {
      mode: persistent ? 'NO_VERIFIED_VENDOR_ADAPTER' : 'SIMULATED_DEVELOPMENT',
      publicAddressConnected: allIntegrations.some((item) => item.systemType === 'PUBLIC_ADDRESS' && item.connectionStatus === 'VERIFIED' && !item.isSimulated),
      digitalSignageConnected: allIntegrations.some((item) => item.systemType === 'DIGITAL_SIGNAGE' && item.connectionStatus === 'VERIFIED' && !item.isSimulated),
      automaticBroadcastEnabled: false,
      certifiedAlarmReplacement: false,
    },
    metrics: {
      total: safeMessages.length,
      drafts: safeMessages.filter((message) => message.status === 'DRAFT').length,
      awaitingApproval: safeMessages.filter((message) => message.status === 'PENDING_APPROVAL').length,
      scheduled: safeMessages.filter((message) => message.status === 'SCHEDULED').length,
      published: safeMessages.filter((message) => message.status === 'PUBLISHED').length,
    },
    messages: safeMessages,
    integrations: safeIntegrations,
    templates: (await listCommunicationTemplates({ simulatedOnly })).map(({ id, templateKey, name, category, channel, titleTemplate, bodyTemplate, isSimulated }) => ({
      id, templateKey, name, category, channel, titleTemplate, bodyTemplate, isSimulated: Boolean(isSimulated),
    })),
    approvals: allApprovals.map((approval) => ({ ...approval })),
    auditHistory: auditHistory.map(({ id, sequence, actorEmail, actorRole, action, messageRef, details, recordHash, createdAt, isSimulated }) => ({
      id, sequence, actorEmail, actorRole, action, messageRef, details, recordHash, createdAt, isSimulated,
    })),
    policy,
    incidentOptions: initialIncidents.map((incident) => ({ id: incident.id, title: incident.title, status: incident.status, category: incident.category })),
  };
}

async function recordAudit(actor, action, messageRef, details, simulated) {
  const entry = {
    actorId: actor.id,
    actorEmail: actor.email || 'unknown',
    actorRole: actor.role,
    action,
    messageRef,
    details: JSON.stringify(details),
    createdAt: new Date(),
  };
  const previousHash = simulated
    ? auditRecords.at(-1)?.recordHash || 'GENESIS'
    : (await prisma.emergencyCommunicationAuditLog.findFirst({ orderBy: { sequence: 'desc' }, select: { recordHash: true } }))?.recordHash || 'GENESIS';
  const recordHash = crypto.createHmac('sha256', auditKey()).update(`${previousHash}:${JSON.stringify(entry)}`).digest('hex');
  if (simulated) {
    auditRecords.push({ ...entry, id: reference('SIM-AUDIT'), sequence: auditRecords.length + 1, previousHash, recordHash, isSimulated: true });
    return;
  }
  await prisma.emergencyCommunicationAuditLog.create({ data: { ...entry, previousHash, recordHash, isSimulated: false } });
}

export async function getCommunicationsAuditTrail({ simulatedOnly = false } = {}) {
  if (persistentMode(simulatedOnly)) {
    return prisma.emergencyCommunicationAuditLog.findMany({ orderBy: { sequence: 'asc' }, take: 1000 });
  }
  return auditRecords.map((record) => ({ ...record }));
}

export function verifyCommunicationsAudit(records) {
  let previousHash = 'GENESIS';
  return records.every((record) => {
    if (record.previousHash !== previousHash) return false;
    const entry = {
      actorId: record.actorId,
      actorEmail: record.actorEmail,
      actorRole: record.actorRole,
      action: record.action,
      messageRef: record.messageRef,
      details: record.details,
      createdAt: record.createdAt,
    };
    const digest = crypto.createHmac('sha256', auditKey()).update(`${previousHash}:${JSON.stringify(entry)}`).digest('hex');
    if (digest !== record.recordHash) return false;
    previousHash = record.recordHash;
    return true;
  });
}
