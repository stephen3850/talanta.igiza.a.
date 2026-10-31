const {
  SecurityOperationsError,
  acknowledgeSecurityAlert,
  addInvestigationNote,
  authorizeSocRequest,
  createSecurityIncident,
  createSiemIntegration,
  getSecurityDashboard,
  getSocAuditTrail,
  hashSecurityReference,
  recordLoginSecurityEvent,
  recordSecurityEvent,
  updateSecurityIncident,
  updateSecurityPolicy,
  verifySocAuditChain,
} = require('../lib/securityOperations');
const { authorizeRole, encodeSessionToken, verifySessionToken } = require('../lib/auth');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

function request(role, isDemo = false) {
  const token = encodeSessionToken({ id: `TEST-${role}`, email: `${role.toLowerCase()}@test.local`, role, isDemo });
  return new Request('http://localhost/api/security-operations/dashboard', { headers: { cookie: `talanta_session=${token}` } });
}

async function expectError(operation, expectedStatus, description) {
  try {
    await operation();
    assert(false, description);
  } catch (error) {
    assert(error instanceof SecurityOperationsError && error.status === expectedStatus, description);
  }
}

async function run() {
  process.env.NODE_ENV = 'test';
  console.log('TALANTA STADIUM CYBERSECURITY OPERATIONS CENTRE TEST SUITE');

  const signedToken = encodeSessionToken({ id: 'TEST-USER', role: 'VENUE_MANAGER' });
  assert(verifySessionToken(signedToken)?.role === 'VENUE_MANAGER', 'Signed sessions with required expiry claims are verified');
  assert(verifySessionToken('not.a.token') === null, 'Malformed session tokens are rejected');
  assert(!authorizeRole(new Request('http://localhost')).authorized, 'Legacy role authorization no longer grants implicit administrator access');
  assert(!authorizeSocRequest(new Request('http://localhost'), 'view').authorized, 'SOC endpoints require a signed-in session');
  assert(!authorizeSocRequest(request('CUSTOMER'), 'view').authorized, 'Customer accounts cannot access SOC data');
  assert(authorizeSocRequest(request('STEWARD'), 'view').authorized, 'Authorized operations staff can view SOC dashboard');
  assert(!authorizeSocRequest(request('STEWARD'), 'manage').authorized, 'Incident and policy management is supervisor restricted');
  assert(authorizeSocRequest(request('VENUE_MANAGER'), 'manage').authorized, 'Authorized venue managers can manage SOC investigations');

  const admin = { id: 'SOC-ADMIN-TEST', email: 'soc-admin@test.local', role: 'SYSTEM_ADMIN' };
  const operator = { id: 'SOC-OP-TEST', email: 'soc-operator@test.local', role: 'STEWARD' };
  const testAccount = `soc-test-${Date.now()}@example.invalid`;
  for (let index = 0; index < 5; index++) {
    await recordLoginSecurityEvent({ email: testAccount, success: false }, { simulatedOnly: true });
  }
  const subjectHash = hashSecurityReference(testAccount);
  assert(subjectHash.length === 64 && !subjectHash.includes(testAccount), 'Authentication subjects are stored only as keyed hashes');
  const originalNodeEnv = process.env.NODE_ENV;
  const originalSocKey = process.env.SOC_EVENT_HASH_KEY;
  const originalJwtSecret = process.env.JWT_SECRET;
  process.env.NODE_ENV = 'production';
  delete process.env.SOC_EVENT_HASH_KEY;
  process.env.JWT_SECRET = 'configured-jwt-secret-must-not-be-a-fallback';
  let dedicatedSocKeyRequired = false;
  try { hashSecurityReference(testAccount); }
  catch (error) { dedicatedSocKeyRequired = error instanceof SecurityOperationsError && error.status === 503; }
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
  if (originalSocKey === undefined) delete process.env.SOC_EVENT_HASH_KEY;
  else process.env.SOC_EVENT_HASH_KEY = originalSocKey;
  if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalJwtSecret;
  assert(dedicatedSocKeyRequired, 'Production subject hashing requires a dedicated SOC key instead of JWT fallback');

  await recordLoginSecurityEvent({ email: 'soc-success@example.invalid', success: true }, { simulatedOnly: true });
  await recordSecurityEvent({
    source: 'ADMIN_ACTIVITY',
    eventType: 'ADMIN_SENSITIVE_ACTION',
    severity: 'MEDIUM',
    summary: 'A privileged administrator changed a sensitive role assignment.',
    metadata: { actorRole: 'SYSTEM_ADMIN', routeClass: 'ADMIN_SETTINGS', password: 'MUST_NOT_PERSIST' },
  }, { simulatedOnly: true });

  const policy = await updateSecurityPolicy({
    failedLoginThreshold: 3,
    failedLoginWindowMinutes: 10,
    apiErrorThreshold: 3,
    apiErrorWindowMinutes: 5,
  }, admin, { simulatedOnly: true });
  assert(policy.failedLoginThreshold === 3 && policy.apiErrorThreshold === 3, 'Alert thresholds are configurable within validated ranges');
  await expectError(() => updateSecurityPolicy({
    failedLoginThreshold: 1, failedLoginWindowMinutes: 10, apiErrorThreshold: 3, apiErrorWindowMinutes: 5,
  }, admin, { simulatedOnly: true }), 400, 'Out-of-range detection thresholds are rejected');

  for (let index = 0; index < 3; index++) {
    await recordSecurityEvent({
      source: 'API_INTEGRATIONS', eventType: 'API_ERROR', severity: 'HIGH',
      summary: 'An integration API returned an unexpected server error.',
      metadata: { statusCode: 500, routeClass: 'PAYMENT_CALLBACK', apiKey: 'MUST_NOT_PERSIST' },
    }, { simulatedOnly: true });
  }
  const dashboardBeforeCase = await getSecurityDashboard({ simulatedOnly: true });
  const failedLoginAlert = dashboardBeforeCase.alerts.find((alert) => alert.ruleKey === 'AUTH_FAILED_LOGIN_THRESHOLD');
  const apiErrorAlert = dashboardBeforeCase.alerts.find((alert) => alert.ruleKey === 'API_ERROR_BURST');
  const adminActivityAlert = dashboardBeforeCase.alerts.find((alert) => alert.ruleKey === 'SENSITIVE_ADMIN_ACTIVITY');
  assert(failedLoginAlert?.occurrenceCount >= 5, 'Repeated failed logins generate threshold-based alerts');
  assert(apiErrorAlert?.occurrenceCount >= 3, 'API error bursts generate configurable alerts');
  assert(Boolean(adminActivityAlert), 'Sensitive administrator activity raises a review alert');
  assert(dashboardBeforeCase.events.some((event) => event.source === 'IOT_DEVICES') && dashboardBeforeCase.events.some((event) => event.source === 'NETWORK_MONITORING'), 'Development dashboard aggregates IoT and network monitoring feeds');
  assert(dashboardBeforeCase.events.some((event) => event.source === 'TICKETING_PAYMENTS') && dashboardBeforeCase.events.some((event) => event.source === 'API_INTEGRATIONS'), 'Dashboard aggregates ticket/payment and API integration event summaries');
  assert(dashboardBeforeCase.events.every((event) => !JSON.stringify(event).includes('MUST_NOT_PERSIST') && !JSON.stringify(event).includes(testAccount)), 'Dashboard omits test credentials and raw account identifiers');
  assert(dashboardBeforeCase.adapter.activeResponseEnabled === false && dashboardBeforeCase.adapter.scanningEnabled === false && dashboardBeforeCase.adapter.automatedIsolationEnabled === false, 'SOC telemetry does not trigger active response, scanning or isolation');
  assert(dashboardBeforeCase.systems.length >= 8, 'Dashboard reports source health and coverage for all required security domains');

  const incident = await createSecurityIncident({
    alertId: failedLoginAlert.id,
    title: 'Investigate repeated account authentication failures',
    summary: 'Review sign-in audit signals with the account owner through the approved identity process.',
    severity: 'HIGH',
    assignedToId: 'SOC-DEMO-STEWARD',
  }, admin, { simulatedOnly: true });
  assert(incident.status === 'OPEN' && incident.assignedToRole === 'STEWARD', 'Investigation can be assigned to an authorized security operator');
  await expectError(() => createSecurityIncident({
    title: 'Invalid assignee', summary: 'Test assignment validation.', severity: 'LOW', assignedToId: 'NOT-A-SOC-USER',
  }, admin, { simulatedOnly: true }), 400, 'Unrecognized security personnel cannot be assigned');
  await expectError(() => createSecurityIncident({
    title: 'Sensitive detail', summary: 'password=clear-text-secret', severity: 'LOW',
  }, admin, { simulatedOnly: true }), 400, 'Incident narratives reject obvious credentials and payment-card data');

  const note = await addInvestigationNote(incident.id, 'Reviewed event window and escalated to the identity administrator.', operator, { simulatedOnly: true });
  assert(note.authorId === operator.id && note.authorRole === 'STEWARD', 'Investigation history records the responsible note author');
  await expectError(() => addInvestigationNote(incident.id, 'api_key=clear-text', operator, { simulatedOnly: true }), 400, 'Investigation notes reject credential-like content');
  const updated = await updateSecurityIncident(incident.id, {
    status: 'INVESTIGATING', assignedToId: 'SOC-DEMO-MANAGER',
  }, admin, { simulatedOnly: true });
  assert(updated.status === 'INVESTIGATING' && updated.assignedToRole === 'VENUE_MANAGER', 'Incident status and authorized assignee can be updated');
  await expectError(() => updateSecurityIncident(incident.id, { status: 'RESOLVED' }, admin, { simulatedOnly: true }), 400, 'Resolution requires a documented resolution summary');
  const resolved = await updateSecurityIncident(incident.id, {
    status: 'RESOLVED', resolution: 'Identity administrator confirmed the activity was investigated and closed.',
  }, admin, { simulatedOnly: true });
  assert(resolved.status === 'RESOLVED' && resolved.resolvedAt, 'Resolved investigation stores a timestamp and resolution');

  const acknowledged = await acknowledgeSecurityAlert(apiErrorAlert.id, admin, { simulatedOnly: true });
  assert(acknowledged.status === 'ACKNOWLEDGED' && acknowledged.acknowledgedByEmail === admin.email, 'Alert acknowledgement records the authorized operator');

  let insecureEndpointRejected = false;
  try {
    await createSiemIntegration({ providerName: 'Test SIEM', protocol: 'HTTPS_API', endpointUrl: 'http://siem.example.test' }, admin, { simulatedOnly: true });
  } catch (error) { insecureEndpointRejected = error instanceof SecurityOperationsError; }
  assert(insecureEndpointRejected, 'SIEM adapter rejects insecure cleartext endpoints');
  const siem = await createSiemIntegration({
    providerName: 'Development SIEM', protocol: 'HTTPS_API',
    endpointUrl: 'https://siem.example.test/ingest', secretReference: 'vault://stadium/soc/siem',
  }, admin, { simulatedOnly: true });
  assert(siem.connectionStatus === 'UNVERIFIED' && siem.isSimulated, 'SIEM registration never claims a connected destination');
  assert(!('apiKey' in siem) && !('password' in siem), 'SIEM credentials are not accepted or stored');

  const dashboard = await getSecurityDashboard({ simulatedOnly: true });
  const adminDashboard = await getSecurityDashboard({ simulatedOnly: true, includeSensitive: true });
  assert(dashboard.incidents.some((item) => item.incidentRef === incident.incidentRef && item.status === 'RESOLVED'), 'Dashboard reflects current investigation state');
  assert(dashboard.severityCounts.HIGH === 0, 'Resolved cases are excluded from open severity totals');
  assert(dashboard.siemIntegrations.length === 0, 'SIEM provider metadata is hidden from non-admin dashboard consumers');
  assert(adminDashboard.siemIntegrations.some((item) => item.providerName === 'Development SIEM' && item.connectionStatus === 'UNVERIFIED'), 'Administrator dashboard lists SIEM metadata without credentials');

  const auditTrail = await getSocAuditTrail({ simulatedOnly: true });
  assert(auditTrail.length > 0 && verifySocAuditChain(auditTrail), 'SOC administrative history is hash-linked and verifiable');
  const altered = auditTrail.map((entry) => ({ ...entry }));
  altered[0].action = 'ALTERED';
  assert(!verifySocAuditChain(altered), 'Hash-chain integrity verification detects tampering');

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
