import { NextResponse } from 'next/server';
import { authorizeProcurementRequest, ProcurementError, receiveAndInspectEquipment } from '../../../../lib/procurement.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const auth = await authorizeProcurementRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized access required.' }, { status: auth.status });
  }

  try {
    const records = await prisma.equipmentReceivingRecord.findMany({
      where: auth.facilityId ? { purchaseOrder: { facilityId: auth.facilityId } } : {},
      include: { purchaseOrder: { include: { supplier: true } }, hardwareAssets: true },
      orderBy: { receivedDate: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, receivingRecords: records });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Equipment receiving records unavailable.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeProcurementRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Procurement officer authorization required for receiving equipment.' }, { status: auth.status });
    }

    const result = await receiveAndInspectEquipment(body, auth.user.id, auth.facilityId);
    return NextResponse.json({
      success: true,
      ...result,
      message: `Equipment receiving record ${result.record.receivingRef} logged. Inspection: ${result.record.inspectionStatus}. ${result.createdAssets.length} hardware assets commissioned.`,
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Equipment receiving and inspection failed.' }, { status });
  }
}
