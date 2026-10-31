import { NextResponse } from 'next/server';
import {
  getAllAssets,
  registerAsset,
  calculateAssetMetrics,
  ASSET_CATEGORIES,
  ASSET_STATUSES,
} from '../../../lib/assetMaintenance';
import { authorizeRole } from '../../../lib/auth';
import { authorizeFacilityAccess, getRequestedFacilityId } from '../../../lib/facilities';

const assetRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'MAINTENANCE_TECHNICIAN', 'REPORT_VIEWER'];

export async function GET(req) {
  const auth = authorizeRole(req, assetRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized asset staff must sign in.' }, { status: auth.status });
  const facilityId = getRequestedFacilityId(req);
  const facilityAuth = await authorizeFacilityAccess(req, facilityId, assetRoles);
  if (!facilityAuth.authorized) return NextResponse.json({ success: false, message: 'You are not authorized for this facility.' }, { status: facilityAuth.status });
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';

    const assets = getAllAssets({ status, category, search, facilityId });
    const metrics = calculateAssetMetrics(assets);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
      categories: ASSET_CATEGORIES,
      statuses: ASSET_STATUSES,
      count: assets.length,
      assets: assets.map((asset) => ({ ...asset, isSimulated: true })),
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const facilityId = getRequestedFacilityId(req);
  const auth = await authorizeFacilityAccess(req, facilityId, ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized asset managers must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const {
      name,
      category,
      manufacturer,
      model,
      serialNumber,
      location,
      installationDate,
      warrantyExpiryDate,
      maintenanceSchedule,
      facilityId,
    } = body;

    if (!name || !category) {
      return NextResponse.json(
        { success: false, message: 'Asset name and category are required.' },
        { status: 400 }
      );
    }

    const asset = await registerAsset({
      name,
      category,
      manufacturer,
      model,
      serialNumber,
      location,
      installationDate,
      warrantyExpiryDate,
      maintenanceSchedule,
      currentUser: auth.user,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Simulated asset record ${asset.id} created; physical installation has not been verified.`,
        asset: { ...asset, isSimulated: true },
        dataMode: 'SIMULATED',
        isSimulated: true,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
