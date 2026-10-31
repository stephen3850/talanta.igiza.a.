import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma.js';
import { authorizeRole } from './auth.js';

const demoBackups = [];
const demoTests = [];
let demoPolicy = { rpoMinutes: 60, rtoMinutes: 240, backupScheduleCron: '0 2 * * *', backupScheduleTimezone: 'UTC', approvalStatus: 'PENDING_STAKEHOLDER_APPROVAL' };

export class DisasterRecoveryError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'DisasterRecoveryError';
    this.status = status;
  }
}

export function authorizeDRRequest(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN']);
  if (!auth.authorized) {
    return {
      authorized: false,
      status: auth.status || 403,
      message: auth.reason === 'UNAUTHENTICATED'
        ? 'A valid system administrator session is required.'
        : 'Only system administrators can access disaster recovery operations.',
    };
  }
  if (auth.user.isDemo && process.env.NODE_ENV === 'production') {
    return { authorized: false, status: 403, message: 'Demo sessions cannot access production disaster recovery operations.' };
  }
  return { authorized: true, user: auth.user };
}

function isPersistent(simulatedOnly = false) {
  if (simulatedOnly) return false;
  if (!process.env.DATABASE_URL) {
    if (process.env.NODE_ENV === 'production') throw new DisasterRecoveryError('DR database is not configured.', 503);
    return false;
  }
  if (!prisma?.dRBackupRecord || !prisma?.dRRecoveryTest || !prisma?.dRPolicy) {
    throw new DisasterRecoveryError('Prisma client or database schema is outdated; generate and deploy the DR schema.', 503);
  }
  return true;
}

function reference(prefix) {
  return `${prefix}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

async function localBackupHistory() {
  if (!process.env.BACKUP_DIR) return [];
  const historyPath = path.join(path.resolve(process.env.BACKUP_DIR), '.dr-history.json');
  try {
    const data = JSON.parse(await fs.promises.readFile(historyPath, 'utf8'));
    return Array.isArray(data) ? data.slice(0, 100) : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    console.error('[Disaster recovery local history unavailable]', error.message);
    return [];
  }
}

export async function getDRDashboard({ simulatedOnly = false } = {}) {
  if (!isPersistent(simulatedOnly)) {
    return {
      mode: 'SIMULATED_DEVELOPMENT',
      operational: false,
      health: { application: 'AVAILABLE', database: 'UNVERIFIED', backupScheduler: 'NOT_CONFIGURED' },
      backups: [...demoBackups].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)),
      failedBackups: demoBackups.filter((backup) => backup.status === 'FAILED').length,
      lastSuccessfulBackup: demoBackups.find((backup) => backup.status === 'SUCCEEDED') || null,
      recoveryTests: [...demoTests].sort((a, b) => new Date(b.testedAt) - new Date(a.testedAt)),
      policy: { ...demoPolicy, isSimulated: true },
      dependencies: ['PostgreSQL', 'pg_dump and pg_restore', '32-byte backup encryption key', 'Private encrypted backup storage', 'Secret manager', 'Application configuration and DNS'],
      warnings: ['No verified backup schedule or recovery environment is connected.', 'A successful backup record does not prove a restore until an isolated restore test passes.'],
    };
  }
  let backups;
  let recoveryTests;
  let policy;
  let databaseMetadataAvailable = true;
  try {
    [backups, recoveryTests, policy] = await Promise.all([
      prisma.dRBackupRecord.findMany({ orderBy: { startedAt: 'desc' }, take: 100 }),
      prisma.dRRecoveryTest.findMany({ orderBy: { testedAt: 'desc' }, take: 50 }),
      prisma.dRPolicy.findUnique({ where: { policyKey: 'DEFAULT' } }),
    ]);
  } catch (error) {
    databaseMetadataAvailable = false;
    console.error('[Disaster recovery database metadata unavailable]', error.message);
    backups = [];
    recoveryTests = [];
    policy = null;
  }
  const localBackups = await localBackupHistory();
  const backupMap = new Map();
  for (const backup of [...backups, ...localBackups]) {
    const prior = backupMap.get(backup.backupRef);
    backupMap.set(backup.backupRef, { ...prior, ...backup });
  }
  backups = [...backupMap.values()].sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt)).slice(0, 100);
  const lastSuccessfulBackup = backups.find((backup) => backup.status === 'SUCCEEDED') || null;
  return {
    mode: databaseMetadataAvailable ? 'DATABASE_AND_LOCAL_METADATA' : 'LOCAL_BACKUP_HISTORY_DATABASE_UNAVAILABLE',
    operational: false,
    health: { application: 'AVAILABLE', database: databaseMetadataAvailable ? 'CONFIGURED_UNVERIFIED' : 'UNAVAILABLE', backupScheduler: 'EXTERNAL_SCHEDULER_REQUIRED' },
    backups: backups.map((backup) => ({
      ...backup,
      sizeBytes: backup.sizeBytes == null ? null : backup.sizeBytes.toString(),
      artifactName: backup.artifactName ? 'Encrypted backup artifact recorded' : null,
    })),
    failedBackups: backups.filter((backup) => backup.status === 'FAILED').length,
    lastSuccessfulBackup: lastSuccessfulBackup ? {
      backupRef: lastSuccessfulBackup.backupRef,
      status: lastSuccessfulBackup.status,
      encrypted: lastSuccessfulBackup.encrypted,
      startedAt: lastSuccessfulBackup.startedAt,
      completedAt: lastSuccessfulBackup.completedAt,
    } : null,
    recoveryTests,
    policy: policy
      ? { rpoMinutes: policy.rpoMinutes, rtoMinutes: policy.rtoMinutes, approvalStatus: policy.approvalStatus, updatedAt: policy.updatedAt, isSimulated: false }
      : { rpoMinutes: 60, rtoMinutes: 240, backupScheduleCron: '0 2 * * *', backupScheduleTimezone: 'UTC', approvalStatus: 'PENDING_STAKEHOLDER_APPROVAL', isSimulated: false },
    dependencies: ['PostgreSQL', 'pg_dump and pg_restore', '32-byte backup encryption key', 'Private encrypted backup storage', 'Secret manager', 'Application configuration and DNS'],
    warnings: [
      'Backup scheduling and storage monitoring are external deployment responsibilities.',
      'A successful backup record does not prove a restore until an isolated restore test passes.',
      ...(!databaseMetadataAvailable ? ['The database metadata store was unavailable; only separately stored local backup history is shown.'] : []),
    ],
  };
}

function validCronField(field, minimum, maximum) {
  if (!field) return false;
  return field.split(',').every((part) => {
    const [range, step, ...extra] = part.split('/');
    if (extra.length || (step !== undefined && (!/^\d+$/.test(step) || Number(step) < 1))) return false;
    if (range === '*') return true;
    const values = range.split('-');
    if (values.length > 2 || values.some((value) => !/^\d+$/.test(value))) return false;
    const numbers = values.map(Number);
    return numbers.every((value) => value >= minimum && value <= maximum)
      && (numbers.length === 1 || numbers[0] <= numbers[1]);
  });
}

export async function updateDRPolicy(input, actor, { simulatedOnly = false } = {}) {
  const rpoMinutes = Number(input?.rpoMinutes);
  const rtoMinutes = Number(input?.rtoMinutes);
  const backupScheduleCron = String(input?.backupScheduleCron || '').trim();
  if (!Number.isInteger(rpoMinutes) || rpoMinutes < 1 || rpoMinutes > 10080) {
    throw new DisasterRecoveryError('RPO must be an integer from 1 to 10080 minutes.');
  }
  if (!Number.isInteger(rtoMinutes) || rtoMinutes < 1 || rtoMinutes > 10080) {
    throw new DisasterRecoveryError('RTO must be an integer from 1 to 10080 minutes.');
  }
  const cronFields = backupScheduleCron.split(/\s+/);
  if (cronFields.length !== 5 || ![
    validCronField(cronFields[0], 0, 59),
    validCronField(cronFields[1], 0, 23),
    validCronField(cronFields[2], 1, 31),
    validCronField(cronFields[3], 1, 12),
    validCronField(cronFields[4], 0, 6),
  ].every(Boolean)) {
    throw new DisasterRecoveryError('Backup schedule must be a five-field UTC cron expression.');
  }
  const data = { rpoMinutes, rtoMinutes, backupScheduleCron, backupScheduleTimezone: 'UTC', approvalStatus: 'PENDING_STAKEHOLDER_APPROVAL', proposedById: actor.id };
  if (isPersistent(simulatedOnly)) {
    const policy = await prisma.dRPolicy.upsert({
      where: { policyKey: 'DEFAULT' },
      create: { policyKey: 'DEFAULT', ...data },
      update: data,
    });
    return { rpoMinutes: policy.rpoMinutes, rtoMinutes: policy.rtoMinutes, backupScheduleCron: policy.backupScheduleCron, backupScheduleTimezone: policy.backupScheduleTimezone, approvalStatus: policy.approvalStatus, isSimulated: false };
  }
  demoPolicy = { ...data, approvalStatus: 'PENDING_STAKEHOLDER_APPROVAL' };
  return { ...demoPolicy, isSimulated: true };
}

export async function recordRecoveryTest(input, actor, { simulatedOnly = false } = {}) {
  const testType = String(input?.testType || '').trim().toUpperCase();
  const status = String(input?.status || '').trim().toUpperCase();
  const details = String(input?.details || '').trim();
  const durationSeconds = input?.durationSeconds == null ? null : Number(input.durationSeconds);
  if (!['BACKUP_INTEGRITY', 'ISOLATED_RESTORE', 'APPLICATION_RECOVERY', 'FAILOVER_EXERCISE'].includes(testType)) {
    throw new DisasterRecoveryError('Select a supported recovery test type.');
  }
  if (!['PASSED', 'FAILED', 'BLOCKED'].includes(status)) throw new DisasterRecoveryError('Select PASSED, FAILED or BLOCKED.');
  if (!details || details.length > 1000) throw new DisasterRecoveryError('Test details are required and must be at most 1000 characters.');
  if (/(?:password|passwd|secret|api[_-]?key|access[_-]?token|bearer\s+[a-z0-9._-]+)\s*[:=]/i.test(details) || /\b(?:\d[ -]*?){13,19}\b/.test(details)) {
    throw new DisasterRecoveryError('Test details appear to contain credentials or payment-card data; remove sensitive data.');
  }
  const backupRef = input.backupRef == null || input.backupRef === '' ? null : String(input.backupRef).trim();
  if (backupRef && !/^DRBACKUP-[A-F0-9]{12}$/.test(backupRef)) {
    throw new DisasterRecoveryError('Backup reference must match a recorded DR backup reference.');
  }
  if (durationSeconds !== null && (!Number.isInteger(durationSeconds) || durationSeconds < 0 || durationSeconds > 604800)) {
    throw new DisasterRecoveryError('Test duration must be an integer between 0 and 604800 seconds.');
  }
  const test = {
    testRef: reference('DRTEST'),
    backupRef,
    testType,
    status,
    details,
    performedById: actor?.id || null,
    performedByRole: actor?.role || null,
    durationSeconds,
  };
  if (isPersistent(simulatedOnly)) return prisma.dRRecoveryTest.create({ data: test });
  const simulatedTest = { ...test, id: test.testRef, testedAt: new Date(), createdAt: new Date(), isSimulated: true };
  demoTests.unshift(simulatedTest);
  return simulatedTest;
}

export async function createBackupRecord({ backupRef, status, artifactName = null, artifactSha256 = null, encrypted = false, sizeBytes = null, startedAt, completedAt = null, errorCode = null }) {
  if (!process.env.DATABASE_URL || !prisma?.dRBackupRecord) {
    throw new DisasterRecoveryError('Persistent backup history requires the configured DR database schema.', 503);
  }
  return prisma.dRBackupRecord.create({
    data: { backupRef, status, artifactName, artifactSha256, encrypted, sizeBytes: sizeBytes == null ? null : BigInt(sizeBytes), startedAt, completedAt, errorCode },
  });
}

export async function updateBackupRecord(backupRef, data) {
  if (!process.env.DATABASE_URL || !prisma?.dRBackupRecord) {
    throw new DisasterRecoveryError('Persistent backup history requires the configured DR database schema.', 503);
  }
  const allowed = {};
  for (const key of ['status', 'artifactName', 'artifactSha256', 'encrypted', 'sizeBytes', 'completedAt', 'errorCode']) {
    if (data[key] !== undefined) allowed[key] = data[key];
  }
  if (allowed.sizeBytes != null) allowed.sizeBytes = BigInt(allowed.sizeBytes);
  return prisma.dRBackupRecord.update({ where: { backupRef }, data: allowed });
}

export function drErrorResponse(error) {
  const status = error instanceof DisasterRecoveryError ? error.status : 500;
  if (!(error instanceof DisasterRecoveryError)) console.error('[Disaster recovery API]', error);
  return Response.json({ success: false, message: error instanceof DisasterRecoveryError ? error.message : 'Disaster recovery request failed.' }, { status });
}
