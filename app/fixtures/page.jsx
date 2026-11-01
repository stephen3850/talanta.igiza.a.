'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { initialEvents } from '../../lib/mockData';
import { Calendar, MapPin, Search, ArrowRight, Filter } from 'lucide-react';

export default function PublicFixturesPage() {
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
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] font-sans text-neutral-800 selection:bg-[#E5B83F] selection:text-black">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        {/* Page Header Banner */}
        <div className="bg-[#F8F7F5] border border-[#E5E3DF] p-8 space-y-2">
          <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
            OFFICIAL STADIUM SCHEDULE
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black uppercase font-sans tracking-tight">
            Matchday Fixtures & Events
          </h1>
          <div className="w-16 h-1 bg-[#CC0000] my-2"></div>
          <p className="text-xs sm:text-sm text-neutral-600 font-medium">
            Official ticket allocations for sporting events and tournaments at Talanta Sports City, Nairobi.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-[#EAEAEA] border border-[#DDDCD8] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by team, tournament, or event keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] pl-10 pr-4 py-2 text-xs text-black placeholder-neutral-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
            <Filter className="w-4 h-4 text-neutral-500 shrink-0" />
            {['ALL', 'Football', 'Rugby'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#CC0000] text-white'
                    : 'bg-[#FAF9F5] text-neutral-800 border border-[#DDDCD8] hover:bg-[#EAEAEA]'
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
              className="bg-white border border-[#DDDCD8] hover:border-[#CC0000] overflow-hidden shadow-sm hover:shadow-md flex flex-col justify-between transition-all duration-300 group"
            >
              <div>
                {/* Image Container with Title Overlay */}
                <div className="relative h-52 overflow-hidden bg-black">
                  <img
                    src={evt.image || evt.bannerUrl || '/images/Talanta-stadium.jpeg'}
                    alt={evt.title}
                    onError={(e) => { e.currentTarget.src = '/images/Talanta-stadium.jpeg'; }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                  <h3 className="absolute bottom-3 left-4 right-12 text-lg sm:text-xl font-black text-white uppercase font-sans tracking-tight leading-snug drop-shadow-md">
                    {evt.title}
                  </h3>

                  <div className="absolute top-3 right-3 flex flex-col w-2 h-6 shadow-sm overflow-hidden">
                    <div className="h-2 bg-black"></div>
                    <div className="h-2 bg-[#CC0000]"></div>
                    <div className="h-2 bg-[#008000]"></div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3 bg-[#EAEAEA] border-t border-[#DDDCD8]">
                  <span className="text-[10px] font-bold text-[#E5B83F] uppercase tracking-wider block">
                    {evt.category}
                  </span>
                  <p className="text-xs text-neutral-600 font-medium line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>

                  <div className="space-y-1.5 pt-2 text-xs font-semibold text-neutral-700">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-[#CC0000] shrink-0" />
                      <span>{evt.displayDate || (evt.startDate && new Date(evt.startDate).toLocaleDateString())}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span>{evt.venue || 'Talanta Stadium'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 bg-[#EAEAEA]">
                <div className="pt-3 border-t border-[#DDDCD8] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase font-medium block">GENERAL ADMISSION</span>
                    <span className="text-sm font-black text-black font-mono">
                      {evt.categories?.[0]?.price ? `KES ${evt.categories[0].price.toLocaleString()}` : 'KES 1,000'}
                    </span>
                  </div>

                  <Link href={`/events/${evt.slug || evt.id}`}>
                    <button className="bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase px-4 py-2 transition-colors flex items-center space-x-1 shadow-sm">
                      <span>BOOK TICKET</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
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
