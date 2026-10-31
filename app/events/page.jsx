'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { initialEvents } from '../../lib/mockData';
import { Calendar, MapPin, Search, ArrowRight, Filter, Info, Compass } from 'lucide-react';

export default function PublicEventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const filteredEvents = initialEvents.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === 'ALL' ||
      evt.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <Badge variant="success" size="sm">
            DEMONSTRATION MATCHDAY SCHEDULE
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Events & Matchday Fixtures
          </h1>
          <p className="text-sm text-slate-400">
            Browse upcoming fixtures and ticket allocations for Talanta Sports City, Nairobi.
          </p>
        </div>

        {/* Disclaimer Notice */}
        <div className="mb-8 p-4 rounded-xl bg-navy-900 border border-navy-800 flex items-center space-x-3 text-xs text-slate-300">
          <Info className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            <strong>Demonstration Content Notice:</strong> Fixtures below represent demonstration allocations configured for tender evaluation and testing of M-PESA ticketing and turnstile validation workflows.
          </span>
        </div>

        {/* Filter Controls */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by team, tournament, or event keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {['ALL', 'Football', 'Rugby'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-navy-950 text-slate-400 hover:text-white border border-navy-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-navy-900 border border-navy-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="relative h-48 overflow-hidden">
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
                  <h3 className="text-lg font-bold text-white leading-snug">{evt.title}</h3>
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
                    <span className="text-base font-bold text-white">
                      KES {evt.categories[0].price.toLocaleString()}
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
      </main>

      <Footer />
    </div>
  );
}
