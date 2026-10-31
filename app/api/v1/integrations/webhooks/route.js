import { NextResponse } from 'next/server';
import {
  getAllWebhooks,
  registerWebhook,
  revokeWebhook,
  dispatchWebhookEvent,
} from '../../../../../lib/apiGateway';
import { authorizeRole } from '../../../../../lib/auth';

function authorizeAdmin(req) {
  return authorizeRole(req, ['SYSTEM_ADMIN']);
}

export async function GET(req) {
  const auth = authorizeAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'System administrator access is required.' }, { status: auth.status });
  try {
    const webhooks = getAllWebhooks();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: webhooks.length,
      webhooks,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  const auth = authorizeAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'System administrator access is required.' }, { status: auth.status });
  try {
    const body = await req.json();
    const { clientId, targetUrl, eventTypes, action, eventName, payload } = body;

    // Trigger test event dispatch if action = DISPATCH
    if (action === 'DISPATCH') {
      const dispatchRes = await dispatchWebhookEvent({
        eventName: eventName || 'payment.confirmed',
        payload: payload || { testMessage: 'Manual Webhook Test' },
        currentUser: auth.user,
      });

      return NextResponse.json({
        success: true,
        message: `Webhook event ${eventName || 'payment.confirmed'} dispatched to ${dispatchRes.deliveredCount} subscriber(s).`,
        dispatchResults: dispatchRes,
      });
    }

    if (!clientId || !targetUrl) {
      return NextResponse.json(
        { success: false, message: 'clientId and targetUrl are required for webhook registration.' },
        { status: 400 }
      );
    }

    const { newHook, rawSecret } = await registerWebhook({
      clientId,
      targetUrl,
      eventTypes,
      currentUser: auth.user,
    });

    return NextResponse.json(
      {
        success: true,
        message: `Webhook subscription ${newHook.id} created. Webhook signing secret issued below.`,
        webhook: newHook,
        unmaskedSigningSecret: rawSecret,
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const auth = authorizeAdmin(req);
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'System administrator access is required.' }, { status: auth.status });
  try {
    const { searchParams } = new URL(req.url);
    const webhookId = searchParams.get('id');

    if (!webhookId) {
      return NextResponse.json({ success: false, message: 'Webhook id parameter is required.' }, { status: 400 });
    }

    const result = await revokeWebhook({ webhookId });
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Webhook ${webhookId} revoked successfully.`,
      webhook: result.webhook,
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
