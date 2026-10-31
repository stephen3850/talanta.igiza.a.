'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { Mail, PhoneCall, MapPin, Send, CheckCircle2, ArrowRight, X } from 'lucide-react';

export default function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const departmentContacts = [
    {
      title: 'GUEST SERVICES',
      desc: 'Lost & found, accessibility, day-of-event questions.',
      email: 'guests@talantastadium.co.ke',
      phone: '+254 20 000 0001',
    },
    {
      title: 'TICKETING',
      desc: 'Refunds, transfers, season tickets and group sales.',
      email: 'tickets@talantastadium.co.ke',
      phone: '+254 20 000 0002',
    },
    {
      title: 'SUITES & PREMIUM',
      desc: 'Suite leasing, club memberships, hospitality packages.',
      email: 'premium@talantastadium.co.ke',
      phone: '+254 20 000 0003',
    },
    {
      title: 'PRIVATE EVENTS',
      desc: 'Concert bookings, conferences, weddings, filming.',
      email: 'events@talantastadium.co.ke',
      phone: '+254 20 000 0004',
    },
    {
      title: 'PRESS & MEDIA',
      desc: 'Credentials, interviews, broadcast inquiries.',
      email: 'press@talantastadium.co.ke',
      phone: '+254 20 000 0005',
    },
    {
      title: 'CAREERS',
      desc: 'Full-time, part-time and game-day roles.',
      email: 'careers@talantastadium.co.ke',
      phone: '—',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] font-sans text-neutral-800 selection:bg-[#E5B83F] selection:text-black">
      <Navbar />

      <main className="flex-1 w-full">
        {/* ==================== 1. PAGE HEADER ==================== */}
        <section className="relative bg-[#F8F7F5] border-b border-[#E5E3DF] py-12 sm:py-16 overflow-hidden">
          {/* Subtle Refined Background Pattern */}
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
                CONNECT
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black uppercase font-sans tracking-tight leading-none">
                CONTACT US
              </h1>
              {/* Red Accent Line */}
              <div className="w-16 h-1 bg-[#CC0000] my-2"></div>
            </div>
          </div>
        </section>

        {/* ==================== 2. MAIN CONTENT GRID ==================== */}
        <section className="py-12 sm:py-16 bg-[#FAF9F5] border-b border-[#E5E3DF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* LEFT COLUMN: REACH THE RIGHT TEAM (Department Cards) */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-black uppercase font-sans tracking-tight">
                    REACH THE RIGHT TEAM.
                  </h2>
                  <div className="w-12 h-0.5 bg-[#CC0000] mt-2 mb-3"></div>
                  <p className="text-xs text-neutral-600 font-medium">
                    Talanta Stadium · Kasarani, Nairobi · Kenya
                  </p>
                </div>

                <div className="space-y-4">
                  {departmentContacts.map((dept) => (
                    <div
                      key={dept.title}
                      className="bg-[#EAEAEA] border border-[#DDDCD8] p-5 space-y-2"
                    >
                      <h3 className="text-xs sm:text-sm font-black text-[#E5B83F] uppercase tracking-wider">
                        {dept.title}
                      </h3>
                      <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                        {dept.desc}
                      </p>
                      <div className="pt-2 border-t border-[#DDDCD8] flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-black">
                        <a
                          href={`mailto:${dept.email}`}
                          className="hover:text-[#CC0000] transition-colors underline"
                        >
                          {dept.email}
                        </a>
                        <span className="text-neutral-700">{dept.phone}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: GENERAL INQUIRY FORM */}
              <div className="lg:col-span-6 bg-[#EAEAEA] border border-[#DDDCD8] p-6 sm:p-8 space-y-5 shadow-sm">
                <div>
                  <span className="text-[#E5B83F] font-black text-xs uppercase tracking-widest block mb-1">
                    SEND A MESSAGE
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-black uppercase font-sans tracking-tight">
                    GENERAL INQUIRY FORM
                  </h2>
                </div>

                {submitted ? (
                  <div className="bg-white border border-emerald-300 p-6 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <h3 className="text-base font-black text-black uppercase">MESSAGE SENT SUCCESSFULLY!</h3>
                    <p className="text-xs text-neutral-600 font-medium">
                      Thank you for contacting Talanta Stadium. Our guest services team will respond to your inquiry within 24 hours.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase px-4 py-2 mt-2 transition-colors"
                    >
                      SEND ANOTHER MESSAGE
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3.5 py-2.5 text-xs text-black focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3.5 py-2.5 text-xs text-black focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3.5 py-2.5 text-xs text-black focus:outline-none"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Phone (optional)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3.5 py-2.5 text-xs text-black focus:outline-none"
                      />
                    </div>

                    <div>
                      <select
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        required
                        className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3.5 py-2.5 text-xs text-neutral-700 focus:outline-none"
                      >
                        <option value="" disabled>
                          Topic...
                        </option>
                        <option value="Guest Services">Guest Services & General Inquiry</option>
                        <option value="Ticketing">Ticketing & Refunds</option>
                        <option value="Suites">VIP Suites & Premium Hospitality</option>
                        <option value="Private Events">Private Events & Concert Bookings</option>
                        <option value="Press">Press & Media Accreditation</option>
                        <option value="Careers">Careers & Game-Day Roles</option>
                      </select>
                    </div>

                    <div>
                      <textarea
                        required
                        rows={4}
                        placeholder="How can we help?"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-[#FAF9F5] border border-[#DDDCD8] focus:border-[#CC0000] px-3.5 py-2.5 text-xs text-black focus:outline-none resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase py-3.5 transition-colors shadow-sm flex items-center justify-center space-x-2"
                    >
                      <span>SEND MESSAGE</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== 3. QUICK LINKS SECTION ==================== */}
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
                <h3 className="text-sm font-black text-[#E5B83F] uppercase font-sans tracking-tight group-hover:text-[#CC0000] transition-colors">
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

      <Footer />
    </div>
  );
}
