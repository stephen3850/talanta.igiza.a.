import { NextResponse } from 'next/server';
import { authorizeProcurementRequest, ProcurementError, verifySupplier } from '../../../../../../lib/procurement.js';

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const auth = await authorizeProcurementRequest(req, { write: true });
    if (!auth.authorized) {
      return NextResponse.json({ success: false, message: 'Procurement officer authorization required.' }, { status: auth.status });
    }

    const { id } = await params;
    const supplier = await verifySupplier(id, body, auth.user.id);
    return NextResponse.json({ success: true, supplier, message: `Supplier verification status updated to ${supplier.verificationStatus}.` });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Supplier verification failed.' }, { status });
  }
}
