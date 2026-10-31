'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { mockCommandMetrics } from '../../../lib/mockData';
import {
  History,
  ArrowLeft,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Download
} from 'lucide-react';

export default function GateScanHistoryPage() {
  const [logs, setLogs] = useState([
    { id: 'LOG-01', gateId: 'GATE-A-01', ticketNumber: 'TKT-9841-01', status: 'APPROVED', seat: 'GATE A - SEC 104 - SEAT 42', category: 'General Admission', time: '10:00:12' },
    { id: 'LOG-02', gateId: 'GATE-A-02', ticketNumber: 'TKT-9841-02', status: 'APPROVED', seat: 'GATE A - SEC 104 - SEAT 43', category: 'General Admission', time: '10:00:14' },
    { id: 'LOG-03', gateId: 'GATE-B-04', ticketNumber: 'TKT-7712-09', status: 'REJECTED_ALREADY_USED', seat: 'GATE B - SEC 202 - SEAT 12', category: 'General Admission', time: '10:00:18' },
    { id: 'LOG-04', gateId: 'GATE-C-01', ticketNumber: 'TKT-1049-03', status: 'APPROVED', seat: 'VIP - SEC 10 - SEAT 05', category: 'VIP Pavilion', time: '10:00:22' },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.gateId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col p-6 space-y-6">
      <div className="max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
          <div>
            <Link href="/gate" className="inline-flex items-center text-xs text-slate-400 hover:text-white mb-2 space-x-1">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Gate Portal</span>
            </Link>
            <h1 className="text-2xl font-bold text-white tracking-tight">Turnstile Validation Scan Logs</h1>
            <p className="text-xs text-slate-400">Real-time gate scan records, duplicate rejections, and access audit history</p>
          </div>

          <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Ticket Number, Gate ID, or Status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Time</th>
                <th className="p-4">Gate Lane</th>
                <th className="p-4">Ticket Reference</th>
                <th className="p-4">Category & Seat</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-navy-850/50">
                  <td className="p-4 font-mono text-slate-400">{log.time}</td>
                  <td className="p-4 font-bold text-white">{log.gateId}</td>
                  <td className="p-4 font-mono font-bold text-emerald-400">{log.ticketNumber}</td>
                  <td className="p-4 text-slate-300">{log.category} • {log.seat}</td>
                  <td className="p-4">
                    <Badge variant={log.status === 'APPROVED' ? 'success' : 'danger'}>
                      {log.status}
                    </Badge>
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
