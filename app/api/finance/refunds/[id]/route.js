import { NextResponse } from 'next/server';
import { authorizeFinanceRequest, completeProviderRefund, FinanceError, reviewRefund } from '../../../../../lib/financialManagement';

export async function PATCH(req, { params }) {
  try {
    const body = await req.json();
    const auth = await authorizeFinanceRequest(req, { write: true, facilityId: body.facilityId || null });
    if (!auth.authorized) return NextResponse.json({ success: false, message: 'Finance officer access to this facility is required.' }, { status: auth.status });
    const { id } = await params;

    if (body.action === 'COMPLETE' || body.providerRefundReference) {
      const request = await completeProviderRefund({
        refundId: id,
        providerRefundReference: body.providerRefundReference,
        providerConfirmation: body.providerConfirmation,
        actorId: auth.user.id,
        facilityId: auth.facilityId,
      });
      return NextResponse.json({
        success: true,
        request,
        message: 'Refund marked COMPLETED with verified provider confirmation reference.',
      });
    }

    const request = await reviewRefund({
      refundId: id,
      decision: body.decision,
      reason: body.reason,
      actorId: auth.user.id,
      facilityId: auth.facilityId,
    });
    return NextResponse.json({
      success: true,
      request,
      providerRefundAvailable: false,
      message: request.status === 'APPROVED'
        ? 'Refund approved for provider processing. It remains incomplete until verified provider confirmation is recorded.'
        : 'Refund request rejected with an audit reason.',
    });
  } catch (error) {
    const status = error instanceof FinanceError ? error.status : error.code === 'P2034' ? 409 : 503;
    if (!(error instanceof FinanceError) && error.code !== 'P2034') console.error('[Refund processing failed]', error);
    return NextResponse.json({ success: false, message: error.message || 'Refund request could not be processed.' }, { status });
  }
}
