const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { once } = require('events');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const { MAGIC, encryptionKey } = require('./backup_crypto');

function databaseArgs(databaseUrl) {
  const parsed = new URL(databaseUrl);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) throw new Error('DATABASE_URL must use PostgreSQL.');
  const password = decodeURIComponent(parsed.password);
  parsed.password = '';
  parsed.searchParams.delete('schema');
  return { connectionString: parsed.toString(), password };
}

function validateBackupDirectory() {
  if (!process.env.BACKUP_DIR) throw new Error('BACKUP_DIR must point to a protected location outside the application repository.');
  const directory = path.resolve(process.env.BACKUP_DIR);
  const relative = path.relative(PROJECT_ROOT, directory);
  if (!path.isAbsolute(directory) || relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))) {
    throw new Error('BACKUP_DIR must be outside the application repository.');
  }
  return directory;
}

async function sha256File(filePath) {
  const hash = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(filePath)) hash.update(chunk);
  return hash.digest('hex');
}

async function writeLocalHistory(directory, record) {
  const historyPath = path.join(directory, '.dr-history.json');
  let history = [];
  try { history = JSON.parse(await fs.promises.readFile(historyPath, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw new Error('Local backup history is unreadable.'); }
  if (!Array.isArray(history)) throw new Error('Local backup history has an invalid format.');
  const existing = history.findIndex((entry) => entry.backupRef === record.backupRef);
  if (existing >= 0) history[existing] = { ...history[existing], ...record };
  else history.push(record);
  history.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  const tempPath = path.join(directory, `.dr-history-${process.pid}.tmp`);
  await fs.promises.writeFile(tempPath, JSON.stringify(history.slice(0, 1000)), { mode: 0o600 });
  await fs.promises.rename(tempPath, historyPath);
}

async function runBackup() {
  const startedAt = new Date();
  const backupRef = `DRBACKUP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  let backupDirectory;
  let lockPath;
  let partialPath;
  let lockAcquired = false;
  try {
    if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required; mock metadata is not a database backup.');
    const key = encryptionKey();
    backupDirectory = validateBackupDirectory();
    const retentionDays = Number(process.env.BACKUP_RETENTION_DAYS || 30);
    if (!Number.isInteger(retentionDays) || retentionDays < 1 || retentionDays > 3650) {
      throw new Error('BACKUP_RETENTION_DAYS must be between 1 and 3650.');
    }
    const { connectionString, password } = databaseArgs(process.env.DATABASE_URL);
    await fs.promises.mkdir(backupDirectory, { recursive: true, mode: 0o700 });
    await fs.promises.chmod(backupDirectory, 0o700);
    lockPath = path.join(backupDirectory, '.backup.lock');
    const lockHandle = await fs.promises.open(lockPath, 'wx', 0o600);
    lockAcquired = true;
    await lockHandle.writeFile(JSON.stringify({ pid: process.pid, startedAt: startedAt.toISOString() }));
    await lockHandle.close();
    const stamp = startedAt.toISOString().replace(/[:.]/g, '-');
    const artifactName = `${backupRef}-${stamp}.tsdb`;
    const finalPath = path.join(backupDirectory, artifactName);
    partialPath = `${finalPath}.partial`;
    const record = {
      backupRef, status: 'RUNNING', artifactName: null, artifactSha256: null, encrypted: true,
      sizeBytes: null, startedAt: startedAt.toISOString(), completedAt: null, errorCode: null,
    };
    await writeLocalHistory(backupDirectory, record);
    let updateBackupRecord;
    try {
      const { createBackupRecord, updateBackupRecord: updateRecord } = await import('../lib/disasterRecovery.js');
      updateBackupRecord = updateRecord;
      await createBackupRecord({ backupRef, status: 'RUNNING', encrypted: true, startedAt });
    } catch (error) {
      console.error('[Backup database history unavailable; using protected local history]', error.message);
    }

    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const output = fs.createWriteStream(partialPath, { flags: 'wx', mode: 0o600 });
    output.write(Buffer.concat([MAGIC, iv]));
    const child = spawn('pg_dump', ['--format=custom', '--no-password', `--dbname=${connectionString}`], {
      windowsHide: true,
      env: { ...process.env, PGPASSWORD: password },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stderr = '';
    child.stderr.on('data', (chunk) => { stderr = `${stderr}${chunk}`.slice(-4000); });
    const childExit = new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', (code) => code === 0 ? resolve() : reject(new Error(`pg_dump exited with status ${code}. ${stderr.trim()}`)));
    });
    try {
      await Promise.all([pipeline(child.stdout, cipher, output, { end: false }), childExit]);
      output.end(cipher.getAuthTag());
      await once(output, 'finish');
    } catch (error) {
      child.kill();
      output.destroy();
      throw error;
    }

    await fs.promises.rename(partialPath, finalPath);
    const stats = await fs.promises.stat(finalPath);
    const artifactSha256 = await sha256File(finalPath);
    const completedAt = new Date();
    const successRecord = {
      backupRef, status: 'SUCCEEDED', artifactName, artifactSha256, encrypted: true,
      sizeBytes: stats.size, startedAt: startedAt.toISOString(), completedAt: completedAt.toISOString(), errorCode: null,
    };
    await writeLocalHistory(backupDirectory, successRecord);
    if (updateBackupRecord) {
      try {
        await updateBackupRecord(backupRef, {
          status: 'SUCCEEDED',
      artifactName,
      artifactSha256,
      encrypted: true,
      sizeBytes: stats.size,
          completedAt,
      errorCode: null,
        });
      } catch (error) { console.error('[Backup database history update failed]', error.message); }
    }
    const expiry = Date.now() - retentionDays * 86400000;
    for (const name of await fs.promises.readdir(backupDirectory)) {
      if (!name.endsWith('.tsdb')) continue;
      const candidate = path.join(backupDirectory, name);
      const info = await fs.promises.lstat(candidate);
      if (info.isFile() && info.mtimeMs < expiry) await fs.promises.unlink(candidate);
    }
    console.log(JSON.stringify({ backupRef, status: 'SUCCEEDED', encrypted: true, sizeBytes: stats.size, artifactSha256 }));
  } catch (error) {
    if (backupDirectory) {
      try {
        await writeLocalHistory(backupDirectory, {
          backupRef, status: 'FAILED', encrypted: true, startedAt: startedAt.toISOString(),
          completedAt: new Date().toISOString(), errorCode: 'BACKUP_EXECUTION_FAILED',
        });
      } catch (recordError) { console.error('[Local backup history write failed]', recordError.message); }
      try {
        const { updateBackupRecord } = await import('../lib/disasterRecovery.js');
        await updateBackupRecord(backupRef, { status: 'FAILED', encrypted: true, completedAt: new Date(), errorCode: 'BACKUP_EXECUTION_FAILED' });
      } catch (recordError) { console.error('[Database backup history update failed]', recordError.message); }
    }
    console.error('[Database backup failed]', error.message);
    process.exitCode = 1;
  } finally {
    if (partialPath) await fs.promises.unlink(partialPath).catch(() => {});
    if (lockPath && lockAcquired) await fs.promises.unlink(lockPath).catch(() => {});
  }
}

if (require.main === module) runBackup();

module.exports = { MAGIC, encryptionKey, databaseArgs, validateBackupDirectory, sha256File, writeLocalHistory, runBackup };
