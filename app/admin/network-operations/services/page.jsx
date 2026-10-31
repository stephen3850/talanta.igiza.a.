'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  Activity,
  Plus,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Database,
  HardDrive
} from 'lucide-react';

export default function AdminNocServicesPage() {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Add Service Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('APP_SERVICE');
  const [endpointUrl, setEndpointUrl] = useState('https://stadium.talanta.go.ke/api/health');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/network-operations/services');
      const json = await res.json();
      if (json.success) {
        setServices(json.services);
      }
    } catch (err) {
      console.error('Failed to load application services:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleRegisterServiceSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/network-operations/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, endpointUrl }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setName('');
        fetchServices();
      }
    } catch (err) {
      console.error('Failed to register service:', err);
    } finally {
      setIsSubmitting(false);
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
              <Badge variant="success" size="sm">APPLICATION & DB HEALTH</Badge>
              <span className="text-[10px] text-slate-400 font-mono">{services.length} Monitored Endpoints</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Application & Database Services Status
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Service</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchServices}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Monitored Service Endpoints & Database Clusters</h2>
          <span className="text-[10px] text-emerald-400 font-mono">HTTPS & TCP Synthetic Health Probes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Service ID & Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Health Endpoint URL</th>
                <th className="p-4">Availability SLA</th>
                <th className="p-4">Response Latency</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono font-bold text-white">{svc.id}</div>
                    <div className="text-[11px] text-slate-300 font-bold mt-0.5">{svc.name}</div>
                  </td>

                  <td className="p-4">
                    <Badge variant="info" size="sm">{svc.category.replace('_', ' ')}</Badge>
                  </td>

                  <td className="p-4 font-mono text-[11px] text-emerald-400">
                    {svc.endpointUrl}
                  </td>

                  <td className="p-4 font-mono text-white font-bold">
                    {svc.availabilityPercent}%
                  </td>

                  <td className="p-4 font-mono text-sky-400">
                    {svc.responseTimeMs} ms
                  </td>

                  <td className="p-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {svc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Application / DB Service Health Monitor"
      >
        <form onSubmit={handleRegisterServiceSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Service Name *</label>
            <input
              type="text"
              placeholder="e.g. M-PESA Cashless Payment Webhook Consumer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="APP_SERVICE">Application Microservice</option>
              <option value="DB_SERVICE">Database Service / Cache</option>
              <option value="IOT_GATEWAY">IoT Gateway Endpoint</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Health Check Endpoint URL *</label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              Add Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
