'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Heart,
  Shield,
  CloudRain,
  PhoneCall,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export default function SafetyPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setModalOpen(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] font-sans text-neutral-800 selection:bg-[#E5B83F] selection:text-black">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ==================== 1. PAGE HEADER ==================== */}
        <section className="relative bg-[#F8F7F5] border-b border-[#E5E3DF] py-12 sm:py-16 overflow-hidden">
          {/* Subtle Refined Background Pattern */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#E5B83F 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          ></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="space-y-3">
              <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
                PLAN YOUR VISIT
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black uppercase font-sans tracking-tight leading-none">
                HEALTH & SAFETY
              </h1>
              {/* Red Accent Line */}
              <div className="w-16 h-1 bg-[#CC0000] my-2"></div>
            </div>
          </div>
        </section>

        {/* ==================== 2. 4 PILLAR CARDS ROW ==================== */}
        <section className="py-12 bg-[#FAF9F5] border-b border-[#E5E3DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Pillar 1: FIRST AID */}
              <div className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 space-y-2">
                <Heart className="w-6 h-6 text-[#E5B83F]" />
                <h3 className="text-base sm:text-lg font-black text-black uppercase font-sans">
                  FIRST AID
                </h3>
                <div className="w-8 h-0.5 bg-[#CC0000] my-1.5"></div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Staffed first-aid stations on every concourse. Look for the green cross.
                </p>
              </div>

              {/* Pillar 2: AEDS */}
              <div className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 space-y-2">
                <Shield className="w-6 h-6 text-[#E5B83F]" />
                <h3 className="text-base sm:text-lg font-black text-black uppercase font-sans">
                  AEDS
                </h3>
                <div className="w-8 h-0.5 bg-[#CC0000] my-1.5"></div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  32 automated external defibrillators positioned within 90 seconds of every seat.
                </p>
              </div>

              {/* Pillar 3: WEATHER PLAN */}
              <div className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 space-y-2">
                <CloudRain className="w-6 h-6 text-[#E5B83F]" />
                <h3 className="text-base sm:text-lg font-black text-black uppercase font-sans">
                  WEATHER PLAN
                </h3>
                <div className="w-8 h-0.5 bg-[#CC0000] my-1.5"></div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Covered upper concourse. Severe-weather alerts shown on big screens and app.
                </p>
              </div>

              {/* Pillar 4: EMERGENCIES */}
              <div className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 space-y-2">
                <PhoneCall className="w-6 h-6 text-[#E5B83F]" />
                <h3 className="text-base sm:text-lg font-black text-black uppercase font-sans">
                  EMERGENCIES
                </h3>
                <div className="w-8 h-0.5 bg-[#CC0000] my-1.5"></div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Dial 999 or text the Talanta Safety line at <strong className="text-black">+254 700 999 000</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 3. SAFETY NOTICES SECTION ==================== */}
        <section className="py-12 sm:py-16 bg-[#FAF9F5] border-b border-[#E5E3DF]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Notice 1 */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                IF YOU SEE SOMETHING, SAY SOMETHING
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-3xl">
                Report suspicious activity to any uniformed steward, text the Safety line at <strong className="text-black font-extrabold">+254 700 999 000</strong>, or visit the nearest Guest Services booth. Discreet response is guaranteed.
              </p>
            </div>

            {/* Notice 2 */}
            <div className="space-y-2 pt-2 border-t border-[#E0E0E0]">
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                MEDICAL CONDITIONS
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-3xl">
                Guests with chronic conditions are encouraged to register in advance with Guest Services. Wheelchair-accessible first-aid is available at every station.
              </p>
            </div>

            {/* Notice 3 */}
            <div className="space-y-2 pt-2 border-t border-[#E0E0E0]">
              <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                LOST CHILDREN
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed max-w-3xl">
                Lost children are escorted to the Guest Services booth at Gate 4. Parents should approach any steward immediately.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== 4. PLAN AHEAD BANNER ==================== */}
        <section className="py-12 bg-[#F8F7F5] border-b border-[#E5E3DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-[#E0E0E0] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
              <div className="space-y-2 max-w-2xl relative z-10">
                <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                  PLAN AHEAD, REGISTER MEDICAL NEEDS
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                  Register chronic health conditions or special assistance requirements before matchday.
                </p>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 transition-colors shadow-sm rounded-none shrink-0 flex items-center space-x-2 relative z-10"
              >
                <span>CONTACT GUEST SERVICES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ==================== 5. QUICK LINKS SECTION ==================== */}
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

      {/* ==================== REGISTER MEDICAL NEEDS MODAL ==================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white border border-[#E0E0E0] rounded-none w-full max-w-md p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-black text-[#CC0000] uppercase tracking-widest block">
                MEDICAL ASSISTANCE REGISTRATION
              </span>
              <h3 className="text-xl font-black text-black uppercase">REGISTER MEDICAL NEEDS</h3>
            </div>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-center text-xs font-bold space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span>Medical Registration Submitted!</span>
                <span className="block text-[10px] text-emerald-700 font-medium">Guest Services will coordinate first-aid support for your visit.</span>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Kamau"
                    className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3 py-2 text-xs text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+254 700 000 000"
                    className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3 py-2 text-xs text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-700 mb-1">Medical / Special Requirement</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. Wheelchair assistance, insulin storage, sensory room access..."
                    className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3 py-2 text-xs text-black focus:outline-none resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase py-3.5 transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  <span>SUBMIT REGISTRATION</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================== FOOTER ==================== */}
      <Footer />
    </div>
  );
}
