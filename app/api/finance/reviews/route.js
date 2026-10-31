import { NextResponse } from 'next/server';
import { authorizeFinanceRequest, FinanceError, reviewFinancialRecord } from '../../../../lib/financialManagement';

export async function PATCH(req) {
  try {
    const body = await req.json();
    const auth = await authorizeFinanceRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) return NextResponse.json({ success: false, message: 'Finance officer access to this facility is required.' }, { status: auth.status });
    const record = await reviewFinancialRecord({
      recordType: body.recordType,
      recordId: body.recordId,
      decision: body.decision,
      reason: body.reason,
      actorId: auth.user.id,
      facilityId: auth.facilityId,
    });
    return NextResponse.json({ success: true, record, message: 'Financial record review recorded; final records cannot be edited.' });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : error.code === 'P2034' ? 409 : 503;
    if (!(error instanceof FinanceError) && error.code !== 'P2034') console.error('[Financial record approval failed]', error);
    return NextResponse.json({ success: false, message: error instanceof FinanceError ? error.message : error.code === 'P2034' ? 'The record changed concurrently; reload and retry.' : 'Financial record review could not be saved.' }, { status });
  }
}
