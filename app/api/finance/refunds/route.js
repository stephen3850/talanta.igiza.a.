import { NextResponse } from 'next/server';
import { authorizeFinanceRequest, createRefundRequest, FinanceError, recordFinanceAudit } from '../../../../lib/financialManagement';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const facilityId = new URL(req.url).searchParams.get('facilityId');
  const auth = await authorizeFinanceRequest(req, { facilityId });
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized finance access is required.' }, { status: auth.status });
  try {
    const records = await prisma.refundRequest.findMany({
      where: { ...(auth.facilityId ? { payment: { is: { OR: [
        { booking: { is: { event: { is: { facilityId: auth.facilityId } } } } },
        { order: { is: { event: { is: { facilityId: auth.facilityId } } } } },
      ] } } } : {}) },
      include: { payment: { select: { paymentRef: true, amount: true, currency: true, status: true, mpesaReceipt: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    await prisma.$transaction((tx) => recordFinanceAudit(tx, { actorId: auth.user.id, facilityId: auth.facilityId, action: 'REFUNDS_VIEWED', entityType: 'REFUND_REQUEST' }));
    return NextResponse.json({ success: true, records, providerRefundAvailable: false });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : 503;
    if (!(error instanceof FinanceError)) console.error('[Refund request query failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Refund requests are unavailable.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeFinanceRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) return NextResponse.json({ success: false, message: 'Finance officer access to this facility is required.' }, { status: auth.status });
    const request = await createRefundRequest(body, auth.user.id, auth.facilityId);
    return NextResponse.json({
      success: true,
      request,
      providerRefundAvailable: false,
      message: 'Refund request recorded. It is not a provider refund instruction or confirmation; no refund is marked completed.',
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : error.code === 'P2002' || error.code === 'P2034' ? 409 : 503;
    if (!(error instanceof FinanceError) && error.code !== 'P2002' && error.code !== 'P2034') console.error('[Refund request creation failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Refund request could not be created.' }, { status });
  }
}
