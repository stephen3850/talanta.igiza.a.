'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { initialEvents } from '../lib/mockData';
import {
  Shield,
  Calendar,
  Ticket,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Clock,
  Sparkles,
  Lock,
  Zap,
  Users,
  Building2,
  Tv2,
  Award,
  Compass,
  Newspaper,
  PhoneCall,
  Info,
  ChevronRight,
  BarChart3
} from 'lucide-react';

export default function PublicHomePage() {
  const featuredEvent = initialEvents[0];
  const upcomingEvents = initialEvents;

  const facilitiesList = [
    {
      title: '60,000-Seat Main Bowl',
      desc: 'All-seater international stadium bowl engineered for FIFA & CAF football, athletics, and cultural events.',
      icon: Building2,
      tag: 'Capacity 60K',
      image: '/images/Talanta-stadium.jpeg'
    },
    {
      title: 'VIP & Presidential Suites',
      desc: 'High-security hospitality suites, presidential boxes, and corporate lounges with dedicated access routes.',
      icon: Award,
      tag: 'Hospitality',
      image: '/images/Talanta-stadium.jpeg'
    },
    {
      title: 'Media & International Broadcast Centre',
      desc: 'Ultra-fast fiber network infrastructure, press conference arenas, and high-definition VAR/broadcast bays.',
      icon: Tv2,
      tag: '4K Broadcast',
      image: '/images/Talanta-stadium.jpeg'
    },
    {
      title: 'Accessible & Family Bays',
      desc: 'Step-free routes, designated wheelchair seating, elevators, and dedicated family-friendly spectator areas.',
      icon: Users,
      tag: 'WCAG 2.2 AA',
      image: '/images/Talanta-stadium.jpeg'
    }
  ];

  const digitalServicesList = [
    {
      title: 'Online Ticket Booking',
      desc: 'Fast mobile booking with seat selection and cart hold countdown timers.',
      icon: Ticket,
      badge: 'Core Service'
    },
    {
      title: 'M-PESA Cashless Integration',
      desc: 'Instant Safaricom M-PESA STK Push checkout and event revenue settlement.',
      icon: Smartphone,
      badge: 'Cashless'
    },
    {
      title: 'Digital Cryptographic QR',
      desc: 'Single-use, dynamic anti-replay ticket credentials stored in patron wallets.',
      icon: Zap,
      badge: 'Anti-Scalp'
    },
    {
      title: 'Smart Turnstile Gate Validation',
      desc: 'Optical turnstile scanners with local edge caching for offline entry speed.',
      icon: Shield,
      badge: '<2.5s Latency'
    },
    {
      title: 'Matchday Information',
      desc: 'Real-time venue guidance, transportation routes, and match notices.',
      icon: Info,
      badge: 'Patron Support'
    },
    {
      title: 'Staff & Vendor Accreditation',
      desc: 'Role-based digital passes, zone permissions, and attendance logs.',
      icon: Users,
      badge: 'Security'
    },
    {
      title: 'Stadium Command Centre',
      desc: 'Live occupancy dashboards, scan velocity heatmaps, and incident tracking.',
      icon: BarChart3,
      badge: 'Real-Time'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* ==================== A. HERO SECTION ==================== */}
        <section className="relative overflow-hidden pt-12 sm:pt-20 pb-16 sm:pb-24 border-b border-navy-800/80 bg-navy-950">
          {/* Official Talanta Stadium Background Image (Very Visible) */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="/images/Talanta-stadium.jpeg"
              alt="Talanta Stadium Background"
              onError={(e) => { e.currentTarget.src = '/images/talanta-stadium-aerial.png'; }}
              className="w-full h-full object-cover object-center opacity-100"
            />
            {/* Translucent Backdrop Overlay for Image Visibility */}
            <div className="absolute inset-0 bg-black/25"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-black/20"></div>
          </div>
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
            <div className="max-w-3xl space-y-5">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold tracking-wider uppercase shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>KENYA'S FLAGSHIP 60,000-SEAT SMART STADIUM</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight uppercase font-heading drop-shadow-md">
                WELCOME TO TALANTA STADIUM.
              </h1>

              <p className="text-sm sm:text-base text-slate-100 max-w-xl mx-auto leading-relaxed drop-shadow-sm">
                Experience Kenya's ultra-modern sports and entertainment venue. Powered by ST-Tech ICT Consultants with cashless M-PESA e-ticketing, dynamic QR gate validation, and real-time operational safety.
              </p>

              {/* Hero Action Buttons (Faded Yellow, No Green) */}
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link href="/events">
                  <Button variant="amber" size="md" className="space-x-2 bg-amber-400/90 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-400/20">
                    <Compass className="w-4 h-4 text-slate-950" />
                    <span>Explore Events</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>

                <Link href="/about">
                  <Button variant="navy" size="md" className="space-x-2 border-amber-400/50 bg-navy-950/80 hover:bg-navy-900 text-white font-medium px-5 py-2.5 rounded-xl backdrop-blur-md">
                    <Building2 className="w-4 h-4 text-amber-300" />
                    <span>Discover the Stadium</span>
                  </Button>
                </Link>
              </div>

              {/* Trust Highlights (Pure White Writing & Icons) */}
              <div className="pt-6 border-t border-white/20 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-100 font-medium drop-shadow-sm max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-2">
                  <Smartphone className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>M-PESA Instant Checkout</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Dynamic QR Credentials</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Lock className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>DPA 2019 Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== B. FEATURED FIXTURE SECTION ==================== */}
        <section className="py-16 bg-navy-900 border-b border-navy-800/80 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-navy-950/90 border border-navy-800 hover:border-amber-400/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 group">
                {/* Background Banner / Image */}
                <div className="relative h-64 sm:h-80 overflow-hidden bg-slate-900">
                  <img
                    src={featuredEvent.image || featuredEvent.bannerUrl || '/images/ajax.jpg'}
                    alt={featuredEvent.title}
                    onError={(e) => { e.currentTarget.src = '/images/Talanta-stadium.jpeg'; }}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent"></div>

                  {/* Top Left Faded Yellow Badge */}
                  <div className="absolute top-4 left-4 bg-amber-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-lg flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>FEATURED DEMO FIXTURE</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6 sm:p-8 space-y-4">
                  <div>
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block mb-1">
                      {featuredEvent.category || 'SOCCER'}
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase font-heading tracking-tight leading-tight">
                      {featuredEvent.title}
                    </h2>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-slate-300">
                    <div className="flex items-center space-x-2.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{featuredEvent.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{featuredEvent.displayDate}</span>
                    </div>
                  </div>

                  {/* Pricing and Buy Tickets Button */}
                  <div className="pt-6 border-t border-navy-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400 block uppercase font-medium tracking-wider mb-0.5">
                        STARTING FROM
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-white font-mono">
                        KES 1,000
                      </span>
                    </div>

                    <Link href={`/events/${featuredEvent.slug || featuredEvent.id}`}>
                      <Button variant="amber" size="md" className="space-x-2 bg-amber-400/90 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-400/20">
                        <span>Buy Tickets</span>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== C. UPCOMING FIXTURES SECTION ==================== */}
        <section className="py-16 bg-navy-950 border-b border-navy-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <Badge variant="navy" size="sm" className="mb-2 text-amber-300 border-amber-400/40">
                  STADIUM SCHEDULE
                </Badge>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight font-heading">
                  Upcoming Matchday Fixtures
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Official tournament schedules and event allocations at Talanta Sports City, Nairobi.
                </p>
              </div>

              <Link href="/events">
                <Button variant="navy" size="sm" className="space-x-2 border-navy-700">
                  <span>View All Events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.slice(0, 3).map((evt) => (
                <div
                  key={evt.id}
                  className="bg-navy-900 border border-navy-800 hover:border-amber-400/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-slate-900">
                      <img
                        src={evt.image || evt.bannerUrl || '/images/ajax.jpg'}
                        alt={evt.title}
                        onError={(e) => { e.currentTarget.src = '/images/Talanta-stadium.jpeg'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge variant="navy" className="absolute top-3 left-3 text-[10px]">
                        {evt.category}
                      </Badge>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="text-lg font-black text-white leading-snug uppercase font-heading">{evt.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>

                      <div className="space-y-1.5 pt-2 text-xs text-slate-300">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-amber-300" />
                          <span>{evt.displayDate || (evt.startDate && new Date(evt.startDate).toLocaleDateString())}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.venue || 'Talanta Stadium'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <div className="pt-4 border-t border-navy-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">General Admission</span>
                        <span className="text-sm font-black text-amber-300 font-mono">
                          {evt.categories?.[0]?.price ? `KES ${evt.categories[0].price.toLocaleString()}` : 'KES 1,000'}
                        </span>
                      </div>

                      <Link href={`/events/${evt.slug || evt.id}`}>
                        <Button variant="amber" size="sm" className="space-x-1">
                          <span>Event Info</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== D. DIGITAL SERVICES GRID ==================== */}
        <section className="py-16 bg-navy-900 border-b border-navy-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="navy" size="sm" className="text-amber-300 border-amber-400/40">
                SMART STADIUM CAPABILITIES
              </Badge>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight font-heading">
                Integrated Digital Infrastructure
              </h2>
              <p className="text-xs text-slate-400">
                ST-Tech ICT Consultants delivers end-to-end ticketing, security, gate access, and venue operational intelligence.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {digitalServicesList.slice(0, 4).map((srv) => {
                const IconComp = srv.icon;
                return (
                  <div
                    key={srv.title}
                    className="bg-navy-950 border border-navy-800 hover:border-amber-400/40 rounded-2xl p-6 space-y-3 shadow-xl transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-300 flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-white uppercase">{srv.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{srv.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
