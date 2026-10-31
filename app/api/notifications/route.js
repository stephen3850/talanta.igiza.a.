import { NextResponse } from 'next/server';
import { initialNotifications, dispatchNotification } from '../../../lib/notifications';
import { authorizeRole } from '../../../lib/auth';

const notificationRoles = ['CUSTOMER', 'SYSTEM_ADMIN', 'VENUE_MANAGER', 'EVENT_MANAGER'];

export async function GET(req) {
  const auth = authorizeRole(req, notificationRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Sign in to view notifications.' }, { status: auth.status });
  const isStaff = auth.user.role !== 'CUSTOMER';
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const unreadOnly = searchParams.get('unread') === 'true';

  try {
    let list = [...initialNotifications];

    if (!isStaff) list = list.filter((n) => n.userEmail === auth.user.email);

    if (category && category !== 'ALL') {
      list = list.filter((n) => n.category === category);
    }

    if (unreadOnly) {
      list = list.filter((n) => !n.read);
    }

    return NextResponse.json({
      success: true,
      count: list.length,
      notifications: list,
      dataMode: 'SIMULATED',
      isSimulated: true,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeRole(req, ['SYSTEM_ADMIN', 'VENUE_MANAGER']);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized notification operators must sign in.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { userEmail, type = 'GENERAL', category = 'SYSTEM', title, message } = body;

    if (!userEmail || !title || !message) {
      return NextResponse.json(
        { success: false, message: 'User email, title, and message are required.' },
        { status: 400 }
      );
    }

    const notification = await dispatchNotification({
      userEmail,
      type,
      category,
      title,
      message,
    });

    return NextResponse.json({
      success: true,
      message: 'Development simulation only; no email, SMS, or push notification was delivered.',
      notification,
      dataMode: 'SIMULATED',
      isSimulated: true,
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = authorizeRole(req, notificationRoles);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Sign in to update notifications.' }, { status: auth.status });
  const isStaff = auth.user.role !== 'CUSTOMER';
  try {
    const body = await req.json();
    const { id, markAllRead } = body;
    const userEmail = isStaff ? body.userEmail : auth.user.email;

    if (markAllRead) {
      initialNotifications.forEach((n) => {
        if (n.userEmail === userEmail) n.read = true;
      });
      return NextResponse.json({ success: true, message: 'Simulated notifications marked as read.', dataMode: 'SIMULATED' });
    }

    if (id) {
      const notif = initialNotifications.find((n) => n.id === id);
      if (!notif || (!isStaff && notif.userEmail !== auth.user.email)) {
        return NextResponse.json({ success: false, message: 'Notification not found.' }, { status: 404 });
      }
      if (notif) notif.read = true;
      return NextResponse.json({ success: true, notification: notif, dataMode: 'SIMULATED', isSimulated: true });
    }

    return NextResponse.json({ success: false, message: 'Notification ID or user email required' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
