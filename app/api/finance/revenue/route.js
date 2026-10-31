import { NextResponse } from 'next/server';
import { authorizeFinanceRequest, createRevenueRecord, ensureRevenueCategories, FinanceError, recordFinanceAudit } from '../../../../lib/financialManagement';
import { prisma } from '../../../../lib/prisma';

export async function GET(req) {
  const facilityId = new URL(req.url).searchParams.get('facilityId');
  const auth = await authorizeFinanceRequest(req, { facilityId });
  if (!auth.authorized) return NextResponse.json({ success: false, message: 'Authorized financial record access is required.' }, { status: auth.status });
  try {
    await ensureRevenueCategories();
    const [categories, records] = await Promise.all([
      prisma.revenueCategory.findMany({ where: { active: true }, orderBy: { label: 'asc' } }),
      prisma.revenueRecord.findMany({
        where: auth.facilityId ? { facilityId: auth.facilityId } : {},
        include: { category: { select: { label: true } }, facility: { select: { name: true } }, event: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
    ]);
    await prisma.$transaction((tx) => recordFinanceAudit(tx, {
      actorId: auth.user.id, facilityId: auth.facilityId, action: 'REVENUE_RECORDS_VIEWED', entityType: 'REVENUE_RECORD',
    }));
    return NextResponse.json({ success: true, categories, records });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : 503;
    if (!(error instanceof FinanceError)) console.error('[Revenue record query failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Revenue records are unavailable.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeFinanceRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) return NextResponse.json({ success: false, message: 'Finance officer access to this facility is required.' }, { status: auth.status });
    if (!auth.facilityId) return NextResponse.json({ success: false, message: 'Specify a facility for the revenue record.' }, { status: 400 });
    const record = await createRevenueRecord(body, auth.user.id, auth.facilityId);
    return NextResponse.json({ success: true, record, message: 'Revenue entry awaits approval by a different authorized finance user.' }, { status: 201 });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : error.code === 'P2002' ? 409 : 503;
    if (!(error instanceof FinanceError) && error.code !== 'P2002') console.error('[Revenue record creation failed]', error);
    return NextResponse.json({ success: false, message: error instanceof FinanceError ? error.message : error.code === 'P2002' ? 'That revenue source reference already exists.' : 'Revenue record could not be created.' }, { status });
  }
}
