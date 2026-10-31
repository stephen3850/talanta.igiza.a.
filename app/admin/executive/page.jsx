'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Building,
  CheckCircle2,
  Clock,
  Cpu,
  CreditCard,
  Download,
  FileCheck,
  FileText,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  PlusCircle,
  RefreshCw,
  Settings,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  Wifi,
  Wrench,
  XCircle,
} from 'lucide-react';

const panel = 'rounded-2xl border border-navy-800 bg-navy-900 p-5';
const field = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-white';
const action = 'rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-navy-950 disabled:opacity-50 hover:bg-emerald-400';
const quietAction = 'rounded-lg border border-navy-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/50';
const money = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(Number(amount || 0));

export default function AdminExecutiveDashboardPage() {
  const [data, setData] = useState(null);
  const [comparisons, setComparisons] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [facilityId, setFacilityId] = useState('');
  const [reportingPeriod, setReportingPeriod] = useState('LAST_30_DAYS');
  const [showKpiForm, setShowKpiForm] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (facilityId.trim()) params.set('facilityId', facilityId.trim());
    params.set('reportingPeriod', reportingPeriod);
    return params.toString();
  }, [facilityId, reportingPeriod]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [dashRes, compRes] = await Promise.all([
        fetch(`/api/executive/dashboard?${query}`, { cache: 'no-store' }),
        fetch(`/api/executive/comparison?${query}`, { cache: 'no-store' }),
      ]);

      const dashResult = await dashRes.json();
      const compResult = await compRes.json();

      if (!dashRes.ok || !dashResult.success) throw new Error(dashResult.message || 'Executive dashboard unavailable.');
      setData(dashResult.dashboard);
      if (compResult.success) setComparisons(compResult.comparisons || []);
      setMessage('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(endpoint, method, body, successMsg) {
    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Operation failed.');
      setMessage(result.message || successMsg);
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleKpiSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    await send('/api/executive/kpis', 'POST', {
      kpiKey: values.kpiKey,
      label: values.label,
      targetValue: Number(values.targetValue),
      unit: values.unit || '%',
      category: values.category || 'OPERATIONAL',
    }, `KPI target configured for ${values.kpiKey}.`);
    form.reset();
    setShowKpiForm(false);
  }

  const facts = data?.measuredFacts || {};

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className={`${panel} flex flex-wrap items-start justify-between gap-4 border-amber-500/30`}>
        <div>
          <span className="mb-2 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-300">EXECUTIVE BRIEFING · ST-TECH ICT CONSULTANTS</span>
          <h1 className="text-2xl font-bold text-white">Talanta Stadium Executive Intelligence & Performance</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">Unified leadership view of stadium operational, financial, technical, and service performance across all 14 infrastructure sub-modules.</p>
        </div>
        <div className="flex gap-2">
          <a className={quietAction} href={`/api/executive/export?${query}&format=download`} target="_blank" rel="noreferrer"><Download className="mr-1.5 inline h-4 w-4" />Export Executive Briefing</a>
          <button className={quietAction} disabled={busy} onClick={load}><RefreshCw className={`mr-2 inline h-4 w-4 ${busy ? 'animate-spin' : ''}`} />Refresh</button>
        </div>
      </header>

      {message && <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{message}</div>}

      {/* FILTER CONTROLS */}
      <section className={`${panel} grid gap-3 md:grid-cols-3`}>
        <input className={field} value={facilityId} onChange={(e) => setFacilityId(e.target.value)} placeholder="Facility Scope (blank for enterprise full view)" />
        <select className={field} value={reportingPeriod} onChange={(e) => setReportingPeriod(e.target.value)}>
          <option value="LAST_7_DAYS">Last 7 Days</option>
          <option value="LAST_30_DAYS">Last 30 Days</option>
          <option value="YEAR_TO_DATE">Year to Date (YTD)</option>
        </select>
        <button className={action} onClick={load} disabled={busy}>Apply Scope & Filters</button>
      </section>

      {/* SECTION 1: MEASURED OPERATIONAL & FINANCIAL FACTS */}
      {data && (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              1. Measured Operational & Financial Facts (Verified Database Totals)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article className={panel}>
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Gross Ticket Sales</span><CreditCard className="h-4 w-4 text-emerald-400" /></div>
                <div className="mt-2 text-2xl font-bold text-white">{money(facts.grossTicketRevenue)}</div>
                <div className="mt-1 text-[11px] text-slate-400">{facts.totalTicketsSold?.toLocaleString()} tickets issued</div>
              </article>

              <article className={panel}>
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Gate Turnstile Scans</span><Activity className="h-4 w-4 text-blue-400" /></div>
                <div className="mt-2 text-2xl font-bold text-white">{facts.totalGateScans?.toLocaleString()}</div>
                <div className="mt-1 text-[11px] text-slate-400">Verified entry throughput</div>
              </article>

              <article className={panel}>
                <div className="flex items-center justify-between text-xs text-slate-400"><span>M-PESA Reconciliation</span><FileCheck className="h-4 w-4 text-purple-400" /></div>
                <div className="mt-2 text-2xl font-bold text-white">{facts.paymentReconciliationRate}%</div>
                <div className="mt-1 text-[11px] text-purple-300">{facts.reconciledPaymentsCount} payments matched</div>
              </article>

              <article className={panel}>
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Equipment Availability</span><Wrench className="h-4 w-4 text-amber-400" /></div>
                <div className="mt-2 text-2xl font-bold text-white">{facts.equipmentAvailabilityRate}%</div>
                <div className="mt-1 text-[11px] text-slate-400">{facts.operationalAssetsCount} / {facts.totalHardwareAssets} assets healthy</div>
              </article>

              <article className={panel}>
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Network & IoT Uptime</span><Wifi className="h-4 w-4 text-cyan-400" /></div>
                <div className="mt-2 text-2xl font-bold text-white">{facts.networkAvailabilityRate}%</div>
                <div className="mt-1 text-[11px] text-slate-400">{facts.onlineIotDevicesCount} / {facts.totalIotDevices} online</div>
              </article>

              <article className={panel}>
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Helpdesk SLA Compliance</span><LifeBuoy className="h-4 w-4 text-indigo-400" /></div>
                <div className="mt-2 text-2xl font-bold text-white">{facts.helpdeskSlaCompliance}%</div>
                <div className="mt-1 text-[11px] text-slate-400">{facts.totalHelpdeskTickets} support tickets</div>
              </article>

              <article className={panel}>
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Active Incidents</span><ShieldAlert className="h-4 w-4 text-rose-400" /></div>
                <div className="mt-2 text-2xl font-bold text-rose-300">{facts.openIncidentsCount}</div>
                <div className="mt-1 text-[11px] text-slate-400">Open security incidents</div>
              </article>

              <article className={panel}>
                <div className="flex items-center justify-between text-xs text-slate-400"><span>Pending Procurement</span><TrendingUp className="h-4 w-4 text-amber-400" /></div>
                <div className="mt-2 text-2xl font-bold text-white">{money(facts.pendingProcurementValue)}</div>
                <div className="mt-1 text-[11px] text-amber-300">{facts.expiringContractsCount} expiring contracts</div>
              </article>
            </div>
          </section>

          {/* SECTION 2: KEY PERFORMANCE INDICATORS SCORECARD */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                2. Key Performance Indicators Scorecard
              </h2>
              <button className={quietAction} onClick={() => setShowKpiForm(!showKpiForm)}><Settings className="mr-1 inline h-3.5 w-3.5" />Configure KPI Target</button>
            </div>

            {showKpiForm && (
              <form className={`${panel} space-y-3 border-blue-500/30`} onSubmit={handleKpiSubmit}>
                <h3 className="text-sm font-semibold text-blue-400">Configure Custom Executive KPI Target Threshold</h3>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <select className={field} name="kpiKey" required>
                    <option value="STADIUM_OCCUPANCY_RATE">Attendance Occupancy Rate</option>
                    <option value="PAYMENT_RECONCILIATION_RATE">Payment Reconciliation Rate</option>
                    <option value="EQUIPMENT_AVAILABILITY_RATE">Equipment Availability Rate</option>
                    <option value="NETWORK_UPTIME_RATE">Network Uptime Rate</option>
                    <option value="HELPDESK_SLA_COMPLIANCE">Helpdesk SLA Compliance</option>
                    <option value="GATE_SCAN_VELOCITY">Gate Scan Velocity</option>
                  </select>
                  <input className={field} name="label" placeholder="Custom Label (Optional)" />
                  <input className={field} name="targetValue" type="number" step="0.1" placeholder="Target Value *" required />
                  <input className={field} name="unit" placeholder="Unit (e.g. % or scans/min)" />
                </div>
                <button className={action} disabled={busy}>Save KPI Target Threshold</button>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase text-slate-500 border-b border-navy-800">
                  <tr><th className="p-3">KPI Indicator</th><th className="p-3">Actual Measured Value</th><th className="p-3">Configured Target</th><th className="p-3">Target Assessment</th></tr>
                </thead>
                <tbody>
                  {data.kpiScorecard?.map((k) => (
                    <tr key={k.kpiKey} className="border-b border-navy-800">
                      <td className="p-3 font-semibold text-white">{k.label}</td>
                      <td className="p-3 font-bold text-lg text-emerald-300">{k.actualValue} {k.unit}</td>
                      <td className="p-3 font-mono text-slate-400">{k.targetValue} {k.unit}</td>
                      <td className="p-3">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${k.status === 'TARGET_MET' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                          {k.status === 'TARGET_MET' ? 'TARGET MET' : 'BELOW TARGET'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 3: AI-ASSISTED INSIGHTS & STRICT DATA ATTRIBUTION */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              3. AI-Assisted Insights & Analytical Advisories (Strictly Classified)
            </h2>
            <div className="space-y-3">
              {data.classifiedAiInsights?.map((ins) => (
                <article key={ins.id} className={panel}>
                  <div className="flex flex-wrap justify-between items-start gap-2 border-b border-navy-800 pb-2">
                    <div>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold mr-2 ${
                        ins.classification === 'MEASURED_FACT' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        ins.classification === 'FORECAST' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}>
                        [{ins.classification}]
                      </span>
                      <strong className="text-white text-sm">{ins.title}</strong>
                      <span className="text-xs text-slate-400 ml-2">({ins.category})</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-200">{ins.summary}</p>
                  <div className="mt-1 text-[11px] text-slate-400 font-mono">
                    <strong>Supporting Evidence:</strong> {ins.supportingData}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* SECTION 4: HISTORICAL EVENT COMPARISONS */}
          {comparisons.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                4. Historical Event Performance Comparison
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-slate-500 border-b border-navy-800">
                    <tr><th className="p-3">Matchday Event</th><th className="p-3">Category</th><th className="p-3">Tickets Sold</th><th className="p-3">Occupancy %</th><th className="p-3">Gross Revenue</th></tr>
                  </thead>
                  <tbody>
                    {comparisons.map((c) => (
                      <tr key={c.eventId} className="border-b border-navy-800">
                        <td className="p-3 font-semibold text-white">{c.title}</td>
                        <td className="p-3">{c.category}</td>
                        <td className="p-3 font-mono">{c.ticketsSold.toLocaleString()}</td>
                        <td className="p-3 font-bold text-emerald-400">{c.occupancyPercentage}%</td>
                        <td className="p-3 font-bold">{money(c.grossRevenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
