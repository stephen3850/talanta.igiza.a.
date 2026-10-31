'use client';

import React, { useState } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import {
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Power
} from 'lucide-react';

export default function AdminGatesPage() {
  const [gates, setGates] = useState([
    { id: 'GATE-A-01', name: 'Gate A - Turnstile 01', zone: 'Upper Deck GA', operator: 'Capt. James Mwangi', deviceId: 'SCANNER-MOB-01', status: 'ACTIVE', scansToday: 1840 },
    { id: 'GATE-A-02', name: 'Gate A - Turnstile 02', zone: 'Upper Deck GA', operator: 'Sarah Chebet', deviceId: 'SCANNER-MOB-02', status: 'ACTIVE', scansToday: 1920 },
    { id: 'GATE-B-01', name: 'Gate B - Turnstile 01', zone: 'Lower Deck GA', operator: 'G4S Unit Alpha', deviceId: 'SCANNER-MOB-03', status: 'ACTIVE', scansToday: 2110 },
    { id: 'VIP-GATE-01', name: 'VIP Presidential Suite Entry', zone: 'VIP Canopy', operator: 'Maj. David Omondi', deviceId: 'SCANNER-MOB-04', status: 'ACTIVE', scansToday: 410 },
    { id: 'ACCESSIBLE-GATE', name: 'Accessible Step-Free Gate', zone: 'Ramp Precinct', operator: 'Steward Support Unit', deviceId: 'SCANNER-MOB-05', status: 'INACTIVE', scansToday: 180 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const toggleGateStatus = (id) => {
    setGates((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, status: g.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : g
      )
    );
  };

  const filteredGates = gates.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.operator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            TURNSTILE & ACCESS CONTROL
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Gate Operations & Turnstile Control
          </h1>
          <p className="text-xs text-slate-400">
            Monitor optical turnstile lanes, manage scanner assignments, and control gate power states.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gates Registered"
          value="24 Lanes"
          subtitle="Talanta Main Bowl"
          icon={Smartphone}
          accentColor="emerald"
        />

        <StatCard
          title="Active Turnstiles"
          value={gates.filter((g) => g.status === 'ACTIVE').length.toString()}
          subtitle="Online & Scanning"
          icon={CheckCircle}
          accentColor="emerald"
        />

        <StatCard
          title="Total Verified Entries"
          value="38,920"
          subtitle="Today's Gate Scans"
          icon={CheckCircle}
          accentColor="sky"
        />

        <StatCard
          title="Avg Scan Latency"
          value="1.8 sec"
          subtitle="ST-Tech Optical Edge"
          icon={Clock}
          accentColor="gold"
        />
      </div>

      {/* Search */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Gate ID, Turnstile Name, or Operator..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Gates Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Gate Identifier & Lane Name</th>
                <th className="p-4">Zone Allocation</th>
                <th className="p-4">Assigned Operator</th>
                <th className="p-4">Scanner Device ID</th>
                <th className="p-4">Today's Scans</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredGates.map((g) => (
                <tr key={g.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{g.name}</div>
                    <div className="font-mono text-[10px] text-emerald-400">{g.id}</div>
                  </td>

                  <td className="p-4 font-medium text-slate-300">{g.zone}</td>

                  <td className="p-4 font-bold text-white">{g.operator}</td>

                  <td className="p-4 font-mono text-slate-400">{g.deviceId}</td>

                  <td className="p-4 font-mono font-bold text-emerald-400">
                    {g.scansToday.toLocaleString()} Scans
                  </td>

                  <td className="p-4">
                    <Badge variant={g.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {g.status}
                    </Badge>
                  </td>

                  <td className="p-4 text-right">
                    <Button
                      variant={g.status === 'ACTIVE' ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => toggleGateStatus(g.id)}
                      className="space-x-1"
                    >
                      <Power className="w-3.5 h-3.5" />
                      <span>{g.status === 'ACTIVE' ? 'Disable Gate' : 'Enable Gate'}</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
