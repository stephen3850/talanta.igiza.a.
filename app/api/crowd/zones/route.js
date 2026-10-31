import { NextResponse } from 'next/server';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeRole } from '../../../../lib/auth';

const crowdRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'SECURITY_OPERATOR', 'GATE_OPERATOR'];

// Initial Stadium Zone Capacity Store
export const initialStadiumZones = [
  {
    id: 'ZONE-A-UPPER',
    name: 'Zone A - Upper Deck GA',
    building: 'Main Bowl Stand North/East',
    approvedCapacity: 25000,
    currentEntries: 16800,
    currentExits: 450,
    estimatedOccupancy: 16350,
    occupancyPercentage: 65.4,
    densityStatus: 'MODERATE', // LOW, MODERATE, CONGESTED, CRITICAL
    status: 'NORMAL',
    associatedGates: ['GATE-A-01', 'GATE-A-02'],
    sensorHealth: '99.2%',
  },
  {
    id: 'ZONE-B-LOWER',
    name: 'Zone B - Lower Deck GA',
    building: 'Main Bowl Stand South/West',
    approvedCapacity: 25000,
    currentEntries: 18200,
    currentExits: 620,
    estimatedOccupancy: 17580,
    occupancyPercentage: 70.3,
    densityStatus: 'CONGESTED',
    status: 'MONITORING',
    associatedGates: ['GATE-B-01', 'GATE-B-02', 'GATE-B-04'],
    sensorHealth: '98.8%',
  },
  {
    id: 'ZONE-VIP-CANOPY',
    name: 'VIP Canopy Deck & Hospitality',
    building: 'West Stand Executive Tier',
    approvedCapacity: 6500,
    currentEntries: 4200,
    currentExits: 110,
    estimatedOccupancy: 4090,
    occupancyPercentage: 62.9,
    densityStatus: 'MODERATE',
    status: 'NORMAL',
    associatedGates: ['VIP-GATE-01'],
    sensorHealth: '100%',
  },
  {
    id: 'ZONE-VVIP-SUITE',
    name: 'VVIP Presidential Suite',
    building: 'West Stand Presidential Level',
    approvedCapacity: 1000,
    currentEntries: 520,
    currentExits: 20,
    estimatedOccupancy: 500,
    occupancyPercentage: 50.0,
    densityStatus: 'LOW',
    status: 'SECURE',
    associatedGates: ['VIP-GATE-01'],
    sensorHealth: '100%',
  },
  {
    id: 'ZONE-PRECINCT-PLAZA',
    name: 'Outer Precinct Plaza & Entry Ramps',
    building: 'Stadium Perimeter Ramp Grounds',
    approvedCapacity: 15000,
    currentEntries: 12400,
    currentExits: 11800,
    estimatedOccupancy: 600,
    occupancyPercentage: 4.0,
    densityStatus: 'LOW',
    status: 'NORMAL',
    associatedGates: ['ACCESSIBLE-GATE', 'GATE-A-01'],
    sensorHealth: '97.5%',
  },
];

export async function GET(req) {
  const auth = authorizeRole(req, crowdRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized crowd-operations staff must sign in.' }, { status: auth.status });
  try {
    const totalCapacity = initialStadiumZones.reduce((sum, z) => sum + z.approvedCapacity, 0);
    const totalOccupancy = initialStadiumZones.reduce((sum, z) => sum + z.estimatedOccupancy, 0);
    const overallOccupancyPercentage = Math.round((totalOccupancy / totalCapacity) * 100);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalApprovedCapacity: totalCapacity,
        totalEstimatedOccupancy: totalOccupancy,
        overallOccupancyPercentage,
        privacyPolicy: 'Anonymous Aggregate Gate Counting Only - Biometrics Disabled',
      },
      zones: initialStadiumZones.map((zone) => ({ ...zone, isSimulated: true })),
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized crowd-operations managers must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { zoneId, approvedCapacity, status, densityStatus } = body;

    const zone = initialStadiumZones.find((z) => z.id === zoneId);
    if (!zone) {
      return NextResponse.json({ success: false, message: 'Stadium zone not found' }, { status: 404 });
    }

    if (approvedCapacity) zone.approvedCapacity = Number(approvedCapacity);
    if (status) zone.status = status;
    if (densityStatus) zone.densityStatus = densityStatus;

    await logAuditEvent({
      userId: auth.user.id,
      userEmail: auth.user.email,
      action: 'CROWD_ZONE_CONFIG_UPDATED',
      entityType: 'CROWD_ZONE',
      entityId: zoneId,
      details: `Updated zone ${zoneId} capacity to ${approvedCapacity} (Status: ${status}, Density: ${densityStatus})`,
    });

    return NextResponse.json({ success: true, zone: { ...zone, isSimulated: true }, dataMode: 'SIMULATED', isSimulated: true });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
