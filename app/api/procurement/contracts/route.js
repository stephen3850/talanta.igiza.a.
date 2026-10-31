import { NextResponse } from 'next/server';
import { authorizeProcurementRequest, createSupplierContract, getContracts, ProcurementError } from '../../../../lib/procurement.js';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const supplierId = searchParams.get('supplierId');
  const status = searchParams.get('status');
  const expiringWithinDays = searchParams.get('expiringWithinDays') || 60;

  const auth = await authorizeProcurementRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized access required.' }, { status: auth.status });
  }

  try {
    const contracts = await getContracts({
      facilityId: auth.facilityId,
      supplierId,
      status,
      expiringWithinDays,
    });

    return NextResponse.json({ success: true, contracts });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Contracts list unavailable.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeProcurementRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Procurement officer authorization required to register contracts.' }, { status: auth.status });
    }

    const contract = await createSupplierContract(body, auth.user.id, auth.facilityId);
    return NextResponse.json({
      success: true,
      contract,
      message: `Contract ${contract.contractNumber} (${contract.title}) registered with supplier ${contract.supplier.name}.`,
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Contract registration failed.' }, { status });
  }
}
