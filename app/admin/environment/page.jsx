'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import {
  Thermometer,
  Wind,
  Droplets,
  CheckCircle,
  RefreshCw,
  Building2,
  Activity,
  Fan,
  Gauge,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  Play,
  CheckCircle2
} from 'lucide-react';

export default function AdminEnvironmentalMonitoringPage() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchEnvironmentData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/building/environment');
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.warn('Failed to load environment data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvironmentData();
  }, []);

  const handleSimulateTelemetry = async () => {
    setIsSimulating(true);
    try {
      await fetch('/api/building/environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SIMULATE_READINGS' }),
      });
      await fetchEnvironmentData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const sensors = data?.sensors || [];
  const ventilationIndicators = data?.ventilationIndicators || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <Badge variant="success" size="sm">
              STADIUM CLIMATE, TURF & IAQ SENSORS
            </Badge>
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-semibold">
              SIMULATED TELEMETRY ACTIVE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Environmental & Air Quality Monitoring
          </h1>
          <p className="text-xs text-slate-400">
            Real-time pitch turf soil moisture, FIFA WBGT heat stress index, concourse CO2 ppm, and HVAC ventilation indicators.
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
            <Thermometer className={`w-4 h-4 mr-1 text-teal-400 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Telemetry'}</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchEnvironmentData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pitch Grass Temperature"
          value={data?.summary ? `${data.summary.avgPitchTempC} °C` : '24.5 °C'}
          subtitle="Main Bowl Turf Surface"
          icon={Thermometer}
          accentColor="emerald"
        />

        <StatCard
          title="Pitch Soil Moisture"
          value={data?.summary ? `${data.summary.avgSoilMoisturePct}%` : '42%'}
          subtitle="Agronomic Target: 38% - 45%"
          icon={Droplets}
          accentColor="emerald"
        />

        <StatCard
          title="Concourse CO2 Air Quality"
          value={data?.summary ? `${data.summary.concourseCo2Ppm} ppm` : '540 ppm'}
          subtitle="Excellent (ASHRAE Standard < 1000 ppm)"
          icon={Wind}
          accentColor="sky"
        />

        <StatCard
          title="FIFA WBGT Heat Index"
          value={data?.summary ? `${data.summary.pitchWbgtIndexC} °C` : '22.8 °C'}
          subtitle="Status: Green / Low Risk (< 25.6°C)"
          icon={CheckCircle}
          accentColor="emerald"
        />
      </div>

      {/* FIFA WBGT Player Safety & Comfort Benchmarks (Requirement 5) */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-navy-800 pb-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">
              FIFA Match Operations Wet Bulb Globe Temperature (WBGT) Player Safety Protocol
            </h2>
          </div>
          <Badge variant="success" size="sm">LOW HEAT STRESS - NO COOLING BREAK REQUIRED</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <div className="font-bold flex items-center justify-between">
              <span>Green: &lt; 25.6 °C</span>
              <span className="font-mono text-[10px] bg-emerald-400/20 px-1.5 py-0.5 rounded">CURRENT: 22.8°C</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 mt-1">Normal match play. Standard water breaks at intervals.</p>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <div className="font-bold">Orange: 25.6 - 27.7 °C</div>
            <p className="text-[11px] text-amber-200/80 mt-1">Moderate risk. Enhanced sideline hydration station standby.</p>
          </div>

          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
            <div className="font-bold">Red: 27.8 - 29.9 °C</div>
            <p className="text-[11px] text-rose-200/80 mt-1">High risk. Mandatory 3-minute cooling breaks at 30' and 75'.</p>
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
            <div className="font-bold">Black: &ge; 30.0 °C</div>
            <p className="text-[11px] text-purple-200/80 mt-1">Extreme risk. Match postponement protocol triggered.</p>
          </div>
        </div>
      </div>

      {/* HVAC Ventilation Indicators Table (Requirement 5) */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Fan className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="text-sm font-bold text-white">HVAC Mechanical Ventilation & IAQ Indicators</h2>
              <p className="text-[11px] text-slate-400">
                Air Changes per Hour (ACH), fresh air damper intake %, fan VFD speeds, and filter differential pressure ΔP.
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">ALL AIR HANDLERS ACTIVE</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Ventilation Zone</th>
                <th className="p-4">Air Changes / Hour (ACH)</th>
                <th className="p-4">Fresh Air Damper</th>
                <th className="p-4">Fan VFD Speed</th>
                <th className="p-4">Filter Differential Pressure (ΔP)</th>
                <th className="p-4">Filtration Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {ventilationIndicators.map((v, idx) => (
                <tr key={idx} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4 font-bold text-white">{v.zone}</td>

                  <td className="p-4 font-mono">
                    <span className="font-bold text-emerald-400 text-sm">{v.airChangesPerHour} ACH</span>
                    <span className="text-[10px] text-slate-500 block">Target: &ge; {v.targetAch} ACH</span>
                  </td>

                  <td className="p-4 font-mono font-bold text-sky-400">
                    {v.freshAirDamperPct}% Intake
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    {v.fanVfdSpeedPct}% VFD
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    <span className="font-bold text-white">{v.filterDeltaPa} Pa</span>
                    <span className="text-[10px] text-slate-500 block">Nominal &lt; 250 Pa</span>
                  </td>

                  <td className="p-4">
                    <Badge variant="success" size="sm">{v.filterStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Environmental Sensors Detail Cards Grid (Requirement 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Precinct Climate & IAQ Multi-Sensor Grid</h2>
          <span className="text-xs text-slate-400 font-mono">{sensors.length} Deployed Stations</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sensors.map((s) => (
            <div
              key={s.id}
              className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4 hover:border-emerald-500/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-bold text-white text-base block">{s.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                    {s.id} • {s.protocol}
                  </span>
                  <span className="text-[11px] text-slate-400 block">{s.location}</span>
                </div>
                <Badge variant="success" size="sm">{s.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-navy-950 p-4 rounded-2xl border border-navy-800 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Temperature</span>
                  <span className="font-bold text-emerald-400 text-sm">{s.temperatureC} °C</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Humidity</span>
                  <span className="font-bold text-white text-sm">{s.humidityPercentage}%</span>
                </div>

                {s.soilMoisturePercentage !== null && s.soilMoisturePercentage !== undefined && (
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Soil Moisture</span>
                    <span className="font-bold text-teal-400 text-sm">{s.soilMoisturePercentage}%</span>
                  </div>
                )}

                {s.co2Ppm !== null && s.co2Ppm !== undefined && (
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">CO2 Level</span>
                    <span className="font-bold text-sky-400 text-sm">{s.co2Ppm} ppm</span>
                  </div>
                )}

                {s.pm25Ugm3 !== null && s.pm25Ugm3 !== undefined && (
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">PM2.5 Particulate</span>
                    <span className="font-bold text-white text-sm">{s.pm25Ugm3} µg/m³</span>
                  </div>
                )}

                {s.wbgtIndexC !== null && s.wbgtIndexC !== undefined && (
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">WBGT Index</span>
                    <span className="font-bold text-emerald-400 text-sm">{s.wbgtIndexC} °C</span>
                  </div>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-navy-950/70 border border-navy-800/80 text-[11px] text-slate-300 flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Ventilation</span>
                <span className="font-mono text-emerald-400 font-bold">{s.ventilationStatus}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
