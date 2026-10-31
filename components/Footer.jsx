'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Smartphone } from 'lucide-react';

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const YoutubeIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-[#F8F7F5] border-t border-[#E5E3DF] text-neutral-700 text-sm font-sans relative selection:bg-[#E5B83F] selection:text-black">
      {/* MAIN FOOTER CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* TOP SECTION: BRAND, VISIT, CONNECT & OPERATIONAL PORTALS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* COL 1 & 2: BRAND WORDMARK, DESCRIPTION & ADDRESS */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <div className="text-2xl sm:text-3xl font-black text-black tracking-tight leading-none font-sans">
                TALANTA <span className="text-[#CC0000]">·</span> STADIUM
              </div>
              <div className="w-28 h-1 flex mt-1">
                <div className="w-1/2 bg-[#CC0000] h-full" />
                <div className="w-1/2 bg-[#008000] h-full" />
              </div>
            </Link>

            <p className="text-xs text-neutral-600 font-medium leading-relaxed max-w-md">
              Kenya's flagship 60,000-seat venue. Home of Harambee Stars, host of AFCON 2027, CHAN, world-class concerts and unforgettable moments, in the heart of Nairobi.
            </p>

            <div className="text-[11px] font-black tracking-wider uppercase text-neutral-800">
              JAMHURI PARK · NGONG ROAD · NAIROBI, KENYA
            </div>

            {/* Preserving ST-Tech & Ministry Branding */}
            <div className="pt-2 text-xs space-y-1">
              <div className="flex items-center space-x-2 text-[#059669] font-bold">
                <Shield className="w-4 h-4 fill-emerald-600 text-white" />
                <span>ST-Tech ICT Platform • Smart Digital Infrastructure</span>
              </div>
              <div className="text-neutral-500 font-medium text-[11px]">
                REPUBLIC OF KENYA • MINISTRY OF SPORTS
              </div>
            </div>
          </div>

          {/* COL 3: VISIT (Gold Title) */}
          <div className="space-y-3">
            <h4 className="text-[#E5B83F] font-black text-xs uppercase tracking-widest">VISIT</h4>
            <ul className="space-y-2 text-xs font-semibold text-neutral-700">
              <li><Link href="/facilities" className="hover:text-black transition-colors">Plan Your Visit</Link></li>
              <li><Link href="/parking" className="hover:text-black transition-colors">Parking & Transport</Link></li>
              <li><Link href="/help" className="hover:text-black transition-colors">Prohibited Items</Link></li>
              <li><Link href="/help" className="hover:text-black transition-colors">Bag Policy</Link></li>
              <li><Link href="/help" className="hover:text-black transition-colors">Accessibility Services</Link></li>
              <li><Link href="/about" className="hover:text-black transition-colors">Venue & Infrastructure</Link></li>
              <li><Link href="/fixtures" className="hover:text-black transition-colors">Matchday Fixtures</Link></li>
            </ul>
          </div>

          {/* COL 4: CONNECT (Gold Title) */}
          <div className="space-y-3">
            <h4 className="text-[#E5B83F] font-black text-xs uppercase tracking-widest">CONNECT</h4>
            <ul className="space-y-2 text-xs font-semibold text-neutral-700">
              <li><Link href="/connect" className="hover:text-black transition-colors">Talanta Insiders</Link></li>
              <li><Link href="/contact" className="hover:text-black transition-colors">Contact Us</Link></li>
              <li><Link href="/news" className="hover:text-black transition-colors">News & Updates</Link></li>
              <li><Link href="/connect" className="hover:text-black transition-colors">Careers & Jobs</Link></li>
              <li><Link href="/help" className="hover:text-black transition-colors">Accessibility</Link></li>
              <li><Link href="/portal" className="hover:text-black transition-colors">Digital Ticket Wallet</Link></li>
            </ul>
          </div>

          {/* COL 5: OPERATIONAL PORTALS & COMPLIANCE (Preserved) */}
          <div className="space-y-3">
            <h4 className="text-black font-black text-xs uppercase tracking-widest">OPERATIONAL PORTALS</h4>
            <ul className="space-y-2 text-xs font-semibold text-neutral-700">
              <li><Link href="/login" className="hover:text-black transition-colors">Staff & Patron Login</Link></li>
              <li><Link href="/gate" className="hover:text-black transition-colors">Turnstile Validation Tool</Link></li>
              <li><Link href="/admin" className="hover:text-black transition-colors">Administrator Console</Link></li>
              <li><Link href="/admin/command" className="hover:text-black transition-colors">Matchday Command Centre</Link></li>
              <li><Link href="/admin/workforce" className="hover:text-black transition-colors">Workforce Accreditation</Link></li>
            </ul>

            <div className="pt-2 space-y-1 text-[11px] text-neutral-500 font-medium">
              <div className="flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-[#059669]" />
                <span>Kenya Data Protection Act 2019</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#059669]" />
                <span>M-PESA Cashless Encryption</span>
              </div>
            </div>
          </div>
        </div>

        {/* POLICY LINKS ROW */}
        <div className="pt-8 border-t border-[#E5E3DF] flex flex-wrap items-center justify-between gap-4 text-[11px] font-extrabold text-neutral-600 uppercase tracking-wider">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/help" className="hover:text-black transition-colors">TERMS OF USE</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">PRIVACY POLICY</Link>
            <Link href="/privacy" className="hover:text-black transition-colors">COOKIE POLICY</Link>
            <Link href="/help" className="hover:text-black transition-colors">CODE OF CONDUCT</Link>
            <Link href="/help" className="hover:text-black transition-colors">A-Z GUIDE</Link>
            <Link href="/help" className="hover:text-black transition-colors">FAQ</Link>
            <Link href="/news" className="hover:text-black transition-colors">PRESS</Link>
            <Link href="/services" className="hover:text-black transition-colors">GIFT CARDS</Link>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & SOCIALS BAR */}
        <div className="pt-6 border-t border-[#E5E3DF] flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-neutral-500">
          <div>
            © 2026 TALANTA STADIUM. ST-TECH ICT PLATFORM. REPUBLIC OF KENYA. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-neutral-700 hover:text-[#E5B83F] transition-colors" aria-label="Facebook">
              <FacebookIcon className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-neutral-700 hover:text-[#E5B83F] transition-colors" aria-label="Instagram">
              <InstagramIcon className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-neutral-700 hover:text-[#E5B83F] transition-colors" aria-label="Twitter">
              <TwitterIcon className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-neutral-700 hover:text-[#E5B83F] transition-colors" aria-label="YouTube">
              <YoutubeIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
