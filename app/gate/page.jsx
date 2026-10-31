'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import StatCard from '../../components/StatCard';
import { initialEvents, mockCommandMetrics } from '../../lib/mockData';
import {
  ShieldCheck,
  QrCode,
  History,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Smartphone,
  ChevronRight,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function GateOperatorPortalHome() {
  const [selectedEvent, setSelectedEvent] = useState('EVT-001');
  const [gateId, setGateId] = useState('GATE-A-01');
  const [deviceId, setDeviceId] = useState('SCANNER-MOB-01');

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-navy-900 border-b border-navy-800 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">
                Talanta Gate Access Portal
              </h1>
              <span className="text-[10px] text-slate-400">ST-Tech Turnstile System</span>
            </div>
          </div>

          <Badge variant="success" className="flex items-center space-x-1">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span>OPERATOR ONLINE</span>
          </Badge>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Gate Assignment Setup Card */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div>
            <Badge variant="success" size="sm" className="mb-2">GATE CONFIGURATION</Badge>
            <h2 className="text-xl font-bold text-white">Select Event & Gate Assignment</h2>
            <p className="text-xs text-slate-400">Specify your assigned event, entry lane, and scanner device identifier.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Assigned Matchday Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                {initialEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Turnstile Gate Lane</label>
              <select
                value={gateId}
                onChange={(e) => setGateId(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="GATE-A-01">GATE-A-01 (Upper Deck GA)</option>
                <option value="GATE-A-02">GATE-A-02 (Upper Deck GA)</option>
                <option value="GATE-B-01">GATE-B-01 (Lower Deck GA)</option>
                <option value="VIP-GATE-01">VIP-GATE-01 (Presidential Canopy)</option>
                <option value="ACCESSIBLE-GATE">ACCESSIBLE-GATE (Ramp Entry)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Scanner Device ID</label>
              <input
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Link
              href={`/gate/scanner?eventId=${selectedEvent}&gateId=${gateId}&deviceId=${deviceId}`}
              className="flex-1"
            >
              <Button variant="primary" className="w-full justify-center py-3.5 space-x-2">
                <QrCode className="w-5 h-5" />
                <span className="text-sm font-bold">Launch Optical QR Gate Scanner</span>
              </Button>
            </Link>

            <Link href="/gate/history" className="sm:w-auto">
              <Button variant="secondary" className="w-full justify-center py-3.5 space-x-2 border-navy-700">
                <History className="w-5 h-5" />
                <span>View Scan Logs</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Gate Performance Metrics */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Today's Gate Validation Summary</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Approved Entries"
              value="38,920"
              subtitle="Valid Gate Scans"
              icon={CheckCircle}
              accentColor="emerald"
            />

            <StatCard
              title="Duplicate Rejections"
              value="142"
              subtitle="Already Used QR Attempts"
              icon={XCircle}
              accentColor="red"
            />

            <StatCard
              title="Scan Rate Velocity"
              value="480 / min"
              subtitle="Venue Gate Throughput"
              icon={Clock}
              accentColor="sky"
            />

            <StatCard
              title="Active Gate Lanes"
              value="24 Lanes"
              subtitle="ST-Tech Optical Turnstiles"
              icon={Smartphone}
              accentColor="gold"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
