'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import {
  Network,
  Server,
  Shield,
  Wifi,
  Activity,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowRight,
  Globe,
  Database,
  Radio,
  Cpu,
  CheckCircle2,
  Lock,
  Layers,
  HardDrive
} from 'lucide-react';

export default function AdminNocOverviewPage() {
  const [devices, setDevices] = useState([]);
  const [services, setServices] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Diagnostics Runner Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  const fetchNocData = async () => {
    setIsLoading(true);
    try {
      const [resDev, resSvc, resAlt] = await Promise.all([
        fetch('/api/network-operations/devices'),
        fetch('/api/network-operations/services'),
        fetch('/api/network-operations/alerts'),
      ]);

      const [dataDev, dataSvc, dataAlt] = await Promise.all([
        resDev.json(),
        resSvc.json(),
        resAlt.json(),
      ]);

      if (dataDev.success) {
        setDevices(dataDev.devices);
        setMetrics(dataDev.metrics);
      }
      if (dataSvc.success) {
        setServices(dataSvc.services);
      }
      if (dataAlt.success) {
        setAlerts(dataAlt.alerts);
      }
    } catch (err) {
      console.error('Failed to load NOC data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNocData();
  }, []);

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const res = await fetch('/api/network-operations/test');
      const data = await res.json();
      if (data.success) {
        setDiagnosticsResult(data.diagnostics);
      }
    } catch (err) {
      console.error('Diagnostics failed:', err);
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
            <Network className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">NOC COMMAND CENTRE</Badge>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
                SIMULATED TELEMETRY
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Network Operations & IT Infrastructure Monitoring
            </h1>
            <p className="text-xs text-slate-400">
              Development-fixture health and resource values for switches, routers, Wi-Fi, servers, and microservices; no live controller is connected.
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
            <span>NOC Diagnostics</span>
          </Button>

          <Link href="/admin/network-operations/devices">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              <span>Add Device</span>
            </Button>
          </Link>

          <Button variant="secondary" size="sm" onClick={fetchNocData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-100">
        <strong>Development environment:</strong> displayed device health, alerts, topology, and Wi-Fi telemetry are simulated fixtures, not a live stadium network or SLA.
      </div>

      {/* Security Privacy Notice (Requirement 7 & 9) */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-start space-x-3 text-xs text-slate-300 shadow-lg">
        <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-white flex items-center space-x-2">
            <span>Restricted Access Topology & Security Isolation</span>
            <Badge variant="info" size="sm">READ-ONLY TELEMETRY</Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Infrastructure topology and device management credentials are isolated to authorized ICT personnel. Monitoring integrations utilize read-only credentials and encrypted protocols (SNMPv3, TLS Syslog, HTTPS).
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monitored Infrastructure"
          value={metrics ? metrics.totalDevices.toString() : '8'}
          subtitle={`${metrics?.onlineDevices || 7} Online | ${metrics?.degradedDevices || 1} Degraded`}
          icon={Server}
          accentColor="sky"
        />

        <StatCard
          title="Active NOC Alerts"
          value={metrics ? metrics.activeAlerts.toString() : '1'}
          subtitle="Resource & Threshold Warnings"
          icon={AlertTriangle}
          accentColor={metrics?.activeAlerts > 0 ? 'amber' : 'emerald'}
        />

        <StatCard
          title="Avg Network Latency"
          value={metrics ? `${metrics.avgLatencyMs} ms` : '2.1 ms'}
          subtitle="Core Backbone SLA < 5.0 ms"
          icon={Activity}
          accentColor="emerald"
        />

        <StatCard
          title="Application Services"
          value={metrics ? `${metrics.healthyServices}/${metrics.totalServices}` : '5/5'}
          subtitle="100% Microservice Health"
          icon={CheckCircle2}
          accentColor="emerald"
        />
      </div>

      {/* Configurable Logical Infrastructure Topology Diagram (Requirement 7) */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div className="flex items-center space-x-2">
            <Network className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Logical Stadium Infrastructure Topology Diagram</h2>
              <p className="text-[11px] text-slate-400">
                Core Backbone $\rightarrow$ Perimeter Security $\rightarrow$ Distribution Switches $\rightarrow$ Stadium Edge & Applications
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Simulated Topology Map</span>
        </div>

        {/* Logical Network Diagram Canvas */}
        <div className="relative rounded-2xl bg-navy-950 border border-navy-800 p-6 overflow-hidden min-h-[360px] flex items-center justify-center">
          <div className="w-full max-w-4xl space-y-6">
            {/* Level 1: Internet Edge & BGP Routers */}
            <div className="flex items-center justify-center space-x-6">
              <div className="p-3.5 rounded-2xl bg-navy-900 border border-emerald-500/40 text-center space-y-1 w-64 shadow-lg">
                <Globe className="w-5 h-5 text-sky-400 mx-auto" />
                <span className="font-bold text-white text-xs block">Safaricom / Airtel Dual BGP Edge</span>
                <span className="text-[10px] font-mono text-emerald-400">NET-RTR-01 (10.100.0.254)</span>
              </div>

              <div className="h-8 w-0.5 bg-emerald-500/40"></div>

              <div className="p-3.5 rounded-2xl bg-navy-900 border border-emerald-500/40 text-center space-y-1 w-64 shadow-lg">
                <Shield className="w-5 h-5 text-rose-400 mx-auto" />
                <span className="font-bold text-white text-xs block">Palo Alto Perimeter NGFW</span>
                <span className="text-[10px] font-mono text-emerald-400">NET-FW-01 (10.100.0.2)</span>
              </div>
            </div>

            {/* Connecting Vertical Line */}
            <div className="w-0.5 h-6 bg-emerald-500/30 mx-auto"></div>

            {/* Level 2: Core Switch Backbone Stack */}
            <div className="p-4 rounded-2xl bg-navy-900 border-2 border-emerald-500 text-center space-y-1 max-w-md mx-auto shadow-2xl shadow-emerald-500/10">
              <div className="flex items-center justify-center space-x-2 font-bold text-white text-sm">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <span>DATA CENTER CORE SWITCH STACK ALPHA (100GbE)</span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">NET-CORE-01 (10.100.0.1) • Latency: 0.8ms • Uptime: 248d</p>
            </div>

            {/* Connecting Distribution Branch Lines */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="w-0.5 h-6 bg-emerald-500/30 mx-auto"></div>
              <div className="w-0.5 h-6 bg-emerald-500/30 mx-auto"></div>
              <div className="w-0.5 h-6 bg-emerald-500/30 mx-auto"></div>
            </div>

            {/* Level 3: Edge Sectors */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              {/* Sector 1: Gate & Turnstile Networks */}
              <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 text-slate-300 space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>GATE B CONCOURSE</span>
                  <Badge variant="success" size="sm">ONLINE</Badge>
                </div>
                <div className="text-[10px] text-slate-400">Switch: NET-SW-GTB-01</div>
                <div className="text-[10px] text-emerald-400">Turnstile IoT GW: GW-TURNSTILE-04</div>
              </div>

              {/* Sector 2: Application Kubernetes Cluster */}
              <div className="p-3.5 rounded-xl bg-navy-900 border border-navy-800 text-slate-300 space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>KUBERNETES & DB</span>
                  <Badge variant="success" size="sm">ONLINE</Badge>
                </div>
                <div className="text-[10px] text-slate-400">Host: SVR-BLADE-01 (Dell R750)</div>
                <div className="text-[10px] text-emerald-400">DB: PostgreSQL HA Primary</div>
              </div>

              {/* Sector 3: Wi-Fi 6E Bowl Coverage */}
              <div className="p-3.5 rounded-xl bg-navy-900 border border-amber-500/40 text-slate-300 space-y-1">
                <div className="font-bold text-white flex items-center justify-between">
                  <span>SOUTH STAND WI-FI</span>
                  <Badge variant="warning" size="sm">DEGRADED</Badge>
                </div>
                <div className="text-[10px] text-slate-400">AP: AP-BOWL-SOUTH-01</div>
                <div className="text-[10px] text-amber-400">CPU Load: 88.2% (High Surge)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/admin/network-operations/wifi">
          <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all text-center space-y-1 group">
            <Wifi className="w-5 h-5 text-emerald-400 mx-auto group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">Smart Wi-Fi</span>
            <span className="text-[10px] text-slate-400 block">Guest policy & aggregate usage</span>
          </div>
        </Link>
        <Link href="/admin/network-operations/devices">
          <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all text-center space-y-1 group">
            <Server className="w-5 h-5 text-sky-400 mx-auto group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">Device Inventory</span>
            <span className="text-[10px] text-slate-400 block">Manage 8 Network Hardware Units</span>
          </div>
        </Link>

        <Link href="/admin/network-operations/services">
          <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all text-center space-y-1 group">
            <Activity className="w-5 h-5 text-emerald-400 mx-auto group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">Services & DB Health</span>
            <span className="text-[10px] text-slate-400 block">HTTPS Endpoints & PostgreSQL</span>
          </div>
        </Link>

        <Link href="/admin/network-operations/alerts">
          <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all text-center space-y-1 group">
            <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">NOC Alert Log</span>
            <span className="text-[10px] text-slate-400 block">Triage & Resolve Warnings</span>
          </div>
        </Link>
      </div>

      {/* NOC Diagnostics Modal (Requirement 10) */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Network Operations Diagnostics Runner"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-slate-300 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">NOC Telemetry & Alert Pipeline Check</span>
              <span className="text-[11px] text-slate-400">
                Tests device telemetry, alert threshold rules, resolution workflow, and HTTPS endpoints.
              </span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isRunningDiagnostics ? 'animate-spin' : ''}`} />
              <span>{isRunningDiagnostics ? 'Testing...' : 'Re-run Tests'}</span>
            </Button>
          </div>

          {diagnosticsResult && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Total Tests: {diagnosticsResult.totalTests}</span>
                <span className="text-emerald-400 font-bold">Passed: {diagnosticsResult.passedCount}</span>
                <span className="text-rose-400 font-bold">Failed: {diagnosticsResult.failedCount}</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {diagnosticsResult.results.map((t, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs space-y-1 ${
                      t.passed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
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
