// Automated Test Suite for Enterprise API Gateway & External Integrations
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure
// Prompt 29 Validation Runner

const {
  INTEGRATION_PROVIDERS,
  ALLOWED_API_SCOPES,
  initialClients,
  initialWebhooks,
  getAllClients,
  registerClient,
  rotateClientSecret,
  getAllProviders,
  getAllWebhooks,
  registerWebhook,
  revokeWebhook,
  dispatchWebhookEvent,
  validateApiKeyAndScope,
  calculateGatewayMetrics,
  runApiGatewayDiagnostics,
} = require('../lib/apiGateway');

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

async function runApiGatewayTestSuite() {
  console.log('================================================================');
  console.log('TALANTA STADIUM ENTERPRISE API GATEWAY TEST SUITE');
  console.log('================================================================\n');

  // Test Group 1: Integration Providers & Scoped Permissions (Requirement 2 & 4)
  console.log('--- TEST GROUP 1: PROVIDERS & SCOPED PERMISSIONS ---');
  assert(INTEGRATION_PROVIDERS.length >= 8, `8 Configured external integration interfaces (Found: ${INTEGRATION_PROVIDERS.length})`);
  assert(ALLOWED_API_SCOPES.length >= 8, `8 Granular API permission scopes defined (Found: ${ALLOWED_API_SCOPES.length})`);

  // Test Group 2: Developer Client Registration & API Key Masking (Requirement 6 & 8)
  console.log('\n--- TEST GROUP 2: CLIENT REGISTRATION & SECRET MASKING ---');
  const { newClient, rawKey } = await registerClient({
    clientName: 'Safaricom M-PESA Daraja Connector',
    organization: 'Safaricom PLC',
    scopes: ['payments:write', 'webhooks:manage'],
  });
  assert(!!newClient && newClient.id.startsWith('CLI-2026-'), `New API client registered with ID: ${newClient.id}`);
  assert(!!rawKey && rawKey.startsWith('ts_live_'), 'Unmasked API key issued exactly once');
  assert(newClient.apiKeyMasked.includes('****'), 'Private API key masked in client object record');

  // Test Group 3: Scoped API Key Validation & Unauthorized Access (Requirement 6)
  console.log('\n--- TEST GROUP 3: API KEY AUTHENTICATION & SCOPE VERIFICATION ---');
  const validKey = 'ts_live_mpesa_98412026_sec';
  const validCheck = validateApiKeyAndScope(validKey, 'payments:write');
  assert(validCheck.valid === true && validCheck.client.clientName.includes('M-PESA'), 'API key authenticated and scoped permission payments:write verified');

  const invalidScopeCheck = validateApiKeyAndScope(validKey, 'iot:telemetry');
  assert(invalidScopeCheck.valid === false && invalidScopeCheck.statusCode === 403, 'Missing required permission scope correctly rejected with 403 Forbidden');

  const invalidKeyCheck = validateApiKeyAndScope('ts_live_invalid_secret_key', 'payments:write');
  assert(invalidKeyCheck.valid === false && invalidKeyCheck.statusCode === 401, 'Invalid API key correctly rejected with 401 Unauthorized');

  // Test Group 4: Webhook Dispatch & HMAC-SHA256 Signatures (Requirement 5)
  console.log('\n--- TEST GROUP 4: WEBHOOK DISPATCH & HMAC-SHA256 SIGNATURES ---');
  const dispatchRes = await dispatchWebhookEvent({
    eventName: 'payment.confirmed',
    payload: { mpesaReceipt: 'SJK849102X', amount: 2000 },
  });
  assert(dispatchRes.success === true, 'Webhook event dispatched successfully');
  assert(dispatchRes.deliveryResults.length > 0 && dispatchRes.deliveryResults[0].signature.startsWith('sha256='), 'HMAC-SHA256 signature generated in X-Talanta-Signature format');

  // Test Group 5: API Key Rotation (Requirement 6 & 8)
  console.log('\n--- TEST GROUP 5: CREDENTIAL ROTATION ---');
  const rotRes = await rotateClientSecret({ clientId: 'CLI-2026-001' });
  assert(rotRes.success === true && !!rotRes.newRawKey, 'API Key secret rotated and new unmasked key generated');

  // Test Group 6: System Diagnostic Runner (Requirement 9)
  console.log('\n--- TEST GROUP 6: SYSTEM DIAGNOSTIC RUNNER ---');
  const diag = await runApiGatewayDiagnostics();
  assert(diag.totalTests >= 5, `API Gateway diagnostic runner executed ${diag.totalTests} tests`);
  assert(diag.failedCount === 0, `All diagnostic tests passed (${diag.passedCount}/${diag.totalTests})`);

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runApiGatewayTestSuite();
}

module.exports = { runApiGatewayTestSuite };
