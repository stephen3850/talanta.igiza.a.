CREATE TABLE "revenue_categories" (
    "id" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "revenue_categories_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "revenue_categories_categoryKey_key" ON "revenue_categories"("categoryKey");

CREATE TABLE "revenue_records" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "eventId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "paymentMethod" TEXT NOT NULL,
    "sourceReference" TEXT,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "rejectedById" TEXT,
    "rejectionReason" TEXT,
    "isSimulated" BOOLEAN NOT NULL DEFAULT false,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "revenue_records_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "revenue_records_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "revenue_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "revenue_records_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "revenue_records_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "revenue_records_reference_key" ON "revenue_records"("reference");
CREATE UNIQUE INDEX "revenue_records_sourceReference_key" ON "revenue_records"("sourceReference");
CREATE INDEX "revenue_records_facilityId_status_occurredAt_idx" ON "revenue_records"("facilityId", "status", "occurredAt");
CREATE INDEX "revenue_records_eventId_status_occurredAt_idx" ON "revenue_records"("eventId", "status", "occurredAt");
CREATE INDEX "revenue_records_categoryId_occurredAt_idx" ON "revenue_records"("categoryId", "occurredAt");

CREATE TABLE "financial_adjustments" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "eventId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "createdById" TEXT NOT NULL,
    "approvedById" TEXT,
    "rejectedById" TEXT,
    "rejectionReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "financial_adjustments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "financial_adjustments_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "financial_adjustments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "financial_adjustments_reference_key" ON "financial_adjustments"("reference");
CREATE INDEX "financial_adjustments_facilityId_status_createdAt_idx" ON "financial_adjustments"("facilityId", "status", "createdAt");
CREATE INDEX "financial_adjustments_eventId_status_createdAt_idx" ON "financial_adjustments"("eventId", "status", "createdAt");

CREATE TABLE "reconciliation_batches" (
    "id" TEXT NOT NULL,
    "statementReference" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'M-PESA',
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "facilityId" TEXT,
    "verifiedById" TEXT NOT NULL,
    "verificationNote" TEXT NOT NULL,
    "lineCount" INTEGER NOT NULL,
    "matchedCount" INTEGER NOT NULL DEFAULT 0,
    "unmatchedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "reconciliation_batches_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reconciliation_batches_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "reconciliation_batches_provider_statementReference_key" ON "reconciliation_batches"("provider", "statementReference");
CREATE INDEX "reconciliation_batches_createdAt_provider_idx" ON "reconciliation_batches"("createdAt", "provider");
CREATE INDEX "reconciliation_batches_facilityId_createdAt_idx" ON "reconciliation_batches"("facilityId", "createdAt");

CREATE TABLE "provider_statement_lines" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "providerReference" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "providerStatus" TEXT NOT NULL,
    "matchStatus" TEXT NOT NULL DEFAULT 'UNMATCHED',
    "matchReason" TEXT,
    "paymentId" TEXT,
    "transactionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "provider_statement_lines_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "provider_statement_lines_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "reconciliation_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "provider_statement_lines_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "provider_statement_lines_providerReference_key" ON "provider_statement_lines"("providerReference");
CREATE UNIQUE INDEX "provider_statement_lines_paymentId_key" ON "provider_statement_lines"("paymentId");
CREATE INDEX "provider_statement_lines_batchId_matchStatus_idx" ON "provider_statement_lines"("batchId", "matchStatus");
CREATE INDEX "provider_statement_lines_matchStatus_transactionAt_idx" ON "provider_statement_lines"("matchStatus", "transactionAt");

CREATE TABLE "payment_reconciliations" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "statementLineId" TEXT NOT NULL,
    "providerReference" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "reconciledById" TEXT NOT NULL,
    "reconciledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payment_reconciliations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payment_reconciliations_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payment_reconciliations_statementLineId_fkey" FOREIGN KEY ("statementLineId") REFERENCES "provider_statement_lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "payment_reconciliations_paymentId_key" ON "payment_reconciliations"("paymentId");
CREATE UNIQUE INDEX "payment_reconciliations_statementLineId_key" ON "payment_reconciliations"("statementLineId");
CREATE UNIQUE INDEX "payment_reconciliations_providerReference_key" ON "payment_reconciliations"("providerReference");
CREATE INDEX "payment_reconciliations_reconciledAt_idx" ON "payment_reconciliations"("reconciledAt");

CREATE TABLE "refund_requests" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "requestedById" TEXT NOT NULL,
    "approvedById" TEXT,
    "rejectedById" TEXT,
    "providerRefundReference" TEXT,
    "providerConfirmation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "refund_requests_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "refund_requests_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "refund_requests_reference_key" ON "refund_requests"("reference");
CREATE UNIQUE INDEX "refund_requests_providerRefundReference_key" ON "refund_requests"("providerRefundReference");
CREATE INDEX "refund_requests_paymentId_status_idx" ON "refund_requests"("paymentId", "status");
CREATE INDEX "refund_requests_status_createdAt_idx" ON "refund_requests"("status", "createdAt");

CREATE TABLE "financial_audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "facilityId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "financial_audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "financial_audit_logs_actorId_createdAt_idx" ON "financial_audit_logs"("actorId", "createdAt");
CREATE INDEX "financial_audit_logs_entityType_createdAt_idx" ON "financial_audit_logs"("entityType", "createdAt");
CREATE INDEX "financial_audit_logs_facilityId_createdAt_idx" ON "financial_audit_logs"("facilityId", "createdAt");
