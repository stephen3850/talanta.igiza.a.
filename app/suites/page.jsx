'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import {
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Mail,
  User,
  Phone,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function SuitesPage() {
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false);
  const [selectedSuiteName, setSelectedSuiteName] = useState('AFCON 2027 Premium Suites');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [guestCount, setGuestCount] = useState('12');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 5 Hero Photos Carousel/Grid
  const heroImages = [
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop',
  ];

  // 6 Main Suites
  const suitesList = [
    {
      id: 'field',
      title: 'THE PITCH SUITE',
      titleGold: true,
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop',
      description: 'Field-level glass-front suite. 12 guests. Walk-on access to the player tunnel pre-match.',
      capacity: '12 Guests',
      type: 'Field Level',
    },
    {
      id: 'savannah',
      title: 'SAVANNAH SUITE',
      titleGold: false,
      image: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?q=80&w=1200&auto=format&fit=crop',
      description: 'Midfield views. Private dining, open bar, and VIP parking passes.',
      capacity: '20 Guests',
      type: 'Midfield Level',
    },
    {
      id: 'kilimanjaro',
      title: 'KILIMANJARO LOFT',
      titleGold: false,
      image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
      description: 'Sky-level panoramic views. Open-air balcony, ideal for large parties.',
      capacity: '30 Guests',
      type: 'Skyview Level',
    },
    {
      id: 'harambee',
      title: 'HARAMBEE LOUNGE',
      titleGold: false,
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
      description: 'Shared premium lounge for networking. Carvery stations and premium seating.',
      capacity: 'Shared Lounge',
      type: 'Networking Hub',
    },
    {
      id: 'presidential',
      title: 'PRESIDENTIAL BOX',
      titleGold: true,
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
      description: 'The ultimate Talanta Stadium experience. Butler service, private entrance.',
      capacity: '16 VIP Guests',
      type: 'Presidential Level',
    },
    {
      id: 'corporate',
      title: 'CORPORATE SUITES',
      titleGold: false,
      image: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=1200&auto=format&fit=crop',
      description: 'Annual leases for businesses. Customizable branding and priority event access.',
      capacity: '40 Guests',
      type: 'Annual Lease',
    },
  ];

  const handleOpenInquiry = (suiteTitle) => {
    setSelectedSuiteName(suiteTitle);
    setSubmitSuccess(false);
    setInquiryModalOpen(true);
  };

  const handleSendInquiry = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F2] text-slate-900 font-sans selection:bg-amber-400 selection:text-black">
      <Navbar />

      <main className="flex-1 w-full pb-16">
        {/* HERO BANNER CAROUSEL GRID (5 PHOTOS) */}
        <section className="bg-black border-b border-neutral-900 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-5 h-64 sm:h-80 w-full gap-0.5 bg-neutral-900">
            {heroImages.map((src, idx) => (
              <div key={idx} className="relative h-full overflow-hidden group">
                <img
                  src={src}
                  alt={`Talanta Luxury Suite Interior ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 1: HEADER & INTRO TEXT */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-12 pb-10">
          <div className="space-y-4 max-w-4xl">
            <span className="text-[11px] font-black text-[#C89D34] uppercase tracking-widest block">
              PREMIUM
            </span>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-950 uppercase tracking-tight font-sans leading-none">
              <span className="border-b-4 border-[#CC0000] pb-1 inline-block">RESERVE</span> A SUITE
            </h1>

            <div className="pt-6 space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              <p>
                Experience Talanta Stadium from one of our suites, premium private spaces with the best views in Nairobi, world-class hospitality and bespoke East African cuisine. Suites accommodate 12 to 40 guests and include VIP parking, dedicated concierge, all-inclusive food and beverage, and private restrooms.
              </p>
              <p>
                Whether you are entertaining clients, celebrating with family, or hosting partners during AFCON 2027, there is a Talanta suite for every occasion.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: SUITES GRID (3 COLUMNS, 2 ROWS) */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {suitesList.map((suite) => (
              <div
                key={suite.id}
                id={suite.id}
                className="bg-[#EBEAE6] border border-[#DDDCD8] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
              >
                <div>
                  {/* Suite Card Image */}
                  <div className="relative h-64 overflow-hidden bg-slate-950">
                    <img
                      src={suite.image}
                      alt={suite.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

                    {/* Overlaid Title on Image */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight leading-none drop-shadow-md font-sans">
                        {suite.title}
                      </h2>
                      <div className="w-12 h-1 bg-[#D9A74A] mt-2"></div>
                    </div>

                    {/* Top Right Flag Badge */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm border border-white/20 px-2 py-1 flex items-center space-x-1 text-xs">
                      <span>🇰🇪</span>
                    </div>
                  </div>

                  {/* Suite Card Content */}
                  <div className="p-6 space-y-3">
                    <h3
                      className={`text-lg font-black uppercase tracking-tight ${
                        suite.titleGold ? 'text-[#C89D34]' : 'text-slate-950'
                      }`}
                    >
                      {suite.title}
                    </h3>
                    <div className="w-8 h-0.5 bg-[#CC0000]"></div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {suite.description}
                    </p>
                  </div>
                </div>

                {/* More Info / Inquiry Link */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => handleOpenInquiry(suite.title)}
                    className="inline-flex items-center text-xs font-black text-slate-950 hover:text-[#C89D34] uppercase tracking-wider space-x-1 transition-colors"
                  >
                    <span>MORE INFO</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: KEY STATS CALLOUT BANNER */}
        <section className="bg-[#EBE8E1] border-t border-b border-[#D8D5CB] my-12 py-12 px-4 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="space-y-2">
              <div className="text-5xl font-black text-[#D9A74A] tracking-tight font-sans">
                260+
              </div>
              <div className="w-10 h-0.5 bg-[#CC0000]"></div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block pt-1">
                PREMIUM SEATS PER SUITE LEVEL
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-5xl font-black text-[#D9A74A] tracking-tight font-sans">
                24/7
              </div>
              <div className="w-10 h-0.5 bg-[#CC0000]"></div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block pt-1">
                SUITE CONCIERGE HOTLINE
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-5xl font-black text-[#D9A74A] tracking-tight font-sans">
                100%
              </div>
              <div className="w-10 h-0.5 bg-[#CC0000]"></div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider block pt-1">
                INCLUSIVE FOOD & BEVERAGE
              </span>
            </div>
          </div>
        </section>

        {/* SECTION 4: AFCON 2027 SUITES INQUIRY CALLOUT BANNER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-8">
          <div className="bg-[#FAF8F5] border border-[#E2DDD3] p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden bg-[radial-gradient(#E8E3D8_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="space-y-2 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight font-sans">
                INQUIRE ABOUT AFCON 2027 SUITES
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Limited availability. Sign up to be notified about premium opportunities.
              </p>
            </div>

            <button
              onClick={() => handleOpenInquiry('AFCON 2027 Premium Suites')}
              className="bg-[#CC0000] hover:bg-[#B30000] text-white font-black text-xs uppercase tracking-wider px-8 py-4 transition-colors shrink-0 shadow-md"
            >
              REQUEST INFORMATION →
            </button>
          </div>
        </section>

        {/* SECTION 5: BOTTOM QUICK LINKS BANNER (4 COLUMNS) */}
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

      {/* SUITE INQUIRY MODAL */}
      <Modal
        isOpen={inquiryModalOpen}
        onClose={() => setInquiryModalOpen(false)}
        title={`Inquire About ${selectedSuiteName}`}
      >
        {submitSuccess ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white uppercase">Inquiry Received</h3>
            <p className="text-xs text-slate-300">
              Thank you for inquiring about <strong className="text-emerald-400">{selectedSuiteName}</strong>. Our Talanta Hospitality Concierge team will contact you at <span className="text-white">{email}</span> shortly.
            </p>
            <Button
              variant="primary"
              className="w-full justify-center"
              onClick={() => setInquiryModalOpen(false)}
            >
              Close Window
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendInquiry} className="space-y-4">
            <p className="text-xs text-slate-300">
              Complete the form below to receive pricing, availability, and catering packages for <strong className="text-white">{selectedSuiteName}</strong>.
            </p>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. David Omondi"
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david@company.co.ke"
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+254 712 345678"
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Company / Organization</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Optional"
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Estimated Guest Count</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="12">12 Guests (Pitch Suite)</option>
                  <option value="16">16 Guests (Presidential Box)</option>
                  <option value="20">20 Guests (Savannah Suite)</option>
                  <option value="30">30 Guests (Kilimanjaro Loft)</option>
                  <option value="40">40 Guests (Corporate Suite)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setInquiryModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="flex-1 justify-center space-x-2"
              >
                <Mail className="w-4 h-4" />
                <span>Submit Suite Inquiry</span>
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Footer />
    </div>
  );
}
