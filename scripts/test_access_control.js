const {
  ACCESS_INTEGRATION_PROTOCOLS,
  ACCESS_POINT_TYPES,
  ACCESS_TARGET_TYPES,
  AccessControlError,
  authorizeAccessControlRequest,
  createAccessIntegration,
  createAccessPermission,
  createAccessPoint,
  getAccessAuditTrail,
  getAccessControlDashboard,
  hashAccessSubject,
  recordAccessDecision,
  revokeAccessPermission,
  validateAccessPermission,
  verifyAccessAuditChain,
} = require('../lib/accessControl');
const { encodeSessionToken } = require('../lib/auth');

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

function testRequest(role, isDemo = false) {
  const token = encodeSessionToken({ id: `TEST-${role}`, email: `${role.toLowerCase()}@test.local`, role, isDemo });
  return new Request('http://localhost/api/access-control/dashboard', { headers: { cookie: `talanta_session=${token}` } });
}

async function run() {
  process.env.NODE_ENV = 'test';
  console.log('TALANTA STADIUM PHYSICAL ACCESS CONTROL TEST SUITE');

  assert(ACCESS_POINT_TYPES.includes('RESTRICTED_DOOR') && ACCESS_POINT_TYPES.includes('GATE'), 'Inventory supports gate and restricted-door hardware');
  assert(ACCESS_TARGET_TYPES.join(',') === 'USER,ACCREDITATION,ROLE,GROUP', 'Permissions integrate with user roles and staff accreditation groups');
  assert(ACCESS_INTEGRATION_PROTOCOLS.includes('VENDOR_API_HTTPS'), 'Approved vendor HTTPS integration metadata is supported');

  const noSession = authorizeAccessControlRequest(new Request('http://localhost'), 'view');
  assert(!noSession.authorized && noSession.status === 401, 'Dashboard requires a valid signed-in staff session');
  assert(!authorizeAccessControlRequest(testRequest('CUSTOMER'), 'view').authorized, 'Customer role is blocked from access operations');
  assert(authorizeAccessControlRequest(testRequest('GATE_OPERATOR'), 'view').authorized, 'Gate operator can view authorized access events');
  assert(!authorizeAccessControlRequest(testRequest('VENUE_MANAGER'), 'manage').authorized, 'Permission and hardware metadata changes are system-admin restricted');
  assert(authorizeAccessControlRequest(testRequest('SYSTEM_ADMIN', true), 'manage').authorized, 'Development administrator can manage simulated records');

  const actor = { id: 'TEST-ADMIN', email: 'admin@test.local', role: 'SYSTEM_ADMIN' };
  const point = await createAccessPoint({
    pointId: 'TEST-STAFF-001', name: 'Test staff door', zone: 'BOWL',
    location: 'West bowl', hardwareType: 'STAFF_ENTRANCE', manufacturer: 'Fixture Vendor', model: 'DEV-1',
  }, actor, { simulatedOnly: true });
  assert(point.pointId === 'TEST-STAFF-001', 'Access point keeps a unique supplied identifier');
  assert(point.operationalStatus === 'UNKNOWN' && point.integrationStatus === 'UNVERIFIED' && point.isSimulated, 'New development hardware never appears connected');

  let duplicateRejected = false;
  try {
    await createAccessPoint({ pointId: point.pointId, name: 'Duplicate', zone: 'BOWL', location: 'West', hardwareType: 'GATE' }, actor, { simulatedOnly: true });
  } catch (error) { duplicateRejected = error.status === 409; }
  assert(duplicateRejected, 'Duplicate access-point identifiers are rejected');

  let invalidPointRejected = false;
  try { await createAccessPoint({ name: 'Bad', zone: 'UNKNOWN', location: 'Nowhere', hardwareType: 'LOCK' }, actor, { simulatedOnly: true }); }
  catch (error) { invalidPointRejected = error instanceof AccessControlError; }
  assert(invalidPointRejected, 'Unsupported zones and hardware are rejected');

  let invalidDatesRejected = false;
  try {
    validateAccessPermission({ pointId: point.pointId, targetType: 'ACCREDITATION', targetId: 'A-1', zone: 'BOWL', validFrom: '2030-01-01', expiresAt: '2029-01-01' });
  } catch (error) { invalidDatesRejected = error instanceof AccessControlError; }
  assert(invalidDatesRejected, 'Permission expiry must be after its valid-from date');

  const start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const permission = await createAccessPermission({
    pointId: point.pointId, targetType: 'ACCREDITATION', targetId: 'DEMO-ACCESS-STAFF-001',
    zone: 'BOWL', validFrom: start, expiresAt: expiry, reason: 'Automated test grant',
  }, actor, { simulatedOnly: true });
  const allowed = await recordAccessDecision({ pointId: point.pointId, subjectType: 'ACCREDITATION', subjectId: 'DEMO-ACCESS-STAFF-001' }, actor, { simulatedOnly: true });
  assert(allowed.outcome === 'AUTHORIZED' && allowed.permissionId === permission.id, 'Active accreditation permission records an authorization decision');
  assert(allowed.isSimulated && allowed.source === 'SIMULATED_DEVELOPMENT', 'Development decisions are clearly marked simulated');
  assert(!('subjectId' in allowed), 'Access events do not persist raw credential references');

  const rolePermission = await createAccessPermission({
    pointId: point.pointId, targetType: 'ROLE', targetId: 'STEWARD',
    zone: 'BOWL', validFrom: start, expiresAt: expiry,
  }, actor, { simulatedOnly: true });
  const roleAllowed = await recordAccessDecision({ pointId: point.pointId, subjectType: 'USER', subjectId: 'DEMO-USER-STEWARD-001' }, actor, { simulatedOnly: true });
  const inactiveDenied = await recordAccessDecision({ pointId: point.pointId, subjectType: 'USER', subjectId: 'DEMO-USER-INACTIVE-001' }, actor, { simulatedOnly: true });
  assert(roleAllowed.outcome === 'AUTHORIZED' && roleAllowed.permissionId === rolePermission.id, 'Role-based permission resolves the user role from the user directory');
  assert(inactiveDenied.outcome === 'DENIED', 'Inactive user accounts cannot use role-based permissions');

  const futurePoint = await createAccessPoint({
    pointId: 'TEST-FUTURE-001', name: 'Future access door', zone: 'BOWL',
    location: 'West bowl', hardwareType: 'RESTRICTED_DOOR',
  }, actor, { simulatedOnly: true });
  await createAccessPermission({
    pointId: futurePoint.pointId, targetType: 'ACCREDITATION', targetId: 'DEMO-ACCESS-STAFF-001',
    zone: 'BOWL', validFrom: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  }, actor, { simulatedOnly: true });
  const futureDenied = await recordAccessDecision({ pointId: futurePoint.pointId, subjectType: 'ACCREDITATION', subjectId: 'DEMO-ACCESS-STAFF-001' }, actor, { simulatedOnly: true });
  assert(futureDenied.outcome === 'DENIED', 'Permissions are not active before their start time');

  let emergencyGrantRejected = false;
  try {
    await createAccessPermission({
      pointId: 'SIM-EXIT-01', targetType: 'ACCREDITATION', targetId: 'DEMO-ACCESS-STAFF-001',
      zone: 'EXIT', validFrom: start, expiresAt: expiry,
    }, actor, { simulatedOnly: true });
  } catch (error) { emergencyGrantRejected = error instanceof AccessControlError; }
  const lifeSafetyDenied = await recordAccessDecision({ pointId: 'SIM-EXIT-01', subjectType: 'ACCREDITATION', subjectId: 'DEMO-ACCESS-STAFF-001' }, actor, { simulatedOnly: true });
  assert(emergencyGrantRejected && lifeSafetyDenied.outcome === 'DENIED' && lifeSafetyDenied.reasonCode === 'LIFE_SAFETY_POINT_NO_ACCESS_CONTROL', 'Life-safety exits cannot receive permissions or be controlled');

  const denied1 = await recordAccessDecision({ pointId: point.pointId, subjectType: 'ACCREDITATION', subjectId: 'UNKNOWN-STAFF-000' }, actor, { simulatedOnly: true });
  const denied2 = await recordAccessDecision({ pointId: point.pointId, subjectType: 'ACCREDITATION', subjectId: 'UNKNOWN-STAFF-000' }, actor, { simulatedOnly: true });
  const denied3 = await recordAccessDecision({ pointId: point.pointId, subjectType: 'ACCREDITATION', subjectId: 'UNKNOWN-STAFF-000' }, actor, { simulatedOnly: true });
  assert(denied1.outcome === 'DENIED' && denied3.outcome === 'DENIED', 'Credentials without active permissions are denied and recorded');
  assert(hashAccessSubject('ACCREDITATION:UNKNOWN-STAFF-000') === denied1.subjectHash, 'Credential references are represented by stable keyed hashes');

  const dashboard = await getAccessControlDashboard({ zone: 'BOWL', simulatedOnly: true });
  assert(dashboard.adapter.hardwareConnected === false && dashboard.adapter.commandsEnabled === false, 'Dashboard confirms no hardware connection or actuation capability');
  assert(dashboard.points.some((item) => item.pointId === point.pointId), 'Zone filter includes registered access point');
  assert(dashboard.alerts.some((alert) => alert.pointId === point.pointId && alert.attemptCount >= 3), 'Three repeated denials create a security alert');
  assert(dashboard.events.some((event) => event.outcome === 'AUTHORIZED') && dashboard.events.some((event) => event.outcome === 'DENIED'), 'Dashboard lists authorized and denied access decisions');

  await revokeAccessPermission(permission.id, actor, { simulatedOnly: true });
  const revokedDecision = await recordAccessDecision({ pointId: point.pointId, subjectType: 'ACCREDITATION', subjectId: 'DEMO-ACCESS-STAFF-001' }, actor, { simulatedOnly: true });
  assert(revokedDecision.outcome === 'DENIED', 'Revoked permissions no longer authorize access');

  let insecureEndpointRejected = false;
  try {
    await createAccessIntegration({ providerName: 'Test', protocol: 'VENDOR_API_HTTPS', endpointUrl: 'http://controller.local' }, actor, { simulatedOnly: true });
  } catch (error) { insecureEndpointRejected = error instanceof AccessControlError; }
  assert(insecureEndpointRejected, 'Controller metadata rejects unencrypted HTTP endpoints');
  const integration = await createAccessIntegration({
    providerName: 'Development controller', protocol: 'VENDOR_API_HTTPS',
    endpointUrl: 'https://controller.example.test/api', secretReference: 'vault://stadium/access/controller',
  }, actor, { simulatedOnly: true });
  assert(integration.connectionStatus === 'UNVERIFIED' && integration.isSimulated, 'Integration metadata never claims verified hardware connectivity');
  assert(!('password' in integration) && !('credential' in integration), 'Integration records do not accept controller credentials');

  const auditTrail = await getAccessAuditTrail({ simulatedOnly: true });
  assert(auditTrail.length > 0 && verifyAccessAuditChain(auditTrail), 'Append-only development audit trail has a valid hash chain');
  const altered = auditTrail.map((entry) => ({ ...entry }));
  altered[0].action = 'ALTERED';
  assert(!verifyAccessAuditChain(altered), 'Hash-chain verification detects modified audit records');
  assert(!Object.keys(require('../lib/accessControl')).some((key) => /unlock|actuate|openGate/i.test(key)), 'Module exports no door/gate actuation operation');

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
