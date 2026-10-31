// AI Model Validation & Accuracy Test Suite
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

const {
  predictEventAttendance,
  predictGateCongestion,
  generatePredictiveMaintenanceAdvisory,
  modelMetadata
} = require('../lib/aiEngine');

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

function runAITests() {
  console.log('=====================================================');
  console.log('TALANTA STADIUM AI PREDICTIVE MODEL TEST SUITE');
  console.log('=====================================================\n');

  // Test 1: Model Version & Metadata Check
  console.log('--- TEST GROUP 1: MODEL METADATA & COMPLIANCE ---');
  assert(modelMetadata.modelVersion === 'v1.4.2-ensemble', 'AI model version verified');
  assert(modelMetadata.privacyCompliance.biometricsDisabled === true, 'Biometrics facial profiling strictly disabled by default');
  assert(modelMetadata.privacyCompliance.humanInTheLoopRequired === true, 'Human-in-the-loop decision support enforced');

  // Test 2: Attendance Forecast Functionality
  console.log('\n--- TEST GROUP 2: ATTENDANCE FORECASTING ---');
  const forecast = predictEventAttendance('EVT-001');
  assert(forecast.forecastAttendance > 0, 'Attendance forecast generated positive spectator estimate');
  assert(forecast.forecastAttendance <= 60000, 'Forecast attendance capped at 60,000 stadium capacity');
  assert(forecast.occupancyPercentage >= 0 && forecast.occupancyPercentage <= 100, 'Occupancy percentage within 0-100% bounds');

  // Test 3: Gate Congestion Predictions
  console.log('\n--- TEST GROUP 3: GATE CONGESTION PREDICTIONS ---');
  const gatePredictions = predictGateCongestion();
  assert(Array.isArray(gatePredictions) && gatePredictions.length >= 3, 'Gate congestion predictions generated for all zones');
  assert(gatePredictions[0].recommendedStewardAllocation > 0, 'Recommended steward allocation computed');

  // Test 4: IoT Predictive Maintenance
  console.log('\n--- TEST GROUP 4: PREDICTIVE MAINTENANCE ---');
  const maintenance = generatePredictiveMaintenanceAdvisory();
  assert(Array.isArray(maintenance) && maintenance.length >= 1, 'Predictive maintenance recommendations generated');
  assert(maintenance[0].probability !== undefined, 'Failure probability percentage computed');

  console.log('\n=====================================================');
  console.log(`AI TEST SUMMARY: Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('=====================================================');

  if (failedTests > 0) process.exit(1);
}

if (require.main === module) {
  runAITests();
}

module.exports = { runAITests };
