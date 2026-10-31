'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { HelpCircle, ShieldCheck, Smartphone, AlertCircle, PhoneCall, Accessibility, Shield, HeartPulse } from 'lucide-react';

export default function HelpPage() {
  const faqs = [
    {
      q: 'How do I purchase matchday tickets using M-PESA?',
      a: 'Select your preferred match fixture, choose your seat category and quantity, enter your Safaricom phone number, and click "Pay with M-PESA". You will receive an instant STK Push prompt on your mobile phone to enter your M-PESA PIN. Once completed, your ticket will appear instantly in your digital wallet.',
    },
    {
      q: 'How does turnstile gate scanning work on matchday?',
      a: 'Open your Digital Ticket Wallet on your mobile phone or print out your PDF e-ticket. Present the dynamic QR code to the turnstile optical scanner at your assigned gate zone. A green light and audio chime will confirm entry approval.',
    },
    {
      q: 'Can I transfer a ticket to a friend or family member?',
      a: 'Yes, tickets can be transferred securely from your Customer Portal. Once transferred, the original ticket QR token is revoked and a new cryptographically signed ticket is issued to the recipient.',
    },
    {
      q: 'What should I do if my turnstile scan is rejected?',
      a: 'If a turnstile scan displays a red rejection indicator, please step aside to the nearest Gate Supervisor Exception Kiosk located at every entrance. Stewards will verify your order reference and assist you immediately.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] font-sans text-neutral-800 selection:bg-[#E5B83F] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
            MATCHDAY HELP CENTRE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-black uppercase font-sans tracking-tight">
            Help, FAQs & Ticketing Guidelines
          </h1>
          <div className="w-16 h-1 bg-[#CC0000] mx-auto my-2"></div>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium">
            Everything you need to know for a smooth matchday experience at Talanta Stadium.
          </p>
        </div>

        {/* ACCESSIBILITY SECTION (Anchor #accessibility) */}
        <section id="accessibility" className="bg-white border border-[#DDDCD8] p-6 sm:p-8 space-y-4 shadow-sm scroll-mt-28">
          <div className="flex items-center space-x-3 border-b border-[#E0E0E0] pb-3">
            <Accessibility className="w-6 h-6 text-[#CC0000]" />
            <div>
              <h2 className="text-xl font-black text-black uppercase font-sans">ACCESSIBILITY SERVICES</h2>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Step-free access & inclusive spectator facilities</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-700 leading-relaxed font-medium">
            <div className="bg-[#F8F7F5] p-4 border border-[#E0E0E0]">
              <strong className="block text-black mb-1 uppercase font-extrabold">Wheelchair Seating & Ramps</strong>
              Step-free access ramps, dedicated elevators, and designated wheelchair spectator bays across Lower, Club, and Suite seating tiers.
            </div>
            <div className="bg-[#F8F7F5] p-4 border border-[#E0E0E0]">
              <strong className="block text-black mb-1 uppercase font-extrabold">Assistive Mobility Shuttles</strong>
              Complimentary electric mobility shuttles operate from designated Accessible Parking Lots to main stadium turnstile gates.
            </div>
          </div>
        </section>

        {/* SAFETY SECTION (Anchor #safety) */}
        <section id="safety" className="bg-white border border-[#DDDCD8] p-6 sm:p-8 space-y-4 shadow-sm scroll-mt-28">
          <div className="flex items-center space-x-3 border-b border-[#E0E0E0] pb-3">
            <Shield className="w-6 h-6 text-[#CC0000]" />
            <div>
              <h2 className="text-xl font-black text-black uppercase font-sans">MATCHDAY SAFETY & SECURITY</h2>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Gate screening, prohibited items & medical first aid</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-neutral-700 leading-relaxed font-medium">
            <div className="bg-[#F8F7F5] p-4 border border-[#E0E0E0]">
              <strong className="block text-black mb-1 uppercase font-extrabold">Bag Policy & Security Check</strong>
              Clear bag policy enforced. Bags larger than 12" x 6" x 12" are restricted. All guests undergo optical QR verification and security screening.
            </div>
            <div className="bg-[#F8F7F5] p-4 border border-[#E0E0E0]">
              <strong className="block text-black mb-1 uppercase font-extrabold">Medical Stations & First Aid</strong>
              Fully equipped St. John Ambulance first-aid stations and paramedic teams stationed across every concourse level on matchdays.
            </div>
          </div>
        </section>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-black uppercase font-sans border-b border-[#E0E0E0] pb-2">
            FREQUENTLY ASKED QUESTIONS
          </h2>
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-[#DDDCD8] p-6 space-y-2 shadow-sm">
              <h3 className="text-sm font-black text-black uppercase flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-[#CC0000] shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-neutral-600 font-medium pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Support Hotline */}
        <div className="bg-white border border-[#CC0000]/40 p-6 text-center space-y-2 shadow-sm">
          <PhoneCall className="w-8 h-8 text-[#CC0000] mx-auto" />
          <h3 className="text-base font-black text-black uppercase font-sans">Need Immediate Matchday Assistance?</h3>
          <p className="text-xs text-neutral-600 font-medium">Our customer support team and stadium stewards are available on event days.</p>
          <div className="text-sm font-extrabold text-[#CC0000] pt-1">Support Hotline: +254 700 000 000 • support@sttech.co.ke</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
