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
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'VIP & Presidential Suites',
      desc: 'High-security hospitality suites, presidential boxes, and corporate lounges with dedicated access routes.',
      icon: Award,
      tag: 'Hospitality',
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Media & International Broadcast Centre',
      desc: 'Ultra-fast fiber network infrastructure, press conference arenas, and high-definition VAR/broadcast bays.',
      icon: Tv2,
      tag: '4K Broadcast',
      image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Accessible & Family Bays',
      desc: 'Step-free routes, designated wheelchair seating, elevators, and dedicated family-friendly spectator areas.',
      icon: Users,
      tag: 'WCAG 2.2 AA',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?q=80&w=600&auto=format&fit=crop'
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

  const newsList = [
    {
      id: 'news-01',
      date: '10 February 2026',
      category: 'Construction Progress',
      title: 'CRBC Updates Civil Handover Schedule for Talanta Sports City',
      excerpt: 'Main contractor China Road and Bridge Corporation confirms substantial structural progress at the Nairobi stadium site.',
      link: '/news'
    },
    {
      id: 'news-02',
      date: '11 April 2025',
      category: 'Government Inspection',
      title: 'Presidential Inspection Highlights AFCON 2027 Readiness',
      excerpt: 'Official site evaluation confirms government commitment to world-class sports infrastructure in Kenya.',
      link: '/news'
    },
    {
      id: 'news-03',
      date: '30 October 2026',
      category: 'Digital Systems',
      title: 'ST-Tech Unveils Smart Stadium Operating System Architecture',
      excerpt: 'Integrated digital ticketing, M-PESA Daraja integration, and turnstile validation layer presented for tender evaluation.',
      link: '/news'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 font-sans">
      <Navbar />

      <main className="flex-1">
        {/* ==================== A. HERO SECTION ==================== */}
        <section className="relative overflow-hidden pt-12 sm:pt-16 pb-20 sm:pb-28 border-b border-navy-800/80 bg-navy-950">
          {/* Official Talanta Stadium Background Image (Full Clear 100%) */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              src="/images/talanta.jpg"
              alt="Talanta Stadium Background"
              onError={(e) => { e.currentTarget.src = '/images/talanta-stadium-aerial.png'; }}
              className="w-full h-full object-cover object-center opacity-100"
            />
            {/* Subtle Gradient Backdrop for High Text Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950/85 via-navy-950/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-black/30"></div>
          </div>
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Hero Text */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>KENYA'S FLAGSHIP 60,000-SEAT SMART STADIUM</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight uppercase font-heading drop-shadow-lg">
                  Welcome to <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200">
                    Talanta Stadium.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-200 max-w-2xl leading-relaxed drop-shadow-md">
                  Experience Kenya's ultra-modern sports and entertainment venue. Powered by ST-Tech ICT Consultants with cashless M-PESA e-ticketing, dynamic QR gate validation, and real-time operational safety.
                </p>

                {/* Hero Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <Link href="/events">
                    <Button variant="primary" size="lg" className="space-x-2 shadow-emerald-500/25">
                      <Compass className="w-5 h-5" />
                      <span>Explore Events</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>

                  <Link href="/about">
                    <Button variant="navy" size="lg" className="space-x-2 border-navy-700 bg-navy-950/80 backdrop-blur-md">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <span>Discover the Stadium</span>
                    </Button>
                  </Link>
                </div>

                {/* Trust Highlights */}
                <div className="pt-6 border-t border-navy-800/80 grid grid-cols-3 gap-4 text-xs text-slate-300 font-medium drop-shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>M-PESA Instant Checkout</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dynamic QR Credentials</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>DPA 2019 Compliant</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Card */}
              <div className="lg:col-span-5">
                <div className="bg-navy-900/90 backdrop-blur-md border border-navy-800 rounded-3xl overflow-hidden shadow-2xl relative group hover:border-emerald-500/50 transition-all">
                  <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-900">
                    <img
                      src={featuredEvent.image || featuredEvent.bannerUrl || '/images/talanta.jpg'}
                      alt={featuredEvent.title}
                      onError={(e) => { e.currentTarget.src = '/images/talanta.jpg'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent"></div>
                    <Badge
                      variant="success"
                      className="absolute top-4 left-4 bg-emerald-500 text-slate-950 font-bold"
                    >
                      FEATURED FIXTURE
                    </Badge>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block mb-1">
                        {featuredEvent.category}
                      </span>
                      <h3 className="text-xl font-black text-white leading-tight uppercase font-heading">
                        {featuredEvent.title}
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{featuredEvent.venue}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>{featuredEvent.displayDate || (featuredEvent.startDate && new Date(featuredEvent.startDate).toLocaleDateString())}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-navy-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Starting From</span>
                        <span className="text-lg font-black text-white font-mono">
                          {featuredEvent.categories?.[0]?.price
                            ? `KES ${featuredEvent.categories[0].price.toLocaleString()}`
                            : 'Awaiting Confirmation'}
                        </span>
                      </div>

                      <Link href={`/events/${featuredEvent.slug || featuredEvent.id}`}>
                        <Button variant="primary" size="sm" className="space-x-1.5">
                          <span>Buy Tickets</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== B. UPCOMING FIXTURES SECTION ==================== */}
        <section className="py-16 bg-navy-950 border-b border-navy-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <Badge variant="success" size="sm" className="mb-2">
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
                  className="bg-navy-900 border border-navy-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="relative h-48 overflow-hidden bg-slate-900">
                      <img
                        src={evt.image || evt.bannerUrl || '/images/talanta.jpg'}
                        alt={evt.title}
                        onError={(e) => { e.currentTarget.src = '/images/talanta.jpg'; }}
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
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
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
                        <span className="text-sm font-black text-emerald-400 font-mono">
                          {evt.categories?.[0]?.price ? `KES ${evt.categories[0].price.toLocaleString()}` : 'Awaiting Confirmation'}
                        </span>
                      </div>

                      <Link href={`/events/${evt.slug || evt.id}`}>
                        <Button variant="primary" size="sm" className="space-x-1">
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

        {/* ==================== C. DIGITAL SERVICES GRID ==================== */}
        <section className="py-16 bg-navy-900 border-b border-navy-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <Badge variant="success" size="sm">
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
                    className="bg-navy-950 border border-navy-800 hover:border-emerald-500/40 rounded-2xl p-6 space-y-3 shadow-xl transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
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
