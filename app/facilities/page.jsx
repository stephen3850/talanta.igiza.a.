'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Car,
  ShieldAlert,
  MapPin,
  Utensils,
  Accessibility,
  HelpCircle,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Download,
  X
} from 'lucide-react';

export default function PlanYourVisitPage() {
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadGuide = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      setGuideModalOpen(false);
    }, 2500);
  };

  const visitorCards = [
    {
      id: 'parking',
      title: 'PARKING & TRANSPORTATION',
      desc: 'Buy parking ahead, view zone maps, BRT routes, matatu stages and rideshare drop-offs.',
      image: '/images/Talanta-stadium.jpeg',
      fallbackImage: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=800&auto=format&fit=crop',
      link: '/parking',
    },
    {
      id: 'rideshare',
      title: 'RIDESHARE',
      desc: 'Designated Uber, Bolt and Little Cab pick-up and drop-off zones at Talanta Stadium.',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop',
      fallbackImage: '/images/talanta-stadium-aerial.png',
      link: '/parking',
    },
    {
      id: 'bag-policies',
      title: 'STADIUM & BAG POLICIES',
      desc: 'Approved bag sizes, screening, prohibited items and gate procedures.',
      image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=800&auto=format&fit=crop',
      fallbackImage: '/images/Talanta-stadium.jpeg',
      link: '/help',
    },
    {
      id: 'seating-maps',
      title: 'SEATING MAPS',
      desc: 'Explore the Talanta bowl, Lower, Club, Suite and Upper levels.',
      image: '/images/talanta-stadium-aerial.png',
      fallbackImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
      link: '/suites',
    },
    {
      id: 'food-beverage',
      title: 'FOOD & BEVERAGE',
      desc: "Nairobi's best nyama choma, swahili coast cuisine, Tusker bars and family stands.",
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800&auto=format&fit=crop',
      fallbackImage: '/images/Bayern Munich vs Ajax Match Poster.png',
      link: '/services',
    },
    {
      id: 'accessibility',
      title: 'ACCESSIBILITY SERVICES',
      desc: 'Wheelchair seating, sensory rooms, mobility shuttles and assistive devices.',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?q=80&w=800&auto=format&fit=crop',
      fallbackImage: '/images/Talanta-stadium.jpeg',
      link: '/help',
    },
    {
      id: 'prohibited-items',
      title: 'PROHIBITED ITEMS',
      desc: 'What you can and cannot bring into Talanta Stadium.',
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=800&auto=format&fit=crop',
      fallbackImage: '/images/Talanta-stadium.jpeg',
      link: '/help',
    },
    {
      id: 'health-safety',
      title: 'HEALTH & SAFETY',
      desc: 'Security screening, first-aid stations, lost & found, family meeting points.',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
      fallbackImage: '/images/Talanta-stadium.jpeg',
      link: '/help',
    },
    {
      id: 'guest-services',
      title: 'GUEST SERVICES',
      desc: 'Information kiosks, languages spoken, mobile ticketing and on-site help.',
      image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?q=80&w=800&auto=format&fit=crop',
      fallbackImage: '/images/talanta-stadium-aerial.png',
      link: '/contact',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] font-sans text-neutral-800 selection:bg-[#E5B83F] selection:text-black">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ==================== 1. PAGE HEADER ==================== */}
        <section className="relative bg-[#F8F7F5] border-b border-[#E5E3DF] py-12 sm:py-16 overflow-hidden">
          {/* Subtle Refined Background Dots Grid */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#E5B83F 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          ></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="space-y-3">
              <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
                VISITOR INFO
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black uppercase font-sans tracking-tight leading-none">
                PLAN YOUR VISIT
              </h1>
              {/* Red Accent Line */}
              <div className="w-16 h-1 bg-[#CC0000] my-2"></div>
            </div>

            {/* ==================== 2. INTRODUCTION ==================== */}
            <div className="pt-6">
              <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed max-w-3xl">
                Everything you need to know before arriving at Talanta Stadium, from parking and matatu routes to bag policies, accessibility services and on-site amenities. Karibu Nairobi.
              </p>
            </div>
          </div>
        </section>

        {/* ==================== 3 & 4. VISITOR INFO CARDS GRID ==================== */}
        <section className="py-12 sm:py-16 bg-[#FAF9F5] border-b border-[#E5E3DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {visitorCards.map((card) => (
                <div
                  key={card.id}
                  className="bg-white border border-[#DDDCD8] rounded-none overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container with Title Overlay */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-black">
                      <img
                        src={card.image}
                        alt={card.title}
                        onError={(e) => { e.currentTarget.src = card.fallbackImage || '/images/Talanta-stadium.jpeg'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                      {/* Overlaid White Title on Bottom Left */}
                      <h2 className="absolute bottom-4 left-4 right-12 text-xl sm:text-2xl font-black text-white uppercase font-sans tracking-tight leading-tight drop-shadow-md">
                        {card.title}
                      </h2>

                      {/* Flag Badge Top Right */}
                      <div className="absolute top-3 right-3 flex flex-col w-2 h-6 shadow-sm overflow-hidden">
                        <div className="h-2 bg-black"></div>
                        <div className="h-2 bg-[#CC0000]"></div>
                        <div className="h-2 bg-[#008000]"></div>
                      </div>
                    </div>

                    {/* Information Panel Below Image */}
                    <div className="bg-[#EAEAEA] p-6 space-y-3 border-t border-[#DDDCD8]">
                      <div>
                        <h3 className="text-lg sm:text-xl font-black text-black uppercase font-sans tracking-tight">
                          {card.title}
                        </h3>
                        {/* Red Accent Line */}
                        <div className="w-8 h-0.5 bg-[#CC0000] mt-1.5 mb-2"></div>
                      </div>

                      <p className="text-xs text-neutral-600 font-medium leading-relaxed line-clamp-3">
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  {/* Panel Footer Action Link */}
                  <div className="p-6 pt-0 bg-[#EAEAEA]">
                    <Link
                      href={card.link}
                      className="inline-flex items-center text-xs font-black tracking-wider uppercase text-black hover:text-[#CC0000] transition-colors space-x-1 group/link"
                    >
                      <span>MORE INFO</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== 5. FIRST-TIME VISITOR SECTION ==================== */}
        <section className="py-12 bg-[#F8F7F5] border-b border-[#E5E3DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-[#E0E0E0] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2 max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                  FIRST TIME VISITING TALANTA?
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                  Download our visitor guide and arrive ready to enjoy the show.
                </p>
              </div>

              <button
                onClick={() => setGuideModalOpen(true)}
                className="bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 transition-colors shadow-sm rounded-none shrink-0 flex items-center space-x-2"
              >
                <span>GET THE GUIDE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ==================== 6. QUICK LINKS SECTION ==================== */}
        <section className="py-12 bg-[#FAF9F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Panel 1 */}
              <Link
                href="/parking"
                className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 hover:bg-[#E2E2E2] transition-colors group block"
              >
                <div className="w-8 h-0.5 bg-[#CC0000] mb-3"></div>
                <h3 className="text-sm font-black text-black uppercase font-sans tracking-tight group-hover:text-[#CC0000] transition-colors">
                  DIRECTIONS TO TALANTA STADIUM
                </h3>
                <p className="text-xs text-neutral-600 font-medium mt-2 leading-relaxed">
                  Parking, matatu routes, BRT and rideshare information.
                </p>
              </Link>

              {/* Panel 2 */}
              <Link
                href="/parking"
                className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 hover:bg-[#E2E2E2] transition-colors group block"
              >
                <div className="w-8 h-0.5 bg-[#CC0000] mb-3"></div>
                <h3 className="text-sm font-black text-black uppercase font-sans tracking-tight group-hover:text-[#CC0000] transition-colors">
                  BUY PARKING
                </h3>
                <p className="text-xs text-neutral-600 font-medium mt-2 leading-relaxed">
                  We highly recommend purchasing parking ahead of your arrival.
                </p>
              </Link>

              {/* Panel 3 */}
              <Link
                href="/suites"
                className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 hover:bg-[#E2E2E2] transition-colors group block"
              >
                <div className="w-8 h-0.5 bg-[#CC0000] mb-3"></div>
                <h3 className="text-sm font-black text-black uppercase font-sans tracking-tight group-hover:text-[#CC0000] transition-colors">
                  RESERVE A SUITE
                </h3>
                <p className="text-xs text-neutral-600 font-medium mt-2 leading-relaxed">
                  Experience premium amenities at an upcoming event at Talanta.
                </p>
              </Link>

              {/* Panel 4 */}
              <Link
                href="/facilities"
                className="bg-[#EAEAEA] border border-[#DDDCD8] p-6 hover:bg-[#E2E2E2] transition-colors group block"
              >
                <div className="w-8 h-0.5 bg-[#CC0000] mb-3"></div>
                <h3 className="text-sm font-black text-black uppercase font-sans tracking-tight group-hover:text-[#CC0000] transition-colors">
                  PLAN YOUR VISIT
                </h3>
                <p className="text-xs text-neutral-600 font-medium mt-2 leading-relaxed">
                  Parking, transport, prohibited items, bag policy and more.
                </p>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== VISITOR GUIDE DOWNLOAD MODAL ==================== */}
      {guideModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white border border-[#E0E0E0] rounded-none w-full max-w-md p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setGuideModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <span className="text-xs font-extrabold text-[#CC0000] uppercase tracking-widest">
                OFFICIAL MATCHDAY GUIDE
              </span>
              <h3 className="text-xl font-black text-black uppercase">Talanta Stadium Visitor Guide</h3>
              <p className="text-xs text-neutral-600">
                Get essential arrival routes, gate zone entry procedures, food stands, and bag policies in one digital guide.
              </p>
            </div>

            {downloadSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-center text-xs font-bold space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span>Visitor Guide Downloaded Successfully!</span>
                <span className="block text-[10px] text-emerald-700 font-medium">Welcome to Talanta Stadium, Nairobi.</span>
              </div>
            ) : (
              <div className="pt-2 space-y-3">
                <div className="bg-[#F8F7F5] p-3 text-xs text-neutral-700 space-y-1">
                  <span className="font-bold block">Document Info:</span>
                  <span>PDF • 2.4 MB • Official 2026 Matchday Edition</span>
                </div>

                <button
                  onClick={handleDownloadGuide}
                  className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase py-3 transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>DOWNLOAD VISITOR GUIDE (PDF)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== 7. FOOTER ==================== */}
      <Footer />
    </div>
  );
}
