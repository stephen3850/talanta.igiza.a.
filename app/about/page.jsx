'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Link from 'next/link';
import { Shield, Landmark, MapPin, Zap, Lock, Building2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <Badge variant="success" size="md">
            NATIONAL SPORTS INFRASTRUCTURE
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            About Talanta Stadium
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Talanta Sports City is Kenya's ultra-modern 60,000-seat national stadium, constructed to anchor international sports championships, cultural events, and the Africa Cup of Nations (AFCON 2027).
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <Badge variant="success" size="sm">VENUE PROFILE</Badge>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Landmark className="w-6 h-6 text-emerald-400" />
              <span>Stadium Overview & Purpose</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Located in Nairobi, Kenya, Talanta Sports City is engineered to meet top-tier FIFA, CAF, and World Athletics technical standards. The all-seater venue features high-visibility sightlines, all-weather pitch engineering, presidential hospitality suites, and integrated digital operations.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-2xl font-black text-emerald-400 block">60,000</span>
                <span className="text-xs text-slate-400">All-Seater Capacity</span>
              </div>
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800">
                <span className="text-2xl font-black text-emerald-400 block">AFCON 2027</span>
                <span className="text-xs text-slate-400">Host Venue</span>
              </div>
            </div>
          </div>

          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <Badge variant="success" size="sm">DEVELOPMENT TEAM</Badge>
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Shield className="w-6 h-6 text-emerald-400" />
              <span>ST-Tech ICT Platform</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              ST-Tech ICT Consultants provides the smart digital operating system powering public e-ticketing, M-PESA cashless checkout, dynamic QR gate validation, and real-time command centre monitoring.
            </p>

            <ul className="space-y-2 text-xs text-slate-300 pt-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-trust cryptographic QR token security</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Local edge turnstile validation caching</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Kenya Data Protection Act (DPA 2019) compliance</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Stakeholder & Construction Context */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-xl font-bold text-white">Project Execution Context</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Public reporting identifies China Road and Bridge Corporation (CRBC) as the main engineering contractor for Talanta Sports City, with project supervision provided by the Kenya Defence Forces (KDF) Engineering Department. Design consultancies have been associated with University of Nairobi Enterprises and Services Limited (UNES) under Prof. Erastus Abonyo.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 text-xs space-y-1">
              <span className="font-bold text-emerald-400 block">Civil Contractor</span>
              <span className="text-white font-medium">China Road & Bridge Corp (CRBC)</span>
            </div>
            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 text-xs space-y-1">
              <span className="font-bold text-emerald-400 block">Technical Supervision</span>
              <span className="text-white font-medium">KDF Engineering Dept</span>
            </div>
            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 text-xs space-y-1">
              <span className="font-bold text-emerald-400 block">Digital Operating System</span>
              <span className="text-white font-medium">ST-Tech ICT Consultants</span>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-4 pt-4">
          <Link href="/events">
            <Button variant="primary" size="lg" className="space-x-2">
              <span>Explore Upcoming Events</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
