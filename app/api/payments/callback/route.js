import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { generateDynamicQRToken } from '../../../../lib/tickets';
import { formatKenyaPhone, maskPhoneNumber, queryMpesaSTKStatus } from '../../../../lib/payments';
import { logAuditEvent } from '../../../../lib/audit';

const pendingPaymentStatuses = ['INITIATED', 'PENDING'];

export async function POST(req) {
  try {
    if (!process.env.DATABASE_URL || !prisma?.payment) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Payment verification is unavailable.' }, { status: 503 });
    }

    const body = await req.json();
    const stkCallback = body?.Body?.stkCallback;
    const checkoutRequestId = stkCallback?.CheckoutRequestID;
    const merchantRequestId = stkCallback?.MerchantRequestID;
    if (typeof checkoutRequestId !== 'string' || typeof stkCallback?.ResultCode !== 'number') {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Invalid callback payload.' }, { status: 400 });
    }

    const payment = await prisma.payment.findUnique({
      where: { checkoutRequestId },
      include: { booking: { include: { bookingItems: true } } },
    });
    if (!payment || !payment.booking) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Matching payment was not found.' }, { status: 404 });
    }
    if (payment.merchantRequestId && merchantRequestId !== payment.merchantRequestId) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Payment request reference did not match.' }, { status: 400 });
    }
    if (payment.status === 'SUCCESSFUL') {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Payment callback already processed.' });
    }
    if (!pendingPaymentStatuses.includes(payment.status)) {
      return NextResponse.json({ ResultCode: 1, ResultDesc: 'Payment is not awaiting verification.' }, { status: 409 });
    }

    const providerResult = await queryMpesaSTKStatus({ checkoutRequestId });
    if (String(providerResult.ResponseCode) !== '0' || !Number.isFinite(Number(providerResult.ResultCode))) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Payment status remains pending provider verification.' });
    }
    const verifiedResultCode = Number(providerResult.ResultCode);
    if (verifiedResultCode !== stkCallback.ResultCode) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Callback and provider status differ; payment remains pending.' });
    }

    if (verifiedResultCode === 0) {
      const metadata = stkCallback.CallbackMetadata?.Item;
      const amount = metadata?.find((item) => item.Name === 'Amount')?.Value;
      const receipt = metadata?.find((item) => item.Name === 'MpesaReceiptNumber')?.Value;
      const phone = metadata?.find((item) => item.Name === 'PhoneNumber')?.Value;
      const normalizedPhone = formatKenyaPhone(String(phone ?? ''));
      if (!Number.isFinite(Number(amount)) || Math.round(Number(amount)) !== Math.round(payment.amount)
        || !receipt || !normalizedPhone || normalizedPhone !== formatKenyaPhone(payment.phoneNumber || '')) {
        await logAuditEvent({
          action: 'PAYMENT_CALLBACK_MISMATCH',
          entityType: 'PAYMENT',
          entityId: payment.paymentRef,
          details: 'Provider-verified payment callback did not match the stored amount or payer phone.',
        });
        return NextResponse.json({ ResultCode: 1, ResultDesc: 'Payment details did not match the pending request.' }, { status: 409 });
      }

      await prisma.$transaction(async (tx) => {
        const claimed = await tx.payment.updateMany({
          where: { id: payment.id, status: { in: pendingPaymentStatuses } },
          data: { status: 'SUCCESSFUL', mpesaReceipt: String(receipt).slice(0, 40) },
        });
        if (claimed.count !== 1) {
          const current = await tx.payment.findUnique({ where: { id: payment.id }, select: { status: true } });
          if (current?.status === 'SUCCESSFUL') return;
          throw new Error('Payment could not be claimed for finalization.');
        }

        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { bookingStatus: 'CONFIRMED', mpesaReceipt: String(receipt).slice(0, 40) },
        });
        for (const item of payment.booking.bookingItems) {
          const ticketData = Array.from({ length: item.quantity }, () => {
            const ticketNumber = `TLN-${randomBytes(12).toString('hex').toUpperCase()}`;
            return {
              ticketNumber,
              bookingId: payment.bookingId,
              eventId: payment.booking.eventId,
              categoryId: item.categoryId,
              userId: payment.booking.userId,
              qrToken: generateDynamicQRToken({
                ticketNumber,
                orderRef: payment.booking.bookingRef,
                eventId: payment.booking.eventId,
                categoryName: item.categoryName,
                seatNumber: null,
              }),
            };
          });
          await tx.ticket.createMany({ data: ticketData });
        }
      }, { isolationLevel: 'Serializable' });

      await logAuditEvent({
        action: 'PAYMENT_SUCCESSFUL',
        entityType: 'PAYMENT',
        entityId: payment.paymentRef,
        details: `Provider-verified M-PESA payment confirmed for booking ${payment.booking.bookingRef}; receipt ${String(receipt).slice(0, 40)}; phone ${maskPhoneNumber(normalizedPhone)}.`,
      });
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Provider-verified payment and tickets recorded.' });
    }

    await prisma.$transaction(async (tx) => {
      const claimed = await tx.payment.updateMany({
        where: { id: payment.id, status: { in: pendingPaymentStatuses } },
        data: { status: 'FAILED' },
      });
      if (claimed.count !== 1) return;
      await tx.booking.update({ where: { id: payment.bookingId }, data: { bookingStatus: 'CANCELLED' } });
      for (const item of payment.booking.bookingItems) {
        await tx.ticketCategory.update({
          where: { id: item.categoryId },
          data: { availableSeats: { increment: item.quantity } },
        });
      }
    }, { isolationLevel: 'Serializable' });

    await logAuditEvent({
      action: 'PAYMENT_FAILED',
      entityType: 'PAYMENT',
      entityId: payment.paymentRef,
      details: `Provider-verified M-PESA payment failed for booking ${payment.booking.bookingRef}; inventory released.`,
    });
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Verified payment failure recorded and inventory released.' });
  } catch (err) {
    console.error('[M-PESA callback verification failed]', err);
    return NextResponse.json({ ResultCode: 1, ResultDesc: 'Payment status could not be verified.' }, { status: 503 });
  }
}
