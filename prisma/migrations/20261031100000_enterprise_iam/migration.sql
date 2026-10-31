ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF_MEMBER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CONTRACTOR';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MAINTENANCE_TECHNICIAN';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SECURITY_SUPERVISOR';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'TICKETING_OFFICER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STADIUM_ADMINISTRATOR';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'OPERATIONS_MANAGER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PLATFORM_ADMINISTRATOR';

CREATE TABLE "iam_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddressHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    CONSTRAINT "iam_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "iam_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "iam_sessions_tokenHash_key" ON "iam_sessions"("tokenHash");
CREATE INDEX "iam_sessions_userId_revokedAt_expiresAt_idx" ON "iam_sessions"("userId", "revokedAt", "expiresAt");

CREATE TABLE "mfa_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "secretCiphertext" TEXT NOT NULL,
    "enabledAt" TIMESTAMP(3),
    "lastTotpCounter" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "mfa_credentials_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "mfa_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "mfa_credentials_userId_key" ON "mfa_credentials"("userId");

CREATE TABLE "mfa_recovery_codes" (
    "id" TEXT NOT NULL,
    "credentialId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "mfa_recovery_codes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "mfa_recovery_codes_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "mfa_credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "mfa_recovery_codes_codeHash_key" ON "mfa_recovery_codes"("codeHash");
CREATE INDEX "mfa_recovery_codes_credentialId_consumedAt_idx" ON "mfa_recovery_codes"("credentialId", "consumedAt");

CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");
CREATE INDEX "password_reset_tokens_userId_usedAt_expiresAt_idx" ON "password_reset_tokens"("userId", "usedAt", "expiresAt");

CREATE TABLE "identity_providers" (
    "id" TEXT NOT NULL,
    "providerKey" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "protocol" TEXT NOT NULL,
    "issuerUrl" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "secretReference" TEXT NOT NULL,
    "scopes" TEXT NOT NULL DEFAULT 'openid profile email',
    "status" TEXT NOT NULL DEFAULT 'PENDING_CONFIGURATION',
    "configuredById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "identity_providers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "identity_providers_providerKey_key" ON "identity_providers"("providerKey");
CREATE INDEX "identity_providers_protocol_status_idx" ON "identity_providers"("protocol", "status");
