const {
  CctvError,
  authorizeCctvRequest,
  cameraAccessAudit,
  createCamera,
  cctvErrorResponse,
  recordCameraAccess,
  simulatedCameras,
  summarizeCameras,
  validateCameraEventInput,
  validateCameraInput,
  validateIntegrationInput,
} = require('../lib/cctv');
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

function requestWithSession(role) {
  const token = encodeSessionToken({ id: `TEST-${role}`, email: `${role.toLowerCase()}@test.local`, role });
  return new Request('http://localhost/api/cctv/cameras', { headers: { cookie: `talanta_session=${token}` } });
}

async function runCctvTestSuite() {
  console.log('TALANTA STADIUM CCTV & VMS TEST SUITE');

  const unauthenticated = authorizeCctvRequest(new Request('http://localhost/api/cctv/cameras'), 'view');
  assert(!unauthenticated.authorized && unauthenticated.status === 401, 'Camera inventory rejects requests without a signed session');
  const steward = authorizeCctvRequest(requestWithSession('STEWARD'), 'view');
  assert(steward.authorized, 'Authorized steward can view camera metadata');
  const deniedConfig = authorizeCctvRequest(requestWithSession('VENUE_MANAGER'), 'configure');
  assert(!deniedConfig.authorized && deniedConfig.status === 403, 'VMS configuration is restricted to system administrators');
  const adminConfig = authorizeCctvRequest(requestWithSession('SYSTEM_ADMIN'), 'configure');
  assert(adminConfig.authorized, 'System administrator can configure VMS metadata');

  const camera = await createCamera({
    name: 'Test South Exit Camera', zone: 'EXIT', locationDescription: 'South exit landing',
    cameraType: 'PTZ', manufacturer: 'Test vendor', model: 'Model X',
    installationStatus: 'PLANNED', privacyMaskingSupported: true, privacyMaskingEnabled: true,
  }, { simulatedOnly: true });
  assert(camera.cameraId.startsWith('CAM-EXI-'), 'Camera registration assigns a zone-specific unique camera ID');
  assert(camera.operationalStatus === 'UNKNOWN' && camera.statusSource === 'UNVERIFIED', 'New camera is not represented as connected without device status');
  assert(camera.isSimulated === true, 'Development registration is labelled simulated');

  let duplicateRejected = false;
  try { await createCamera({ cameraId: camera.cameraId, name: 'Duplicate', zone: 'EXIT', locationDescription: 'South exit', cameraType: 'FIXED' }, { simulatedOnly: true }); }
  catch (error) { duplicateRejected = error.status === 409; }
  assert(duplicateRejected, 'Duplicate camera IDs are rejected');

  let invalidMaskRejected = false;
  try { validateCameraInput({ name: 'Invalid Mask', zone: 'BOWL', locationDescription: 'Pitch', cameraType: 'FIXED', privacyMaskingEnabled: true }); }
  catch (error) { invalidMaskRejected = error.status === 400; }
  assert(invalidMaskRejected, 'Privacy masking cannot be enabled when unsupported');

  let badEndpointRejected = false;
  try { validateIntegrationInput({ providerName: 'Vendor', protocol: 'ONVIF', endpointUrl: 'http://camera.local' }); }
  catch (error) { badEndpointRejected = error.status === 400; }
  assert(badEndpointRejected, 'Integration API rejects insecure or invalid endpoints');

  const integration = validateIntegrationInput({
    providerName: 'Approved VMS', protocol: 'VENDOR_API',
    endpointUrl: 'https://vms.example.test/api', secretReference: 'vault://stadium/vms/primary',
  });
  assert(integration.endpointUrl.startsWith('https://') && !Object.keys(integration).some((key) => /password|token|credential/i.test(key)), 'Integration stores only HTTPS endpoint metadata and optional vault reference');

  let externalRecordingRejected = false;
  try {
    validateCameraEventInput({
      cameraId: camera.cameraId, eventType: 'ALERT', summary: 'Test metadata',
      occurredAt: new Date().toISOString(), incidentReference: 'INC-TEST-1',
      vmsRecordingUrl: 'https://unapproved.example.test/recording',
    }, [integration]);
  } catch (error) { externalRecordingRejected = error.status === 400; }
  assert(externalRecordingRejected, 'Recording links must be on a configured VMS host');

  const beforeAudit = cameraAccessAudit.length;
  await recordCameraAccess({
    user: { id: 'TEST-AUDIT', email: 'auditor@test.local', isDemo: true },
    action: 'CCTV_TEST_ACCESS', entityType: 'CAMERA', entityId: camera.cameraId,
    req: new Request('http://localhost', { headers: { 'user-agent': 'cctv-test' } }),
  });
  assert(cameraAccessAudit.length === beforeAudit + 1, 'Sensitive camera access is recorded in the audit store');

  const errorResponse = cctvErrorResponse(new CctvError('Service unavailable', 503));
  const errorBody = await errorResponse.json();
  assert(errorResponse.status === 503 && errorBody.success === false, 'API error handling preserves safe status and failure shape');
  assert(!('videoUrl' in summarizeCameras(simulatedCameras)), 'Camera summary exposes counts, not video footage');

  console.log(`TEST SUMMARY: Passed: ${passed} | Failed: ${failed}`);
  if (failed) process.exitCode = 1;
}

if (require.main === module) runCctvTestSuite();
module.exports = { runCctvTestSuite };
