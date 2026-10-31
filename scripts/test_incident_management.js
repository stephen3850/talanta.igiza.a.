// Automated Test Suite for Incident & Emergency Management System
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure
// Prompt 24 Validation Runner

const {
  INCIDENT_CATEGORIES,
  INCIDENT_STATUSES,
  INCIDENT_PRIORITIES,
  responseTeams,
  emergencyProcedures,
  emergencyContactDirectory,
  initialIncidents,
  createIncidentRecord,
  updateIncidentStatus,
  dispatchEmergencyNotification,
  calculateIncidentMetrics,
  runIncidentSystemDiagnostics,
} = require('../lib/incidentManagement');

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
  console.log('TALANTA STADIUM INCIDENT & EMERGENCY MANAGEMENT TEST SUITE');
  console.log('================================================================\n');

  // Test Group 1: Supported Incident Categories (Requirement 3)
  console.log('--- TEST GROUP 1: INCIDENT CATEGORIES VERIFICATION ---');
  assert(INCIDENT_CATEGORIES.length >= 9, `9 Incident categories supported (Found: ${INCIDENT_CATEGORIES.length})`);
  const requiredCategories = [
    'MEDICAL',
    'FIRE',
    'SECURITY',
    'CROWD_CONGESTION',
    'INFRASTRUCTURE_FAILURE',
    'POWER_INTERRUPTION',
    'WATER_RELATED',
    'EQUIPMENT_FAILURE',
    'OTHER_OPERATIONAL',
  ];
  requiredCategories.forEach((cat) => {
    const found = INCIDENT_CATEGORIES.some((c) => c.id === cat);
    assert(found, `Category verified: ${cat}`);
  });

  // Test Group 2: Incident Creation & Field Capture (Requirement 4)
  console.log('\n--- TEST GROUP 2: INCIDENT CREATION & DATA MINIMIZATION ---');
  const incident = await createIncidentRecord({
    category: 'FIRE',
    title: 'Concession Stand Grill Flare-Up',
    description: 'Minor grease flare-up in concession stand B2. Controlled with dry chemical extinguisher.',
    zoneLocation: 'Concourse West Concession Bay B2',
    priority: 'HIGH',
    reportedByName: 'Steward Chief Ochieng',
    reportedByRole: 'STEWARD',
    reportedByContact: '+254 722 999 888',
    assignedTeamId: 'TEAM-SEC-01',
    initialNote: 'Fire extinguished. Inspecting ventilation hood before reopening.',
  });
  assert(!!incident && incident.id.startsWith('INC-2026-'), `Incident record created: ${incident.id}`);
  assert(incident.category === 'FIRE', 'Incident category correctly captured');
  assert(incident.status === 'ASSIGNED', 'Status correctly initialized to ASSIGNED when team is specified');
  assert(incident.timestamps.reportedAt !== null, 'Reported timestamp recorded');
  assert(incident.assignedTeam.id === 'TEAM-SEC-01', 'Assigned team correctly recorded');
  assert(incident.responseNotes.length === 1, 'Initial response note logged');

  // Test Group 3: Status Workflow Pipeline (Requirement 5)
  console.log('\n--- TEST GROUP 3: INCIDENT STATUS WORKFLOW PIPELINE ---');
  // Transition: ASSIGNED -> IN_PROGRESS
  const inProgressRes = await updateIncidentStatus({
    incidentId: incident.id,
    newStatus: 'IN_PROGRESS',
    noteText: 'Response unit on scene. Inspecting ductwork.',
  });
  assert(inProgressRes.success === true, 'Transition to IN_PROGRESS succeeded');
  assert(inProgressRes.incident.timestamps.onSceneAt !== null, 'onSceneAt milestone timestamp recorded');

  // Transition: IN_PROGRESS -> ESCALATED
  const escalateRes = await updateIncidentStatus({
    incidentId: incident.id,
    newStatus: 'ESCALATED',
    escalationDetails: {
      escalateTo: 'Nairobi City County Fire Brigade',
      reason: 'Duct thermal sensor reports elevated temperature',
      tacticalDirectives: 'Standby at Outer Gate B Access Point',
    },
    noteText: 'Escalated to municipal fire dispatch.',
  });
  assert(escalateRes.success === true, 'Transition to ESCALATED succeeded');
  assert(escalateRes.incident.priority === 'CRITICAL', 'Priority elevated to CRITICAL upon escalation');
  assert(!!escalateRes.incident.escalationRecord, 'Escalation record created and attached');

  // Transition: ESCALATED -> RESOLVED
  const resolveRes = await updateIncidentStatus({
    incidentId: incident.id,
    newStatus: 'RESOLVED',
    resolutionDetails: {
      resolvedBy: 'Fire Marshal Lead',
      resolutionSummary: 'Duct temperature normalized. Thermal imaging clear. Booth cleared to reopen.',
      rootCause: 'Excess grease accumulation in exhaust filter',
      preventativeAction: 'Mandatory daily filter degreasing checklist',
      signOffOfficer: 'Head of Facilities & Engineering',
    },
    noteText: 'Thermal imaging clear. Incident resolved.',
  });
  assert(resolveRes.success === true, 'Transition to RESOLVED succeeded');
  assert(resolveRes.incident.timestamps.resolvedAt !== null, 'resolvedAt milestone timestamp recorded');
  assert(!!resolveRes.incident.resolution, 'Resolution details and root cause recorded');

  // Transition: RESOLVED -> CLOSED
  const closeRes = await updateIncidentStatus({
    incidentId: incident.id,
    newStatus: 'CLOSED',
    noteText: 'Final post-incident review completed.',
  });
  assert(closeRes.success === true, 'Transition to CLOSED succeeded');
  assert(closeRes.incident.timestamps.closedAt !== null, 'closedAt milestone timestamp recorded');

  // Test Group 4: Emergency Multi-Channel Communication (Requirement 7)
  console.log('\n--- TEST GROUP 4: EMERGENCY COMMUNICATION DISPATCH ---');
  const commRes = await dispatchEmergencyNotification({
    incidentId: incident.id,
    recipientGroup: 'STADIUM_SECURITY',
    channel: 'SMS_AND_RADIO',
    message: 'Test Emergency Broadcast from EOC Kasarani/Talanta.',
  });
  assert(commRes.recorded === true && commRes.delivered === false, 'Emergency communication recorded without dispatching');
  assert(commRes.commRecord.deliveryStatus === 'SIMULATED_NOT_SENT' && commRes.commRecord.isSimulated, 'No provider delivery is claimed');
  assert(commRes.commRecord.latencyMs === null, 'No fabricated delivery latency is recorded');

  // Test Group 5: Do not expose unverified venue emergency instructions or contacts.
  console.log('\n--- TEST GROUP 5: VERIFIED EMERGENCY PROCEDURE CONFIGURATION ---');
  assert(emergencyProcedures.length === 0, 'No venue-specific emergency SOPs are published until approved records are configured');
  assert(emergencyContactDirectory.length === 0, 'No unverified emergency contact directory entries are published');

  // Test Group 6: Reporting & Metrics (Requirement 10)
  console.log('\n--- TEST GROUP 6: REPORTING & RESPONSE TIME METRICS ---');
  const metrics = calculateIncidentMetrics();
  assert(metrics.total > 0, `Total incidents counted: ${metrics.total}`);
  assert(typeof metrics.avgTtaMinutes === 'number', `Average Time to Acknowledge (TTA): ${metrics.avgTtaMinutes} min`);
  assert(typeof metrics.avgTtrMinutes === 'number', `Average Time to Resolve (TTR): ${metrics.avgTtrMinutes} min`);
  assert(typeof metrics.open === 'number', `Open incidents: ${metrics.open}`);
  assert(typeof metrics.resolved === 'number', `Resolved incidents: ${metrics.resolved}`);

  // Test Group 7: System Diagnostic Runner
  console.log('\n--- TEST GROUP 7: SYSTEM DIAGNOSTIC RUNNER ---');
  const diag = await runIncidentSystemDiagnostics();
  assert(diag.totalTests >= 6, `Diagnostic runner executed ${diag.totalTests} tests`);
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
