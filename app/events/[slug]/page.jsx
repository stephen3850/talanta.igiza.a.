'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { initialEvents } from '../../../lib/mockData';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  Calendar,
  MapPin,
  Ticket,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Clock,
  User,
  ArrowLeft,
  Building2,
  PhoneCall,
  Info
} from 'lucide-react';

export default function PublicEventBySlugPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [phone, setPhone] = useState('0712345678');
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const slugOrId = params.slug;
        const res = await fetch(`/api/events?public=true&slug=${slugOrId}`);
        const data = await res.json();

        if (data.success && data.event) {
          setEvent(data.event);
          setSelectedCategory(data.event.categories?.[0] || null);
        } else {
          // Fallback search in mock published events
          const fallback = initialEvents.find(
            (e) => (e.slug === slugOrId || e.id === slugOrId) && e.status === 'PUBLISHED'
          );
          if (fallback) {
            setEvent(fallback);
            setSelectedCategory(fallback.categories?.[0] || null);
          }
        }
      } catch (err) {
        console.warn('Fallback event search');
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvent();
  }, [params.slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-navy-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-slate-400">
          Loading event details...
        </main>
        <Footer />
      </div>
    );
  }

  if (!event || event.status !== 'PUBLISHED') {
    return (
      <div className="min-h-screen flex flex-col bg-navy-950">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <Badge variant="danger" size="md">EVENT NOT PUBLICLY VISIBLE</Badge>
          <h1 className="text-2xl font-bold text-white">Fixture Not Found or Private</h1>
          <p className="text-xs text-slate-400 max-w-md">
            The requested event is either in draft review, completed, or does not exist on the public schedule.
          </p>
          <Button variant="primary" onClick={() => router.push('/events')}>
            View Public Event Schedule
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const subtotal = selectedCategory ? selectedCategory.price * quantity : 0;

  const handleCheckout = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          categoryId: selectedCategory.id,
          quantity: quantity,
          mpesaPhone: phone,
          userEmail: 'patron@example.com',
          userName: 'David Omondi',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBookingSuccess(data.order);
      }
    } catch (err) {
      alert('Order booking failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs text-slate-400 hover:text-white mb-6 space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Events</span>
        </button>

        {bookingSuccess ? (
          /* SUCCESS STATE */
          <div className="bg-navy-900 border border-emerald-500/50 rounded-2xl p-8 max-w-2xl mx-auto text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <Badge variant="success" size="md" className="mb-2">
                ORDER CONFIRMED & PAID
              </Badge>
              <h2 className="text-2xl font-bold text-white">Digital Ticket Issued!</h2>
              <p className="text-xs text-slate-300 mt-1">
                Order Ref: <span className="font-mono text-emerald-400 font-bold">{bookingSuccess.orderRef}</span> • M-PESA Receipt: <span className="font-mono text-white">{bookingSuccess.mpesaReceipt}</span>
              </p>
            </div>

            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 text-xs text-left space-y-2">
              <div className="flex justify-between border-b border-navy-800 pb-2">
                <span className="text-slate-400">Matchday Event:</span>
                <span className="font-bold text-white">{bookingSuccess.eventTitle}</span>
              </div>
              <div className="flex justify-between border-b border-navy-800 pb-2">
                <span className="text-slate-400">Category & Seat:</span>
                <span className="font-medium text-emerald-400">{bookingSuccess.categoryName} ({bookingSuccess.quantity} Tickets)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-white">{formatCurrency(bookingSuccess.totalAmount)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                className="flex-1 justify-center"
                onClick={() => router.push('/portal')}
              >
                View Tickets in Wallet
              </Button>
            </div>
          </div>
        ) : (
          /* EVENT DETAILS & BOOKING FORM */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left Event Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="relative h-72 rounded-2xl overflow-hidden border border-navy-800 shadow-2xl">
                <img
                  src={event.image || event.bannerUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent"></div>
                <Badge variant="navy" className="absolute top-4 left-4">
                  {event.category}
                </Badge>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                  {event.title}
                </h1>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-navy-900 p-5 rounded-2xl border border-navy-800 text-xs">
                <div className="flex items-center space-x-3 text-slate-300">
                  <Calendar className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Match Date & Time</span>
                    <span className="font-medium text-white">{formatDate(event.startDate)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-slate-300">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">Stadium Zone</span>
                    <span className="font-medium text-white">{event.venue} • Talanta Stadium</span>
                  </div>
                </div>

                {event.organizer && (
                  <div className="flex items-center space-x-3 text-slate-300">
                    <Building2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Organizer</span>
                      <span className="font-medium text-white">{event.organizer}</span>
                    </div>
                  </div>
                )}

                {event.contactInfo && (
                  <div className="flex items-center space-x-3 text-slate-300">
                    <PhoneCall className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-semibold">Support Info</span>
                      <span className="font-medium text-white">{event.contactInfo}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Ticket Selection & M-PESA Checkout */}
            <div className="lg:col-span-5 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="border-b border-navy-800 pb-4">
                <h3 className="text-lg font-bold text-white">Select Ticket Category</h3>
                <p className="text-xs text-slate-400">Choose your seating allocation & quantity</p>
              </div>

              {/* Category Selector */}
              <div className="space-y-3">
                {event.categories?.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedCategory?.id === cat.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-navy-950 border-navy-800 text-slate-300 hover:border-navy-700'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold">{cat.name || cat.categoryName}</h4>
                      <span className="text-[10px] text-slate-400">
                        {cat.available?.toLocaleString() || cat.availableSeats?.toLocaleString() || 'Available'} seats
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-400">
                        {formatCurrency(cat.price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quantity Picker */}
              <div className="flex items-center justify-between bg-navy-950 p-3 rounded-xl border border-navy-800">
                <span className="text-xs font-medium text-slate-300">Ticket Quantity</span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-white font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="font-mono text-sm font-bold text-white px-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(6, quantity + 1))}
                    className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-white font-bold text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* M-PESA Phone Form */}
              <form onSubmit={handleCheckout} className="space-y-4 pt-2 border-t border-navy-800">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Safaricom M-PESA Phone Number
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0712345678 or 254712345678"
                      className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Subtotal & Checkout Button */}
                <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{selectedCategory?.name || selectedCategory?.categoryName} x {quantity}</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-navy-800">
                    <span>Total Amount:</span>
                    <span className="text-emerald-400">{formatCurrency(subtotal)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center py-3 space-x-2"
                  isLoading={isProcessing}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay with M-PESA ({formatCurrency(subtotal)})</span>
                </Button>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
