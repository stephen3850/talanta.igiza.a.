'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import {
  Wrench,
  Box,
  Activity,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  FileCheck
} from 'lucide-react';

export default function AdminMaintenanceOverviewPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMaintenanceData = async () => {
    setIsLoading(true);
    try {
      const [resWo, resAssets] = await Promise.all([
        fetch('/api/maintenance/work-orders'),
        fetch('/api/assets'),
      ]);

      const [dataWo, dataAssets] = await Promise.all([
        resWo.json(),
        resAssets.json(),
      ]);

      if (dataWo.success) {
        setWorkOrders(dataWo.workOrders);
      }
      if (dataAssets.success) {
        setMetrics(dataAssets.metrics);
      }
    } catch (err) {
      console.error('Failed to load maintenance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenanceData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Wrench className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">PREDICTIVE MAINTENANCE HUB</Badge>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
                EAM ACTIVE
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Maintenance Control Center & Work Orders
            </h1>
            <p className="text-xs text-slate-400">
              Preventive maintenance scheduling, technician assignments, work order tracking, and equipment health telemetry.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/admin/maintenance/analytics">
            <Button variant="outline" size="sm">
              <Sparkles className="w-4 h-4 mr-1 text-emerald-400" />
              <span>AI Predictive Intelligence</span>
            </Button>
          </Link>

          <Link href="/admin/maintenance/work-orders">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              <span>Work Orders</span>
            </Button>
          </Link>

          <Button variant="secondary" size="sm" onClick={fetchMaintenanceData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open Work Orders"
          value={metrics ? metrics.openWorkOrders.toString() : '2'}
          subtitle={`${metrics?.overdueMaintenance || 0} Overdue Schedules`}
          icon={Wrench}
          accentColor="sky"
        />

        <StatCard
          title="Assets Requiring Attention"
          value={metrics ? metrics.maintenanceRequired.toString() : '1'}
          subtitle="Degraded / Maintenance Due"
          icon={AlertTriangle}
          accentColor={metrics?.maintenanceRequired > 0 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Avg Equipment Health Index"
          value={metrics ? `${metrics.avgHealthIndexPercent}%` : '89%'}
          subtitle="Overall Stadium Infrastructure"
          icon={Activity}
          accentColor="emerald"
        />

        <StatCard
          title="Maintenance Expenditure"
          value={metrics ? `KES ${metrics.totalExpenditureKes.toLocaleString()}` : 'KES 70,000'}
          subtitle="Recorded Repairs & Parts"
          icon={FileCheck}
          accentColor="gold"
        />
      </div>

      {/* Navigation Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/assets">
          <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all space-y-1 group">
            <Box className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">Asset Inventory & Telemetry</span>
            <span className="text-[10px] text-slate-400 block">5 Registered Infrastructure Assets</span>
          </div>
        </Link>

        <Link href="/admin/maintenance/work-orders">
          <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all space-y-1 group">
            <Wrench className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">Work Orders & Technician Queue</span>
            <span className="text-[10px] text-slate-400 block">Dispatch & Track Maintenance Tasks</span>
          </div>
        </Link>

        <Link href="/admin/maintenance/analytics">
          <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all space-y-1 group">
            <Sparkles className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">AI Predictive Analytics</span>
            <span className="text-[10px] text-slate-400 block">Component Decay & Vibration Models</span>
          </div>
        </Link>
      </div>

      {/* Work Orders List Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Active Maintenance Work Orders</h2>
          <span className="text-[10px] text-slate-400 font-mono">{workOrders.length} Orders Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Work Order ID & Title</th>
                <th className="p-4">Target Asset</th>
                <th className="p-4">Assigned Technician</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {workOrders.map((wo) => (
                <tr key={wo.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono font-bold text-white">{wo.id}</div>
                    <div className="text-[11px] text-slate-300 font-bold mt-0.5">{wo.title}</div>
                  </td>

                  <td className="p-4">
                    <div className="text-slate-200">{wo.assetName}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{wo.category}</div>
                  </td>

                  <td className="p-4 font-mono text-emerald-400 text-xs font-bold">
                    {wo.assignedTechnician}
                  </td>

                  <td className="p-4">
                    <Badge variant={wo.priority === 'CRITICAL' || wo.priority === 'HIGH' ? 'danger' : 'warning'} size="sm">
                      {wo.priority}
                    </Badge>
                  </td>

                  <td className="p-4 font-mono text-[10px] text-slate-300">
                    {wo.dueDate}
                  </td>

                  <td className="p-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {wo.status}
                    </span>
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
