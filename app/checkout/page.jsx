'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Ticket,
  Lock
} from 'lucide-react';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const eventId = searchParams.get('eventId');
  const categoryId = searchParams.get('categoryId');
  const quantityParam = parseInt(searchParams.get('quantity') || '1', 10);

  const [event, setEvent] = useState(null);
  const [category, setCategory] = useState(null);
  const [phone, setPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Load Event & Category
  useEffect(() => {
    async function loadData() {
      if (!eventId) return;
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        if (data.success && data.event) {
          const evt = data.event;
          setEvent(evt);
          const cat = evt.categories?.find((c) => c.id === categoryId) || evt.categories?.[0];
          setCategory(cat);
        } else setErrorMsg(data.message || 'Event is unavailable for booking.');
      } catch (err) {
        setErrorMsg('Event service is unavailable. Booking data could not be verified.');
      }
    }
    loadData();
  }, [eventId, categoryId]);

  const quantity = Math.min(6, Math.max(1, quantityParam));
  const unitPrice = category ? category.price : 0;
  const totalAmount = unitPrice * quantity;

  const handleMpesaPay = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          categoryId: category.id,
          quantity,
          mpesaPhone: phone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data.booking);
      } else {
        setErrorMsg(data.message || 'Payment initiation failed');
      }
    } catch (err) {
      setErrorMsg('Server connection error during payment processing');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!event || !category) {
    return (
      <div className="p-8 text-center text-slate-400" role={errorMsg ? 'alert' : 'status'}>
        {errorMsg || 'Loading checkout session...'}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-xs text-slate-400 hover:text-white space-x-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Category Selection</span>
      </button>

      {bookingSuccess ? (
        /* SUCCESS CONFIRMATION */
        <div className="bg-navy-900 border border-emerald-500/50 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <Badge variant="success" size="md" className="mb-2">
              {bookingSuccess.bookingStatus === 'CONFIRMED' && bookingSuccess.paymentStatus === 'PAID'
                ? 'PAYMENT VERIFIED & TICKETS ISSUED'
                : bookingSuccess.isSimulated ? 'SIMULATED - NO PAYMENT OR TICKETS' : 'PAYMENT REQUEST PENDING'}
            </Badge>
            <h1 className="text-2xl font-bold text-white">
              {bookingSuccess.bookingStatus === 'CONFIRMED' && bookingSuccess.paymentStatus === 'PAID'
                ? 'Payment Verified'
                : bookingSuccess.isSimulated ? 'Development Simulation' : 'Payment Pending'}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
                Booking Reference: <span className="font-mono text-emerald-400 font-bold">{bookingSuccess.bookingRef || bookingSuccess.orderRef}</span>
                {bookingSuccess.mpesaReceipt && <> • M-PESA Receipt: <span className="font-mono text-white">{bookingSuccess.mpesaReceipt}</span></>}
            </p>
            <p className="text-xs text-amber-200">{bookingSuccess.isSimulated
              ? 'No seats were reserved, no payment was initiated, and no tickets were issued.'
              : bookingSuccess.bookingStatus === 'CONFIRMED' && bookingSuccess.paymentStatus === 'PAID'
                ? 'Provider verification succeeded; ticket credentials are available in your wallet.'
                : 'Do not make another payment while this request is pending. Tickets are issued only after provider verification.'}</p>
          </div>

          <div className="bg-navy-950 p-5 rounded-2xl border border-navy-800 text-xs text-left space-y-2.5">
            <div className="flex justify-between border-b border-navy-800 pb-2">
              <span className="text-slate-400">Event Title:</span>
              <span className="font-bold text-white">{bookingSuccess.eventTitle}</span>
            </div>
            <div className="flex justify-between border-b border-navy-800 pb-2">
              <span className="text-slate-400">Category & Quantity:</span>
              <span className="font-medium text-emerald-400">{bookingSuccess.categoryName} ({bookingSuccess.quantity} Tickets)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total (KES):</span>
              <span className="font-bold text-white">{formatCurrency(bookingSuccess.totalAmount)}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-4">
            <Button
              variant="primary"
              className="flex-1 justify-center py-3"
              onClick={() => router.push('/account/tickets')}
            >
              Go to My Digital Ticket Wallet
            </Button>
          </div>
        </div>
      ) : (
        /* CHECKOUT REVIEW FORM */
        <div className="space-y-8">
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Order Summary */}
            <div className="lg:col-span-6 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="border-b border-navy-800 pb-4">
                <h2 className="text-lg font-bold text-white">1. Order Review</h2>
                <p className="text-xs text-slate-400">{event.isSimulated ? 'Development fixture pricing; not an active offer.' : 'Pricing and inventory are checked again by the booking service.'}</p>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="font-bold text-white text-base">{event.title}</div>
                <div className="text-emerald-400 font-medium">{event.category} • {event.venue}</div>
                <div className="text-slate-400">{formatDate(event.startDate)}</div>

                <div className="pt-4 border-t border-navy-800 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-bold text-white">{category.name || category.categoryName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Unit Price:</span>
                    <span className="font-mono text-white">{formatCurrency(unitPrice)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Quantity:</span>
                    <span className="font-mono text-white">{quantity} Ticket(s)</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t border-navy-800 text-sm font-bold">
                    <span className="text-white">Total Amount (KES):</span>
                    <span className="text-emerald-400 font-mono text-base">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Payment Details */}
            <div className="lg:col-span-6 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="border-b border-navy-800 pb-4">
                <h2 className="text-lg font-bold text-white">2. Account & M-PESA Details</h2>
                <p className="text-xs text-slate-400">Sign in first; booking ownership is taken from your authenticated account.</p>
              </div>

              <form onSubmit={handleMpesaPay} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Safaricom M-PESA Phone Number *
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712345678 or 254712345678"
                      className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-[11px] text-slate-400 flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Payment requests require configured Daraja credentials. No ticket is issued until provider verification succeeds.</span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center py-3.5 space-x-2 shadow-emerald-500/25"
                  isLoading={isProcessing}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{event.isSimulated ? 'Run Development Simulation' : `Pay with M-PESA (${formatCurrency(totalAmount)})`}</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading checkout session...</div>}>
          <CheckoutContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
