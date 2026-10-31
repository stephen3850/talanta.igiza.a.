'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import {
  Compass,
  ArrowRight,
  ChevronRight,
  Mail,
  Ticket,
  Users,
  CheckCircle2,
  X,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export default function ToursPage() {
  const [selectedTour, setSelectedTour] = useState(null);
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const tourExperiences = [
    {
      id: 'rally-days',
      title: 'RALLY DAYS',
      subtitle: 'Game Day Pre-Match Tour',
      desc: 'Pre-match game day specials. Feel the electric build-up before the gates open.',
      price: 'KES 2,500',
      duration: '60 Mins',
      image: '/images/Talanta-stadium.jpeg',
    },
    {
      id: 'classic-tour',
      title: 'CLASSIC TOUR',
      subtitle: 'Daily Behind-The-Scenes Access',
      desc: 'Daily access. Walk the pitch, sit in the dugouts, explore the media center.',
      price: 'KES 1,500',
      duration: '90 Mins',
      image: '/images/talanta-stadium-aerial.png',
    },
    {
      id: 'vip-all-access',
      title: 'VIP ALL-ACCESS',
      subtitle: 'Presidential & Executive Access',
      desc: "Includes home locker room, owner's suite, and a pitch-side photo op.",
      price: 'KES 3,500',
      duration: '120 Mins',
      image: '/images/Talanta-stadium.jpeg',
    },
    {
      id: 'schools-youth',
      title: 'SCHOOLS & YOUTH',
      subtitle: 'Educational & STEM Experience',
      desc: 'Educational tour built around STEM, sport and Kenyan history. Bookings for groups of 20+.',
      price: 'KES 800',
      duration: '90 Mins',
      image: '/images/Talanta-stadium.jpeg',
    },
    {
      id: 'concert-mode',
      title: 'CONCERT MODE TOUR',
      subtitle: 'Venue Transformation Tour',
      desc: 'See how Talanta transforms from football pitch to 60,000-person concert venue in 36 hours.',
      price: 'KES 2,000',
      duration: '75 Mins',
      image: '/images/Bayern Munich vs Ajax Match Poster.png',
    },
    {
      id: 'twilight-tour',
      title: 'TWILIGHT TOUR',
      subtitle: 'Sunset & Skyline Experience',
      desc: 'Sunset tour with rooftop access, Nairobi skyline, Ngong Hills, complimentary Tusker.',
      price: 'KES 3,000',
      duration: '100 Mins',
      image: '/images/Talanta-stadium.jpeg',
    },
  ];

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setSelectedTour(null);
      setInquiryModalOpen(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] font-sans text-neutral-800 selection:bg-[#E5B83F] selection:text-black">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ==================== 1. HEADER BANNER ==================== */}
        <section className="relative bg-[#F8F7F5] border-b border-[#E5E3DF] py-12 sm:py-16 overflow-hidden">
          {/* Refined Geometric Pattern Background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(#E5B83F 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
            }}
          ></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="space-y-3">
              <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
                STADIUM
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black uppercase font-sans tracking-tight leading-none">
                TALANTA STADIUM TOURS
              </h1>
              {/* Red Accent Line */}
              <div className="w-16 h-1 bg-[#CC0000] my-2"></div>
            </div>

            {/* ==================== 2. OVERVIEW TEXT ==================== */}
            <div className="pt-6 space-y-4 max-w-3xl">
              <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
                Talanta Stadium, home of Harambee Stars and host of CHAN, AFCON 2027 and the continent's biggest concerts, sits in the heart of Nairobi, a 60,000-seat icon of modern Kenya. Step inside on a guided behind-the-scenes tour and experience what it's like to be a player, broadcaster, suite-holder or VIP guest at the largest sports venue in East Africa.
              </p>
              <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
                Our tours feature exclusive access to spaces normally reserved for athletes and dignitaries, premium suites, the home and away locker rooms, the player tunnel, the press conference theatre and the field itself. Tour tickets include complimentary parking at Talanta Stadium.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={() => setSelectedTour(tourExperiences[1])}
                  className="bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 transition-colors shadow-sm rounded-none flex items-center space-x-2"
                >
                  <span>BUY TOUR TICKETS</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="mailto:tours@talanta.go.ke"
                  className="bg-[#EAEAEA] hover:bg-[#DDDCD8] border border-[#DDDCD8] text-neutral-900 font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 transition-colors shadow-sm rounded-none inline-flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4 text-neutral-700" />
                  <span>EMAIL SUPPORT</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 3. TOUR EXPERIENCES GRID ==================== */}
        <section className="py-12 sm:py-16 bg-[#FAF9F5] border-b border-[#E5E3DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block mb-1">
                CHOOSE YOUR EXPERIENCE
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-black uppercase font-sans tracking-tight leading-none">
                TOUR EXPERIENCES
              </h2>
              <div className="w-12 h-1 bg-[#CC0000] mt-2"></div>
            </div>

            {/* 3-Column Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tourExperiences.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white border border-[#DDDCD8] rounded-none overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container with Title Overlay */}
                    <div className="relative h-48 sm:h-52 overflow-hidden bg-black">
                      <img
                        src={tour.image}
                        alt={tour.title}
                        onError={(e) => { e.currentTarget.src = '/images/Talanta-stadium.jpeg'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                      {/* Overlaid White Title */}
                      <h3 className="absolute bottom-4 left-4 right-12 text-xl sm:text-2xl font-black text-white uppercase font-sans tracking-tight leading-tight drop-shadow-md">
                        {tour.title}
                      </h3>

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
                        <h4 className="text-lg sm:text-xl font-black text-black uppercase font-sans tracking-tight">
                          {tour.title}
                        </h4>
                        <div className="w-8 h-0.5 bg-[#CC0000] mt-1.5 mb-2"></div>
                      </div>

                      <p className="text-xs text-neutral-600 font-medium leading-relaxed line-clamp-3">
                        {tour.desc}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-[11px] font-extrabold text-neutral-800">
                        <span className="text-[#CC0000]">{tour.price} / person</span>
                        <span className="text-neutral-500">{tour.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Panel Footer Action Link */}
                  <div className="p-6 pt-0 bg-[#EAEAEA]">
                    <button
                      onClick={() => setSelectedTour(tour)}
                      className="inline-flex items-center text-xs font-black tracking-wider uppercase text-black hover:text-[#CC0000] transition-colors space-x-1 group/link focus:outline-none"
                    >
                      <span>MORE INFO</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== 4. GROUP BOOKINGS AVAILABLE SECTION ==================== */}
        <section className="py-12 bg-[#F8F7F5] border-b border-[#E5E3DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-[#E0E0E0] p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
              {/* Subtle Striped Line Background Pattern */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(90deg, #CC0000, #CC0000 1px, transparent 1px, transparent 20px)',
                }}
              ></div>

              <div className="space-y-2 max-w-2xl relative z-10">
                <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                  GROUP BOOKINGS AVAILABLE
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium">
                  Schools, corporate groups and tour operators, special rates for parties of 20+.
                </p>
              </div>

              <button
                onClick={() => setInquiryModalOpen(true)}
                className="bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 transition-colors shadow-sm rounded-none shrink-0 flex items-center space-x-2 relative z-10"
              >
                <span>GROUP INQUIRIES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ==================== 5. QUICK LINKS SECTION ==================== */}
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

      {/* ==================== TOUR BOOKING & INFO MODAL ==================== */}
      {(selectedTour || inquiryModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white border border-[#E0E0E0] rounded-none w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-5 relative">
            <button
              onClick={() => {
                setSelectedTour(null);
                setInquiryModalOpen(false);
              }}
              className="absolute top-4 right-4 text-neutral-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            {bookingSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-black text-slate-900 uppercase">
                  {inquiryModalOpen ? 'Group Inquiry Received!' : 'Tour Reservation Confirmed!'}
                </h4>
                <p className="text-xs text-emerald-700 font-medium">
                  {inquiryModalOpen
                    ? 'Our stadium tours team will contact you within 24 hours with group pricing.'
                    : 'Your tour confirmation and e-ticket pass have been issued.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-black text-[#CC0000] uppercase tracking-widest block">
                    {inquiryModalOpen ? 'GROUP BOOKINGS & SPECIAL RATES' : 'STADIUM TOUR BOOKING'}
                  </span>
                  <h3 className="text-2xl font-black text-black uppercase font-sans">
                    {inquiryModalOpen ? 'Group Tour Inquiry (20+ Guests)' : selectedTour?.title}
                  </h3>
                  <p className="text-xs text-neutral-600 font-medium">
                    {inquiryModalOpen
                      ? 'Submit details for schools, corporate groups and tour operators.'
                      : selectedTour?.desc}
                  </p>
                </div>

                {!inquiryModalOpen && selectedTour && (
                  <div className="bg-[#F8F7F5] p-3 text-xs font-bold text-neutral-800 flex items-center justify-between border border-[#E5E3DF]">
                    <span>Rate: <strong className="text-[#CC0000]">{selectedTour.price}</strong> / person</span>
                    <span>Duration: {selectedTour.duration}</span>
                  </div>
                )}

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-neutral-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Kamau"
                      className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3 py-2 text-xs text-black focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-700 mb-1">Phone Number (M-PESA)</label>
                      <input
                        type="tel"
                        required
                        placeholder="+254 700 000 000"
                        className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3 py-2 text-xs text-black focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-700 mb-1">Preferred Date</label>
                      <input
                        type="date"
                        required
                        className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3 py-2 text-xs text-black focus:outline-none"
                      />
                    </div>
                  </div>

                  {inquiryModalOpen && (
                    <div>
                      <label className="block text-[10px] font-black uppercase text-neutral-700 mb-1">Group Size / Guests</label>
                      <input
                        type="number"
                        min="20"
                        defaultValue="25"
                        required
                        className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3 py-2 text-xs text-black focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase py-3.5 transition-colors shadow-sm flex items-center justify-center space-x-2 mt-4"
                >
                  <Ticket className="w-4 h-4" />
                  <span>{inquiryModalOpen ? 'SUBMIT GROUP INQUIRY' : 'PROCEED TO M-PESA CHECKOUT'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ==================== FOOTER ==================== */}
      <Footer />
    </div>
  );
}
