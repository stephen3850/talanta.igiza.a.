const {
  NETWORK_DEVICE_TYPES,
  NETWORK_SEGMENTS,
  NetworkManagementError,
  authorizeNetworkRequest,
  createControllerConfiguration,
  createGuestWifiPolicy,
  getNetworkDashboard,
  networkAccessAudit,
  networkErrorResponse,
  recordNetworkAccess,
  registerNetworkDevice,
  validateNetworkDevice,
} = require('../lib/networkManagement');
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

function requestWithSession(role, isDemo = false) {
  const token = encodeSessionToken({
    id: `TEST-${role}`,
    email: `${role.toLowerCase()}@test.local`,
    role,
    isDemo,
  });
  return new Request('http://localhost/api/network-management/dashboard', {
    headers: { cookie: `talanta_session=${token}` },
  });
}

async function runWifiTestSuite() {
  process.env.NODE_ENV = 'test';
  console.log('TALANTA STADIUM SMART WI-FI & NETWORK MANAGEMENT TEST SUITE');

  assert(NETWORK_DEVICE_TYPES.includes('WIRELESS_CONTROLLER') && NETWORK_DEVICE_TYPES.includes('NETWORK_GATEWAY'), 'Inventory supports controllers and network gateways');
  assert(NETWORK_SEGMENTS.length === 7, 'All seven independent logical network domains are defined');

  const noSession = authorizeNetworkRequest(new Request('http://localhost'), 'view');
  assert(!noSession.authorized && noSession.status === 401, 'Dashboard access requires a valid staff session');
  const customer = authorizeNetworkRequest(requestWithSession('CUSTOMER'), 'view');
  assert(!customer.authorized && customer.status === 403, 'Customer role cannot view network operations');
  const venueManager = authorizeNetworkRequest(requestWithSession('VENUE_MANAGER'), 'view');
  assert(venueManager.authorized, 'Venue manager can view the network dashboard');
  const venueManagerManage = authorizeNetworkRequest(requestWithSession('VENUE_MANAGER'), 'manage');
  assert(!venueManagerManage.authorized, 'Network configuration requires system administrator authorization');
  const demoAdmin = authorizeNetworkRequest(requestWithSession('SYSTEM_ADMIN', true), 'manage');
  assert(demoAdmin.authorized, 'Development demo administrator can manage simulated inventory');

  let unsupportedZoneRejected = false;
  try { validateNetworkDevice({ name: 'Bad Zone', category: 'WIRELESS_AP', zone: 'UNKNOWN_ZONE' }); }
  catch (error) { unsupportedZoneRejected = error instanceof NetworkManagementError; }
  assert(unsupportedZoneRejected, 'Device inventory rejects invalid stadium zones');

  const firstDevice = await registerNetworkDevice({
    name: 'Test East Stand AP', category: 'WIRELESS_AP', zone: 'BOWL',
    manufacturer: 'Test Vendor', model: 'AP-100',
  }, { simulatedOnly: true });
  assert(firstDevice.deviceId.startsWith('NET-WIR-'), 'Equipment registration assigns a unique identifier');
  assert(firstDevice.operationalStatus === 'UNKNOWN' && firstDevice.statusSource === 'UNVERIFIED', 'New hardware is never assumed online');
  assert(firstDevice.isSimulated, 'Development device records are marked simulated');

  let duplicateRejected = false;
  try {
    await registerNetworkDevice({
      deviceId: firstDevice.deviceId, name: 'Duplicate AP',
      category: 'WIRELESS_AP', zone: 'BOWL',
    }, { simulatedOnly: true });
  } catch (error) { duplicateRejected = error.status === 409; }
  assert(duplicateRejected, 'Duplicate network device IDs are rejected');

  let insecureEndpointRejected = false;
  try {
    await createControllerConfiguration({
      providerName: 'Test controller', protocol: 'CONTROLLER_API',
      endpointUrl: 'http://controller.local',
    }, { id: 'TEST-ADMIN', email: 'admin@test.local' }, { simulatedOnly: true });
  } catch (error) { insecureEndpointRejected = error.status === 400; }
  assert(insecureEndpointRejected, 'Controller configuration rejects non-HTTPS endpoints');

  const controller = await createControllerConfiguration({
    providerName: 'Development controller fixture',
    protocol: 'CONTROLLER_API',
    endpointUrl: 'https://controller.example.test/api',
    secretReference: 'vault://stadium/wifi/controller',
  }, { id: 'TEST-ADMIN', email: 'admin@test.local' }, { simulatedOnly: true });
  assert(controller.connectionStatus === 'UNVERIFIED' && controller.isSimulated, 'Controller metadata never claims a connection');

  const policy = await createGuestWifiPolicy({
    ssid: 'Talanta-Guest-Test',
    captivePortalProvider: 'Compatible portal provider',
    bandwidthMbps: 10,
    sessionMinutes: 240,
    idleTimeoutMinutes: 30,
    maxDevicesPerSession: 2,
  }, { id: 'TEST-ADMIN', email: 'admin@test.local' }, { simulatedOnly: true });
  assert(policy.status === 'PENDING_APPROVAL' && policy.isSimulated, 'Guest policies are saved as simulated drafts pending approval');
  assert(!('password' in policy) && !('browsingHistory' in policy), 'Guest policy stores neither Wi-Fi credentials nor browsing data');

  let invalidPolicyRejected = false;
  try {
    await createGuestWifiPolicy({
      ssid: 'Invalid', bandwidthMbps: 0, sessionMinutes: 120,
      idleTimeoutMinutes: 120, maxDevicesPerSession: 2,
    }, { id: 'TEST-ADMIN' }, { simulatedOnly: true });
  } catch (error) { invalidPolicyRejected = error.status === 400; }
  assert(invalidPolicyRejected, 'Invalid bandwidth/session policy values are rejected');

  const dashboard = await getNetworkDashboard({ simulatedOnly: true });
  assert(dashboard.adapter.liveControllerConnected === false, 'Dashboard truthfully reports no live controller');
  assert(dashboard.adapter.mode === 'SIMULATED_DEVELOPMENT', 'Development adapter is explicitly identified');
  assert(dashboard.usage.every((item) => item.isSimulated), 'Development guest usage aggregates are labelled simulated');

  const priorAuditCount = networkAccessAudit.length;
  await recordNetworkAccess({
    user: { id: 'TEST-ADMIN', email: 'admin@test.local', isDemo: true },
    action: 'NETWORK_TEST_ACCESS',
    req: new Request('http://localhost', { headers: { 'user-agent': 'network-test' } }),
  });
  assert(networkAccessAudit.length === priorAuditCount + 1, 'Network inventory access is audit logged');

  const errorResponse = networkErrorResponse(new NetworkManagementError('Controller unavailable', 503));
  const errorBody = await errorResponse.json();
  assert(errorResponse.status === 503 && errorBody.success === false, 'Controller failures preserve explicit API error status');

  console.log(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
  if (failed) process.exitCode = 1;
}

if (require.main === module) runWifiTestSuite();
module.exports = { runWifiTestSuite };
