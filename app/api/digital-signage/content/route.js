import { NextResponse } from 'next/server';
import {
  getAllContent,
  createContentItem,
  CONTENT_TYPES,
} from '../../../../lib/digitalSignage';
import { authorizeRole } from '../../../../lib/auth';

const signageRoles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'EVENT_MANAGER'];

export async function GET(req) {
  const auth = authorizeRole(req, signageRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized signage staff must sign in.' }, { status: auth.status });
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'ALL';
    const search = searchParams.get('search') || '';

    const contentItems = getAllContent({ type, search });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      contentTypes: CONTENT_TYPES,
      count: contentItems.length,
      contentItems,
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
    const { title, type, mediaUrl, durationSeconds, resolution, tags } = body;

    if (!title || !type || !mediaUrl) {
      return NextResponse.json(
        { success: false, message: 'Content title, type, and mediaUrl are mandatory.' },
        { status: 400 }
      );
    }

    const item = await createContentItem({
      title,
      type,
      mediaUrl,
      durationSeconds,
      resolution,
      tags,
      currentUser: auth.user,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Simulated content record ${item.id} created; no physical display was updated.`,
        contentItem: item,
        dataMode: 'SIMULATED',
        isSimulated: true,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 400 });
  }
}
