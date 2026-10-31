import crypto from 'crypto';
import { prisma } from './prisma.js';
import { authorizeRole, canonicalRole, createMfaChallengeToken, encodeSessionToken, hashPassword, verifyMfaChallengeToken } from './auth.js';

const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;
const RESET_LIFETIME_MS = 30 * 60 * 1000;
const RECOVERY_CODE_COUNT = 10;

export class IamError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'IamError';
    this.status = status;
  }
}

function requireDatabase(...models) {
  if (!process.env.DATABASE_URL || models.some((model) => !prisma?.[model])) {
    throw new IamError('IAM database schema is unavailable; apply the migration and regenerate Prisma Client.', 503);
  }
}

function tokenDigest(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hashIp(req) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return ip ? crypto.createHash('sha256').update(ip).digest('hex') : null;
}

export async function createManagedSession(user, req, { isDemo = false } = {}) {
  const sessionId = crypto.randomUUID();
  const token = encodeSessionToken({ ...user, sessionId });
  if (!isDemo) {
    requireDatabase('iamSession');
    await prisma.iamSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash: tokenDigest(token),
        userAgent: (req.headers.get('user-agent') || '').slice(0, 500) || null,
        ipAddressHash: hashIp(req),
        expiresAt: new Date(Date.now() + SESSION_LIFETIME_MS),
      },
    });
  }
  return { token, sessionId };
}

function sessionTokenFromRequest(req) {
  const authorization = req.headers.get('authorization') || '';
  if (authorization.startsWith('Bearer ')) return authorization.slice(7).trim();
  const cookie = (req.headers.get('cookie') || '').split(';').map((part) => part.trim()).find((part) => part.startsWith('talanta_session='));
  if (!cookie) return null;
  try { return decodeURIComponent(cookie.slice('talanta_session='.length)); } catch { return null; }
}

export async function authorizeManagedUser(req, roles = []) {
  const auth = authorizeRole(req, roles);
  if (!auth.authorized) return auth;
  if (auth.user.isDemo && process.env.NODE_ENV === 'development') return auth;
  if (typeof auth.user.sessionId !== 'string') return { authorized: false, status: 401, reason: 'MANAGED_SESSION_REQUIRED' };
  try {
    requireDatabase('iamSession');
    const token = sessionTokenFromRequest(req);
    if (!token) return { authorized: false, status: 401, reason: 'UNAUTHENTICATED' };
    const session = await prisma.iamSession.findFirst({
      where: { id: auth.user.sessionId, userId: auth.user.id, tokenHash: tokenDigest(token), revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true },
    });
    if (!session) return { authorized: false, status: 401, reason: 'SESSION_REVOKED_OR_EXPIRED' };
    await prisma.iamSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } });
    return auth;
  } catch (error) {
    console.error('[IAM session validation failed]', error);
    return { authorized: false, status: 503, reason: 'SESSION_VALIDATION_UNAVAILABLE' };
  }
}

export async function listUserSessions(userId) {
  requireDatabase('iamSession');
  const sessions = await prisma.iamSession.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { lastSeenAt: 'desc' },
    select: { id: true, userAgent: true, createdAt: true, lastSeenAt: true, expiresAt: true },
  });
  return sessions;
}

export async function revokeUserSession(userId, sessionId) {
  requireDatabase('iamSession');
  const result = await prisma.iamSession.updateMany({
    where: { id: sessionId, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count === 1;
}

function encryptionKey() {
  const encoded = process.env.MFA_ENCRYPTION_KEY_B64;
  if (encoded) {
    const key = Buffer.from(encoded, 'base64');
    if (key.length !== 32) throw new IamError('MFA_ENCRYPTION_KEY_B64 must decode to exactly 32 bytes.', 503);
    return key;
  }
  if (process.env.NODE_ENV === 'production') throw new IamError('MFA_ENCRYPTION_KEY_B64 must be configured in production.', 503);
  return crypto.createHash('sha256').update('Talanta local development MFA key; never use in production').digest();
}

function encryptSecret(secret) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${ciphertext.toString('base64url')}`;
}

function decryptSecret(value) {
  const [encodedIv, encodedTag, encodedData] = value.split('.');
  if (!encodedIv || !encodedTag || !encodedData) throw new IamError('Stored MFA credential is invalid.', 503);
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(encodedIv, 'base64url'));
  decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encodedData, 'base64url')), decipher.final()]).toString('utf8');
}

function base32Encode(bytes) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let result = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      result += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) result += alphabet[(value << (5 - bits)) & 31];
  return result;
}

function base32Decode(text) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const character of text.replace(/=+$/g, '').toUpperCase()) {
    const digit = alphabet.indexOf(character);
    if (digit < 0) throw new IamError('Stored MFA secret is invalid.', 503);
    value = (value << 5) | digit;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function totpAt(secret, counter) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const digest = crypto.createHmac('sha1', base32Decode(secret)).update(counterBuffer).digest();
  const offset = digest[digest.length - 1] & 15;
  const binary = ((digest[offset] & 127) << 24) | ((digest[offset + 1] & 255) << 16) | ((digest[offset + 2] & 255) << 8) | (digest[offset + 3] & 255);
  return String(binary % 1000000).padStart(6, '0');
}

export function generateTotpCode(secret, now = Date.now()) {
  return totpAt(secret, Math.floor(now / 30000));
}

export function verifyTotpCode(secret, code, now = Date.now()) {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return null;
  const currentCounter = Math.floor(now / 30000);
  for (const counter of [currentCounter - 1, currentCounter, currentCounter + 1]) {
    const expected = Buffer.from(totpAt(secret, counter));
    const supplied = Buffer.from(code);
    if (crypto.timingSafeEqual(expected, supplied)) return counter;
  }
  return null;
}

export async function beginMfaEnrollment(userId, email) {
  requireDatabase('mfaCredential', 'mfaRecoveryCode');
  const existing = await prisma.mfaCredential.findUnique({ where: { userId }, select: { enabledAt: true } });
  if (existing?.enabledAt) throw new IamError('MFA is already enabled for this account.', 409);
  const secret = base32Encode(crypto.randomBytes(20));
  await prisma.mfaCredential.upsert({
    where: { userId },
    create: { userId, secretCiphertext: encryptSecret(secret) },
    update: { secretCiphertext: encryptSecret(secret), lastTotpCounter: 0n },
  });
  const label = encodeURIComponent(email);
  const issuer = encodeURIComponent('Talanta Stadium');
  return { secret, otpauthUri: `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30` };
}

export async function confirmMfaEnrollment(userId, code) {
  requireDatabase('mfaCredential', 'mfaRecoveryCode');
  const credential = await prisma.mfaCredential.findUnique({ where: { userId } });
  if (!credential || credential.enabledAt) throw new IamError('No pending MFA enrollment was found.', 409);
  const counter = verifyTotpCode(decryptSecret(credential.secretCiphertext), code);
  if (counter === null) throw new IamError('Authenticator code is invalid or expired.', 401);
  const recoveryCodes = Array.from({ length: RECOVERY_CODE_COUNT }, () => crypto.randomBytes(10).toString('hex').toUpperCase());
  await prisma.$transaction(async (tx) => {
    await tx.mfaRecoveryCode.deleteMany({ where: { credentialId: credential.id } });
    await tx.mfaCredential.update({
      where: { id: credential.id },
      data: { enabledAt: new Date(), lastTotpCounter: BigInt(counter) },
    });
    await tx.mfaRecoveryCode.createMany({
      data: recoveryCodes.map((codeValue) => ({
        credentialId: credential.id,
        codeHash: tokenDigest(codeValue),
      })),
    });
  });
  return recoveryCodes;
}

export async function verifyMfaForLogin(userId, code) {
  requireDatabase('mfaCredential', 'mfaRecoveryCode');
  const credential = await prisma.mfaCredential.findUnique({ where: { userId } });
  if (!credential?.enabledAt) throw new IamError('MFA is not enabled for this account.', 401);
  const counter = verifyTotpCode(decryptSecret(credential.secretCiphertext), code);
  if (counter !== null) {
    const update = await prisma.mfaCredential.updateMany({
      where: { id: credential.id, enabledAt: { not: null }, lastTotpCounter: { lt: BigInt(counter) } },
      data: { lastTotpCounter: BigInt(counter) },
    });
    if (update.count === 1) return { method: 'TOTP' };
  }
  const recoveryCode = typeof code === 'string' ? code.replace(/-/g, '').toUpperCase() : '';
  if (!/^[A-F0-9]{20}$/.test(recoveryCode)) throw new IamError('Authenticator or recovery code is invalid.', 401);
  const recoveryCodes = await prisma.mfaRecoveryCode.findMany({
    where: { credentialId: credential.id, consumedAt: null },
    select: { id: true, codeHash: true },
  });
  const candidateHash = tokenDigest(recoveryCode);
  const matching = recoveryCodes.find((entry) => {
    const actual = Buffer.from(entry.codeHash);
    const expected = Buffer.from(candidateHash);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  });
  if (!matching) throw new IamError('Authenticator or recovery code is invalid.', 401);
  const consumed = await prisma.mfaRecoveryCode.updateMany({
    where: { id: matching.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (consumed.count !== 1) throw new IamError('Recovery code has already been used.', 401);
  return { method: 'RECOVERY_CODE' };
}

export async function rotateMfaRecoveryCodes(userId, verificationCode) {
  const verification = await verifyMfaForLogin(userId, verificationCode);
  if (verification.method !== 'TOTP') throw new IamError('Use an authenticator code to regenerate recovery codes.', 401);
  const credential = await prisma.mfaCredential.findUnique({ where: { userId }, select: { id: true } });
  const recoveryCodes = Array.from({ length: RECOVERY_CODE_COUNT }, () => crypto.randomBytes(10).toString('hex').toUpperCase());
  await prisma.$transaction(async (tx) => {
    await tx.mfaRecoveryCode.deleteMany({ where: { credentialId: credential.id } });
    await tx.mfaRecoveryCode.createMany({ data: recoveryCodes.map((code) => ({ credentialId: credential.id, codeHash: tokenDigest(code) })) });
  });
  return recoveryCodes;
}

export async function disableMfa(userId) {
  requireDatabase('mfaCredential', 'iamSession');
  await prisma.$transaction(async (tx) => {
    await tx.mfaCredential.deleteMany({ where: { userId } });
    await tx.iamSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  });
}

export async function createPasswordReset(userId) {
  requireDatabase('passwordResetToken');
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = tokenDigest(token);
  const expiresAt = new Date(Date.now() + RESET_LIFETIME_MS);
  await prisma.$transaction(async (tx) => {
    await tx.passwordResetToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
    await tx.passwordResetToken.create({ data: { userId, tokenHash, expiresAt } });
  });
  return { token, expiresAt };
}

export async function cancelPasswordReset(token) {
  requireDatabase('passwordResetToken');
  await prisma.passwordResetToken.updateMany({
    where: { tokenHash: tokenDigest(String(token || '')), usedAt: null },
    data: { usedAt: new Date() },
  });
}

export async function resetPassword(token, password) {
  requireDatabase('passwordResetToken', 'iamSession');
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) {
    throw new IamError('Choose a password between 12 and 128 characters.', 400);
  }
  const now = new Date();
  const tokenHash = tokenDigest(String(token || ''));
  const passwordHash = hashPassword(password);
  return prisma.$transaction(async (tx) => {
    const reset = await tx.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: now } },
      select: { id: true, userId: true },
    });
    if (!reset) throw new IamError('Password reset link is invalid or expired.', 400);
    await tx.user.update({ where: { id: reset.userId }, data: { passwordHash } });
    await tx.passwordResetToken.update({ where: { id: reset.id }, data: { usedAt: now } });
    await tx.passwordResetToken.updateMany({ where: { userId: reset.userId, usedAt: null }, data: { usedAt: now } });
    await tx.iamSession.updateMany({ where: { userId: reset.userId, revokedAt: null }, data: { revokedAt: now } });
    return reset.userId;
  });
}

export const IAM_ROLE_OPTIONS = [
  { role: 'PLATFORM_ADMINISTRATOR', label: 'Platform administrator', baseRole: 'SYSTEM_ADMIN' },
  { role: 'STADIUM_ADMINISTRATOR', label: 'Stadium administrator', baseRole: 'VENUE_MANAGER' },
  { role: 'OPERATIONS_MANAGER', label: 'Operations manager', baseRole: 'VENUE_MANAGER' },
  { role: 'SECURITY_SUPERVISOR', label: 'Security supervisor', baseRole: 'GATE_OPERATOR' },
  { role: 'TICKETING_OFFICER', label: 'Ticketing officer', baseRole: 'FINANCE_OFFICER' },
  { role: 'FINANCE_OFFICER', label: 'Finance officer', baseRole: 'FINANCE_OFFICER' },
  { role: 'MAINTENANCE_TECHNICIAN', label: 'Maintenance technician', baseRole: 'STEWARD' },
  { role: 'STAFF_MEMBER', label: 'Staff member', baseRole: 'STEWARD' },
  { role: 'CONTRACTOR', label: 'Contractor', baseRole: 'STEWARD' },
  { role: 'SYSTEM_ADMIN', label: 'System administrator', baseRole: 'SYSTEM_ADMIN' },
  { role: 'VENUE_MANAGER', label: 'Venue manager', baseRole: 'VENUE_MANAGER' },
  { role: 'GATE_OPERATOR', label: 'Gate operator', baseRole: 'GATE_OPERATOR' },
  { role: 'STEWARD', label: 'Staff / steward', baseRole: 'STEWARD' },
  { role: 'CUSTOMER', label: 'Customer', baseRole: 'CUSTOMER' },
];

export function privilegedMfaRequired(role) {
  return process.env.IAM_ENFORCE_MFA_FOR_PRIVILEGED === 'true'
    && ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FINANCE_OFFICER'].includes(canonicalRole(role));
}

export function verifyChallengeForUser(token, purpose) {
  const challenge = verifyMfaChallengeToken(token, purpose);
  if (!challenge || !challenge.email || !challenge.role) throw new IamError('Authentication challenge is invalid or expired.', 401);
  return challenge;
}

export async function getIamDashboard() {
  requireDatabase('user', 'iamSession', 'mfaCredential', 'identityProvider', 'securityEvent');
  const now = new Date();
  const [users, sessions, activeSessionRows, providers, events, totalUsers, mfaEnabledCount] = await Promise.all([
    prisma.user.findMany({
      take: 200,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, fullName: true, role: true, isActive: true, createdAt: true,
        mfaCredential: { select: { enabledAt: true } },
        _count: { select: { iamSessions: { where: { revokedAt: null, expiresAt: { gt: now } } } } },
      },
    }),
    prisma.iamSession.count({ where: { revokedAt: null, expiresAt: { gt: now } } }),
    prisma.iamSession.findMany({
      where: { revokedAt: null, expiresAt: { gt: now } },
      take: 100,
      orderBy: { lastSeenAt: 'desc' },
      select: { id: true, userId: true, userAgent: true, createdAt: true, lastSeenAt: true, expiresAt: true, user: { select: { email: true, role: true } } },
    }),
    prisma.identityProvider.findMany({
      orderBy: { displayName: 'asc' },
      select: { id: true, providerKey: true, displayName: true, protocol: true, issuerUrl: true, clientId: true, scopes: true, status: true, updatedAt: true },
    }),
    prisma.securityEvent.findMany({
      where: { source: 'AUTHENTICATION' },
      take: 50,
      orderBy: { occurredAt: 'desc' },
      select: { eventRef: true, eventType: true, severity: true, summary: true, occurredAt: true, isSimulated: true },
    }),
    prisma.user.count(),
    prisma.mfaCredential.count({ where: { enabledAt: { not: null } } }),
  ]);
  return {
    totalUsers,
    mfaEnabledCount,
    users: users.map(({ mfaCredential, _count, ...user }) => ({
      ...user,
      mfaEnabled: Boolean(mfaCredential?.enabledAt),
      activeSessions: _count.iamSessions,
    })),
    activeSessions: sessions,
    sessions: activeSessionRows,
    roles: IAM_ROLE_OPTIONS,
    providers,
    events,
    mfaEnforcement: privilegedMfaRequired('SYSTEM_ADMIN'),
    integrations: { oidc: 'PENDING_PROVIDER_CONFIGURATION', oauth2: 'PENDING_PROVIDER_CONFIGURATION', saml: 'UNAVAILABLE_NO_APPROVED_LIBRARY' },
  };
}

export function validateIdentityProvider(input) {
  const providerKey = typeof input.providerKey === 'string' ? input.providerKey.trim().toUpperCase() : '';
  const displayName = typeof input.displayName === 'string' ? input.displayName.trim() : '';
  const protocol = typeof input.protocol === 'string' ? input.protocol.trim().toUpperCase() : '';
  const issuerUrl = typeof input.issuerUrl === 'string' ? input.issuerUrl.trim() : '';
  const clientId = typeof input.clientId === 'string' ? input.clientId.trim() : '';
  const secretReference = typeof input.secretReference === 'string' ? input.secretReference.trim() : '';
  const scopes = typeof input.scopes === 'string' ? input.scopes.trim() : 'openid profile email';
  if (!/^[A-Z][A-Z0-9_-]{2,39}$/.test(providerKey)) throw new IamError('Provider key must use 3-40 uppercase letters, digits, underscores or hyphens.');
  if (!displayName || displayName.length > 100) throw new IamError('Provider display name is required and limited to 100 characters.');
  if (!['OIDC', 'OAUTH2'].includes(protocol)) throw new IamError('Only OpenID Connect and OAuth 2.0 provider metadata are supported; SAML is unavailable.');
  let issuer;
  try { issuer = new URL(issuerUrl); } catch { throw new IamError('Identity provider issuer URL is invalid.'); }
  const localDevelopmentIssuer = process.env.NODE_ENV === 'development' && ['localhost', '127.0.0.1'].includes(issuer.hostname);
  if (issuer.protocol !== 'https:' && !localDevelopmentIssuer) throw new IamError('Identity provider issuer must use HTTPS.');
  if (!clientId || clientId.length > 256 || !/^[A-Z][A-Z0-9_]{2,100}$/.test(secretReference)) {
    throw new IamError('A client ID and environment-variable secret reference are required; do not submit client secrets.');
  }
  if (!scopes || scopes.length > 300 || !/^[a-zA-Z0-9._ -]+$/.test(scopes)) throw new IamError('Provider scopes contain unsupported values.');
  return { providerKey, displayName, protocol, issuerUrl: issuer.toString(), clientId, secretReference, scopes, status: 'PENDING_CONFIGURATION' };
}
