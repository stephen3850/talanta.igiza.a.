'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { initialParkingReservations } from '../../../lib/mockData';
import { generateQRSVGDataUri } from '../../../lib/tickets';
import { formatCurrency } from '../../../lib/utils';
import { Car, QrCode, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';

export default function CustomerParkingWalletPage() {
  const [reservations, setReservations] = useState(initialParkingReservations);

  useEffect(() => {
    async function loadParking() {
      try {
        const res = await fetch('/api/parking/reservations?email=patron@example.com');
        const data = await res.json();
        if (data.success && data.reservations) setReservations(data.reservations);
      } catch (err) {
        console.warn('Using local parking fallback');
      }
    }
    loadParking();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div>
            <Badge variant="success" size="sm" className="mb-2">
              PATRON PARKING WALLET
            </Badge>
            <h1 className="text-2xl font-bold text-white">David Omondi's Vehicle Permits</h1>
            <p className="text-xs text-slate-400">View active parking permits, registered vehicle plate numbers, and barrier entry QR codes</p>
          </div>

          <Link href="/parking/book">
            <Button variant="primary" size="sm" className="space-x-2">
              <Car className="w-4 h-4" />
              <span>Reserve Another Parking Spot</span>
            </Button>
          </Link>
        </div>

        {/* Permits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservations.map((res) => {
            const qrSvg = generateQRSVGDataUri(res.reservationRef);
            return (
              <div
                key={res.id}
                className="bg-navy-900 border border-navy-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-4 transition-all"
              >
                <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Permit Ref</span>
                    <span className="font-mono text-sm font-bold text-emerald-400">{res.reservationRef}</span>
                  </div>
                  <Badge variant={res.status === 'PARKED_INSIDE' ? 'success' : 'navy'}>
                    {res.status}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono">{res.vehiclePlate}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{res.zoneName}</p>
                  </div>

                  <div className="bg-white p-2 rounded-xl border-2 border-emerald-500">
                    <img src={qrSvg} alt="Parking QR Permit" className="w-16 h-16" />
                  </div>
                </div>

                <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs text-slate-300 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Matchday Event:</span>
                    <span className="font-bold text-white">{res.eventTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fee Paid:</span>
                    <span className="font-mono text-emerald-400">{formatCurrency(res.amountKes)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
