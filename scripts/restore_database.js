const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { encryptionKey, decryptFileToFile } = require('./backup_crypto');

function connectionDetails(connectionString) {
  const parsed = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) throw new Error('Restore target must use PostgreSQL.');
  const password = decodeURIComponent(parsed.password);
  parsed.password = '';
  parsed.searchParams.delete('schema');
  return {
    safeUrl: parsed.toString(),
    password,
    host: parsed.hostname.toLowerCase(),
    port: parsed.port || '5432',
    database: decodeURIComponent(parsed.pathname.replace(/^\/+/, '')),
  };
}

function execute() {
  (async () => {
    const backupPath = path.resolve(process.argv[2] || '');
    if (!process.argv[2] || !fs.existsSync(backupPath) || !fs.statSync(backupPath).isFile()) {
      throw new Error('Provide the path to an encrypted .tsdb backup artifact.');
    }
    if (!backupPath.endsWith('.tsdb')) throw new Error('Only encrypted .tsdb artifacts are accepted.');
    const key = encryptionKey();
    const tempDirectory = await fs.promises.mkdtemp(path.join(process.env.DR_RESTORE_TMPDIR || os.tmpdir(), 'talanta-dr-'));
    await fs.promises.chmod(tempDirectory, 0o700);
    const plaintextPath = path.join(tempDirectory, 'restore.dump');
    try {
      await decryptFileToFile(backupPath, plaintextPath, key);
      if (process.env.DR_RESTORE_VERIFY_ONLY === '1') {
        const verification = spawnSync('pg_restore', ['--list', plaintextPath], { encoding: 'utf8', windowsHide: true });
        if (verification.error) throw verification.error;
        if (verification.status !== 0) throw new Error(`pg_restore archive verification failed: ${verification.stderr.slice(-2000)}`);
        console.log('Backup integrity and PostgreSQL archive catalog verified. No database was changed.');
        return;
      }

      if (process.env.DR_RESTORE_APPROVED !== 'YES' || !process.env.DR_RESTORE_CHANGE_ID?.trim()) {
        throw new Error('Database restore requires DR_RESTORE_APPROVED=YES and a documented DR_RESTORE_CHANGE_ID.');
      }
      if (!process.env.DR_RESTORE_TARGET_URL || !process.env.DATABASE_URL) {
        throw new Error('Set both DR_RESTORE_TARGET_URL and DATABASE_URL for source/target safeguards.');
      }
      const target = connectionDetails(process.env.DR_RESTORE_TARGET_URL);
      const source = connectionDetails(process.env.DATABASE_URL);
      if (target.host === source.host && target.port === source.port && target.database === source.database) {
        throw new Error('Refusing to restore over the configured source database.');
      }
      if (process.env.DR_RESTORE_TEST === '1' && !target.database.toLowerCase().startsWith('dr_restore_test_')) {
        throw new Error('DR_RESTORE_TEST requires a target database name beginning with dr_restore_test_.');
      }
      const restore = spawnSync('pg_restore', [
        '--exit-on-error', '--no-owner', '--no-acl', '--clean', '--if-exists',
        `--dbname=${target.safeUrl}`, plaintextPath,
      ], {
        encoding: 'utf8',
        windowsHide: true,
        env: { ...process.env, PGPASSWORD: target.password },
      });
      if (restore.error) throw restore.error;
      if (restore.status !== 0) throw new Error(`pg_restore failed with status ${restore.status}: ${restore.stderr.slice(-4000)}`);
      console.log(JSON.stringify({ status: 'RESTORE_COMMAND_SUCCEEDED', changeId: process.env.DR_RESTORE_CHANGE_ID, targetDatabase: target.database }));
    } finally {
      await fs.promises.rm(tempDirectory, { recursive: true, force: true });
    }
  })().catch((error) => {
    console.error('[Database restore stopped]', error.message);
    process.exitCode = 1;
  });
}

if (require.main === module) execute();

module.exports = { connectionDetails };
