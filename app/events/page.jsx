'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { initialEvents } from '../../lib/mockData';
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  Info,
  Grid,
  List as ListIcon,
  Calendar as CalendarIcon,
  Utensils,
  Bus,
  Plane,
  ChevronRight,
  ShieldCheck,
  Building2,
  Car,
  Compass,
  ArrowRight
} from 'lucide-react';

export default function PublicEventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL EVENT TYPES');
  const [viewMode, setViewMode] = useState('GRID');

  // Event Categories for Filter Tabs
  const categoryTabs = [
    'ALL EVENT TYPES',
    'CONCERTS',
    'FOOTBALL',
    'SOCCER',
    'TOURS',
    'RUGBY',
    'ATHLETICS',
  ];

  // Filtering Logic
  const filteredEvents = initialEvents.filter((evt) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      evt.title.toLowerCase().includes(q) ||
      evt.category.toLowerCase().includes(q) ||
      (evt.competition && evt.competition.toLowerCase().includes(q)) ||
      (evt.venue && evt.venue.toLowerCase().includes(q)) ||
      (evt.description && evt.description.toLowerCase().includes(q));

    let matchesCategory = true;
    if (selectedCategory !== 'ALL EVENT TYPES') {
      const cat = selectedCategory.toLowerCase();
      if (cat === 'soccer' || cat === 'football') {
        matchesCategory =
          evt.category.toLowerCase() === 'football' ||
          evt.category.toLowerCase() === 'soccer';
      } else {
        matchesCategory = evt.category.toLowerCase().includes(cat);
      }
    }

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] text-slate-900 font-sans selection:bg-amber-400 selection:text-black">
      <Navbar />

      <main className="flex-1 w-full pb-16">
        {/* HEADER HERO BANNER SECTION */}
        <section className="bg-[#F4F3EE] border-b border-[#E2E0D8] pt-12 pb-10 px-4 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto space-y-3">
            <span className="text-[11px] font-black text-[#C89D34] uppercase tracking-widest block">
              EVENTS
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-950 uppercase tracking-tight font-sans leading-none">
              <span className="border-b-4 border-[#CC0000] pb-1 inline-block">ALL</span> UPCOMING EVENTS
            </h1>

            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2">
              BROUGHT TO YOU BY <span className="text-slate-900 font-black">TALANTA TICKETS</span>
            </p>
          </div>
        </section>

        {/* FILTER TABS & VIEW MODE TOOLBAR */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {categoryTabs.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2.5 text-[11px] font-black uppercase tracking-wider transition-all duration-150 rounded-none whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#D9A74A] text-white shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* View Mode Switcher (GRID, LIST, CALENDAR) & Search */}
            <div className="flex items-center space-x-2 shrink-0">
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-xs font-medium text-slate-900 rounded-none pl-9 pr-3 py-2 focus:outline-none focus:border-[#D9A74A]"
                />
              </div>

              <div className="flex items-center space-x-1 bg-slate-200 p-1">
                <button
                  onClick={() => setViewMode('GRID')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 ${
                    viewMode === 'GRID'
                      ? 'bg-[#D9A74A] text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Grid className="w-3 h-3" />
                  <span className="hidden sm:inline">GRID</span>
                </button>

                <button
                  onClick={() => setViewMode('LIST')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 ${
                    viewMode === 'LIST'
                      ? 'bg-[#D9A74A] text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <ListIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">LIST</span>
                </button>

                <button
                  onClick={() => setViewMode('CALENDAR')}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider flex items-center space-x-1 ${
                    viewMode === 'CALENDAR'
                      ? 'bg-[#D9A74A] text-white'
                      : 'bg-white text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <CalendarIcon className="w-3 h-3" />
                  <span className="hidden sm:inline">CALENDAR</span>
                </button>
              </div>
            </div>
          </div>

          {/* PROVISIONAL STATUS NOTICE BANNER */}
          <div className="p-4 bg-[#EFECE6] border border-[#D5D0C5] text-xs text-slate-700 flex items-start space-x-3">
            <Info className="w-4 h-4 text-[#D9A74A] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-900 font-bold uppercase block text-[11px] mb-0.5">
                Provisional Event Schedule & Verification Notice:
              </strong>
              Upcoming 2027 international fixtures, test matches, and AFCON tournament schedules are listed with provisional status category tags (Proposed, Awaiting Confirmation, Candidate Venue). Ticket purchasing buttons unlock automatically upon official confirmation and category pricing approval.
            </div>
          </div>

          {/* EVENTS DISPLAY (GRID OR LIST) */}
          {filteredEvents.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 text-center text-slate-500 text-xs">
              No events match your current filter or search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((evt) => {
                const isTicketAvailable = evt.ticketApproved && evt.categories && evt.categories.length > 0;

                return (
                  <div
                    key={evt.id}
                    className="bg-[#EBEAE6] border border-[#DDDCD8] flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div>
                      {/* CARD IMAGE CONTAINER */}
                      <div className="relative h-56 overflow-hidden bg-slate-950">
                        <img
                          src={evt.image || evt.bannerUrl || '/images/talanta.jpg'}
                          alt={evt.title}
                          onError={(e) => { e.currentTarget.src = '/images/talanta.jpg'; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                        {/* Overlaid Title on Bottom Left of Image */}
                        <div className="absolute bottom-3 left-4 right-16">
                          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-none drop-shadow-md font-sans">
                            {evt.title}
                          </h2>
                          <div className="w-12 h-1 bg-[#D9A74A] mt-2"></div>
                        </div>

                        {/* Top Right Flag Badge */}
                        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm border border-white/20 px-2 py-1 flex items-center space-x-1 rounded-none text-xs">
                          {evt.teams?.home?.flag && <span>{evt.teams.home.flag}</span>}
                          {evt.teams?.away?.flag && <span>{evt.teams.away.flag}</span>}
                          {!evt.teams && <span>🇰🇪</span>}
                        </div>
                      </div>

                      {/* CARD BODY CONTENT */}
                      <div className="p-5 space-y-3">
                        {/* Gold Date/Time Line */}
                        <div className="text-[11px] font-black text-[#C89D34] uppercase tracking-wider">
                          {evt.displayDate || (evt.startDate && new Date(evt.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }))}
                        </div>

                        {/* Title & Competition */}
                        <div>
                          <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight leading-snug">
                            {evt.title}
                          </h3>
                          <p className="text-xs text-slate-600 font-bold mt-0.5">
                            {evt.competition || evt.category}
                          </p>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-700 leading-relaxed line-clamp-2">
                          {evt.description}
                        </p>

                        {/* Venue Info & Status Tag */}
                        <div className="pt-2 border-t border-slate-300/70 space-y-1.5 text-xs text-slate-600">
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="font-semibold text-slate-800">{evt.venue}</span>
                          </div>

                          {/* Provisional Status Tag */}
                          <div className="pt-1 flex items-center justify-between text-[10px] font-bold uppercase">
                            <span className="text-slate-500">Status Category:</span>
                            <span
                              className={`px-2 py-0.5 rounded-none border ${
                                evt.status === 'CONFIRMED' || evt.status === 'PUBLISHED'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : evt.status === 'PROPOSED'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : evt.status === 'AWAITING_CONFIRMATION'
                                  ? 'bg-sky-100 text-sky-900 border-sky-300'
                                  : 'bg-purple-100 text-purple-900 border-purple-300'
                              }`}
                            >
                              {evt.statusLabel || evt.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CARD ACTIONS & FOOTER */}
                    <div className="p-5 pt-0 space-y-2">
                      {/* Primary Buttons Row (2 Columns) */}
                      <div className="grid grid-cols-2 gap-2">
                        {isTicketAvailable ? (
                          <Link href={`/events/${evt.slug}`} className="w-full">
                            <button className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-black text-[11px] uppercase tracking-wider py-3 transition-colors text-center">
                              BUY TICKETS
                            </button>
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="w-full bg-slate-300 text-slate-600 font-bold text-[10px] uppercase tracking-wider py-3 cursor-not-allowed text-center"
                          >
                            AWAITING CONFIRMATION
                          </button>
                        )}

                        <Link href={`/events/${evt.slug}`} className="w-full">
                          <button className="w-full bg-[#E0DFDA] hover:bg-[#D4D3CD] text-slate-900 font-bold text-[11px] uppercase tracking-wider py-3 transition-colors text-center">
                            MORE INFO
                          </button>
                        </Link>
                      </div>

                      {/* Secondary Buttons Row (SUITES & PARKING) */}
                      <div className="grid grid-cols-2 gap-2">
                        <Link href="/suites" className="w-full">
                          <button className="w-full bg-[#E5E4E0] hover:bg-[#D8D7D2] text-slate-800 font-semibold text-[10px] uppercase tracking-wider py-2 transition-colors text-center">
                            SUITES
                          </button>
                        </Link>

                        <Link href="/parking/book" className="w-full">
                          <button className="w-full bg-[#E5E4E0] hover:bg-[#D8D7D2] text-slate-800 font-semibold text-[10px] uppercase tracking-wider py-2 transition-colors text-center">
                            PARKING
                          </button>
                        </Link>
                      </div>

                      {/* Footer Quick Links (Dining, Matatu, Flight) */}
                      <div className="pt-3 border-t border-slate-300/80 flex flex-wrap items-center justify-between gap-1 text-[10px] font-bold text-slate-600 uppercase">
                        <Link href="/facilities" className="flex items-center space-x-1 hover:text-slate-950">
                          <Utensils className="w-3 h-3 text-[#CC0000]" />
                          <span>DINING GUIDE</span>
                        </Link>

                        <Link href="/facilities" className="flex items-center space-x-1 hover:text-slate-950">
                          <Bus className="w-3 h-3 text-emerald-600" />
                          <span>MATATU ROUTES</span>
                        </Link>

                        <Link href="/connect" className="flex items-center space-x-1 hover:text-slate-950">
                          <Plane className="w-3 h-3 text-sky-600" />
                          <span>FLY KENYA AIRWAYS</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* BOTTOM QUICK LINKS BANNER (4 COLUMNS) */}
        <section className="bg-[#EAE8E1] border-t border-b border-[#D8D5CB] mt-12 py-10 px-4 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                DIRECTIONS TO TALANTA STADIUM
              </h3>
              <div className="w-8 h-0.5 bg-[#CC0000]"></div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                Parking, matatu routes, BRT and rideshare information.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                BUY PARKING
              </h3>
              <div className="w-8 h-0.5 bg-[#CC0000]"></div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                We highly recommend purchasing parking ahead of your arrival.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                RESERVE A SUITE
              </h3>
              <div className="w-8 h-0.5 bg-[#CC0000]"></div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                Experience premium amenities at an upcoming event at Talanta.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                PLAN YOUR VISIT
              </h3>
              <div className="w-8 h-0.5 bg-[#CC0000]"></div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
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
