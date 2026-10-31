'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  Tv,
  Plus,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Cpu,
  Monitor,
  Wifi,
  WifiOff
} from 'lucide-react';

export default function AdminSignageScreensPage() {
  const [screens, setScreens] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Register Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('CONCOURSE_WAYFINDING');
  const [resolution, setResolution] = useState('3840x2160 (4K UHD)');
  const [orientation, setOrientation] = useState('LANDSCAPE');
  const [connectedPlayer, setConnectedPlayer] = useState('BrightSign XC4055');
  const [ipAddress, setIpAddress] = useState('192.168.40.120');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchScreens = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/digital-signage/screens?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setScreens(json.screens);
        setCategories(json.categories);
        setStatuses(json.statuses);
      }
    } catch (err) {
      console.error('Failed to load signage screens:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, [selectedStatus, selectedCategory]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/digital-signage/screens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          location,
          category,
          resolution,
          orientation,
          connectedPlayer,
          ipAddress,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setName('');
        setLocation('');
        fetchScreens();
      }
    } catch (err) {
      console.error('Registration failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (screenId, currentStatus) => {
    const nextStatus = currentStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    try {
      const res = await fetch('/api/digital-signage/screens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenId, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchScreens();
      }
    } catch (err) {
      console.error('Status toggle failed:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/digital-signage">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">SCREEN REGISTRY</Badge>
              <span className="text-[10px] text-slate-400 font-mono">{screens.length} Screens Configured</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Stadium Display Hardware Registry
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Register Display</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchScreens}>
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
            placeholder="Search screen ID, name, player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchScreens()}
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
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Screen Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {screens.map((scr) => (
          <div
            key={scr.id}
            className="bg-navy-900 border border-navy-800 hover:border-slate-700 transition-all rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400">{scr.id}</span>
                {scr.status === 'ONLINE' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center space-x-1">
                    <Wifi className="w-3 h-3" />
                    <span>ONLINE</span>
                  </span>
                ) : scr.status === 'EMERGENCY_OVERRIDE' ? (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black animate-pulse">
                    EMERGENCY
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30 text-[10px] font-bold flex items-center space-x-1">
                    <WifiOff className="w-3 h-3" />
                    <span>OFFLINE</span>
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">{scr.name}</h3>
                <p className="text-[11px] text-slate-400 flex items-center mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500 shrink-0" />
                  <span>{scr.location}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="text-white font-bold">{scr.category.replace('_', ' ')}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Resolution:</span>
                  <span className="text-slate-300">{scr.resolution}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">Media Player:</span>
                  <span className="text-emerald-400 truncate max-w-[140px]">{scr.connectedPlayer}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500">IP Address:</span>
                  <span className="text-slate-400">{scr.ipAddress}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-500 font-mono">
                Sync: {new Date(scr.lastSyncAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus(scr.id, scr.status)}
                className="text-xs"
              >
                <span>{scr.status === 'ONLINE' ? 'Set Offline' : 'Set Online'}</span>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Register Display Screen Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Stadium Display Screen"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Screen Name *</label>
            <input
              type="text"
              placeholder="e.g. West Stand Level 2 VIP Foyer Display"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Physical Location / Zone *</label>
            <input
              type="text"
              placeholder="e.g. West Stand Level 2 Concourse"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
              <label className="text-slate-300 font-semibold block">Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="3840x2160 (4K UHD)">3840x2160 (4K UHD)</option>
                <option value="1920x1080 (FHD)">1920x1080 (FHD)</option>
                <option value="5760x1080 (Ultra-Wide LED Ribbon)">5760x1080 (LED Ribbon)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Connected Media Player</label>
              <input
                type="text"
                value={connectedPlayer}
                onChange={(e) => setConnectedPlayer(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">IP Address</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              Register Display
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
