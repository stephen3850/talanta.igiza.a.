import { NextResponse } from 'next/server';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeRole } from '../../../../lib/auth';

const twinRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'FACILITY_MANAGER', 'NETWORK_OPERATOR'];

// Initial 3D Asset & Spatial Coordinate Store
export const initialDigitalTwinAssets = [
  {
    id: 'ASSET-3D-01',
    assetCode: 'AST-PITCH-01',
    name: 'Main Bowl Pitch Grass Sensor 1',
    category: 'ENVIRONMENTAL_SENSOR',
    zoneLocation: 'Main Bowl Pitch Surface',
    coordinates3D: { x: 0, y: 0.5, z: 0 },
    linkedDeviceId: 'IOT-ENV-PITCH-01',
    status: 'ONLINE',
    maintenanceStatus: 'GOOD',
    lastTelemetry: { temp: '24.5 °C', moisture: '42%' },
  },
  {
    id: 'ASSET-3D-02',
    assetCode: 'AST-GATEA-01',
    name: 'Gate A Optical Turnstile Array',
    category: 'TURNSTILE_GATE',
    zoneLocation: 'Gate A Concourse Corridor',
    coordinates3D: { x: -45, y: 2.0, z: 20 },
    linkedDeviceId: 'SCANNER-MOB-01',
    status: 'ONLINE',
    maintenanceStatus: 'GOOD',
    lastTelemetry: { scansMin: '480/min', approvedToday: 1840 },
  },
  {
    id: 'ASSET-3D-03',
    assetCode: 'AST-SUBSTATION-01',
    name: 'Substation Alpha Floodlight Transformer',
    category: 'ELECTRICAL_SUBSTATION',
    zoneLocation: 'South Infrastructure Precinct',
    coordinates3D: { x: 60, y: 1.0, z: -30 },
    linkedDeviceId: 'IOT-PWR-FLOODLIGHTS-01',
    status: 'ONLINE',
    maintenanceStatus: 'INSPECTION_DUE',
    lastTelemetry: { powerLoad: '850 kW', voltage: '415 V' },
  },
  {
    id: 'ASSET-3D-04',
    assetCode: 'AST-VIP-HVAC-01',
    name: 'Presidential Canopy HVAC Climate Unit',
    category: 'HVAC_EQUIPMENT',
    zoneLocation: 'West Stand VIP Canopy',
    coordinates3D: { x: -20, y: 12.0, z: 0 },
    linkedDeviceId: 'IOT-AIR-CONCOURSE-01',
    status: 'ONLINE',
    maintenanceStatus: 'GOOD',
    lastTelemetry: { tempSetting: '21.0 °C', co2Ppm: '450 ppm' },
  },
];

export async function GET(req) {
  const auth = authorizeRole(req, twinRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized infrastructure staff must sign in.' }, { status: auth.status });
  try {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      modelSpecs: {
        modelType: 'Conceptual 3D Demonstration Mesh',
        format: 'WebGL / Three.js Canvas',
        replaceability: 'GLTF / GLB Architectural Model Compatible',
        disclaimer: '3D spatial dimensions represent a conceptual demonstration layout for tender evaluation.',
      },
      assets: initialDigitalTwinAssets.map((asset) => ({
        ...asset,
        status: 'UNVERIFIED',
        isSimulated: true,
      })),
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized infrastructure managers must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { name, category = 'SENSOR', zoneLocation, coordinates3D, linkedDeviceId } = body;

    if (!name || !zoneLocation) {
      return NextResponse.json(
        { success: false, message: 'Asset name and zone location are required.' },
        { status: 400 }
      );
    }

    const assetCode = `AST-${category.substring(0, 4)}-${Math.floor(Math.random() * 900 + 100)}`;
    const newAsset = {
      id: `ASSET-3D-${Date.now()}`,
      assetCode,
      name,
      category,
      zoneLocation,
      coordinates3D: coordinates3D || null,
      linkedDeviceId: linkedDeviceId || null,
      status: 'UNVERIFIED',
      maintenanceStatus: 'UNVERIFIED',
      lastTelemetry: null,
      isSimulated: true,
    };

    initialDigitalTwinAssets.unshift(newAsset);

    await logAuditEvent({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'DIGITAL_TWIN_ASSET_REGISTERED',
      entityType: '3D_ASSET',
      entityId: assetCode,
      details: `Created simulated digital-twin asset record ${assetCode}.`,
    });

    return NextResponse.json({ success: true, message: 'Simulation only; physical location and asset status are unverified.', asset: newAsset, dataMode: 'SIMULATED' }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
