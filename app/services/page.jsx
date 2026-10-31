'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Link from 'next/link';
import {
  Ticket,
  Smartphone,
  Zap,
  Shield,
  Users,
  Activity,
  Lock,
  ArrowRight,
  Terminal,
  FileBarChart
} from 'lucide-react';

export default function ServicesPage() {
  const servicesList = [
    {
      title: 'Online Ticket Booking Engine',
      desc: 'Mobile-first seat selection, category pricing, cart hold timers, and digital e-receipt generation.',
      icon: Ticket,
      spec: '10,000 Concurrent Cart Sessions'
    },
    {
      title: 'M-PESA Cashless Payment Gateway',
      desc: 'Asynchronous Safaricom Daraja API STK Push integration with automated callback reconciliation.',
      icon: Smartphone,
      spec: '99.4% Settlement Accuracy'
    },
    {
      title: 'Dynamic Cryptographic QR Tokens',
      desc: 'Single-use, anti-replay ticket credentials signed with secret cryptographic HMAC keys.',
      icon: Zap,
      spec: 'Anti-Scalping Token'
    },
    {
      title: 'Smart Turnstile Gate Validation',
      desc: 'Optical turnstile scanners with local edge caching for offline entry continuity during outages.',
      icon: Shield,
      spec: '<2.5s Scan Latency'
    },
    {
      title: 'Staff & Vendor Accreditation',
      desc: 'Role-based digital passes, zone access rules, shift timekeeping, and contractor logs.',
      icon: Users,
      spec: 'Zone-Specific Rights'
    },
    {
      title: 'Matchday Command Centre',
      desc: 'Real-time operational dashboards tracking gate scan velocity, venue occupancy, and incidents.',
      icon: Activity,
      spec: 'Live Metric Stream'
    },
    {
      title: 'Cybersecurity & Audit Trail',
      desc: 'Immutable audit logs tracking all administrative actions in compliance with Kenya DPA 2019.',
      icon: Lock,
      spec: 'Write-Once Audit Trail'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="success" size="md">ST-TECH ICT ARCHITECTURE</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Integrated Digital Operating Services
          </h1>
          <p className="text-sm text-slate-400">
            End-to-end digital capabilities designed for high-capacity venue security and financial accountability.
          </p>
        </div>

        {/* Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servicesList.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-navy-900 border border-navy-800 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="success" size="sm">{srv.spec}</Badge>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{srv.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{srv.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Operational Shortcut Banner */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-white">Experience the Gate Scanner Simulation</h3>
            <p className="text-xs text-slate-400 mt-1">Test optical QR code decryption and turnstile approval workflows.</p>
          </div>

          <Link href="/gate">
            <Button variant="primary" size="md" className="space-x-2">
              <Terminal className="w-4 h-4" />
              <span>Launch Turnstile Scanner Tool</span>
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
