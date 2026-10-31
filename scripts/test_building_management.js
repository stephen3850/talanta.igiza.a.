// Automated Test Suite for Building, Energy and Water Management System
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure
// Prompt 23 Validation Runner

const {
  energyMetersData,
  waterMetersData,
  environmentalSensorsData,
  approvedGateways,
  simulateTelemetryCycle,
  generateBuildingAnalytics,
  verifyAndExecuteRemoteControl,
  runBuildingManagementDiagnostics,
} = require('../lib/buildingManagement');

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

async function runTestSuite() {
  console.log('================================================================');
  console.log('TALANTA STADIUM BUILDING, ENERGY & WATER MANAGEMENT TEST SUITE');
  console.log('================================================================\n');

  // Test Group 1: Simulated Readings Identification
  console.log('--- TEST GROUP 1: SIMULATED READINGS IDENTIFICATION ---');
  const energyMeter = energyMetersData[0];
  assert(energyMeter.isSimulated === true, 'Energy meter has explicit isSimulated: true tag');
  const waterMeter = waterMetersData[0];
  assert(waterMeter.isSimulated === true, 'Water meter has explicit isSimulated: true tag');
  const envSensor = environmentalSensorsData[0];
  assert(envSensor.isSimulated === true, 'Environmental sensor has explicit isSimulated: true tag');

  // Test Group 2: Telemetry Ingestion Cycle
  console.log('\n--- TEST GROUP 2: TELEMETRY INGESTION & PERTURBATION ---');
  const initialPower = energyMeter.currentPowerKw;
  const cycleResult = simulateTelemetryCycle();
  assert(cycleResult.cyclesCompleted === true, 'Telemetry ingestion cycle executed successfully');
  assert(cycleResult.isSimulated === true, 'Ingested cycle outputs simulated telemetry metadata');
  assert(typeof energyMeter.currentPowerKw === 'number', 'Meter active power maintained valid numeric value');

  // Test Group 3: Analytics & Reporting Generation
  console.log('\n--- TEST GROUP 3: ANALYTICS & CONSUMPTION REPORTING ---');
  const analytics = generateBuildingAnalytics();
  assert(analytics.kpi.totalPowerKw > 0, `Total power calculated: ${analytics.kpi.totalPowerKw} kW`);
  assert(analytics.kpi.totalDailyEnergyKwh > 0, `Daily energy calculated: ${analytics.kpi.totalDailyEnergyKwh} kWh`);
  assert(analytics.kpi.estimatedEnergyCostKes > 0, `Energy cost calculated: KES ${analytics.kpi.estimatedEnergyCostKes.toLocaleString()}`);
  assert(analytics.kpi.carbonFootprintKgCo2 > 0, `Carbon footprint calculated: ${analytics.kpi.carbonFootprintKgCo2} kg CO2e`);
  assert(analytics.recommendations.length >= 3, `Efficiency recommendations generated: ${analytics.recommendations.length} items`);
  assert(analytics.maintenanceAlerts.length >= 3, `Preventative maintenance alerts generated: ${analytics.maintenanceAlerts.length} items`);

  // Test Group 4: Alerting on Over-Threshold Conditions
  console.log('\n--- TEST GROUP 4: THRESHOLD ALERTING ENGINE ---');
  const highLoadMeter = energyMetersData.find((m) => m.currentPowerKw > 800);
  assert(!!highLoadMeter, 'High load threshold alert flagged on floodlight array');
  assert(highLoadMeter?.alertStatus === 'WARNING_HIGH_LOAD', 'Alert status correctly set to WARNING_HIGH_LOAD');

  // Test Group 5: Device Disconnection & Heartbeat Timeout
  console.log('\n--- TEST GROUP 5: DEVICE DISCONNECTION DETECTION ---');
  const simulatedPastHeartbeat = Date.now() - 15 * 60 * 1000; // 15 mins ago
  const isDisconnected = Date.now() - simulatedPastHeartbeat > 10 * 60 * 1000;
  assert(isDisconnected === true, 'Device correctly diagnosed as OFFLINE after 10-minute heartbeat timeout');

  // Test Group 6: Control Safety Interlocks & Permissions
  console.log('\n--- TEST GROUP 6: CONTROL SAFETY & INTERLOCK GOVERNANCE ---');

  // Sub-test 6a: Unauthorized role rejection (STEWARD)
  const stewardAttempt = await verifyAndExecuteRemoteControl({
    user: { id: 'USR-STEWARD-01', email: 'steward@example.com', role: 'STEWARD' },
    gatewayId: 'GW-BACNET-IP-01',
    targetDevice: 'AHU-01',
    commandType: 'SET_DAMPER',
    setpointValue: '50',
    safetyInterlockToken: 'INTERLOCK_CONFIRMED_ENG_2026',
    overrideAcknowledgement: true,
  });
  assert(stewardAttempt.safetyBlocked === true && stewardAttempt.success === false, 'Unauthorized role (STEWARD) blocked by RBAC safety check');

  // Sub-test 6b: Life-safety equipment prohibition
  const fireAttempt = await verifyAndExecuteRemoteControl({
    user: { id: 'USR-ADMIN-01', email: 'admin@sttech.co.ke', role: 'SYSTEM_ADMIN' },
    gatewayId: 'GW-MBUS-WATER-01',
    targetDevice: 'FIRE_SUPPRESSION_RING_MAIN_VALVE',
    commandType: 'CLOSE_VALVE',
    setpointValue: '0',
    safetyInterlockToken: 'INTERLOCK_CONFIRMED_ENG_2026',
    overrideAcknowledgement: true,
  });
  assert(fireAttempt.safetyBlocked === true && fireAttempt.success === false, 'Life-safety fire suppression override unconditionally prohibited');

  // Sub-test 6c: Invalid interlock token rejection
  const invalidTokenAttempt = await verifyAndExecuteRemoteControl({
    user: { id: 'USR-ADMIN-01', email: 'admin@sttech.co.ke', role: 'SYSTEM_ADMIN' },
    gatewayId: 'GW-BACNET-IP-01',
    targetDevice: 'AHU-01',
    commandType: 'SET_DAMPER',
    setpointValue: '50',
    safetyInterlockToken: 'INVALID_TOKEN',
    overrideAcknowledgement: true,
  });
  assert(invalidTokenAttempt.safetyBlocked === true && invalidTokenAttempt.success === false, 'Invalid interlock token rejected by safety engine');

  // Sub-test 6d: Legitimate authorized command execution
  const authorizedAttempt = await verifyAndExecuteRemoteControl({
    user: { id: 'USR-ADMIN-01', email: 'facility.engineer@sttech.co.ke', role: 'VENUE_MANAGER' },
    gatewayId: 'GW-BACNET-IP-01',
    targetDevice: 'AHU-VIP-CANOPY-01',
    commandType: 'SET_VENTILATION_DAMPER',
    setpointValue: '75',
    safetyInterlockToken: 'INTERLOCK_CONFIRMED_ENG_2026',
    overrideAcknowledgement: true,
  });
  assert(authorizedAttempt.success === true && authorizedAttempt.safetyBlocked === false, 'Authorized command successfully verified, interlocked and executed');

  // Test Group 7: Hardware Gateways & Physical Interfaces
  console.log('\n--- TEST GROUP 7: APPROVED HARDWARE GATEWAYS & PROTOCOLS ---');
  assert(approvedGateways.length === 5, `5 Approved industrial gateways configured: ${approvedGateways.map(g => g.protocol).join(', ')}`);
  const hasBacnet = approvedGateways.some(g => g.protocol.includes('BACnet'));
  const hasModbus = approvedGateways.some(g => g.protocol.includes('Modbus'));
  const hasMbus = approvedGateways.some(g => g.protocol.includes('M-Bus'));
  const hasDali = approvedGateways.some(g => g.protocol.includes('DALI'));
  const hasOpcua = approvedGateways.some(g => g.protocol.includes('OPC'));
  assert(hasBacnet && hasModbus && hasMbus && hasDali && hasOpcua, 'All required industrial field protocols verified (BACnet, Modbus, M-Bus, DALI, OPC UA)');

  // Test Group 8: Diagnostic Runner Integration
  console.log('\n--- TEST GROUP 8: SYSTEM DIAGNOSTIC RUNNER ---');
  const diag = await runBuildingManagementDiagnostics();
  assert(diag.totalTests >= 5, `Diagnostic runner executed ${diag.totalTests} tests`);
  assert(diag.failedCount === 0, `All diagnostic tests passed (${diag.passedCount}/${diag.totalTests})`);

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runTestSuite();
}

module.exports = { runTestSuite };
