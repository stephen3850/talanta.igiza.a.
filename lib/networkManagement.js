import crypto from 'crypto';
import { prisma } from './prisma.js';
import { logAuditEvent } from './audit.js';
import { verifySessionToken } from './auth.js';
import { getAllAlerts, initialDevices } from './networkOperations.js';

export const NETWORK_ZONES = [
  'BOWL', 'CONCOURSE', 'ENTRANCE', 'EXIT', 'PARKING',
  'ADMINISTRATION', 'DATA_CENTRE', 'CRITICAL_INFRASTRUCTURE', 'OTHER',
];
export const NETWORK_DEVICE_TYPES = [
  'ROUTER', 'CORE_SWITCH', 'EDGE_SWITCH', 'WIRELESS_AP',
  'WIRELESS_CONTROLLER', 'NETWORK_GATEWAY',
];
export const NETWORK_MONITORING_PROTOCOLS = [
  { id: 'SNMPV3', label: 'SNMPv3 AuthPriv', adapterAvailable: false },
  { id: 'CONTROLLER_API', label: 'Wireless controller API over HTTPS', adapterAvailable: false },
];
export const NETWORK_SEGMENTS = [
  { segmentKey: 'ADMINISTRATION', name: 'Stadium administration', purpose: 'Administrative systems and managed workstations' },
  { segmentKey: 'TICKETING_PAYMENTS', name: 'Ticketing and payments', purpose: 'Ticketing, checkout, and payment services' },
  { segmentKey: 'CCTV_SECURITY', name: 'CCTV and security', purpose: 'Camera, VMS, and security operations' },
  { segmentKey: 'STADIUM_IOT', name: 'Stadium IoT', purpose: 'Building and stadium IoT devices' },
  { segmentKey: 'STAFF_OPERATIONS', name: 'Staff operations', purpose: 'Staff and operational handheld devices' },
  { segmentKey: 'GUEST_WIFI', name: 'Guest Wi-Fi', purpose: 'Isolated public guest access' },
  { segmentKey: 'CRITICAL_INFRASTRUCTURE', name: 'Critical infrastructure', purpose: 'Isolated critical venue control systems' },
];

export class NetworkManagementError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'NetworkManagementError';
    this.status = status;
  }
}

export const simulatedNetworkDevices = initialDevices.map((device, index) => ({
  id: device.id,
  deviceId: device.id,
  name: device.name,
  category: device.category,
  zone: index === 6 ? 'BOWL' : index === 3 || index === 7 ? 'CONCOURSE' : 'DATA_CENTRE',
  manufacturer: device.vendorModel?.split(' ')[0] || 'Unknown',
  model: device.vendorModel || 'Not recorded',
  operationalStatus: device.status,
  status: device.status,
  statusSource: 'SIMULATED',
  lastStatusAt: device.lastCheckAt,
  latencyMs: device.latencyMs,
  packetLossPercent: device.packetLossPercent,
  connectedDevices: index === 6 ? 1840 : null,
  isSimulated: true,
}));

export const simulatedNetworkAlerts = getAllAlerts().map((alert) => ({ ...alert, isSimulated: true }));
export const simulatedControllerIntegrations = [];
export const simulatedGuestPolicies = [];
export const simulatedWifiUsage = [{
  id: 'SIM-WIFI-AGG-001',
  windowStart: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  windowMinutes: 15,
  connectedDevices: 1840,
  sessions: 1294,
  totalDataMb: 9432,
  source: 'DEVELOPMENT_FIXTURE',
  isSimulated: true,
}];
export const networkAccessAudit = [];

function sessionFromRequest(req) {
  const authorization = req.headers.get('authorization') || '';
  if (authorization.startsWith('Bearer ')) return authorization.slice(7).trim();
  const cookie = (req.headers.get('cookie') || '').split(';').map((part) => part.trim())
    .find((part) => part.startsWith('talanta_session='));
  return cookie ? decodeURIComponent(cookie.slice('talanta_session='.length)) : null;
}

export function authorizeNetworkRequest(req, permission = 'view') {
  const user = verifySessionToken(sessionFromRequest(req));
  if (!user?.id || !user.role) {
    return { authorized: false, status: 401, message: 'A valid signed-in staff session is required.' };
  }
  if (user.isDemo && (process.env.NODE_ENV === 'production' || permission === 'configure')) {
    return { authorized: false, status: 403, message: 'Demo sessions cannot access production network management.' };
  }
  const roles = permission === 'manage' ? ['SYSTEM_ADMIN'] : ['SYSTEM_ADMIN', 'VENUE_MANAGER'];
  if (!roles.includes(user.role)) {
    return { authorized: false, status: 403, message: 'Your role is not authorized to view or manage network operations.' };
  }
  return { authorized: true, user };
}

export async function readNetworkJson(req) {
  try { return await req.json(); }
  catch { throw new NetworkManagementError('Request body must be valid JSON.'); }
}

export function networkErrorResponse(error) {
  const status = error instanceof NetworkManagementError ? error.status : 500;
  if (!(error instanceof NetworkManagementError)) console.error('[Network management API]', error);
  return Response.json({
    success: false,
    message: error instanceof NetworkManagementError ? error.message : 'Network management request failed.',
  }, { status });
}

function persistentMode(simulatedOnly = false) {
  if (simulatedOnly) return false;
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') throw new NetworkManagementError('Network management database is not configured.', 503);
    return false;
  }
  if (
    !prisma?.networkInfrastructureDevice ||
    !prisma?.networkAccessLog ||
    !prisma?.networkSegment ||
    !prisma?.wirelessControllerIntegration ||
    !prisma?.guestWifiPolicy ||
    !prisma?.wifiUsageAggregate
  ) {
    throw new NetworkManagementError('Network management database client is outdated; regenerate and deploy the Prisma schema.', 503);
  }
  return true;
}

function text(value, field, max = 160) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new NetworkManagementError(`${field} is required and must be at most ${max} characters.`);
  }
  return value.trim();
}

function optionalText(value, field, max = 200) {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.trim().length > max) throw new NetworkManagementError(`${field} must be at most ${max} characters.`);
  return value.trim() || null;
}

export function validateNetworkDevice(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new NetworkManagementError('A network device record is required.');
  const category = text(input.category, 'Device type', 40).toUpperCase();
  if (!NETWORK_DEVICE_TYPES.includes(category)) throw new NetworkManagementError('Select a supported network device type.');
  const zone = text(input.zone, 'Stadium zone', 48).toUpperCase();
  if (!NETWORK_ZONES.includes(zone)) throw new NetworkManagementError('Select a supported stadium zone.');
  return {
    name: text(input.name, 'Device name', 120),
    category,
    zone,
    manufacturer: optionalText(input.manufacturer, 'Manufacturer', 120),
    model: optionalText(input.model, 'Model', 120),
  };
}

function autoDeviceId(category) {
  return `NET-${category.slice(0, 3)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

export async function listNetworkDevices({ zone = 'ALL', simulatedOnly = false, facilityId = 'FACILITY-TALANTA-STADIUM' } = {}) {
  if (!NETWORK_ZONES.includes(zone) && zone !== 'ALL') throw new NetworkManagementError('Select a supported stadium zone.');
  if (persistentMode(simulatedOnly)) {
    try {
      return await prisma.networkInfrastructureDevice.findMany({
        where: { facilityId, ...(zone === 'ALL' ? {} : { zone }) },
        orderBy: [{ zone: 'asc' }, { deviceId: 'asc' }],
      });
    } catch (error) {
      console.error('[Network inventory query failed]', error);
      throw new NetworkManagementError('Network inventory is temporarily unavailable.', 503);
    }
  }
  return facilityId === 'FACILITY-TALANTA-STADIUM'
    ? simulatedNetworkDevices.filter((device) => zone === 'ALL' || device.zone === zone)
    : [];
}

export async function registerNetworkDevice(input, { simulatedOnly = false } = {}) {
  const record = validateNetworkDevice(input);
  const deviceId = optionalText(input.deviceId, 'Device ID', 64) || autoDeviceId(record.category);
  const persistent = persistentMode(simulatedOnly);
  const data = {
    ...record, deviceId, operationalStatus: 'UNKNOWN', statusSource: 'UNVERIFIED',
    lastStatusAt: null, isSimulated: !persistent,
    facilityId: input.facilityId || 'FACILITY-TALANTA-STADIUM',
  };
  if (persistent) {
    try { return await prisma.networkInfrastructureDevice.create({ data }); }
    catch (error) {
      if (error.code === 'P2002') throw new NetworkManagementError('That device ID is already registered.', 409);
      console.error('[Network inventory registration failed]', error);
      throw new NetworkManagementError('Network device registration failed.', 503);
    }
  }
  if (simulatedNetworkDevices.some((device) => device.deviceId.toLowerCase() === deviceId.toLowerCase())) {
    throw new NetworkManagementError('That device ID is already registered.', 409);
  }
  const simulated = {
    ...data, id: deviceId, status: data.operationalStatus,
    connectedDevices: record.category === 'WIRELESS_AP' ? 0 : null,
    isSimulated: true, createdAt: new Date().toISOString(),
  };
  simulatedNetworkDevices.unshift(simulated);
  return simulated;
}

async function ensureSegments(simulatedOnly, facilityId) {
  if (!persistentMode(simulatedOnly)) return NETWORK_SEGMENTS.map((segment) => ({ ...segment, status: 'PROPOSED', isSimulated: true }));
  try {
    return await Promise.all(NETWORK_SEGMENTS.map((segment) => prisma.networkSegment.upsert({
      where: { facilityId_segmentKey: { facilityId, segmentKey: segment.segmentKey } },
      update: {},
      create: { ...segment, facilityId, status: 'PROPOSED', isSimulated: false },
    })));
  } catch (error) {
    console.error('[Network segment query failed]', error);
    throw new NetworkManagementError('Network segmentation inventory is temporarily unavailable.', 503);
  }
}

async function listControllers(simulatedOnly, facilityId) {
  if (!persistentMode(simulatedOnly)) return facilityId === 'FACILITY-TALANTA-STADIUM' ? simulatedControllerIntegrations : [];
  try { return await prisma.wirelessControllerIntegration.findMany({ where: { facilityId }, orderBy: { createdAt: 'desc' } }); }
  catch (error) {
    console.error('[Wireless controller query failed]', error);
    throw new NetworkManagementError('Controller configurations are temporarily unavailable.', 503);
  }
}

async function listPolicies(simulatedOnly, facilityId) {
  if (!persistentMode(simulatedOnly)) return facilityId === 'FACILITY-TALANTA-STADIUM' ? simulatedGuestPolicies : [];
  try { return await prisma.guestWifiPolicy.findMany({ where: { facilityId }, orderBy: { createdAt: 'desc' }, take: 20 }); }
  catch (error) {
    console.error('[Guest Wi-Fi policy query failed]', error);
    throw new NetworkManagementError('Guest Wi-Fi policies are temporarily unavailable.', 503);
  }
}

async function listUsage(simulatedOnly, facilityId) {
  if (!persistentMode(simulatedOnly)) return facilityId === 'FACILITY-TALANTA-STADIUM' ? simulatedWifiUsage : [];
  try { return await prisma.wifiUsageAggregate.findMany({ where: { facilityId }, orderBy: { windowStart: 'desc' }, take: 24 }); }
  catch (error) {
    console.error('[Wi-Fi aggregate query failed]', error);
    throw new NetworkManagementError('Guest Wi-Fi aggregates are temporarily unavailable.', 503);
  }
}

export async function getNetworkDashboard({ zone = 'ALL', simulatedOnly = false, facilityId = 'FACILITY-TALANTA-STADIUM' } = {}) {
  const persistent = persistentMode(simulatedOnly);
  const [devices, segments, controllers, policies, usage] = await Promise.all([
    listNetworkDevices({ zone, simulatedOnly, facilityId }),
    ensureSegments(simulatedOnly, facilityId),
    listControllers(simulatedOnly, facilityId),
    listPolicies(simulatedOnly, facilityId),
    listUsage(simulatedOnly, facilityId),
  ]);
  const alerts = persistent
    ? []
    : simulatedNetworkAlerts.filter((alert) => {
      if (zone === 'ALL') return true;
      const device = simulatedNetworkDevices.find((item) => item.deviceId === alert.deviceId);
      return device?.zone === zone;
    });
  const liveDevices = devices.filter((device) => !device.isSimulated);
  return {
    devices,
    segments,
    controllers,
    policies,
    usage,
    alerts,
    zones: NETWORK_ZONES,
    categories: NETWORK_DEVICE_TYPES,
    protocols: NETWORK_MONITORING_PROTOCOLS,
    adapter: { mode: persistent ? 'UNVERIFIED' : 'SIMULATED_DEVELOPMENT', liveControllerConnected: false },
    metrics: {
      inventory: devices.length,
      liveOnline: liveDevices.filter((device) => device.operationalStatus === 'ONLINE').length,
      liveOffline: liveDevices.filter((device) => device.operationalStatus === 'OFFLINE').length,
      liveUnknown: liveDevices.filter((device) => !['ONLINE', 'OFFLINE'].includes(device.operationalStatus)).length,
      simulatedDevices: devices.filter((device) => device.isSimulated).length,
      connectedDevices: usage[0]?.connectedDevices ?? null,
    },
  };
}

export async function createControllerConfiguration(input, user, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new NetworkManagementError('Controller configuration is required.');
  const providerName = text(input.providerName, 'Provider name', 120);
  const protocol = text(input.protocol, 'Controller protocol', 40).toUpperCase();
  if (!['CONTROLLER_API', 'SNMPV3'].includes(protocol)) throw new NetworkManagementError('Select a supported controller protocol.');
  const rawUrl = text(input.endpointUrl, 'HTTPS endpoint', 500);
  let endpoint;
  try { endpoint = new URL(rawUrl); } catch { throw new NetworkManagementError('Endpoint must be a valid HTTPS URL.'); }
  if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password) throw new NetworkManagementError('Controller endpoint must use HTTPS and must not contain embedded credentials.');
  const secretReference = optionalText(input.secretReference, 'Secret-manager reference');
  if (secretReference && !/^(vault:\/\/|secret:\/\/|arn:aws:secretsmanager:|projects\/[^/]+\/secrets\/[^/]+\/versions\/)/i.test(secretReference)) {
    throw new NetworkManagementError('Use a secret-manager reference only; never submit a password or API token.');
  }
  const persistent = persistentMode(simulatedOnly);
  const data = {
    providerName, protocol, endpointUrl: endpoint.toString(), secretReference,
    connectionStatus: 'UNVERIFIED', isSimulated: !persistent,
    createdById: user.id, createdByEmail: user.email || null,
    facilityId: input.facilityId || 'FACILITY-TALANTA-STADIUM',
  };
  if (persistent) {
    try { return await prisma.wirelessControllerIntegration.create({ data }); }
    catch (error) {
      console.error('[Wireless controller config save failed]', error);
      throw new NetworkManagementError('Controller configuration could not be saved.', 503);
    }
  }
  const integration = { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
  simulatedControllerIntegrations.unshift(integration);
  return integration;
}

export async function createGuestWifiPolicy(input, user, { simulatedOnly = false } = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new NetworkManagementError('Guest Wi-Fi policy is required.');
  const ssid = text(input.ssid, 'Guest SSID', 32);
  if (/[\r\n]/.test(ssid)) throw new NetworkManagementError('Guest SSID cannot contain line breaks.');
  const optionalInteger = (value, field, min, max) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number < min || number > max) throw new NetworkManagementError(`${field} must be between ${min} and ${max}.`);
    return number;
  };
  const data = {
    ssid,
    captivePortalProvider: optionalText(input.captivePortalProvider, 'Captive portal provider', 120),
    bandwidthMbps: optionalInteger(input.bandwidthMbps, 'Bandwidth (Mbps)', 1, 1000),
    sessionMinutes: optionalInteger(input.sessionMinutes, 'Session duration (minutes)', 5, 1440),
    idleTimeoutMinutes: optionalInteger(input.idleTimeoutMinutes, 'Idle timeout (minutes)', 1, 240),
    maxDevicesPerSession: optionalInteger(input.maxDevicesPerSession, 'Maximum devices per session', 1, 10),
    status: 'PENDING_APPROVAL',
    createdById: user.id,
    createdByEmail: user.email || null,
    isSimulated: !persistentMode(simulatedOnly),
    facilityId: input.facilityId || 'FACILITY-TALANTA-STADIUM',
  };
  if (data.idleTimeoutMinutes >= data.sessionMinutes) throw new NetworkManagementError('Idle timeout must be shorter than the session duration.');
  if (process.env.NODE_ENV === 'production' && !data.captivePortalProvider && !user.isDemo) {
    throw new NetworkManagementError('Select a compatible captive portal provider or omit it only for a provider that does not require captive authentication.');
  }
  const persistent = persistentMode(simulatedOnly);
  if (persistent) {
    try { return await prisma.guestWifiPolicy.create({ data }); }
    catch (error) {
      console.error('[Guest Wi-Fi policy save failed]', error);
      throw new NetworkManagementError('Guest Wi-Fi policy draft could not be saved.', 503);
    }
  }
  const policy = { id: crypto.randomUUID(), ...data, createdAt: new Date().toISOString() };
  simulatedGuestPolicies.unshift(policy);
  return policy;
}

export async function recordNetworkAccess({ user, action, entityId, req }) {
  const entry = {
    id: crypto.randomUUID(), userId: user.id, userEmail: user.email || 'unknown',
    action, entityId: entityId || null,
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null,
    userAgent: req.headers.get('user-agent') || null, createdAt: new Date(),
  };
  if (!persistentMode(Boolean(user.isDemo))) {
    networkAccessAudit.unshift({ ...entry, createdAt: entry.createdAt.toISOString() });
  } else {
    try { await prisma.networkAccessLog.create({ data: entry }); }
    catch (error) {
      console.error('[Network access audit persistence failed]', error);
      throw new NetworkManagementError('Network access could not be audited; request blocked.', 503);
    }
  }
  await logAuditEvent({
    userId: entry.userId, userEmail: entry.userEmail, action: entry.action,
    entityType: 'NETWORK_MANAGEMENT', entityId: entry.entityId,
    ipAddress: entry.ipAddress, userAgent: entry.userAgent,
    details: 'Sensitive network inventory, monitoring, or Wi-Fi policy access.',
  });
  return entry;
}
