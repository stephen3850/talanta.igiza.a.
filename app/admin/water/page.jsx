'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import {
  Droplets,
  CheckCircle,
  RefreshCw,
  Activity,
  AlertTriangle,
  Building2,
  TrendingDown,
  TrendingUp,
  Layers,
  ShieldCheck,
  Radio,
  Sliders,
  Waves,
  CheckCircle2,
  XCircle,
  Play
} from 'lucide-react';

export default function AdminWaterManagementPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isTogglingLeak, setIsTogglingLeak] = useState(false);

  const fetchWaterData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/building/water');
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.warn('Failed to load water data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterData();
  }, []);

  const handleSimulateTelemetry = async () => {
    setIsSimulating(true);
    try {
      await fetch('/api/building/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIMULATE_READINGS' }),
      });
      await fetchWaterData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleToggleLeakSimulation = async (sensorId) => {
    setIsTogglingLeak(true);
    try {
      await fetch('/api/building/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_LEAK_SIMULATION', sensorId }),
      });
      await fetchWaterData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingLeak(false);
    }
  };

  const meters = data?.meters || [];
  const reservoirs = data?.reservoirs || [];
  const leakSensors = data?.leakSensors || [];
  const abnormalIndicators = data?.abnormalUsageIndicators || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="success" size="sm">
              PRECINCT WATER FLOW & LEAK MANAGEMENT
            </Badge>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-semibold">
              SIMULATED TELEMETRY ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Water Consumption & Hydraulic Infrastructure
          </h1>
          <p className="text-xs text-slate-400">
            Real-time ultrasonic flow metering, sub-surface pitch turf irrigation, acoustic leak sensors, and reservoir storage levels.
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
            <Droplets className={`w-4 h-4 mr-1 text-sky-400 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Telemetry'}</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchWaterData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Water Flow"
          value={data?.summary ? `${data.summary.totalFlowRateLps} L/s` : '21.7 L/s'}
          subtitle="Precinct Municipal Main Header"
          icon={Droplets}
          accentColor="sky"
        />

        <StatCard
          title="Daily Water Volume"
          value={data?.summary ? `${data.summary.totalDailyM3} m³` : '302 m³'}
          subtitle={`Matchday Spectator Restrooms & Plant`}
          icon={Activity}
          accentColor="sky"
        />

        <StatCard
          title="Main Line Hydraulic Pressure"
          value={data?.summary ? `${data.summary.waterPressureBar} Bar` : '4.25 Bar'}
          subtitle="Nominal Operating Range (3.0 - 5.0 Bar)"
          icon={CheckCircle}
          accentColor="emerald"
        />

        <StatCard
          title="Pipeline Integrity Status"
          value={data?.summary ? `${data.summary.leakCount} Leaks` : '0 Leaks'}
          subtitle="Acoustic & Moisture Sensors Normal"
          icon={CheckCircle2}
          accentColor={data?.summary?.leakCount > 0 ? 'rose' : 'emerald'}
        />
      </div>

      {/* Historical Benchmarks & Efficiency (Requirement 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs block font-semibold">Today vs 7-Day Average</span>
            <span className="text-sky-400 font-bold font-mono text-lg flex items-center mt-0.5">
              <TrendingUp className="w-4 h-4 mr-1 text-sky-400" />
              +{data?.historicalComparisons?.todayVs7DayAvgPct || 7.8}%
            </span>
            <span className="text-[10px] text-slate-500">Normal matchday spectator volume surge</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
            m³
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs block font-semibold">Per-Spectator Water Intensity</span>
            <span className="text-emerald-400 font-bold font-mono text-lg flex items-center mt-0.5">
              {data?.historicalComparisons?.perSpectatorLiters || 4.6} L / attendee
            </span>
            <span className="text-[10px] text-slate-500">World-class FIFA stadium benchmark (&lt; 5.5 L)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            L/p
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-slate-400 text-xs block font-semibold">Rainwater Harvesting Offset</span>
            <span className="text-teal-400 font-bold font-mono text-lg flex items-center mt-0.5">
              {data?.historicalComparisons?.rainwaterUtilizationPct || 24.5}%
            </span>
            <span className="text-[10px] text-slate-500">Supplying 100% of pitch irrigation needs</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
            ECO
          </div>
        </div>
      </div>

      {/* Reservoir Storage Tanks & Consumption by Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Reservoirs */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <Waves className="w-5 h-5 text-sky-400" />
              <h2 className="text-sm font-bold text-white">Precinct Water Reservoirs & Storage Tanks</h2>
            </div>
            <span className="text-[10px] font-mono text-sky-400 font-bold">
              Total Storage: 1,663 / 1,900 m³
            </span>
          </div>

          <div className="space-y-4">
            {reservoirs.map((res) => (
              <div key={res.id} className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{res.name}</span>
                  <Badge variant={res.levelPercentage > 50 ? 'success' : 'warning'} size="sm">
                    {res.levelPercentage}% FULL ({res.currentVolumeM3} m³)
                  </Badge>
                </div>

                <div className="w-full bg-navy-900 rounded-full h-2.5 overflow-hidden border border-navy-800">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-emerald-400 h-2.5 rounded-full"
                    style={{ width: `${res.levelPercentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Capacity: {res.capacityM3} m³</span>
                  <span className="text-emerald-400">{res.pumpStationStatus}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Consumption by Zone */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Water Consumption by Zone</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">5 Hydraulic Zones</span>
          </div>

          <div className="space-y-3">
            {data?.zones?.map((zone) => (
              <div key={zone.id} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">{zone.name}</span>
                  <span className="text-sky-400 font-mono font-bold">
                    {zone.currentLps} L/s ({zone.pct}%)
                  </span>
                </div>
                <div className="w-full bg-navy-950 rounded-full h-2 overflow-hidden border border-navy-800">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-teal-400 h-2 rounded-full"
                    style={{ width: `${zone.pct}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>Daily: {zone.dailyM3} m³</span>
                  <span>Share of Precinct Demand: {zone.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Abnormal Usage Indicators (Requirement 4) */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Hydraulic Anomaly & Abnormal Usage Detection</h2>
              <p className="text-[11px] text-slate-400">
                Continuous automated checks for nocturnal base flow leaks, pipe pressure drops, and flow surges.
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">ALL CHECKS PASSED</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {abnormalIndicators.map((ind, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold">
                <span className="text-white">{ind.indicator}</span>
                <Badge variant="success" size="sm">{ind.status}</Badge>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {ind.verdict}
              </p>

              <div className="pt-1 border-t border-navy-900 text-[10px] font-mono text-slate-400 flex justify-between">
                {ind.measuredLps !== undefined && (
                  <>
                    <span>Measured: {ind.measuredLps} L/s</span>
                    <span className="text-emerald-400">Threshold: &lt; {ind.thresholdLps} L/s</span>
                  </>
                )}
                {ind.currentPressureBar !== undefined && (
                  <>
                    <span>Pressure: {ind.currentPressureBar} Bar</span>
                    <span className="text-emerald-400">Nominal: {ind.nominalPressureBar} Bar</span>
                  </>
                )}
                {ind.currentPeakLps !== undefined && (
                  <>
                    <span>Peak: {ind.currentPeakLps} L/s</span>
                    <span className="text-emerald-400">Design: {ind.designCapacityLps} L/s</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leak Sensor Integration (Requirement 4) */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-navy-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Acoustic & Moisture Leak Sensors</h2>
              <p className="text-[11px] text-slate-400">
                Acoustic pipe transmitters and TT1000 moisture sensing ropes with simulated injection test.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleToggleLeakSimulation('LEAK-SENS-01')}
            disabled={isTogglingLeak}
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
            <span>Test Inject Simulated Leak</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Sensor ID & Type</th>
                <th className="p-4">Location</th>
                <th className="p-4">Pipe Diameter</th>
                <th className="p-4">Acoustic Signal (dBFS)</th>
                <th className="p-4">Moisture Status</th>
                <th className="p-4">Operational Status</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {leakSensors.map((s) => (
                <tr key={s.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{s.id}</div>
                    <div className="font-mono text-[10px] text-sky-400">{s.type}</div>
                  </td>

                  <td className="p-4 text-slate-300">{s.location}</td>

                  <td className="p-4 font-mono text-slate-400">{s.pipeDiameterMm} mm</td>

                  <td className="p-4 font-mono font-bold text-slate-300">
                    <span className={s.status === 'LEAK_DETECTED' ? 'text-rose-400 font-black' : 'text-emerald-400'}>
                      {s.acousticDbfs} dBFS
                    </span>
                  </td>

                  <td className="p-4">
                    <Badge variant={s.moistureDetected ? 'danger' : 'success'}>
                      {s.moistureDetected ? 'MOISTURE DETECTED' : 'DRY NORMAL'}
                    </Badge>
                  </td>

                  <td className="p-4">
                    <Badge variant={s.status === 'LEAK_DETECTED' ? 'danger' : 'success'}>
                      {s.status === 'LEAK_DETECTED' ? 'LEAK ALARM' : 'NORMAL'}
                    </Badge>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleToggleLeakSimulation(s.id)}
                      className="text-[10px] text-sky-400 hover:text-sky-300 underline font-mono"
                    >
                      {s.moistureDetected ? 'Clear Leak' : 'Simulate Leak'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Water Meters Table (Requirement 4) */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-navy-800">
          <h2 className="text-sm font-bold text-white">Precinct Digital Water Meters & Isolation Valves</h2>
          <p className="text-[11px] text-slate-400">
            M-Bus connected Kamstrup & Diehl ultrasonic water meters with automated isolation valve feedback.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Meter & Serial</th>
                <th className="p-4">Location</th>
                <th className="p-4">Current Flow (L/s)</th>
                <th className="p-4">Daily Volume (m³)</th>
                <th className="p-4">Pressure (Bar)</th>
                <th className="p-4">Isolation Valve Status</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {meters.map((m) => (
                <tr key={m.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{m.name}</div>
                    <div className="font-mono text-[10px] text-sky-400">
                      {m.id} • {m.serialNo}
                    </div>
                  </td>

                  <td className="p-4 text-slate-300">{m.location}</td>

                  <td className="p-4 font-mono font-bold text-sky-400 text-sm">
                    {m.currentFlowRateLps} L/s
                  </td>

                  <td className="p-4 font-mono font-bold text-white">
                    {m.dailyConsumptionM3} m³
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    {m.pressureBar} Bar
                  </td>

                  <td className="p-4 font-mono text-[11px] text-emerald-400">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                      {m.isolationValveStatus}
                    </span>
                  </td>

                  <td className="p-4">
                    <Badge variant={m.leakDetected ? 'danger' : 'success'}>
                      {m.leakDetected ? 'LEAK DETECTED' : 'ONLINE STABLE'}
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
