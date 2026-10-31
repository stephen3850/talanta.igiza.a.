import { NextResponse } from 'next/server';
import { authorizeProcurementRequest, createSupplier, getSuppliers, ProcurementError } from '../../../../lib/procurement.js';

export async function GET(req) {
  const auth = await authorizeProcurementRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized access required.' }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const verificationStatus = searchParams.get('verificationStatus');

  try {
    const suppliers = await getSuppliers({ category, status, verificationStatus });
    return NextResponse.json({ success: true, suppliers });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Suppliers list unavailable.' }, { status });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeProcurementRequest(req, { write: true });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Procurement officer access is required to register suppliers.' }, { status: auth.status });
    }

    const supplier = await createSupplier(body, auth.user.id);
    return NextResponse.json({ success: true, supplier, message: `Supplier ${supplier.name} (${supplier.supplierCode}) registered.` }, { status: 201 });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : error.code === 'P2002' ? 409 : 503;
    return NextResponse.json({ success: false, message: error.message || 'Supplier registration failed.' }, { status });
  }
}
