// Automated Test Suite for Network Operations & IT Infrastructure Monitoring (NOC)
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure
// Prompt 27 Validation Runner

const {
  DEVICE_CATEGORIES,
  MONITORING_PROTOCOLS,
  NOC_ALERT_SEVERITIES,
  initialDevices,
  initialServices,
  initialNocAlerts,
  getAllDevices,
  registerDevice,
  getAllServices,
  registerService,
  getAllAlerts,
  acknowledgeAlert,
  resolveAlert,
  calculateNocMetrics,
  runNetworkOperationsDiagnostics,
} = require('../lib/networkOperations');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failedTests++;
  }
}

async function runNocTestSuite() {
  console.log('================================================================');
  console.log('TALANTA STADIUM NOC & NETWORK OPERATIONS TEST SUITE');
  console.log('================================================================\n');

  // Test Group 1: Infrastructure Categories & Telemetry (Requirement 3 & 4)
  console.log('--- TEST GROUP 1: INFRASTRUCTURE INVENTORY & TELEMETRY ---');
  assert(DEVICE_CATEGORIES.length >= 10, `10 Infrastructure categories supported (Found: ${DEVICE_CATEGORIES.length})`);
  const devices = getAllDevices();
  assert(devices.length >= 8, `Initial devices registered: ${devices.length}`);
  const firstDev = devices[0];
  assert(
    firstDev.cpuUtilPercent !== undefined && firstDev.memoryUtilPercent !== undefined && firstDev.latencyMs !== undefined,
    'Device telemetry captures CPU, RAM, and Latency metrics'
  );

  // Test Group 2: Device Registration Pipeline
  console.log('\n--- TEST GROUP 2: DEVICE REGISTRATION PIPELINE ---');
  const newDev = await registerDevice({
    name: 'East Stand Access Switch 4',
    category: 'EDGE_SWITCH',
    ipAddress: '10.100.15.40',
    location: 'East Stand Telecom Bay',
    vendorModel: 'Cisco Catalyst 9300',
    protocol: 'SNMPV3',
  });
  assert(!!newDev && newDev.id.startsWith('NET-EDG-'), `New device registered with ID: ${newDev.id}`);
  assert(newDev.status === 'ONLINE', 'Registered device initialized with ONLINE health telemetry');

  // Test Group 3: Application & Database Service Health Checks (Requirement 3, 4 & 5)
  console.log('\n--- TEST GROUP 3: APPLICATION & DATABASE SERVICE PROBES ---');
  const services = getAllServices();
  assert(services.length >= 5, `Initial services tracked: ${services.length}`);
  const postgresSvc = services.find((s) => s.category === 'DB_SERVICE');
  assert(!!postgresSvc && postgresSvc.status === 'HEALTHY', 'Database service probe confirms HEALTHY status');

  const newSvc = await registerService({
    name: 'M-PESA Webhook Queue Monitor',
    category: 'APP_SERVICE',
    endpointUrl: 'https://payments.talanta.go.ke/health',
  });
  assert(!!newSvc && newSvc.id.startsWith('SVC-'), `New service endpoint registered: ${newSvc.id}`);

  // Test Group 4: Alert Management & Workflow Pipeline (Requirement 6)
  console.log('\n--- TEST GROUP 4: ALERT MANAGEMENT & TRIAGE WORKFLOW ---');
  const activeAlerts = getAllAlerts({ status: 'ACTIVE' });
  assert(activeAlerts.length > 0, `Active warning alerts found: ${activeAlerts.length}`);
  const targetAlert = activeAlerts[0];

  const ackRes = await acknowledgeAlert({
    alertId: targetAlert.id,
    currentUser: { email: 'noc.engineer@sttech.co.ke' },
  });
  assert(ackRes.success === true && ackRes.alert.status === 'ACKNOWLEDGED', `Alert ${targetAlert.id} status transitioned to ACKNOWLEDGED`);

  const resRes = await resolveAlert({
    alertId: targetAlert.id,
    resolutionNote: 'Re-balanced Wi-Fi channel allocation across Section 104.',
    currentUser: { email: 'noc.engineer@sttech.co.ke' },
  });
  assert(resRes.success === true && resRes.alert.status === 'RESOLVED', `Alert ${targetAlert.id} resolved with logged resolution note`);

  // Test Group 5: System Diagnostic Runner (Requirement 10)
  console.log('\n--- TEST GROUP 5: SYSTEM DIAGNOSTIC RUNNER ---');
  const diag = await runNetworkOperationsDiagnostics();
  assert(diag.totalTests >= 5, `NOC diagnostic runner executed ${diag.totalTests} tests`);
  assert(diag.failedCount === 0, `All diagnostic tests passed (${diag.passedCount}/${diag.totalTests})`);

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runNocTestSuite();
}

module.exports = { runNocTestSuite };
