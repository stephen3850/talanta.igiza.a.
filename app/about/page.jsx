'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import {
  Shield,
  Landmark,
  MapPin,
  Zap,
  Lock,
  Building2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Calendar,
  Users,
  Award,
  DollarSign,
  FileText,
  Clock,
  Compass,
  Tv2,
  Smartphone,
  Ticket,
  BarChart3,
  UserCheck,
  ParkingCircle,
  Radio,
  Cpu,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function RedesignedAboutPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // 10 Smart Digital Capabilities (ST-Tech Proposed Architecture)
  const digitalCapabilities = [
    {
      num: '01',
      title: 'Online Ticketing & Seat Reservation',
      desc: 'Mobile-first seat selection, cart hold countdown, and dynamic pricing engine.',
      status: 'PROPOSED PLATFORM',
      icon: Ticket
    },
    {
      num: '02',
      title: 'M-PESA Daraja Cashless Integration',
      desc: 'Instant Safaricom M-PESA STK Push checkout and real-time revenue settlement.',
      status: 'PROPOSED PLATFORM',
      icon: Smartphone
    },
    {
      num: '03',
      title: 'Dynamic Cryptographic QR Tickets',
      desc: 'Single-use dynamic QR codes stored in digital wallets to prevent scalping and replay attacks.',
      status: 'PROPOSED PLATFORM',
      icon: Zap
    },
    {
      num: '04',
      title: 'Smart Turnstile Gate Validation',
      desc: 'Optical turnstile scanners with local edge caching for sub-2.5 second gate entry speed.',
      icon: Shield,
      status: 'PROPOSED PLATFORM'
    },
    {
      num: '05',
      title: 'Staff & Contractor Accreditation',
      desc: 'Role-based digital passes, zone permissions, and biometric time-stamping.',
      status: 'PROPOSED PLATFORM',
      icon: UserCheck
    },
    {
      num: '06',
      title: 'Smart Parking Management',
      desc: 'Automated License Plate Recognition (ANPR), barrier control, and slot reservations.',
      status: 'PROPOSED PLATFORM',
      icon: ParkingCircle
    },
    {
      num: '07',
      title: 'Stadium Command & Control Centre',
      desc: 'Live occupancy dashboards, scan velocity heatmaps, CCTV AI, and incident dispatch.',
      status: 'PROPOSED PLATFORM',
      icon: BarChart3
    },
    {
      num: '08',
      title: 'Visitor Wayfinding & Digital Signage',
      desc: 'Interactive digital displays, seat navigation, and emergency evacuation messaging.',
      status: 'PROPOSED PLATFORM',
      icon: Radio
    },
    {
      num: '09',
      title: 'Real-Time Revenue & Attendance Analytics',
      desc: 'Automated reconciliation, attendance reporting, and financial audit trails.',
      status: 'PROPOSED PLATFORM',
      icon: FileText
    },
    {
      num: '10',
      title: 'IoT & Smart Infrastructure Integration',
      desc: 'Smart lighting, environmental sensors, water monitoring, and energy optimization.',
      status: 'PROPOSED PLATFORM',
      icon: Cpu
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] font-sans text-slate-800">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ==================== PART 2: PREMIUM HERO SECTION ==================== */}
        <section className="relative overflow-hidden bg-slate-900 border-b border-slate-200">
          {/* Authentic Stadium Photo Backdrop */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="/images/Talanta-stadium.jpeg"
              alt="Raila Odinga International Stadium - Talanta Sports City"
              onError={(e) => { e.currentTarget.src = '/images/talanta-stadium-aerial.png'; }}
              className="w-full h-full object-cover object-center opacity-100"
            />
            {/* Scrim Overlay for Readable White Text */}
            <div className="absolute inset-0 bg-slate-950/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-black/30"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10 text-center flex flex-col items-center">
            <div className="max-w-4xl space-y-6">
              {/* Eyebrow */}
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-black tracking-wider uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>NATIONAL SPORTS INFRASTRUCTURE</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase font-heading tracking-tight leading-tight drop-shadow-md">
                ABOUT RAILA ODINGA <br />
                <span className="text-amber-300">INTERNATIONAL STADIUM</span>
              </h1>

              {/* Factual Description */}
              <p className="text-sm sm:text-base text-slate-100 max-w-2xl mx-auto leading-relaxed drop-shadow">
                Discover one of Kenya's flagship sporting infrastructure projects, developed to strengthen the country's sporting capacity, support major international competitions and create a modern destination for football, rugby and national sporting events.
              </p>

              {/* Key Hero Highlights Pills */}
              <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs font-bold text-white">
                <span className="bg-slate-900/80 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>Jamhuri Sports Complex, Nairobi</span>
                </span>
                <span className="bg-slate-900/80 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-300" />
                  <span>60,000 All-Seater Capacity</span>
                </span>
                <span className="bg-slate-900/80 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                  <span>AFCON 2027 Co-Host Venue</span>
                </span>
              </div>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <a href="#overview" className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg transition-all text-sm flex items-center space-x-2">
                  <Compass className="w-4 h-4 text-slate-950" />
                  <span>Explore Stadium</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a href="#financials" className="bg-slate-900/90 hover:bg-slate-900 border border-amber-400/50 text-white font-medium px-6 py-3 rounded-xl backdrop-blur-md transition-all text-sm flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>View Project Information</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PART 3: STADIUM OVERVIEW & VERIFIED FACTS ==================== */}
        <section id="overview" className="py-16 bg-[#FAF9F5] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider border border-slate-300">
                VERIFIED VENUE PROFILE
              </span>
              <h2 className="text-3xl font-black text-slate-900 uppercase font-heading tracking-tight">
                Stadium Specifications & Facts
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Official specifications and verified infrastructure metrics for Raila Odinga International Stadium (formerly Talanta Sports City Stadium).
              </p>
            </div>

            {/* 6 Grid Fact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-700 flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">OFFICIAL VENUE NAME</span>
                  <h3 className="text-base font-black text-slate-900">Raila Odinga International Stadium</h3>
                  <p className="text-xs text-slate-600 mt-1">Formerly named Talanta Sports City Stadium.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">GEOGRAPHIC LOCATION</span>
                  <h3 className="text-base font-black text-slate-900">Jamhuri Sports Complex</h3>
                  <p className="text-xs text-slate-600 mt-1">Nairobi, Kenya (Off Ngong Road / Jamhuri Park).</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SPECTATOR CAPACITY</span>
                  <h3 className="text-base font-black text-slate-900">60,000 Spectators</h3>
                  <p className="text-xs text-slate-600 mt-1">All-seater design built to FIFA and CAF technical standards.</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-700 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CONSTRUCTION COMMENCEMENT</span>
                  <h3 className="text-base font-black text-slate-900">March 2024</h3>
                  <p className="text-xs text-slate-600 mt-1">Official groundbreaking and site clearance start date.</p>
                </div>
              </div>

              {/* Card 5 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CIVIL CONTRACTOR & SUPERVISION</span>
                  <h3 className="text-base font-black text-slate-900">CRBC & KDF Engineering</h3>
                  <p className="text-xs text-slate-600 mt-1">Main contractor China Road & Bridge Corp; supervision by KDF Engineering Department.</p>
                </div>
              </div>

              {/* Card 6 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">INTERNATIONAL PROGRAMME</span>
                  <h3 className="text-base font-black text-slate-900">AFCON 2027 Host Venue</h3>
                  <p className="text-xs text-slate-600 mt-1">Co-hosted by Kenya, Uganda, and Tanzania (East Africa Pamoja Bid).</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PART 4: NATIONAL LEADERSHIP & GOVERNANCE ==================== */}
        <section className="py-16 bg-[#F4F3EF] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider border border-slate-300">
                NATIONAL INFRASTRUCTURE GOVERNANCE
              </span>
              <h2 className="text-3xl font-black text-slate-900 uppercase font-heading tracking-tight">
                National Leadership & Key Stakeholders
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Public project leadership, executive inspection oversight, and national football governance involved in the development of Talanta Sports City.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Profile 1: President Ruto */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md space-y-4 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-amber-400 overflow-hidden mx-auto flex items-center justify-center text-slate-400 font-bold">
                    <Users className="w-10 h-10 text-slate-600" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider block">HEAD OF STATE</span>
                    <h3 className="text-lg font-black text-slate-900">H.E. Dr. William Samoei Ruto</h3>
                    <p className="text-xs text-slate-500 font-semibold">President of the Republic of Kenya</p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed text-center">
                    Provides executive leadership for Kenya's national sports infrastructure drive. Conducted an official site inspection of Talanta Sports City in April 2025 to review construction progress ahead of AFCON 2027.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 text-center">
                  <a
                    href="https://www.president.go.ke/president-ruto-inspects-construction-progress-at-talanta-sports-city/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-800 hover:text-amber-600 transition-colors"
                  >
                    <span>Presidency Inspection Report</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Profile 2: Hon. Salim Mvurya */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md space-y-4 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-emerald-500 overflow-hidden mx-auto flex items-center justify-center text-slate-400 font-bold">
                    <Award className="w-10 h-10 text-slate-600" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">CABINET SECRETARY</span>
                    <h3 className="text-lg font-black text-slate-900">Hon. Salim Mvurya, EGH</h3>
                    <p className="text-xs text-slate-500 font-semibold">Cabinet Secretary for Youth Affairs, Creative Economy & Sports</p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed text-center">
                    Leads the Ministry responsible for sports infrastructure, policy coordination, contractor timelines, and national preparations for the AFCON 2027 tournament.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 text-center">
                  <a
                    href="https://www.president.go.ke/cabinet/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors"
                  >
                    <span>Ministry Cabinet Directory</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Profile 3: Hussein Mohammed */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md space-y-4 p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-blue-500 overflow-hidden mx-auto flex items-center justify-center text-slate-400 font-bold">
                    <Shield className="w-10 h-10 text-slate-600" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider block">FOOTBALL GOVERNANCE</span>
                    <h3 className="text-lg font-black text-slate-900">Hussein Mohammed</h3>
                    <p className="text-xs text-slate-500 font-semibold">President, Football Kenya Federation (FKF)</p>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed text-center">
                    Oversees football administration in Kenya, coordinating with FIFA, CAF, and government agencies for national team hosting, matchday operations, and AFCON 2027 venue allocations.
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200 text-center">
                  <a
                    href="https://footballkenya.org/about"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-800 hover:text-blue-700 transition-colors"
                  >
                    <span>Official FKF Governance</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 text-[11px] text-slate-600 text-center">
              * Official leadership profiles are displayed for factual contextual information regarding public project governance. Mention of public officials does not constitute endorsement of any private vendor product.
            </div>
          </div>
        </section>

        {/* ==================== PART 5: CONSTRUCTION & PROJECT TIMELINE ==================== */}
        <section className="py-16 bg-[#FAF9F5] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider border border-slate-300">
                CONSTRUCTION & TIMELINE
              </span>
              <h2 className="text-3xl font-black text-slate-900 uppercase font-heading tracking-tight">
                Project Development & Milestones
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Key construction milestones and reported execution history for the 60,000-capacity stadium project.
              </p>
            </div>

            {/* Timeline */}
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs shrink-0 font-mono">
                  MARCH 2024
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Official Groundbreaking & Site Clearance</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Civil works commence at Jamhuri Sports Complex following handover to China Road and Bridge Corporation (CRBC) with engineering supervision assigned to the Kenya Defence Forces (KDF) Engineering Department.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-emerald-600 text-white font-black px-4 py-2 rounded-xl text-xs shrink-0 font-mono">
                  JULY 2024
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Substructure Concrete & Foundation Pours</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Massive concrete foundation piling and deep basement structure pour completed for the 60,000-seat main bowl tiers and presidential suite foundations.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-blue-600 text-white font-black px-4 py-2 rounded-xl text-xs shrink-0 font-mono">
                  APRIL 2025
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Presidential Progress Inspection Visit</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    H.E. President William Samoei Ruto inspects the site alongside cabinet officials, noting substantial progress on main bowl steel framing and canopy roof trusses.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-slate-900 text-amber-300 font-black px-4 py-2 rounded-xl text-xs shrink-0 font-mono">
                  MID 2026 (TARGET)
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">Civil Completion & ICT System Handover</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Targeted civil handover date ahead of pre-tournament test matches, turnstile gate validation trials, and CAF inspection for AFCON 2027 hosting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PART 6: FINANCIAL OVERVIEW & AUDIT TRANSPARENCY ==================== */}
        <section id="financials" className="py-16 bg-[#F4F3EF] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider border border-slate-300">
                FINANCIAL TRANSPARENCY & REPORTING
              </span>
              <h2 className="text-3xl font-black text-slate-900 uppercase font-heading tracking-tight">
                Stadium Project Cost & Financial Overview
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Reported figures, parliamentary records, auditor-general observations, and government explanations regarding the project cost variance.
              </p>
            </div>

            {/* Financial Figures Breakdown Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Box 1 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">INITIAL APPROVED ESTIMATE</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">KSh 35,000,000,000</span>
                <span className="text-xs text-slate-600 font-medium block">KSh 35 Billion (Concept Estimate)</span>
              </div>

              {/* Box 2 */}
              <div className="bg-white border border-amber-400/80 rounded-2xl p-6 shadow-md text-center space-y-2 relative">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">REPORTED CONTRACT SUM</span>
                <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono block">KSh 45,848,051,675</span>
                <span className="text-xs text-slate-600 font-medium block">Final Executed Contract Sum</span>
              </div>

              {/* Box 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-center space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">COST VARIANCE / DIFFERENCE</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono block">KSh 10,848,051,675</span>
                <span className="text-xs text-slate-600 font-medium block">KSh 10.85 Billion Variance</span>
              </div>
            </div>

            {/* Explanatory Context Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>Audit Observations & Government Explanation</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  During parliamentary review of public infrastructure expenditures, the Office of the Auditor-General noted observations regarding the supporting documentation for the variation between the initial approved concept study estimate (KSh 35 Billion) and the final executed civil contract sum (KSh 45.85 Billion).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-900 block uppercase">1. Auditor-General Observations</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Highlighted the requirement for detailed line-item breakdown documentation explaining cost escalations prior to final audit discharge.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-emerald-800 block uppercase">2. Government Explanation</span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    The Government explained that the KSh 10.85 Billion variance incorporated statutory taxes, customs levies, import freight costs, and specialized high-grade materials required to meet FIFA Class-A international venue certification.
                  </p>
                </div>
              </div>

              {/* Source Links */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
                <span className="text-slate-500 uppercase tracking-wider text-[10px]">Official Public Records & Reporting:</span>
                <div className="flex flex-wrap gap-4">
                  <a href="https://www.parliament.go.ke/node/25789" target="_blank" rel="noreferrer" className="text-slate-800 hover:text-amber-600 transition-colors inline-flex items-center space-x-1">
                    <span>Parliament of Kenya Record</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a href="https://citizen.digital/article/government-explains-sh1085-billion-variations-in-talanta-stadium-cost-n388474" target="_blank" rel="noreferrer" className="text-slate-800 hover:text-amber-600 transition-colors inline-flex items-center space-x-1">
                    <span>Citizen Digital Report</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a href="https://libraryir.parliament.go.ke/server/api/core/bitstreams/7daf5a8c-2f43-407e-a1cb-46be8cd8806d/content" target="_blank" rel="noreferrer" className="text-slate-800 hover:text-amber-600 transition-colors inline-flex items-center space-x-1">
                    <span>Parliamentary Library Document</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PART 7: AFCON 2027 & KENYAN FOOTBALL ==================== */}
        <section className="py-16 bg-[#FAF9F5] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider border border-slate-300">
                  AFCON 2027 & FOOTBALL HERITAGE
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase font-heading tracking-tight">
                  A New Home for African Football
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  As part of the successful East Africa Pamoja Bid alongside Uganda and Tanzania, Kenya will co-host the 36th edition of the Africa Cup of Nations (AFCON 2027).
                </p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Raila Odinga International Stadium will serve as Kenya's premier host venue, anchoring high-profile group stage clashes, knockout fixtures, and national team international matches for the Harambee Stars.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-xl font-black text-slate-900 block">HARAMBEE STARS</span>
                    <span className="text-xs text-slate-500">Home Flagship Pitch</span>
                  </div>
                  <div className="p-4 rounded-xl bg-white border border-slate-200">
                    <span className="text-xl font-black text-slate-900 block">PAMOJA BID</span>
                    <span className="text-xs text-slate-500">Kenya, Uganda & Tanzania</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
                  <img
                    src="/images/ajax.jpg"
                    alt="African Football Competition Matchday"
                    className="w-full h-80 object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PART 8: STADIUM FACILITIES & INFRASTRUCTURE ==================== */}
        <section className="py-16 bg-[#F4F3EF] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider border border-slate-300">
                STADIUM ARCHITECTURE & FACILITIES
              </span>
              <h2 className="text-3xl font-black text-slate-900 uppercase font-heading tracking-tight">
                Facilities & Physical Infrastructure
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Core physical infrastructure components designed for player performance, spectator safety, and media broadcasting.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Facility 1 */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-3 p-5">
                <div className="h-40 overflow-hidden rounded-xl bg-slate-100">
                  <img src="/images/Talanta-stadium.jpeg" alt="60,000-Seat Main Bowl" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">60,000-Seat Main Bowl</h3>
                  <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">UNDER CONSTRUCTION</span>
                </div>
                <p className="text-xs text-slate-600">All-seater continuous bowl with high sightline visibility and acoustic canopy roofing.</p>
              </div>

              {/* Facility 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-3 p-5">
                <div className="h-40 overflow-hidden rounded-xl bg-slate-100">
                  <img src="/images/ajax.jpg" alt="All-Weather Pitch" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">All-Weather Hybrid Pitch</h3>
                  <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">UNDER CONSTRUCTION</span>
                </div>
                <p className="text-xs text-slate-600">Sub-surface drainage system supporting FIFA football and World Rugby international matches.</p>
              </div>

              {/* Facility 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-3 p-5">
                <div className="h-40 overflow-hidden rounded-xl bg-slate-100">
                  <img src="/images/Talanta-stadium.jpeg" alt="Presidential Suites" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">VIP & Presidential Lounges</h3>
                  <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">UNDER CONSTRUCTION</span>
                </div>
                <p className="text-xs text-slate-600">High-security state suites, VVIP boxes, and corporate hospitality dining halls.</p>
              </div>

              {/* Facility 4 */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-3 p-5">
                <div className="h-40 overflow-hidden rounded-xl bg-slate-100">
                  <img src="/images/talanta-stadium-aerial.png" alt="Media Centre" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">Media & 4K Broadcast Center</h3>
                  <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">UNDER CONSTRUCTION</span>
                </div>
                <p className="text-xs text-slate-600">High-speed fiber connectivity, press conference hall, and VAR camera gantry bays.</p>
              </div>

              {/* Facility 5 */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-3 p-5">
                <div className="h-40 overflow-hidden rounded-xl bg-slate-100">
                  <img src="/images/Talanta-stadium.jpeg" alt="Smart Parking Complex" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">Multi-Story Parking Complex</h3>
                  <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">UNDER CONSTRUCTION</span>
                </div>
                <p className="text-xs text-slate-600">Dedicated VIP, team bus, emergency vehicle, and public parking zones.</p>
              </div>

              {/* Facility 6 */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-3 p-5">
                <div className="h-40 overflow-hidden rounded-xl bg-slate-100">
                  <img src="/images/talanta-stadium-aerial.png" alt="Accessible Bays" className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-slate-900">Accessible & Family Bays</h3>
                  <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase">UNDER CONSTRUCTION</span>
                </div>
                <p className="text-xs text-slate-600">Step-free routes, elevators, wheelchair seating platforms, and family restrooms.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PART 9: PROPOSED SMART DIGITAL INFRASTRUCTURE ==================== */}
        <section className="py-16 bg-[#FAF9F5] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider border border-slate-300">
                PROPOSED DIGITAL OPERATING SYSTEM
              </span>
              <h2 className="text-3xl font-black text-slate-900 uppercase font-heading tracking-tight">
                ST-Tech Smart Digital Infrastructure
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ST-Tech ICT Consultants is the proposed digital platform architecture partner for cashless e-ticketing, turnstile entry, and venue intelligence.
              </p>
            </div>

            {/* 10 Digital Capabilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {digitalCapabilities.map((cap) => {
                const IconComponent = cap.icon;
                return (
                  <div key={cap.num} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center">
                      <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-700 font-bold flex items-center justify-center text-xs font-mono">
                        {cap.num}
                      </div>
                      <span className="text-[8px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                        {cap.status}
                      </span>
                    </div>

                    <h3 className="text-xs font-extrabold text-slate-900 uppercase leading-snug">{cap.title}</h3>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{cap.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-[11px] text-amber-900 text-center">
              * Note: The ST-Tech ICT Platform represents proposed smart digital infrastructure designs for tender evaluation. Final ICT procurement and vendor deployment remain subject to official Ministry & KDF procurement awards.
            </div>
          </div>
        </section>

        {/* ==================== PART 10: PROJECT TEAM & RESPONSIBILITIES ==================== */}
        <section className="py-16 bg-[#F4F3EF] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="inline-block px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-[10px] font-extrabold uppercase tracking-wider border border-slate-300">
                PROJECT MATRIX
              </span>
              <h2 className="text-3xl font-black text-slate-900 uppercase font-heading tracking-tight">
                Project Team & Responsibilities
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Factual matrix outlining public ownership, engineering execution, main contractors, and proposed digital infrastructure teams.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-extrabold uppercase">
                      <th className="p-4">Organization / Entity</th>
                      <th className="p-4">Project Role</th>
                      <th className="p-4">Primary Responsibilities</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="p-4 font-bold text-slate-900">Government of Kenya (Ministry of Sports)</td>
                      <td className="p-4 font-semibold text-emerald-800">Project Owner & Policy Authority</td>
                      <td className="p-4">Overall project ownership, funding allocation, and AFCON 2027 host commitment.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-900">Kenya Defence Forces (KDF) Engineering Dept</td>
                      <td className="p-4 font-semibold text-blue-800">Project Supervision & Management</td>
                      <td className="p-4">Technical supervision, site management, and project execution oversight.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-900">China Road & Bridge Corporation (CRBC)</td>
                      <td className="p-4 font-semibold text-purple-800">Main Civil Contractor</td>
                      <td className="p-4">Civil engineering construction, steel superstructure, canopy roof, and stadium bowl build.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-900">University of Nairobi Enterprise Services (UNES)</td>
                      <td className="p-4 font-semibold text-slate-700">Concept Design Consultancy</td>
                      <td className="p-4">Initial architectural concept study and baseline engineering consultancy under Prof. Erastus Abonyo.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-slate-900">ST-Tech ICT Consultants</td>
                      <td className="p-4 font-semibold text-amber-700">Proposed Smart ICT Platform Partner</td>
                      <td className="p-4">Digital ticketing, turnstile validation, M-PESA Daraja integration, and command centre platform design.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== PART 11: SOURCES & REFERENCES ==================== */}
        <section className="py-16 bg-[#FAF9F5] border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">DOCUMENTATION & CITATIONS</span>
              <h2 className="text-xl font-black text-slate-900 uppercase font-heading">Project References & Official Sources</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-medium">
              <a href="https://www.president.go.ke/president-ruto-inspects-construction-progress-at-talanta-sports-city/" target="_blank" rel="noreferrer" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-800 flex items-center justify-between transition-colors shadow-sm">
                <div>
                  <span className="font-bold block text-slate-900">Office of the President of Kenya</span>
                  <span className="text-[10px] text-slate-500">Presidential Site Inspection Report (April 2025)</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>

              <a href="https://www.parliament.go.ke/node/25789" target="_blank" rel="noreferrer" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-800 flex items-center justify-between transition-colors shadow-sm">
                <div>
                  <span className="font-bold block text-slate-900">Parliament of Kenya</span>
                  <span className="text-[10px] text-slate-500">Infrastructure Committee Financial Review</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>

              <a href="https://citizen.digital/article/government-explains-sh1085-billion-variations-in-talanta-stadium-cost-n388474" target="_blank" rel="noreferrer" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-800 flex items-center justify-between transition-colors shadow-sm">
                <div>
                  <span className="font-bold block text-slate-900">Citizen Digital Public Report</span>
                  <span className="text-[10px] text-slate-500">Government Explanation on Cost Variance</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>

              <a href="https://footballkenya.org/about" target="_blank" rel="noreferrer" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-800 flex items-center justify-between transition-colors shadow-sm">
                <div>
                  <span className="font-bold block text-slate-900">Football Kenya Federation (FKF)</span>
                  <span className="text-[10px] text-slate-500">AFCON 2027 Venue Allocation & Governance</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>

              <a href="https://www.president.go.ke/cabinet/" target="_blank" rel="noreferrer" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-800 flex items-center justify-between transition-colors shadow-sm">
                <div>
                  <span className="font-bold block text-slate-900">Ministry of Sports Cabinet Directory</span>
                  <span className="text-[10px] text-slate-500">Official Executive Cabinet Portfolios</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>

              <a href="https://libraryir.parliament.go.ke/server/api/core/bitstreams/7daf5a8c-2f43-407e-a1cb-46be8cd8806d/content" target="_blank" rel="noreferrer" className="p-4 rounded-xl bg-white border border-slate-200 hover:border-amber-400 text-slate-800 flex items-center justify-between transition-colors shadow-sm">
                <div>
                  <span className="font-bold block text-slate-900">Parliamentary Library Archive</span>
                  <span className="text-[10px] text-slate-500">Public Audit & Cost Variance Memorandum</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 shrink-0" />
              </a>
            </div>
          </div>
        </section>

        {/* ==================== CALL TO ACTION ==================== */}
        <section className="py-12 bg-white text-center">
          <div className="max-w-2xl mx-auto px-4 space-y-4">
            <h3 className="text-2xl font-black text-slate-900 uppercase font-heading">Explore Matchday Events</h3>
            <p className="text-xs text-slate-600">Experience cashless M-PESA e-ticketing and smart gate entry at Kenya's flagship stadium.</p>
            <Link href="/events">
              <Button variant="amber" size="md" className="space-x-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-md">
                <span>Browse Upcoming Matches</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
