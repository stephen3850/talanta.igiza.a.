'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { ShoppingBag, ArrowRight, CheckCircle2, X, Clock, MapPin, Smartphone } from 'lucide-react';

export default function StorePage() {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const products = [
    {
      id: 'prod-01',
      title: 'HARAMBEE STARS HOME JERSEY 2026',
      category: 'MATCH KITS',
      price: 4500,
      image: '/images/Bayern Munich vs Ajax Match Poster.png',
      badge: 'OFFICIAL KIT',
    },
    {
      id: 'prod-02',
      title: 'HARAMBEE STARS AWAY JERSEY 2026',
      category: 'MATCH KITS',
      price: 4500,
      image: '/images/Talanta-stadium.jpeg',
      badge: 'OFFICIAL KIT',
    },
    {
      id: 'prod-03',
      title: 'TALANTA CREST CAP',
      category: 'HEADWEAR',
      price: 1800,
      image: '/images/talanta-stadium-aerial.png',
      badge: 'BESTSELLER',
    },
    {
      id: 'prod-04',
      title: 'MAASAI-PRINT SCARF',
      category: 'ACCESSORIES',
      price: 2200,
      image: '/images/Talanta-stadium.jpeg',
      badge: 'HERITAGE',
    },
    {
      id: 'prod-05',
      title: 'KENTE HOODIE, BLACK',
      category: 'LIMITED DROPS',
      price: 5900,
      image: '/images/Talanta-stadium.jpeg',
      badge: 'EXCLUSIVE',
    },
    {
      id: 'prod-06',
      title: 'STADIUM OPENING TEE',
      category: 'COMMEMORATIVE',
      price: 1500,
      image: '/images/Bayern Munich vs Ajax Match Poster.png',
      badge: 'LIMITED EDITION',
    },
    {
      id: 'prod-07',
      title: 'KIDS HARAMBEE KIT',
      category: 'YOUTH',
      price: 3200,
      image: '/images/Talanta-stadium.jpeg',
      badge: 'KIDS',
    },
    {
      id: 'prod-08',
      title: 'TALANTA X TUSKER PINT GLASS',
      category: 'DRINKWARE',
      price: 800,
      image: '/images/talanta-stadium-aerial.png',
      badge: 'OFFICIAL MERCH',
    },
    {
      id: 'prod-09',
      title: 'MATCHDAY TOTE BAG',
      category: 'BAGS',
      price: 1200,
      image: '/images/Talanta-stadium.jpeg',
      badge: 'NEW',
    },
  ];

  const handleAddToCart = (product) => {
    setCartItems((prev) => [...prev, product]);
    setCartCount((prev) => prev + 1);
    setCartModalOpen(true);
  };

  const handleMpesaCheckout = (e) => {
    e.preventDefault();
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setCartModalOpen(false);
      setCartItems([]);
      setCartCount(0);
    }, 2500);
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] font-sans text-neutral-800 selection:bg-[#E5B83F] selection:text-black">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ==================== 1. HEADER BANNER ==================== */}
        <section className="relative bg-[#F8F7F5] border-b border-[#E5E3DF] py-12 sm:py-16 overflow-hidden">
          {/* Subtle Geometric Background Pattern */}
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
                TEAM STORE
              </h1>
              {/* Red Accent Line */}
              <div className="w-16 h-1 bg-[#CC0000] my-2"></div>
            </div>
          </div>
        </section>

        {/* ==================== 2. HERO CALLOUT BANNER ==================== */}
        <section className="py-12 bg-[#FAF9F5] border-b border-[#E5E3DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Text Column */}
              <div className="lg:col-span-6 space-y-4">
                <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
                  IN-STADIUM · ONLINE
                </span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black uppercase font-sans tracking-tight leading-none">
                  WEAR KENYA. WEAR TALANTA.
                </h2>
                <div className="w-12 h-1 bg-[#CC0000] my-2"></div>

                <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed max-w-xl">
                  Official Harambee Stars kits, Talanta-branded apparel, and limited-edition drops inspired by Kenyan textile heritage. Open on event days at Gate 4 and online year-round.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <a
                    href="#merchandise"
                    className="bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 transition-colors shadow-sm rounded-none inline-flex items-center space-x-2"
                  >
                    <span>SHOP NOW</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href="#hours"
                    className="bg-[#EAEAEA] hover:bg-[#DDDCD8] border border-[#DDDCD8] text-neutral-900 font-extrabold text-xs tracking-wider uppercase px-6 py-3.5 transition-colors shadow-sm rounded-none inline-flex items-center space-x-2"
                  >
                    <span>STORE HOURS</span>
                  </a>
                </div>
              </div>

              {/* Right Cards Column */}
              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hero Card 1 */}
                <div className="relative h-64 overflow-hidden bg-black group border border-[#DDDCD8]">
                  <img
                    src="/images/Talanta-stadium.jpeg"
                    alt="Match Kits"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-2xl font-black text-white uppercase font-sans">
                    MATCH KITS
                  </h3>
                  <div className="absolute top-3 right-3 flex flex-col w-2 h-6 overflow-hidden">
                    <div className="h-2 bg-black"></div>
                    <div className="h-2 bg-[#CC0000]"></div>
                    <div className="h-2 bg-[#008000]"></div>
                  </div>
                </div>

                {/* Hero Card 2 */}
                <div className="relative h-64 overflow-hidden bg-black group border border-[#DDDCD8]">
                  <img
                    src="/images/Bayern Munich vs Ajax Match Poster.png"
                    alt="Limited Drops"
                    className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                  <h3 className="absolute bottom-4 left-4 text-2xl font-black text-white uppercase font-sans">
                    LIMITED DROPS
                  </h3>
                  <div className="absolute top-3 right-3 flex flex-col w-2 h-6 overflow-hidden">
                    <div className="h-2 bg-black"></div>
                    <div className="h-2 bg-[#CC0000]"></div>
                    <div className="h-2 bg-[#008000]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 3. FEATURED MERCHANDISE GRID ==================== */}
        <section id="merchandise" className="py-12 sm:py-16 bg-[#FAF9F5] border-b border-[#E5E3DF] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-black uppercase font-sans tracking-tight leading-none">
                FEATURED MERCHANDISE
              </h2>
              <div className="w-12 h-1 bg-[#CC0000] my-2"></div>
            </div>

            {/* 3-Column Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-[#DDDCD8] rounded-none overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {/* Image Container with Title Overlay */}
                    <div className="relative h-56 sm:h-64 overflow-hidden bg-[#F8F7F5]">
                      <img
                        src={prod.image}
                        alt={prod.title}
                        onError={(e) => { e.currentTarget.src = '/images/Talanta-stadium.jpeg'; }}
                        className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

                      {/* Overlaid White Title */}
                      <h3 className="absolute bottom-3 left-4 right-12 text-lg sm:text-xl font-black text-white uppercase font-sans tracking-tight leading-tight drop-shadow-md">
                        {prod.title}
                      </h3>

                      {/* Flag Badge Top Right */}
                      <div className="absolute top-3 right-3 flex flex-col w-2 h-6 shadow-sm overflow-hidden">
                        <div className="h-2 bg-black"></div>
                        <div className="h-2 bg-[#CC0000]"></div>
                        <div className="h-2 bg-[#008000]"></div>
                      </div>
                    </div>

                    {/* Information Panel Below Image */}
                    <div className="bg-[#EAEAEA] p-5 space-y-2 border-t border-[#DDDCD8]">
                      <h4 className="text-sm sm:text-base font-black text-black uppercase font-sans tracking-tight">
                        {prod.title}
                      </h4>
                      <div className="text-xs font-black font-mono text-neutral-800">
                        KSH {prod.price.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Footer */}
                  <div className="p-5 pt-0 bg-[#EAEAEA] flex items-center justify-between">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      {prod.category}
                    </span>
                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase px-4 py-2 transition-colors shadow-sm rounded-none flex items-center space-x-1"
                    >
                      <span>ADD</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== 4. STORE HOURS & LOCATION ==================== */}
        <section id="hours" className="py-12 bg-[#F8F7F5] border-b border-[#E5E3DF] scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-[#E0E0E0] p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center shadow-sm">
              <div className="lg:col-span-6 space-y-3">
                <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block">
                  VISIT US
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                  TALANTA TEAM STORE, GATE 4
                </h3>
                <div className="w-12 h-0.5 bg-[#CC0000] my-2"></div>
                <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                  Located on the West Concourse near Gate 4. Mobile payments accepted (M-Pesa, Airtel Money, card).
                </p>
              </div>

              <div className="lg:col-span-6 bg-[#FAF9F5] border border-[#DDDCD8] p-6 space-y-2 text-xs font-bold text-neutral-800">
                <div className="flex justify-between py-1 border-b border-[#E0E0E0]">
                  <span className="uppercase text-neutral-500 font-bold">MON – FRI</span>
                  <span>10:00 – 18:00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E0E0E0]">
                  <span className="uppercase text-neutral-500 font-bold">SATURDAY</span>
                  <span>09:00 – 19:00</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E0E0E0]">
                  <span className="uppercase text-neutral-500 font-bold">SUNDAY</span>
                  <span>11:00 – 17:00</span>
                </div>
                <div className="flex justify-between py-1 text-[#CC0000]">
                  <span className="uppercase font-extrabold">EVENT DAYS</span>
                  <span>Doors → +1hr post-event</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 5. QUICK LINKS SECTION ==================== */}
        <section className="py-12 bg-[#FAF9F5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* ==================== CART & M-PESA CHECKOUT MODAL ==================== */}
      {cartModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-50 duration-150">
          <div className="bg-white border border-[#E0E0E0] rounded-none w-full max-w-md p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setCartModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-black text-[#CC0000] uppercase tracking-widest block">
                TALANTA STORE CART
              </span>
              <h3 className="text-xl font-black text-black uppercase">SHOPPING BAG ({cartCount} ITEMS)</h3>
            </div>

            {checkoutSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-center text-xs font-bold space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
                <span>M-PESA Payment Prompt Sent!</span>
                <span className="block text-[10px] text-emerald-700 font-medium">Please enter your M-PESA PIN on your mobile phone to complete checkout.</span>
              </div>
            ) : (
              <form onSubmit={handleMpesaCheckout} className="space-y-4">
                <div className="max-h-48 overflow-y-auto space-y-2 border-y border-[#E0E0E0] py-3">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs font-bold text-neutral-800 bg-[#F8F7F5] p-2 border border-[#E0E0E0]">
                      <span className="truncate pr-2">{item.title}</span>
                      <span className="font-mono text-[#CC0000]">KSH {item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm font-black text-black">
                  <span>TOTAL AMOUNT:</span>
                  <span className="font-mono text-[#CC0000] text-lg">KSH {totalPrice.toLocaleString()}</span>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-neutral-700 mb-1">
                    Safaricom Phone Number (M-PESA)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+254 700 000 000"
                    className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3 py-2.5 text-xs text-black focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase py-3.5 transition-colors shadow-sm flex items-center justify-center space-x-2"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>PAY WITH M-PESA</span>
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
