import { NextResponse } from 'next/server';
import {
  getAllPlaylists,
  createPlaylist,
  initialSchedules,
} from '../../../../lib/digitalSignage';
import { authorizeRole } from '../../../../lib/auth';

const signageRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'EVENT_MANAGER'];

export async function GET(req) {
  const auth = authorizeRole(req, signageRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized signage staff must sign in.' }, { status: auth.status });
  try {
    const playlists = getAllPlaylists();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: playlists.length,
      playlists,
      schedules: initialSchedules,
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
    const { name, description, targetCategory, contentIds } = body;

    if (!name || !targetCategory) {
      return NextResponse.json(
        { success: false, message: 'Playlist name and targetCategory are required.' },
        { status: 400 }
      );
    }

    const playlist = await createPlaylist({
      name,
      description,
      targetCategory,
      contentIds,
      currentUser: auth.user,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Simulated playlist ${playlist.id} created; no physical display was updated.`,
        playlist,
        dataMode: 'SIMULATED',
        isSimulated: true,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
