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
  ArrowLeft,
  Users,
  Building2
} from 'lucide-react';

export default function TicketCategorySelectionPage() {
  const params = useParams();
  const router = useRouter();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        const data = await res.json();
        if (data.success && data.event) {
          setEvent(data.event);
          setSelectedCategory(data.event.categories?.[0] || null);
        } else {
          const fallback = initialEvents.find((e) => e.id === params.id || e.slug === params.id);
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
    loadEvent();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-navy-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-slate-400">
          Loading ticket category options...
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
          <Badge variant="danger" size="md">EVENT UNAVAILABLE</Badge>
          <h1 className="text-2xl font-bold text-white">Event Not Available For Booking</h1>
          <Button variant="primary" onClick={() => router.push('/tickets')}>
            Browse Available Events
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const unitPrice = selectedCategory ? selectedCategory.price : 0;
  const totalPrice = unitPrice * quantity;
  const maxQty = selectedCategory?.maxPurchaseQty || 6;

  const handleProceedToCheckout = () => {
    if (!selectedCategory) return;
    router.push(
      `/checkout?eventId=${event.id}&categoryId=${selectedCategory.id}&quantity=${quantity}`
    );
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
          <span>Back to Ticket Discovery</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Event Summary */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative h-64 rounded-2xl overflow-hidden border border-navy-800 shadow-2xl">
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
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
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
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Venue Zone</span>
                  <span className="font-medium text-white">{event.venue} • Talanta Stadium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Ticket Category Selector & Booking Summary */}
          <div className="lg:col-span-5 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl space-y-6">
            <div className="border-b border-navy-800 pb-4">
              <h3 className="text-lg font-bold text-white">Select Ticket Category</h3>
              <p className="text-xs text-slate-400">Configure seat location & quantity</p>
            </div>

            {/* Categories Selection List */}
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
                      {cat.available?.toLocaleString() || cat.availableSeats?.toLocaleString() || 'Available'} seats available
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

            {/* Quantity Selector */}
            <div className="flex items-center justify-between bg-navy-950 p-3 rounded-xl border border-navy-800">
              <div>
                <span className="text-xs font-medium text-slate-300 block">Ticket Quantity</span>
                <span className="text-[10px] text-slate-500">Max {maxQty} per transaction</span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-white font-bold text-sm"
                >
                  -
                </button>
                <span className="font-mono text-sm font-bold text-white px-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
                  className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-white font-bold text-sm"
                >
                  +
                </button>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Unit Price ({selectedCategory?.name || selectedCategory?.categoryName}):</span>
                <span>{formatCurrency(unitPrice)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Quantity:</span>
                <span>{quantity} Ticket(s)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-navy-800">
                <span>Total Amount:</span>
                <span className="text-emerald-400">{formatCurrency(totalPrice)}</span>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              onClick={handleProceedToCheckout}
              className="w-full justify-center py-3 space-x-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Proceed to Checkout ({formatCurrency(totalPrice)})</span>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
