'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  Server,
  Plus,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  HardDrive,
  Activity,
  Globe,
  Shield,
  Wifi,
  Radio
} from 'lucide-react';

export default function AdminNocDevicesPage() {
  const [devices, setDevices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Register Device Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('EDGE_SWITCH');
  const [ipAddress, setIpAddress] = useState('10.100.15.10');
  const [location, setLocation] = useState('Gate A Concourse Telecom Cabinet');
  const [vendorModel, setVendorModel] = useState('Cisco Catalyst 9300 48-Port PoE+');
  const [protocol, setProtocol] = useState('SNMPV3');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/network-operations/devices?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setDevices(json.devices);
        setCategories(json.categories);
        setProtocols(json.protocols);
      }
    } catch (err) {
      console.error('Failed to load network devices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [selectedStatus, selectedCategory]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/network-operations/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          ipAddress,
          location,
          vendorModel,
          protocol,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setName('');
        fetchDevices();
      }
    } catch (err) {
      console.error('Failed to register device:', err);
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
              <Badge variant="success" size="sm">INFRASTRUCTURE INVENTORY</Badge>
              <span className="text-[10px] text-slate-400 font-mono">{devices.length} Devices Registered</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Network Hardware & Telemetry Inventory
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Register Device</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchDevices}>
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
            placeholder="Search device ID, IP, location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchDevices()}
            className="w-full bg-navy-950 border border-navy-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-navy-950 border border-navy-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
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
              <option value="ONLINE">ONLINE</option>
              <option value="DEGRADED">DEGRADED</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Devices Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((dev) => (
          <div
            key={dev.id}
            className="bg-navy-900 border border-navy-800 hover:border-slate-700 transition-all rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400">{dev.id}</span>
                {dev.status === 'ONLINE' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">ONLINE</span>
                ) : dev.status === 'DEGRADED' ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[10px] font-black animate-pulse">DEGRADED</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30 text-[10px] font-bold">OFFLINE</span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">{dev.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{dev.vendorModel}</p>
              </div>

              {/* Resource Utilization Gauges Requirement 4 */}
              <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">CPU Load:</span>
                  <span className={`font-bold ${dev.cpuUtilPercent > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {dev.cpuUtilPercent}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">RAM Usage:</span>
                  <span className="text-slate-200 font-bold">{dev.memoryUtilPercent}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[10px]">Latency / Loss:</span>
                  <span className="text-sky-400">{dev.latencyMs}ms ({dev.packetLossPercent}%)</span>
                </div>

                <div className="flex items-center justify-between border-t border-navy-900 pt-1 text-[10px]">
                  <span className="text-slate-500">IP / Protocol:</span>
                  <span className="text-white">{dev.ipAddress} ({dev.protocol})</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Location: {dev.location}</span>
              <span>Uptime: {dev.uptimeDays}d</span>
            </div>
          </div>
        ))}
      </div>

      {/* Register Device Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Network Infrastructure Device"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Device Name *</label>
            <input
              type="text"
              placeholder="e.g. North Stand Concourse Access Switch 2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Management IP Address *</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Vendor & Hardware Model</label>
            <input
              type="text"
              value={vendorModel}
              onChange={(e) => setVendorModel(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Monitoring Protocol</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {protocols.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Physical Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              Register Device
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
