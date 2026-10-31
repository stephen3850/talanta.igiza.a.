// End-to-End Automated Integration Test Suite
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

const { generateDynamicQRToken, verifyDynamicQRToken } = require('../lib/tickets');
const { hashPassword, verifyPassword, encodeSessionToken, verifySessionToken } = require('../lib/auth');
const { maskPhoneNumber, formatKenyaPhone } = require('../lib/payments');
const { runBuildingManagementDiagnostics } = require('../lib/buildingManagement');
const { runIncidentSystemDiagnostics } = require('../lib/incidentManagement');
const { runPwaTestSuite } = require('./test_pwa_and_mobile');
const { runSignageTestSuite } = require('./test_digital_signage');
const { runNocTestSuite } = require('./test_network_operations');
const { runAssetMaintenanceTestSuite } = require('./test_asset_maintenance');
const { runApiGatewayTestSuite } = require('./test_api_gateway');
const { runVisitorAiTestSuite } = require('./test_visitor_ai_assistant');
const { runFinanceTestSuite } = require('./test_financial_management');
const { runProcurementTestSuite } = require('./test_procurement');
const { runHelpdeskTestSuite } = require('./test_helpdesk');
const { runExecutiveTestSuite } = require('./test_executive_intelligence');
const { runLauncherTestSuite } = require('./test_system_launcher');

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
  console.log('====================================================');
  console.log('TALANTA STADIUM SMART DIGITAL INFRASTRUCTURE TEST SUITE');
  console.log('====================================================\n');

  // Test Group 1: Authentication & JWT Session Tokens
  console.log('--- TEST GROUP 1: AUTHENTICATION & SECURITY ---');
  const password = 'SuperSecretAdminPassword123!';
  const hashedPassword = hashPassword(password);
  assert(hashedPassword !== password, 'Password successfully hashed with salt');
  assert(verifyPassword(password, hashedPassword) === true, 'Password verification succeeds with correct credentials');
  assert(verifyPassword('WrongPassword', hashedPassword) === false, 'Password verification fails with invalid credentials');

  const sessionPayload = { id: 'USR-ADMIN-01', email: 'admin@sttech.co.ke', role: 'SYSTEM_ADMIN' };
  const sessionToken = encodeSessionToken(sessionPayload);
  const decodedSession = verifySessionToken(sessionToken);
  assert(decodedSession !== null, 'JWT session token generated and decoded successfully');
  assert(decodedSession.role === 'SYSTEM_ADMIN', 'JWT session payload preserves user role');

  // Test Group 2: Cryptographic QR Credentials
  console.log('\n--- TEST GROUP 2: CRYPTOGRAPHIC TICKET QR ENGINE ---');
  const ticketData = {
    ticketNumber: 'TKT-2026-9841-01',
    orderRef: 'TLN-9841-A2',
    eventId: 'EVT-001',
    categoryName: 'General Admission',
    seatNumber: 'GATE A - SEC 104 - SEAT 42',
  };

  const qrToken = generateDynamicQRToken(ticketData);
  assert(typeof qrToken === 'string' && qrToken.length > 50, 'Dynamic Base64 QR token generated');

  const verifyResult = verifyDynamicQRToken(qrToken);
  assert(verifyResult.valid === true, 'HMAC-SHA256 signature verification passed');
  assert(verifyResult.data.ticketNumber === ticketData.ticketNumber, 'QR payload ticket number verified');

  // Tamper Test
  const tamperedToken = qrToken.slice(0, -5) + 'XXXXX';
  const tamperedResult = verifyDynamicQRToken(tamperedToken);
  assert(tamperedResult.valid === false, 'Tampered QR token correctly rejected by HMAC signature check');

  // Test Group 3: Payment Service & Phone Formatting
  console.log('\n--- TEST GROUP 3: PAYMENT UTILITIES ---');
  const phone1 = '0712345678';
  const formatted1 = formatKenyaPhone(phone1);
  assert(formatted1 === '254712345678', 'Kenya phone number 0712345678 formatted to 254712345678');

  const masked = maskPhoneNumber(formatted1);
  assert(masked === '2547****5678', 'Sensitive phone number masked for DPA 2019 compliance');

  // Test Group 4: Smart Building, Energy & Water Systems Engine
  console.log('\n--- TEST GROUP 4: SMART BUILDING, ENERGY & WATER MANAGEMENT ---');
  const bldgDiagnostics = await runBuildingManagementDiagnostics();
  assert(bldgDiagnostics.totalTests >= 5, `Building diagnostics executed: ${bldgDiagnostics.totalTests} tests`);
  assert(bldgDiagnostics.failedCount === 0, `All building management tests passed without failures (${bldgDiagnostics.passedCount}/${bldgDiagnostics.totalTests})`);
  bldgDiagnostics.results.forEach((r) => {
    assert(r.passed === true, `[BMS Engine] ${r.testName}: ${r.details}`);
  });

  // Test Group 5: Emergency Response & Incident Management System
  console.log('\n--- TEST GROUP 5: EMERGENCY RESPONSE & INCIDENT MANAGEMENT ---');
  const incidentDiagnostics = await runIncidentSystemDiagnostics();
  assert(incidentDiagnostics.totalTests >= 5, `Incident diagnostics executed: ${incidentDiagnostics.totalTests} tests`);
  assert(incidentDiagnostics.failedCount === 0, `All incident management tests passed without failures (${incidentDiagnostics.passedCount}/${incidentDiagnostics.totalTests})`);
  incidentDiagnostics.results.forEach((r) => {
    assert(r.passed === true, `[IMS Engine] ${r.testName}: ${r.details}`);
  });

  // Test Group 6: Progressive Web App (PWA) & Mobile Platform
  console.log('\n--- TEST GROUP 6: PROGRESSIVE WEB APP & MOBILE PLATFORM ---');
  const fs = require('fs');
  const path = require('path');
  const projectRoot = path.join(__dirname, '..');

  // 1. Manifest
  const manifestPath = path.join(projectRoot, 'public', 'manifest.json');
  assert(fs.existsSync(manifestPath), 'PWA Web App Manifest exists at /public/manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifest.display === 'standalone', 'PWA Manifest display mode set to standalone');
  assert(manifest.theme_color === '#10B981', 'PWA Manifest theme color matches emerald green');
  assert(manifest.icons.length >= 3, 'PWA Manifest defines standard, high-res, and maskable icons');

  // 2. Service Worker & Security Exclusions
  const swPath = path.join(projectRoot, 'public', 'sw.js');
  assert(fs.existsSync(swPath), 'PWA Service Worker exists at /public/sw.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  assert(swContent.includes('/offline'), 'Service Worker pre-caches offline fallback shell');
  const sensitivePatterns = swContent.match(/const SENSITIVE_URL_PATTERNS = \[([\s\S]*?)\];/)?.[1] || '';
  assert(sensitivePatterns.includes(String.raw`/^\/api\//`) && swContent.includes('if (isSensitiveRequest(url, request.method))'), 'Service Worker bypasses caching for all API routes, including authentication and payments');
  assert(swContent.includes('checkout') && swContent.includes('admin'), 'Service Worker strictly bypasses caching for checkout and admin portals');

  // 3. Offline Ticket & Mandatory Disclaimer
  const offlinePath = path.join(projectRoot, 'app', 'offline', 'page.jsx');
  assert(fs.existsSync(offlinePath), 'Offline fallback page exists at app/offline/page.jsx');
  const ticketPage = fs.readFileSync(path.join(projectRoot, 'app', 'account', 'tickets', 'page.jsx'), 'utf8');
  assert(ticketPage.includes('No cached ticket credentials are stored on this device') && ticketPage.includes('this screen does not approve entry'), 'Ticket page clearly states offline scans do not authorize entry');

  // 4. Staff Portal & Gate Scanner Mobile
  const staffPage = path.join(projectRoot, 'app', 'staff', 'page.jsx');
  assert(fs.existsSync(staffPage), 'Mobile Staff Hub exists at app/staff/page.jsx');
  const scannerPage = fs.readFileSync(path.join(projectRoot, 'app', 'gate', 'scanner', 'page.jsx'), 'utf8');
  assert(scannerPage.includes('navigator.vibrate') && scannerPage.includes('getUserMedia'), 'Mobile Gate Scanner integrates camera stream & haptic vibration feedback');

  // Test Group 7: Smart Digital Signage & Display Operations
  console.log('\n--- TEST GROUP 7: DIGITAL SIGNAGE & DISPLAY OPERATIONS ---');
  await runSignageTestSuite();

  // Test Group 8: Network Operations & IT Infrastructure Monitoring (NOC)
  console.log('\n--- TEST GROUP 8: NETWORK OPERATIONS & NOC MONITORING ---');
  await runNocTestSuite();

  // Test Group 9: Asset Management & AI Predictive Maintenance
  console.log('\n--- TEST GROUP 9: ASSET MANAGEMENT & AI PREDICTIVE MAINTENANCE ---');
  await runAssetMaintenanceTestSuite();

  // Test Group 10: Enterprise API Gateway & External System Integrations
  console.log('\n--- TEST GROUP 10: ENTERPRISE API GATEWAY & INTEGRATIONS ---');
  await runApiGatewayTestSuite();

  // Test Group 11: AI-Powered Visitor Assistant & Grounded Knowledge Base
  console.log('\n--- TEST GROUP 11: AI VISITOR ASSISTANT & KNOWLEDGE BASE ---');
  await runVisitorAiTestSuite();

  // Test Group 12: Enterprise Financial Management & Revenue Reconciliation
  console.log('\n--- TEST GROUP 12: FINANCIAL MANAGEMENT & REVENUE RECONCILIATION ---');
  await runFinanceTestSuite();

  // Test Group 13: Enterprise Procurement & Supplier Management
  console.log('\n--- TEST GROUP 13: ENTERPRISE PROCUREMENT & SUPPLIERS ---');
  await runProcurementTestSuite();

  // Test Group 14: Enterprise Helpdesk & Technical Support Management
  console.log('\n--- TEST GROUP 14: IT & STADIUM OPERATIONS HELPDESK ---');
  await runHelpdeskTestSuite();

  // Test Group 15: Enterprise Executive Intelligence & Performance Management
  console.log('\n--- TEST GROUP 15: EXECUTIVE INTELLIGENCE & PERFORMANCE ---');
  await runExecutiveTestSuite();

  // Test Group 16: System Startup Launcher & Readiness Verification
  console.log('\n--- TEST GROUP 16: SYSTEM STARTUP LAUNCHER & READINESS ---');
  await runLauncherTestSuite();

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite();
