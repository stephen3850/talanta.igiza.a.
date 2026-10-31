'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Newspaper,
  Calendar,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Building2,
  CheckCircle2,
  Award,
  Radio
} from 'lucide-react';

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // 4 Official Articles in Chronological Order (Newest First)
  const allArticles = [
    {
      id: 'news-03',
      date: '30 October 2026',
      category: 'Digital Infrastructure',
      title: 'ST-Tech ICT Consultants Unveils Smart Stadium Digital Operating Architecture',
      summary: 'ST-Tech ICT Consultants presents an end-to-end digital infrastructure proposal encompassing cashless M-PESA ticketing, optical QR gate scanning, workforce accreditation, and command dashboards.',
      source: 'ST-Tech Technical Release',
      sourceUrl: 'https://www.sttech.co.ke',
      isOfficialGovernment: false,
      hasFullArticle: false,
      image: '/images/Bayern Munich vs Ajax Match Poster.png',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    },
    {
      id: 'news-04',
      date: '15 July 2026',
      category: 'Regulatory Policy',
      title: 'Ministry of Sports Issues Guidelines on Cashless Ticketing & Fan Safety',
      summary: 'New national guidelines mandate transparent revenue settlement, data protection compliance under DPA 2019, and accessible seating allocations across all national sports facilities.',
      source: 'Ministry of Sports Bulletin',
      sourceUrl: 'https://www.sportsheritage.go.ke',
      isOfficialGovernment: true,
      hasFullArticle: true,
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
    },
    {
      id: 'news-01',
      date: '10 February 2026',
      category: 'Civil Construction',
      title: 'China Road and Bridge Corporation (CRBC) Updates Project Timeline',
      summary: 'Main contractor CRBC confirms ongoing structural works at Talanta Sports City, targeting substantial civil completion for Q1 2026 in preparation for upcoming sports events.',
      source: 'CRBC Official Update',
      sourceUrl: 'https://www.crbc.com',
      isOfficialGovernment: true,
      hasFullArticle: true,
      image: '/images/Talanta-stadium.jpeg',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    },
    {
      id: 'news-02',
      date: '11 April 2025',
      category: 'Government Inspection',
      title: 'President Inspects Construction Progress at Talanta Sports City',
      summary: 'President William Ruto conducted a comprehensive site inspection of Talanta Sports City in Nairobi, reaffirming government commitment to world-class sports infrastructure for AFCON 2027.',
      source: 'Office of the President',
      sourceUrl: 'https://www.president.go.ke/president-ruto-inspects-construction-progress-at-talanta-sports-city/',
      isOfficialGovernment: true,
      hasFullArticle: true,
      image: '/images/president.jpg',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    },
  ];

  const categories = [
    'ALL',
    'Government Inspection',
    'Civil Construction',
    'Digital Infrastructure',
    'Regulatory Policy',
  ];

  // Filtered & Searched Articles
  const filteredArticles = useMemo(() => {
    return allArticles.filter((article) => {
      const matchesCategory =
        selectedCategory === 'ALL' || article.category === selectedCategory;
      const matchesQuery =
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-neutral-800 selection:bg-[#E5B83F] selection:text-black">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ==================== 1. PAGE HEADING ==================== */}
        <section className="bg-[#FAF9F5] border-b border-[#E5E3DF] py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
              STADIUM MEDIA CENTRE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-black uppercase font-sans tracking-tight leading-none">
              NEWS & OFFICIAL ANNOUNCEMENTS
            </h1>
            {/* Red Accent Line */}
            <div className="w-16 h-1 bg-[#CC0000] my-2"></div>

            <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed max-w-3xl pt-2">
              Official reporting on Talanta Stadium construction progress, digital operating systems, and sports events.
            </p>
          </div>
        </section>

        {/* ==================== 2. SEARCH & CATEGORY FILTER BAR ==================== */}
        <section className="py-8 bg-white border-b border-[#E5E3DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-2 text-xs font-extrabold uppercase tracking-wider">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2.5 transition-colors border ${
                      selectedCategory === cat
                        ? 'bg-[#CC0000] text-white border-[#CC0000]'
                        : 'bg-[#F8F7F5] text-neutral-700 hover:bg-[#EAEAEA] border-[#E0E0E0]'
                    }`}
                  >
                    {cat === 'ALL' ? 'ALL ANNOUNCEMENTS' : cat}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search announcements..."
                  className="w-full bg-[#F8F7F5] border border-[#DDDCD8] focus:border-[#CC0000] pl-9 pr-4 py-2 text-xs text-black focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-neutral-400 hover:text-black font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 3. LATEST UPDATES GRID ==================== */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between border-b border-[#E0E0E0] pb-4">
              <h2 className="text-2xl font-black text-black uppercase font-sans tracking-tight">
                LATEST UPDATES
              </h2>
              <span className="text-xs font-bold text-neutral-500 uppercase">
                Showing {filteredArticles.length} of {allArticles.length} Releases
              </span>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="bg-[#F8F7F5] border border-[#E0E0E0] p-8 text-center space-y-2">
                <p className="text-sm font-bold text-black">No announcements found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory('ALL');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-[#CC0000] hover:underline uppercase"
                >
                  Clear filters and view all news
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredArticles.map((article) => (
                  <article
                    key={article.id}
                    className="bg-[#F8F7F5] border border-[#E5E3DF] hover:border-[#CC0000] transition-all duration-300 flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-56 sm:h-64 overflow-hidden bg-black">
                        <img
                          src={article.image}
                          alt={article.title}
                          onError={(e) => { e.currentTarget.src = '/images/Talanta-stadium.jpeg'; }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Category Badge Top Left */}
                        <div className="absolute top-3 left-3">
                          <span className={`inline-block px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider border shadow-sm ${article.badgeColor}`}>
                            {article.category}
                          </span>
                        </div>

                        {/* Official / Proposal Tag Top Right */}
                        <div className="absolute top-3 right-3">
                          <span className="inline-block px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider bg-black/80 text-white backdrop-blur-sm border border-white/20">
                            {article.isOfficialGovernment ? 'OFFICIAL NOTICE' : 'ST-TECH RELEASE'}
                          </span>
                        </div>

                        {/* Publication Date Overlaid Bottom Left */}
                        <div className="absolute bottom-3 left-4 text-xs font-bold text-white flex items-center space-x-1.5 drop-shadow">
                          <Calendar className="w-3.5 h-3.5 text-[#E5B83F]" />
                          <span>{article.date}</span>
                        </div>
                      </div>

                      {/* Content Panel */}
                      <div className="p-6 space-y-3">
                        <h3 className="text-lg sm:text-xl font-black text-black leading-snug font-sans uppercase">
                          {article.title}
                        </h3>

                        <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                          {article.summary}
                        </p>
                      </div>
                    </div>

                    {/* Footer Row: Source Attribution & Link */}
                    <div className="p-6 pt-0 space-y-3">
                      <div className="pt-3 border-t border-[#DDDCD8] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-1.5 text-neutral-500 font-semibold text-[11px]">
                          <span>Source:</span>
                          {article.sourceUrl && article.sourceUrl !== '#' ? (
                            <a
                              href={article.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-black hover:text-[#CC0000] underline font-bold inline-flex items-center space-x-1"
                            >
                              <span>{article.source}</span>
                              <ExternalLink className="w-3 h-3 text-neutral-400" />
                            </a>
                          ) : (
                            <span className="text-black font-bold">{article.source}</span>
                          )}
                        </div>

                        {article.hasFullArticle && article.sourceUrl && article.sourceUrl !== '#' ? (
                          <a
                            href={article.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1 text-xs font-black uppercase text-[#CC0000] hover:text-[#B30000] transition-colors"
                          >
                            <span>READ FULL UPDATE</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                            SUPPLIED NOTICE
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
