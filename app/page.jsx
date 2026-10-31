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
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1">
        {/* ==================== A. HERO SECTION ==================== */}
        <section className="relative overflow-hidden pt-12 sm:pt-16 pb-20 sm:pb-28 border-b border-navy-800/80 bg-navy-950">
          {/* Official Talanta Stadium Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/talanta.jpg"
              alt="Talanta Stadium Background"
              className="w-full h-full object-cover object-center opacity-40 scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/50"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-navy-950/50 via-transparent to-navy-950"></div>
          </div>
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Hero Text */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>KENYA'S FLAGSHIP 60,000-SEAT SMART STADIUM</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                  Welcome to <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-200">
                    Talanta Stadium.
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
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
                    <Button variant="navy" size="lg" className="space-x-2 border-navy-700">
                      <Building2 className="w-5 h-5 text-emerald-400" />
                      <span>Discover the Stadium</span>
                    </Button>
                  </Link>
                </div>

                {/* Trust Highlights */}
                <div className="pt-6 border-t border-navy-800/80 grid grid-cols-3 gap-4 text-xs text-slate-400">
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
                <div className="bg-navy-900 border border-navy-800 rounded-3xl overflow-hidden shadow-2xl relative group hover:border-emerald-500/50 transition-all">
                  <div className="relative h-60 sm:h-64 overflow-hidden">
                    <img
                      src={featuredEvent.bannerUrl}
                      alt={featuredEvent.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent"></div>
                    <Badge
                      variant="success"
                      className="absolute top-4 left-4 bg-emerald-500 text-slate-950 font-bold"
                    >
                      FEATURED DEMO FIXTURE
                    </Badge>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                        {featuredEvent.category}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1 leading-snug">
                        {featuredEvent.title}
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Main Bowl • Talanta Sports City, Nairobi</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Sunday, 15 November 2026 • Kickoff 16:00 EAT</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Starting From</span>
                        <span className="text-lg font-bold text-white">KES 1,000</span>
                      </div>

                      <Link href={`/events/${featuredEvent.id}`}>
                        <Button variant="primary" size="sm" className="space-x-1">
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

        {/* ==================== B. ABOUT TALANTA STADIUM ==================== */}
        <section className="py-20 bg-navy-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <Badge variant="success" size="md">VISION & PURPOSE</Badge>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  A World-Class Arena for Kenya & Africa
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Talanta Sports City is a landmark national infrastructure project designed to host top-tier sporting matches, athletics, concerts, and international championships. Built with modern engineering and digital infrastructure, the stadium provides a comfortable, safe, and memorable venue experience for 60,000 spectators.
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
                    <span className="text-2xl font-black text-emerald-400 block">60,000</span>
                    <span className="text-xs text-slate-400 font-medium">All-Seater Capacity</span>
                  </div>

                  <div className="p-4 rounded-xl bg-navy-900 border border-navy-800">
                    <span className="text-2xl font-black text-emerald-400 block">AFCON 2027</span>
                    <span className="text-xs text-slate-400 font-medium">Anchor Venue</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link href="/about">
                    <Button variant="secondary" size="md" className="space-x-2 border-navy-700">
                      <span>Read Complete Venue Profile</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop"
                    alt="Stadium Exterior"
                    className="rounded-2xl border border-navy-800 shadow-xl object-cover h-48 w-full"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop"
                    alt="Match Bowl"
                    className="rounded-2xl border border-navy-800 shadow-xl object-cover h-48 w-full mt-6"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== C. STADIUM FACILITIES ==================== */}
        <section className="py-20 bg-navy-900 border-y border-navy-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <Badge variant="success" size="md">PROPOSED INFRASTRUCTURE</Badge>
              <h2 className="text-3xl font-bold text-white">World-Class Stadium Facilities</h2>
              <p className="text-xs text-slate-400">
                Engineered for athlete excellence, media broadcasting, VIP hospitality, and public safety.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {facilitiesList.map((fac, idx) => {
                const Icon = fac.icon;
                return (
                  <div
                    key={idx}
                    className="bg-navy-950 border border-navy-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
                  >
                    <div>
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={fac.image}
                          alt={fac.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <Badge variant="navy" className="absolute top-3 left-3 text-[10px]">
                          {fac.tag}
                        </Badge>
                      </div>

                      <div className="p-5 space-y-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-base font-bold text-white">{fac.title}</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">{fac.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <Link href="/facilities">
                <Button variant="outline" size="md" className="space-x-2">
                  <span>Explore All Facilities</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== D. UPCOMING EVENTS ==================== */}
        <section className="py-20 bg-navy-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                <Badge variant="success" size="sm" className="mb-2">DEMONSTRATION SCHEDULE</Badge>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Upcoming Matchday Events
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Demonstration event allocations for system evaluation & testing purposes.
                </p>
              </div>

              <Link href="/events" className="mt-4 sm:mt-0">
                <Button variant="secondary" size="sm" className="space-x-2 border-navy-700">
                  <span>View All Fixtures</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Disclaimer Banner */}
            <div className="mb-8 p-4 rounded-xl bg-navy-900 border border-navy-800 flex items-center space-x-3 text-xs text-slate-300">
              <Info className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Demonstration Notice:</strong> Fixtures listed below are demonstration concepts configured to evaluate the ticket booking, M-PESA checkout, and turnstile validation workflows.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="bg-navy-900 border border-navy-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
                >
                  <div>
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={evt.bannerUrl}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <Badge variant="navy" className="absolute top-3 left-3 text-[10px]">
                        {evt.category}
                      </Badge>
                    </div>

                    <div className="p-6 space-y-3">
                      <h3 className="text-base font-bold text-white leading-snug">{evt.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>

                      <div className="space-y-1.5 pt-2 text-xs text-slate-300">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{new Date(evt.startTime).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{evt.venueZone} • Talanta Stadium</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <div className="pt-4 border-t border-navy-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">General Admission</span>
                        <span className="text-sm font-bold text-emerald-400">
                          {evt.categories?.[0]?.price ? `KES ${evt.categories[0].price.toLocaleString()}` : 'Awaiting Confirmation'}
                        </span>
                      </div>

                      <Link href={`/events/${evt.id}`}>
                        <Button variant="primary" size="sm" className="space-x-1">
                          <span>Buy Ticket</span>
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

        {/* ==================== E. DIGITAL SERVICES ==================== */}
        <section className="py-20 bg-navy-900 border-y border-navy-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <Badge variant="success" size="md">ST-TECH DIGITAL PLATFORM</Badge>
              <h2 className="text-3xl font-bold text-white">Planned Digital Services</h2>
              <p className="text-xs text-slate-400">
                A joined-up digital operating layer spanning patron mobile booking, turnstile gate entry, and command operations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {digitalServicesList.map((srv, idx) => {
                const Icon = srv.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-navy-950 border border-navy-800 hover:border-emerald-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="neutral" size="sm">{srv.badge}</Badge>
                    </div>
                    <h3 className="text-base font-bold text-white">{srv.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{srv.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-10">
              <Link href="/services">
                <Button variant="secondary" size="md" className="space-x-2 border-navy-700">
                  <span>View Complete Technical Architecture</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ==================== F. STADIUM EXPERIENCE ==================== */}
        <section className="py-20 bg-navy-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <Badge variant="success" size="md">SPECTATOR EXPERIENCE</Badge>
              <h2 className="text-3xl font-bold text-white">Elevated Matchday Hospitality</h2>
              <p className="text-xs text-slate-400">
                Designed to deliver an inclusive, convenient, and safe matchday environment for all patrons.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Cashless Concessions</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fast mobile M-PESA payment processing at all food, beverage, and merchandise kiosks across the stadium concourse.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Accessible & Family Zones</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dedicated wheelchair seating bays, step-free access routes, family restrooms, and trained accessibility stewards.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Integrated Safety & Control</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time turnstile monitoring, density alerts, emergency egress hardware, and trained matchday security stewards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== G. NEWS AND ANNOUNCEMENTS ==================== */}
        <section className="py-20 bg-navy-900 border-t border-navy-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
              <div>
                <Badge variant="success" size="sm" className="mb-2">STADIUM UPDATES</Badge>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  News & Announcements
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Official reporting on stadium construction progress and digital platform developments.
                </p>
              </div>

              <Link href="/news" className="mt-4 sm:mt-0">
                <Button variant="secondary" size="sm" className="space-x-2 border-navy-700">
                  <span>All News Articles</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {newsList.map((item) => (
                <div
                  key={item.id}
                  className="bg-navy-950 border border-navy-800 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-semibold text-emerald-400">{item.category}</span>
                      <span>{item.date}</span>
                    </div>
                    <h3 className="text-base font-bold text-white leading-snug">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.excerpt}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-navy-800">
                    <Link href={item.link} className="inline-flex items-center text-xs text-emerald-400 font-semibold hover:underline space-x-1">
                      <span>Read Full Update</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== H. CALL TO ACTION BANNER ==================== */}
        <section className="py-16 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border-t border-navy-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Ticket className="w-6 h-6" />
            </div>

            <h2 className="text-3xl font-black text-white">
              Ready for Matchday at Talanta Stadium?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Explore demonstration fixtures, test M-PESA cashless checkout, and experience Kenya's smart stadium operating platform.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <Link href="/events">
                <Button variant="primary" size="lg" className="space-x-2">
                  <Compass className="w-5 h-5" />
                  <span>Explore Events & Tickets</span>
                </Button>
              </Link>

              <Link href="/contact">
                <Button variant="navy" size="lg" className="space-x-2 border-navy-700">
                  <PhoneCall className="w-5 h-5 text-emerald-400" />
                  <span>Contact Operations Team</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
