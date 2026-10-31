'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Link from 'next/link';
import {
  Building2,
  Award,
  Tv2,
  Users,
  Shield,
  Smartphone,
  Activity,
  ArrowRight,
  Compass
} from 'lucide-react';

export default function FacilitiesPage() {
  const facilities = [
    {
      title: '60,000-Seat All-Seater Main Bowl',
      category: 'Match Arena',
      desc: 'High-visibility sightlines, ergonomic seating, all-weather pitch drainage, and LED floodlighting meeting FIFA & IAAF requirements.',
      icon: Building2,
      image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'VIP & Presidential Hospitality Suites',
      category: 'Corporate Hospitality',
      desc: 'Private executive boxes, presidential lounges, catering suites, and high-security access controls.',
      icon: Award,
      image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Media & 4K Broadcast Centre',
      desc: 'High-speed fiber connectivity, press conference hall, VAR operation room, and international TV OB truck bays.',
      icon: Tv2,
      image: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Accessible & Family Spectator Bays',
      desc: 'Step-free access ramps, tactile paving, wheelchair bays, elevators, and dedicated family spectator zones.',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Smart Turnstiles & Outer Perimeter Gates',
      desc: 'Optical QR code turnstiles, high-speed throughput lanes, and offline validation caching.',
      icon: Shield,
      image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=600&auto=format&fit=crop'
    },
    {
      title: 'Concourse Food & Retail Concessions',
      desc: 'Cashless M-PESA food stands, merchandise stores, and digital menu display boards.',
      icon: Smartphone,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="success" size="md">PROPOSED INFRASTRUCTURE</Badge>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Stadium Facilities & Amenities
          </h1>
          <p className="text-sm text-slate-400">
            Comprehensive overview of physical and digital amenities at Talanta Sports City, Nairobi.
          </p>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {facilities.map((fac, idx) => {
            const Icon = fac.icon;
            return (
              <div
                key={idx}
                className="bg-navy-900 border border-navy-800 hover:border-emerald-500/40 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={fac.image}
                      alt={fac.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge variant="navy" className="absolute top-3 left-3 text-[10px]">
                      {fac.category}
                    </Badge>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white leading-snug">{fac.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{fac.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <Link href="/events">
            <Button variant="primary" size="lg" className="space-x-2">
              <Compass className="w-5 h-5" />
              <span>Explore Matchday Events</span>
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
