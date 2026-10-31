'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import {
  Box,
  Wrench,
  Plus,
  RefreshCw,
  Search,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Cpu,
  Zap,
  Droplets,
  Thermometer,
  ShieldAlert
} from 'lucide-react';

export default function AdminAssetsOverviewPage() {
  const [assets, setAssets] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Register Asset Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('ELECTRICAL');
  const [manufacturer, setManufacturer] = useState('Schneider Electric');
  const [model, setModel] = useState('Masterpact MTZ 2000A Switchgear');
  const [serialNumber, setSerialNumber] = useState('SCH-2025-8841');
  const [location, setLocation] = useState('Substation Beta Room 102');
  const [installationDate, setInstallationDate] = useState('2025-06-01');
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('2028-06-01');
  const [maintenanceSchedule, setMaintenanceSchedule] = useState('MONTHLY');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/assets?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setAssets(json.assets);
        setMetrics(json.metrics);
        setCategories(json.categories);
        setStatuses(json.statuses);
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [selectedStatus, selectedCategory]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          manufacturer,
          model,
          serialNumber,
          location,
          installationDate,
          warrantyExpiryDate,
          maintenanceSchedule,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setName('');
        fetchAssets();
      }
    } catch (err) {
      console.error('Failed to register asset:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Box className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">ENTERPRISE ASSET MANAGEMENT</Badge>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
                CONDITION TELEMETRY ACTIVE
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Stadium Asset Inventory & Equipment Registry
            </h1>
            <p className="text-xs text-slate-400">
              Centralized registry for electrical, HVAC, generators, water pumps, turnstiles, and stadium machinery.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/admin/maintenance">
            <Button variant="outline" size="sm">
              <Wrench className="w-4 h-4 mr-1 text-emerald-400" />
              <span>Maintenance Hub</span>
            </Button>
          </Link>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Register Asset</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchAssets}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Assets"
          value={metrics ? metrics.totalAssets.toString() : '5'}
          subtitle="Stadium Machinery & Facilities"
          icon={Box}
          accentColor="sky"
        />

        <StatCard
          title="Assets Requiring Attention"
          value={metrics ? metrics.maintenanceRequired.toString() : '1'}
          subtitle={`${metrics?.maintenanceRequired || 1} Degraded / Maintenance Due`}
          icon={AlertTriangle}
          accentColor={metrics?.maintenanceRequired > 0 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Avg Equipment Health Index"
          value={metrics ? `${metrics.avgHealthIndexPercent}%` : '89%'}
          subtitle="Condition Telemetry Metric"
          icon={Activity}
          accentColor="emerald"
        />

        <StatCard
          title="Open Work Orders"
          value={metrics ? metrics.openWorkOrders.toString() : '2'}
          subtitle={`${metrics?.overdueMaintenance || 0} Overdue Schedules`}
          icon={Wrench}
          accentColor="purple"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search asset ID, name, manufacturer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchAssets()}
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

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((ast) => (
          <div
            key={ast.id}
            className="bg-navy-900 border border-navy-800 hover:border-slate-700 transition-all rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-400">{ast.id}</span>
                {ast.status === 'OPERATIONAL' ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">OPERATIONAL</span>
                ) : ast.status === 'DEGRADED' ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-[10px] font-black animate-pulse">DEGRADED</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">MAINTENANCE DUE</span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-white text-sm">{ast.name}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{ast.manufacturer} • {ast.model}</p>
              </div>

              {/* Condition Telemetry Summary Requirement 5 */}
              <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[10px]">Health Index:</span>
                  <span className={`font-bold ${ast.healthIndexPercent < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {ast.healthIndexPercent}%
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-500 text-[10px]">Location:</span>
                  <span className="text-slate-300 truncate max-w-[150px]">{ast.location}</span>
                </div>

                {ast.conditionTelemetry && (
                  <div className="flex justify-between text-[10px] text-sky-400 pt-1 border-t border-navy-900">
                    <span>Temp: {ast.conditionTelemetry.temperatureC} °C</span>
                    <span>Vib: {ast.conditionTelemetry.vibrationMms} mm/s</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-navy-800 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                Installed: {ast.installationDate}
              </span>

              <Link href={`/admin/assets/${ast.id}`}>
                <Button variant="outline" size="sm" className="text-xs">
                  <span>View Record</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Register Asset Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Stadium Infrastructure Asset"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Asset Name *</label>
            <input
              type="text"
              placeholder="e.g. Substation Beta Main Switchgear Panel"
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
              <label className="text-slate-300 font-semibold block">Maintenance Schedule</label>
              <select
                value={maintenanceSchedule}
                onChange={(e) => setMaintenanceSchedule(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
                <option value="BI_MONTHLY">BI_MONTHLY</option>
                <option value="QUARTERLY">QUARTERLY</option>
                <option value="ANNUALLY">ANNUALLY</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Manufacturer</label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Model & Serial Number</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Physical Location / Zone *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Installation Date</label>
              <input
                type="date"
                value={installationDate}
                onChange={(e) => setInstallationDate(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Warranty Expiry Date</label>
              <input
                type="date"
                value={warrantyExpiryDate}
                onChange={(e) => setWarrantyExpiryDate(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              Register Asset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
