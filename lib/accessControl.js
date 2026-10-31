import crypto from 'crypto';
import { prisma } from './prisma.js';
import { verifySessionToken } from './auth.js';

export const ACCESS_ZONES = [
  'BOWL', 'CONCOURSE', 'ENTRANCE', 'EXIT', 'PARKING',
  'ADMINISTRATION', 'CONTROL_ROOM', 'PITCH_SIDE', 'VIP', 'DATA_CENTRE', 'OTHER',
];
export const ACCESS_POINT_TYPES = [
  'GATE', 'STAFF_ENTRANCE', 'RESTRICTED_DOOR', 'TURNSTILE', 'VEHICLE_GATE', 'OTHER',
];
export const ACCESS_TARGET_TYPES = ['USER', 'ACCREDITATION', 'ROLE', 'GROUP'];
export const ACCESS_INTEGRATION_PROTOCOLS = ['VENDOR_API_HTTPS', 'OSDP_SECURE_CHANNEL', 'ONVIF', 'OTHER'];

const simulatedPoints = [
  { pointId: 'SIM-GATE-A-01', name: 'East Stand Gate A', zone: 'ENTRANCE', location: 'East concourse', hardwareType: 'GATE', manufacturer: 'Development fixture', model: 'SIM-1', installationStatus: 'SIMULATED', operationalStatus: 'UNKNOWN', integrationStatus: 'UNVERIFIED', statusSource: 'SIMULATED_DEVELOPMENT', isEmergencyExit: false, isSimulated: true },
  { pointId: 'SIM-STAFF-01', name: 'Operations Staff Entrance', zone: 'ADMINISTRATION', location: 'Operations block', hardwareType: 'STAFF_ENTRANCE', manufacturer: 'Development fixture', model: 'SIM-1', installationStatus: 'SIMULATED', operationalStatus: 'UNKNOWN', integrationStatus: 'UNVERIFIED', statusSource: 'SIMULATED_DEVELOPMENT', isEmergencyExit: false, isSimulated: true },
  { pointId: 'SIM-RESTRICTED-01', name: 'Control Room Door', zone: 'CONTROL_ROOM', location: 'Command centre', hardwareType: 'RESTRICTED_DOOR', manufacturer: 'Development fixture', model: 'SIM-1', installationStatus: 'SIMULATED', operationalStatus: 'UNKNOWN', integrationStatus: 'UNVERIFIED', statusSource: 'SIMULATED_DEVELOPMENT', isEmergencyExit: false, isSimulated: true },
  { pointId: 'SIM-EXIT-01', name: 'North Emergency Exit', zone: 'EXIT', location: 'North concourse', hardwareType: 'OTHER', manufacturer: 'Development fixture', model: 'SIM-1', installationStatus: 'SIMULATED', operationalStatus: 'UNKNOWN', integrationStatus: 'UNVERIFIED', statusSource: 'SIMULATED_DEVELOPMENT', isEmergencyExit: true, isSimulated: true },
];
const simulatedPermissions = [
  { id: 'SIM-PERM-001', pointId: 'SIM-STAFF-01', targetType: 'ACCREDITATION', targetId: 'DEMO-ACCESS-STAFF-001', zone: 'ADMINISTRATION', validFrom: new Date('2020-01-01T00:00:00.000Z'), expiresAt: new Date('2035-01-01T00:00:00.000Z'), revokedAt: null, isSimulated: true },
  { id: 'SIM-PERM-002', pointId: 'SIM-GATE-A-01', targetType: 'GROUP', targetId: 'CONTRACTOR', groupName: 'CONTRACTOR', zone: 'ENTRANCE', validFrom: new Date('2020-01-01T00:00:00.000Z'), expiresAt: new Date('2035-01-01T00:00:00.000Z'), revokedAt: null, isSimulated: true },
];
const simulatedUsers = [
  { id: 'DEMO-USER-STEWARD-001', role: 'STEWARD', isActive: true },
  { id: 'DEMO-USER-INACTIVE-001', role: 'STEWARD', isActive: false },
];
const simulatedEvents = [];
const simulatedAlerts = [];
const simulatedIntegrations = [];
const simulatedAudit = [];

export class AccessControlError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'AccessControlError';
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

export function authorizeAccessControlRequest(req, permission = 'view') {
  const user = verifySessionToken(sessionFromRequest(req));
  if (!user?.id || !user.role) {
    return { authorized: false, status: 401, message: 'A valid signed-in staff session is required.' };
  }
  if (user.isDemo && process.env.NODE_ENV === 'production') {
    return { authorized: false, status: 403, message: 'Demo sessions cannot access production access control.' };
  }
  const roles = permission === 'manage'
    ? ['SYSTEM_ADMIN']
    : ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'STEWARD', 'GATE_OPERATOR'];
  if (!roles.includes(user.role)) {
    return { authorized: false, status: 403, message: 'Your role is not authorized to access this access-control operation.' };
  }
  return { authorized: true, user };
}

export function readAccessControlJson(req) {
  return req.json().catch(() => {
    throw new AccessControlError('Request body must be valid JSON.');
  });
}

export function accessControlErrorResponse(error) {
  const status = error instanceof AccessControlError ? error.status : 500;
  if (!(error instanceof AccessControlError)) console.error('[Access control API]', error);
  return Response.json({
    success: false,
    message: error instanceof AccessControlError ? error.message : 'Access-control request failed.',
  }, { status });
}

function persistentMode(simulatedOnly = false) {
  if (simulatedOnly) return false;
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') throw new AccessControlError('Access-control database is not configured.', 503);
    return false;
  }
  if (!prisma?.accessControlPoint || !prisma?.accessControlPermission || !prisma?.accessControlEvent || !prisma?.accessControlAuditLog) {
    throw new AccessControlError('Access-control database client is outdated; regenerate and deploy the Prisma schema.', 503);
  }
  return true;
}

function text(value, field, max = 120) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new AccessControlError(`${field} is required and must be at most ${max} characters.`);
  }
  return value.trim();
}

function optionalText(value, field, max = 160) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > max) throw new AccessControlError(`${field} must be at most ${max} characters.`);
  return value.trim() || null;
}

function makeReference(prefix) {
  return `${prefix}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

function auditKey() {
  const key = process.env.ACCESS_CONTROL_AUDIT_KEY || (process.env.NODE_ENV === 'production' ? null : process.env.JWT_SECRET || 'local-development-audit-key');
  if (!key) throw new AccessControlError('ACCESS_CONTROL_AUDIT_KEY must be configured in production.', 503);
  return key;
}

export function hashAccessSubject(value) {
  return crypto.createHmac('sha256', auditKey()).update(String(value)).digest('hex');
}

export function createAccessPoint(input, actor, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AccessControlError('An access point record is required.');
  const pointId = text(input.pointId || makeReference('ACP'), 'Access point ID', 64).toUpperCase();
  const hardwareType = text(input.hardwareType, 'Hardware type', 40).toUpperCase();
  const zone = text(input.zone, 'Stadium zone', 48).toUpperCase();
  if (!ACCESS_POINT_TYPES.includes(hardwareType)) throw new AccessControlError('Select a supported access-point hardware type.');
  if (!ACCESS_ZONES.includes(zone)) throw new AccessControlError('Select a supported stadium zone.');
  const data = {
    pointId,
    name: text(input.name, 'Access point name'),
    zone,
    location: text(input.location, 'Location'),
    hardwareType,
    manufacturer: optionalText(input.manufacturer, 'Manufacturer'),
    model: optionalText(input.model, 'Model'),
    isEmergencyExit: input.isEmergencyExit === true,
    installationStatus: 'REGISTERED',
    operationalStatus: 'UNKNOWN',
    integrationStatus: 'UNVERIFIED',
    statusSource: 'UNVERIFIED',
    isSimulated: !persistentMode(simulatedOnly),
  };
  return saveAccessPoint(data, actor, simulatedOnly);
}

async function saveAccessPoint(data, actor, simulatedOnly) {
  if (!persistentMode(simulatedOnly)) {
    if (simulatedPoints.some((point) => point.pointId === data.pointId)) throw new AccessControlError('Access point ID already exists.', 409);
    simulatedPoints.push(data);
    await recordAccessAudit(actor, 'ACCESS_POINT_REGISTERED', 'ACCESS_POINT', data.pointId, { zone: data.zone }, true);
    return data;
  }
  try {
    const point = await prisma.accessControlPoint.create({ data });
    await recordAccessAudit(actor, 'ACCESS_POINT_REGISTERED', 'ACCESS_POINT', point.pointId, { zone: point.zone }, false);
    return point;
  } catch (error) {
    if (error.code === 'P2002') throw new AccessControlError('Access point ID already exists.', 409);
    throw error;
  }
}

export function validateAccessPermission(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AccessControlError('An access permission record is required.');
  const targetType = text(input.targetType, 'Permission target type', 24).toUpperCase();
  if (!ACCESS_TARGET_TYPES.includes(targetType)) throw new AccessControlError('Select USER, ACCREDITATION, ROLE, or GROUP as the permission target.');
  const zone = text(input.zone, 'Stadium zone', 48).toUpperCase();
  if (!ACCESS_ZONES.includes(zone)) throw new AccessControlError('Select a supported stadium zone.');
  if (targetType === 'GROUP' && !input.groupName) throw new AccessControlError('A group name is required for group permissions.');
  const rawTarget = targetType === 'GROUP' ? input.groupName : input.targetId;
  const targetId = text(rawTarget, 'Permission target', 128);
  if (targetType === 'ROLE' && !['SYSTEM_ADMIN', 'VENUE_MANAGER', 'STEWARD', 'GATE_OPERATOR', 'FINANCE_OFFICER', 'CUSTOMER'].includes(targetId.toUpperCase())) {
    throw new AccessControlError('Select a role defined by the stadium user system.');
  }
  if (targetType === 'GROUP' && !['STADIUM_EMPLOYEE', 'SECURITY', 'EVENT_ORGANIZER', 'CONTRACTOR', 'VENDOR', 'TECHNICAL', 'MEDICAL_EMERGENCY', 'OTHER'].includes(targetId.toUpperCase())) {
    throw new AccessControlError('Select a staff group defined by the accreditation system.');
  }
  const validFrom = new Date(input.validFrom);
  const expiresAt = new Date(input.expiresAt);
  if (!Number.isFinite(validFrom.getTime()) || !Number.isFinite(expiresAt.getTime()) || expiresAt <= validFrom) {
    throw new AccessControlError('Permission start and expiry dates must be valid, and expiry must follow start.');
  }
  return {
    pointId: text(input.pointId, 'Access point ID', 64).toUpperCase(),
    targetType,
    targetId: ['ROLE', 'GROUP'].includes(targetType) ? targetId.toUpperCase() : targetId,
    groupName: targetType === 'GROUP' ? targetId.toUpperCase() : null,
    zone,
    validFrom,
    expiresAt,
    reason: optionalText(input.reason, 'Reason'),
  };
}

export async function createAccessPermission(input, actor, { simulatedOnly = false } = {}) {
  const record = validateAccessPermission(input);
  const persistent = persistentMode(simulatedOnly);
  if (persistent) {
    const point = await prisma.accessControlPoint.findUnique({ where: { pointId: record.pointId }, select: { pointId: true, zone: true, isEmergencyExit: true } });
    if (!point) throw new AccessControlError('Access point was not found.', 404);
    if (point.isEmergencyExit) throw new AccessControlError('Life-safety exits cannot receive access permissions.');
    if (point.zone !== record.zone) throw new AccessControlError('Permission zone must match the selected access point.');
    if (record.targetType === 'USER' && !(await prisma.user.findUnique({ where: { id: record.targetId }, select: { id: true } }))) {
      throw new AccessControlError('User was not found.');
    }
    if (record.targetType === 'ACCREDITATION' && !(await prisma.staffAccreditation.findUnique({ where: { accreditationNo: record.targetId }, select: { accreditationNo: true } }))) {
      throw new AccessControlError('Staff accreditation was not found.');
    }
    const permission = await prisma.accessControlPermission.create({
      data: { ...record, createdById: actor.id, createdByEmail: actor.email || null, isSimulated: false },
    });
    await recordAccessAudit(actor, 'ACCESS_PERMISSION_CREATED', 'ACCESS_PERMISSION', permission.id, { pointId: permission.pointId, targetType: permission.targetType, targetId: permission.targetId }, false);
    return permission;
  }
  const point = simulatedPoints.find((item) => item.pointId === record.pointId);
  if (!point) throw new AccessControlError('Access point was not found.', 404);
  if (point.isEmergencyExit) throw new AccessControlError('Life-safety exits cannot receive access permissions.');
  if (point.zone !== record.zone) throw new AccessControlError('Permission zone must match the selected access point.');
  const permission = {
    ...record, id: makeReference('SIM-PERM'), revokedAt: null, createdById: actor.id,
    createdByEmail: actor.email || null, isSimulated: true,
  };
  simulatedPermissions.push(permission);
  await recordAccessAudit(actor, 'ACCESS_PERMISSION_CREATED', 'ACCESS_PERMISSION', permission.id, { pointId: permission.pointId, targetType: permission.targetType, targetId: permission.targetId }, true);
  return permission;
}

async function resolveSubject(subjectType, subjectId, persistent) {
  if (subjectType === 'ACCREDITATION') {
    const subject = persistent
      ? await prisma.staffAccreditation.findUnique({ where: { accreditationNo: subjectId }, select: { accreditationNo: true, category: true, status: true, validFrom: true, validUntil: true } })
      : subjectId === 'DEMO-ACCESS-STAFF-001' ? { accreditationNo: subjectId, category: 'STADIUM_EMPLOYEE', status: 'APPROVED', validFrom: new Date('2020-01-01T00:00:00Z'), validUntil: new Date('2035-01-01T00:00:00Z') } : null;
    if (!subject || subject.status !== 'APPROVED' || new Date(subject.validFrom) > new Date() || new Date(subject.validUntil) < new Date()) return null;
    return { targetMatches: (permission) => (permission.targetType === 'ACCREDITATION' && permission.targetId === subjectId) || (permission.targetType === 'GROUP' && permission.targetId === subject.category) };
  }
  if (subjectType === 'USER') {
    const subject = persistent
      ? await prisma.user.findUnique({ where: { id: subjectId }, select: { id: true, role: true, isActive: true } })
      : simulatedUsers.find((user) => user.id === subjectId) || null;
    if (!subject?.isActive) return null;
    return { targetMatches: (permission) => (permission.targetType === 'USER' && permission.targetId === subjectId) || (permission.targetType === 'ROLE' && permission.targetId === subject.role) };
  }
  return null;
}

export async function recordAccessDecision(input, actor, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AccessControlError('An access decision request is required.');
  const pointId = text(input.pointId, 'Access point ID', 64).toUpperCase();
  const subjectType = text(input.subjectType, 'Subject type', 24).toUpperCase();
  const subjectId = text(input.subjectId, 'Credential reference', 128);
  if (!['USER', 'ACCREDITATION'].includes(subjectType)) throw new AccessControlError('Use a verified user ID or staff accreditation reference.');
  const persistent = persistentMode(simulatedOnly);
  const point = persistent
    ? await prisma.accessControlPoint.findUnique({ where: { pointId } })
    : simulatedPoints.find((item) => item.pointId === pointId);
  if (!point) throw new AccessControlError('Access point was not found.', 404);
  const subject = await resolveSubject(subjectType, subjectId, persistent);
  const now = new Date();
  const permissions = persistent
    ? await prisma.accessControlPermission.findMany({ where: { pointId, revokedAt: null, validFrom: { lte: now }, expiresAt: { gt: now } } })
    : simulatedPermissions.filter((item) => item.pointId === pointId && !item.revokedAt && new Date(item.validFrom) <= now && new Date(item.expiresAt) > now);
  const permission = subject && !point.isEmergencyExit
    ? permissions.find((item) => item.zone === point.zone && subject.targetMatches(item))
    : null;
  const outcome = permission ? 'AUTHORIZED' : 'DENIED';
  const reasonCode = point.isEmergencyExit ? 'LIFE_SAFETY_POINT_NO_ACCESS_CONTROL' : permission ? 'ACTIVE_PERMISSION' : subject ? 'NO_ACTIVE_PERMISSION' : 'INVALID_OR_INACTIVE_CREDENTIAL';
  const subjectHash = hashAccessSubject(`${subjectType}:${subjectId}`);
  const event = {
    eventRef: makeReference('ACE'),
    pointId,
    permissionId: permission?.id || null,
    outcome,
    reasonCode,
    subjectHash,
    source: persistent ? 'OPERATOR_RECORDED_NO_HARDWARE_COMMAND' : 'SIMULATED_DEVELOPMENT',
    isSimulated: !persistent || point.isSimulated,
    occurredAt: now,
  };
  if (persistent) {
    const saved = await prisma.accessControlEvent.create({ data: event });
    if (outcome === 'DENIED') await updateRepeatedDenialAlert(pointId, subjectHash, now, false);
    await recordAccessAudit(actor, 'ACCESS_DECISION_RECORDED', 'ACCESS_EVENT', saved.eventRef, { pointId, outcome, reasonCode, subjectHash }, false);
    return saved;
  }
  simulatedEvents.unshift({ id: makeReference('SIM-EVENT'), ...event });
  if (outcome === 'DENIED') await updateRepeatedDenialAlert(pointId, subjectHash, now, true);
  await recordAccessAudit(actor, 'ACCESS_DECISION_RECORDED', 'ACCESS_EVENT', event.eventRef, { pointId, outcome, reasonCode, subjectHash }, true);
  return simulatedEvents[0];
}

async function updateRepeatedDenialAlert(pointId, subjectHash, now, simulated) {
  const since = new Date(now.getTime() - 10 * 60 * 1000);
  if (simulated) {
    const attempts = simulatedEvents.filter((event) => event.pointId === pointId && event.subjectHash === subjectHash && event.outcome === 'DENIED' && new Date(event.occurredAt) >= since).length;
    if (attempts < 3) return;
    const active = simulatedAlerts.find((alert) => alert.pointId === pointId && alert.subjectHash === subjectHash && alert.status === 'ACTIVE');
    if (active) active.attemptCount = attempts;
    else simulatedAlerts.unshift({ id: makeReference('SIM-ALERT'), pointId, subjectHash, attemptCount: attempts, severity: 'HIGH', status: 'ACTIVE', title: 'Repeated unsuccessful access attempts', createdAt: now, isSimulated: true });
    return;
  }
  const attempts = await prisma.accessControlEvent.count({ where: { pointId, subjectHash, outcome: 'DENIED', occurredAt: { gte: since } } });
  if (attempts < 3) return;
  const alert = await prisma.accessControlAlert.findFirst({ where: { pointId, subjectHash, status: 'ACTIVE' } });
  if (alert) {
    await prisma.accessControlAlert.update({ where: { id: alert.id }, data: { attemptCount: attempts, severity: attempts >= 5 ? 'CRITICAL' : 'HIGH' } });
  } else {
    await prisma.accessControlAlert.create({ data: { pointId, subjectHash, attemptCount: attempts, severity: 'HIGH', title: 'Repeated unsuccessful access attempts' } });
  }
}

async function recordAccessAudit(actor, action, entityType, entityId, details, simulated) {
  const entry = {
    actorId: actor.id,
    actorEmail: actor.email || 'unknown',
    action,
    entityType,
    entityId,
    details: JSON.stringify(details),
    createdAt: new Date(),
  };
  if (simulated) {
    const previousHash = simulatedAudit.at(-1)?.recordHash || 'GENESIS';
    const recordHash = crypto.createHmac('sha256', auditKey()).update(`${previousHash}:${JSON.stringify(entry)}`).digest('hex');
    simulatedAudit.push({ ...entry, previousHash, recordHash, isSimulated: true });
    return;
  }
  const previous = await prisma.accessControlAuditLog.findFirst({ orderBy: { sequence: 'desc' }, select: { recordHash: true } });
  const previousHash = previous?.recordHash || 'GENESIS';
  const recordHash = crypto.createHmac('sha256', auditKey()).update(`${previousHash}:${JSON.stringify(entry)}`).digest('hex');
  await prisma.accessControlAuditLog.create({ data: { ...entry, previousHash, recordHash } });
}

export function verifyAccessAuditChain(records) {
  let previousHash = 'GENESIS';
  return records.every((record) => {
    if (record.previousHash !== previousHash) return false;
    const entry = {
      actorId: record.actorId,
      actorEmail: record.actorEmail,
      action: record.action,
      entityType: record.entityType,
      entityId: record.entityId,
      details: record.details,
      createdAt: record.createdAt,
    };
    const expected = crypto.createHmac('sha256', auditKey()).update(`${previousHash}:${JSON.stringify(entry)}`).digest('hex');
    if (expected !== record.recordHash) return false;
    previousHash = record.recordHash;
    return true;
  });
}

export async function getAccessAuditTrail({ simulatedOnly = false } = {}) {
  if (persistentMode(simulatedOnly)) {
    return prisma.accessControlAuditLog.findMany({ orderBy: { sequence: 'asc' }, take: 1000 });
  }
  return simulatedAudit.map((entry) => ({ ...entry }));
}

export async function createAccessIntegration(input, actor, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new AccessControlError('An integration record is required.');
  const protocol = text(input.protocol, 'Integration protocol', 40).toUpperCase();
  if (!ACCESS_INTEGRATION_PROTOCOLS.includes(protocol)) throw new AccessControlError('Select a supported vendor integration protocol.');
  const endpointUrl = text(input.endpointUrl, 'Controller endpoint', 500);
  let url;
  try { url = new URL(endpointUrl); } catch { throw new AccessControlError('Controller endpoint must be a valid HTTPS URL.'); }
  if (url.protocol !== 'https:' || url.username || url.password) throw new AccessControlError('Controller endpoint must use HTTPS and must not contain credentials.');
  const data = {
    providerName: text(input.providerName, 'Provider name'),
    protocol,
    endpointUrl: url.toString(),
    secretReference: optionalText(input.secretReference, 'Secret-manager reference', 240),
    connectionStatus: 'UNVERIFIED',
    isSimulated: !persistentMode(simulatedOnly),
    createdById: actor.id,
    createdByEmail: actor.email || null,
  };
  if (persistentMode(simulatedOnly)) {
    const integration = await prisma.accessControlIntegration.create({ data });
    await recordAccessAudit(actor, 'ACCESS_INTEGRATION_REGISTERED', 'INTEGRATION', integration.id, { providerName: integration.providerName, protocol }, false);
    return integration;
  }
  const integration = { ...data, id: makeReference('SIM-INTEGRATION'), createdAt: new Date(), updatedAt: new Date() };
  simulatedIntegrations.push(integration);
  await recordAccessAudit(actor, 'ACCESS_INTEGRATION_REGISTERED', 'INTEGRATION', integration.id, { providerName: integration.providerName, protocol }, true);
  return integration;
}

export async function getAccessControlDashboard({ zone = 'ALL', simulatedOnly = false, includeSensitive = false } = {}) {
  if (zone !== 'ALL' && !ACCESS_ZONES.includes(zone)) throw new AccessControlError('Select a supported stadium zone.');
  if (persistentMode(simulatedOnly)) {
    const where = zone === 'ALL' ? {} : { zone };
    const [points, events, alerts, permissions, integrations] = await Promise.all([
      prisma.accessControlPoint.findMany({ where, orderBy: [{ zone: 'asc' }, { pointId: 'asc' }] }),
      prisma.accessControlEvent.findMany({ where: zone === 'ALL' ? {} : { point: { zone } }, orderBy: { occurredAt: 'desc' }, take: 100 }),
      prisma.accessControlAlert.findMany({ where: { ...(zone === 'ALL' ? {} : { point: { zone } }) }, orderBy: { createdAt: 'desc' }, take: 100 }),
      prisma.accessControlPermission.count({ where: { ...(zone === 'ALL' ? {} : { point: { zone } }), revokedAt: null, validFrom: { lte: new Date() }, expiresAt: { gt: new Date() } } }),
      includeSensitive ? prisma.accessControlIntegration.findMany({ orderBy: { createdAt: 'desc' } }) : Promise.resolve([]),
    ]);
    return dashboardResult(points, events, alerts, permissions, integrations, false);
  }
  const points = simulatedPoints.filter((point) => zone === 'ALL' || point.zone === zone);
  const pointIds = new Set(points.map((point) => point.pointId));
  return dashboardResult(
    points,
    simulatedEvents.filter((event) => pointIds.has(event.pointId)).slice(0, 100),
    simulatedAlerts.filter((alert) => pointIds.has(alert.pointId)),
    simulatedPermissions.filter((permission) => pointIds.has(permission.pointId) && !permission.revokedAt && new Date(permission.validFrom) <= new Date() && new Date(permission.expiresAt) > new Date()).length,
    includeSensitive ? simulatedIntegrations : [],
    true,
  );
}

function dashboardResult(points, events, alerts, permissionCount, integrations, simulated) {
  const liveOnline = points.filter((point) => !point.isSimulated && point.integrationStatus === 'VERIFIED' && point.operationalStatus === 'ONLINE').length;
  return {
    adapter: { mode: simulated ? 'SIMULATED_DEVELOPMENT' : 'UNVERIFIED_NO_HARDWARE_ADAPTER', hardwareConnected: false, commandsEnabled: false },
    metrics: {
      points: points.length,
      liveOnline,
      liveOffline: points.filter((point) => !point.isSimulated && point.integrationStatus === 'VERIFIED' && point.operationalStatus === 'OFFLINE').length,
      unknown: points.filter((point) => point.operationalStatus === 'UNKNOWN' || point.integrationStatus !== 'VERIFIED').length,
      activeAlerts: alerts.filter((alert) => alert.status === 'ACTIVE').length,
      activePermissions: permissionCount,
    },
    points,
    events: events.map((event) => ({
      ...event,
      subjectHash: event.subjectHash ? `${event.subjectHash.slice(0, 12)}…` : undefined,
    })),
    alerts: alerts.map((alert) => ({ ...alert, subjectHash: alert.subjectHash ? `${alert.subjectHash.slice(0, 12)}…` : undefined })),
    integrations: integrations.map((integration) => ({
      ...integration,
      ...(integration.secretReference ? { secretReference: 'Configured in secret manager' } : {}),
      endpointUrl: 'REDACTED',
    })),
  };
}

export async function listAccessPermissions({ zone = 'ALL', simulatedOnly = false } = {}) {
  if (zone !== 'ALL' && !ACCESS_ZONES.includes(zone)) throw new AccessControlError('Select a supported stadium zone.');
  if (persistentMode(simulatedOnly)) {
    return prisma.accessControlPermission.findMany({
      where: zone === 'ALL' ? {} : { point: { zone } },
      orderBy: [{ pointId: 'asc' }, { validFrom: 'desc' }],
      take: 500,
    });
  }
  return simulatedPermissions.filter((permission) => zone === 'ALL' || permission.zone === zone);
}

export async function revokeAccessPermission(permissionId, actor, { simulatedOnly = false } = {}) {
  const id = text(permissionId, 'Permission ID', 128);
  if (persistentMode(simulatedOnly)) {
    const permission = await prisma.accessControlPermission.findUnique({ where: { id } });
    if (!permission) throw new AccessControlError('Access permission was not found.', 404);
    if (permission.revokedAt) return permission;
    const revoked = await prisma.accessControlPermission.update({ where: { id }, data: { revokedAt: new Date() } });
    await recordAccessAudit(actor, 'ACCESS_PERMISSION_REVOKED', 'ACCESS_PERMISSION', id, { pointId: permission.pointId }, false);
    return revoked;
  }
  const permission = simulatedPermissions.find((item) => item.id === id);
  if (!permission) throw new AccessControlError('Access permission was not found.', 404);
  permission.revokedAt = new Date();
  await recordAccessAudit(actor, 'ACCESS_PERMISSION_REVOKED', 'ACCESS_PERMISSION', id, { pointId: permission.pointId }, true);
  return permission;
}

export async function listAccessEvents({ zone = 'ALL', simulatedOnly = false } = {}) {
  if (zone !== 'ALL' && !ACCESS_ZONES.includes(zone)) throw new AccessControlError('Select a supported stadium zone.');
  if (persistentMode(simulatedOnly)) {
    return prisma.accessControlEvent.findMany({
      where: zone === 'ALL' ? {} : { point: { zone } },
      orderBy: { occurredAt: 'desc' },
      take: 200,
    });
  }
  const pointIds = new Set(simulatedPoints.filter((point) => zone === 'ALL' || point.zone === zone).map((point) => point.pointId));
  return simulatedEvents.filter((event) => pointIds.has(event.pointId)).slice(0, 200);
}
