'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { initialParkingZones } from '../../lib/mockData';
import { formatCurrency } from '../../lib/utils';
import {
  Car,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Shield,
  Navigation,
  Bus,
  Clock,
  Accessibility,
  Ticket
} from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] font-sans text-neutral-800 selection:bg-[#E5B83F] selection:text-black">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ==================== 1. PAGE HEADER BANNER ==================== */}
        <section className="relative bg-[#F8F7F5] border-b border-[#E5E3DF] py-12 sm:py-16 overflow-hidden">
          {/* Subtle Geometric Background Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#E5B83F 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          ></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-3">
            <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
              PLAN YOUR VISIT
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black uppercase font-sans tracking-tight leading-none">
              PARKING & TRANSPORTATION
            </h1>
            <span className="text-xs font-black text-[#059669] uppercase tracking-wider block pt-1">
              Brought to you by Safaricom Mobility
            </span>
            {/* Red Accent Line */}
            <div className="w-16 h-1 bg-[#CC0000] my-2"></div>
          </div>
        </section>

        {/* ==================== 2. "ON THIS PAGE" QUICK JUMP BAR ==================== */}
        <section className="bg-white border-b border-[#E0E0E0] py-4 sticky top-[68px] z-20 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none text-xs font-black uppercase tracking-wider">
              <span className="text-neutral-400 mr-2 shrink-0">ON THIS PAGE:</span>
              <a href="#buy-parking" className="bg-[#FAF9F5] border border-[#DDDCD8] hover:border-[#CC0000] hover:text-[#CC0000] px-3.5 py-1.5 whitespace-nowrap transition-colors">
                BUY PARKING
              </a>
              <a href="#zone-maps" className="bg-[#FAF9F5] border border-[#DDDCD8] hover:border-[#CC0000] hover:text-[#CC0000] px-3.5 py-1.5 whitespace-nowrap transition-colors">
                ZONE MAPS
              </a>
              <a href="#rideshare" className="bg-[#FAF9F5] border border-[#DDDCD8] hover:border-[#CC0000] hover:text-[#CC0000] px-3.5 py-1.5 whitespace-nowrap transition-colors">
                RIDESHARE
              </a>
              <a href="#matatu-brt" className="bg-[#FAF9F5] border border-[#DDDCD8] hover:border-[#CC0000] hover:text-[#CC0000] px-3.5 py-1.5 whitespace-nowrap transition-colors">
                MATATU & BRT
              </a>
              <a href="#matchday-transport" className="bg-[#FAF9F5] border border-[#DDDCD8] hover:border-[#CC0000] hover:text-[#CC0000] px-3.5 py-1.5 whitespace-nowrap transition-colors">
                MATCH-DAY TRANSPORT
              </a>
              <a href="#accessibility-parking" className="bg-[#FAF9F5] border border-[#DDDCD8] hover:border-[#CC0000] hover:text-[#CC0000] px-3.5 py-1.5 whitespace-nowrap transition-colors">
                ACCESSIBILITY PARKING
              </a>
            </div>
          </div>
        </section>

        {/* ==================== 3. OVERVIEW & GUIDELINES ==================== */}
        <section className="py-12 bg-[#FAF9F5] border-b border-[#E5E3DF]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <p className="text-sm sm:text-base text-neutral-700 font-medium leading-relaxed">
              Save time and shillings by purchasing parking online before arriving at Talanta Stadium. Walk-up parking prices increase on event day, and parking lots fill quickly for high-demand events. Please plan to arrive early.
            </p>
            <p className="text-sm sm:text-base text-neutral-700 font-medium leading-relaxed bg-amber-50 border border-amber-200 p-4 text-amber-900 font-bold">
              All vehicles MUST have a valid parking pass. Without a pass, you will be turned away and directed to off-site options. Please reference our zone maps below for directions to your entry gate.
            </p>
          </div>
        </section>

        {/* ==================== 4. DETAILED INFORMATION SECTIONS ==================== */}
        <section className="py-12 sm:py-16 bg-white border-b border-[#E5E3DF]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {/* 1. BUY PARKING EARLY & SAVE */}
            <div id="buy-parking" className="space-y-3 scroll-mt-36">
              <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
                ADVANCE RESERVATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                Buy Parking Early & Save
              </h2>
              <div className="w-12 h-0.5 bg-[#CC0000] mb-3"></div>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                Pre-purchased parking is available for every public event. Choose from General, Preferred, VIP Suite and Accessible parking. Prices range from KSh 500 (General) to KSh 5,000 (VIP). Each parking pass is tied to a specific gate, Red, Green, Gold, or Black, and entry routes are enforced by Nairobi County traffic marshals.
              </p>
            </div>

            {/* 2. PARKING ZONE MAPS */}
            <div id="zone-maps" className="space-y-4 pt-4 border-t border-[#E0E0E0] scroll-mt-36">
              <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
                GATE ALLOCATIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                Parking Zone Maps
              </h2>
              <div className="w-12 h-0.5 bg-[#CC0000] mb-3"></div>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                Talanta Stadium operates four colour-coded parking zones, each linked to the nearest gate:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-[#FAF9F5] border-l-4 border-red-600 border-y border-r border-[#E0E0E0] p-4 space-y-1">
                  <span className="font-black text-red-600 uppercase text-sm block">Red Zone</span>
                  <span className="text-xs text-neutral-700 font-bold block">Ngong Road approach · closest to Gate A</span>
                  <span className="text-[11px] text-neutral-500 font-medium block">General & VIP Spectator Parking</span>
                </div>

                <div className="bg-[#FAF9F5] border-l-4 border-emerald-600 border-y border-r border-[#E0E0E0] p-4 space-y-1">
                  <span className="font-black text-emerald-600 uppercase text-sm block">Green Zone</span>
                  <span className="text-xs text-neutral-700 font-bold block">Lang'ata Road approach · Gate B</span>
                  <span className="text-[11px] text-neutral-500 font-medium block">General & Family Spectator Parking</span>
                </div>

                <div className="bg-[#FAF9F5] border-l-4 border-amber-500 border-y border-r border-[#E0E0E0] p-4 space-y-1">
                  <span className="font-black text-amber-600 uppercase text-sm block">Gold Zone</span>
                  <span className="text-xs text-neutral-700 font-bold block">Mbagathi Way approach · Gate C</span>
                  <span className="text-[11px] text-neutral-500 font-medium block">Premium & Executive Suite Holders</span>
                </div>

                <div className="bg-[#FAF9F5] border-l-4 border-slate-900 border-y border-r border-[#E0E0E0] p-4 space-y-1">
                  <span className="font-black text-slate-900 uppercase text-sm block">Black Zone</span>
                  <span className="text-xs text-neutral-700 font-bold block">Jamhuri Park East · Gate D</span>
                  <span className="text-[11px] text-neutral-500 font-medium block">Buses, Coaches & Heavy Transit</span>
                </div>
              </div>
            </div>

            {/* 3. RIDESHARE */}
            <div id="rideshare" className="space-y-3 pt-4 border-t border-[#E0E0E0] scroll-mt-36">
              <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
                TAXI & DROP-OFF ZONES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                Rideshare
              </h2>
              <div className="w-12 h-0.5 bg-[#CC0000] mb-3"></div>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                Uber, Bolt and Little Cab passengers should select <strong>"Talanta Rideshare"</strong> as the destination. Designated pick-up and drop-off zones are located at Gates A and C, clearly signed and supervised by stadium staff.
              </p>
            </div>

            {/* 4. MATATU & BRT ROUTES */}
            <div id="matatu-brt" className="space-y-3 pt-4 border-t border-[#E0E0E0] scroll-mt-36">
              <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
                PUBLIC TRANSIT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                Matatu & BRT Routes
              </h2>
              <div className="w-12 h-0.5 bg-[#CC0000] mb-3"></div>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                Talanta Stadium is served directly by matatu routes <strong>24, 102, 105 and 111</strong>. The Nairobi BRT Line 2 (Ngong Road corridor) stops at Talanta Plaza, a four-minute walk from Gate A. On event days, additional shuttles run from CBD (Hilton, Railways) and Westlands every 15 minutes.
              </p>
            </div>

            {/* 5. MATCH-DAY TRANSPORT */}
            <div id="matchday-transport" className="space-y-3 pt-4 border-t border-[#E0E0E0] scroll-mt-36">
              <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
                COMPLIMENTARY SHUTTLES
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                Match-Day Transport
              </h2>
              <div className="w-12 h-0.5 bg-[#CC0000] mb-3"></div>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                For Harambee Stars matches, AFCON 2027 fixtures and major concerts, complimentary shuttles run from Uhuru Park, KICC and Wilson Airport beginning four hours before kickoff. Return shuttles operate for two hours after the final whistle.
              </p>
            </div>

            {/* 6. ACCESSIBILITY PARKING */}
            <div id="accessibility-parking" className="space-y-3 pt-4 border-t border-[#E0E0E0] scroll-mt-36">
              <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
                INCLUSIVE ACCESS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                Accessibility Parking
              </h2>
              <div className="w-12 h-0.5 bg-[#CC0000] mb-3"></div>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                Accessible parking is available in all four zones, closest to the gates. A valid accessible-parking permit is required and must be displayed on the dashboard. For wheelchair-accessible shuttles from remote lots, see our <Link href="/help#accessibility" className="text-[#CC0000] underline font-bold">Accessibility Services page</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== 5. "RESERVE YOUR PARKING NOW" SMART CARDS ==================== */}
        <section className="py-16 bg-[#FAF9F5] border-b border-[#E5E3DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-block px-3.5 py-1.5 rounded-full bg-slate-200 text-slate-900 text-[11px] font-extrabold uppercase tracking-wider border border-slate-300">
                OFFICIAL STADIUM PARKING PORTAL
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-black uppercase font-sans tracking-tight">
                Reserve Your Parking Now
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                Reserve matchday parking spaces, register vehicle registration numbers, and receive QR entry permits for barrier gates.
              </p>
            </div>

            {/* 4 Smart Parking Cards in Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {zones.map((zone) => {
                const availabilityPercentage = Math.round(
                  ((zone.capacity - zone.reserved) / zone.capacity) * 100
                );

                return (
                  <div
                    key={zone.id}
                    className="bg-white border border-[#DDDCD8] rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-700 flex items-center justify-center">
                          <Car className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-full uppercase border border-slate-200">
                          {zone.category}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-black uppercase">{zone.name}</h3>
                        <p className="text-xs text-neutral-500 flex items-center space-x-1 mt-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#059669] mr-1 shrink-0" />
                          <span>{zone.location}</span>
                        </p>
                      </div>

                      {/* Availability Progress */}
                      <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-neutral-500">Available Spots:</span>
                          <span className="font-mono text-[#059669]">
                            {zone.capacity - zone.reserved} / {zone.capacity}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className="bg-[#059669] h-full rounded-full transition-all duration-500"
                            style={{ width: `${availabilityPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E0E0E0] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-500 uppercase font-medium block">PASS FEE</span>
                        <span className="text-base font-black text-black font-mono">
                          {zone.priceKes === 0 ? 'FREE / STAFF' : formatCurrency(zone.priceKes)}
                        </span>
                      </div>

                      <Link href={`/parking/book?zoneId=${zone.id}`}>
                        <button className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center space-x-1 transition-colors shadow-sm">
                          <span>Reserve Spot</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== 6. QUICK LINKS SECTION ==================== */}
        <section className="py-12 bg-[#FAF9F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link
                href="/parking"
                className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 hover:bg-[#E2E2E2] transition-colors group block"
              >
                <div className="w-8 h-0.5 bg-[#CC0000] mb-3"></div>
                <h3 className="text-sm font-black text-black uppercase font-sans tracking-tight group-hover:text-[#CC0000] transition-colors">
                  DIRECTIONS TO TALANTA STADIUM
                </h3>
                <p className="text-xs text-neutral-600 font-medium mt-2 leading-relaxed">
                  Parking, matatu routes, BRT and rideshare information.
                </p>
              </Link>

              <Link
                href="/parking"
                className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 hover:bg-[#E2E2E2] transition-colors group block"
              >
                <div className="w-8 h-0.5 bg-[#CC0000] mb-3"></div>
                <h3 className="text-sm font-black text-black uppercase font-sans tracking-tight group-hover:text-[#CC0000] transition-colors">
                  BUY PARKING
                </h3>
                <p className="text-xs text-neutral-600 font-medium mt-2 leading-relaxed">
                  We highly recommend purchasing parking ahead of your arrival.
                </p>
              </Link>

              <Link
                href="/suites"
                className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 hover:bg-[#E2E2E2] transition-colors group block"
              >
                <div className="w-8 h-0.5 bg-[#CC0000] mb-3"></div>
                <h3 className="text-sm font-black text-black uppercase font-sans tracking-tight group-hover:text-[#CC0000] transition-colors">
                  RESERVE A SUITE
                </h3>
                <p className="text-xs text-neutral-600 font-medium mt-2 leading-relaxed">
                  Experience premium amenities at an upcoming event at Talanta.
                </p>
              </Link>

              <Link
                href="/facilities"
                className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 hover:bg-[#E2E2E2] transition-colors group block"
              >
                <div className="w-8 h-0.5 bg-[#CC0000] mb-3"></div>
                <h3 className="text-sm font-black text-black uppercase font-sans tracking-tight group-hover:text-[#CC0000] transition-colors">
                  PLAN YOUR VISIT
                </h3>
                <p className="text-xs text-neutral-600 font-medium mt-2 leading-relaxed">
                  Parking, transport, prohibited items, bag policy and more.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
