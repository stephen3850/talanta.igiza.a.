import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    success: false,
    message: 'Direct payment initiation is disabled. Start payment through an authenticated ticket booking.',
  }, { status: 410 });
}
