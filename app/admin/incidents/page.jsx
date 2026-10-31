'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import {
  ShieldAlert,
  Plus,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Siren,
  HeartPulse,
  Flame,
  Users,
  ZapOff,
  Droplets,
  Wrench,
  HelpCircle,
  Activity,
  PhoneCall
} from 'lucide-react';

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchIncidents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedPriority !== 'ALL') params.append('priority', selectedPriority);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/incidents?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setIncidents(json.incidents);
        setMetrics(json.metrics);
        setCategories(json.categories);
        setStatuses(json.statuses);
        setPriorities(json.priorities);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [selectedStatus, selectedPriority, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchIncidents();
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <Badge variant="danger">CRITICAL</Badge>;
      case 'HIGH':
        return <Badge variant="warning">HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="info">MEDIUM</Badge>;
      default:
        return <Badge variant="secondary">LOW</Badge>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'REPORTED':
        return <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-bold">REPORTED</span>;
      case 'ACKNOWLEDGED':
        return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">ACKNOWLEDGED</span>;
      case 'ASSIGNED':
        return <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30 text-[10px] font-bold">ASSIGNED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold animate-pulse">IN PROGRESS</span>;
      case 'ESCALATED':
        return <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/40 text-[10px] font-black">ESCALATED</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[10px] font-bold">RESOLVED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30 text-[10px] font-bold">CLOSED</span>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="danger" size="sm">INCIDENT MANAGEMENT SYSTEM</Badge>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
                ACTIVE DISPATCH DESK
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Stadium Incidents & Response Registry
            </h1>
            <p className="text-xs text-slate-400">
              Coordinated tracking and logging of medical, fire, security, crowd congestion, and infrastructure events.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/admin/emergency-centre">
            <Button variant="outline" size="sm">
              <Siren className="w-4 h-4 mr-1 text-rose-400 animate-pulse" />
              <span>Emergency Centre</span>
            </Button>
          </Link>

          <Link href="/admin/incidents/create">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              <span>Log Incident</span>
            </Button>
          </Link>

          <Button variant="secondary" size="sm" onClick={fetchIncidents}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Recorded Incidents"
          value={metrics ? metrics.total.toString() : '4'}
          subtitle={`Matchday Log (EVT-2026-AFCON-01)`}
          icon={Activity}
          accentColor="sky"
        />

        <StatCard
          title="Active Open Incidents"
          value={metrics ? metrics.open.toString() : '2'}
          subtitle={`${metrics?.inProgressCount || 2} In Progress | ${metrics?.criticalCount || 0} Critical`}
          icon={AlertTriangle}
          accentColor="amber"
        />

        <StatCard
          title="Avg Time to Acknowledge"
          value={metrics ? `${metrics.avgTtaMinutes} min` : '2.1 min'}
          subtitle="Target Benchmark < 3.0 min"
          icon={Clock}
          accentColor="emerald"
        />

        <StatCard
          title="Resolved & Closed Cases"
          value={metrics ? metrics.resolved.toString() : '2'}
          subtitle={`Avg Resolution: ${metrics?.avgTtrMinutes || '28.5'} min`}
          icon={CheckCircle2}
          accentColor="emerald"
        />
      </div>

      {/* Incident Categories Pills Filter */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Filter by Incident Category:</span>
          <span className="font-mono text-emerald-400">{incidents.length} Records Shown</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'bg-navy-950 text-slate-400 border border-navy-800 hover:border-slate-700'
            }`}
          >
            All Categories ({metrics?.total || 0})
          </button>

          {categories.map((c) => {
            const count = metrics?.categoriesCount?.[c.id] || 0;
            const isSelected = selectedCategory === c.id;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-rose-500 text-white font-bold shadow-md'
                    : 'bg-navy-950 text-slate-300 border border-navy-800 hover:border-slate-700'
                }`}
              >
                <span>{c.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-navy-900 text-slate-400 font-mono'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search incident ref, title, zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 border border-navy-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-navy-950 border border-navy-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Priorities</option>
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
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

      {/* Incidents Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Active & Historical Incident Records</h2>
          <span className="text-[10px] text-slate-400 font-mono">DPA 2019 Privacy Minimized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Reference & Category</th>
                <th className="p-4">Incident Description</th>
                <th className="p-4">Location / Zone</th>
                <th className="p-4">Assigned Team</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Workflow Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                    No incident records match the current filter criteria.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-navy-850/50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-white">{inc.id}</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        {inc.category.replace('_', ' ')}
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="font-bold text-white text-xs truncate">{inc.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {inc.description}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="text-slate-200 font-medium">{inc.zoneLocation}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(inc.timestamps.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="p-4">
                      {inc.assignedTeam ? (
                        <div>
                          <div className="font-semibold text-white text-xs">{inc.assignedTeam.name}</div>
                          <div className="text-[10px] text-emerald-400 font-mono">{inc.assignedTeam.leadOfficer}</div>
                        </div>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-mono italic">Unassigned</span>
                      )}
                    </td>

                    <td className="p-4">
                      {getPriorityBadge(inc.priority)}
                    </td>

                    <td className="p-4">
                      {getStatusBadge(inc.status)}
                    </td>

                    <td className="p-4 text-right">
                      <Link href={`/admin/incidents/${inc.id}`}>
                        <Button variant="outline" size="sm" className="text-xs">
                          <span>Coordinate</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
