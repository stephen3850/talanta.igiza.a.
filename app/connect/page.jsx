'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  ChevronRight,
  Send,
  ShieldCheck,
  Search,
  MapPin,
  Car,
  Ticket,
  Calendar,
  Users,
  Briefcase,
  HelpCircle,
} from 'lucide-react';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const TikTokIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export default function ConnectPage() {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [lostItemSubmitted, setLostItemSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-neutral-900 font-sans selection:bg-[#E5B83F] selection:text-black">
      <Navbar />

      <main className="flex-1 w-full space-y-16 pb-20">
        {/* HERO HEADER SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5B83F] block">STAY IN TOUCH</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tight uppercase font-sans">
              CONNECT
            </h1>
            <div className="w-20 h-1 bg-[#CC0000] mt-2" />
          </div>

          <p className="text-sm sm:text-base text-neutral-600 max-w-3xl font-medium leading-relaxed pt-2">
            Stay close to everything happening at Talanta, pre-sales, behind-the-scenes content, careers, feedback and more.
          </p>

          {/* 3 IMAGE HERO CARDS WITH KENYA FLAG BADGES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            <div className="relative rounded-xl overflow-hidden h-64 shadow-xl group border border-neutral-200">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=800')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              {/* Kenya flag ribbon badge */}
              <div className="absolute top-3 right-3 flex flex-col w-2 h-8 rounded-full overflow-hidden shadow">
                <div className="h-1/3 bg-black" />
                <div className="h-1/3 bg-[#CC0000]" />
                <div className="h-1/3 bg-[#008000]" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E5B83F] block">EXCLUSIVE ACCESS</span>
                <h3 className="text-lg font-black uppercase tracking-tight">VIP ENTRANCE & LOUNGE</h3>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden h-64 shadow-xl group border border-neutral-200">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=800')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute top-3 right-3 flex flex-col w-2 h-8 rounded-full overflow-hidden shadow">
                <div className="h-1/3 bg-black" />
                <div className="h-1/3 bg-[#CC0000]" />
                <div className="h-1/3 bg-[#008000]" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E5B83F] block">60,000 CAPACITY BOWL</span>
                <h3 className="text-lg font-black uppercase tracking-tight">MATCHDAY ATMOSPHERE</h3>
              </div>
            </div>

            <div className="relative rounded-xl overflow-hidden h-64 shadow-xl group border border-neutral-200">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&q=80&w=800')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute top-3 right-3 flex flex-col w-2 h-8 rounded-full overflow-hidden shadow">
                <div className="h-1/3 bg-black" />
                <div className="h-1/3 bg-[#CC0000]" />
                <div className="h-1/3 bg-[#008000]" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E5B83F] block">FAN SERVICES</span>
                <h3 className="text-lg font-black uppercase tracking-tight">CONCESSIONS & GATE A</h3>
              </div>
            </div>
          </div>
        </section>

        {/* ENGAGEMENT CARDS SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* CARD 1: TALANTA INSIDERS */}
            <div className="bg-[#EAE8E3] p-8 rounded-2xl border border-neutral-300 space-y-4 shadow-sm hover:shadow-md transition">
              <div className="border-b-2 border-[#CC0000] pb-2">
                <h2 className="text-2xl font-black text-black uppercase tracking-tight">TALANTA INSIDERS</h2>
              </div>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Join the official fan club for presale access, discounts, and exclusive events.
              </p>
              <Link href="/events" className="inline-flex items-center text-xs font-black uppercase text-black hover:text-[#CC0000] tracking-wider transition">
                MORE INFO <ChevronRight className="w-4 h-4 ml-1 text-[#CC0000]" />
              </Link>
            </div>

            {/* CARD 2: FEEDBACK FORM */}
            <div className="bg-[#EAE8E3] p-8 rounded-2xl border border-neutral-300 space-y-4 shadow-sm hover:shadow-md transition">
              <div className="border-b-2 border-[#E5B83F] pb-2">
                <h2 className="text-2xl font-black text-[#E5B83F] uppercase tracking-tight">FEEDBACK FORM</h2>
              </div>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Tell us about your experience at Talanta Stadium. We value your input.
              </p>
              <button
                onClick={() => setFeedbackSubmitted(!feedbackSubmitted)}
                className="inline-flex items-center text-xs font-black uppercase text-[#E5B83F] hover:text-black tracking-wider transition"
              >
                MORE INFO <ChevronRight className="w-4 h-4 ml-1 text-[#E5B83F]" />
              </button>
            </div>

            {/* CARD 3: LOST & FOUND */}
            <div className="bg-[#EAE8E3] p-8 rounded-2xl border border-neutral-300 space-y-4 shadow-sm hover:shadow-md transition">
              <div className="border-b-2 border-[#CC0000] pb-2">
                <h2 className="text-2xl font-black text-black uppercase tracking-tight">LOST & FOUND</h2>
              </div>
              <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                Report missing items or check if something was turned in after an event.
              </p>
              <button
                onClick={() => setLostItemSubmitted(!lostItemSubmitted)}
                className="inline-flex items-center text-xs font-black uppercase text-black hover:text-[#CC0000] tracking-wider transition"
              >
                MORE INFO <ChevronRight className="w-4 h-4 ml-1 text-[#CC0000]" />
              </button>
            </div>
          </div>
        </section>

        {/* CAREERS & OPPORTUNITIES SECTION */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* CAREERS IMAGE & TEXT */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-72 shadow-xl border border-neutral-200 group">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-black uppercase tracking-tight">CAREERS</h3>
                </div>
              </div>

              <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
                <div className="border-b-2 border-[#E5B83F] pb-1">
                  <h3 className="text-xl font-black text-[#E5B83F] uppercase tracking-tight">CAREERS</h3>
                </div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Join our team. View open positions in operations, hospitality, and management.
                </p>
                <Link href="/contact" className="inline-flex items-center text-xs font-black uppercase text-[#E5B83F] hover:text-black tracking-wider transition">
                  MORE INFO <ChevronRight className="w-4 h-4 ml-1 text-[#E5B83F]" />
                </Link>
              </div>
            </div>

            {/* PART-TIME OPPORTUNITIES IMAGE & TEXT */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden h-72 shadow-xl border border-neutral-200 group">
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-black uppercase tracking-tight">PART-TIME OPPORTUNITIES</h3>
                </div>
              </div>

              <div className="bg-[#EAE8E3] p-6 rounded-2xl border border-neutral-300 space-y-3">
                <div className="border-b-2 border-[#CC0000] pb-1">
                  <h3 className="text-xl font-black text-black uppercase tracking-tight">PART-TIME OPPORTUNITIES</h3>
                </div>
                <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                  Apply to be an usher, ticket taker, or guest services representative on event days.
                </p>
                <Link href="/contact" className="inline-flex items-center text-xs font-black uppercase text-black hover:text-[#CC0000] tracking-wider transition">
                  MORE INFO <ChevronRight className="w-4 h-4 ml-1 text-[#CC0000]" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOLLOW US ON SOCIAL MEDIA SECTION */}
        <section className="bg-[#EAE8E3] py-12 border-y border-neutral-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div>
              <h2 className="text-3xl font-black text-black uppercase tracking-tight">FOLLOW US ON SOCIAL MEDIA</h2>
              <div className="w-20 h-1 bg-[#CC0000] mt-2" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:border-[#E5B83F] flex flex-col items-center justify-center text-center space-y-3 group transition shadow-sm"
              >
                <FacebookIcon className="w-8 h-8 text-[#E5B83F] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-wider text-black group-hover:text-[#E5B83F]">FACEBOOK</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="bg-[#E2E0D9] p-6 rounded-xl border border-[#E5B83F] flex flex-col items-center justify-center text-center space-y-3 group transition shadow-sm"
              >
                <InstagramIcon className="w-8 h-8 text-[#E5B83F] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-wider text-[#E5B83F]">INSTAGRAM</span>
              </a>

              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:border-[#E5B83F] flex flex-col items-center justify-center text-center space-y-3 group transition shadow-sm"
              >
                <TwitterIcon className="w-8 h-8 text-[#E5B83F] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-wider text-black group-hover:text-[#E5B83F]">TWITTER / X</span>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:border-[#E5B83F] flex flex-col items-center justify-center text-center space-y-3 group transition shadow-sm"
              >
                <YoutubeIcon className="w-8 h-8 text-[#E5B83F] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-wider text-black group-hover:text-[#E5B83F]">YOUTUBE</span>
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="bg-white p-6 rounded-xl border border-neutral-200 hover:border-[#E5B83F] flex flex-col items-center justify-center text-center space-y-3 group transition shadow-sm col-span-2 sm:col-span-1"
              >
                <TikTokIcon className="w-8 h-8 text-[#E5B83F] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black uppercase tracking-wider text-black group-hover:text-[#E5B83F]">TIKTOK</span>
              </a>
            </div>
          </div>
        </section>

        {/* QUICK ACTION GRID (DIRECTIONS, BUY PARKING, SUITE, PLAN VISIT) */}
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
              <h3 className="text-base font-black text-black uppercase tracking-tight">BUY PARKING</h3>
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

      <Footer />
    </div>
  );
}
