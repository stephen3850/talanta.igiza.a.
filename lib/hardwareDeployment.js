import crypto from 'crypto';
import { prisma } from './prisma.js';
import { authorizeRole } from './auth.js';

export const HARDWARE_CATEGORIES = [
  'CCTV_CAMERA', 'NETWORK_SWITCH', 'ROUTER', 'WIFI_ACCESS_POINT', 'IOT_SENSOR',
  'DIGITAL_SIGNAGE', 'ACCESS_CONTROLLER', 'TICKET_SCANNER', 'ENVIRONMENTAL_EQUIPMENT',
  'SERVER_STORAGE',
];
export const COMMISSIONING_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'PENDING_APPROVAL', 'APPROVED'];
const demoAssets = [];
const demoTasks = [];
const demoChecks = [];
const demoMaintenance = [];
const requiredChecklist = [
  { key: 'POWER_VERIFIED', label: 'Power verification' },
  { key: 'NETWORK_VERIFIED', label: 'Network connectivity' },
  { key: 'CONFIGURATION_VERIFIED', label: 'Device configuration' },
  { key: 'SECURITY_VERIFIED', label: 'Security configuration' },
  { key: 'FUNCTIONAL_TEST', label: 'Functional test' },
];
const categoryChecks = {
  CCTV_CAMERA: [{ key: 'VIDEO_STREAM_VERIFIED', label: 'Authorized video stream/status' }, { key: 'TIME_SYNC_VERIFIED', label: 'Time synchronization' }],
  NETWORK_SWITCH: [{ key: 'VLAN_SEGMENTATION_VERIFIED', label: 'Approved segmentation configuration' }, { key: 'REDUNDANCY_VERIFIED', label: 'Approved uplink redundancy' }],
  ROUTER: [{ key: 'ROUTING_POLICY_VERIFIED', label: 'Approved routing policy' }, { key: 'REDUNDANCY_VERIFIED', label: 'Approved failover path' }],
  WIFI_ACCESS_POINT: [{ key: 'RADIO_COVERAGE_VERIFIED', label: 'Approved wireless coverage test' }, { key: 'GUEST_ISOLATION_VERIFIED', label: 'Guest isolation policy' }],
  IOT_SENSOR: [{ key: 'TELEMETRY_VERIFIED', label: 'Expected telemetry reported' }, { key: 'CALIBRATION_VERIFIED', label: 'Calibration evidence reviewed' }],
  DIGITAL_SIGNAGE: [{ key: 'CONTENT_PLAYBACK_VERIFIED', label: 'Approved content playback' }, { key: 'EMERGENCY_OVERRIDE_VERIFIED', label: 'Emergency message priority behavior' }],
  ACCESS_CONTROLLER: [{ key: 'ACCESS_POLICY_VERIFIED', label: 'Approved access policy' }, { key: 'LIFE_SAFETY_REVIEWED', label: 'Independent life-safety review' }],
  TICKET_SCANNER: [{ key: 'OFFLINE_MODE_VERIFIED', label: 'Approved offline-mode test' }, { key: 'DUPLICATE_SCAN_VERIFIED', label: 'Duplicate scan handling' }],
  ENVIRONMENTAL_EQUIPMENT: [{ key: 'CALIBRATION_VERIFIED', label: 'Calibration evidence reviewed' }, { key: 'ALERT_PATH_VERIFIED', label: 'Approved alert path' }],
  SERVER_STORAGE: [{ key: 'BACKUP_RESTORE_VERIFIED', label: 'Approved backup/restore test' }, { key: 'ACCESS_REVIEWED', label: 'Privileged access review' }],
};
const defaultTemplates = Object.fromEntries(HARDWARE_CATEGORIES.map((category) => [
  category,
  [...requiredChecklist, ...(categoryChecks[category] || [])],
]));
const demoTemplates = {};

export class HardwareDeploymentError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'HardwareDeploymentError';
    this.status = status;
  }
}

export function authorizeHardwareRequest(req, management = false) {
  const allowed = management ? ['SYSTEM_ADMIN', 'VENUE_MANAGER'] : ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD'];
  const auth = authorizeRole(req, allowed);
  if (!auth.authorized) return {
    authorized: false,
    status: auth.status || 403,
    message: auth.reason === 'UNAUTHENTICATED' ? 'A valid staff session is required.' : 'Your role is not authorized for hardware operations.',
  };
  if (auth.user.isDemo && process.env.NODE_ENV === 'production') {
    return { authorized: false, status: 403, message: 'Demo sessions cannot manage production hardware records.' };
  }
  return { authorized: true, user: auth.user };
}

function persistent(simulatedOnly = false) {
  if (simulatedOnly) return false;
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') throw new HardwareDeploymentError('Hardware deployment database is not configured.', 503);
    return false;
  }
  if (!prisma?.hardwareAsset || !prisma?.hardwareInstallationTask || !prisma?.hardwareCommissioningCheck || !prisma?.hardwareMaintenanceRecord || !prisma?.hardwareCommissioningTemplate || !prisma?.hardwareAttachment) {
    throw new HardwareDeploymentError('Prisma client/schema is outdated; generate and deploy hardware commissioning models.', 503);
  }
  return true;
}

function ref(prefix) {
  return `${prefix}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

function text(value, field, max = 180, required = false) {
  if (value == null || value === '') {
    if (required) throw new HardwareDeploymentError(`${field} is required.`);
    return null;
  }
  if (typeof value !== 'string' || value.trim().length > max) throw new HardwareDeploymentError(`${field} must be at most ${max} characters.`);
  return value.trim() || null;
}

function date(value, field, required = false) {
  if (!value) {
    if (required) throw new HardwareDeploymentError(`${field} is required.`);
    return null;
  }
  const result = new Date(value);
  if (!Number.isFinite(result.getTime())) throw new HardwareDeploymentError(`${field} must be a valid date.`);
  return result;
}

const demoIoTDevices = [
  { deviceId: 'DEMO-IOT-ENV-01', name: 'Development environmental sensor', category: 'ENVIRONMENTAL', manufacturer: 'Development fixture', model: 'Simulated sensor', serialNumber: 'DEMO-ONLY', zoneLocation: 'UNASSIGNED', status: 'OFFLINE', installedAt: new Date(), isSimulated: true },
];

export async function assertHardwareFacilityOwnership({ assetId, taskRef, facilityId = 'FACILITY-TALANTA-STADIUM', simulatedOnly = false } = {}) {
  let belongs = false;
  if (persistent(simulatedOnly)) {
    if (assetId) {
      belongs = Boolean(await prisma.hardwareAsset.findFirst({ where: { assetId, facilityId }, select: { assetId: true } }));
    } else if (taskRef) {
      belongs = Boolean(await prisma.hardwareInstallationTask.findFirst({ where: { taskRef, asset: { facilityId } }, select: { taskRef: true } }));
    }
  } else if (assetId) {
    belongs = demoAssets.some((asset) => asset.assetId === assetId && (asset.facilityId || 'FACILITY-TALANTA-STADIUM') === facilityId);
  } else if (taskRef) {
    const task = demoTasks.find((item) => item.taskRef === taskRef);
    belongs = Boolean(task && demoAssets.some((asset) => asset.assetId === task.assetId && (asset.facilityId || 'FACILITY-TALANTA-STADIUM') === facilityId));
  }
  if (!belongs) throw new HardwareDeploymentError('Hardware record was not found in the authorized facility.', 404);
  return true;
}

export async function listHardwareAssets({ simulatedOnly = false, facilityId = 'FACILITY-TALANTA-STADIUM' } = {}) {
  if (persistent(simulatedOnly)) {
    const records = await prisma.hardwareAsset.findMany({ where: { facilityId }, orderBy: { createdAt: 'desc' }, take: 1000 });
    const iot = await prisma.ioTDevice.findMany({ where: { facilityId }, take: 500, select: { deviceId: true, name: true, category: true, manufacturer: true, model: true, serialNumber: true, zoneLocation: true, status: true, installedAt: true } });
    const existing = new Set(records.map((asset) => asset.iotDeviceId).filter(Boolean));
    return [
      ...records.map((asset) => ({ ...asset, installationDate: asset.installationDate?.toISOString() || null, warrantyExpiry: asset.warrantyExpiry?.toISOString() || null })),
      ...iot.filter((device) => !existing.has(device.deviceId)).map((device) => ({
        assetId: `IOT-${device.deviceId}`,
        name: device.name,
        category: device.category === 'ENVIRONMENTAL' ? 'ENVIRONMENTAL_EQUIPMENT' : 'IOT_SENSOR',
        manufacturer: device.manufacturer,
        model: device.model,
        serialNumber: device.serialNumber,
        installationLocation: device.zoneLocation,
        installationDate: null,
        maintenanceStatus: 'UNVERIFIED',
        commissioningStatus: 'NOT_STARTED',
        iotDeviceId: device.deviceId,
        status: device.status,
        isIoTLinked: true,
        isSimulated: false,
      })),
    ];
  }
  return demoAssets.filter((asset) => (asset.facilityId || 'FACILITY-TALANTA-STADIUM') === facilityId).map((asset) => ({ ...asset, isSimulated: true }));
}

export async function registerHardware(input, actor, { simulatedOnly = false } = {}) {
  const data = {
    assetId: text(input.assetId, 'Asset ID', 64, true),
    name: text(input.name, 'Equipment name', 180, true),
    category: text(input.category, 'Category', 40, true),
    manufacturer: text(input.manufacturer, 'Manufacturer'),
    model: text(input.model, 'Model'),
    serialNumber: text(input.serialNumber, 'Serial number'),
    installationLocation: text(input.installationLocation, 'Installation location'),
    supplier: text(input.supplier, 'Supplier'),
    warrantyStart: date(input.warrantyStart, 'Warranty start'),
    warrantyExpiry: date(input.warrantyExpiry, 'Warranty expiry'),
    installationDate: null,
    maintenanceStatus: 'NOT_ASSESSED',
    commissioningStatus: 'NOT_STARTED',
    iotDeviceId: text(input.iotDeviceId, 'IoT device ID', 100),
    createdById: actor.id,
    facilityId: input.facilityId || 'FACILITY-TALANTA-STADIUM',
  };
  if (!HARDWARE_CATEGORIES.includes(data.category)) throw new HardwareDeploymentError('Select a supported equipment category.');
  if (data.warrantyStart && data.warrantyExpiry && data.warrantyExpiry < data.warrantyStart) {
    throw new HardwareDeploymentError('Warranty expiry must be on or after the warranty start.');
  }
  if (persistent(simulatedOnly)) {
    if (data.iotDeviceId) {
      const device = await prisma.ioTDevice.findFirst({ where: { deviceId: data.iotDeviceId, facilityId: data.facilityId }, select: { deviceId: true } });
      if (!device) throw new HardwareDeploymentError('Linked IoT device was not found.');
    }
    return prisma.hardwareAsset.create({ data });
  }
  if (demoAssets.some((asset) => asset.assetId === data.assetId)) throw new HardwareDeploymentError('Asset ID already exists.');
  const asset = { ...data, id: data.assetId, supplier: data.supplier || null, isSimulated: true, createdAt: new Date(), updatedAt: new Date() };
  demoAssets.unshift(asset);
  return asset;
}

export async function getCommissioningTemplates({ simulatedOnly = false } = {}) {
  let saved = [];
  if (persistent(simulatedOnly)) {
    saved = await prisma.hardwareCommissioningTemplate.findMany();
  }
  const overrides = new Map(saved.map((template) => [template.category, JSON.parse(template.checklistJson)]));
  return HARDWARE_CATEGORIES.map((category) => ({
    category,
    checks: overrides.get(category) || demoTemplates[category] || defaultTemplates[category],
    configurable: true,
  }));
}

export async function updateCommissioningTemplate(input, actor, { simulatedOnly = false } = {}) {
  if (!['SYSTEM_ADMIN', 'VENUE_MANAGER'].includes(actor?.role)) throw new HardwareDeploymentError('Only an authorized manager can change commissioning templates.', 403);
  const category = text(input.category, 'Category', 40, true);
  if (!HARDWARE_CATEGORIES.includes(category)) throw new HardwareDeploymentError('Choose a supported hardware category.');
  if (!Array.isArray(input.checks) || input.checks.length < requiredChecklist.length || input.checks.length > 15) {
    throw new HardwareDeploymentError('A template must contain the five core checks and no more than 15 total checks.');
  }
  const checks = input.checks.map((check) => ({
    key: text(check.key, 'Check key', 40, true).toUpperCase(),
    label: text(check.label, 'Check label', 100, true),
  }));
  if (checks.some((check) => !/^[A-Z][A-Z0-9_]*$/.test(check.key)) || new Set(checks.map((check) => check.key)).size !== checks.length) {
    throw new HardwareDeploymentError('Check keys must be unique uppercase letters, digits and underscores.');
  }
  for (const required of requiredChecklist) {
    if (!checks.some((check) => check.key === required.key)) throw new HardwareDeploymentError(`Templates must retain mandatory check ${required.key}.`);
  }
  if (persistent(simulatedOnly)) {
    const saved = await prisma.hardwareCommissioningTemplate.upsert({
      where: { category },
      create: { category, checklistJson: JSON.stringify(checks), updatedById: actor.id },
      update: { checklistJson: JSON.stringify(checks), updatedById: actor.id },
    });
    return { category: saved.category, checks, isSimulated: false };
  }
  demoTemplates[category] = checks;
  return { category, checks, isSimulated: true };
}

export async function createInstallationTask(input, actor, { simulatedOnly = false } = {}) {
  const assetId = text(input.assetId, 'Asset ID', 64, true);
  const technicianId = text(input.technicianId, 'Technician ID', 100, true);
  const title = text(input.title, 'Task title', 160, true);
  const details = text(input.details, 'Task details', 1000);
  if (persistent(simulatedOnly)) {
    const technician = await prisma.user.findUnique({ where: { id: technicianId }, select: { id: true, role: true, isActive: true } });
    if (!technician || !technician.isActive || technician.role === 'CUSTOMER') throw new HardwareDeploymentError('Assigned technician must be an active staff account.', 400);
    const asset = await prisma.hardwareAsset.findUnique({ where: { assetId } });
    if (!asset) throw new HardwareDeploymentError('Hardware asset was not found.', 404);
    return prisma.hardwareInstallationTask.create({ data: { taskRef: ref('INSTALL'), assetId, technicianId, title, details, status: 'PENDING', createdById: actor.id } });
  }
  if (!demoAssets.some((asset) => asset.assetId === assetId)) throw new HardwareDeploymentError('Hardware asset was not found.', 404);
  const task = { id: ref('INSTALL'), taskRef: ref('INSTALL'), assetId, technicianId, title, details, status: 'PENDING', notes: [], createdById: actor.id, createdAt: new Date(), isSimulated: true };
  demoTasks.unshift(task);
  return task;
}

export async function recordInstallationUpdate(input, actor, { simulatedOnly = false } = {}) {
  const taskRef = text(input.taskRef, 'Task reference', 100, true);
  const status = text(input.status, 'Installation status', 30, true);
  if (!['PENDING', 'IN_PROGRESS', 'INSTALLED', 'BLOCKED', 'CANCELLED'].includes(status)) throw new HardwareDeploymentError('Unsupported installation task status.');
  const note = text(input.note, 'Installation note', 1000);
  if (status === 'INSTALLED' && !note) throw new HardwareDeploymentError('Record the inspection and installation completion note before marking installed.');
  const installedAt = status === 'INSTALLED' ? date(input.installationDate, 'Installation date') || new Date() : null;
  if (persistent(simulatedOnly)) {
    const transitions = { PENDING: ['IN_PROGRESS', 'BLOCKED', 'CANCELLED'], IN_PROGRESS: ['INSTALLED', 'BLOCKED', 'CANCELLED'], BLOCKED: ['IN_PROGRESS', 'CANCELLED'] };
    const task = await prisma.$transaction(async (tx) => {
      const current = await tx.hardwareInstallationTask.findUnique({ where: { taskRef } });
      if (!current) throw new HardwareDeploymentError('Installation task was not found.', 404);
      if (actor.id !== current.technicianId && !['SYSTEM_ADMIN', 'VENUE_MANAGER'].includes(actor.role)) throw new HardwareDeploymentError('Only the assigned technician or an authorized manager can update this installation task.', 403);
      if (!transitions[current.status]?.includes(status)) throw new HardwareDeploymentError(`Installation task cannot transition from ${current.status} to ${status}.`, 409);
      const updated = await tx.hardwareInstallationTask.update({ where: { taskRef }, data: { status, notes: note || undefined, inspectionResult: status === 'INSTALLED' ? note : undefined, updatedAt: new Date() } });
      if (status === 'INSTALLED') await tx.hardwareAsset.update({ where: { assetId: updated.assetId }, data: { installationDate: installedAt, commissioningStatus: 'IN_PROGRESS' } });
      return updated;
    });
    return task;
  }
  const task = demoTasks.find((item) => item.taskRef === taskRef);
  if (!task) throw new HardwareDeploymentError('Installation task was not found.', 404);
  if (actor.id !== task.technicianId && !['SYSTEM_ADMIN', 'VENUE_MANAGER'].includes(actor.role)) throw new HardwareDeploymentError('Only the assigned technician or an authorized manager can update this installation task.', 403);
  const transitions = { PENDING: ['IN_PROGRESS', 'BLOCKED', 'CANCELLED'], IN_PROGRESS: ['INSTALLED', 'BLOCKED', 'CANCELLED'], BLOCKED: ['IN_PROGRESS', 'CANCELLED'] };
  if (!transitions[task.status]?.includes(status)) throw new HardwareDeploymentError(`Installation task cannot transition from ${task.status} to ${status}.`, 409);
  task.status = status;
  if (note) task.notes.push({ note, actorId: actor.id, createdAt: new Date() });
  if (status === 'INSTALLED') task.inspectionResult = note;
  task.updatedAt = new Date();
  if (status === 'INSTALLED') {
    const asset = demoAssets.find((item) => item.assetId === task.assetId);
    asset.installationDate = installedAt;
    asset.commissioningStatus = 'IN_PROGRESS';
  }
  return task;
}

export async function approveInstallationTask(taskRefInput, actor, { simulatedOnly = false } = {}) {
  const taskRef = text(taskRefInput, 'Task reference', 100, true);
  if (!['SYSTEM_ADMIN', 'VENUE_MANAGER'].includes(actor.role)) throw new HardwareDeploymentError('Only an authorized manager can approve installation inspection.', 403);
  if (persistent(simulatedOnly)) {
    const task = await prisma.hardwareInstallationTask.findUnique({ where: { taskRef } });
    if (!task) throw new HardwareDeploymentError('Installation task was not found.', 404);
    if (task.status !== 'INSTALLED' || !task.inspectionResult) throw new HardwareDeploymentError('Installation must be recorded with inspection notes before approval.', 409);
    if (task.technicianId === actor.id) throw new HardwareDeploymentError('The assigned technician cannot approve their own installation.', 403);
    return prisma.hardwareInstallationTask.update({ where: { taskRef }, data: { approvalById: actor.id, inspectionResult: `${task.inspectionResult}\nApproved by ${actor.id}` } });
  }
  const task = demoTasks.find((item) => item.taskRef === taskRef);
  if (!task) throw new HardwareDeploymentError('Installation task was not found.', 404);
  if (task.status !== 'INSTALLED' || !task.inspectionResult) throw new HardwareDeploymentError('Installation must be recorded with inspection notes before approval.', 409);
  if (task.technicianId === actor.id) throw new HardwareDeploymentError('The assigned technician cannot approve their own installation.', 403);
  task.approvalById = actor.id;
  task.inspectionResult = `${task.inspectionResult}\nApproved by ${actor.id}`;
  task.updatedAt = new Date();
  return task;
}

export async function runCommissioningChecklist(input, actor, { simulatedOnly = false } = {}) {
  const assetId = text(input.assetId, 'Asset ID', 64, true);
  const results = input.checks;
  if (!Array.isArray(results) || results.length < 5 || results.length > 20) throw new HardwareDeploymentError('Provide 5 to 20 commissioning check results.');
  const normalized = results.map((item) => {
    const key = text(item.key, 'Check key', 40, true);
    if (key === 'ACCEPTANCE_APPROVED') throw new HardwareDeploymentError('Acceptance approval is a separate manager action.');
    if (!/^[A-Z][A-Z0-9_]*$/.test(key)) throw new HardwareDeploymentError('Check keys must use uppercase letters, digits and underscores.');
    if (typeof item.passed !== 'boolean') throw new HardwareDeploymentError(`Check ${key} requires a boolean result.`);
    return { key, passed: item.passed, notes: text(item.notes, 'Check notes', 500) };
  });
  if (new Set(normalized.map((item) => item.key)).size !== normalized.length) throw new HardwareDeploymentError('Commissioning check keys must be unique within a checklist.');
  const templates = await getCommissioningTemplates({ simulatedOnly });
  let category;
  if (persistent(simulatedOnly)) {
    const asset = await prisma.hardwareAsset.findUnique({ where: { assetId }, select: { category: true, installationDate: true } });
    if (!asset) throw new HardwareDeploymentError('Hardware asset was not found.', 404);
    if (!asset.installationDate) throw new HardwareDeploymentError('Record the hardware installation before commissioning.', 409);
    category = asset.category;
  } else {
    const asset = demoAssets.find((item) => item.assetId === assetId);
    if (!asset) throw new HardwareDeploymentError('Hardware asset was not found.', 404);
    if (!asset.installationDate) throw new HardwareDeploymentError('Record the hardware installation before commissioning.', 409);
    category = asset.category;
  }
  const required = templates.find((template) => template.category === category)?.checks || defaultTemplates[category];
  for (const check of required) if (!normalized.some((item) => item.key === check.key)) throw new HardwareDeploymentError(`Missing required commissioning check: ${check.key}`);
  for (const check of normalized) if (!required.some((item) => item.key === check.key)) throw new HardwareDeploymentError(`Check ${check.key} is not part of the ${category} commissioning template.`);
  const failed = normalized.some((item) => !item.passed);
  const status = failed ? 'FAILED' : 'PASSED';
  const batchRef = ref('COMM');
  if (persistent(simulatedOnly)) {
    const asset = await prisma.hardwareAsset.findUnique({ where: { assetId } });
    if (!asset) throw new HardwareDeploymentError('Hardware asset was not found.', 404);
    const created = await prisma.$transaction(async (tx) => {
      const inserted = await tx.hardwareCommissioningCheck.createMany({
        data: normalized.map((item) => ({ assetId, batchRef, checkRef: ref('CHECK'), checkKey: item.key, passed: item.passed, notes: item.notes, performedById: actor.id, status })),
      });
      await tx.hardwareAsset.update({ where: { assetId }, data: { commissioningStatus: status } });
      return inserted;
    });
    return { assetId, status, checksRecorded: created.count, isSimulated: false };
  }
  const asset = demoAssets.find((item) => item.assetId === assetId);
  if (!asset) throw new HardwareDeploymentError('Hardware asset was not found.', 404);
  for (const item of normalized) demoChecks.unshift({ id: ref('CHECK'), batchRef, assetId, ...item, performedById: actor.id, status, testedAt: new Date(), isSimulated: true });
  asset.commissioningStatus = status;
  return { assetId, status, checksRecorded: normalized.length, isSimulated: true };
}

export async function approveCommissioning(assetIdInput, actor, { simulatedOnly = false } = {}) {
  if (!['SYSTEM_ADMIN', 'VENUE_MANAGER'].includes(actor?.role)) throw new HardwareDeploymentError('Only an authorized manager can approve commissioning.', 403);
  const assetId = text(assetIdInput, 'Asset ID', 64, true);
  if (persistent(simulatedOnly)) {
    const asset = await prisma.hardwareAsset.findUnique({ where: { assetId } });
    if (!asset) throw new HardwareDeploymentError('Hardware asset was not found.', 404);
    if (asset.commissioningStatus !== 'PASSED') throw new HardwareDeploymentError('Only a fully passed checklist can be acceptance-approved.');
    const latestCheck = await prisma.hardwareCommissioningCheck.findFirst({ where: { assetId, status: 'PASSED' }, orderBy: { testedAt: 'desc' }, select: { batchRef: true } });
    const latestChecks = latestCheck ? await prisma.hardwareCommissioningCheck.findMany({ where: { assetId, batchRef: latestCheck.batchRef, status: 'PASSED' } }) : [];
    if (latestChecks.length < 5 || latestChecks.some((check) => check.performedById === actor.id)) {
      throw new HardwareDeploymentError('Acceptance requires a separate authorized approver from the checklist technician.');
    }
    return prisma.$transaction(async (tx) => {
      await tx.hardwareCommissioningCheck.create({
        data: { assetId, batchRef: latestCheck.batchRef, checkRef: ref('CHECK'), checkKey: 'ACCEPTANCE_APPROVED', passed: true, notes: 'Human acceptance approval recorded.', performedById: actor.id, status: 'APPROVED' },
      });
      return tx.hardwareAsset.update({ where: { assetId }, data: { commissioningStatus: 'APPROVED' } });
    });
  }
  const asset = demoAssets.find((item) => item.assetId === assetId);
  if (!asset) throw new HardwareDeploymentError('Hardware asset was not found.', 404);
  if (asset.commissioningStatus !== 'PASSED') throw new HardwareDeploymentError('Only a fully passed checklist can be acceptance-approved.');
  const latestBatch = demoChecks.find((check) => check.assetId === assetId && check.status === 'PASSED')?.batchRef;
  const checks = demoChecks.filter((check) => check.assetId === assetId && check.batchRef === latestBatch && check.status === 'PASSED');
  if (checks.length < 5 || checks.some((check) => check.performedById === actor.id)) {
    throw new HardwareDeploymentError('Acceptance requires a separate authorized approver from the checklist technician.');
  }
  demoChecks.unshift({ id: ref('CHECK'), checkRef: ref('CHECK'), batchRef: latestBatch, assetId, checkKey: 'ACCEPTANCE_APPROVED', passed: true, notes: 'Human acceptance approval recorded.', performedById: actor.id, status: 'APPROVED', testedAt: new Date(), isSimulated: true });
  asset.commissioningStatus = 'APPROVED';
  return asset;
}

export async function recordHardwareMaintenance(input, actor, { simulatedOnly = false } = {}) {
  const assetId = text(input.assetId, 'Asset ID', 64, true);
  const record = {
    maintenanceRef: ref('MAINT'),
    assetId,
    recordType: text(input.recordType, 'Maintenance record type', 30, true),
    status: text(input.status || 'OPEN', 'Maintenance status', 30, true),
    scheduledAt: date(input.scheduledAt, 'Scheduled date'),
    details: text(input.details, 'Maintenance details', 1000, true),
    technicianId: text(input.technicianId, 'Technician ID'),
    replacementAssetId: text(input.replacementAssetId, 'Replacement asset ID', 64),
    createdById: actor.id,
  };
  if (!['INSPECTION', 'FAULT', 'REPAIR', 'REPLACEMENT'].includes(record.recordType)) throw new HardwareDeploymentError('Unsupported maintenance record type.');
  if (!['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(record.status)) throw new HardwareDeploymentError('Unsupported maintenance status.');
  if (persistent(simulatedOnly)) {
    const asset = await prisma.hardwareAsset.findUnique({ where: { assetId } });
    if (!asset) throw new HardwareDeploymentError('Hardware asset was not found.', 404);
    if (record.technicianId) {
      const technician = await prisma.user.findUnique({ where: { id: record.technicianId }, select: { id: true, role: true, isActive: true } });
      if (!technician || !technician.isActive || technician.role === 'CUSTOMER') throw new HardwareDeploymentError('Assigned technician must be an active staff account.');
    }
    if (record.recordType === 'REPLACEMENT' && !record.replacementAssetId) throw new HardwareDeploymentError('A replacement asset ID is required for replacement history.');
    if (record.replacementAssetId && !await prisma.hardwareAsset.findUnique({ where: { assetId: record.replacementAssetId }, select: { assetId: true } })) {
      throw new HardwareDeploymentError('Replacement asset was not found.', 404);
    }
    return prisma.$transaction(async (tx) => {
      const saved = await tx.hardwareMaintenanceRecord.create({ data: record });
      await tx.hardwareAsset.update({
        where: { assetId },
        data: { maintenanceStatus: record.recordType === 'REPLACEMENT' && record.status === 'COMPLETED' ? 'REPLACED' : record.status === 'COMPLETED' ? 'CURRENT' : 'REQUIRED' },
      });
      return saved;
    });
  }
  const asset = demoAssets.find((item) => item.assetId === assetId);
  if (!asset) throw new HardwareDeploymentError('Hardware asset was not found.', 404);
  if (record.recordType === 'REPLACEMENT' && !record.replacementAssetId) throw new HardwareDeploymentError('A replacement asset ID is required for replacement history.');
  if (record.replacementAssetId && !demoAssets.some((item) => item.assetId === record.replacementAssetId)) throw new HardwareDeploymentError('Replacement asset was not found.', 404);
  const saved = { ...record, id: record.maintenanceRef, createdAt: new Date(), isSimulated: true };
  demoMaintenance.unshift(saved);
  asset.maintenanceStatus = record.recordType === 'REPLACEMENT' && record.status === 'COMPLETED' ? 'REPLACED' : record.status === 'COMPLETED' ? 'CURRENT' : 'REQUIRED';
  return saved;
}

export async function getHardwareDashboard({ simulatedOnly = false, facilityId = 'FACILITY-TALANTA-STADIUM' } = {}) {
  const childAssetScope = { asset: { facilityId } };
  const [assets, tasks, checks, maintenance, templates, attachments] = await Promise.all([
    listHardwareAssets({ simulatedOnly, facilityId }),
    persistent(simulatedOnly) ? prisma.hardwareInstallationTask.findMany({ where: childAssetScope, orderBy: { createdAt: 'desc' }, take: 200 }) : demoTasks.filter((task) => (task.facilityId || 'FACILITY-TALANTA-STADIUM') === facilityId),
    persistent(simulatedOnly) ? prisma.hardwareCommissioningCheck.findMany({ where: childAssetScope, orderBy: { testedAt: 'desc' }, take: 500 }) : demoChecks.filter((check) => (check.facilityId || 'FACILITY-TALANTA-STADIUM') === facilityId),
    persistent(simulatedOnly) ? prisma.hardwareMaintenanceRecord.findMany({ where: childAssetScope, orderBy: { createdAt: 'desc' }, take: 200 }) : demoMaintenance.filter((record) => (record.facilityId || 'FACILITY-TALANTA-STADIUM') === facilityId),
    getCommissioningTemplates({ simulatedOnly }),
    persistent(simulatedOnly) ? prisma.hardwareAttachment.findMany({ where: childAssetScope, orderBy: { createdAt: 'desc' }, take: 200, select: { attachmentRef: true, assetId: true, taskRef: true, originalName: true, mimeType: true, sizeBytes: true, sha256: true, createdAt: true } }) : [],
  ]);
  return {
    mode: simulatedOnly || !process.env.DATABASE_URL ? 'SIMULATED_DEVELOPMENT' : 'DATABASE_BACKED_METADATA',
    operational: false,
    assets,
    installationTasks: tasks,
    commissioningChecks: checks,
    maintenanceRecords: maintenance,
    commissioningTemplates: templates,
    attachments,
    metrics: {
      totalAssets: assets.length,
      installed: assets.filter((asset) => !asset.isIoTLinked && asset.installationDate).length,
      pendingInstallation: assets.filter((asset) => !asset.isIoTLinked && !asset.installationDate).length,
      commissioned: assets.filter((asset) => ['APPROVED', 'PASSED'].includes(asset.commissioningStatus)).length,
      failedInspections: checks.filter((check) => check.status === 'FAILED' || check.passed === false).length,
      maintenanceRequired: assets.filter((asset) => ['REQUIRED', 'MAINTENANCE_REQUIRED', 'UNDER_REPAIR'].includes(asset.maintenanceStatus)).length,
    },
    warnings: ['No stadium installations or equipment quantities are asserted by this module.', 'IoT rows are linked for inventory visibility only; installation and commissioning remain separately verified.'],
    iotDevices: process.env.DATABASE_URL && !simulatedOnly ? await prisma.ioTDevice.findMany({ where: { facilityId }, take: 500, select: { deviceId: true, name: true, category: true, zoneLocation: true, status: true, lastSeenAt: true } }) : (facilityId === 'FACILITY-TALANTA-STADIUM' ? demoIoTDevices : []),
  };
}

export function hardwareErrorResponse(error) {
  const status = error instanceof HardwareDeploymentError ? error.status : 500;
  if (!(error instanceof HardwareDeploymentError)) console.error('[Hardware deployment API]', error);
  return Response.json({ success: false, message: error instanceof HardwareDeploymentError ? error.message : 'Hardware deployment request failed.' }, { status });
}
