'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  ChevronRight,
  Send,
  Mail,
  PhoneCall,
  Clock,
  CheckCircle2,
  Calendar,
  Users,
  Award,
  Sparkles,
  ShieldCheck,
  Building,
  ArrowRight,
  X,
} from 'lucide-react';

export default function HostAnEventPage() {
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('Concert / Music Festival');
  const [expectedAttendance, setExpectedAttendance] = useState('10,000 - 30,000');
  const [preferredDate, setPreferredDate] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleInquirySubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-neutral-900 font-sans selection:bg-[#E5B83F] selection:text-black">
      <Navbar />

      <main className="flex-1 w-full space-y-16 pb-20">
        {/* HERO SECTION WITH BOOKING INQUIRIES SIDEBAR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          {/* HEADER TITLE */}
          <div className="space-y-2 mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#E5B83F] block">PRIVATE EVENTS</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight uppercase font-sans">
              HOST AN EVENT
            </h1>
            <div className="w-16 h-1 bg-[#CC0000]" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* LEFT COLUMN: PITCH, CAPACITY & WHAT'S INCLUDED */}
            <div className="lg:col-span-8 space-y-10">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight font-heading">
                  KENYA'S FLAGSHIP STAGE FOR MOMENTS THAT MATTER.
                </h2>
                <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
                  From CAF qualifiers to gospel crusades, from continental summits to homecoming concerts, Talanta Stadium is built to host events that bring East Africa together. Our in-house production, hospitality and operations teams handle every detail so you can focus on the moment.
                </p>
              </div>

              {/* CAPACITY & CONFIGURATIONS */}
              <div className="space-y-3">
                <h3 className="text-lg font-black text-[#E5B83F] uppercase tracking-wider font-heading">
                  CAPACITY & CONFIGURATIONS
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm font-semibold text-neutral-700">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5B83F]" />
                    <span>Up to 60,000 for football and major concerts</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5B83F]" />
                    <span>Up to 45,000 in end-stage concert mode</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5B83F]" />
                    <span>Up to 5,000 in pitch-side gala configuration</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5B83F]" />
                    <span>Up to 1,200 in conference and breakout setups</span>
                  </li>
                </ul>
              </div>

              {/* WHAT'S INCLUDED */}
              <div className="space-y-3">
                <h3 className="text-lg font-black text-[#E5B83F] uppercase tracking-wider font-heading">
                  WHAT'S INCLUDED
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                  Dedicated event manager, in-house catering by Kenya's top hospitality groups, full A/V production partner, on-site security, ticketing integration, and 24/7 NMS access for load-in and load-out.
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN: BOOKING INQUIRIES CARD */}
            <div className="lg:col-span-4 bg-[#EAE8E3] p-8 rounded-2xl border border-neutral-300 space-y-6 shadow-sm">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E5B83F] block">GET IN TOUCH</span>
                <h3 className="text-2xl font-black text-black uppercase tracking-tight font-heading">BOOKING INQUIRIES</h3>
                <div className="w-10 h-0.5 bg-[#CC0000] mt-2" />
              </div>

              <div className="space-y-4 text-xs font-medium text-neutral-700">
                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">EMAIL</span>
                  <a href="mailto:events@talantastadium.co.ke" className="font-bold text-black hover:text-[#CC0000] text-sm block">
                    events@talantastadium.co.ke
                  </a>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">PHONE</span>
                  <a href="tel:+254200000000" className="font-bold text-black hover:text-[#CC0000] text-sm block">
                    +254 20 000 0000
                  </a>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">OFFICE HOURS</span>
                  <span className="font-bold text-black text-xs block">
                    Mon–Fri, 9:00 – 18:00 EAT
                  </span>
                </div>
              </div>

              <button
                onClick={() => setInquiryModalOpen(true)}
                className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase py-3.5 px-6 transition flex items-center justify-center space-x-2 shadow"
              >
                <span>SUBMIT INQUIRY</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* EVENT TYPES GRID SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div>
            <h2 className="text-4xl sm:text-5xl font-black text-black uppercase tracking-tight font-sans">
              EVENT TYPES
            </h2>
            <div className="w-20 h-1 bg-[#CC0000] mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* EVENT TYPE 1: CONCERTS & FESTIVALS */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-64 shadow-xl border border-neutral-200 group">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 flex flex-col w-2 h-8 rounded-full overflow-hidden shadow">
                  <div className="h-1/3 bg-black" />
                  <div className="h-1/3 bg-[#CC0000]" />
                  <div className="h-1/3 bg-[#008000]" />
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-black uppercase tracking-tight">CONCERTS & FESTIVALS</h3>
                </div>
              </div>

              <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
                <div className="border-b-2 border-[#CC0000] pb-1">
                  <h3 className="text-lg font-black text-black uppercase tracking-tight">CONCERTS & FESTIVALS</h3>
                </div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Stadium-scale capacity up to 60,000 with full production rigging and African-first staging.
                </p>
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="inline-flex items-center text-xs font-black uppercase text-black hover:text-[#CC0000] tracking-wider transition"
                >
                  MORE INFO <ChevronRight className="w-4 h-4 ml-1 text-[#CC0000]" />
                </button>
              </div>
            </div>

            {/* EVENT TYPE 2: SPORTING EVENTS */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-64 shadow-xl border border-neutral-200 group">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 flex flex-col w-2 h-8 rounded-full overflow-hidden shadow">
                  <div className="h-1/3 bg-black" />
                  <div className="h-1/3 bg-[#CC0000]" />
                  <div className="h-1/3 bg-[#008000]" />
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-black uppercase tracking-tight">SPORTING EVENTS</h3>
                </div>
              </div>

              <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
                <div className="border-b-2 border-[#CC0000] pb-1">
                  <h3 className="text-lg font-black text-black uppercase tracking-tight">SPORTING EVENTS</h3>
                </div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  FIFA-grade pitch, broadcast-ready lighting and CAF-compliant locker rooms.
                </p>
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="inline-flex items-center text-xs font-black uppercase text-black hover:text-[#CC0000] tracking-wider transition"
                >
                  MORE INFO <ChevronRight className="w-4 h-4 ml-1 text-[#CC0000]" />
                </button>
              </div>
            </div>

            {/* EVENT TYPE 3: CORPORATE & CONFERENCES */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-64 shadow-xl border border-neutral-200 group">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 flex flex-col w-2 h-8 rounded-full overflow-hidden shadow">
                  <div className="h-1/3 bg-black" />
                  <div className="h-1/3 bg-[#CC0000]" />
                  <div className="h-1/3 bg-[#008000]" />
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-black uppercase tracking-tight">CORPORATE & CONFERENCES</h3>
                </div>
              </div>

              <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
                <div className="border-b-2 border-[#CC0000] pb-1">
                  <h3 className="text-lg font-black text-black uppercase tracking-tight">CORPORATE & CONFERENCES</h3>
                </div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Pitch-side galas, product launches and pan-African summits.
                </p>
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="inline-flex items-center text-xs font-black uppercase text-black hover:text-[#CC0000] tracking-wider transition"
                >
                  MORE INFO <ChevronRight className="w-4 h-4 ml-1 text-[#CC0000]" />
                </button>
              </div>
            </div>

            {/* EVENT TYPE 4: CULTURAL & COMMUNITY */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-64 shadow-xl border border-neutral-200 group">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=800')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 flex flex-col w-2 h-8 rounded-full overflow-hidden shadow">
                  <div className="h-1/3 bg-black" />
                  <div className="h-1/3 bg-[#CC0000]" />
                  <div className="h-1/3 bg-[#008000]" />
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-black uppercase tracking-tight">CULTURAL & COMMUNITY</h3>
                </div>
              </div>

              <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
                <div className="border-b-2 border-[#CC0000] pb-1">
                  <h3 className="text-lg font-black text-black uppercase tracking-tight">CULTURAL & COMMUNITY</h3>
                </div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Madaraka Day, Jamhuri Day, weddings and faith-based gatherings.
                </p>
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="inline-flex items-center text-xs font-black uppercase text-black hover:text-[#CC0000] tracking-wider transition"
                >
                  MORE INFO <ChevronRight className="w-4 h-4 ml-1 text-[#CC0000]" />
                </button>
              </div>
            </div>

            {/* EVENT TYPE 5: FILMING & PHOTOGRAPHY */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-64 shadow-xl border border-neutral-200 group">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?auto=format&fit=crop&q=80&w=800')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 flex flex-col w-2 h-8 rounded-full overflow-hidden shadow">
                  <div className="h-1/3 bg-black" />
                  <div className="h-1/3 bg-[#CC0000]" />
                  <div className="h-1/3 bg-[#008000]" />
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-black uppercase tracking-tight">FILMING & PHOTOGRAPHY</h3>
                </div>
              </div>

              <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
                <div className="border-b-2 border-[#E5B83F] pb-1">
                  <h3 className="text-lg font-black text-[#E5B83F] uppercase tracking-tight">FILMING & PHOTOGRAPHY</h3>
                </div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Music videos, commercials and feature productions across iconic Nairobi backdrops.
                </p>
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="inline-flex items-center text-xs font-black uppercase text-[#E5B83F] hover:text-black tracking-wider transition"
                >
                  MORE INFO <ChevronRight className="w-4 h-4 ml-1 text-[#E5B83F]" />
                </button>
              </div>
            </div>

            {/* EVENT TYPE 6: PRIVATE EVENTS */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-64 shadow-xl border border-neutral-200 group">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 flex flex-col w-2 h-8 rounded-full overflow-hidden shadow">
                  <div className="h-1/3 bg-black" />
                  <div className="h-1/3 bg-[#CC0000]" />
                  <div className="h-1/3 bg-[#008000]" />
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-black uppercase tracking-tight">PRIVATE EVENTS</h3>
                </div>
              </div>

              <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
                <div className="border-b-2 border-[#CC0000] pb-1">
                  <h3 className="text-lg font-black text-black uppercase tracking-tight">PRIVATE EVENTS</h3>
                </div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Suites, club lounges and the field club for intimate experiences.
                </p>
                <button
                  onClick={() => setInquiryModalOpen(true)}
                  className="inline-flex items-center text-xs font-black uppercase text-black hover:text-[#CC0000] tracking-wider transition"
                >
                  MORE INFO <ChevronRight className="w-4 h-4 ml-1 text-[#CC0000]" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER: LET'S BUILD YOUR EVENT TOGETHER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#EAE8E3] p-8 sm:p-12 rounded-2xl border border-neutral-300 flex flex-wrap items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight font-sans">
                LET'S BUILD YOUR EVENT TOGETHER.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                Our team responds to inquiries within one business day.
              </p>
            </div>

            <button
              onClick={() => setInquiryModalOpen(true)}
              className="bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase py-4 px-8 transition flex items-center space-x-2 shadow-md rounded-none"
            >
              <span>CONTACT US →</span>
            </button>
          </div>
        </section>

        {/* QUICK ACTION GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
              <h3 className="text-base font-black text-black uppercase tracking-tight">DIRECTIONS TO TALANTA STADIUM</h3>
              <div className="w-10 h-0.5 bg-[#CC0000]" />
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Parking, matatu routes, BRT and rideshare information.
              </p>
            </div>

            <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
              <h3 className="text-base font-black text-[#E5B83F] uppercase tracking-tight">BUY PARKING</h3>
              <div className="w-10 h-0.5 bg-[#CC0000]" />
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                We highly recommend purchasing parking ahead of your arrival.
              </p>
            </div>

            <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
              <h3 className="text-base font-black text-black uppercase tracking-tight">RESERVE A SUITE</h3>
              <div className="w-10 h-0.5 bg-[#CC0000]" />
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Experience premium amenities at an upcoming event at Talanta.
              </p>
            </div>

            <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
              <h3 className="text-base font-black text-black uppercase tracking-tight">PLAN YOUR VISIT</h3>
              <div className="w-10 h-0.5 bg-[#CC0000]" />
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Parking, transport, prohibited items, bag policy and more.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* SUBMIT INQUIRY MODAL */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-200">
          <div className="bg-[#F7F6F3] border border-neutral-300 rounded-2xl w-full max-w-xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => { setInquiryModalOpen(false); setSubmitted(false); }}
              className="absolute top-4 right-4 text-neutral-500 hover:text-black p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E5B83F] block">OFFICIAL EVENT INQUIRY</span>
              <h3 className="text-2xl font-black text-black uppercase tracking-tight">SUBMIT EVENT INQUIRY</h3>
              <div className="w-12 h-1 bg-[#CC0000] mt-1" />
            </div>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-base font-extrabold text-black">Inquiry Received Successfully!</h4>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Thank you for reaching out. A dedicated Talanta Stadium event manager will contact you at <strong>{email}</strong> within one business day.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setInquiryModalOpen(false); }}
                  className="bg-black text-white font-extrabold text-xs uppercase px-6 py-2.5 rounded-none"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Wanjiku"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white border border-neutral-300 focus:border-[#CC0000] rounded-lg px-3 py-2 text-xs text-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-600 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-neutral-300 focus:border-[#CC0000] rounded-lg px-3 py-2 text-xs text-black focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-600 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+254 700 000 000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-neutral-300 focus:border-[#CC0000] rounded-lg px-3 py-2 text-xs text-black focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-600 block mb-1">Event Type</label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                      className="w-full bg-white border border-neutral-300 focus:border-[#CC0000] rounded-lg px-3 py-2 text-xs text-black focus:outline-none"
                    >
                      <option value="Concert / Music Festival">Concert / Music Festival</option>
                      <option value="Sporting Tournament">Sporting Tournament</option>
                      <option value="Corporate / Summit">Corporate / Summit</option>
                      <option value="Cultural / Faith Gathering">Cultural / Faith Gathering</option>
                      <option value="Filming & Photography">Filming & Photography</option>
                      <option value="Private VIP Suite Event">Private VIP Suite Event</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-600 block mb-1">Event Details & Requests</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide preferred dates, estimated attendance, staging setup details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-white border border-neutral-300 focus:border-[#CC0000] rounded-lg p-3 text-xs text-black focus:outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs uppercase py-3 tracking-wider flex items-center justify-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>SUBMIT EVENT INQUIRY</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
