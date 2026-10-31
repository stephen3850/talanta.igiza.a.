const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

process.env.NODE_ENV = 'development';

const { authorizeRole, canonicalRole, createMfaChallengeToken, encodeSessionToken, hashPassword, verifyMfaChallengeToken, verifyPassword, verifySessionToken } = require('../lib/auth');
const { generateTotpCode, IAM_ROLE_OPTIONS, privilegedMfaRequired, validateIdentityProvider, verifyTotpCode } = require('../lib/iam');
const root = path.join(__dirname, '..');
const source = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');

const password = 'Correct Horse Battery Staple 29!';
const modernHash = hashPassword(password);
assert.match(modernHash, /^pbkdf2\$sha512\$310000\$/);
assert.equal(verifyPassword(password, modernHash), true);
assert.equal(verifyPassword('wrong password', modernHash), false);
const legacySalt = '0123456789abcdef0123456789abcdef';
const legacyValue = crypto.pbkdf2Sync(password, legacySalt, 10000, 64, 'sha512').toString('hex');
assert.equal(verifyPassword(password, `${legacySalt}:${legacyValue}`), true);
assert.equal(verifyPassword(password, 'malformed'), false);
console.log('[PASS] Password hashing upgrades new passwords and verifies legacy PBKDF2 hashes safely');

for (const [role, baseRole] of [
  ['PLATFORM_ADMINISTRATOR', 'SYSTEM_ADMIN'],
  ['STADIUM_ADMINISTRATOR', 'VENUE_MANAGER'],
  ['OPERATIONS_MANAGER', 'VENUE_MANAGER'],
  ['SECURITY_SUPERVISOR', 'GATE_OPERATOR'],
  ['TICKETING_OFFICER', 'FINANCE_OFFICER'],
  ['MAINTENANCE_TECHNICIAN', 'STEWARD'],
  ['STAFF_MEMBER', 'STEWARD'],
  ['CONTRACTOR', 'STEWARD'],
]) assert.equal(canonicalRole(role), baseRole);
const elevatedToken = encodeSessionToken({ id: 'iam-test-admin', role: 'PLATFORM_ADMINISTRATOR' });
const elevatedRequest = new Request('http://localhost/api/test', { headers: { cookie: `talanta_session=${elevatedToken}` } });
assert.equal(authorizeRole(elevatedRequest, ['SYSTEM_ADMIN']).authorized, true);
assert.equal(authorizeRole(elevatedRequest, ['CUSTOMER']).authorized, false);
assert.equal(IAM_ROLE_OPTIONS.length >= 10, true);
console.log('[PASS] Role aliases inherit only their documented existing RBAC role');

const challenge = createMfaChallengeToken({ id: 'iam-user', email: 'iam@example.test', role: 'SYSTEM_ADMIN', assignedRole: 'PLATFORM_ADMINISTRATOR' }, 'MFA_LOGIN');
assert.equal(verifyMfaChallengeToken(challenge, 'MFA_LOGIN').id, 'iam-user');
assert.equal(verifyMfaChallengeToken(challenge, 'MFA_ENROLL'), null);
const expiredPayload = JSON.parse(Buffer.from(challenge.split('.')[1], 'base64url').toString('utf8'));
expiredPayload.exp = Date.now() - 1;
const header = challenge.split('.')[0];
const encodedPayload = Buffer.from(JSON.stringify(expiredPayload)).toString('base64url');
const signature = crypto.createHmac('sha256', 'talanta-stadium-local-development-secret-only').update(`${header}.${encodedPayload}`).digest('base64url');
assert.equal(verifySessionToken(`${header}.${encodedPayload}.${signature}`), null);
console.log('[PASS] MFA challenges are purpose-bound and signed sessions reject expiration');

const totpSecret = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';
const totpCode = generateTotpCode(totpSecret, 59000);
assert.equal(totpCode, '287082');
assert.equal(verifyTotpCode(totpSecret, totpCode, 59000), 1);
assert.equal(verifyTotpCode(totpSecret, '000000', 59000), null);
assert.equal(verifyTotpCode(totpSecret, '12345', 59000), null);
console.log('[PASS] TOTP implementation matches the RFC 6238 SHA-1 test vector and validates code format');

assert.equal(privilegedMfaRequired('PLATFORM_ADMINISTRATOR'), false);
process.env.IAM_ENFORCE_MFA_FOR_PRIVILEGED = 'true';
assert.equal(privilegedMfaRequired('PLATFORM_ADMINISTRATOR'), true);
assert.equal(privilegedMfaRequired('CUSTOMER'), false);
delete process.env.IAM_ENFORCE_MFA_FOR_PRIVILEGED;
console.log('[PASS] Privileged MFA enforcement is configurable and scoped to privileged roles');

const provider = validateIdentityProvider({
  providerKey: 'CORP_IDP',
  displayName: 'Corporate OIDC',
  protocol: 'OIDC',
  issuerUrl: 'https://identity.example.test/',
  clientId: 'talanta-client',
  secretReference: 'CORP_OIDC_CLIENT_SECRET',
});
assert.equal(provider.status, 'PENDING_CONFIGURATION');
assert.throws(() => validateIdentityProvider({ ...provider, protocol: 'SAML' }), /Only OpenID Connect and OAuth 2.0/);
assert.throws(() => validateIdentityProvider({ ...provider, issuerUrl: 'http://identity.example.test/' }), /must use HTTPS/);
console.log('[PASS] Provider settings accept HTTPS OIDC metadata without accepting SAML or storing client secrets');

const loginRoute = source('app/api/auth/login/route.js');
assert.ok(loginRoute.includes('mfaRequired') && loginRoute.includes('mfaSetupRequired') && loginRoute.includes('createManagedSession'));
const recoveryRoute = source('app/api/auth/password-reset/request/route.js');
assert.ok(recoveryRoute.includes('RESEND_API_KEY') && recoveryRoute.includes('developmentToken'));
assert.ok(!recoveryRoute.includes('console.log(token)'));
const iamLib = source('lib/iam.js');
assert.ok(iamLib.includes('tokenDigest(token)') && iamLib.includes('lastTotpCounter: { lt: BigInt(counter) }'));
assert.ok(iamLib.includes('secretCiphertext') && iamLib.includes('createCipheriv'));
const sessionRoute = source('app/api/auth/sessions/route.js');
assert.ok(sessionRoute.includes('authorizeManagedUser') && sessionRoute.includes('revokeUserSession'));
const userRoute = source('app/api/iam/users/[userId]/route.js');
assert.ok(userRoute.includes('last active system administrator') && userRoute.includes('IAM_USER_ROLE_UPDATED'));
console.log('[PASS] Reset, MFA replay protection, managed sessions and administrative controls are wired');

console.log('IAM tests passed.');
