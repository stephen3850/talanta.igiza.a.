'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Ticket, UserCheck, ShieldAlert } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  // If inside full-screen scanner, don't show the bottom nav
  if (pathname === '/gate/scanner') {
    return null;
  }

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Events', href: '/events', icon: Calendar },
    { label: 'My Tickets', href: '/account/tickets', icon: Ticket },
    { label: 'Staff Hub', href: '/portal/staff', icon: UserCheck },
    { label: 'EOC Alerts', href: '/admin/emergency-centre', icon: ShieldAlert },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 backdrop-blur-md border-t border-navy-800/80 px-2 py-1 shadow-2xl safe-area-bottom"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full min-w-[48px] min-h-[48px] rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-500/15' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
