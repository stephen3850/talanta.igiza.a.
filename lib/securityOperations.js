import crypto from 'crypto';
import { prisma } from './prisma.js';
import { verifySessionToken } from './auth.js';
import { initialAuditLogs, initialIoTAlerts, initialOrders } from './mockData.js';
import { getAllApiLogs } from './apiGateway.js';
import { getAllAlerts } from './networkOperations.js';

export const SOC_ROLES = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD'];
export const SOC_MANAGEMENT_ROLES = ['SYSTEM_ADMIN', 'VENUE_MANAGER'];
export const SECURITY_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const SECURITY_INCIDENT_STATUSES = ['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED'];
export const SECURITY_EVENT_SOURCES = [
  'AUTHENTICATION', 'ADMIN_ACTIVITY', 'TICKETING_PAYMENTS', 'API_INTEGRATIONS',
  'NETWORK_MONITORING', 'IOT_DEVICES', 'ACCESS_CONTROL', 'APPLICATION_INFRASTRUCTURE',
];

const simulatedEvents = [];
const simulatedAlerts = [];
const simulatedIncidents = [];
const simulatedNotes = [];
const simulatedAudit = [];
const simulatedSiem = [];
const defaultPolicy = { failedLoginThreshold: 5, failedLoginWindowMinutes: 15, apiErrorThreshold: 10, apiErrorWindowMinutes: 5 };
let configuredPolicy = { ...defaultPolicy };

const sampleEvents = [
  { eventRef: 'SIM-SOC-AUTH-001', source: 'AUTHENTICATION', eventType: 'LOGIN_FAILED', severity: 'MEDIUM', summary: 'Repeated failed sign-in attempts detected for a protected account reference.', subjectHash: 'sim-subject-001', occurredAt: new Date(Date.now() - 3 * 60 * 1000), isSimulated: true },
  { eventRef: 'SIM-SOC-API-001', source: 'API_INTEGRATIONS', eventType: 'API_AUTH_FAILURE', severity: 'LOW', summary: 'An integration request was rejected by authentication controls.', subjectHash: null, occurredAt: new Date(Date.now() - 8 * 60 * 1000), isSimulated: true },
  { eventRef: 'SIM-SOC-IOT-001', source: 'IOT_DEVICES', eventType: 'DEVICE_ALERT', severity: 'LOW', summary: 'A development IoT telemetry alert was raised.', subjectHash: null, occurredAt: new Date(Date.now() - 15 * 60 * 1000), isSimulated: true },
];
let sampleAlert = {
  id: 'SIM-SOC-ALERT-001', alertRef: 'SIM-SOC-ALERT-001', ruleKey: 'AUTH_FAILED_LOGIN_THRESHOLD',
  title: 'Repeated failed sign-in attempts', description: 'Development fixture: repeated attempts within the configured observation window.',
  severity: 'HIGH', status: 'ACTIVE', occurrenceCount: 6, firstSeenAt: new Date(Date.now() - 6 * 60 * 1000),
  lastSeenAt: new Date(Date.now() - 3 * 60 * 1000), isSimulated: true,
};

export class SecurityOperationsError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'SecurityOperationsError';
    this.status = status;
  }
}

function actorFromRequest(req) {
  const authorization = req.headers.get('authorization') || '';
  if (authorization.startsWith('Bearer ')) return verifySessionToken(authorization.slice(7).trim());
  const tokenCookie = (req.headers.get('cookie') || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('talanta_session='));
  return tokenCookie ? verifySessionToken(decodeURIComponent(tokenCookie.slice('talanta_session='.length))) : null;
}

export function authorizeSocRequest(req, permission = 'view') {
  const user = actorFromRequest(req);
  if (!user?.id || !SOC_ROLES.includes(user.role)) {
    return { authorized: false, status: user ? 403 : 401, message: user ? 'Your role is not authorized to access SOC operations.' : 'A valid signed-in security staff session is required.' };
  }
  if (user.isDemo && process.env.NODE_ENV === 'production') {
    return { authorized: false, status: 403, message: 'Demo sessions cannot access production SOC operations.' };
  }
  if (permission !== 'view' && !SOC_MANAGEMENT_ROLES.includes(user.role)) {
    return { authorized: false, status: 403, message: 'Only authorized SOC supervisors can manage security incidents and policy.' };
  }
  return { authorized: true, user };
}

export async function readSocJson(req) {
  try { return await req.json(); }
  catch { throw new SecurityOperationsError('Request body must be valid JSON.'); }
}

export async function socErrorResponse(error) {
  const status = error instanceof SecurityOperationsError ? error.status : 500;
  if (!(error instanceof SecurityOperationsError)) {
    console.error('[Security operations API]', error);
    try {
      await recordSecurityEvent({
        source: 'APPLICATION_INFRASTRUCTURE',
        eventType: 'API_ERROR',
        severity: 'HIGH',
        summary: 'An unexpected SOC API error was recorded.',
        metadata: { component: 'security-operations-api', statusCode: 500 },
      });
    } catch (loggingError) {
      console.error('[Security operations event logging failed]', loggingError);
    }
  }
  return Response.json({ success: false, message: error instanceof SecurityOperationsError ? error.message : 'SOC request failed.' }, { status });
}

function productionKey() {
  const key = process.env.NODE_ENV === 'production'
    ? process.env.SOC_EVENT_HASH_KEY
    : process.env.SOC_EVENT_HASH_KEY || 'talanta-development-soc-hash-key';
  if (!key) throw new SecurityOperationsError('SOC_EVENT_HASH_KEY must be configured in production.', 503);
  return key;
}

export function hashSecurityReference(value) {
  return crypto.createHmac('sha256', productionKey()).update(String(value)).digest('hex');
}

function persistentMode(simulatedOnly = false) {
  if (simulatedOnly) return false;
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') throw new SecurityOperationsError('SOC event database is not configured.', 503);
    return false;
  }
  if (!prisma?.securityEvent || !prisma?.securityAlert || !prisma?.securityIncident || !prisma?.securityOperationsAuditLog) {
    throw new SecurityOperationsError('SOC Prisma client is outdated; regenerate and deploy the database schema.', 503);
  }
  if (process.env.NODE_ENV === 'production') productionKey();
  return true;
}

function requiredText(value, field, max = 180) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) throw new SecurityOperationsError(`${field} is required and must be at most ${max} characters.`);
  return value.trim();
}

function optionalText(value, field, max = 500) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > max) throw new SecurityOperationsError(`${field} must be at most ${max} characters.`);
  return value.trim() || null;
}

function safeNarrative(value, field, max) {
  const result = requiredText(value, field, max);
  if (/(?:password|passwd|secret|api[_-]?key|access[_-]?token|bearer\s+[a-z0-9._-]+)\s*[:=]/i.test(result) || /\b(?:\d[ -]*?){13,19}\b/.test(result)) {
    throw new SecurityOperationsError(`${field} appears to contain a credential or payment-card number; remove sensitive data.`);
  }
  return result;
}

function makeReference(prefix) {
  return `${prefix}-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
}

async function getPolicy(simulatedOnly = false) {
  if (persistentMode(simulatedOnly)) {
    const policy = await prisma.securityAlertPolicy.findUnique({ where: { policyKey: 'DEFAULT' } });
    if (!policy) return { ...defaultPolicy };
    return {
      failedLoginThreshold: policy.failedLoginThreshold,
      failedLoginWindowMinutes: policy.failedLoginWindowMinutes,
      apiErrorThreshold: policy.apiErrorThreshold,
      apiErrorWindowMinutes: policy.apiErrorWindowMinutes,
    };
  }
  return { ...configuredPolicy };
}

export async function updateSecurityPolicy(input, actor, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new SecurityOperationsError('A security alert policy is required.');
  const policy = {};
  for (const [key, minimum, maximum] of [
    ['failedLoginThreshold', 3, 100],
    ['failedLoginWindowMinutes', 1, 120],
    ['apiErrorThreshold', 3, 500],
    ['apiErrorWindowMinutes', 1, 60],
  ]) {
    const value = Number(input[key]);
    if (!Number.isInteger(value) || value < minimum || value > maximum) throw new SecurityOperationsError(`${key} must be an integer between ${minimum} and ${maximum}.`);
    policy[key] = value;
  }
  const data = { ...policy, updatedById: actor.id, updatedByEmail: actor.email || 'unknown' };
  if (persistentMode(simulatedOnly)) {
    await prisma.securityAlertPolicy.upsert({ where: { policyKey: 'DEFAULT' }, create: { policyKey: 'DEFAULT', ...data }, update: data });
    await recordSocAudit(actor, 'ALERT_POLICY_UPDATED', null, policy, false);
  } else {
    configuredPolicy = policy;
    await recordSocAudit(actor, 'ALERT_POLICY_UPDATED', null, policy, true);
  }
  return { ...policy, isSimulated: !persistentMode(simulatedOnly) };
}

export async function recordSecurityEvent(input, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new SecurityOperationsError('A security event is required.');
  const source = requiredText(input.source, 'Event source', 48).toUpperCase();
  if (!SECURITY_EVENT_SOURCES.includes(source)) throw new SecurityOperationsError('Select a supported event source.');
  const eventType = requiredText(input.eventType, 'Event type', 64).toUpperCase();
  const severity = requiredText(input.severity || 'LOW', 'Severity', 16).toUpperCase();
  if (!SECURITY_SEVERITIES.includes(severity)) throw new SecurityOperationsError('Select a supported security severity.');
  const summary = requiredText(input.summary, 'Event summary', 500);
  const subjectHash = input.subject == null ? null : hashSecurityReference(input.subject);
  const occurredAt = input.occurredAt ? new Date(input.occurredAt) : new Date();
  if (!Number.isFinite(occurredAt.getTime())) throw new SecurityOperationsError('Event timestamp is invalid.');
  const data = {
    eventRef: makeReference('SEC-EVT'),
    source,
    eventType,
    severity,
    summary,
    subjectHash,
    metadata: JSON.stringify(sanitizeMetadata(input.metadata)),
    isSimulated: !persistentMode(simulatedOnly),
    occurredAt,
  };
  let event;
  if (persistentMode(simulatedOnly)) {
    event = await prisma.securityEvent.create({ data });
  } else {
    event = { ...data, id: makeReference('SIM-EVT'), createdAt: new Date() };
    simulatedEvents.unshift(event);
  }
  if (source === 'AUTHENTICATION' && eventType === 'LOGIN_FAILED' && subjectHash) {
    await detectRepeatedLogin(event, simulatedOnly);
  }
  if (eventType === 'ADMIN_SENSITIVE_ACTION') {
    await createSecurityAlert({
      ruleKey: 'SENSITIVE_ADMIN_ACTIVITY',
      title: 'Sensitive administrative activity',
      description: summary,
      severity: severity === 'LOW' ? 'HIGH' : severity,
      eventId: event.id,
      event,
    }, simulatedOnly);
  }
  if (source === 'API_INTEGRATIONS' && eventType === 'API_ERROR') await detectApiErrorBurst(event, simulatedOnly);
  return event;
}

function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};
  const allowed = ['ipHash', 'routeClass', 'statusCode', 'httpMethod', 'actorRole', 'component', 'count'];
  return Object.fromEntries(Object.entries(metadata).filter(([key, value]) => allowed.includes(key) && ['string', 'number', 'boolean'].includes(typeof value)));
}

async function detectRepeatedLogin(event, simulatedOnly) {
  const policy = await getPolicy(simulatedOnly);
  const since = new Date(Date.now() - policy.failedLoginWindowMinutes * 60 * 1000);
  const count = persistentMode(simulatedOnly)
    ? await prisma.securityEvent.count({ where: { source: 'AUTHENTICATION', eventType: 'LOGIN_FAILED', subjectHash: event.subjectHash, occurredAt: { gte: since } } })
    : simulatedEvents.filter((item) => item.source === 'AUTHENTICATION' && item.eventType === 'LOGIN_FAILED' && item.subjectHash === event.subjectHash && new Date(item.occurredAt) >= since).length;
  if (count < policy.failedLoginThreshold) return;
  await createSecurityAlert({
    ruleKey: 'AUTH_FAILED_LOGIN_THRESHOLD',
    title: 'Repeated failed sign-in attempts',
    description: `${count} failed sign-in attempts against one keyed account reference within ${policy.failedLoginWindowMinutes} minutes.`,
    severity: count >= policy.failedLoginThreshold * 2 ? 'CRITICAL' : 'HIGH',
    eventId: event.id,
    event,
    occurrenceCount: count,
  }, simulatedOnly);
}

async function detectApiErrorBurst(event, simulatedOnly) {
  const policy = await getPolicy(simulatedOnly);
  const since = new Date(Date.now() - policy.apiErrorWindowMinutes * 60 * 1000);
  const count = persistentMode(simulatedOnly)
    ? await prisma.securityEvent.count({ where: { source: 'API_INTEGRATIONS', eventType: 'API_ERROR', occurredAt: { gte: since } } })
    : simulatedEvents.filter((item) => item.source === 'API_INTEGRATIONS' && item.eventType === 'API_ERROR' && new Date(item.occurredAt) >= since).length;
  if (count < policy.apiErrorThreshold) return;
  await createSecurityAlert({
    ruleKey: 'API_ERROR_BURST',
    title: 'Unexpected API error burst',
    description: `${count} API error events were recorded within ${policy.apiErrorWindowMinutes} minutes.`,
    severity: count >= policy.apiErrorThreshold * 2 ? 'HIGH' : 'MEDIUM',
    eventId: event.id,
    event,
    occurrenceCount: count,
  }, simulatedOnly);
}

async function createSecurityAlert(input, simulatedOnly) {
  if (persistentMode(simulatedOnly)) {
    const previous = await prisma.securityAlert.findFirst({
      where: { ruleKey: input.ruleKey, status: 'ACTIVE', lastSeenAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
      orderBy: { lastSeenAt: 'desc' },
    });
    if (previous) {
      return prisma.securityAlert.update({
        where: { id: previous.id },
        data: { occurrenceCount: input.occurrenceCount || previous.occurrenceCount + 1, lastSeenAt: new Date(), severity: input.severity, eventId: input.eventId },
      });
    }
    return prisma.securityAlert.create({
      data: {
        alertRef: makeReference('SOC-ALERT'), eventId: input.eventId,
        ruleKey: input.ruleKey, title: input.title, description: input.description,
        severity: input.severity, occurrenceCount: input.occurrenceCount || 1,
      },
    });
  }
  const previous = simulatedAlerts.find((alert) => alert.ruleKey === input.ruleKey && alert.status === 'ACTIVE');
  if (previous) {
    previous.occurrenceCount = input.occurrenceCount || previous.occurrenceCount + 1;
    previous.lastSeenAt = new Date();
    previous.severity = input.severity;
    return previous;
  }
  const alert = {
    id: makeReference('SIM-ALERT'), alertRef: makeReference('SIM-ALERT'), eventId: input.eventId,
    ruleKey: input.ruleKey, title: input.title, description: input.description,
    severity: input.severity, status: 'ACTIVE', occurrenceCount: input.occurrenceCount || 1,
    firstSeenAt: new Date(), lastSeenAt: new Date(), isSimulated: true,
  };
  simulatedAlerts.unshift(alert);
  return alert;
}

function sourceEvent({ id, source, eventType, severity = 'LOW', summary, occurredAt, isSimulated = true, subjectHash = null, metadata = {} }) {
  return { eventRef: id, source, eventType, severity, summary, occurredAt: new Date(occurredAt || Date.now()), isSimulated, subjectHash, metadata };
}

function mapAuditEvent(item) {
  const action = String(item.action || 'ADMIN_ACTION').toUpperCase();
  const source = /TICKET|PAYMENT|ORDER|BOOKING/.test(action) ? 'TICKETING_PAYMENTS'
    : /API|WEBHOOK|INTEGRATION/.test(action) ? 'API_INTEGRATIONS'
      : /LOGIN|AUTH/.test(action) ? 'AUTHENTICATION' : 'ADMIN_ACTIVITY';
  const elevated = /DELETE|REVOKE|ROLE|PERMISSION|CONFIG|SECRET|EXPORT/.test(action);
  return sourceEvent({
    id: `AUDIT-${item.id}`,
    source,
    eventType: action,
    severity: elevated ? 'MEDIUM' : 'LOW',
    summary: `${source.replaceAll('_', ' ')}: ${action.replaceAll('_', ' ').toLowerCase()} recorded.`,
    occurredAt: item.createdAt,
    isSimulated: true,
  });
}

function sampleSourceEvents() {
  const ticketingEvents = initialOrders.length ? [sourceEvent({
    id: 'TICKETING-FIXTURE-SUMMARY',
    source: 'TICKETING_PAYMENTS',
    eventType: 'FIXTURE_ACTIVITY_SUMMARY',
    severity: 'LOW',
    summary: `Development fixture contains ${initialOrders.length} ticketing/payment records; no patron or payment details are included.`,
    occurredAt: initialOrders.reduce((latest, order) => new Date(order.createdAt) > latest ? new Date(order.createdAt) : latest, new Date(0)),
    isSimulated: true,
    metadata: { recordCount: initialOrders.length },
  })] : [];
  const apiEvents = getAllApiLogs().map((log) => sourceEvent({
    id: `API-${log.id}`,
    source: 'API_INTEGRATIONS',
    eventType: log.statusCode >= 500 ? 'API_ERROR' : log.statusCode >= 400 ? 'API_AUTH_FAILURE' : 'API_REQUEST',
    severity: log.statusCode >= 500 ? 'HIGH' : log.statusCode >= 400 ? 'LOW' : 'LOW',
    summary: `Integration ${log.method} ${String(log.endpoint).split('/').slice(0, 3).join('/')} returned HTTP ${log.statusCode}.`,
    occurredAt: log.timestamp,
    isSimulated: true,
    metadata: { statusCode: log.statusCode, httpMethod: log.method },
  }));
  const networkEvents = getAllAlerts().map((alert) => sourceEvent({
    id: `NET-${alert.id}`,
    source: 'NETWORK_MONITORING',
    eventType: 'NETWORK_ALERT',
    severity: ['CRITICAL', 'FATAL'].includes(alert.severity) ? 'HIGH' : 'LOW',
    summary: `Network monitoring alert: ${String(alert.title || alert.message || 'Status change').slice(0, 180)}.`,
    occurredAt: alert.createdAt || alert.timestamp,
    isSimulated: true,
  }));
  const iotEvents = initialIoTAlerts.map((alert) => sourceEvent({
    id: `IOT-${alert.id}`,
    source: 'IOT_DEVICES',
    eventType: 'DEVICE_ALERT',
    severity: alert.severity === 'CRITICAL' ? 'HIGH' : 'LOW',
    summary: `IoT monitoring alert: ${String(alert.title || 'Device telemetry alert').slice(0, 180)}.`,
    occurredAt: alert.createdAt,
    isSimulated: true,
  }));
  return [...ticketingEvents, ...apiEvents, ...networkEvents, ...iotEvents, ...initialAuditLogs.map(mapAuditEvent)];
}

async function collectEvents(simulatedOnly) {
  if (!persistentMode(simulatedOnly)) {
    return [
      ...simulatedEvents,
      ...sampleEvents,
      ...sampleSourceEvents(),
    ].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt)).slice(0, 300);
  }
  const [recorded, audits, accessEvents, commAudits, iotAlerts] = await Promise.all([
    prisma.securityEvent.findMany({ orderBy: { occurredAt: 'desc' }, take: 300 }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 300, select: { id: true, action: true, entityType: true, createdAt: true } }),
    prisma.accessControlEvent.findMany({ orderBy: { occurredAt: 'desc' }, take: 100, select: { eventRef: true, outcome: true, reasonCode: true, occurredAt: true, isSimulated: true } }),
    prisma.emergencyCommunicationAuditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 100, select: { id: true, action: true, createdAt: true, isSimulated: true } }),
    prisma.iotAlert.findMany({ orderBy: { createdAt: 'desc' }, take: 100, select: { id: true, severity: true, title: true, createdAt: true } }),
  ]);
  const mappedAudits = audits.map((item) => mapAuditEvent(item));
  const physicalAccess = accessEvents.map((item) => sourceEvent({
    id: item.eventRef, source: 'ACCESS_CONTROL', eventType: item.outcome,
    severity: item.outcome === 'DENIED' ? 'MEDIUM' : 'LOW',
    summary: `Access authorization decision recorded (${item.reasonCode}).`,
    occurredAt: item.occurredAt, isSimulated: item.isSimulated,
  }));
  const communications = commAudits.map((item) => sourceEvent({
    id: `COMMS-${item.id}`, source: 'ADMIN_ACTIVITY', eventType: item.action,
    severity: /PUBLISH|APPROV/.test(item.action) ? 'MEDIUM' : 'LOW',
    summary: `Emergency communication workflow action: ${item.action.replaceAll('_', ' ').toLowerCase()}.`,
    occurredAt: item.createdAt, isSimulated: item.isSimulated,
  }));
  const persistentIot = iotAlerts.map((item) => sourceEvent({
    id: `IOT-${item.id}`, source: 'IOT_DEVICES', eventType: 'DEVICE_ALERT',
    severity: item.severity === 'CRITICAL' ? 'HIGH' : 'LOW',
    summary: `IoT monitoring alert: ${String(item.title || 'Device telemetry alert').slice(0, 180)}.`,
    occurredAt: item.createdAt, isSimulated: false,
  }));
  return [...recorded, ...mappedAudits, ...physicalAccess, ...communications, ...persistentIot, ...sampleSourceEvents()]
    .sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt)).slice(0, 500);
}

async function collectAlerts(simulatedOnly) {
  if (!persistentMode(simulatedOnly)) return [...simulatedAlerts, sampleAlert].sort((a, b) => new Date(b.lastSeenAt) - new Date(a.lastSeenAt));
  return prisma.securityAlert.findMany({
    where: { status: { in: ['ACTIVE', 'ACKNOWLEDGED'] } },
    orderBy: [{ severity: 'desc' }, { lastSeenAt: 'desc' }],
    take: 200,
  });
}

export async function getSecurityDashboard({ simulatedOnly = false, includeSensitive = false } = {}) {
  const [events, alerts, incidents, policy] = await Promise.all([
    collectEvents(simulatedOnly),
    collectAlerts(simulatedOnly),
    listSecurityIncidents({ simulatedOnly }),
    getPolicy(simulatedOnly),
  ]);
  const severityCounts = Object.fromEntries(SECURITY_SEVERITIES.map((severity) => [severity, incidents.filter((incident) => incident.severity === severity && !['RESOLVED', 'CLOSED'].includes(incident.status)).length]));
  const activeAlerts = alerts.filter((alert) => alert.status === 'ACTIVE' || alert.status === 'ACKNOWLEDGED');
  const authEvents = events.filter((event) => event.source === 'AUTHENTICATION');
  const allSiem = persistentMode(simulatedOnly)
    ? await prisma.securitySiemIntegration.findMany({ orderBy: { createdAt: 'desc' } })
    : [...simulatedSiem];
  const safeEvents = events.map(({ metadata, subjectHash, ...event }) => {
    let safeMetadata = {};
    if (typeof metadata === 'string') {
      try { safeMetadata = JSON.parse(metadata); } catch { safeMetadata = {}; }
    } else if (metadata && typeof metadata === 'object') safeMetadata = metadata;
    return {
      ...event,
      subjectHash: subjectHash ? `${subjectHash.slice(0, 14)}…` : null,
      metadata: safeMetadata,
    };
  });
  const systems = [
    { source: 'AUTHENTICATION', status: 'PARTIAL', detail: 'Login failures and successes recorded by SOC hook; no identity provider integration.' },
    { source: 'ADMIN_ACTIVITY', status: process.env.DATABASE_URL ? 'AUDIT_FEED' : 'SIMULATED', detail: 'Sanitized administrative audit events.' },
    { source: 'TICKETING_PAYMENTS', status: process.env.DATABASE_URL ? 'AUDIT_FEED' : 'SIMULATED', detail: 'Event metadata only; payment secrets and payloads excluded.' },
    { source: 'API_INTEGRATIONS', status: 'SIMULATED_OR_AUDIT_FEED', detail: 'Gateway request status summaries; no credentials or request bodies.' },
    { source: 'NETWORK_MONITORING', status: 'SIMULATED_OR_AUDIT_FEED', detail: 'Monitoring alerts only; no active discovery or scanning.' },
    { source: 'IOT_DEVICES', status: 'SIMULATED_OR_AUDIT_FEED', detail: 'Device alerts and status summaries.' },
    { source: 'ACCESS_CONTROL', status: process.env.DATABASE_URL ? 'AUDIT_FEED' : 'SIMULATED', detail: 'Authorization decision metadata; credential references excluded.' },
    { source: 'APPLICATION_INFRASTRUCTURE', status: 'PARTIAL', detail: 'SOC service errors and API status events; host/OS telemetry not connected.' },
  ];
  return {
    adapter: { mode: simulatedOnly || !process.env.DATABASE_URL ? 'SIMULATED_DEVELOPMENT' : 'DATABASE_AUDIT_FEEDS', activeResponseEnabled: false, scanningEnabled: false, automatedIsolationEnabled: false },
    metrics: {
      eventsLast24h: events.filter((event) => new Date(event.occurredAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
      activeAlerts: activeAlerts.length,
      openIncidents: incidents.filter((incident) => !['RESOLVED', 'CLOSED'].includes(incident.status)).length,
      authenticationEventsLast24h: authEvents.filter((event) => new Date(event.occurredAt) >= new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
      unresolvedCritical: activeAlerts.filter((alert) => alert.severity === 'CRITICAL').length,
    },
    severityCounts,
    events: safeEvents,
    alerts: activeAlerts,
    incidents,
    systems,
    siemIntegrations: (includeSensitive ? allSiem : []).map((integration) => ({
      id: integration.id, providerName: integration.providerName, protocol: integration.protocol,
      connectionStatus: integration.connectionStatus, isSimulated: integration.isSimulated,
    })),
    policy,
  };
}

export async function listSecurityIncidents({ simulatedOnly = false } = {}) {
  if (persistentMode(simulatedOnly)) {
    return prisma.securityIncident.findMany({
      include: { notes: { orderBy: { createdAt: 'asc' } } },
      orderBy: [{ updatedAt: 'desc' }],
      take: 300,
    });
  }
  return simulatedIncidents.map((incident) => ({ ...incident, notes: simulatedNotes.filter((note) => note.incidentId === incident.id) }));
}

export async function createSecurityIncident(input, actor, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new SecurityOperationsError('A security incident is required.');
  const severity = requiredText(input.severity, 'Incident severity', 16).toUpperCase();
  if (!SECURITY_SEVERITIES.includes(severity)) throw new SecurityOperationsError('Select a supported incident severity.');
  const alertId = optionalText(input.alertId, 'Alert ID', 128);
  const persistent = persistentMode(simulatedOnly);
  if (alertId && persistent && !(await prisma.securityAlert.findUnique({ where: { id: alertId } }))) throw new SecurityOperationsError('Security alert was not found.', 404);
  if (alertId && !persistent && ![...simulatedAlerts, sampleAlert].some((alert) => alert.id === alertId)) throw new SecurityOperationsError('Security alert was not found.', 404);
  const assigneeId = optionalText(input.assignedToId, 'Assignee ID', 128);
  let assignee = null;
  if (assigneeId && persistent) {
    assignee = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true, email: true, role: true, isActive: true } });
    if (!assignee?.isActive || !SOC_ROLES.includes(assignee.role)) throw new SecurityOperationsError('Assignee must be an active user with an authorized SOC role.', 400);
  } else if (assigneeId) {
    const demoUsers = [
      { id: 'SOC-DEMO-ADMIN', email: 'soc.admin@demo.local', role: 'SYSTEM_ADMIN', isActive: true },
      { id: 'SOC-DEMO-MANAGER', email: 'soc.manager@demo.local', role: 'VENUE_MANAGER', isActive: true },
      { id: 'SOC-DEMO-STEWARD', email: 'soc.steward@demo.local', role: 'STEWARD', isActive: true },
    ];
    assignee = demoUsers.find((user) => user.id === assigneeId) || null;
    if (!assignee) throw new SecurityOperationsError('Select an active authorized security operator.', 400);
  }
  const incident = {
    incidentRef: makeReference('SOC-INC'),
    alertId,
    title: safeNarrative(input.title, 'Incident title', 180),
    summary: safeNarrative(input.summary, 'Incident summary', 3000),
    severity,
    status: 'OPEN',
    assignedToId: assignee?.id || null,
    assignedToEmail: assignee?.email || null,
    assignedToRole: assignee?.role || null,
    createdById: actor.id,
    createdByEmail: actor.email || 'unknown',
  };
  if (persistent) {
    const saved = await prisma.securityIncident.create({ data: incident, include: { notes: true } });
    if (alertId) await prisma.securityAlert.update({ where: { id: alertId }, data: { status: 'INCIDENT_OPENED' } });
    await recordSocAudit(actor, 'SECURITY_INCIDENT_CREATED', saved.incidentRef, { severity, alertId, assignedToId: assignee?.id || null }, false);
    return saved;
  }
  const saved = { ...incident, id: makeReference('SIM-INC'), createdAt: new Date(), updatedAt: new Date(), notes: [], isSimulated: true };
  simulatedIncidents.unshift(saved);
  if (alertId) {
    const alert = [...simulatedAlerts, sampleAlert].find((item) => item.id === alertId);
    if (alert) alert.status = 'INCIDENT_OPENED';
  }
  await recordSocAudit(actor, 'SECURITY_INCIDENT_CREATED', saved.incidentRef, { severity, alertId, assignedToId: assignee?.id || null }, true);
  return saved;
}

export async function updateSecurityIncident(incidentId, input, actor, { simulatedOnly = false } = {}) {
  const id = requiredText(incidentId, 'Incident ID', 128);
  const status = requiredText(input?.status, 'Incident status', 24).toUpperCase();
  if (!SECURITY_INCIDENT_STATUSES.includes(status)) throw new SecurityOperationsError('Select a supported incident status.');
  const incident = persistentMode(simulatedOnly)
    ? await prisma.securityIncident.findFirst({ where: { OR: [{ id }, { incidentRef: id }] } })
    : simulatedIncidents.find((item) => item.id === id || item.incidentRef === id);
  if (!incident) throw new SecurityOperationsError('Security incident was not found.', 404);
  const resolution = input.resolution ? safeNarrative(input.resolution, 'Resolution', 2000) : null;
  if (['RESOLVED', 'CLOSED'].includes(status) && !resolution) throw new SecurityOperationsError('A resolution summary is required to resolve or close an incident.');
  const assigneeId = input.assignedToId == null || input.assignedToId === '' ? null : requiredText(input.assignedToId, 'Assignee ID', 128);
  let assignee = null;
  if (assigneeId && persistentMode(simulatedOnly)) {
    assignee = await prisma.user.findUnique({ where: { id: assigneeId }, select: { id: true, email: true, role: true, isActive: true } });
    if (!assignee?.isActive || !SOC_ROLES.includes(assignee.role)) throw new SecurityOperationsError('Assignee must be an active user with an authorized SOC role.');
  } else if (assigneeId) {
    assignee = [
      { id: 'SOC-DEMO-ADMIN', email: 'soc.admin@demo.local', role: 'SYSTEM_ADMIN', isActive: true },
      { id: 'SOC-DEMO-MANAGER', email: 'soc.manager@demo.local', role: 'VENUE_MANAGER', isActive: true },
      { id: 'SOC-DEMO-STEWARD', email: 'soc.steward@demo.local', role: 'STEWARD', isActive: true },
    ].find((user) => user.id === assigneeId);
    if (!assignee) throw new SecurityOperationsError('Select an active authorized security operator.');
  }
  const data = {
    status,
    resolution: ['RESOLVED', 'CLOSED'].includes(status) ? resolution : null,
    resolvedAt: ['RESOLVED', 'CLOSED'].includes(status) ? new Date() : null,
    ...(input.assignedToId !== undefined ? { assignedToId: assignee?.id || null, assignedToEmail: assignee?.email || null, assignedToRole: assignee?.role || null } : {}),
  };
  const updated = persistentMode(simulatedOnly)
    ? await prisma.securityIncident.update({ where: { id: incident.id }, data, include: { notes: { orderBy: { createdAt: 'asc' } } } })
    : Object.assign(incident, data, { updatedAt: new Date() });
  await recordSocAudit(actor, 'SECURITY_INCIDENT_UPDATED', incident.incidentRef, data, Boolean(incident.isSimulated) || !persistentMode(simulatedOnly));
  return updated;
}

export async function addInvestigationNote(incidentId, noteText, actor, { simulatedOnly = false } = {}) {
  const id = requiredText(incidentId, 'Incident ID', 128);
  const note = safeNarrative(noteText, 'Investigation note', 3000);
  const incident = persistentMode(simulatedOnly)
    ? await prisma.securityIncident.findFirst({ where: { OR: [{ id }, { incidentRef: id }] }, select: { id: true, incidentRef: true } })
    : simulatedIncidents.find((item) => item.id === id || item.incidentRef === id);
  if (!incident) throw new SecurityOperationsError('Security incident was not found.', 404);
  const data = { incidentId: incident.id, authorId: actor.id, authorEmail: actor.email || 'unknown', authorRole: actor.role, note };
  const saved = persistentMode(simulatedOnly)
    ? await prisma.securityInvestigationNote.create({ data })
    : { ...data, id: makeReference('SIM-NOTE'), createdAt: new Date(), isSimulated: true };
  if (!persistentMode(simulatedOnly)) simulatedNotes.push(saved);
  await recordSocAudit(actor, 'INVESTIGATION_NOTE_ADDED', incident.incidentRef, { noteLength: note.length }, Boolean(saved.isSimulated) || !persistentMode(simulatedOnly));
  return saved;
}

export async function acknowledgeSecurityAlert(alertId, actor, { simulatedOnly = false } = {}) {
  const id = requiredText(alertId, 'Alert ID', 128);
  if (persistentMode(simulatedOnly)) {
    const alert = await prisma.securityAlert.findUnique({ where: { id } });
    if (!alert) throw new SecurityOperationsError('Security alert was not found.', 404);
    const updated = await prisma.securityAlert.update({
      where: { id },
      data: { status: 'ACKNOWLEDGED', acknowledgedById: actor.id, acknowledgedByEmail: actor.email || 'unknown', acknowledgedAt: new Date() },
    });
    await recordSocAudit(actor, 'SECURITY_ALERT_ACKNOWLEDGED', alert.alertRef, { severity: alert.severity }, false);
    return updated;
  }
  const alert = [...simulatedAlerts, sampleAlert].find((item) => item.id === id || item.alertRef === id);
  if (!alert) throw new SecurityOperationsError('Security alert was not found.', 404);
  alert.status = 'ACKNOWLEDGED';
  alert.acknowledgedByEmail = actor.email || 'unknown';
  alert.acknowledgedAt = new Date();
  await recordSocAudit(actor, 'SECURITY_ALERT_ACKNOWLEDGED', alert.alertRef, { severity: alert.severity }, true);
  return alert;
}

export async function createSiemIntegration(input, actor, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new SecurityOperationsError('A SIEM integration is required.');
  const protocol = requiredText(input.protocol, 'SIEM protocol', 32).toUpperCase();
  if (!['SYSLOG_TLS', 'HTTPS_API', 'CEF_TLS', 'LEEF_TLS'].includes(protocol)) throw new SecurityOperationsError('Select a documented secure SIEM transport.');
  const endpointUrl = requiredText(input.endpointUrl, 'SIEM endpoint', 500);
  let parsed;
  try { parsed = new URL(endpointUrl); } catch { throw new SecurityOperationsError('Provide a valid secure endpoint URL.'); }
  if (!['https:', 'tls:'].includes(parsed.protocol) || parsed.username || parsed.password) throw new SecurityOperationsError('SIEM endpoint must use HTTPS/TLS and cannot contain credentials.');
  const data = {
    providerName: requiredText(input.providerName, 'SIEM provider name'),
    protocol,
    endpointUrl: parsed.toString(),
    secretReference: optionalText(input.secretReference, 'Secret-manager reference', 240),
    connectionStatus: 'UNVERIFIED',
    isSimulated: !persistentMode(simulatedOnly),
    createdById: actor.id,
    createdByEmail: actor.email || 'unknown',
  };
  let integration;
  if (persistentMode(simulatedOnly)) integration = await prisma.securitySiemIntegration.create({ data });
  else {
    integration = { ...data, id: makeReference('SIM-SIEM'), createdAt: new Date(), updatedAt: new Date() };
    simulatedSiem.push(integration);
  }
  await recordSocAudit(actor, 'SIEM_METADATA_REGISTERED', integration.id, { providerName: integration.providerName, protocol }, Boolean(integration.isSimulated));
  return integration;
}

export async function listSiemIntegrations({ simulatedOnly = false } = {}) {
  if (persistentMode(simulatedOnly)) return prisma.securitySiemIntegration.findMany({ orderBy: { createdAt: 'desc' } });
  return simulatedSiem.map((integration) => ({ ...integration }));
}

async function recordSocAudit(actor, action, entityRef, details, simulated) {
  const data = {
    actorId: actor.id,
    actorEmail: actor.email || 'unknown',
    actorRole: actor.role,
    action,
    entityRef,
    details: JSON.stringify(details),
    createdAt: new Date(),
  };
  const key = productionKey();
  const previousHash = simulated
    ? simulatedAudit.at(-1)?.recordHash || 'GENESIS'
    : (await prisma.securityOperationsAuditLog.findFirst({ orderBy: { sequence: 'desc' }, select: { recordHash: true } }))?.recordHash || 'GENESIS';
  const recordHash = crypto.createHmac('sha256', key).update(`${previousHash}:${JSON.stringify(data)}`).digest('hex');
  if (simulated) {
    simulatedAudit.push({ ...data, id: makeReference('SIM-AUDIT'), sequence: simulatedAudit.length + 1, previousHash, recordHash, isSimulated: true });
    return;
  }
  await prisma.securityOperationsAuditLog.create({ data: { ...data, previousHash, recordHash } });
}

export async function getSocAuditTrail({ simulatedOnly = false } = {}) {
  if (persistentMode(simulatedOnly)) return prisma.securityOperationsAuditLog.findMany({ orderBy: { sequence: 'asc' }, take: 1000 });
  return simulatedAudit.map((entry) => ({ ...entry }));
}

export function verifySocAuditChain(records) {
  let previousHash = 'GENESIS';
  const key = productionKey();
  return records.every((record) => {
    if (record.previousHash !== previousHash) return false;
    const data = {
      actorId: record.actorId, actorEmail: record.actorEmail, actorRole: record.actorRole,
      action: record.action, entityRef: record.entityRef, details: record.details, createdAt: record.createdAt,
    };
    const hash = crypto.createHmac('sha256', key).update(`${previousHash}:${JSON.stringify(data)}`).digest('hex');
    if (hash !== record.recordHash) return false;
    previousHash = record.recordHash;
    return true;
  });
}

export async function recordLoginSecurityEvent({ email, success, req }, options = {}) {
  const subject = typeof email === 'string' ? email.trim().toLowerCase() : 'unknown-account';
  const clientIp = req?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req?.headers?.get('x-real-ip')
    || 'unknown';
  const ipHash = hashSecurityReference(clientIp);
  return recordSecurityEvent({
    source: 'AUTHENTICATION',
    eventType: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
    severity: success ? 'LOW' : 'MEDIUM',
    summary: success ? 'User authentication succeeded.' : 'User authentication failed.',
    subject,
    metadata: { ipHash },
  }, options);
}

export async function getSocAuditIntegrity({ simulatedOnly = false } = {}) {
  const records = await getSocAuditTrail({ simulatedOnly });
  return { valid: verifySocAuditChain(records), count: records.length };
}

export function getSimulatedSecurityEvents() {
  return [...simulatedEvents, ...sampleEvents, ...sampleSourceEvents()].map((event) => ({ ...event }));
}
