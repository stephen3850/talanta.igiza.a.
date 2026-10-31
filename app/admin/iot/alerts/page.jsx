'use client';

import React, { useState, useEffect } from 'react';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import StatCard from '../../../../components/StatCard';
import { initialIoTAlerts } from '../../../../lib/mockData';
import {
  AlertTriangle,
  Check,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function AdminIoTAlertsPage() {
  const [alerts, setAlerts] = useState(initialIoTAlerts);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/iot/alerts');
      const data = await res.json();
      if (data.success && data.alerts) setAlerts(data.alerts);
    } catch (err) {
      console.warn('Using local alerts fallback');
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleAcknowledgeAlert = async (id) => {
    try {
      await fetch('/api/iot/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    } catch (err) {
      alert('Error acknowledging alert');
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      await fetch('/api/iot/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgeAll: true }),
      });
      setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    } catch (err) {
      alert('Error acknowledging alerts');
    }
  };

  const filteredAlerts = alerts.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            IOT THRESHOLD MONITORING
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Sensor Threshold Alerts
          </h1>
          <p className="text-xs text-slate-400">
            Review and resolve environmental, power load, and water flow threshold alerts.
          </p>
        </div>

        <div className="flex space-x-3">
          {pendingCount > 0 && (
            <Button variant="primary" size="sm" onClick={handleAcknowledgeAll} className="space-x-1">
              <Check className="w-4 h-4" />
              <span>Acknowledge All ({pendingCount})</span>
            </Button>
          )}

          <Button variant="secondary" size="sm" onClick={fetchAlerts}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search alerts by title, device ID, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-8 text-center text-slate-500 text-xs">
            No IoT threshold alerts found.
          </div>
        ) : (
          filteredAlerts.map((alt) => (
            <div
              key={alt.id}
              className={`bg-navy-900 border rounded-2xl p-6 shadow-xl space-y-3 transition-all ${
                alt.severity === 'WARNING'
                  ? 'border-amber-500/40 bg-amber-500/5'
                  : 'border-navy-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant={alt.severity === 'WARNING' ? 'warning' : 'navy'} size="sm">
                    {alt.severity}
                  </Badge>
                  <h3 className="text-base font-bold text-white">{alt.title}</h3>
                </div>

                <span className="font-mono text-xs text-slate-400">
                  {new Date(alt.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{alt.message}</p>

              <div className="pt-2 border-t border-navy-800/80 flex items-center justify-between text-xs">
                <span className="font-mono text-emerald-400 font-bold">{alt.deviceId}</span>

                {!alt.acknowledged ? (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleAcknowledgeAlert(alt.id)}
                    className="space-x-1 py-1 px-3"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Acknowledge Alert</span>
                  </Button>
                ) : (
                  <span className="text-slate-500 font-bold flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mr-1" />
                    <span>Resolved</span>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
