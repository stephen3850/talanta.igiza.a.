function membershipAllowsFacility({ membership, userId, facilityId, allowedRoles }) {
  return Boolean(
    membership &&
    membership.isActive === true &&
    membership.userId === userId &&
    membership.facilityId === facilityId &&
    allowedRoles.includes(membership.role)
  );
}

module.exports = { membershipAllowsFacility };
