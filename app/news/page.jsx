'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Badge from '../../components/Badge';
import { Newspaper, Calendar, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';

export default function NewsPage() {
  const newsArticles = [
    {
      id: 'news-01',
      date: '10 February 2026',
      category: 'Civil Construction',
      title: 'China Road and Bridge Corporation (CRBC) Updates Project Timeline',
      summary: 'Main contractor CRBC confirms ongoing structural works at Talanta Sports City, targeting substantial civil completion for Q1 2026 in preparation for upcoming sports events.',
      source: 'CRBC Official Update',
      link: 'https://www.crbc.com'
    },
    {
      id: 'news-02',
      date: '11 April 2025',
      category: 'Government Inspection',
      title: 'President Inspects Construction Progress at Talanta Sports City',
      summary: 'President William Ruto conducted a comprehensive site inspection of Talanta Sports City in Nairobi, reaffirming government commitment to world-class sports infrastructure for AFCON 2027.',
      source: 'Office of the President',
      link: 'https://www.president.go.ke'
    },
    {
      id: 'news-03',
      date: '30 October 2026',
      category: 'Digital Infrastructure',
      title: 'ST-Tech ICT Consultants Unveils Smart Stadium Digital Operating Architecture',
      summary: 'ST-Tech ICT Consultants presents an end-to-end digital infrastructure proposal encompassing cashless M-PESA ticketing, optical QR gate scanning, workforce accreditation, and command dashboards.',
      source: 'ST-Tech Technical Release',
      link: '#'
    },
    {
      id: 'news-04',
      date: '15 July 2026',
      category: 'Regulatory Policy',
      title: 'Ministry of Sports Issues Guidelines on Cashless Ticketing & Fan Safety',
      summary: 'New national guidelines mandate transparent revenue settlement, data protection compliance under DPA 2019, and accessible seating allocations across all national sports facilities.',
      source: 'Ministry of Sports Bulletin',
      link: '#'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="success" size="md">STADIUM MEDIA CENTRE</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            News & Official Announcements
          </h1>
          <p className="text-sm text-slate-400">
            Official reporting on Talanta Stadium construction progress, digital operating systems, and sports events.
          </p>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {newsArticles.map((article) => (
            <div
              key={article.id}
              className="bg-navy-900 border border-navy-800 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <Badge variant="navy" size="sm">{article.category}</Badge>
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                    {article.date}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white leading-snug">{article.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{article.summary}</p>
              </div>

              <div className="pt-4 border-t border-navy-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Source: {article.source}</span>
                <span className="text-emerald-400 font-semibold inline-flex items-center space-x-1">
                  <span>Verified Notice</span>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
