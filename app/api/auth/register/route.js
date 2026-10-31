import { NextResponse } from 'next/server';
import { hashPassword } from '../../../../lib/auth';
import { logAuditEvent } from '../../../../lib/audit';
import { createManagedSession } from '../../../../lib/iam';
import { prisma } from '../../../../lib/prisma';

export async function POST(req) {
  try {
    if (!process.env.DATABASE_URL || !prisma?.user) {
      return NextResponse.json({ success: false, message: 'Registration service is unavailable.' }, { status: 503 });
    }

    const body = await req.json();
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phoneNumber = typeof body.phone === 'string' ? body.phone.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (fullName.length < 2 || fullName.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || password.length < 12 || password.length > 128) {
      return NextResponse.json({ success: false, message: 'Provide a valid name and email, and a password of 12 to 128 characters.' }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        phoneNumber: phoneNumber || null,
        passwordHash: hashPassword(password),
        role: 'CUSTOMER',
      },
      select: { id: true, email: true, fullName: true, role: true },
    });
    const { token, sessionId } = await createManagedSession(user, req);
    await logAuditEvent({
      userId: user.id,
      action: 'USER_REGISTERED',
      entityType: 'USER',
      entityId: user.id,
      details: 'A new customer account was registered.',
    });

    const response = NextResponse.json({ success: true, message: 'Account registered successfully.', user, sessionId }, { status: 201 });
    response.cookies.set('talanta_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60,
    });
    return response;
  } catch (err) {
    if (err.code === 'P2002') return NextResponse.json({ success: false, message: 'An account with this email already exists.' }, { status: 409 });
    console.error('[Customer registration failed]', err);
    return NextResponse.json({ success: false, message: 'Registration service is temporarily unavailable.' }, { status: 503 });
  }
}
