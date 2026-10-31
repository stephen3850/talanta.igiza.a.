import { NextResponse } from 'next/server';
import { authorizeProcurementRequest, exportPurchaseOrderDocument, ProcurementError } from '../../../../../../lib/procurement.js';

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  const facilityId = searchParams.get('facilityId');
  const format = searchParams.get('format') || 'text';

  const auth = await authorizeProcurementRequest(req, { facilityId });
  if (!auth.authorized) {
    return NextResponse.json({ success: false, message: 'Authorized access required.' }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const { po, documentText } = await exportPurchaseOrderDocument(id, auth.facilityId);

    if (format === 'download' || format === 'txt') {
      return new Response(documentText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="talanta-po-${po.poNumber.toLowerCase()}.txt"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    return NextResponse.json({ success: true, purchaseOrder: po, documentText });
  } catch (error) {
    const status = error instanceof ProcurementError ? error.status : 503;
    return NextResponse.json({ success: false, message: error.message || 'Purchase order document unavailable.' }, { status });
  }
}
