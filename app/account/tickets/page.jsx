'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  Ticket,
  QrCode,
  Calendar,
  MapPin,
  Download,
  CheckCircle,
  ShieldCheck,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';

export default function CustomerTicketsWalletPage() {
  const [bookings, setBookings] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [dataMode, setDataMode] = useState('UNAVAILABLE');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    async function loadBookings() {
      try {
        const res = await fetch('/api/bookings', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || 'Ticket wallet is unavailable.');
        if (data.bookings) {
          setBookings(data.bookings);
          setDataMode(data.dataMode || 'UNAVAILABLE');
          setLoadError('');
        }
      } catch (err) {
        setBookings([]);
        setDataMode('UNAVAILABLE');
        setLoadError(err.message || 'Ticket wallet is unavailable.');
      }
    }

    loadBookings();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        {/* Offline Disclaimer Notice (Requirement 4) */}
        {isOffline || dataMode === 'SIMULATED' ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start space-x-3">
            <WifiOff className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white block">{dataMode === 'SIMULATED' ? 'Development Fixture Data' : 'Ticket validation unavailable offline'}</span>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                {dataMode === 'SIMULATED'
                  ? 'These records are simulated and are not proof of payment, ticket validity, or stadium admission.'
                  : 'No cached ticket credentials are stored on this device. Follow the venue-approved offline process; this screen does not approve entry.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-navy-900 border border-navy-800 text-xs text-slate-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-emerald-400" />
              <span>Ticket records loaded from the authenticated service.</span>
            </div>
            <Badge variant="success" size="sm">CONNECTED</Badge>
          </div>
        )}
        {loadError && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{loadError} <Link href="/login" className="underline">Sign in</Link></div>}

        {/* Header */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <Badge variant="success" size="sm" className="mb-2">
              CUSTOMER DIGITAL TICKET WALLET
            </Badge>
            <h1 className="text-2xl font-bold text-white">My Tickets & History</h1>
            <p className="text-xs text-slate-400">Only confirmed, provider-verified tickets are eligible for validation.</p>
          </div>

          <Link href="/tickets">
            <Button variant="primary" size="sm" className="space-x-2">
              <Ticket className="w-4 h-4" />
              <span>Book More Matches</span>
            </Button>
          </Link>
        </div>

        {/* Tickets Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <span>Confirmed Matchday Passes</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.filter((booking) => booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'PAID').flatMap((b) =>
              (b.tickets || []).map((tkt) => (
                <div
                  key={tkt.ticketNumber}
                  className="bg-navy-900 border border-navy-800 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ticket Ref</span>
                      <span className="font-mono text-sm font-bold text-emerald-400">{tkt.ticketNumber}</span>
                    </div>
                    <Badge variant={dataMode === 'DATABASE' && !isOffline && tkt.status === 'ISSUED' ? 'success' : 'warning'}>
                      {dataMode === 'DATABASE' && !isOffline && tkt.status === 'ISSUED' ? 'ISSUED - LIVE RECORD' : 'SIMULATED / UNVERIFIED'}
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{b.eventTitle}</h3>
                    <p className="text-xs text-emerald-400 font-medium mt-0.5">{b.categoryName}</p>
                  </div>

                  <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seat Allocation:</span>
                      <span className="font-bold text-white">{tkt.seatNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Booking Ref:</span>
                      <span className="font-mono text-white">{b.bookingRef || b.orderRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">M-PESA Receipt:</span>
                      <span className="font-mono text-emerald-400">{b.mpesaReceipt}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Link href={`/account/tickets/${tkt.ticketNumber}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full justify-center space-x-2">
                        <QrCode className="w-4 h-4" />
                        <span>Display Dynamic QR Pass</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
