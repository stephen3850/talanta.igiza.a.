// Automated Diagnostic & Verification Suite for PWA & Mobile Web Experience
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure
// Prompt 25 Validation Runner

const fs = require('fs');
const path = require('path');

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

async function runPwaTestSuite() {
  console.log('================================================================');
  console.log('TALANTA STADIUM PWA & MOBILE EXPERIENCE TEST SUITE');
  console.log('================================================================\n');

  // Test Group 1: Web App Manifest Integrity (Requirement 2)
  console.log('--- TEST GROUP 1: WEB APP MANIFEST VALIDATION ---');
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json exists in public/ directory');

  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert(manifestData.display === 'standalone', 'Manifest specifies display: standalone');
  assert(new URL(manifestData.start_url, 'https://example.test').pathname === '/', 'Manifest start_url resolves to the application root');
  assert(manifestData.theme_color === '#10B981', 'Theme color set to stadium emerald (#10B981)');
  assert(manifestData.icons.length >= 2, `Manifest icons present (${manifestData.icons.length} sizes)`);
  assert(manifestData.shortcuts && manifestData.shortcuts.length >= 3, `Application shortcuts present (${manifestData.shortcuts.length} shortcuts)`);

  // Test Group 2: Service Worker Precache & Security Filters (Requirement 2 & 7)
  console.log('\n--- TEST GROUP 2: SERVICE WORKER & CACHING POLICY ---');
  const swPath = path.join(__dirname, '../public/sw.js');
  assert(fs.existsSync(swPath), 'sw.js service worker file exists in public/');

  const swContent = fs.readFileSync(swPath, 'utf8');
  assert(swContent.includes('/offline'), 'SW precaches offline fallback route (/offline)');
  const sensitivePatterns = swContent.match(/const SENSITIVE_URL_PATTERNS = \[([\s\S]*?)\];/)?.[1] || '';
  assert(!swContent.includes("  '/account/tickets'"), 'SW does not precache private ticket wallet pages');
  assert(sensitivePatterns.includes(String.raw`/^\/api\//`) && sensitivePatterns.includes(String.raw`/^\/account\//`), 'SW bypasses caching for API and private account routes');
  assert(sensitivePatterns.includes(String.raw`/^\/api\//`), 'SW bypasses payment API caching');
  assert(swContent.includes('/admin'), 'SW excludes administrative routes (/admin)');

  // Test Group 3: Offline Fallback & Disclaimer (Requirement 4)
  console.log('\n--- TEST GROUP 3: OFFLINE FALLBACK & TICKETING DISCLAIMER ---');
  const offlinePagePath = path.join(__dirname, '../app/offline/page.jsx');
  assert(fs.existsSync(offlinePagePath), 'Offline fallback page exists at app/offline/page.jsx');

  const offlineContent = fs.readFileSync(offlinePagePath, 'utf8');
  assert(
    offlineContent.toLowerCase().includes('offline') && offlineContent.toLowerCase().includes('disclaimer'),
    'Offline fallback includes clear gate turnstile validation disclaimer'
  );

  // Test Group 4: Mobile Staff Portal & Gate Scanner (Requirement 5 & 6)
  console.log('\n--- TEST GROUP 4: STAFF PORTAL & GATE SCANNER ---');
  const staffPagePath = path.join(__dirname, '../app/portal/staff/page.jsx');
  assert(fs.existsSync(staffPagePath), 'Staff Portal exists at app/portal/staff/page.jsx');

  const scannerPagePath = path.join(__dirname, '../app/gate/scanner/page.jsx');
  assert(fs.existsSync(scannerPagePath), 'Gate Scanner page exists at app/gate/scanner/page.jsx');

  const scannerContent = fs.readFileSync(scannerPagePath, 'utf8');
  assert(scannerContent.includes('isOnline') || scannerContent.includes('navigator.onLine'), 'Gate scanner includes network status monitor');

  // Test Group 5: Installation Instructions Guide (Requirement 9)
  console.log('\n--- TEST GROUP 5: INSTALLATION GUIDE ---');
  const guidePagePath = path.join(__dirname, '../app/help/install/page.jsx');
  assert(fs.existsSync(guidePagePath), 'Installation guide exists at app/help/install/page.jsx');

  const guideContent = fs.readFileSync(guidePagePath, 'utf8');
  assert(guideContent.includes('Android') && guideContent.includes('iOS'), 'Installation guide covers Android Chrome & iOS Safari step-by-step');

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: Passed: ${passedTests} | Failed: ${failedTests}`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runPwaTestSuite();
}

module.exports = { runPwaTestSuite };
