const assert = require('assert');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { encryptBuffer, decryptBuffer, encryptionKey, decryptFileToFile } = require('./backup_crypto');
const { connectionDetails } = require('./restore_database');
const { databaseArgs, validateBackupDirectory, writeLocalHistory } = require('./backup_database');
const { encodeSessionToken } = require('../lib/auth');
const {
  authorizeDRRequest,
  DisasterRecoveryError,
  getDRDashboard,
  recordRecoveryTest,
  updateDRPolicy,
} = require('../lib/disasterRecovery');

let passed = 0;
let failed = 0;

function check(condition, title) {
  if (condition) {
    console.log(`  [PASS] ${title}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${title}`);
    failed++;
  }
}

function request(role) {
  if (!role) return new Request('http://localhost/api/disaster-recovery/dashboard');
  const token = encodeSessionToken({ id: `TEST-${role}`, role, isDemo: true });
  return new Request('http://localhost/api/disaster-recovery/dashboard', { headers: { cookie: `talanta_session=${token}` } });
}

async function main() {
  const key = crypto.randomBytes(32);
  const payload = Buffer.from('representative encrypted database archive fixture');
  const artifact = encryptBuffer(payload, key);
  check(decryptBuffer(artifact, key).equals(payload), 'Backup artifact encryption and authenticated decryption round-trip');
  const tempDirectory = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'talanta-dr-test-'));
  try {
    const artifactPath = path.join(tempDirectory, 'sample.tsdb');
    const decryptedPath = path.join(tempDirectory, 'sample.dump');
    const tamperedPath = path.join(tempDirectory, 'tampered.tsdb');
    await fs.promises.writeFile(artifactPath, artifact, { mode: 0o600 });
    await decryptFileToFile(artifactPath, decryptedPath, key);
    check((await fs.promises.readFile(decryptedPath)).equals(payload), 'Streaming file restore verifies GCM before accepting plaintext');
    const corruptedFile = Buffer.from(artifact);
    corruptedFile[corruptedFile.length - 1] ^= 0x01;
    await fs.promises.writeFile(tamperedPath, corruptedFile, { mode: 0o600 });
    let streamingTamperRejected = false;
    try { await decryptFileToFile(tamperedPath, path.join(tempDirectory, 'tampered.dump'), key); }
    catch { streamingTamperRejected = true; }
    check(streamingTamperRejected, 'Streaming restore rejects tampered authentication tags');
    await writeLocalHistory(tempDirectory, { backupRef: 'DRBACKUP-0123456789AB', status: 'RUNNING', startedAt: new Date().toISOString() });
    await writeLocalHistory(tempDirectory, { backupRef: 'DRBACKUP-0123456789AB', status: 'FAILED', startedAt: new Date().toISOString(), errorCode: 'BACKUP_EXECUTION_FAILED' });
    const history = JSON.parse(await fs.promises.readFile(path.join(tempDirectory, '.dr-history.json'), 'utf8'));
    check(history.length === 1 && history[0].status === 'FAILED', 'Local backup history updates failures without requiring database access');
  } finally { await fs.promises.rm(tempDirectory, { recursive: true, force: true }); }
  const tampered = Buffer.from(artifact);
  tampered[tampered.length - 1] ^= 0x01;
  let tamperRejected = false;
  try { decryptBuffer(tampered, key); } catch { tamperRejected = true; }
  check(tamperRejected, 'Authenticated encryption rejects tampered backup data');
  let malformedKeyRejected = false;
  try { encryptionKey(Buffer.from('short').toString('base64')); } catch { malformedKeyRejected = true; }
  check(malformedKeyRejected, 'Backup key must be exactly 32 bytes');

  const connection = connectionDetails('postgresql://backup-user:private%3Apass@db.example.test:5432/stadium?sslmode=require');
  const pgArgs = databaseArgs('postgresql://backup-user:private%3Apass@db.example.test:5432/stadium?schema=public&sslmode=require');
  check(!connection.safeUrl.includes('private') && connection.password === 'private:pass', 'Database credentials are removed from command-line connection URL');
  check(!pgArgs.connectionString.includes('schema=') && pgArgs.password === 'private:pass', 'Prisma-only schema parameter is stripped for PostgreSQL client tools');
  const originalBackupDir = process.env.BACKUP_DIR;
  process.env.BACKUP_DIR = process.cwd();
  let repositoryBackupPathRejected = false;
  try { validateBackupDirectory(); } catch { repositoryBackupPathRejected = true; }
  if (originalBackupDir === undefined) delete process.env.BACKUP_DIR;
  else process.env.BACKUP_DIR = originalBackupDir;
  check(repositoryBackupPathRejected, 'Backup destination inside source repository is rejected');
  const authRoute = authorizeDRRequest(request());
  const customerRoute = authorizeDRRequest(request('CUSTOMER'));
  const adminRoute = authorizeDRRequest(request('SYSTEM_ADMIN'));
  check(!authRoute.authorized && authRoute.status === 401, 'Dashboard API requires authentication');
  check(!customerRoute.authorized && customerRoute.status === 403, 'DR dashboard is restricted to system administrators');
  check(adminRoute.authorized, 'System administrator is authorized');

  const dashboard = await getDRDashboard({ simulatedOnly: true });
  check(!dashboard.operational && dashboard.health.backupScheduler === 'NOT_CONFIGURED', 'Development dashboard makes no operational HA/DR claims');
  check(dashboard.policy.approvalStatus === 'PENDING_STAKEHOLDER_APPROVAL', 'Default RPO/RTO are marked pending stakeholder approval');
  const actor = { id: 'TEST-SYSTEM_ADMIN', role: 'SYSTEM_ADMIN' };
  const policy = await updateDRPolicy({ rpoMinutes: 45, rtoMinutes: 180, backupScheduleCron: '15 3 * * 1-5' }, actor, { simulatedOnly: true });
  check(policy.rpoMinutes === 45 && policy.rtoMinutes === 180 && policy.backupScheduleCron === '15 3 * * 1-5' && policy.approvalStatus === 'PENDING_STAKEHOLDER_APPROVAL', 'Schedule and RPO/RTO proposals are configurable without self-approving targets');
  let invalidPolicyRejected = false;
  try { await updateDRPolicy({ rpoMinutes: 0, rtoMinutes: 180 }, actor, { simulatedOnly: true }); }
  catch (error) { invalidPolicyRejected = error instanceof DisasterRecoveryError; }
  check(invalidPolicyRejected, 'Invalid RPO/RTO targets are rejected');
  let invalidScheduleRejected = false;
  try { await updateDRPolicy({ rpoMinutes: 45, rtoMinutes: 180, backupScheduleCron: 'every day' }, actor, { simulatedOnly: true }); }
  catch (error) { invalidScheduleRejected = error instanceof DisasterRecoveryError; }
  check(invalidScheduleRejected, 'Malformed backup schedules are rejected');
  const result = await recordRecoveryTest({
    testType: 'BACKUP_INTEGRITY',
    status: 'PASSED',
    details: 'Test fixture: authenticated encryption verification completed in isolated test.',
    durationSeconds: 2,
  }, actor, { simulatedOnly: true });
  check(result.isSimulated && result.status === 'PASSED', 'Recovery test history records actor and development simulation status');
  let invalidTestRejected = false;
  try { await recordRecoveryTest({ testType: 'DATABASE_RESTORE', status: 'PASSED', details: 'unsupported' }, actor, { simulatedOnly: true }); }
  catch (error) { invalidTestRejected = error instanceof DisasterRecoveryError; }
  check(invalidTestRejected, 'Unsupported recovery test types cannot be recorded');
  let secretDetailsRejected = false;
  try {
    await recordRecoveryTest({
      testType: 'BACKUP_INTEGRITY',
      status: 'PASSED',
      details: 'password=do-not-store',
    }, actor, { simulatedOnly: true });
  } catch (error) { secretDetailsRejected = error instanceof DisasterRecoveryError; }
  check(secretDetailsRejected, 'Recovery exercise notes reject credential-like content');

  console.log(`Results: ${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
