'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Check,
  FileCheck
} from 'lucide-react';

export default function AdminNocAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [severities, setSeverities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolve Alert Modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [targetAlertId, setTargetAlertId] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedSeverity !== 'ALL') params.append('severity', selectedSeverity);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/network-operations/alerts?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setAlerts(json.alerts);
        setSeverities(json.severities);
      }
    } catch (err) {
      console.error('Failed to load NOC alerts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [selectedStatus, selectedSeverity]);

  const handleAcknowledge = async (alertId) => {
    try {
      const res = await fetch('/api/network-operations/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'ACKNOWLEDGE' }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleExecuteResolution = async (e) => {
    e.preventDefault();
    if (!targetAlertId) return;

    try {
      const res = await fetch('/api/network-operations/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertId: targetAlertId,
          action: 'RESOLVE',
          resolutionNote,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsResolveModalOpen(false);
        setTargetAlertId(null);
        setResolutionNote('');
        fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/network-operations">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="warning" size="sm">NOC ALERT LOG</Badge>
              <span className="text-[10px] text-slate-400 font-mono">
                {alerts.filter((a) => a.status === 'ACTIVE').length} Active Warning Alerts
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Network Incident & Alert Response History
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={fetchAlerts}>
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
            placeholder="Search alert ID, device, message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAlerts()}
            className="w-full bg-navy-950 border border-navy-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-navy-950 border border-navy-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Severities</option>
              {severities.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-navy-950 border border-navy-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {alerts.map((alt) => (
          <div
            key={alt.id}
            className="bg-navy-900 border border-navy-800 hover:border-slate-700 transition-all rounded-2xl p-5 shadow-xl space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-white">{alt.id}</span>
                <Badge
                  variant={alt.severity === 'FATAL' || alt.severity === 'CRITICAL' ? 'danger' : 'warning'}
                  size="sm"
                >
                  {alt.severity}
                </Badge>
                <span className="text-[10px] text-slate-400 font-mono">{alt.type}</span>
              </div>

              <div className="flex items-center space-x-2">
                {alt.status === 'ACTIVE' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAcknowledge(alt.id)}
                    className="text-xs py-1"
                  >
                    <span>Acknowledge</span>
                  </Button>
                )}

                {alt.status !== 'RESOLVED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setTargetAlertId(alt.id);
                      setIsResolveModalOpen(true);
                    }}
                    className="text-xs py-1"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    <span>Resolve</span>
                  </Button>
                )}

                {alt.status === 'RESOLVED' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                    RESOLVED
                  </span>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white text-sm">{alt.title}</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">{alt.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-navy-950 border border-navy-850 flex flex-wrap justify-between items-center text-[10px] font-mono text-slate-400">
              <span>Device: <strong className="text-white">{alt.deviceName}</strong> ({alt.deviceId})</span>
              <span>Triggered: {new Date(alt.triggeredAt).toLocaleTimeString()}</span>
              {alt.acknowledgedBy && <span>Acked by: <strong className="text-emerald-400">{alt.acknowledgedBy}</strong></span>}
            </div>

            {alt.resolutionNote && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-200">
                <strong>Resolution Note:</strong> {alt.resolutionNote}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resolve Alert Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve NOC Alert & Log Action"
      >
        <form onSubmit={handleExecuteResolution} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Resolution Action Taken *</label>
            <textarea
              rows={3}
              placeholder="Describe technical resolution (e.g. re-terminated cabling, re-balanced Wi-Fi AP channel)..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Log Resolution & Clear
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
