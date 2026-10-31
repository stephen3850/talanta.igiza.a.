import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const notices = await prisma.privacyNotice.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      select: { version: true, title: true, body: true, publishedAt: true },
    });
    return NextResponse.json(
      { success: true, notices },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } },
    );
  } catch (error) {
    console.error('[Published privacy notice query failed]', error);
    return NextResponse.json({ success: false, message: 'Published privacy notices are temporarily unavailable.' }, { status: 503 });
  }
}
