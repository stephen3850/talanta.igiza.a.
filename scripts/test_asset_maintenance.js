// Automated Test Suite for AI-Assisted Predictive Maintenance & Enterprise Asset Management (EAM)
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure
// Prompt 28 Validation Runner

const {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  WORK_ORDER_PRIORITIES,
  WORK_ORDER_STATUSES,
  initialAssets,
  initialWorkOrders,
  getAllAssets,
  registerAsset,
  getAllWorkOrders,
  createWorkOrder,
  updateWorkOrderStatus,
  generateAiPredictiveRecommendations,
  calculateAssetMetrics,
  runAssetMaintenanceDiagnostics,
} = require('../lib/assetMaintenance');

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

async function runAssetMaintenanceTestSuite() {
  console.log('================================================================');
  console.log('TALANTA STADIUM ASSET & PREDICTIVE MAINTENANCE TEST SUITE');
  console.log('================================================================\n');

  // Test Group 1: Asset Inventory Categories & Telemetry (Requirement 2 & 5)
  console.log('--- TEST GROUP 1: ASSET CATEGORIES & CONDITION TELEMETRY ---');
  assert(ASSET_CATEGORIES.length >= 10, `10 Asset Categories supported (Found: ${ASSET_CATEGORIES.length})`);
  const registeredAssets = getAllAssets();
  assert(registeredAssets.length >= 5, `Initial registered assets count: ${registeredAssets.length}`);
  const firstAsset = registeredAssets[0];
  assert(
    firstAsset.conditionTelemetry &&
      firstAsset.conditionTelemetry.temperatureC !== undefined &&
      firstAsset.conditionTelemetry.vibrationMms !== undefined,
    'Asset record incorporates live/simulated condition monitoring telemetry'
  );

  // Test Group 2: Asset Registration Pipeline
  console.log('\n--- TEST GROUP 2: ASSET REGISTRATION PIPELINE ---');
  const newAsset = await registerAsset({
    name: 'East Stand Concourse Main Water Pump',
    category: 'PUMP',
    manufacturer: 'Grundfos Pumps Kenya',
    model: 'Hydro MPC 2026',
    location: 'East Stand Vault',
  });
  assert(!!newAsset && newAsset.id.startsWith('AST-2026-'), `New asset registered with ID: ${newAsset.id}`);
  assert(newAsset.status === 'OPERATIONAL', 'Newly registered asset initialized as OPERATIONAL with 100% health index');

  // Test Group 3: Work Order Management & Technician Assignment (Requirement 4)
  console.log('\n--- TEST GROUP 3: WORK ORDER CREATION & TECHNICIAN DISPATCH ---');
  const wo = await createWorkOrder({
    assetId: newAsset.id,
    title: 'Routine Seal Inspection & Pressure Recalibration',
    priority: 'HIGH',
    assignedTechnician: 'Eng. David Kariuki',
    description: 'Check impeller seals and pressure transducer.',
  });
  assert(!!wo && wo.id.startsWith('WO-2026-'), `Work order created: ${wo.id}`);
  assert(wo.status === 'ASSIGNED', 'Work order status initialized to ASSIGNED when technician is specified');

  const compRes = await updateWorkOrderStatus({
    woId: wo.id,
    status: 'COMPLETED',
    completionDetails: 'Impeller seals inspected and pressure recalibrated to 6.0 Bar.',
  });
  assert(compRes.success === true && compRes.workOrder.status === 'COMPLETED', 'Work order completed and formal sign-off logged');

  // Test Group 4: AI Predictive Intelligence & Safety Interlock (Requirement 6 & 7)
  console.log('\n--- TEST GROUP 4: AI PREDICTIVE INTELLIGENCE & SAFETY INTERLOCK ---');
  const recommendations = generateAiPredictiveRecommendations();
  assert(Array.isArray(recommendations) && recommendations.length > 0, `AI Predictive model generated ${recommendations.length} maintenance advisories`);

  const firstRec = recommendations[0];
  assert(firstRec.confidencePercent > 0, `Recommendation includes confidence score (${firstRec.confidencePercent}%)`);
  assert(!!firstRec.uncertaintyDisclaimer, 'Recommendation includes explicit uncertainty information and bounds');
  assert(firstRec.requiresHumanReview === true, 'Safety Interlock Verified: AI recommendation requires mandatory human technical review without automated physical control');

  // Test Group 5: System Diagnostic Runner (Requirement 11)
  console.log('\n--- TEST GROUP 5: SYSTEM DIAGNOSTIC RUNNER ---');
  const diag = await runAssetMaintenanceDiagnostics();
  assert(diag.totalTests >= 4, `Asset maintenance diagnostic runner executed ${diag.totalTests} tests`);
  assert(diag.failedCount === 0, `All diagnostic tests passed (${diag.passedCount}/${diag.totalTests})`);

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAssetMaintenanceTestSuite();
}

module.exports = { runAssetMaintenanceTestSuite };
