'use client';

import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import { Mail, PhoneCall, MapPin, Send, Landmark, ShieldCheck, Clock } from 'lucide-react';

export default function ContactPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="success" size="md">STADIUM COMMUNICATIONS</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Contact Talanta Stadium Operations
          </h1>
          <p className="text-sm text-slate-400">
            Reach out to the Ministry of Sports venue team or ST-Tech ICT technical support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Contact Form */}
          <div className="lg:col-span-7 bg-navy-900 border border-navy-800 rounded-3xl p-8 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-white">Send an Official Inquiry</h2>

            {submitted ? (
              <div className="bg-emerald-500/10 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-3">
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-base font-bold text-white">Inquiry Received Successfully!</h3>
                <p className="text-xs text-slate-300">
                  Thank you for reaching out. A representative from ST-Tech ICT Consultants or Ministry venue operations will respond shortly.
                </p>
                <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                  Send Another Inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jane Wanjiku"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Inquiry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="General Inquiry">General Venue Inquiry</option>
                    <option value="Ticketing Support">M-PESA Ticketing & Wallet Support</option>
                    <option value="Corporate Hospitality">Corporate Hospitality & VIP Suites</option>
                    <option value="Media Accreditation">Media Accreditation & Press Access</option>
                    <option value="Technical ICT">ST-Tech Technical Platform Support</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">Message Details</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter your query or request..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
                  ></textarea>
                </div>

                <Button type="submit" variant="primary" className="w-full justify-center space-x-2 py-3">
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </Button>
              </form>
            )}
          </div>

          {/* Right Venue Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 space-y-6 shadow-xl">
              <h2 className="text-xl font-bold text-white">Venue Location & Contacts</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3 text-slate-300">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Talanta Sports City</span>
                    <span>Nairobi, Kenya • 60,000 Capacity Main Bowl</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-slate-300">
                  <Landmark className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Ministry Responsibility</span>
                    <span>Ministry of Sports / Government Stadium Authority</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-slate-300">
                  <Mail className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Digital Support Email</span>
                    <span>support@sttech.co.ke • info@sports.go.ke</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-slate-300">
                  <PhoneCall className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Matchday Hotline</span>
                    <span>+254 700 000 000 / +254 20 000 0000</span>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-slate-300">
                  <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">Support Hours</span>
                    <span>Mon - Fri: 08:00 - 17:00 EAT | Matchday: 24 Hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
