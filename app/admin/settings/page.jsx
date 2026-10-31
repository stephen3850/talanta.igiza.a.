'use client';

import React, { useState } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import {
  Settings,
  Building2,
  Ticket,
  Smartphone,
  ShieldCheck,
  Save,
  Lock,
  Globe
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [stadiumName, setStadiumName] = useState('Talanta Sports City');
  const [capacity, setCapacity] = useState(60000);
  const [location, setLocation] = useState('Nairobi, Kenya');
  const [cartHoldMins, setCartHoldMins] = useState(10);
  const [maxTicketsPerTx, setMaxTicketsPerTx] = useState(6);

  // M-PESA Config
  const [mpesaEnv, setMpesaEnv] = useState('sandbox');
  const [shortCode, setShortCode] = useState('174379');
  const [callbackUrl, setCallbackUrl] = useState('https://talanta.sttech.co.ke/api/payments/callback');

  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            PLATFORM CONFIGURATION
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            System & Venue Settings
          </h1>
          <p className="text-xs text-slate-400">
            Configure stadium parameters, ticketing rules, M-PESA integration keys, and security defaults.
          </p>
        </div>

        <Button variant="primary" onClick={handleSave} className="space-x-2">
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </Button>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>System configuration parameters updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Venue & Branding */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>1. Venue Identity & Capacity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Venue Name</label>
              <input
                type="text"
                value={stadiumName}
                onChange={(e) => setStadiumName(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Total Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Ticketing & Inventory Rules */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
            <Ticket className="w-4 h-4" />
            <span>2. Ticketing & Cart Reservation Rules</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Cart Hold Countdown Minutes
              </label>
              <input
                type="number"
                value={cartHoldMins}
                onChange={(e) => setCartHoldMins(Number(e.target.value))}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Max Purchase Quantity Per Transaction
              </label>
              <input
                type="number"
                value={maxTicketsPerTx}
                onChange={(e) => setMaxTicketsPerTx(Number(e.target.value))}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Safaricom M-PESA Integration */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span>3. Safaricom M-PESA Daraja Configuration</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Environment</label>
              <select
                value={mpesaEnv}
                onChange={(e) => setMpesaEnv(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="sandbox">Sandbox (Development)</option>
                <option value="production">Production (Live)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">ShortCode / Paybill</label>
              <input
                type="text"
                value={shortCode}
                onChange={(e) => setShortCode(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Callback URL</label>
              <input
                type="text"
                value={callbackUrl}
                onChange={(e) => setCallbackUrl(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
