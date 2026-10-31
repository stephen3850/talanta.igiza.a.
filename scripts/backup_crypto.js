const crypto = require('crypto');
const fs = require('fs');
const { pipeline } = require('stream/promises');

const MAGIC = Buffer.from('TALANTA-DB-BACKUP-v1\n');

function encryptionKey(encoded = process.env.BACKUP_ENCRYPTION_KEY_B64 || '') {
  const key = Buffer.from(encoded, 'base64');
  if (key.length !== 32) throw new Error('BACKUP_ENCRYPTION_KEY_B64 must decode to exactly 32 bytes.');
  return key;
}

function encryptBuffer(plaintext, key) {
  if (!Buffer.isBuffer(key) || key.length !== 32) throw new Error('AES-256-GCM requires a 32-byte key.');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  return Buffer.concat([MAGIC, iv, ciphertext, cipher.getAuthTag()]);
}

function decryptBuffer(artifact, key) {
  const minimumLength = MAGIC.length + 12 + 16;
  if (!Buffer.isBuffer(artifact) || artifact.length < minimumLength || !artifact.subarray(0, MAGIC.length).equals(MAGIC)) {
    throw new Error('Backup envelope header is invalid.');
  }
  const ivStart = MAGIC.length;
  const ciphertextStart = ivStart + 12;
  const tagStart = artifact.length - 16;
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, artifact.subarray(ivStart, ciphertextStart));
  decipher.setAuthTag(artifact.subarray(tagStart));
  return Buffer.concat([decipher.update(artifact.subarray(ciphertextStart, tagStart)), decipher.final()]);
}

async function decryptFileToFile(sourcePath, targetPath, key) {
  const handle = await fs.promises.open(sourcePath, 'r');
  const stat = await handle.stat();
  const header = Buffer.alloc(MAGIC.length + 12);
  try {
    if (stat.size < MAGIC.length + 12 + 16) throw new Error('Backup envelope is incomplete.');
    await handle.read(header, 0, header.length, 0);
    if (!header.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error('Backup envelope header is invalid.');
    const tag = Buffer.alloc(16);
    await handle.read(tag, 0, tag.length, stat.size - tag.length);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, header.subarray(MAGIC.length));
    decipher.setAuthTag(tag);
    await handle.close();
    await pipeline(
      fs.createReadStream(sourcePath, { start: header.length, end: stat.size - 17 }),
      decipher,
      fs.createWriteStream(targetPath, { flags: 'wx', mode: 0o600 }),
    );
    return { sizeBytes: stat.size };
  } finally {
    await handle.close().catch(() => {});
  }
}

module.exports = { MAGIC, encryptionKey, encryptBuffer, decryptBuffer, decryptFileToFile };
