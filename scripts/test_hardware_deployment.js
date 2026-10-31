const {
  HARDWARE_CATEGORIES,
  HardwareDeploymentError,
  approveInstallationTask,
  approveCommissioning,
  assertHardwareFacilityOwnership,
  authorizeHardwareRequest,
  createInstallationTask,
  getHardwareDashboard,
  getCommissioningTemplates,
  recordHardwareMaintenance,
  recordInstallationUpdate,
  registerHardware,
  runCommissioningChecklist,
  updateCommissioningTemplate,
} = require('../lib/hardwareDeployment');

let passed = 0;
let failed = 0;

function assert(condition, title) {
  if (condition) {
    console.log(`  [PASS] ${title}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${title}`);
    failed++;
  }
}

async function expectError(operation, description, status = 400) {
  try { await operation(); assert(false, description); }
  catch (error) { assert(error instanceof HardwareDeploymentError && error.status === status, description); }
}

async function run() {
  assert(HARDWARE_CATEGORIES.length === 10 && HARDWARE_CATEGORIES.includes('TICKET_SCANNER'), 'All requested hardware categories are supported');
  const operator = { id: 'TEST-TECHNICIAN', role: 'GATE_OPERATOR' };
  const approver = { id: 'TEST-APPROVER', role: 'SYSTEM_ADMIN' };
  const unauthenticated = authorizeHardwareRequest(new Request('https://localhost/api/hardware-deployment/dashboard'));
  assert(!unauthenticated.authorized && unauthenticated.status === 401, 'Dashboard API requires a signed-in staff session');
  const asset = await registerHardware({
    assetId: 'TEST-HW-CCTV-01', name: 'Test camera record', category: 'CCTV_CAMERA',
    manufacturer: 'Test manufacturer', model: 'Test model', serialNumber: 'TEST-SERIAL',
    installationLocation: 'Test location only', supplier: 'Test supplier',
  }, operator, { simulatedOnly: true });
  assert(asset.commissioningStatus === 'NOT_STARTED' && asset.maintenanceStatus === 'NOT_ASSESSED' && asset.isSimulated, 'Registration does not assume installation or commissioning');
  await expectError(() => registerHardware({ assetId: asset.assetId, name: 'duplicate', category: 'ROUTER' }, operator, { simulatedOnly: true }), 'Duplicate asset IDs are rejected');
  await expectError(() => registerHardware({ assetId: 'TEST-HW-INVALID', name: 'unsupported', category: 'FAKE' }, operator, { simulatedOnly: true }), 'Unknown equipment category is rejected');

  const task = await createInstallationTask({
    assetId: asset.assetId, technicianId: operator.id, title: 'Test installation task', details: 'Test-only installation workflow.',
  }, approver, { simulatedOnly: true });
  assert(task.status === 'PENDING' && task.technicianId === operator.id, 'Installation task records technician responsibility');
  await expectError(() => recordInstallationUpdate({ taskRef: task.taskRef, status: 'IN_PROGRESS', note: 'Wrong technician.' }, { id: 'NOT-ASSIGNED', role: 'STEWARD' }, { simulatedOnly: true }), 'Only assigned technician or manager can update installation progress', 403);
  await recordInstallationUpdate({ taskRef: task.taskRef, status: 'IN_PROGRESS', note: 'Fixture progress note.' }, operator, { simulatedOnly: true });
  await recordInstallationUpdate({ taskRef: task.taskRef, status: 'INSTALLED', note: 'Fixture inspection passed.' }, operator, { simulatedOnly: true });
  assert(asset.installationDate && asset.commissioningStatus === 'IN_PROGRESS', 'Installation completion enables commissioning without acceptance');
  await expectError(() => approveInstallationTask(task.taskRef, { id: operator.id, role: 'VENUE_MANAGER' }, { simulatedOnly: true }), 'Assigned technician cannot approve own installation', 403);
  const taskApproval = await approveInstallationTask(task.taskRef, approver, { simulatedOnly: true });
  assert(taskApproval.approvalById === approver.id, 'Separate manager records installation inspection approval');

  const template = (await getCommissioningTemplates({ simulatedOnly: true })).find((entry) => entry.category === 'CCTV_CAMERA');
  const allPassed = template.checks.map(({ key }) => ({ key, passed: true, notes: 'Test fixture verification.' }));
  const result = await runCommissioningChecklist({ assetId: asset.assetId, checks: allPassed }, operator, { simulatedOnly: true });
  assert(result.status === 'PASSED' && result.checksRecorded === template.checks.length, 'Category commissioning checklist records required generic and device-specific checks');
  await expectError(() => approveCommissioning(asset.assetId, operator, { simulatedOnly: true }), 'Checklist author cannot self-approve acceptance', 403);
  const accepted = await approveCommissioning(asset.assetId, approver, { simulatedOnly: true });
  assert(accepted.commissioningStatus === 'APPROVED', 'Separate authorized manager can approve successful commissioning');

  const replacement = await registerHardware({
    assetId: 'TEST-HW-CCTV-02', name: 'Test replacement camera', category: 'CCTV_CAMERA',
  }, operator, { simulatedOnly: true });
  const replacementRecord = await recordHardwareMaintenance({
    assetId: asset.assetId,
    replacementAssetId: replacement.assetId,
    recordType: 'REPLACEMENT',
    status: 'COMPLETED',
    details: 'Test replacement history.',
  }, approver, { simulatedOnly: true });
  assert(replacementRecord.replacementAssetId === replacement.assetId, 'Maintenance history links the replaced asset to its replacement');
  await expectError(() => updateCommissioningTemplate({
    category: 'CCTV_CAMERA', checks: [{ key: 'ONLY_CUSTOM', label: 'No mandatory verification' }],
  }, approver, { simulatedOnly: true }), 'Checklist templates retain required safety and verification checks');
  const configuredTemplate = await updateCommissioningTemplate({
    category: 'ROUTER',
    checks: [
      { key: 'POWER_VERIFIED', label: 'Power check' },
      { key: 'NETWORK_VERIFIED', label: 'Network check' },
      { key: 'CONFIGURATION_VERIFIED', label: 'Configuration check' },
      { key: 'SECURITY_VERIFIED', label: 'Security check' },
      { key: 'FUNCTIONAL_TEST', label: 'Function test' },
      { key: 'ROUTER_POLICY_SIGNOFF', label: 'Approved routing policy' },
    ],
  }, approver, { simulatedOnly: true });
  assert(configuredTemplate.checks.length === 6, 'Category-specific commissioning templates can be configured');
  const dashboard = await getHardwareDashboard({ simulatedOnly: true });
  assert(dashboard.metrics.totalAssets === 2 && dashboard.metrics.commissioned === 1, 'Dashboard aggregates explicitly registered records');
  assert(dashboard.assets.some((item) => item.isSimulated), 'Development/test inventory is labelled simulated');
  await registerHardware({
    assetId: 'TEST-HW-OTHER-FACILITY', name: 'Other facility fixture', category: 'ROUTER',
    facilityId: 'TEST-OTHER-FACILITY',
  }, operator, { simulatedOnly: true });
  const otherFacilityAssets = await getHardwareDashboard({ simulatedOnly: true, facilityId: 'TEST-OTHER-FACILITY' });
  assert(otherFacilityAssets.assets.length === 1 && otherFacilityAssets.assets[0].assetId === 'TEST-HW-OTHER-FACILITY', 'Hardware dashboard isolates inventory by facility');
  assert(!otherFacilityAssets.assets.some((item) => item.assetId === asset.assetId), 'Hardware records from Talanta are not visible in another facility');
  await assertHardwareFacilityOwnership({ assetId: 'TEST-HW-OTHER-FACILITY', facilityId: 'TEST-OTHER-FACILITY', simulatedOnly: true });
  await expectError(() => assertHardwareFacilityOwnership({ assetId: 'TEST-HW-OTHER-FACILITY', facilityId: 'FACILITY-TALANTA-STADIUM', simulatedOnly: true }), 'Cross-facility hardware actions are rejected', 404);

  console.log(`Results: ${passed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
