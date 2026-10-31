// Authentication & Role-Based Access Control (RBAC) Engine
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production' ? null : 'talanta-stadium-local-development-secret-only'
);
const SESSION_EXPIRY_MS = 8 * 60 * 60 * 1000;
const MFA_CHALLENGE_EXPIRY_MS = 5 * 60 * 1000;
const PASSWORD_HASH_ITERATIONS = 310000;

export function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 1 || password.length > 1024) throw new Error('Password must be a non-empty string within the supported length.');
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, PASSWORD_HASH_ITERATIONS, 64, 'sha512').toString('hex');
  return `pbkdf2$sha512$${PASSWORD_HASH_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || typeof storedHash !== 'string') return false;
  let salt;
  let expected;
  let iterations;
  if (storedHash.startsWith('pbkdf2$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 5 || parts[1] !== 'sha512' || !/^\d+$/.test(parts[2])) return false;
    iterations = Number(parts[2]);
    if (!Number.isSafeInteger(iterations) || iterations < 10000 || iterations > 1000000) return false;
    [, , , salt, expected] = parts;
  } else {
    const parts = storedHash.split(':');
    if (parts.length !== 2) return false;
    [salt, expected] = parts;
    iterations = 10000;
  }
  if (!/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(expected)) return false;
  const actual = crypto.pbkdf2Sync(password, salt, iterations, 64, 'sha512');
  const expectedBuffer = Buffer.from(expected, 'hex');
  return actual.length === expectedBuffer.length && crypto.timingSafeEqual(actual, expectedBuffer);
}

/**
 * Encode JWT Session Token
 */
function signToken(payload, lifetimeMs) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET must be configured before issuing production sessions.');
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Date.now();
  const fullPayload = { ...payload, exp: now + lifetimeMs, iat: now };
  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Payload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${b64Header}.${b64Payload}`).digest('base64url');
  return `${b64Header}.${b64Payload}.${signature}`;
}

export function encodeSessionToken(payload) {
  return signToken(payload, SESSION_EXPIRY_MS);
}

export function createMfaChallengeToken(payload, purpose = 'MFA_LOGIN') {
  if (!['MFA_LOGIN', 'MFA_ENROLL'].includes(purpose)) throw new Error('Unsupported MFA challenge purpose.');
  return signToken({ ...payload, purpose }, MFA_CHALLENGE_EXPIRY_MS);
}

export function verifyMfaChallengeToken(token, purpose) {
  const payload = verifySessionToken(token);
  return payload && payload.purpose === purpose && typeof payload.id === 'string' ? payload : null;
}

// Alias for auth routes
export const createSessionToken = encodeSessionToken;

/**
 * Decode & Verify JWT Session Token
 */
export function verifySessionToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [b64Header, b64Payload, signature] = parts;
    const header = JSON.parse(Buffer.from(b64Header, 'base64url').toString('utf8'));
    if (header?.alg !== 'HS256' || header?.typ !== 'JWT' || !JWT_SECRET) return null;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${b64Header}.${b64Payload}`)
      .digest('base64url');

    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(b64Payload, 'base64url').toString('utf8'));

    if (!payload || typeof payload !== 'object' || !Number.isFinite(payload.exp) || !Number.isFinite(payload.iat)) return null;
    if (Date.now() > payload.exp || payload.iat > Date.now() + 60_000 || payload.exp <= payload.iat) return null;

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Server-Side Role Authorization Middleware Helper
 */
const ROLE_CANONICAL = {
  PLATFORM_ADMINISTRATOR: 'SYSTEM_ADMIN',
  STADIUM_ADMINISTRATOR: 'VENUE_MANAGER',
  OPERATIONS_MANAGER: 'VENUE_MANAGER',
  SECURITY_SUPERVISOR: 'GATE_OPERATOR',
  TICKETING_OFFICER: 'FINANCE_OFFICER',
  MAINTENANCE_TECHNICIAN: 'STEWARD',
  STAFF_MEMBER: 'STEWARD',
  CONTRACTOR: 'STEWARD',
};

export function canonicalRole(role) {
  return ROLE_CANONICAL[role] || role;
}

export function authorizeRole(req, allowedRoles = []) {
  const authHeader = req.headers.get('authorization') || '';
  let token = null;

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    const cookies = (req.headers.get('cookie') || '').split(';').map((part) => part.trim());
    const sessionCookie = cookies.find((part) => part.startsWith('talanta_session=') || part.startsWith('session='));
    if (sessionCookie) token = decodeURIComponent(sessionCookie.slice(sessionCookie.indexOf('=') + 1));
  }

  const session = verifySessionToken(token);

  if (!session) {
    return { authorized: false, reason: 'UNAUTHENTICATED', status: 401 };
  }

  const role = canonicalRole(session.role);
  const normalizedAllowedRoles = allowedRoles.map(canonicalRole);
  if (allowedRoles.length > 0 && !normalizedAllowedRoles.includes(role)) {
    return { authorized: false, reason: 'FORBIDDEN_INSUFFICIENT_ROLE', user: session };
  }

  return { authorized: true, user: { ...session, assignedRole: session.assignedRole || session.role, role } };
}
