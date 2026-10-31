import { authorizeRole } from './auth.js';
import { prisma } from './prisma.js';
import facilityPolicy from './facilityPolicy.cjs';

export const LEGACY_FACILITY_ID = 'FACILITY-TALANTA-STADIUM';

export function getRequestedFacilityId(req) {
  const { searchParams } = new URL(req.url);
  const cookie = (req.headers.get('cookie') || '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith('talanta_facility='));
  const selectedFacilityId = cookie ? cookie.slice('talanta_facility='.length) : null;
  return searchParams.get('facilityId') || selectedFacilityId || LEGACY_FACILITY_ID;
}

export async function authorizeFacilityAccess(req, facilityId, allowedRoles = []) {
  const auth = authorizeRole(req, allowedRoles);
  if (!auth.authorized) return auth;

  if (!facilityId) {
    return { authorized: false, reason: 'FACILITY_REQUIRED', status: 400 };
  }

  if (auth.user.role === 'SYSTEM_ADMIN') {
    if (facilityId === LEGACY_FACILITY_ID) return { ...auth, facilityId };
    if (!process.env.DATABASE_URL || !prisma?.facility) {
      return { authorized: false, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE', status: 503 };
    }
    try {
      const facility = await prisma.facility.findUnique({ where: { id: facilityId }, select: { id: true } });
      return facility ? { ...auth, facilityId } : { authorized: false, reason: 'FACILITY_NOT_FOUND', status: 404 };
    } catch (error) {
      console.error('[Facility authorization failed]', error);
      return { authorized: false, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE', status: 503 };
    }
  }

  if (!process.env.DATABASE_URL || !prisma?.facilityMembership) {
    if (process.env.NODE_ENV === 'development' && facilityId === LEGACY_FACILITY_ID) {
      return { ...auth, facilityId, isSimulated: true };
    }
    return { authorized: false, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE', status: 503 };
  }

  try {
    const membership = await prisma.facilityMembership.findUnique({
      where: { facilityId_userId: { facilityId, userId: auth.user.id } },
      select: { facilityId: true, userId: true, role: true, isActive: true },
    });

    if (!facilityPolicy.membershipAllowsFacility({ membership, userId: auth.user.id, facilityId, allowedRoles })) {
      return { authorized: false, reason: 'FORBIDDEN_FACILITY_ACCESS', status: 403 };
    }

    return { ...auth, facilityId, membership };
  } catch (error) {
    console.error('[Facility authorization failed]', error);
    return { authorized: false, reason: 'FACILITY_AUTHORIZATION_UNAVAILABLE', status: 503 };
  }
}
