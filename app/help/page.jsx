'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Badge from '../../components/Badge';
import { HelpCircle, ShieldCheck, Smartphone, AlertCircle, PhoneCall } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        <div className="text-center space-y-2">
          <Badge variant="info" size="md">MATCHDAY HELP CENTRE</Badge>
          <h1 className="text-3xl font-black text-white">Help, FAQs & Ticketing Guidelines</h1>
          <p className="text-xs text-slate-400">Everything you need to know for a smooth matchday experience at Talanta Stadium.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-navy-900 border border-navy-800 rounded-2xl p-6 space-y-2">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-300 pl-6 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="bg-navy-900 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3">
          <PhoneCall className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Need Immediate Matchday Assistance?</h3>
          <p className="text-xs text-slate-400">Our customer support team and stadium stewards are available on event days.</p>
          <div className="text-sm font-bold text-emerald-400">Support Hotline: +254 700 000 000 • support@sttech.co.ke</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
