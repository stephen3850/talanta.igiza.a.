import { NextResponse } from 'next/server';
import { authorizeProcurementRequest, createPurchaseOrder, ProcurementError } from '../../../../lib/procurement.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const auth = await authorizeProcurementRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized access required.' }, { status: auth.status });
  }

  try {
    const orders = await prisma.purchaseOrder.findMany({
      where: auth.facilityId ? { facilityId: auth.facilityId } : {},
      include: { supplier: true, procurementRequest: { include: { items: true } }, facility: true, receivingRecords: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Purchase orders unavailable.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeProcurementRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Procurement officer authorization required to issue purchase orders.' }, { status: auth.status });
    }

    if (!auth.facilityId) {
      return NextResponse.json({ success: false, message: 'Specify target facility ID.' }, { status: 400 });
    }

    const po = await createPurchaseOrder(body, auth.user.id, auth.facilityId);
    return NextResponse.json({
      success: true,
      purchaseOrder: po,
      message: `Purchase Order ${po.poNumber} issued to ${po.supplier.name} for KES ${po.totalAmount.toLocaleString()}.`,
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Purchase order creation failed.' }, { status });
  }
}
