// Automated Financial Management & Revenue Reconciliation Test Suite
// ST-Tech ICT Consultants - Talanta Stadium Infrastructure

const {
  validateStatementImport,
  evaluateStatementMatch,
  validateRevenueRecord,
  validateAdjustment,
  validateRefundRequest,
  toCsvCell,
  statusIsFinal,
} = require('../lib/financialManagement');

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

async function runFinanceTestSuite() {
  console.log('----------------------------------------------------');
  console.log('TEST GROUP: ENTERPRISE FINANCIAL MANAGEMENT & RECONCILIATION');
  console.log('----------------------------------------------------\n');

  // 1. Statement Import & Line Validation
  console.log('--- 1. Provider Statement & Validation Controls ---');
  const validImportPayload = {
    statementReference: 'STMT-MPESA-2026-10-31',
    verificationNote: 'Attested by Chief Finance Officer following monthly statement review.',
    verified: true,
    provider: 'M-PESA',
    lines: [
      { providerReference: 'QEK78910AB', amount: 2500, currency: 'KES', status: 'SUCCESSFUL', transactionAt: '2026-10-31T10:00:00Z' },
      { providerReference: 'QEK78911CD', amount: 5000, currency: 'KES', status: 'SUCCESSFUL', transactionAt: '2026-10-31T11:00:00Z' },
    ],
  };

  const parsedImport = validateStatementImport(validImportPayload);
  assert(parsedImport.statementReference === 'STMT-MPESA-2026-10-31', 'Valid provider statement payload correctly parsed');
  assert(parsedImport.lines.length === 2, 'Parsed 2 statement lines from attestation payload');

  // Test un-attested import rejection
  let unverifiedError = null;
  try {
    validateStatementImport({ ...validImportPayload, verified: false });
  } catch (err) {
    unverifiedError = err;
  }
  assert(unverifiedError !== null, 'Import fails if finance officer attestation is missing');

  // Test duplicate statement line detection inside payload
  let duplicateLineError = null;
  try {
    validateStatementImport({
      ...validImportPayload,
      lines: [
        { providerReference: 'DUP123', amount: 1000, currency: 'KES', status: 'SUCCESSFUL' },
        { providerReference: 'DUP123', amount: 1000, currency: 'KES', status: 'SUCCESSFUL' },
      ],
    });
  } catch (err) {
    duplicateLineError = err;
  }
  assert(duplicateLineError !== null && duplicateLineError.message.includes('duplicate'), 'Duplicate provider references inside statement payload are blocked');

  // 2. Statement Matching Logic
  console.log('\n--- 2. Payment Reconciliation & Matching Engine ---');
  const mockPayment = {
    id: 'PAY-1001',
    paymentRef: 'TLN-PAY-1001',
    amount: 2500,
    currency: 'KES',
    status: 'SUCCESSFUL',
    mpesaReceipt: 'QEK78910AB',
    reconciliation: null,
  };

  const lineMatch = evaluateStatementMatch(
    { providerReference: 'QEK78910AB', amount: 2500, currency: 'KES', providerStatus: 'SUCCESSFUL' },
    mockPayment
  );
  assert(lineMatch.matchStatus === 'MATCHED', 'Provider receipt matching payment reference and amount yields MATCHED status');

  const amountMismatch = evaluateStatementMatch(
    { providerReference: 'QEK78910AB', amount: 3000, currency: 'KES', providerStatus: 'SUCCESSFUL' },
    mockPayment
  );
  assert(amountMismatch.matchStatus === 'AMOUNT_MISMATCH', 'Mismatching statement line amount produces AMOUNT_MISMATCH');

  const alreadyReconciledMatch = evaluateStatementMatch(
    { providerReference: 'QEK78910AB', amount: 2500, currency: 'KES', providerStatus: 'SUCCESSFUL' },
    { ...mockPayment, reconciliation: { id: 'REC-001' } }
  );
  assert(alreadyReconciledMatch.matchStatus === 'UNMATCHED' && alreadyReconciledMatch.matchReason === 'PAYMENT_ALREADY_RECONCILED', 'Already reconciled payment prevents duplicate reconciliation');

  // 3. Revenue Records & Categories
  console.log('\n--- 3. Stadium Revenue Management & Categories ---');
  const validRevenueInput = {
    amount: 150000,
    paymentMethod: 'M-PESA',
    categoryId: 'CAT-CONCESSIONS-01',
    description: 'Quarterly concessions stadium revenue',
    eventId: 'EVT-STAD-001',
  };
  const validatedRevenue = validateRevenueRecord(validRevenueInput, 'FAC-TALANTA-MAIN');
  assert(validatedRevenue.amount === 150000, 'Revenue record amount validated');
  assert(validatedRevenue.status === 'PENDING_APPROVAL', 'Revenue entry defaults to PENDING_APPROVAL for second-person review');
  assert(validatedRevenue.reference.startsWith('REV-'), 'Generates unique REV- reference');

  // 4. Financial Controls & Maker-Checker Immutability
  console.log('\n--- 4. Financial Controls & Segregation of Duties ---');
  const validAdjustmentInput = {
    amount: -12500.50,
    reason: 'Correction for over-credited ticketing line item during Kenya vs Uganda match',
    eventId: 'EVT-STAD-001',
  };
  const validatedAdj = validateAdjustment(validAdjustmentInput, 'FAC-TALANTA-MAIN');
  assert(validatedAdj.amount === -12500.50, 'Signed adjustment amount validated');
  assert(validatedAdj.reason.includes('Correction for over-credited'), 'Mandatory adjustment reason captured');

  assert(statusIsFinal('APPROVED') === true, 'APPROVED status marked as final and immutable');
  assert(statusIsFinal('REJECTED') === true, 'REJECTED status marked as final and immutable');
  assert(statusIsFinal('PENDING_APPROVAL') === false, 'PENDING_APPROVAL status permits pending maker-checker review');

  // 5. Controlled Refund Request Workflow
  console.log('\n--- 5. Refund Request Workflow & Provider Confirmation ---');
  const validRefundInput = {
    paymentId: 'PAY-1001',
    amount: 2500,
    reason: 'Event rescheduled and attendee requested full ticket refund',
  };
  const validatedRefund = validateRefundRequest(validRefundInput);
  assert(validatedRefund.amount === 2500, 'Refund request amount validated');
  assert(validatedRefund.reason.length > 5, 'Refund reason required and recorded');

  // 6. Report Security & CSV Export Escaping
  console.log('\n--- 6. Financial Reporting & CSV Security ---');
  const rawFormulaCell = '=CMD|"/C calc"!A0';
  const escapedCell = toCsvCell(rawFormulaCell);
  assert(escapedCell.includes("'=CMD"), 'CSV cell with formula injection risk is properly prefixed with single quote');

  console.log(`\nFinance Test Suite Complete: Passed ${passed} / ${passed + failed}`);
  if (failed > 0) {
    throw new Error(`Financial management test suite failed with ${failed} failure(s).`);
  }

  return { passedCount: passed, failedCount: failed, totalTests: passed + failed };
}

if (require.main === module) {
  runFinanceTestSuite().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runFinanceTestSuite };
