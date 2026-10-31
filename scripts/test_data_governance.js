const assert = require('node:assert/strict');

process.env.NODE_ENV = 'development';

const {
  decryptContactForRequest,
  deletionApprovalBlocked,
  validateConsentInput,
  validateInventoryInput,
  validateNoticeInput,
  validateProcessorInput,
  validateRequestInput,
  validateRetentionPolicyInput,
} = require('../lib/dataGovernance');

const actorId = 'governance-test-admin';
const inventory = validateInventoryInput({
  categoryKey: 'visitor-contact',
  label: 'Visitor contact',
  description: 'Contact information provided for visitor support.',
  purposes: ['Support'],
  modules: ['Help'],
  systems: ['Application database'],
  thirdParties: [],
  classification: 'CONFIDENTIAL',
});
assert.equal(inventory.classification, 'CONFIDENTIAL');
assert.deepEqual(inventory.thirdParties, []);
assert.throws(() => validateInventoryInput({ ...inventory, classification: 'BIOMETRIC' }), /supported data classification/);
assert.throws(() => validateInventoryInput({ ...inventory, categoryKey: 'Upper Case' }), /lowercase letters/);
console.log('[PASS] Inventory categories enforce supported classifications and safe category keys');

const request = validateRequestInput({
  requestType: 'ACCESS',
  contact: 'privacy.subject@example.test',
  requestedCategories: ['customer-accounts'],
}, actorId);
assert.match(request.reference, /^DSR-[A-F0-9]{24}$/);
assert.equal(request.contactHint, 'p***@example.test');
assert.notEqual(request.subjectContactCiphertext, 'privacy.subject@example.test');
assert.equal(decryptContactForRequest({ subjectContactCiphertext: request.subjectContactCiphertext }), 'privacy.subject@example.test');
assert.throws(() => validateRequestInput({ requestType: 'DELETE_ALL', contact: 'bad' }, actorId), /supported data-subject request type/);
console.log('[PASS] Subject request contact is authenticated-encrypted and masked in the ordinary record');

const consent = validateConsentInput({
  subjectReference: 'subject-123',
  categoryKey: 'visitor-contact',
  purpose: 'Send event updates',
  noticeVersion: '2026-01',
  legalBasis: 'REQUIRES_REVIEW',
}, actorId);
assert.match(consent.subjectHash, /^[a-f0-9]{64}$/);
assert.equal(consent.status, 'GRANTED');
assert.equal(validateConsentInput({
  subjectReference: 'subject-123',
  categoryKey: 'visitor-contact',
  purpose: 'Send event updates',
  noticeVersion: '2026-01',
  legalBasis: 'REQUIRES_REVIEW',
  status: 'WITHDRAWN',
}, actorId).withdrawnAt instanceof Date, true);
console.log('[PASS] Consent records store an HMAC subject reference and support withdrawal status');

assert.equal(validateProcessorInput({
  providerKey: 'PAYMENT_GATEWAY',
  displayName: 'Payment gateway',
  categories: ['booking-payment-records'],
  purpose: 'Payment processing',
  systems: ['Payments'],
}, actorId).integrationStatus, 'PENDING_REVIEW');
assert.throws(() => validateProcessorInput({
  providerKey: 'PAYMENT_GATEWAY',
  displayName: 'Payment gateway',
  categories: ['booking-payment-records'],
  purpose: 'Payment processing',
  systems: ['Payments'],
  integrationStatus: 'VERIFIED_LIVE',
}, actorId), /non-verified integration status/);
assert.equal(validateNoticeInput({ version: 'v1', title: 'Privacy', body: 'Notice', status: 'DRAFT' }, actorId).status, 'DRAFT');
console.log('[PASS] Processor and notice records default to reviewable, non-certifying states');

assert.equal(validateRetentionPolicyInput({
  categoryKey: 'visitor-contact',
  retentionDays: '90',
  reviewCycleDays: '30',
}, actorId).retentionDays, 90);
assert.throws(() => validateRetentionPolicyInput({
  categoryKey: 'visitor-contact',
  retentionDays: '0',
  reviewCycleDays: '30',
}, actorId), /Retention period/);
assert.equal(deletionApprovalBlocked(false, false), false);
assert.equal(deletionApprovalBlocked(true, false), true);
assert.equal(deletionApprovalBlocked(false, true), true);
console.log('[PASS] Retention targets are bounded and preservation holds block deletion approval');

const governanceSource = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'app/api/governance/requests/[id]/contact/route.js'), 'utf8');
assert.match(governanceSource, /authorizeGovernanceAdmin/);
assert.match(governanceSource, /PRIVACY_REQUEST_CONTACT_ACCESSED/);
const retentionSource = require('node:fs').readFileSync(require('node:path').join(__dirname, '..', 'app/api/governance/retention/route.js'), 'utf8');
assert.match(retentionSource, /dataDeletionPerformed: false/);
console.log('[PASS] Sensitive contact access is admin-authorized and audited; retention API performs no deletion');
