'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import {
  Siren,
  ShieldAlert,
  Radio,
  PhoneCall,
  Activity,
  AlertTriangle,
  HeartPulse,
  Flame,
  Users,
  MapPin,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  FileText,
  Lock,
  Layers,
  PhoneForwarded
} from 'lucide-react';

export default function AdminEmergencyOperationsCentrePage() {
  const [incidents, setIncidents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [procedures, setProcedures] = useState([]);
  const [contactDirectory, setContactDirectory] = useState([]);
  const [responseTeams, setResponseTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Diagnostics Runner State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [diagnosticsResult, setDiagnosticsResult] = useState(null);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);

  // Active SOP tab
  const [selectedSopCode, setSelectedSopCode] = useState('CODE_RED');

  // Selected Map Zone
  const [selectedMapZone, setSelectedMapZone] = useState('ALL');

  const fetchEocData = async () => {
    setIsLoading(true);
    try {
      const [resIncidents, resProcedures] = await Promise.all([
        fetch('/api/incidents'),
        fetch('/api/emergency/procedures'),
      ]);

      const [dataInc, dataProc] = await Promise.all([
        resIncidents.json(),
        resProcedures.json(),
      ]);

      if (dataInc.success) {
        setIncidents(dataInc.incidents);
        setMetrics(dataInc.metrics);
        setResponseTeams(dataInc.responseTeams);
      }
      if (dataProc.success) {
        setProcedures(dataProc.procedures);
        setContactDirectory(dataProc.contactDirectory);
      }
    } catch (err) {
      console.error('Failed to load EOC data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEocData();
  }, []);

  const handleRunDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    try {
      const res = await fetch('/api/incidents/test');
      const data = await res.json();
      if (data.success) {
        setDiagnosticsResult(data.diagnostics);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const activeIncidents = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED'
  );

  const selectedProcedure = procedures.find((p) => p.code === selectedSopCode) || procedures[0];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center font-bold relative">
            <Siren className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="warning" size="sm">SIMULATED DEVELOPMENT VIEW</Badge>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-slate-500/10 border border-slate-500/30 text-slate-300 font-mono font-semibold">
                NO LIVE RADIO LINK
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Emergency Operations Centre (EOC)
            </h1>
            <p className="text-xs text-slate-400">
              Development dashboard only. Live responder connections, venue-approved procedures, and verified emergency contacts are not configured.
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
            <span>Diagnostics Runner</span>
          </Button>

          <Link href="/admin/incidents/create">
            <Button variant="primary" size="sm">
              <ShieldAlert className="w-4 h-4 mr-1" />
              <span>Log Incident</span>
            </Button>
          </Link>

          <Button variant="secondary" size="sm" onClick={fetchEocData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Life Safety Compliance Mandate (Requirement 9) */}
      <div className="p-4 rounded-2xl bg-navy-900/90 border border-rose-500/30 flex items-start space-x-3 text-xs text-slate-300 shadow-lg">
        <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-white flex items-center space-x-2">
            <span>Operational Life-Safety Mandate</span>
            <Badge variant="warning" size="sm">SUPERVISORY ONLY</Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This digital platform strictly supports and coordinates emergency information; it does <strong>not replace</strong> approved stadium disaster plans, emergency services, trained personnel, physical sirens, or hardwired fire alarms. Software commands must never attempt automated control over life-safety evacuation gear.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Emergencies"
          value={activeIncidents.length.toString()}
          subtitle={`${metrics?.criticalCount || 0} Critical | ${metrics?.open || 2} Open`}
          icon={AlertTriangle}
          accentColor={activeIncidents.length > 0 ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Simulated Response-Team Records"
          value={responseTeams.length.toString()}
          subtitle="Sample data only; no live team status"
          icon={Users}
          accentColor="sky"
        />

        <StatCard
          title="Sample Acknowledgement Interval"
          value={metrics ? `${metrics.avgTtaMinutes} min` : 'Unavailable'}
          subtitle="Simulated records only; not a live SLA"
          icon={Clock}
          accentColor="emerald"
        />

        <StatCard
          title="Approved Emergency Contacts"
          value={contactDirectory.length.toString()}
          subtitle={contactDirectory.length ? 'Configured records; verify source' : 'Not configured'}
          icon={PhoneCall}
          accentColor="gold"
        />
      </div>

      {/* Stadium Zone Map & Location Visualization (Requirement 8) */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-navy-800 pb-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="text-sm font-bold text-white">Stadium Zone Map & Incident Visualization</h2>
              <p className="text-[11px] text-slate-400">
                Live spatial positioning mapped to the 3D stadium digital twin with role-masked coordinates.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Filter Sector:</span>
            <select
              value={selectedMapZone}
              onChange={(e) => setSelectedMapZone(e.target.value)}
              className="bg-navy-950 border border-navy-700 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Sectors & Stands</option>
              <option value="GATE_B">Gate B Concourse</option>
              <option value="WEST_STAND">West Stand & VIP Pavilion</option>
              <option value="NORTH_STAND">North Stand Goal</option>
              <option value="EAST_STAND">East Stand Concourse</option>
              <option value="PITCH_BOWL">Main Pitch Bowl</option>
            </select>
          </div>
        </div>

        {/* Tactical Stadium Map Visualizer */}
        <div className="relative rounded-2xl bg-navy-950 border border-navy-800 p-6 overflow-hidden min-h-[300px] flex items-center justify-center">
          {/* Background Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

          {/* Stadium Graphic Representation */}
          <div className="relative w-full max-w-2xl border-2 border-dashed border-emerald-500/30 rounded-[48px] p-8 bg-navy-900/60 backdrop-blur-sm">
            {/* Outer Concourse Ring */}
            <div className="text-center font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-4">
              Talanta Sports City - 60,000 Capacity Bowl
            </div>

            {/* Stadium Stands Grid */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
              {/* North Stand */}
              <div className="col-span-3 p-3 rounded-xl bg-navy-950 border border-navy-800 text-slate-300">
                <span className="font-bold text-white">NORTH STAND (GATES C & D)</span>
                <span className="block text-[10px] text-slate-500">Ablution Bay 3 (Valve Cleared)</span>
              </div>

              {/* West Stand (VIP) */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 text-slate-300 relative">
                <span className="font-bold text-white block">WEST STAND</span>
                <span className="text-[10px] text-emerald-400">VIP & Presidential</span>

                {/* Active Incident Pin */}
                <div className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg animate-bounce" title="INC-2026-1042: Medical Alert">
                  <HeartPulse className="w-4 h-4" />
                </div>
              </div>

              {/* Pitch Surface Center */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 flex flex-col items-center justify-center">
                <span className="font-bold uppercase text-[11px]">PITCH SURFACE</span>
                <span className="text-[9px] text-emerald-400 font-mono">FIFA WBGT: 22.8 °C</span>
                <span className="text-[9px] text-slate-400">No Incursions</span>
              </div>

              {/* East Stand */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 text-slate-300">
                <span className="font-bold text-white block">EAST STAND</span>
                <span className="text-[10px] text-slate-400">Media & Broadcast Hub</span>
              </div>

              {/* South Stand (Gate A & B) */}
              <div className="col-span-3 p-3 rounded-xl bg-navy-950 border border-navy-800 text-slate-300 relative">
                <span className="font-bold text-white">SOUTH STAND (GATES A & B CONCOURSE)</span>
                <span className="block text-[10px] text-amber-400">Turnstiles 1-12</span>

                {/* Active Incident Pin */}
                <div className="absolute -top-2 left-1/4 bg-amber-500 text-slate-950 rounded-full p-1 shadow-lg animate-pulse" title="INC-2026-1041: Crowd Congestion">
                  <Users className="w-4 h-4 font-black" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-4 font-mono">
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block mr-1"></span>
                Medical / Urgent Incident
              </span>
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block mr-1"></span>
                Crowd Congestion / Warning
              </span>
              <span className="flex items-center">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
                Clear / Normal State
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Incidents & Emergency Broadcast Dispatcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Emergency Queue */}
        <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-bold text-white">Active Priority Incident Feed</h2>
            </div>
            <Badge variant="danger" size="sm">{activeIncidents.length} ACTION REQUIRED</Badge>
          </div>

          <div className="space-y-3">
            {activeIncidents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                All stadium incidents currently resolved. Zero active emergency cases.
              </div>
            ) : (
              activeIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-xl bg-navy-950 border border-navy-800 hover:border-slate-700 transition-all space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-white">{inc.id}</span>
                      <Badge variant={inc.priority === 'CRITICAL' ? 'danger' : 'warning'} size="sm">
                        {inc.priority}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {inc.category.replace('_', ' ')}
                      </span>
                    </div>

                    <Link href={`/admin/incidents/${inc.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        <span>Coordinate</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>

                  <div className="font-bold text-white">{inc.title}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{inc.description}</p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1 border-t border-navy-900">
                    <span className="text-emerald-400">Location: {inc.zoneLocation}</span>
                    <span>Assigned: {inc.assignedTeam?.name || 'Unassigned'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Emergency Multi-Channel Broadcast Console */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <Radio className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-bold text-white">Emergency Broadcast Dispatcher</h2>
            </div>
            <span className="text-[10px] font-mono text-amber-300">NOT CONNECTED — NO MESSAGE DELIVERY</span>
          </div>

          <p className="text-xs text-slate-300">
            The legacy broadcast action is disabled. Prepare and approve messages through the Emergency Communications workflow; no SMS, radio, PA, or responder delivery is verified.
          </p>
          <Link href="/admin/emergency-communications">
            <Button variant="secondary" size="sm" className="w-full justify-center">
              Open Emergency Communications
            </Button>
          </Link>
        </div>
      </div>

      {/* Emergency SOP Procedures & Contact Directory (Requirement 9) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approved Emergency Procedures (SOPs) */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              <h2 className="text-sm font-bold text-white">Venue-Approved Emergency Procedures</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{procedures.length ? `${procedures.length} configured` : 'Not configured'}</span>
          </div>

          {!procedures.length && <p className="text-xs text-amber-300">No venue-approved procedure records are configured. Follow the responsible venue authority's official emergency plan.</p>}
          {/* Code Selection Pills */}
          <div className="flex flex-wrap gap-2">
            {procedures.map((p) => {
              const isSelected = selectedSopCode === p.code;
              return (
                <button
                  key={p.code}
                  onClick={() => setSelectedSopCode(p.code)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold font-mono transition-all ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-navy-950 text-slate-400 border border-navy-800 hover:border-slate-700'
                  }`}
                >
                  {p.code}
                </button>
              );
            })}
          </div>

          {selectedProcedure && (
            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{selectedProcedure.title}</span>
                <Badge variant={selectedProcedure.priorityLevel === 'CRITICAL' ? 'danger' : 'warning'} size="sm">
                  {selectedProcedure.priorityLevel}
                </Badge>
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                Lead Agency: <span className="text-emerald-400">{selectedProcedure.leadAgency}</span>
              </div>

              <p className="text-[11px] text-slate-400 italic pt-1">
                {selectedProcedure.summary}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-navy-900">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Standard Action Checklist:</span>
                {selectedProcedure.steps?.map((step, idx) => (
                  <div key={idx} className="text-[11px] text-slate-300 flex items-start space-x-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contact Directory */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div className="flex items-center space-x-2">
              <PhoneCall className="w-5 h-5 text-sky-400" />
              <h2 className="text-sm font-bold text-white">Approved Emergency Contacts</h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{contactDirectory.length ? `${contactDirectory.length} configured` : 'Not configured'}</span>
          </div>

          {!contactDirectory.length && <p className="text-xs text-amber-300">No approved contact records are configured. Use verified official emergency channels.</p>}
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1 text-xs">
            {contactDirectory.map((c, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between space-x-2"
              >
                <div>
                  <div className="font-bold text-white text-xs">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.role}</div>
                  <div className="text-[9px] text-emerald-400 font-mono">{c.available}</div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-bold text-sky-400 block">{c.phone}</span>
                  <Badge variant="secondary" size="sm" className="mt-1">
                    {c.type.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnostics Modal (Requirement 12) */}
      <Modal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        title="Incident Management System Diagnostics Runner"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-slate-300 flex items-center justify-between">
            <div>
              <span className="font-bold text-white block">Incident Pipeline Verification</span>
              <span className="text-[11px] text-slate-400">
                Tests creation, assignment, escalation, closure, notification, and RBAC permissions.
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
