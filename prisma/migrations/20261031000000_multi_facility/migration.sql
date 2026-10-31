CREATE TYPE "FacilityType" AS ENUM ('STADIUM', 'TRAINING_FACILITY', 'PARKING_FACILITY', 'SPORTS_FACILITY', 'OTHER');

CREATE TABLE "facilities" (
    "id" TEXT NOT NULL,
    "facilityCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "FacilityType" NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Africa/Nairobi',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "operationalInfo" TEXT,
    "isDevelopmentSample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "facilities_facilityCode_key" ON "facilities"("facilityCode");
CREATE INDEX "facilities_type_status_idx" ON "facilities"("type", "status");

INSERT INTO "facilities" ("id", "facilityCode", "name", "description", "type", "timezone", "status", "isDevelopmentSample", "updatedAt")
VALUES ('FACILITY-TALANTA-STADIUM', 'TALANTA-STADIUM', 'Talanta Stadium', 'Existing primary facility record retained during multi-facility migration.', 'STADIUM', 'Africa/Nairobi', 'ACTIVE', false, CURRENT_TIMESTAMP);

CREATE TABLE "facility_memberships" (
    "id" TEXT NOT NULL,
    "facilityId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "facility_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "facility_memberships_facilityId_userId_key" ON "facility_memberships"("facilityId", "userId");
DROP INDEX "network_segments_segmentKey_key";
CREATE INDEX "facility_memberships_userId_isActive_idx" ON "facility_memberships"("userId", "isActive");
CREATE INDEX "facility_memberships_facilityId_role_isActive_idx" ON "facility_memberships"("facilityId", "role", "isActive");

INSERT INTO "facility_memberships" ("id", "facilityId", "userId", "role", "updatedAt")
SELECT md5('FACILITY-TALANTA-STADIUM:' || "id"), 'FACILITY-TALANTA-STADIUM', "id", "role"::TEXT, CURRENT_TIMESTAMP
FROM "users"
WHERE "role"::TEXT <> 'CUSTOMER';

ALTER TABLE "events" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "staff_accreditations" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "iot_devices" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "camera_records" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "network_infrastructure_devices" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "camera_vms_integrations" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "wireless_controller_integrations" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "guest_wifi_policies" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "network_segments" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "wifi_usage_aggregates" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "access_control_points" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "access_control_integrations" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "emergency_communication_messages" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "emergency_communication_integrations" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "security_events" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "security_alerts" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "security_incidents" ADD COLUMN "facilityId" TEXT;
ALTER TABLE "hardware_assets" ADD COLUMN "facilityId" TEXT;

UPDATE "events" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "staff_accreditations" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "iot_devices" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "camera_records" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "network_infrastructure_devices" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "camera_vms_integrations" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "wireless_controller_integrations" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "guest_wifi_policies" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "network_segments" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "wifi_usage_aggregates" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "access_control_points" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "access_control_integrations" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "emergency_communication_messages" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "emergency_communication_integrations" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "security_events" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "security_alerts" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "security_incidents" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';
UPDATE "hardware_assets" SET "facilityId" = 'FACILITY-TALANTA-STADIUM';

ALTER TABLE "events" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "staff_accreditations" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "iot_devices" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "camera_records" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "network_infrastructure_devices" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "camera_vms_integrations" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "wireless_controller_integrations" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "guest_wifi_policies" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "network_segments" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "wifi_usage_aggregates" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "access_control_points" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "access_control_integrations" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "emergency_communication_messages" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "emergency_communication_integrations" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "security_events" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "security_alerts" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "security_incidents" ALTER COLUMN "facilityId" SET NOT NULL;
ALTER TABLE "hardware_assets" ALTER COLUMN "facilityId" SET NOT NULL;

ALTER TABLE "events" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "staff_accreditations" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "iot_devices" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "camera_records" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "network_infrastructure_devices" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "camera_vms_integrations" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "wireless_controller_integrations" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "guest_wifi_policies" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "network_segments" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "wifi_usage_aggregates" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "access_control_points" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "access_control_integrations" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "emergency_communication_messages" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "emergency_communication_integrations" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "security_events" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "security_alerts" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "security_incidents" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';
ALTER TABLE "hardware_assets" ALTER COLUMN "facilityId" SET DEFAULT 'FACILITY-TALANTA-STADIUM';

ALTER TABLE "facility_memberships" ADD CONSTRAINT "facility_memberships_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "facility_memberships" ADD CONSTRAINT "facility_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "events" ADD CONSTRAINT "events_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "staff_accreditations" ADD CONSTRAINT "staff_accreditations_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "iot_devices" ADD CONSTRAINT "iot_devices_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "camera_records" ADD CONSTRAINT "camera_records_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "network_infrastructure_devices" ADD CONSTRAINT "network_infrastructure_devices_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "camera_vms_integrations" ADD CONSTRAINT "camera_vms_integrations_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wireless_controller_integrations" ADD CONSTRAINT "wireless_controller_integrations_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "guest_wifi_policies" ADD CONSTRAINT "guest_wifi_policies_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "network_segments" ADD CONSTRAINT "network_segments_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "wifi_usage_aggregates" ADD CONSTRAINT "wifi_usage_aggregates_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "access_control_points" ADD CONSTRAINT "access_control_points_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "access_control_integrations" ADD CONSTRAINT "access_control_integrations_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "emergency_communication_messages" ADD CONSTRAINT "emergency_communication_messages_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "emergency_communication_integrations" ADD CONSTRAINT "emergency_communication_integrations_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "security_alerts" ADD CONSTRAINT "security_alerts_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "security_incidents" ADD CONSTRAINT "security_incidents_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "hardware_assets" ADD CONSTRAINT "hardware_assets_facilityId_fkey" FOREIGN KEY ("facilityId") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "events_facilityId_status_startDate_idx" ON "events"("facilityId", "status", "startDate");
CREATE INDEX "staff_accreditations_facilityId_status_validUntil_idx" ON "staff_accreditations"("facilityId", "status", "validUntil");
CREATE INDEX "iot_devices_facilityId_status_category_idx" ON "iot_devices"("facilityId", "status", "category");
CREATE INDEX "camera_records_facilityId_operationalStatus_idx" ON "camera_records"("facilityId", "operationalStatus");
CREATE INDEX "network_infrastructure_devices_facilityId_category_operationalStatus_idx" ON "network_infrastructure_devices"("facilityId", "category", "operationalStatus");
CREATE INDEX "camera_vms_integrations_facilityId_connectionStatus_idx" ON "camera_vms_integrations"("facilityId", "connectionStatus");
CREATE INDEX "wireless_controller_integrations_facilityId_connectionStatus_idx" ON "wireless_controller_integrations"("facilityId", "connectionStatus");
CREATE INDEX "guest_wifi_policies_facilityId_status_idx" ON "guest_wifi_policies"("facilityId", "status");
CREATE INDEX "network_segments_facilityId_status_idx" ON "network_segments"("facilityId", "status");
CREATE UNIQUE INDEX "network_segments_facilityId_segmentKey_key" ON "network_segments"("facilityId", "segmentKey");
CREATE INDEX "wifi_usage_aggregates_facilityId_windowStart_idx" ON "wifi_usage_aggregates"("facilityId", "windowStart");
CREATE INDEX "access_control_points_facilityId_operationalStatus_idx" ON "access_control_points"("facilityId", "operationalStatus");
CREATE INDEX "access_control_integrations_facilityId_connectionStatus_idx" ON "access_control_integrations"("facilityId", "connectionStatus");
CREATE INDEX "emergency_communication_messages_facilityId_status_scheduledAt_idx" ON "emergency_communication_messages"("facilityId", "status", "scheduledAt");
CREATE INDEX "emergency_communication_integrations_facilityId_systemType_connectionStatus_idx" ON "emergency_communication_integrations"("facilityId", "systemType", "connectionStatus");
CREATE INDEX "security_events_facilityId_occurredAt_idx" ON "security_events"("facilityId", "occurredAt");
CREATE INDEX "security_alerts_facilityId_status_severity_lastSeenAt_idx" ON "security_alerts"("facilityId", "status", "severity", "lastSeenAt");
CREATE INDEX "security_incidents_facilityId_status_severity_updatedAt_idx" ON "security_incidents"("facilityId", "status", "severity", "updatedAt");
CREATE INDEX "hardware_assets_facilityId_category_commissioningStatus_idx" ON "hardware_assets"("facilityId", "category", "commissioningStatus");
