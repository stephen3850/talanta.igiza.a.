'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { initialEvents } from '../../lib/mockData';
import { formatCurrency } from '../../lib/utils';
import { Ticket, Calendar, MapPin, Search, ArrowRight, ShieldCheck, Filter } from 'lucide-react';

export default function TicketsDiscoveryPage() {
  const [events, setEvents] = useState(initialEvents.filter(e => e.status === 'PUBLISHED'));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    async function loadPublicEvents() {
      try {
        const res = await fetch('/api/events?public=true');
        const data = await res.json();
        if (data.success && data.events) {
          setEvents(data.events);
        }
      } catch (err) {
        console.warn('Using local fallback events');
      }
    }
    loadPublicEvents();
  }, []);

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'ALL' ||
      evt.category.toLowerCase().includes(selectedCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="success" size="md">
            OFFICIAL TICKETING PORTAL
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Matchday Ticket Discovery
          </h1>
          <p className="text-sm text-slate-400">
            Discover upcoming fixtures at Talanta Sports City, select seating categories, and pay securely via Safaricom M-PESA.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by match title, tournament, or sport..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            {['ALL', 'Football', 'Rugby', 'Athletics'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
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

        {/* Events & Category Price Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((evt) => {
            const minPrice = Math.min(...evt.categories.map((c) => c.price));
            return (
              <div
                key={evt.id}
                className="bg-navy-900 border border-navy-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={evt.image || evt.bannerUrl}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge variant="navy" className="absolute top-3 left-3 text-[10px]">
                      {evt.category}
                    </Badge>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white leading-snug">{evt.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{evt.description}</p>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-navy-800">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{new Date(evt.startDate).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.venue} • Talanta Stadium</span>
                      </div>
                    </div>

                    {/* Available Categories Pills */}
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {evt.categories.map((c) => (
                        <span key={c.id} className="text-[10px] bg-navy-950 border border-navy-800 text-slate-300 px-2 py-0.5 rounded">
                          {c.name || c.categoryName}: {formatCurrency(c.price)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-navy-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Starting From</span>
                      <span className="text-base font-bold text-emerald-400">
                        {formatCurrency(minPrice)}
                      </span>
                    </div>

                    <Link href={`/tickets/${evt.slug || evt.id}`}>
                      <Button variant="primary" size="sm" className="space-x-1">
                        <span>Select Category</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
