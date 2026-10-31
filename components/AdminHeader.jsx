import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Building2, Search, User, Shield, Terminal, LogOut } from 'lucide-react';

export default function AdminHeader({ title = 'Stadium Control Center', subtitle }) {
  const router = useRouter();
  const [time, setTime] = useState('');
  const [facilities, setFacilities] = useState([]);
  const [facilityId, setFacilityId] = useState('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFacilityChange = (event) => setFacilityId(event.detail);
    window.addEventListener('talanta-facility-change', handleFacilityChange);
    let active = true;
    fetch('/api/facilities', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (response.ok && active) {
          setFacilities(result.facilities || []);
          const current = document.cookie.split('; ').find((entry) => entry.startsWith('talanta_facility='));
          setFacilityId(current ? decodeURIComponent(current.slice('talanta_facility='.length)) : result.facilities?.[0]?.id || '');
        }
      })
      .catch((error) => { if (active) console.error('[Facility selector unavailable]', error); });
    return () => {
      active = false;
      window.removeEventListener('talanta-facility-change', handleFacilityChange);
    };
  }, []);

  function changeFacility(nextFacilityId) {
    setFacilityId(nextFacilityId);
    document.cookie = `talanta_facility=${encodeURIComponent(nextFacilityId)}; Path=/; Max-Age=28800; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
    window.dispatchEvent(new CustomEvent('talanta-facility-change', { detail: nextFacilityId }));
    router.push(`/admin/facilities/${encodeURIComponent(nextFacilityId)}`);
  }

  return (
    <header className="bg-navy-950/80 backdrop-blur-md border-b border-navy-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-6">
        {/* Matchday Clock & Mode */}
        <div className="hidden lg:flex items-center space-x-3 bg-navy-900 border border-navy-800 px-3 py-1.5 rounded-xl">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Stadium Clock</span>
            <span className="text-emerald-400 font-mono font-bold">{time || '10:00:00 AM'} EAT</span>
          </div>
        </div>

        {facilities.length > 0 && (
          <label className="hidden md:flex items-center gap-2 rounded-xl border border-navy-800 bg-navy-900 px-3 py-2 text-xs text-slate-400">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <span>Facility</span>
            <select value={facilityId} onChange={(event) => changeFacility(event.target.value)} className="max-w-48 bg-transparent font-semibold text-white outline-none">
              {facilities.map((facility) => <option key={facility.id} value={facility.id} className="bg-navy-900">{facility.name}</option>)}
            </select>
          </label>
        )}

        {/* Action icons */}
        <div className="flex items-center space-x-3">
          <button
            title="System Notifications"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-navy-900 border border-transparent hover:border-navy-800 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          {/* User Account Pill */}
          <div className="flex items-center space-x-3 pl-3 border-l border-navy-800">
            <div className="w-8 h-8 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
              AD
            </div>
            <div className="hidden sm:block text-left text-xs">
              <span className="text-white font-medium block leading-tight">Admin Console</span>
              <span className="text-slate-400 text-[10px]">ST-Tech Operator</span>
            </div>

            <Link href="/" title="Exit Admin">
              <button className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
