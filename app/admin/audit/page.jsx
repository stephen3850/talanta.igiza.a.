'use client';

import React, { useState } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { initialAuditLogs } from '../../../lib/mockData';
import { formatDate } from '../../../lib/utils';
import { ShieldAlert, Search, Terminal, Lock, ShieldCheck } from 'lucide-react';

export default function AuditTrailPage() {
  const [logs, setLogs] = useState(initialAuditLogs);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            CYBERSECURITY & DATA PROTECTION COMPLIANCE
          </Badge>
          <h1 className="text-2xl font-bold text-white">Security Audit Trail</h1>
          <p className="text-xs text-slate-400">Immutable, write-once logging of administrative actions and security events</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search action or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Action Type</th>
                <th className="p-4">Actor Email</th>
                <th className="p-4">Entity Type</th>
                <th className="p-4">Details</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60 font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4 font-bold text-emerald-400">{log.action}</td>
                  <td className="p-4 text-white font-sans">{log.userEmail}</td>
                  <td className="p-4 text-slate-400">{log.entityType}</td>
                  <td className="p-4 text-slate-300 font-sans">{log.details}</td>
                  <td className="p-4 text-slate-400">{log.ipAddress}</td>
                  <td className="p-4 text-slate-500 font-sans">{formatDate(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
