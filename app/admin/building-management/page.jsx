'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import { formatCurrency } from '../../../lib/utils';
import {
  Building2,
  Zap,
  Droplets,
  Thermometer,
  Activity,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  Lock,
  Cpu,
  Server,
  Layers,
  FileText,
  Sliders,
  Flame,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';

export default function AdminBuildingManagementOverviewPage() {
  const [energyData, setEnergyData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [envData, setEnvData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [gatewaysData, setGatewaysData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Safety Control Modal State
  const [isControlModalOpen, setIsControlModalOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState('GW-BACNET-IP-01');
  const [targetDevice, setTargetDevice] = useState('AHU-VIP-CANOPY-01');
  const [commandType, setCommandType] = useState('SET_VENTILATION_DAMPER');
  const [setpointValue, setSetpointValue] = useState('75');
  const [safetyInterlockToken, setSafetyInterlockToken] = useState('INTERLOCK_CONFIRMED_ENG_2026');
  const [overrideAck, setOverrideAck] = useState(true);
  const [controlResult, setControlResult] = useState(null);
  const [isSubmittingControl, setIsSubmittingControl] = useState(false);

  // Diagnostics Test Suite State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const fetchAllBuildingData = async () => {
    setIsLoading(true);
    try {
      const [resPwr, resWtr, resEnv, resAnalytics, resGateways] = await Promise.all([
        fetch('/api/building/energy'),
        fetch('/api/building/water'),
        fetch('/api/building/environment'),
        fetch('/api/building/analytics'),
        fetch('/api/building/gateways'),
      ]);

      const [pwr, wtr, env, analytics, gws] = await Promise.all([
        resPwr.json(),
        resWtr.json(),
        resEnv.json(),
        resAnalytics.json(),
        resGateways.json(),
      ]);

      if (pwr.success) setEnergyData(pwr);
      if (wtr.success) setWaterData(wtr);
      if (env.success) setEnvData(env);
      if (analytics.success) setAnalyticsData(analytics.analytics);
      if (gws.success) setGatewaysData(gws.gateways);
    } catch (err) {
      console.warn('Failed to fetch building data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBuildingData();
  }, []);

  const handleSimulateTelemetry = async () => {
    setIsSimulating(true);
    try {
      await Promise.all([
        fetch('/api/building/energy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SIMULATE_READINGS' }),
        }),
        fetch('/api/building/water', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SIMULATE_READINGS' }),
        }),
        fetch('/api/building/environment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'SIMULATE_READINGS' }),
        }),
      ]);
      await fetchAllBuildingData();
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleExecuteControlCommand = async (e) => {
    e.preventDefault();
    setIsSubmittingControl(true);
    setControlResult(null);

    try {
      const res = await fetch('/api/building/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: { id: 'USR-ADMIN-01', email: 'facility.engineer@sttech.co.ke', role: 'VENUE_MANAGER' },
          gatewayId: selectedGateway,
          targetDevice,
          commandType,
          setpointValue,
          safetyInterlockToken,
          overrideAcknowledgement: overrideAck,
        }),
      });

      const data = await res.json();
      setControlResult(data);
      if (data.success) {
        fetchAllBuildingData();
      }
    } catch (err) {
      setControlResult({ success: false, reason: err.message });
    } finally {
      setIsSubmittingControl(false);
    }
  };

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const res = await fetch('/api/building/test');
      const data = await res.json();
      if (data.success) {
        setDiagnosticsResult(data.diagnostics);
      }
    } catch (err) {
      console.error('Diagnostic error:', err);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">STADIUM RESOURCE OS</Badge>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-semibold">
                SIMULATED DATA ACTIVE
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Smart Building, Energy & Water Management System
            </h1>
            <p className="text-xs text-slate-400">
              Supervisory monitoring of approved stadium HVAC, 415V substation power, precinct water vaults, and pitch microclimate.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setIsTestModalOpen(true);
              handleRunDiagnostics();
            }}
          >
            <Activity className="w-4 h-4 mr-1 text-emerald-400" />
            <span>Test Suite</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSimulateTelemetry}
            disabled={isSimulating}
          >
            <Play className={`w-4 h-4 mr-1 text-sky-400 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Simulating...' : 'Simulate Telemetry'}</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchAllBuildingData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Control Safety Governance Banner (Requirement 8) */}
      <div className="p-4 rounded-2xl bg-navy-900/90 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-slate-300 shadow-lg">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-white flex items-center space-x-2">
              <span>Control Safety & Engineering Governance: Monitoring-First Principle</span>
              <Badge variant="success" size="sm">INTERLOCKS ENGAGED</Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              Any physical remote control of electrical switchgear, valves, or HVAC chillers requires verified hardware integration, authorized operator roles, physical manual override verification, and manufacturer approval. Life-safety equipment overrides are permanently prohibited.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="shrink-0 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 text-xs"
          onClick={() => setIsControlModalOpen(true)}
        >
          <Lock className="w-3.5 h-3.5 mr-1.5" />
          <span>Safety Control Console</span>
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Power Load"
          value={energyData?.summary ? `${energyData.summary.totalPowerKw} kW` : '1,970 kW'}
          subtitle={`Grid Headroom: ${energyData?.summary ? energyData.summary.loadHeadroomKw : '530'} kW`}
          icon={Zap}
          accentColor="emerald"
        />

        <StatCard
          title="Daily Electricity Consumed"
          value={energyData?.summary ? `${energyData.summary.totalDailyKwh.toLocaleString()} kWh` : '12,400 kWh'}
          subtitle={`Est. Cost: KES ${(energyData?.summary ? energyData.summary.totalDailyKwh * 14.5 : 179800).toLocaleString()}`}
          icon={Activity}
          accentColor="sky"
        />

        <StatCard
          title="Precinct Water Flow Rate"
          value={waterData?.summary ? `${waterData.summary.totalFlowRateLps} L/s` : '21.7 L/s'}
          subtitle={`Daily Vol: ${waterData?.summary ? waterData.summary.totalDailyM3 : '302'} m³ (${waterData?.summary?.reservoirCapacityPct || 88}% Res.)`}
          icon={Droplets}
          accentColor="sky"
        />

        <StatCard
          title="Pitch Grass & Climate"
          value={envData?.summary ? `${envData.summary.avgPitchTempC} °C` : '24.5 °C'}
          subtitle={`Soil Moisture: ${envData?.summary ? envData.summary.avgSoilMoisturePct : '42'}% | WBGT ${envData?.summary?.pitchWbgtIndexC || '22.8'}°C`}
          icon={Thermometer}
          accentColor="emerald"
        />
      </div>

      {/* Subsystem Direct Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">1. Electrical & Energy Monitoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Substation power sub-metering, zone consumption breakdowns (Floodlights, Chiller Plant, Concourse), peak demand kW tracking, and power quality (415V, 50.0 Hz).
            </p>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>6 Substation Digital Meters Online</span>
            </div>
          </div>

          <Link href="/admin/energy">
            <Button variant="primary" size="sm" className="w-full justify-between">
              <span>Launch Energy Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-sky-500/40 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">2. Water & Leak Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Precinct municipal bulk supply vaults, pitch underground irrigation manifold, reservoir storage levels, acoustic leak sensors, and night base-flow anomaly checks.
            </p>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-sky-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>4 Acoustic Leak Transmitters Normal</span>
            </div>
          </div>

          <Link href="/admin/water">
            <Button variant="primary" size="sm" className="w-full justify-between">
              <span>Launch Water Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-teal-500/40 transition-all">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Thermometer className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">3. Environmental & Air Quality</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              FIFA WBGT heat stress index, pitch turf soil moisture probes, concourse CO2 ventilation indicators (Air Changes per Hour, VFD fan speeds, filter ΔP).
            </p>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-teal-400">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>FIFA WBGT Green / Low Risk</span>
            </div>
          </div>

          <Link href="/admin/environment">
            <Button variant="primary" size="sm" className="w-full justify-between">
              <span>Launch Environment Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Building System Gateways & Hardware Integration (Requirement 6) */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">
                Approved Building System Gateways & Field Interfaces
              </h2>
              <p className="text-[11px] text-slate-400">
                Purdue Level 2 OT network physical bridges for BACnet/IP, Modbus TCP, M-Bus, DALI-2, and OPC UA.
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">5 OF 5 GATEWAYS ONLINE</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Gateway & Subsystem</th>
                <th className="p-4">Manufacturer & Model</th>
                <th className="p-4">Protocol & Interface</th>
                <th className="p-4">IP / VLAN</th>
                <th className="p-4">Override Switch</th>
                <th className="p-4">Fail-Safe State</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {gatewaysData.map((gw) => (
                <tr key={gw.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{gw.name}</div>
                    <div className="font-mono text-[10px] text-emerald-400">{gw.id} • {gw.subsystem}</div>
                  </td>
                  <td className="p-4 text-slate-300">{gw.manufacturer}</td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">{gw.protocol}</td>
                  <td className="p-4 font-mono text-[11px] text-slate-300">
                    {gw.ipAddress}:{gw.port}
                  </td>
                  <td className="p-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {gw.localManualOverrideSwitch}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-[10px] text-slate-400">
                    {gw.failSafeMode}
                  </td>
                  <td className="p-4">
                    <Badge variant={gw.status === 'ONLINE' ? 'success' : 'danger'}>
                      {gw.status} ({gw.latencyMs}ms)
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics, Efficiency Recommendations & Maintenance (Requirement 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Efficiency Recommendations */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">AI & BMS Efficiency Recommendations</h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold">
              Potential Savings: KES 79,100 / Event
            </span>
          </div>

          <div className="space-y-3">
            {analyticsData?.recommendations?.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{rec.title}</span>
                  <Badge variant={rec.impact === 'HIGH' ? 'warning' : 'success'} size="sm">
                    {rec.impact} IMPACT (+KES {rec.estimatedSavingsKes.toLocaleString()})
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {rec.description}
                </p>
                <div className="text-[10px] font-mono text-emerald-400 pt-1">
                  Subsystem: {rec.subsystem}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Alerts */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h2 className="text-sm font-bold text-white">Preventative Maintenance Action Items</h2>
            </div>
            <span className="text-[10px] text-amber-400 font-mono font-bold">
              3 Monitored Assets
            </span>
          </div>

          <div className="space-y-3">
            {analyticsData?.maintenanceAlerts?.map((mnt) => (
              <div
                key={mnt.id}
                className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs">{mnt.equipment}</span>
                  <Badge variant={mnt.severity === 'WARNING' ? 'warning' : 'secondary'} size="sm">
                    DUE: {mnt.dueDate}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {mnt.issue}
                </p>
                <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1">
                  <span>Subsystem: {mnt.subsystem}</span>
                  <span className="text-emerald-400">{mnt.actionRequired}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Safety Control Modal (Requirement 8) */}
      <Modal
        isOpen={isControlModalOpen}
        onClose={() => {
          setIsControlModalOpen(false);
          setControlResult(null);
        }}
        title="Physical Building Remote Control & Safety Interlock Console"
      >
        <form onSubmit={handleExecuteControlCommand} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
            <div className="flex items-center space-x-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>MANDATORY SAFETY INTERLOCK POLICY</span>
            </div>
            <p className="text-[11px] text-amber-200/90">
              Never issue unverified commands to electrical, water, HVAC or life-safety equipment. Physical manual override switches at the field cabinet take permanent precedence over remote software setpoints.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Select Approved Interface Gateway</label>
            <select
              value={selectedGateway}
              onChange={(e) => setSelectedGateway(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
            >
              {gatewaysData.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.id} - {g.name} ({g.protocol})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Target Subsystem Equipment</label>
              <input
                type="text"
                value={targetDevice}
                onChange={(e) => setTargetDevice(e.target.value)}
                placeholder="e.g. AHU-VIP-CANOPY-01"
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Command Type</label>
              <select
                value={commandType}
                onChange={(e) => setCommandType(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="SET_VENTILATION_DAMPER">SET_VENTILATION_DAMPER (0-100%)</option>
                <option value="RAMP_FAN_VFD_SPEED">RAMP_FAN_VFD_SPEED (Hz / %)</option>
                <option value="IRRIGATION_VALVE_SEQUENCE">IRRIGATION_VALVE_SEQUENCE (Timed Run)</option>
                <option value="TRIP_BREAKER_EMERGENCY">TRIP_BREAKER_EMERGENCY (Interlocked)</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Setpoint Target Value</label>
            <input
              type="text"
              value={setpointValue}
              onChange={(e) => setSetpointValue(e.target.value)}
              placeholder="e.g. 75"
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Hardware Safety Interlock Token</label>
            <input
              type="text"
              value={safetyInterlockToken}
              onChange={(e) => setSafetyInterlockToken(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              required
            />
            <p className="text-[10px] text-slate-500">
              Must match verified engineering key: <code>INTERLOCK_CONFIRMED_ENG_2026</code>
            </p>
          </div>

          <div className="flex items-start space-x-2 pt-1">
            <input
              type="checkbox"
              id="overrideAck"
              checked={overrideAck}
              onChange={(e) => setOverrideAck(e.target.checked)}
              className="mt-0.5 rounded border-navy-700 bg-navy-950 text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="overrideAck" className="text-[11px] text-slate-300 leading-tight">
              I certify that physical interlocks are verified closed, the cabinet manual selector is in REMOTE, and this command complies with manufacturer specifications and facility safety codes.
            </label>
          </div>

          {controlResult && (
            <div
              className={`p-3 rounded-xl border text-xs ${
                controlResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <div className="font-bold flex items-center space-x-1.5">
                {controlResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>{controlResult.success ? 'Command Verified & Dispatched' : 'Command Blocked'}</span>
              </div>
              <p className="mt-1 text-[11px]">
                {controlResult.message || controlResult.reason}
              </p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={() => setIsControlModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmittingControl || !overrideAck}
            >
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              <span>{isSubmittingControl ? 'Verifying...' : 'Authorize & Dispatch'}</span>
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diagnostics Test Suite Modal (Requirement 10) */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Building Management Diagnostic & Testing Runner"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-slate-300 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Automated Test Harness</span>
              <span className="text-[11px] text-slate-400">
                Tests telemetry ingestion, threshold alerting, device timeouts, and safety interlocks.
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
            >
              <Play className={`w-3.5 h-3.5 mr-1 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
              <span>{isRunningDiagnostics ? 'Testing...' : 'Re-run Tests'}</span>
            </Button>
          </div>

          {diagnosticsResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  Total Tests: {diagnosticsResult.totalTests}
                </span>
                <span className="text-emerald-400 font-bold">
                  Passed: {diagnosticsResult.passedCount}
                </span>
                <span className="text-rose-400 font-bold">
                  Failed: {diagnosticsResult.failedCount}
                </span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {diagnosticsResult.results.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      t.passed
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white flex items-center space-x-1.5">
                        {t.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span>{t.testName}</span>
                      </span>
                      <Badge variant={t.passed ? 'success' : 'danger'} size="sm">
                        {t.passed ? 'PASS' : 'FAIL'}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-400">{t.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end pt-2 border-t border-navy-800">
            <Button variant="secondary" size="sm" onClick={() => setIsTestModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
