'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { initialParkingZones } from '../../lib/mockData';
import { formatCurrency } from '../../lib/utils';
import { Car, MapPin, CheckCircle, ShieldCheck, ArrowRight, Shield } from 'lucide-react';

export default function PublicParkingDirectoryPage() {
  const [zones, setZones] = useState(initialParkingZones);

  useEffect(() => {
    async function loadZones() {
      try {
        const res = await fetch('/api/parking/reservations');
        const data = await res.json();
        if (data.success && data.zones) setZones(data.zones);
      } catch (err) {
        console.warn('Using local parking fallback');
      }
    }
    loadZones();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="success" size="md">
            OFFICIAL STADIUM PARKING PORTAL
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Smart Matchday Parking & Vehicle Access
          </h1>
          <p className="text-sm text-slate-400">
            Reserve matchday parking spaces, register vehicle registration numbers, and receive QR entry permits for barrier gates.
          </p>
        </div>

        {/* Parking Zones Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {zones.map((zone) => {
            const availabilityPercentage = Math.round(
              ((zone.capacity - zone.reserved) / zone.capacity) * 100
            );

            return (
              <div
                key={zone.id}
                className="bg-navy-900 border border-navy-800 hover:border-emerald-500/40 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Car className="w-5 h-5" />
                    </div>
                    <Badge variant="navy">{zone.category}</Badge>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{zone.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                      <span>{zone.location}</span>
                    </p>
                  </div>

                  {/* Availability Progress */}
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Available Spots:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {zone.capacity - zone.reserved} / {zone.capacity}
                      </span>
                    </div>
                    <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-navy-800">
                      <div
                        className="bg-emerald-400 h-full rounded-full"
                        style={{ width: `${availabilityPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-navy-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">Pass Fee</span>
                    <span className="text-base font-bold text-white">
                      {zone.priceKes === 0 ? 'FREE / STAFF' : formatCurrency(zone.priceKes)}
                    </span>
                  </div>

                  <Link href={`/parking/book?zoneId=${zone.id}`}>
                    <Button variant="primary" size="sm" className="space-x-1">
                      <span>Reserve Spot</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
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
