import { NextResponse } from 'next/server';
import { initialParkingZones, initialParkingReservations } from '../../../../lib/mockData';
import { logAuditEvent } from '../../../../lib/audit';
import { authorizeRole } from '../../../../lib/auth';

const parkingReadRoles = ['CUSTOMER', 'SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'PARKING_OPERATOR'];

export async function GET(req) {
  const auth = authorizeRole(req, parkingReadRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Sign in to view parking reservations.' }, { status: auth.status });
  const isStaff = auth.user.role !== 'CUSTOMER';
  const { searchParams } = new URL(req.url);
  const reservationRef = searchParams.get('ref');

  try {
    let list = [...initialParkingReservations];

    if (reservationRef) {
      const match = list.find((p) => p.reservationRef === reservationRef);
      if (!match || (!isStaff && match.userEmail !== auth.user.email)) {
        return NextResponse.json({ success: false, message: 'Parking permit not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, reservation: { ...match, isSimulated: true }, dataMode: 'SIMULATED' });
    }

    if (!isStaff) list = list.filter((p) => p.userEmail === auth.user.email);

    return NextResponse.json({
      success: true,
      count: list.length,
      reservations: list.map((reservation) => ({ ...reservation, isSimulated: true })),
      zones: initialParkingZones.map((zone) => ({ ...zone, isSimulated: true })),
      dataMode: 'SIMULATED',
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, ['CUSTOMER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Customer sign-in is required to request parking.' }, { status: auth.status });
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, message: 'Persistent parking reservations are not connected.' }, { status: 503 });
  }
  try {
    const body = await req.json();
    const {
      vehiclePlate,
      vehicleCategory = 'SALOON_CAR',
      zoneId = 'PRK-ZONE-GA-LOT1',
      eventTitle = 'Harambee Stars vs Nigeria (Super Eagles)',
    } = body;

    if (!vehiclePlate || !zoneId) {
      return NextResponse.json(
        { success: false, message: 'Vehicle plate number and parking zone are required.' },
        { status: 400 }
      );
    }

    const zone = initialParkingZones.find((z) => z.id === zoneId);
    if (!zone) {
      return NextResponse.json({ success: false, message: 'Parking zone not found' }, { status: 404 });
    }

    if (zone.reserved >= zone.capacity) {
      return NextResponse.json(
        { success: false, message: `${zone.name} is fully reserved for this matchday.` },
        { status: 400 }
      );
    }

    const reservationRef = `PRK-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
    zone.reserved += 1;

    const newReservation = {
      id: `PRK-${Date.now()}`,
      reservationRef,
      userEmail: auth.user.email,
      userName: auth.user.fullName,
      vehiclePlate: vehiclePlate.toUpperCase(),
      vehicleCategory,
      zoneId: zone.id,
      zoneName: zone.name,
      eventTitle,
      amountKes: zone.priceKes,
      paymentStatus: 'NOT_COLLECTED',
      status: 'RESERVED',
      createdAt: new Date().toISOString(),
      enteredAt: null,
      exitedAt: null,
      isSimulated: true,
    };

    initialParkingReservations.unshift(newReservation);

    await logAuditEvent({
      userId: auth.user.id,
      action: 'PARKING_SPOT_RESERVED',
      entityType: 'PARKING_RESERVATION',
      entityId: reservationRef,
      details: `Created simulated parking request ${reservationRef} for vehicle in zone ${zone.name}.`,
    });

    return NextResponse.json({
      success: true,
      message: 'Development simulation only: no parking space was reserved, payment collected, or barrier command sent.',
      reservation: newReservation,
      dataMode: 'SIMULATED',
    }, { status: 202 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
