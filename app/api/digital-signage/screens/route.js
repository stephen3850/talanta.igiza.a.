import { NextResponse } from 'next/server';
import {
  getAllScreens,
  registerScreen,
  updateScreenStatus,
  calculateSignageMetrics,
  SCREEN_CATEGORIES,
  SCREEN_STATUSES,
} from '../../../../lib/digitalSignage';
import { authorizeRole } from '../../../../lib/auth';

const signageRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'EVENT_MANAGER'];

export async function GET(req) {
  const auth = authorizeRole(req, signageRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized signage staff must sign in.' }, { status: auth.status });
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'ALL';
    const category = searchParams.get('category') || 'ALL';
    const search = searchParams.get('search') || '';

    const screens = getAllScreens({ status, category, search });
    const metrics = calculateSignageMetrics();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      metrics,
      categories: SCREEN_CATEGORIES,
      statuses: SCREEN_STATUSES,
      count: screens.length,
      screens,
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, signageRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized signage staff must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { name, location, category, resolution, orientation, connectedPlayer, ipAddress } = body;

    if (!name || !location) {
      return NextResponse.json(
        { success: false, message: 'Screen name and physical location are required.' },
        { status: 400 }
      );
    }

    const screen = await registerScreen({
      name,
      location,
      category,
      resolution,
      orientation,
      connectedPlayer,
      ipAddress,
      currentUser: auth.user,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Simulated display record ${screen.id} registered; no physical screen was verified.`,
        screen,
        dataMode: 'SIMULATED',
        isSimulated: true,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = authorizeRole(req, signageRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized signage staff must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { screenId, status } = body;

    if (!screenId || !status) {
      return NextResponse.json({ success: false, message: 'screenId and status are required.' }, { status: 400 });
    }

    const result = await updateScreenStatus({ screenId, status, currentUser: auth.user });
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Simulated screen ${screenId} status updated to ${status}; no physical display was checked.`,
      screen: result.screen,
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
