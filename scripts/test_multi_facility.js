const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { membershipAllowsFacility } = require('../lib/facilityPolicy.cjs');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const roles = ['VENUE_MANAGER', 'FACILITY_MANAGER'];
const membershipA = {
  userId: 'user-a',
  facilityId: 'facility-a',
  role: 'FACILITY_MANAGER',
  isActive: true,
};

assert.equal(membershipAllowsFacility({ membership: membershipA, userId: 'user-a', facilityId: 'facility-a', allowedRoles: roles }), true);
assert.equal(membershipAllowsFacility({ membership: membershipA, userId: 'user-a', facilityId: 'facility-b', allowedRoles: roles }), false);
assert.equal(membershipAllowsFacility({ membership: membershipA, userId: 'user-b', facilityId: 'facility-a', allowedRoles: roles }), false);
assert.equal(membershipAllowsFacility({ membership: { ...membershipA, isActive: false }, userId: 'user-a', facilityId: 'facility-a', allowedRoles: roles }), false);
assert.equal(membershipAllowsFacility({ membership: { ...membershipA, role: 'CUSTOMER' }, userId: 'user-a', facilityId: 'facility-a', allowedRoles: roles }), false);
console.log('[PASS] Facility memberships enforce facility, user, active state, and role boundaries');

const schema = read('prisma/schema.prisma');
for (const model of ['Facility', 'FacilityMembership', 'Event', 'StaffAccreditation', 'IoTDevice', 'HardwareAsset', 'Camera', 'NetworkInfrastructureDevice', 'SecurityIncident']) {
  assert.ok(schema.includes(`model ${model} {`), `Missing Prisma model ${model}`);
}
assert.ok(schema.includes('@@unique([facilityId, userId])'), 'Facility membership must be unique per user and facility');
assert.ok(schema.includes('@@index([facilityId, status, startDate])'), 'Facility event queries must be indexed');
assert.ok(schema.includes('@relation(fields: [eventId], references: [id])'), 'Tickets inherit facility ownership through their event');
console.log('[PASS] Facility models, constraints, query indexes, and ticket-to-event ownership are present');

const migration = read('prisma/migrations/20261031000000_multi_facility/migration.sql');
assert.ok(migration.includes("'TALANTA-STADIUM', 'Talanta Stadium'"), 'Migration must retain Talanta as the existing facility');
assert.ok(migration.includes('UPDATE "events" SET "facilityId"') && migration.includes('FACILITY-TALANTA-STADIUM'), 'Existing event rows must be assigned to Talanta');
assert.ok(migration.includes('INSERT INTO \"facility_memberships\"'), 'Existing staff accounts must receive a facility membership');
assert.equal((migration.match(/INSERT INTO \"facilities\"/g) || []).length, 1, 'Migration creates only the existing Talanta facility');
console.log('[PASS] Migration backfills existing venue data without adding sample venues');

const facilityAuth = read('lib/facilities.js');
assert.ok(facilityAuth.includes('facilityPolicy.membershipAllowsFacility'), 'Facility authorization must check membership, not only global role');
const eventRoute = read('app/api/events/route.js');
const staffRoute = read('app/api/staff/route.js');
const iotRoute = read('app/api/iot/devices/route.js');
assert.ok(eventRoute.includes('whereClause = canManage ? { facilityId }'), 'Private event queries must be facility scoped');
assert.ok(staffRoute.includes('const where = { facilityId }'), 'Workforce queries must be facility scoped');
assert.ok(iotRoute.includes('const where = { facilityId }'), 'IoT inventory queries must be facility scoped');
console.log('[PASS] Core event, workforce, and IoT APIs apply facility-scoped queries');
