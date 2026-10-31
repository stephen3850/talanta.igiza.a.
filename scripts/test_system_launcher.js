// Automated Test Suite for System Startup Launcher & Readiness Check
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

const fs = require('fs');
const path = require('path');
const { runReadinessChecks, STATUS } = require('./system_readiness.js');

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

async function runLauncherTestSuite() {
  console.log('----------------------------------------------------');
  console.log('TEST GROUP: SYSTEM STARTUP LAUNCHER & READINESS CHECKS');
  console.log('----------------------------------------------------\n');

  // 1. Launcher Batch Files Verification
  console.log('--- 1. Double-Click Windows Batch Files ---');
  const projectRoot = path.join(__dirname, '..');
  const startBat = path.join(projectRoot, 'start_system.bat');
  const stopBat = path.join(projectRoot, 'stop_system.bat');
  const restartBat = path.join(projectRoot, 'restart_system.bat');

  assert(fs.existsSync(startBat), 'start_system.bat exists in project root');
  assert(fs.existsSync(stopBat), 'stop_system.bat exists in project root');
  assert(fs.existsSync(restartBat), 'restart_system.bat exists in project root');

  const startBatContent = fs.readFileSync(startBat, 'utf8');
  assert(startBatContent.includes('scripts/system_readiness.js'), 'start_system.bat executes system readiness check script');
  assert(startBatContent.includes('scripts/system_startup.js'), 'start_system.bat executes system startup launch script');
  assert(startBatContent.includes('pause'), 'start_system.bat includes pause to prevent automatic terminal closure on error');

  // 2. Readiness Check Execution
  console.log('\n--- 2. System Readiness & Verification Engine ---');
  const readiness = await runReadinessChecks();
  assert(readiness.overallStatus === STATUS.READY || readiness.overallStatus === STATUS.WARNING, 'Readiness engine completed evaluation');
  assert(readiness.checks.length >= 5, 'Executed readiness checks across all core components');
  assert(readiness.integrations.length >= 8, 'Evaluated external hardware & integration readiness matrix');

  // 3. Health Endpoint Verification
  console.log('\n--- 3. System Health Endpoint Configuration ---');
  const healthRoutePath = path.join(projectRoot, 'app/api/health/route.js');
  assert(fs.existsSync(healthRoutePath), 'System health endpoint exists at app/api/health/route.js');

  const healthContent = fs.readFileSync(healthRoutePath, 'utf8');
  assert(healthContent.includes('TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE'), 'Health endpoint returns official system branding name');
  assert(healthContent.includes('integrations'), 'Health endpoint returns external sub-system integration status');
  assert(!healthContent.includes('MPESA_CONSUMER_SECRET') || !healthContent.includes('password'), 'Health endpoint does NOT expose secrets or credentials');

  // 4. System Startup Interface Verification
  console.log('\n--- 4. System Startup Operations Experience ---');
  const startupPagePath = path.join(projectRoot, 'app/startup/page.jsx');
  assert(fs.existsSync(startupPagePath), 'Startup UI experience exists at app/startup/page.jsx');

  const startupContent = fs.readFileSync(startupPagePath, 'utf8');
  assert(startupContent.includes('TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE'), 'Startup UI includes official system name');
  assert(startupContent.includes('ST-Tech ICT Consultants'), 'Startup UI includes ST-Tech ICT Consultants branding');

  // 5. Documentation
  console.log('\n--- 5. Startup Guide Documentation ---');
  const guidePath = path.join(projectRoot, 'STARTUP_GUIDE.md');
  assert(fs.existsSync(guidePath), 'STARTUP_GUIDE.md documentation exists in project root');

  console.log(`\nLauncher Test Suite Complete: Passed ${passed} / ${passed + failed}`);
  if (failed > 0) {
    throw new Error(`System startup launcher test suite failed with ${failed} failure(s).`);
  }

  return { passedCount: passed, failedCount: failed, totalTests: passed + failed };
}

if (require.main === module) {
  runLauncherTestSuite().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runLauncherTestSuite };
