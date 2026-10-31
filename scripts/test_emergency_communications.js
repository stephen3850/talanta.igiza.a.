const {
  COMMUNICATION_CATEGORIES,
  COMMUNICATION_CHANNELS,
  EmergencyCommunicationsError,
  approveCommunicationMessage,
  authorizeCommunicationsRequest,
  cancelCommunicationMessage,
  createCommunicationIntegration,
  createCommunicationMessage,
  createCommunicationTemplate,
  getCommunicationsAuditTrail,
  getEmergencyCommunicationsDashboard,
  listCommunicationTemplates,
  publishCommunicationMessage,
  scheduleCommunicationMessage,
  submitCommunicationForApproval,
  updateCommunicationsPolicy,
  verifyCommunicationsAudit,
} = require('../lib/emergencyCommunications');
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

function testRequest(role, isDemo = false) {
  const token = encodeSessionToken({ id: `TEST-${role}`, email: `${role.toLowerCase()}@test.local`, role, isDemo });
  return new Request('http://localhost/api/emergency-communications/dashboard', { headers: { cookie: `talanta_session=${token}` } });
}

async function expectError(operation, expectedStatus, description) {
  try {
    await operation();
    assert(false, description);
  } catch (error) {
    assert(error instanceof EmergencyCommunicationsError && error.status === expectedStatus, description);
  }
}

async function run() {
  process.env.NODE_ENV = 'test';
  console.log('TALANTA STADIUM EMERGENCY COMMUNICATIONS TEST SUITE');

  assert(COMMUNICATION_CATEGORIES.includes('EMERGENCY') && COMMUNICATION_CATEGORIES.includes('SAFETY'), 'Operational, event, safety and emergency categories are defined');
  assert(COMMUNICATION_CHANNELS.includes('PUBLIC_ADDRESS') && COMMUNICATION_CHANNELS.includes('DIGITAL_SIGNAGE'), 'PA and digital signage channels are supported');
  assert(!authorizeCommunicationsRequest(new Request('http://localhost'), 'view').authorized, 'Dashboard requires a signed-in session');
  assert(!authorizeCommunicationsRequest(testRequest('CUSTOMER'), 'view').authorized, 'Customer role cannot access emergency communications');
  assert(authorizeCommunicationsRequest(testRequest('STEWARD'), 'prepare').authorized, 'Configured operator roles can prepare messages');
  assert(!authorizeCommunicationsRequest(testRequest('STEWARD'), 'approve').authorized, 'Steward role cannot bypass supervisor approval');
  assert(authorizeCommunicationsRequest(testRequest('VENUE_MANAGER'), 'approve').authorized, 'Supervisor role can approve messages');
  assert(authorizeCommunicationsRequest(testRequest('SYSTEM_ADMIN', true), 'manage').authorized, 'Development administrator can manage simulated settings');

  const operator = { id: 'TEST-OPERATOR', email: 'operator@test.local', role: 'GATE_OPERATOR' };
  const supervisor = { id: 'TEST-SUPERVISOR', email: 'supervisor@test.local', role: 'VENUE_MANAGER' };
  const administrator = { id: 'TEST-ADMIN', email: 'admin@test.local', role: 'SYSTEM_ADMIN' };
  const templates = await listCommunicationTemplates({ simulatedOnly: true });
  assert(templates.length >= 4 && templates.some((template) => template.category === 'EMERGENCY'), 'Configurable development templates include an emergency review template');

  const template = await createCommunicationTemplate({
    templateKey: 'TEST_SAFETY_MESSAGE', name: 'Test safety guidance', category: 'SAFETY',
    channel: 'PA_AND_SIGNAGE', titleTemplate: 'Safety notice', bodyTemplate: 'Follow staff instructions.',
  }, administrator, { simulatedOnly: true });
  assert(template.isSimulated && template.isActive, 'System administrator can create a simulated configurable template');

  const draft = await createCommunicationMessage({
    title: 'Emergency test notice', body: 'This is a test-only message.', category: 'EMERGENCY',
    priority: 'CRITICAL', channel: 'PA_AND_SIGNAGE', incidentReference: 'INC-2026-1041',
  }, operator, { simulatedOnly: true });
  assert(draft.status === 'DRAFT' && draft.createdById === operator.id, 'Draft records operator identity and remains unpublished');
  assert(draft.incidentReference === 'INC-2026-1041', 'Message links to the incident management register');
  assert(draft.isSimulated, 'Development message is explicitly marked simulated');

  await expectError(() => createCommunicationMessage({
    title: 'Invalid linked message', body: 'Test', category: 'SAFETY', channel: 'DIGITAL_SIGNAGE',
    incidentReference: 'UNKNOWN-INCIDENT',
  }, operator, { simulatedOnly: true }), 404, 'Unknown incident references are rejected');
  await expectError(() => createCommunicationMessage({
    title: '', body: 'Test', category: 'SAFETY', channel: 'DIGITAL_SIGNAGE',
  }, operator, { simulatedOnly: true }), 400, 'Required message content is validated');
  await expectError(() => createCommunicationMessage({
    title: 'Unauthorized', body: 'Test', category: 'SAFETY', channel: 'DIGITAL_SIGNAGE',
  }, { id: 'TEST-FINANCE', email: 'finance@test.local', role: 'FINANCE_OFFICER' }, { simulatedOnly: true }), 403, 'Only configured operators can prepare messages');

  const submitted = await submitCommunicationForApproval(draft.id, operator, { simulatedOnly: true });
  assert(submitted.status === 'PENDING_APPROVAL', 'Operator can submit a draft to the approval queue');
  await expectError(() => approveCommunicationMessage(draft.id, operator, { simulatedOnly: true }), 403, 'Message creator cannot approve their own emergency message');
  const approved = await approveCommunicationMessage(draft.id, supervisor, { simulatedOnly: true, notes: 'Reviewed by event supervisor.' });
  assert(approved.status === 'APPROVED', 'A different authorized supervisor can approve an emergency message');
  assert(approved.approvals.some((approval) => approval.approverId === supervisor.id), 'Approval decision records responsible supervisor');
  await expectError(() => approveCommunicationMessage(draft.id, supervisor, { simulatedOnly: true }), 409, 'Duplicate approvals are rejected');

  const scheduledDraft = await createCommunicationMessage({
    title: 'Scheduled event update', body: 'Gates open at the scheduled time.',
    category: 'EVENT', priority: 'NORMAL', channel: 'DIGITAL_SIGNAGE',
  }, operator, { simulatedOnly: true });
  await submitCommunicationForApproval(scheduledDraft.id, operator, { simulatedOnly: true });
  await approveCommunicationMessage(scheduledDraft.id, supervisor, { simulatedOnly: true });
  const scheduled = await scheduleCommunicationMessage(scheduledDraft.id, {
    scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }, operator, { simulatedOnly: true });
  assert(scheduled.status === 'SCHEDULED' && scheduled.scheduledAt, 'Approved messages can be scheduled for a future time');
  await expectError(() => publishCommunicationMessage(scheduled.id, supervisor, { simulatedOnly: true }), 400, 'Future scheduled messages cannot publish early');
  const cancelled = await cancelCommunicationMessage(scheduled.id, operator, { simulatedOnly: true });
  assert(cancelled.status === 'CANCELLED' && cancelled.cancelledAt, 'Scheduled messages can be cancelled and timestamped');
  await expectError(() => publishCommunicationMessage(scheduled.id, supervisor, { simulatedOnly: true }), 409, 'Cancelled messages cannot be published');

  const published = await publishCommunicationMessage(draft.id, supervisor, { simulatedOnly: true });
  assert(published.status === 'PUBLISHED' && published.publicationMode === 'SIMULATED_PREVIEW_NO_TRANSMISSION', 'Approved publication is recorded as a simulated preview without hardware transmission');
  await expectError(() => scheduleCommunicationMessage(draft.id, { scheduledAt: new Date(Date.now() + 3600000).toISOString() }, operator, { simulatedOnly: true }), 409, 'Published messages cannot be rescheduled');
  await expectError(() => scheduleCommunicationMessage(draft.id, { scheduledAt: 'invalid' }, operator, { simulatedOnly: true }), 409, 'Only approved messages can be scheduled');

  let insecureEndpointRejected = false;
  try {
    await createCommunicationIntegration({
      systemType: 'PUBLIC_ADDRESS', providerName: 'Test PA', protocol: 'VENDOR_API_HTTPS',
      endpointUrl: 'http://pa.example.test',
    }, administrator, { simulatedOnly: true });
  } catch (error) { insecureEndpointRejected = error instanceof EmergencyCommunicationsError; }
  assert(insecureEndpointRejected, 'Integration setup rejects unencrypted HTTP endpoints');
  const integration = await createCommunicationIntegration({
    systemType: 'DIGITAL_SIGNAGE', providerName: 'Test signage', protocol: 'VENDOR_API_HTTPS',
    endpointUrl: 'https://signage.example.test/api', secretReference: 'vault://stadium/signage',
  }, administrator, { simulatedOnly: true });
  assert(integration.connectionStatus === 'UNVERIFIED' && integration.isSimulated, 'Integration metadata never claims verified physical equipment');
  assert(!('password' in integration) && !('apiKey' in integration), 'Integration records do not accept or persist credentials');

  const policy = await updateCommunicationsPolicy({
    operatorRoles: ['SYSTEM_ADMIN', 'VENUE_MANAGER'],
    supervisorRoles: ['SYSTEM_ADMIN', 'VENUE_MANAGER'],
  }, administrator, { simulatedOnly: true });
  assert(policy.operatorRoles.length === 2, 'System administrator can configure operator and supervisor roles');
  await expectError(() => updateCommunicationsPolicy({
    operatorRoles: ['SYSTEM_ADMIN'], supervisorRoles: ['VENUE_MANAGER'],
  }, administrator, { simulatedOnly: true }), 400, 'System administrator cannot remove all administrator supervisor coverage');
  await updateCommunicationsPolicy({
    operatorRoles: ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD'],
    supervisorRoles: ['SYSTEM_ADMIN', 'VENUE_MANAGER'],
  }, administrator, { simulatedOnly: true });

  const dashboard = await getEmergencyCommunicationsDashboard({ simulatedOnly: true });
  assert(dashboard.adapter.publicAddressConnected === false && dashboard.adapter.digitalSignageConnected === false, 'Dashboard does not claim PA or signage connectivity');
  assert(dashboard.adapter.automaticBroadcastEnabled === false && dashboard.adapter.certifiedAlarmReplacement === false, 'No automatic broadcast or certified alarm replacement is represented');
  assert(dashboard.messages.some((message) => message.messageRef === draft.messageRef && message.status === 'PUBLISHED'), 'Dashboard lists recorded publication status');
  assert(dashboard.integrations.every((item) => item.connectionStatus === 'UNVERIFIED'), 'Provider records remain explicitly unverified');
  assert(dashboard.approvals.some((item) => item.approverId === supervisor.id), 'Dashboard exposes approval history');

  const auditTrail = await getCommunicationsAuditTrail({ simulatedOnly: true });
  assert(auditTrail.length > 0 && verifyCommunicationsAudit(auditTrail), 'Append-only development audit trail has a valid hash chain');
  const tampered = auditTrail.map((record) => ({ ...record }));
  tampered[0].action = 'ALTERED';
  assert(!verifyCommunicationsAudit(tampered), 'Audit verification detects modified records');

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
