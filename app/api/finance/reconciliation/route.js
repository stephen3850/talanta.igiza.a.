import { NextResponse } from 'next/server';
import { authorizeFinanceRequest, FinanceError, importReconciliationStatement, reconcileSinglePayment } from '../../../../lib/financialManagement';

export async function POST(req) {
  try {
    const body = await req.json();
    const auth = await authorizeFinanceRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) return NextResponse.json({ success: false, message: 'Finance officer access to this facility is required.' }, { status: auth.status });
    const result = await importReconciliationStatement(body, auth.user.id, auth.facilityId);
    return NextResponse.json({
      success: true,
      ...result,
      message: `Statement imported with ${result.batch.matchedCount} matched and ${result.batch.unmatchedCount} unmatched entries. Unmatched records need manual review.`,
      providerVerifiedByApplication: false,
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : error.code === 'P2002' ? 409 : 503;
    if (!(error instanceof FinanceError) && error.code !== 'P2002') console.error('[Provider statement import failed]', error);
    return NextResponse.json({
      success: false,
      message: error instanceof FinanceError ? error.message : error.code === 'P2002' ? 'The statement or a provider transaction reference was already imported.' : 'Provider statement could not be imported.',
    }, { status });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const auth = await authorizeFinanceRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) return NextResponse.json({ success: false, message: 'Finance officer access to this facility is required.' }, { status: auth.status });
    const reconciliation = await reconcileSinglePayment({
      paymentId: body.paymentId,
      statementLineId: body.statementLineId,
      actorId: auth.user.id,
      facilityId: auth.facilityId,
    });
    return NextResponse.json({
      success: true,
      reconciliation,
      message: 'Payment manually reconciled with statement line.',
    });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : error.code === 'P2002' || error.code === 'P2034' ? 409 : 503;
    if (!(error instanceof FinanceError) && error.code !== 'P2002') console.error('[Single payment reconciliation failed]', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Payment could not be reconciled.',
    }, { status });
  }
}
