'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import {
  Zap,
  CheckCircle,
  RefreshCw,
  Activity,
  AlertTriangle,
  Building2,
  TrendingDown,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Shield,
  Layers,
  BarChart3,
  SunMedium,
  Check
} from 'lucide-react';

export default function AdminEnergyMonitoringPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('ALL');
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchEnergyData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/building/energy');
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.warn('Failed to load energy data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnergyData();
  }, []);

  const handleSimulateTelemetry = async () => {
    setIsSimulating(true);
    try {
      await fetch('/api/building/energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIMULATE_READINGS' }),
      });
      await fetchEnergyData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await fetch('/api/building/energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ACKNOWLEDGE_ALERT', alertId }),
      });
      await fetchEnergyData();
    } catch (err) {
      console.error(err);
    }
  };

  const meters = data?.meters || [];
  const filteredMeters =
    selectedZone === 'ALL'
      ? meters
      : meters.filter((m) => m.zoneId === selectedZone);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="success" size="sm">
              SUBSTATION POWER SUB-METERING
            </Badge>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-semibold">
              SIMULATED TELEMETRY ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Electrical & Power Consumption Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Real-time power sub-metering, zone consumption trends, 415V 3-phase quality, and peak demand tracking.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/admin/building-management">
            <Button variant="outline" size="sm">
              <Building2 className="w-4 h-4 mr-1 text-slate-400" />
              <span>Building OS</span>
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSimulateTelemetry}
            disabled={isSimulating}
          >
            <Zap className={`w-4 h-4 mr-1 text-emerald-400 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Telemetry'}</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchEnergyData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Active Load"
          value={data?.summary ? `${data.summary.totalPowerKw} kW` : '1,970 kW'}
          subtitle={`Grid Capacity: ${data?.summary ? data.summary.gridCapacityKw : '2,500'} kW`}
          icon={Zap}
          accentColor="emerald"
        />

        <StatCard
          title="Daily Electricity Consumed"
          value={data?.summary ? `${data.summary.totalDailyKwh.toLocaleString()} kWh` : '12,400 kWh'}
          subtitle="Matchday Floodlights & HVAC"
          icon={Activity}
          accentColor="sky"
        />

        <StatCard
          title="Peak Demand Recorded"
          value={data?.summary ? `${data.summary.peakPowerKw} kW` : '920 kW'}
          subtitle={`Recorded at 14:45 (Headroom: ${data?.summary ? data.summary.loadHeadroomKw : '530'} kW)`}
          icon={ArrowUpRight}
          accentColor="gold"
        />

        <StatCard
          title="Power Quality & Grid Balance"
          value={data?.summary ? `${data.summary.gridFrequencyHz} Hz` : '50.01 Hz'}
          subtitle={`PF: ${data?.summary?.avgPowerFactor || '0.96'} | 415.2V Balanced`}
          icon={CheckCircle}
          accentColor="emerald"
        />
      </div>

      {/* Historical Comparisons & Benchmarking (Requirement 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs block font-semibold">Today vs Yesterday</span>
            <span className="text-emerald-400 font-bold font-mono text-lg flex items-center mt-0.5">
              <TrendingDown className="w-4 h-4 mr-1 text-emerald-400" />
              {data?.historicalComparisons?.todayVsYesterdayPct || -4.2}%
            </span>
            <span className="text-[10px] text-slate-500">Day-over-day energy optimization</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            kWh
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs block font-semibold">Current vs Previous Match</span>
            <span className="text-emerald-400 font-bold font-mono text-lg flex items-center mt-0.5">
              <TrendingDown className="w-4 h-4 mr-1 text-emerald-400" />
              {data?.historicalComparisons?.currentMatchVsLastMatchPct || -2.8}%
            </span>
            <span className="text-[10px] text-slate-500">Matchday floodlight staging savings</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            VS
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs block font-semibold">Month-over-Month Efficiency</span>
            <span className="text-emerald-400 font-bold font-mono text-lg flex items-center mt-0.5">
              <TrendingDown className="w-4 h-4 mr-1 text-emerald-400" />
              {data?.historicalComparisons?.monthOverMonthPct || -6.5}%
            </span>
            <span className="text-[10px] text-slate-500">Annual energy reduction target on track</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
            MoM
          </div>
        </div>
      </div>

      {/* Zone Consumption Breakdown & 24h Hourly Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zone Consumption Breakdown */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Electricity Consumption by Zone</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">6 Substation Zones</span>
          </div>

          <div className="space-y-3">
            {data?.zones?.map((zone) => (
              <div key={zone.id} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">{zone.name}</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    {zone.currentKw} kW ({zone.pct}%)
                  </span>
                </div>
                <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-navy-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-sky-400 h-2 rounded-full"
                    style={{ width: `${zone.pct}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Daily: {zone.dailyKwh.toLocaleString()} kWh</span>
                  <span>Est. KES {(zone.dailyKwh * 14.5).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 24-Hour Intraday Trend Profile */}
        <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-sky-400" />
                <div>
                  <h2 className="text-sm font-bold text-white">
                    24-Hour Intraday Load Profile & Solar PV Offset
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Matchday peak load curve vs non-matchday baseline and rooftop solar PV generation.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-[10px] font-mono">
                <span className="flex items-center text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mr-1.5"></span>
                  Matchday (kW)
                </span>
                <span className="flex items-center text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500 mr-1.5"></span>
                  Baseline (kW)
                </span>
                <span className="flex items-center text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mr-1.5"></span>
                  Solar PV (kW)
                </span>
              </div>
            </div>

            {/* Profile Bars Visualization */}
            <div className="grid grid-cols-12 gap-2 pt-6 items-end h-52">
              {data?.trends?.intradayHourlyProfile?.map((pt) => {
                const maxKw = 2500;
                const matchHeight = Math.round((pt.matchdayKw / maxKw) * 100);
                const baseHeight = Math.round((pt.nonMatchdayKw / maxKw) * 100);
                const solarHeight = Math.round((pt.solarKw / maxKw) * 100);

                return (
                  <div key={pt.hour} className="flex flex-col items-center h-full justify-end group relative">
                    <div className="w-full flex items-end justify-center space-x-1 h-40">
                      {/* Matchday Bar */}
                      <div
                        className="w-2.5 bg-emerald-500 rounded-t group-hover:bg-emerald-400 transition-all"
                        style={{ height: `${matchHeight}%` }}
                        title={`${pt.hour}: Matchday ${pt.matchdayKw} kW`}
                      ></div>
                      {/* Non-matchday Bar */}
                      <div
                        className="w-2 bg-slate-700 rounded-t group-hover:bg-slate-600 transition-all"
                        style={{ height: `${baseHeight}%` }}
                        title={`${pt.hour}: Baseline ${pt.nonMatchdayKw} kW`}
                      ></div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 mt-2 block">
                      {pt.hour.replace(':00', 'h')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center text-[11px]">
              <SunMedium className="w-4 h-4 text-amber-400 mr-1.5 shrink-0" />
              <span>Rooftop Solar PV Array generated <strong>1,100 kWh</strong> clean energy today (offsetting 495 kg CO2e).</span>
            </span>
            <Badge variant="success" size="sm">ACTIVE SOLAR INVERTERS</Badge>
          </div>
        </div>
      </div>

      {/* Energy Alerts Stream (Requirement 3) */}
      {data?.alerts && data.alerts.length > 0 && (
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Active Energy & Substation Alerts</h2>
            </div>
            <Badge variant="warning" size="sm">{data.alerts.length} ALERTS</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.alerts.map((alt) => (
              <div
                key={alt.id}
                className="p-4 rounded-xl bg-navy-950 border border-navy-800 flex items-start justify-between space-x-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center space-x-2">
                    <Badge variant={alt.severity === 'WARNING' ? 'warning' : 'secondary'} size="sm">
                      {alt.severity}
                    </Badge>
                    <span className="font-bold text-white">{alt.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{alt.message}</p>
                  <div className="font-mono text-[10px] text-slate-500 pt-1">
                    Threshold: {alt.threshold} | Measured: <span className="text-amber-400 font-bold">{alt.actual}</span>
                  </div>
                </div>

                {!alt.acknowledged ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 text-xs"
                    onClick={() => handleAcknowledgeAlert(alt.id)}
                  >
                    <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    <span>Acknowledge</span>
                  </Button>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono flex items-center shrink-0">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                    <span>Acknowledged</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Energy Meters Table (Requirement 3) */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Digital Energy Sub-Meters Telemetry</h2>
            <p className="text-[11px] text-slate-400">
              Modbus TCP connected Schneider Electric PM8000 & ABB M4M revenue-grade sub-meters.
            </p>
          </div>

          {/* Zone Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Filter Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-navy-950 border border-navy-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Zones ({meters.length})</option>
              {data?.zones?.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Substation Meter & Serial</th>
                <th className="p-4">Location</th>
                <th className="p-4">Active Power (kW)</th>
                <th className="p-4">Daily Consumption</th>
                <th className="p-4">Phase Current (L1/L2/L3)</th>
                <th className="p-4">Voltage & PF</th>
                <th className="p-4">Peak Recorded</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredMeters.map((m) => (
                <tr key={m.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{m.name}</div>
                    <div className="font-mono text-[10px] text-emerald-400">
                      {m.id} • {m.serialNo}
                    </div>
                  </td>

                  <td className="p-4 text-slate-300">{m.location}</td>

                  <td className="p-4 font-mono font-bold text-emerald-400 text-sm">
                    {m.currentPowerKw} kW
                  </td>

                  <td className="p-4 font-mono font-bold text-white">
                    {m.dailyConsumptionKwh.toLocaleString()} kWh
                  </td>

                  <td className="p-4 font-mono text-[11px] text-slate-400">
                    {m.currentAmpsL1}A / {m.currentAmpsL2}A / {m.currentAmpsL3}A
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    <div>{m.voltageV} V</div>
                    <div className="text-[10px] text-slate-500">PF: {m.powerFactor}</div>
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    <div className="font-bold text-amber-400">{m.peakPowerKw} kW</div>
                    <div className="text-[9px] text-slate-500">14:45</div>
                  </td>

                  <td className="p-4">
                    <Badge variant={m.alertStatus === 'WARNING_HIGH_LOAD' ? 'warning' : 'success'}>
                      {m.alertStatus === 'WARNING_HIGH_LOAD' ? 'HIGH LOAD WARNING' : 'ONLINE STABLE'}
                    </Badge>
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
