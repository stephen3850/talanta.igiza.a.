'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const pathname = usePathname() || '/';

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  function toggleTheme() {
    setIsDarkMode(!isDarkMode);
  }

  const navItems = [
    { name: 'HOME', href: '/', isActive: (p) => p === '/' },
    { name: 'ABOUT STADIUM', href: '/about', isActive: (p) => p === '/about' },
    { name: 'EVENTS', href: '/events', isActive: (p) => p.startsWith('/events') || p.startsWith('/tickets') || p.startsWith('/fixtures') },
    { name: 'PLAN YOUR VISIT', href: '/facilities', isActive: (p) => p === '/facilities' || p.startsWith('/parking') },
    { name: 'FACILITIES', href: '/facilities', isActive: (p) => p.startsWith('/facilities') && p !== '/facilities' },
    { name: 'SUITES', href: '/facilities#suites', isActive: (p) => p === '/suites' },
    { name: 'TOURS', href: '/about#tours', isActive: (p) => p === '/tours' },
    { name: 'STADIUM', href: '/about#stadium', isActive: (p) => p === '/stadium' },
    { name: 'DIGITAL SERVICES', href: '/services', isActive: (p) => p === '/services' },
    { name: 'NEWS & UPDATES', href: '/news', isActive: (p) => p === '/news' },
    { name: 'HOST AN EVENT', href: '/host-an-event', isActive: (p) => p === '/host-an-event' },
    { name: 'CONNECT', href: '/connect', isActive: (p) => p === '/connect' },
    { name: 'CONTACT US', href: '/contact', isActive: (p) => p === '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full select-none shadow-2xl font-sans">
      {/* SECTION A: TOP LIGHT-GREY UTILITY BAR */}
      <div className="bg-[#EAEAEA] dark:bg-neutral-900 text-[#444444] dark:text-neutral-300 border-b border-[#D8D8D8] dark:border-neutral-800 text-[11px] font-bold tracking-wider py-1.5 px-4 sm:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-[#222222] dark:text-white">REPUBLIC OF KENYA • MINISTRY OF SPORTS</span>
        </div>

        <div className="flex items-center space-x-3 md:space-x-5 text-[11px] uppercase">
          <span className="hidden lg:inline text-[#059669] font-black tracking-tight">ST-TECH ICT PLATFORM</span>
          <Link href="/services" className="hover:text-black dark:hover:text-white transition-colors font-bold">STORE</Link>
          <Link href="/help" className="hover:text-black dark:hover:text-white transition-colors font-bold">ACCESSIBILITY</Link>
          <Link href="/help" className="hover:text-black dark:hover:text-white transition-colors font-bold">SAFETY</Link>
          <Link href="/contact" className="hover:text-black dark:hover:text-white transition-colors font-bold">CONTACT</Link>
          <button
            onClick={toggleTheme}
            className="text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors p-0.5"
            aria-label="Toggle light or dark theme mode"
          >
            {isDarkMode ? <Sun className="w-3.5 h-3.5 text-[#E5B83F]" /> : <Moon className="w-3.5 h-3.5 text-neutral-800" />}
          </button>
        </div>
      </div>

      {/* SECTION B: MAIN BRANDING HEADER */}
      <div className="bg-[#FAF9F6] dark:bg-neutral-950 border-b border-[#E0E0E0] dark:border-neutral-800 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Left: Sports Partners */}
          <div className="hidden lg:flex items-center space-x-5 text-[11px] font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
            <div>
              <span className="block font-black text-xs leading-none">FKF</span>
              <span className="text-[9px] font-semibold text-neutral-500 block leading-tight">FOOTBALL KENYA</span>
            </div>
            <div className="h-6 w-[1px] bg-neutral-300 dark:bg-neutral-800" />
            <div>
              <span className="block font-black text-xs leading-none">HARAMBEE</span>
              <span className="text-[9px] font-semibold text-neutral-500 block leading-tight">STARS</span>
            </div>
            <div className="h-6 w-[1px] bg-neutral-300 dark:bg-neutral-800" />
            <div>
              <span className="block font-black text-xs leading-none">GOR</span>
              <span className="text-[9px] font-semibold text-neutral-500 block leading-tight">MAHIA FC</span>
            </div>
            <div className="h-6 w-[1px] bg-neutral-300 dark:bg-neutral-800" />
            <div>
              <span className="block font-black text-xs leading-none">AFC</span>
              <span className="text-[9px] font-semibold text-neutral-500 block leading-tight">LEOPARDS</span>
            </div>
          </div>

          {/* Center: TALANTA · STADIUM Wordmark */}
          <Link href="/" className="flex flex-col items-center mx-auto lg:mx-0 group">
            <div className="text-2xl sm:text-3xl font-black text-black dark:text-white tracking-tight leading-none font-sans">
              TALANTA <span className="text-[#CC0000]">·</span> STADIUM
            </div>
            <div className="w-28 sm:w-32 h-1 flex mt-1">
              <div className="w-1/2 bg-[#CC0000] h-full" />
              <div className="w-1/2 bg-[#008000] h-full" />
            </div>
          </Link>

          {/* Right: Actions (BUY TICKETS, SIGN UP, SEARCH) */}
          <div className="flex items-center space-x-2.5 ml-auto lg:ml-0">
            <Link href="/events">
              <button className="bg-[#CC0000] hover:bg-[#B30000] text-white font-extrabold text-xs tracking-wider uppercase px-5 py-2.5 transition-colors shadow-sm rounded-none">
                BUY TICKETS
              </button>
            </Link>

            <Link href="/register">
              <button className="bg-[#E5E5E5] dark:bg-neutral-800 hover:bg-[#D5D5D5] dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-extrabold text-xs tracking-wider uppercase px-5 py-2.5 transition-colors shadow-sm rounded-none">
                SIGN UP
              </button>
            </Link>

            <button
              onClick={() => setSearchModalOpen(true)}
              className="bg-[#E5B83F] hover:bg-[#D4A72E] text-black p-2.5 transition-colors flex items-center justify-center shadow-sm rounded-none"
              aria-label="Search events and venue services"
            >
              <Search className="w-4 h-4 text-black stroke-[3]" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded bg-black text-white hover:bg-neutral-800 transition-colors ml-1"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* SECTION C: MAIN FULL-WIDTH BLACK NAVIGATION BAR */}
      <div className="bg-black w-full border-b border-neutral-900 hidden lg:block overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-2">
          <nav className="flex items-center justify-between space-x-1 xl:space-x-2">
            {navItems.map((item) => {
              const active = item.isActive(pathname);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'relative py-3.5 px-1.5 text-[10px] xl:text-[11px] font-black tracking-wider uppercase transition-colors duration-200 group inline-block whitespace-nowrap select-none focus:outline-none focus:text-[#E5B83F]',
                    active
                      ? 'text-[#E5B83F] border border-[#E5B83F]/80 px-2.5 py-1.5 my-1 bg-black/60'
                      : 'text-white hover:text-[#E5B83F]'
                  )}
                >
                  <span>{item.name}</span>

                  {/* Thin Gold/Yellow Animated Underline */}
                  <span
                    className={cn(
                      'absolute bottom-0 left-0 right-0 h-[3px] bg-[#E5B83F] transition-transform duration-300 ease-out origin-left',
                      active
                        ? 'scale-x-100 opacity-100'
                        : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100 motion-reduce:transition-none'
                    )}
                  />
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* MOBILE RESPONSIVE DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-black border-b border-neutral-800 px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const active = item.isActive(pathname);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-3 py-2.5 rounded text-xs font-extrabold tracking-wider uppercase transition-colors relative border-l-2',
                  active
                    ? 'text-[#E5B83F] bg-neutral-900 border-[#E5B83F]'
                    : 'text-white hover:text-[#E5B83F] hover:bg-neutral-900/60 border-transparent'
                )}
              >
                {item.name}
              </Link>
            );
          })}

          <div className="pt-3 border-t border-neutral-800 flex flex-col space-y-2 sm:hidden">
            <Link href="/events" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full bg-[#CC0000] text-white font-extrabold text-xs tracking-wider uppercase py-3 text-center">
                BUY TICKETS
              </button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <button className="w-full bg-[#E5E5E5] text-neutral-900 font-extrabold text-xs tracking-wider uppercase py-3 text-center">
                SIGN UP
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* INTERACTIVE SEARCH MODAL */}
      {searchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-in fade-in-50 duration-150">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <span className="text-xs font-extrabold text-[#E5B83F] uppercase tracking-widest">SEARCH TALANTA STADIUM</span>
              <button onClick={() => setSearchModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3.5 text-neutral-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search events, parking, suites, fixtures or help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-neutral-700 focus:border-[#E5B83F] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none"
              />
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block">QUICK LINKS</span>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <Link href="/events" onClick={() => setSearchModalOpen(false)} className="bg-neutral-800 hover:bg-[#E5B83F] hover:text-black text-slate-200 px-3 py-1.5 rounded-lg transition">Upcoming Matches</Link>
                <Link href="/facilities" onClick={() => setSearchModalOpen(false)} className="bg-neutral-800 hover:bg-[#E5B83F] hover:text-black text-slate-200 px-3 py-1.5 rounded-lg transition">VIP Suites</Link>
                <Link href="/parking" onClick={() => setSearchModalOpen(false)} className="bg-neutral-800 hover:bg-[#E5B83F] hover:text-black text-slate-200 px-3 py-1.5 rounded-lg transition">Parking Reservation</Link>
                <Link href="/help" onClick={() => setSearchModalOpen(false)} className="bg-neutral-800 hover:bg-[#E5B83F] hover:text-black text-slate-200 px-3 py-1.5 rounded-lg transition">Matchday Help</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
