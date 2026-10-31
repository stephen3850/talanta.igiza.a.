// Automated Test Suite for Digital Signage & Display Operations
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure
// Prompt 26 Validation Runner

const {
  SCREEN_CATEGORIES,
  CONTENT_TYPES,
  SCREEN_STATUSES,
  initialScreens,
  initialContentItems,
  initialPlaylists,
  getAllScreens,
  registerScreen,
  updateScreenStatus,
  getAllContent,
  createContentItem,
  getAllPlaylists,
  createPlaylist,
  triggerEmergencyOverride,
  clearEmergencyOverride,
  calculateSignageMetrics,
  runDigitalSignageDiagnostics,
} = require('../lib/digitalSignage');

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

async function runSignageTestSuite() {
  console.log('================================================================');
  console.log('TALANTA STADIUM DIGITAL SIGNAGE PLATFORM TEST SUITE');
  console.log('================================================================\n');

  // Test Group 1: Screen Categories & Telemetry Registry (Requirement 3)
  console.log('--- TEST GROUP 1: SCREEN CATEGORIES & HARDWARE REGISTRY ---');
  assert(SCREEN_CATEGORIES.length >= 6, `6 Screen Categories supported (Found: ${SCREEN_CATEGORIES.length})`);
  const registeredScreens = getAllScreens();
  assert(registeredScreens.length >= 6, `Initial screens registered: ${registeredScreens.length}`);
  const firstScreen = registeredScreens[0];
  assert(!!firstScreen.resolution && !!firstScreen.connectedPlayer, 'Screen record contains resolution and player telematic data');

  // Test Group 2: Screen Registration Pipeline
  console.log('\n--- TEST GROUP 2: SCREEN REGISTRATION PIPELINE ---');
  const newScreen = await registerScreen({
    name: 'North Stand Concourse Main Video Wall',
    location: 'North Stand Deck 2 Entrance',
    category: 'CONCOURSE_WAYFINDING',
    connectedPlayer: 'BrightSign XC4055 (Unit 88)',
  });
  assert(!!newScreen && newScreen.id.startsWith('SCR-2026-'), `New screen registered with ID: ${newScreen.id}`);
  assert(newScreen.status === 'ONLINE', 'Newly registered screen initialized with ONLINE telemetry');

  // Test Group 3: Content Asset Creation & Extension Security Filter (Requirement 4 & 8)
  console.log('\n--- TEST GROUP 3: CONTENT ASSET CREATION & SECURITY FILTERS ---');
  const content = await createContentItem({
    title: 'Matchday Parking Wayfinding Banner',
    type: 'WAYFINDING',
    mediaUrl: '/images/content/parking_guide.png',
    durationSeconds: 15,
  });
  assert(!!content && content.id.startsWith('CNT-2026-'), `Content asset created: ${content.id}`);

  let rejected = false;
  try {
    await createContentItem({
      title: 'Malicious Executable Upload',
      type: 'PROMOTIONAL',
      mediaUrl: '/uploads/exploit.bat',
    });
  } catch (e) {
    rejected = true;
  }
  assert(rejected, 'Security Filter correctly rejected disallowed file extension (.bat)');

  // Test Group 4: Playlist Creation & Loop Calculator (Requirement 5)
  console.log('\n--- TEST GROUP 4: PLAYLIST COMPOSITION & DURATION CALCULATOR ---');
  const playlist = await createPlaylist({
    name: 'Gate B Pre-Match Entry Loop',
    description: 'Dynamic loop for Gate B turnstiles',
    targetCategory: 'SECTOR_TICKETING',
    contentIds: ['CNT-2026-101', 'CNT-2026-102'],
  });
  assert(!!playlist && playlist.id.startsWith('PLAY-2026-'), `Playlist created: ${playlist.id}`);
  assert(playlist.totalDurationSeconds > 0, `Combined loop duration calculated: ${playlist.totalDurationSeconds} seconds`);

  // Test Group 5: Emergency Display Override & Human Confirmation Interlock (Requirement 7)
  console.log('\n--- TEST GROUP 5: EMERGENCY DISPLAY OVERRIDE & HUMAN SIGN-OFF ---');
  const emgFail = await triggerEmergencyOverride({
    emergencyTitle: 'Unconfirmed Emergency Test',
    emergencyMessage: 'Should fail due to missing signature',
    authorizedOfficer: null,
    confirmationPasscode: null,
  });
  assert(emgFail.success === false, 'Emergency override correctly REJECTED without authorized human signature/passcode');

  const emgPass = await triggerEmergencyOverride({
    emergencyTitle: 'Code Red Sector Evacuation Directive',
    emergencyMessage: 'Proceed calmly to Gate B exits immediately.',
    authorizedOfficer: 'Chief Stadium Safety Officer',
    confirmationPasscode: 'CSSO-AUTH-2026',
  });
  assert(emgPass.success === true, 'Emergency override ACTIVATED with authorized human sign-off');
  assert(emgPass.affectedScreenCount > 0, `Emergency directive projected on ${emgPass.affectedScreenCount} displays`);

  const clearRes = await clearEmergencyOverride({});
  assert(clearRes.success === true, 'Emergency display override cleared and normal playlist loop restored');

  // Test Group 6: System Diagnostic Runner (Requirement 9)
  console.log('\n--- TEST GROUP 6: SYSTEM DIAGNOSTIC RUNNER ---');
  const diag = await runDigitalSignageDiagnostics();
  assert(diag.totalTests >= 5, `Signage diagnostic runner executed ${diag.totalTests} tests`);
  assert(diag.failedCount === 0, `All diagnostic tests passed (${diag.passedCount}/${diag.totalTests})`);

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runSignageTestSuite();
}

module.exports = { runSignageTestSuite };
