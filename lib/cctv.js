import crypto from 'crypto';
import { prisma } from './prisma.js';
import { logAuditEvent } from './audit.js';
import { verifySessionToken } from './auth.js';

export const CAMERA_ZONES = ['BOWL', 'CONCOURSE', 'ENTRANCE', 'EXIT', 'PARKING', 'RESTRICTED', 'OTHER'];
export const CAMERA_TYPES = ['FIXED', 'PTZ', 'THERMAL', 'DOME', 'BULLET', 'OTHER'];
export const INSTALLATION_STATUSES = ['PLANNED', 'INSTALLED', 'DECOMMISSIONED'];
export const VMS_PROTOCOLS = [
  { id: 'ONVIF', label: 'ONVIF (verify equipment support)', adapterAvailable: false },
  { id: 'VENDOR_API', label: 'Vendor-approved API', adapterAvailable: false },
];

export class CctvError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'CctvError';
    this.status = status;
  }
}

export const simulatedCameras = [
  {
    id: 'SIM-CAM-001', cameraId: 'CAM-GATE-A-01', name: 'Gate A Approach', zone: 'ENTRANCE',
    locationDescription: 'North approach, Gate A pedestrian entry', cameraType: 'FIXED',
    manufacturer: 'Development fixture', model: 'Simulated camera', installationStatus: 'INSTALLED',
    operationalStatus: 'ONLINE', statusSource: 'SIMULATED', lastStatusAt: new Date().toISOString(),
    privacyMaskingSupported: true, privacyMaskingEnabled: true, isSimulated: true,
  },
  {
    id: 'SIM-CAM-002', cameraId: 'CAM-PARK-N-02', name: 'North Parking Lane', zone: 'PARKING',
    locationDescription: 'North parking vehicle entrance lane', cameraType: 'PTZ',
    manufacturer: 'Development fixture', model: 'Simulated camera', installationStatus: 'INSTALLED',
    operationalStatus: 'OFFLINE', statusSource: 'SIMULATED', lastStatusAt: new Date().toISOString(),
    privacyMaskingSupported: false, privacyMaskingEnabled: false, isSimulated: true,
  },
  {
    id: 'SIM-CAM-003', cameraId: 'CAM-TUNNEL-03', name: 'Restricted Service Tunnel', zone: 'RESTRICTED',
    locationDescription: 'Restricted west service tunnel', cameraType: 'DOME',
    manufacturer: 'Development fixture', model: 'Simulated camera', installationStatus: 'PLANNED',
    operationalStatus: 'UNKNOWN', statusSource: 'SIMULATED', lastStatusAt: null,
    privacyMaskingSupported: true, privacyMaskingEnabled: false, isSimulated: true,
  },
];
export const simulatedCameraEvents = [{
  id: 'SIM-EVT-001', cameraId: 'CAM-GATE-A-01', eventType: 'ACCESS_ALERT',
  summary: 'Simulated perimeter alert metadata; no footage is stored.',
  occurredAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  incidentReference: 'INC-DEMO-1042', vmsRecordingUrl: null, isSimulated: true,
}];
export const simulatedVmsIntegrations = [];
export const cameraAccessAudit = [];

const VIEW_ROLES = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'STEWARD'];
const MANAGE_ROLES = ['SYSTEM_ADMIN', 'VENUE_MANAGER'];
const CONFIGURE_ROLES = ['SYSTEM_ADMIN'];

function getSessionToken(req) {
  const authorization = req.headers.get('authorization') || '';
  if (authorization.startsWith('Bearer ')) return authorization.slice(7).trim();
  const cookies = req.headers.get('cookie') || '';
  const cookie = cookies.split(';').map((part) => part.trim()).find((part) => part.startsWith('talanta_session='));
  return cookie ? decodeURIComponent(cookie.slice('talanta_session='.length)) : null;
}

export function authorizeCctvRequest(req, permission = 'view') {
  const session = verifySessionToken(getSessionToken(req));
  if (!session?.id || !session.role) {
    return { authorized: false, status: 401, message: 'A valid signed-in session is required.' };
  }
  if (session.isDemo && (process.env.NODE_ENV === 'production' || permission === 'configure')) {
    return { authorized: false, status: 403, message: 'Demo sessions cannot access production CCTV or VMS configuration.' };
  }
  const roles = permission === 'configure' ? CONFIGURE_ROLES : permission === 'manage' ? MANAGE_ROLES : VIEW_ROLES;
  if (!roles.includes(session.role)) {
    return { authorized: false, status: 403, message: 'Your role is not authorized for this CCTV operation.' };
  }
  return { authorized: true, user: session };
}

export async function readCctvBody(req) {
  try { return await req.json(); }
  catch { throw new CctvError('Request body must be valid JSON.'); }
}

export function cctvErrorResponse(error) {
  const status = error instanceof CctvError ? error.status : 500;
  if (!(error instanceof CctvError)) console.error('[CCTV API]', error);
  return Response.json({
    success: false,
    message: error instanceof CctvError ? error.message : 'CCTV service request failed.',
  }, { status });
}

function databaseMode(simulatedOnly = false) {
  if (simulatedOnly) return false;
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') throw new CctvError('CCTV database is not configured.', 503);
    return false;
  }
  if (!prisma?.camera || !prisma?.cameraAccessLog) {
    throw new CctvError('CCTV database client is unavailable; generate and deploy the current Prisma schema.', 503);
  }
  return true;
}

function requiredText(value, field, max = 160) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new CctvError(`${field} is required and must be at most ${max} characters.`);
  }
  return value.trim();
}

function optionalText(value, field, max = 160) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > max) throw new CctvError(`${field} must be at most ${max} characters.`);
  return value.trim() || null;
}

export function validateCameraInput(input, partial = false) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new CctvError('A camera record is required.');
  const keys = ['cameraId', 'name', 'zone', 'locationDescription', 'cameraType', 'manufacturer', 'model', 'installationStatus', 'privacyMaskingSupported', 'privacyMaskingEnabled'];
  if (partial && !keys.some((key) => Object.prototype.hasOwnProperty.call(input, key))) throw new CctvError('No supported camera fields were provided.');
  const result = {};
  if (!partial || 'cameraId' in input) result.cameraId = optionalText(input.cameraId, 'Camera ID', 64)?.toUpperCase() || null;
  if (!partial || 'name' in input) result.name = requiredText(input.name, 'Camera name', 120);
  if (!partial || 'zone' in input) {
    result.zone = requiredText(input.zone, 'Zone', 32).toUpperCase();
    if (!CAMERA_ZONES.includes(result.zone)) throw new CctvError('Select a supported stadium zone.');
  }
  if (!partial || 'locationDescription' in input) result.locationDescription = requiredText(input.locationDescription, 'Location description', 240);
  if (!partial || 'cameraType' in input) {
    result.cameraType = requiredText(input.cameraType, 'Camera type', 32).toUpperCase();
    if (!CAMERA_TYPES.includes(result.cameraType)) throw new CctvError('Select a supported camera type.');
  }
  for (const field of ['manufacturer', 'model']) {
    if (!partial || field in input) result[field] = optionalText(input[field], field, 120);
  }
  if (!partial || 'installationStatus' in input) {
    result.installationStatus = input.installationStatus == null ? 'PLANNED' : requiredText(input.installationStatus, 'Installation status', 32).toUpperCase();
    if (!INSTALLATION_STATUSES.includes(result.installationStatus)) throw new CctvError('Select a supported installation status.');
  }
  for (const field of ['privacyMaskingSupported', 'privacyMaskingEnabled']) {
    if (!partial || field in input) {
      if (input[field] != null && typeof input[field] !== 'boolean') throw new CctvError(`${field} must be true or false.`);
      result[field] = input[field] === true;
    }
  }
  if (partial && 'cameraId' in input && !result.cameraId) throw new CctvError('Camera ID cannot be cleared.');
  if (result.privacyMaskingEnabled && !result.privacyMaskingSupported) throw new CctvError('Privacy masking cannot be enabled unless the camera supports it.');
  return result;
}

export function validateIntegrationInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new CctvError('An integration configuration is required.');
  const providerName = requiredText(input.providerName, 'Provider name', 120);
  const protocol = requiredText(input.protocol, 'Protocol', 32).toUpperCase();
  if (!VMS_PROTOCOLS.some((item) => item.id === protocol)) throw new CctvError('Only ONVIF or vendor-approved API configurations are supported.');
  const endpointUrl = requiredText(input.endpointUrl, 'HTTPS endpoint URL', 500);
  let endpoint;
  try { endpoint = new URL(endpointUrl); } catch { throw new CctvError('Endpoint must be a valid HTTPS URL.'); }
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new CctvError('Endpoint must use HTTPS and must not contain credentials.');
  const secretReference = optionalText(input.secretReference, 'Secret-manager reference', 200);
  if (secretReference && !/^(vault:\/\/|secret:\/\/|arn:aws:secretsmanager:|projects\/[^/]+\/secrets\/[^/]+\/versions\/)/i.test(secretReference)) {
    throw new CctvError('Provide a secret-manager reference URI; never enter a password or API token.');
  }
  return { providerName, protocol, endpointUrl: endpoint.toString(), secretReference };
}

function validateRecordingUrl(rawUrl, integrations) {
  if (!rawUrl) return null;
  let recordingUrl;
  try { recordingUrl = new URL(rawUrl); } catch { throw new CctvError('Recording link must be a valid HTTPS URL.'); }
  if (recordingUrl.protocol !== 'https:' || recordingUrl.username || recordingUrl.password) throw new CctvError('Recording link must use HTTPS and must not contain embedded credentials.');
  const hosts = integrations.map((item) => {
    try { return new URL(item.endpointUrl).hostname.toLowerCase(); } catch { return ''; }
  });
  if (!hosts.includes(recordingUrl.hostname.toLowerCase())) throw new CctvError('Recording link must use a configured VMS host.');
  return recordingUrl.toString();
}

export function validateCameraEventInput(input, integrations = []) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new CctvError('Event metadata is required.');
  const occurredAt = new Date(input.occurredAt);
  if (!input.occurredAt || Number.isNaN(occurredAt.getTime())) throw new CctvError('A valid event time is required.');
  return {
    cameraId: requiredText(input.cameraId, 'Camera ID', 64),
    eventType: requiredText(input.eventType, 'Event type', 80),
    summary: requiredText(input.summary, 'Event summary', 500),
    occurredAt,
    incidentReference: requiredText(input.incidentReference, 'Incident reference', 100),
    vmsRecordingUrl: validateRecordingUrl(input.vmsRecordingUrl, integrations),
  };
}

export async function recordCameraAccess({ user, action, entityType, entityId, req }) {
  const entry = {
    id: crypto.randomUUID(), userId: user.id, userEmail: user.email || 'unknown', action,
    entityType, entityId: entityId || null,
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    userAgent: req.headers.get('user-agent') || null, createdAt: new Date(),
  };
  if (databaseMode(Boolean(user.isDemo))) {
    try {
      await prisma.cameraAccessLog.create({ data: {
        userId: entry.userId, userEmail: entry.userEmail, action: entry.action,
        cameraId: entityType === 'CAMERA' ? entityId : null,
        ipAddress: entry.ipAddress, userAgent: entry.userAgent,
      } });
    } catch (error) {
      console.error('[CCTV audit persistence failed]', error);
      throw new CctvError('Sensitive CCTV access could not be audited; request blocked.', 503);
    }
  } else cameraAccessAudit.unshift(entry);
  await logAuditEvent({
    userId: entry.userId, userEmail: entry.userEmail, action: entry.action,
    entityType: entry.entityType, entityId: entry.entityId, ipAddress: entry.ipAddress,
    userAgent: entry.userAgent, details: 'Sensitive CCTV metadata access or change.',
  });
  return entry;
}

export async function listCameras({ zone = 'ALL', simulatedOnly = false } = {}) {
  if (databaseMode(simulatedOnly)) {
    try { return await prisma.camera.findMany({ where: zone === 'ALL' ? {} : { zone }, orderBy: [{ zone: 'asc' }, { cameraId: 'asc' }] }); }
    catch (error) {
      console.error('[CCTV camera inventory query failed]', error);
      throw new CctvError('Camera inventory is temporarily unavailable.', 503);
    }
  }
  return simulatedCameras.filter((camera) => zone === 'ALL' || camera.zone === zone);
}

export async function createCamera(input, { simulatedOnly = false } = {}) {
  const data = validateCameraInput(input);
  const persistent = databaseMode(simulatedOnly);
  data.cameraId ||= `CAM-${data.zone.slice(0, 3)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  if (persistent) {
    try { return await prisma.camera.create({ data: { ...data, isSimulated: false } }); }
    catch (error) {
      if (error.code === 'P2002') throw new CctvError('That camera ID is already registered.', 409);
      console.error('[CCTV camera registration failed]', error);
      throw new CctvError('Camera registration failed.', 503);
    }
  }
  if (simulatedCameras.some((camera) => camera.cameraId.toLowerCase() === data.cameraId.toLowerCase())) throw new CctvError('That camera ID is already registered.', 409);
  const camera = {
    ...data, id: crypto.randomUUID(), operationalStatus: 'UNKNOWN', statusSource: 'UNVERIFIED',
    lastStatusAt: null, isSimulated: true, createdAt: new Date(), updatedAt: new Date(),
  };
  simulatedCameras.unshift(camera);
  return camera;
}

export async function updateCamera(cameraId, input, { simulatedOnly = false } = {}) {
  const data = validateCameraInput(input, true);
  if (databaseMode(simulatedOnly)) {
    try { return await prisma.camera.update({ where: { cameraId }, data }); }
    catch (error) {
      if (error.code === 'P2025') throw new CctvError('Camera was not found.', 404);
      if (error.code === 'P2002') throw new CctvError('That camera ID is already registered.', 409);
      console.error('[CCTV camera update failed]', error);
      throw new CctvError('Camera update failed.', 503);
    }
  }
  const index = simulatedCameras.findIndex((camera) => camera.cameraId === cameraId);
  if (index < 0) throw new CctvError('Camera was not found.', 404);
  if (data.cameraId && data.cameraId !== cameraId && simulatedCameras.some((camera) => camera.cameraId === data.cameraId)) throw new CctvError('That camera ID is already registered.', 409);
  simulatedCameras[index] = { ...simulatedCameras[index], ...data, updatedAt: new Date() };
  return simulatedCameras[index];
}

export async function listVmsIntegrations({ simulatedOnly = false } = {}) {
  if (databaseMode(simulatedOnly)) {
    try { return await prisma.vmsIntegration.findMany({ orderBy: { createdAt: 'desc' } }); }
    catch (error) {
      console.error('[CCTV VMS configuration query failed]', error);
      throw new CctvError('VMS configurations are temporarily unavailable.', 503);
    }
  }
  return simulatedVmsIntegrations;
}

export async function createVmsIntegration(input, user, { simulatedOnly = false } = {}) {
  const data = validateIntegrationInput(input);
  const persistent = databaseMode(simulatedOnly);
  const metadata = { ...data, connectionStatus: 'UNVERIFIED', isSimulated: !persistent, createdById: user.id, createdByEmail: user.email || null };
  if (persistent) {
    try { return await prisma.vmsIntegration.create({ data: { ...metadata, isSimulated: false } }); }
    catch (error) {
      console.error('[CCTV VMS configuration save failed]', error);
      throw new CctvError('VMS configuration could not be saved.', 503);
    }
  }
  const integration = { id: crypto.randomUUID(), ...metadata, createdAt: new Date(), updatedAt: new Date() };
  simulatedVmsIntegrations.unshift(integration);
  return integration;
}

export async function listCameraEvents({ simulatedOnly = false } = {}) {
  if (databaseMode(simulatedOnly)) {
    try { return await prisma.cameraEventMetadata.findMany({ orderBy: { occurredAt: 'desc' }, take: 100 }); }
    catch (error) {
      console.error('[CCTV event metadata query failed]', error);
      throw new CctvError('Camera event metadata is temporarily unavailable.', 503);
    }
  }
  return simulatedCameraEvents;
}

export async function createCameraEvent(input, user, { simulatedOnly = false } = {}) {
  const integrations = await listVmsIntegrations({ simulatedOnly });
  const data = validateCameraEventInput(input, integrations);
  if (databaseMode(simulatedOnly)) {
    try {
      const camera = await prisma.camera.findUnique({ where: { cameraId: data.cameraId }, select: { cameraId: true } });
      if (!camera) throw new CctvError('Camera was not found.', 404);
      return await prisma.cameraEventMetadata.create({ data: { ...data, isSimulated: false, createdById: user.id, createdByEmail: user.email || null } });
    } catch (error) {
      if (error instanceof CctvError) throw error;
      console.error('[CCTV event metadata save failed]', error);
      throw new CctvError('Camera event metadata could not be saved.', 503);
    }
  }
  if (!simulatedCameras.some((camera) => camera.cameraId === data.cameraId)) throw new CctvError('Camera was not found.', 404);
  const event = { id: crypto.randomUUID(), ...data, isSimulated: true, createdById: user.id, createdByEmail: user.email || null, createdAt: new Date() };
  simulatedCameraEvents.unshift(event);
  return event;
}

export function summarizeCameras(cameras) {
  const live = cameras.filter((camera) => !camera.isSimulated);
  return {
    inventory: cameras.length,
    installed: cameras.filter((camera) => camera.installationStatus === 'INSTALLED').length,
    liveOnline: live.filter((camera) => camera.operationalStatus === 'ONLINE').length,
    liveOffline: live.filter((camera) => camera.operationalStatus === 'OFFLINE').length,
    liveUnknown: live.filter((camera) => ['UNKNOWN', 'DEGRADED'].includes(camera.operationalStatus)).length,
    simulated: cameras.filter((camera) => camera.isSimulated).length,
  };
}