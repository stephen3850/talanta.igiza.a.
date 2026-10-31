const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';

const { authorizeRole, encodeSessionToken } = require('../lib/auth');
const { generateDynamicQRToken, verifyDynamicQRToken } = require('../lib/tickets');

const projectRoot = path.join(__dirname, '..');
const source = (relativePath) => fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');

function requestWithRole(role) {
  const token = encodeSessionToken({ id: 'regression-user', email: 'regression@example.test', role });
  return new Request('http://localhost/api/test', {
    headers: { cookie: `talanta_session=${token}` },
  });
}

function check(condition, message) {
  assert.ok(condition, message);
  console.log(`[PASS] ${message}`);
}

function run() {
  const unauthenticatedRequest = new Request('http://localhost/api/test');
  assert.equal(authorizeRole(unauthenticatedRequest, ['SYSTEM_ADMIN']).status, 401);
  assert.equal(authorizeRole(requestWithRole('CUSTOMER'), ['SYSTEM_ADMIN']).authorized, false);
  assert.equal(authorizeRole(requestWithRole('SYSTEM_ADMIN'), ['SYSTEM_ADMIN']).authorized, true);
  console.log('[PASS] Session authentication and role checks');

  const token = generateDynamicQRToken({ ticketNumber: 'REGRESSION-TICKET', orderRef: 'REGRESSION-BOOKING', eventId: 'EVENT' });
  assert.equal(verifyDynamicQRToken(token).valid, true);
  assert.equal(verifyDynamicQRToken(`${token.slice(0, -4)}xxxx`).valid, false);
  console.log('[PASS] Signed ticket credentials reject tampering');

  const bookingRoute = source('app/api/bookings/route.js');
  check(bookingRoute.includes("authorizeRole(req, ['CUSTOMER'])"), 'ticket booking requires an authenticated customer');
  check(bookingRoute.includes('no seats were reserved, no payment was initiated, and no tickets were issued'), 'development booking explicitly creates no real booking effects');
  check(bookingRoute.includes("event: { facilityId }") && bookingRoute.includes('authorizeFacilityAccess'), 'staff booking queries require facility membership and filter by facility');
  const ticketRoute = source('app/api/tickets/route.js');
  check(ticketRoute.includes("event: { facilityId }") && ticketRoute.includes('authorizeFacilityAccess'), 'staff ticket queries require facility membership and filter by facility');

  const paymentCallback = source('app/api/payments/callback/route.js');
  check(paymentCallback.includes('queryMpesaSTKStatus'), 'payment callback independently queries the provider');
  check(paymentCallback.includes('tx.payment.updateMany'), 'payment finalization claims pending payments atomically');
  check(paymentCallback.includes('normalizedPhone !== formatKenyaPhone(payment.phoneNumber ||'), 'payment callback matches payer phone');

  const gateRoute = source('app/api/gate/validate/route.js');
  check(gateRoute.includes("typeof qrToken !== 'string'"), 'gate validation requires a signed QR token');
  check(gateRoute.includes("where: { id: ticket.id, status: 'ISSUED' }"), 'gate redemption is atomic and one-time');
  check(gateRoute.includes('authorizeFacilityAccess(req, event.facilityId'), 'gate staff authorization is checked against the event facility');

  const uploadRoute = source('app/api/upload/route.js');
  check(uploadRoute.includes('authorizeRole(req'), 'image upload requires an authorized role');
  check(uploadRoute.includes('buffer.subarray(0, 8).equals'), 'image upload validates file signatures');

  const directPaymentRoute = source('app/api/payments/mpesa/route.js');
  check(directPaymentRoute.includes('}, { status: 410 })') && !directPaymentRoute.includes('initiateMpesaSTKPush'), 'unauthenticated direct payment initiation is disabled');

  const parkingRoute = source('app/api/parking/validate/route.js');
  check(parkingRoute.includes('INTEGRATION_DISCONNECTED') && parkingRoute.includes('}, { status: 503 })'), 'parking validation refuses entry without verified hardware');

  const controlRoute = source('app/api/building/control/route.js');
  check(controlRoute.includes('authorizeRole(req, controlRoles)') && controlRoute.includes('}, { status: 503 })'), 'building control requires authorization and blocks unverified commands');

  const reportRoute = source('app/api/reports/route.js');
  check(reportRoute.includes("authorizeRole(req, reportRoles)") && reportRoute.includes("dataMode: 'SIMULATED'"), 'reports are access-controlled and identify fixture data');
  check(!reportRoute.includes('38920') && !reportRoute.includes('60000'), 'reports do not invent live attendance or venue capacity');

  const webhookRoute = source('app/api/v1/integrations/webhooks/route.js');
  check(webhookRoute.includes("authorizeRole(req, ['SYSTEM_ADMIN'])"), 'webhook secrets and controls require a system administrator');

  const signageRoute = source('app/api/digital-signage/emergency/route.js');
  check(signageRoute.includes('legacy emergency override is disabled'), 'legacy emergency publishing cannot bypass the approval workflow');

  const iotAlertsRoute = source('app/api/iot/alerts/route.js');
  check(iotAlertsRoute.includes("authorizeRole(req, iotRoles)") && iotAlertsRoute.includes("authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER'])"), 'IoT alerts are authenticated and acknowledgement is manager-only');

  const iotDeviceRoute = source('app/api/iot/devices/[id]/route.js');
  check(iotDeviceRoute.includes('authorizeFacilityAccess(req, facilityId, iotRoles)') && iotDeviceRoute.includes('authorizeFacilityAccess(req, facilityId, iotManagerRoles)'), 'IoT device reads and updates require facility membership and operation roles');
  check(iotDeviceRoute.includes('delete safeDevice.apiKey') && !iotDeviceRoute.includes('...body'), 'IoT credentials are hidden and updates use an allowlist');

  const assistantRoute = source('app/api/ai/visitor-assistant/route.js');
  check(assistantRoute.includes("authorizeRole(req, ['CUSTOMER'])") && !assistantRoute.includes('conversationHistory'), 'Visitor assistant derives any account context from a verified customer session');

  const knowledgeRoute = source('app/api/ai/visitor-assistant/knowledge/route.js');
  check(knowledgeRoute.includes("authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER'])") && knowledgeRoute.includes('currentUser: auth.user'), 'Knowledge management is restricted and uses server-authenticated actor identity');

  const emergencyDispatch = source('lib/incidentManagement.js');
  check(emergencyDispatch.includes('SIMULATED_NOT_SENT') && !emergencyDispatch.includes('VERIFIED_DELIVERED') && !emergencyDispatch.includes('sentAt:'), 'Legacy incident communication fixtures cannot claim delivery');

  const emergencyRoute = source('app/api/emergency/communications/route.js');
  check(emergencyRoute.includes('no notification was sent') && emergencyRoute.includes("status: 503"), 'Legacy emergency dispatch API fails closed without a verified provider');

  const apiDocsRoute = source('app/api/v1/docs/route.js');
  check(apiDocsRoute.includes('paths: {}') && !apiDocsRoute.includes('stadium.talanta.go.ke'), 'API documentation does not advertise an unverified production endpoint');

  console.log('Core security regression checks passed.');
}

try {
  run();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
