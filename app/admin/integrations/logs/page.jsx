'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import {
  Activity,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function AdminApiLogsPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/v1/integrations/logs?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.logs);
      }
    } catch (err) {
      console.error('Failed to load API logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedStatus]);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/integrations">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">GATEWAY TELEMETRY LOGS</Badge>
              <span className="text-[10px] text-slate-400 font-mono">{logs.length} API Requests Audited</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              API Request Audit Trail & Webhook Telemetry Logs
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={fetchLogs}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search endpoint, client name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
            className="w-full bg-navy-950 border border-navy-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Status Code:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-navy-950 border border-navy-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Requests</option>
            <option value="SUCCESS">Success (200 OK)</option>
            <option value="ERROR">Error / Rejected (4xx / 5xx)</option>
          </select>
        </div>
      </div>

      {/* API Audit Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">HTTP Request Logs & Security Audits</h2>
          <span className="text-[10px] text-emerald-400 font-mono">DPA 2019 Privacy Minimized Header Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Timestamp & Ref</th>
                <th className="p-4">Client Name & ID</th>
                <th className="p-4">Endpoint & Method</th>
                <th className="p-4">Scope Used</th>
                <th className="p-4">IP Address</th>
                <th className="p-4 text-right">Status Code & Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono font-bold text-white">{l.id}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="text-white font-bold">{l.clientName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{l.clientId}</div>
                  </td>

                  <td className="p-4 font-mono text-xs">
                    <span className="text-sky-400 font-bold mr-1.5">{l.method}</span>
                    <span className="text-slate-200">{l.endpoint}</span>
                  </td>

                  <td className="p-4 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-slate-300">
                      {l.scopeUsed}
                    </span>
                  </td>

                  <td className="p-4 font-mono text-[10px] text-slate-400">
                    {l.ipAddress}
                  </td>

                  <td className="p-4 text-right font-mono text-xs">
                    <span className={`font-bold ${l.statusCode === 200 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {l.statusCode} {l.statusCode === 200 ? 'OK' : 'DENIED'}
                    </span>
                    <div className="text-[10px] text-slate-500">{l.responseTimeMs} ms</div>
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
