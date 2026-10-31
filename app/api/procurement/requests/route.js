import { NextResponse } from 'next/server';
import { authorizeProcurementRequest, createProcurementRequest, ProcurementError } from '../../../../lib/procurement.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const auth = await authorizeProcurementRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized access required.' }, { status: auth.status });
  }

  try {
    const requests = await prisma.procurementRequest.findMany({
      where: auth.facilityId ? { facilityId: auth.facilityId } : {},
      include: { facility: true, items: true, approvalLogs: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Procurement requests unavailable.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeProcurementRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Procurement officer or department authorization required.' }, { status: auth.status });
    }

    if (!auth.facilityId) {
      return NextResponse.json({ success: false, message: 'Specify a target facility ID.' }, { status: 400 });
    }

    const procurementRequest = await createProcurementRequest(body, auth.user.id, auth.facilityId);
    return NextResponse.json({
      success: true,
      procurementRequest,
      message: `Procurement request ${procurementRequest.requestRef} created and pending ${procurementRequest.currentStage} approval.`,
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Procurement request creation failed.' }, { status });
  }
}
