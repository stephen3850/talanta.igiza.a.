CREATE TABLE "data_inventory_items" (
    "id" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "purposes" JSONB NOT NULL,
    "modules" JSONB NOT NULL,
    "systems" JSONB NOT NULL,
    "thirdParties" JSONB NOT NULL,
    "classification" TEXT NOT NULL DEFAULT 'INTERNAL',
    "ownerRole" TEXT NOT NULL DEFAULT 'SYSTEM_ADMIN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "data_inventory_items_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "data_inventory_items_categoryKey_key" ON "data_inventory_items"("categoryKey");
CREATE INDEX "data_inventory_items_classification_active_idx" ON "data_inventory_items"("classification", "active");

CREATE TABLE "governance_processors" (
    "id" TEXT NOT NULL,
    "providerKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "categories" JSONB NOT NULL,
    "purpose" TEXT NOT NULL,
    "systems" JSONB NOT NULL,
    "integrationStatus" TEXT NOT NULL DEFAULT 'PENDING_REVIEW',
    "agreementStatus" TEXT NOT NULL DEFAULT 'REVIEW_REQUIRED',
    "responsibleAdminId" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "governance_processors_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "governance_processors_providerKey_key" ON "governance_processors"("providerKey");
CREATE INDEX "governance_processors_integrationStatus_agreementStatus_idx" ON "governance_processors"("integrationStatus", "agreementStatus");

CREATE TABLE "privacy_notices" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "legalBasis" TEXT NOT NULL DEFAULT 'REQUIRES_REVIEW',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "privacy_notices_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "privacy_notices_version_key" ON "privacy_notices"("version");
CREATE INDEX "privacy_notices_status_publishedAt_idx" ON "privacy_notices"("status", "publishedAt");

CREATE TABLE "privacy_consents" (
    "id" TEXT NOT NULL,
    "subjectHash" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "noticeVersion" TEXT NOT NULL,
    "legalBasis" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'GRANTED',
    "recordedById" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3),
    "withdrawnAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "privacy_consents_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "privacy_consents_subjectHash_status_idx" ON "privacy_consents"("subjectHash", "status");
CREATE INDEX "privacy_consents_categoryKey_createdAt_idx" ON "privacy_consents"("categoryKey", "createdAt");

CREATE TABLE "data_subject_requests" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "subjectContactCiphertext" TEXT NOT NULL,
    "contactHint" TEXT NOT NULL,
    "requestedCategories" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "assignedToId" TEXT,
    "notes" TEXT,
    "preservationHold" BOOLEAN NOT NULL DEFAULT false,
    "holdReason" TEXT,
    "dueAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "data_subject_requests_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "data_subject_requests_reference_key" ON "data_subject_requests"("reference");
CREATE INDEX "data_subject_requests_status_createdAt_idx" ON "data_subject_requests"("status", "createdAt");
CREATE INDEX "data_subject_requests_assignedToId_status_idx" ON "data_subject_requests"("assignedToId", "status");

CREATE TABLE "retention_policies" (
    "id" TEXT NOT NULL,
    "categoryKey" TEXT NOT NULL,
    "retentionDays" INTEGER NOT NULL,
    "reviewCycleDays" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "preservationHold" BOOLEAN NOT NULL DEFAULT false,
    "preservationReason" TEXT,
    "approvedById" TEXT NOT NULL,
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "retention_policies_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "retention_policies_categoryKey_key" ON "retention_policies"("categoryKey");
CREATE INDEX "retention_policies_enabled_nextReviewAt_idx" ON "retention_policies"("enabled", "nextReviewAt");

CREATE TABLE "retention_reviews" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "recordReference" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "preservationHold" BOOLEAN NOT NULL DEFAULT false,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "retention_reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "retention_reviews_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "retention_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "retention_reviews_policyId_recordReference_createdAt_idx" ON "retention_reviews"("policyId", "recordReference", "createdAt");
CREATE INDEX "retention_reviews_action_createdAt_idx" ON "retention_reviews"("action", "createdAt");

CREATE TABLE "governance_access_audits" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "result" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "governance_access_audits_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "governance_access_audits_actorId_createdAt_idx" ON "governance_access_audits"("actorId", "createdAt");
CREATE INDEX "governance_access_audits_entityType_createdAt_idx" ON "governance_access_audits"("entityType", "createdAt");
