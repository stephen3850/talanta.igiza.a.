import { NextResponse } from 'next/server';
import { authorizeFinanceRequest, createAdjustment, FinanceError, recordFinanceAudit } from '../../../../lib/financialManagement';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const facilityId = new URL(req.url).searchParams.get('facilityId');
  const auth = await authorizeFinanceRequest(req, { facilityId });
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized financial record access is required.' }, { status: auth.status });
  try {
    const records = await prisma.financialAdjustment.findMany({
      where: auth.facilityId ? { facilityId: auth.facilityId } : {},
      include: { facility: { select: { name: true } }, event: { select: { title: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    await prisma.$transaction((tx) => recordFinanceAudit(tx, {
      actorId: auth.user.id, facilityId: auth.facilityId, action: 'FINANCIAL_ADJUSTMENTS_VIEWED', entityType: 'FINANCIAL_ADJUSTMENT',
    }));
    return NextResponse.json({ success: true, records });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : 503;
    if (!(error instanceof FinanceError)) console.error('[Financial adjustment query failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Financial adjustments are unavailable.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeFinanceRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) return NextResponse.json({ success: false, message: 'Finance officer access to this facility is required.' }, { status: auth.status });
    if (!auth.facilityId) return NextResponse.json({ success: false, message: 'Specify a facility for the adjustment.' }, { status: 400 });
    const adjustment = await createAdjustment(body, auth.user.id, auth.facilityId);
    return NextResponse.json({ success: true, adjustment, message: 'Adjustment awaits approval by a different authorized finance user.' }, { status: 201 });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : 503;
    if (!(error instanceof FinanceError)) console.error('[Financial adjustment creation failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Financial adjustment could not be created.' }, { status });
  }
}
