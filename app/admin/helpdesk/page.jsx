'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle,
  Clock,
  Cpu,
  FileText,
  Filter,
  HelpCircle,
  LifeBuoy,
  MessageSquare,
  PlusCircle,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  Wrench,
} from 'lucide-react';

const panel = 'rounded-2xl border border-navy-800 bg-navy-900 p-5';
const field = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-white';
const action = 'rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-navy-950 disabled:opacity-50 hover:bg-emerald-400';
const quietAction = 'rounded-lg border border-navy-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/50';

export default function AdminHelpdeskDashboardPage() {
  const [data, setData] = useState(null);
  const [kbArticles, setKbArticles] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [facilityId, setFacilityId] = useState('');
  const [tab, setTab] = useState('DASHBOARD');

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Ticket Modal/Form
  const [showTicketForm, setShowTicketForm] = useState(false);

  // Worklog Modal/Form
  const [selectedTicketForWorklog, setSelectedTicketForWorklog] = useState(null);

  // KB Modal/Form
  const [showKbForm, setShowKbForm] = useState(false);

  // SLA Modal/Form
  const [showSlaForm, setShowSlaForm] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (facilityId.trim()) params.set('facilityId', facilityId.trim());
    return params.toString();
  }, [facilityId]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [dashRes, kbRes] = await Promise.all([
        fetch(`/api/helpdesk/dashboard${query ? `?${query}` : ''}`, { cache: 'no-store' }),
        fetch('/api/helpdesk/knowledge', { cache: 'no-store' }),
      ]);

      const dashResult = await dashRes.json();
      const kbResult = await kbRes.json();

      if (!dashRes.ok || !dashResult.success) throw new Error(dashResult.message || 'Helpdesk dashboard unavailable.');
      setData(dashResult.dashboard);
      if (kbResult.success) setKbArticles(kbResult.articles || []);
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

  async function handleTicketSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    await send('/api/helpdesk/tickets', 'POST', {
      ...values,
      facilityId: values.facilityId || facilityId || undefined,
    }, 'Support ticket submitted.');
    form.reset();
    setShowTicketForm(false);
  }

  async function handleStatusUpdate(ticketId, newStatus) {
    let resolutionNotes;
    let escalationReason;

    if (newStatus === 'RESOLVED') {
      resolutionNotes = window.prompt('Enter resolution notes:') || '';
      if (!resolutionNotes.trim()) return;
    } else if (newStatus === 'ESCALATED') {
      escalationReason = window.prompt('Enter escalation reason:') || '';
      if (!escalationReason.trim()) return;
    }

    const techId = newStatus === 'ASSIGNED' ? window.prompt('Enter assigned technician ID or name:') || 'TECH-PRIMARY-01' : undefined;

    await send(`/api/helpdesk/tickets/${ticketId}/status`, 'PATCH', {
      status: newStatus,
      assignedTechnicianId: techId,
      assignedTechnicianName: techId ? `Technician (${techId})` : undefined,
      resolutionNotes,
      escalationReason,
      facilityId: facilityId || undefined,
    }, `Ticket status updated to ${newStatus}.`);
  }

  async function handleWorklogSubmit(event) {
    event.preventDefault();
    if (!selectedTicketForWorklog) return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    await send(`/api/helpdesk/tickets/${selectedTicketForWorklog.id}/worklog`, 'POST', {
      workSummary: values.workSummary,
      equipmentAction: values.equipmentAction,
      timeSpentMinutes: Number(values.timeSpentMinutes || 15),
      facilityId: facilityId || undefined,
    }, 'Technician work log saved.');
    form.reset();
    setSelectedTicketForWorklog(null);
  }

  async function handleKbSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    await send('/api/helpdesk/knowledge', 'POST', values, 'Technical solution article published.');
    form.reset();
    setShowKbForm(false);
  }

  async function handleSlaSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    await send('/api/helpdesk/sla', 'POST', {
      priority: values.priority,
      responseTargetHours: Number(values.responseTargetHours),
      resolutionTargetHours: Number(values.resolutionTargetHours),
    }, `SLA target configured for ${values.priority}.`);
    form.reset();
    setShowSlaForm(false);
  }

  async function triggerSlaMonitor() {
    await send(`/api/helpdesk/sla${query ? `?${query}` : ''}`, 'GET', null, 'SLA monitor evaluation executed.');
  }

  const totals = data?.totals || {};

  const filteredTickets = (data?.recentTickets || []).filter((t) => {
    const matchesCategory = !categoryFilter || t.category === categoryFilter;
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesSearch = !search || `${t.ticketNumber} ${t.title} ${t.description} ${t.equipmentInvolved || ''}`.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <header className={`${panel} flex flex-wrap items-start justify-between gap-4`}>
        <div>
          <span className="mb-2 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">ENTERPRISE MODULE · {facilityId || 'All Authorized Facilities'}</span>
          <h1 className="text-2xl font-bold text-white">IT & Stadium Operations Helpdesk</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">Integrated support ticket management, technician work logs, SLA response targets, automated escalations, and technical knowledge base solution center.</p>
        </div>
        <div className="flex gap-2">
          <button className={quietAction} disabled={busy} onClick={triggerSlaMonitor}><Clock className="mr-1.5 inline h-4 w-4" />Run SLA Check</button>
          <button className={quietAction} disabled={busy} onClick={load}><RefreshCw className={`mr-2 inline h-4 w-4 ${busy ? 'animate-spin' : ''}`} />Refresh</button>
        </div>
      </header>

      {message && <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{message}</div>}

      <section className={`${panel} grid gap-3 md:grid-cols-4`}>
        <input className={field} value={facilityId} onChange={(e) => setFacilityId(e.target.value)} placeholder="Facility ID (blank for enterprise scope)" aria-label="Facility ID" />
        <div className="md:col-span-3 flex flex-wrap gap-2">
          {['DASHBOARD', 'TICKETS', 'KNOWLEDGE_BASE', 'SLA_CONFIG'].map((t) => (
            <button
              key={t}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${tab === t ? 'bg-emerald-500 text-navy-950' : 'bg-navy-950 text-slate-300 hover:bg-navy-800'}`}
              onClick={() => setTab(t)}
            >
              {t.replaceAll('_', ' ')}
            </button>
          ))}
        </div>
      </section>

      {/* METRIC STATS SUMMARY */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className={panel}>
          <div className="flex items-center justify-between text-xs text-slate-400"><span>Open Tickets</span><LifeBuoy className="h-4 w-4 text-emerald-400" /></div>
          <div className="mt-2 text-xl font-bold text-white">{totals.openTickets || 0} <span className="text-xs font-normal text-slate-400">/ {totals.totalTickets || 0}</span></div>
        </article>
        <article className={panel}>
          <div className="flex items-center justify-between text-xs text-slate-400"><span>Overdue SLA Tickets</span><AlertTriangle className="h-4 w-4 text-rose-400" /></div>
          <div className="mt-2 text-xl font-bold text-rose-300">{totals.overdueTickets || 0}</div>
        </article>
        <article className={panel}>
          <div className="flex items-center justify-between text-xs text-slate-400"><span>Escalated Tickets</span><ShieldAlert className="h-4 w-4 text-amber-400" /></div>
          <div className="mt-2 text-xl font-bold text-amber-300">{totals.escalatedTickets || 0}</div>
        </article>
        <article className={panel}>
          <div className="flex items-center justify-between text-xs text-slate-400"><span>SLA Compliance Rate</span><CheckCircle className="h-4 w-4 text-blue-400" /></div>
          <div className="mt-2 text-xl font-bold text-blue-300">{totals.slaCompliancePercent || 100}%</div>
        </article>
        <article className={panel}>
          <div className="flex items-center justify-between text-xs text-slate-400"><span>Resolved Tickets</span><UserCheck className="h-4 w-4 text-purple-400" /></div>
          <div className="mt-2 text-xl font-bold text-purple-300">{totals.resolvedTickets || 0}</div>
        </article>
      </section>

      {/* TAB 1: DASHBOARD */}
      {tab === 'DASHBOARD' && data && (
        <div className="space-y-6">
          {data.overdueList?.length > 0 && (
            <section className={`${panel} border-rose-500/30 bg-rose-500/10`}>
              <div className="flex items-center gap-2 text-rose-300 font-semibold mb-3">
                <AlertTriangle className="h-5 w-5" />
                <h2>Overdue SLA Support Alerts</h2>
              </div>
              <div className="space-y-2 text-xs">
                {data.overdueList.map((t) => (
                  <div key={t.id} className="flex flex-wrap justify-between gap-2 border-b border-rose-500/20 pb-2 text-rose-100">
                    <div>
                      <strong className="font-mono text-amber-300">{t.ticketNumber}</strong> - {t.title} <span className="text-slate-300">({t.category})</span>
                    </div>
                    <div className="font-bold text-rose-300">
                      Target: {t.resolutionTargetHours}h | Assigned: {t.assignedTechnicianName || 'UNASSIGNED'}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-4 lg:grid-cols-3">
            <article className={panel}>
              <h2 className="font-semibold text-white mb-3">Tickets by Priority</h2>
              <div className="space-y-2 text-xs">
                {Object.entries(data.byPriority || {}).map(([p, count]) => (
                  <div key={p} className="flex justify-between border-b border-navy-800 pb-1">
                    <span className={`font-semibold ${p === 'CRITICAL' ? 'text-rose-400' : p === 'HIGH' ? 'text-amber-400' : 'text-slate-300'}`}>{p}</span>
                    <strong className="text-white">{count}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className={panel}>
              <h2 className="font-semibold text-white mb-3">Tickets by Category</h2>
              <div className="max-h-48 space-y-2 overflow-auto text-xs">
                {Object.entries(data.byCategory || {}).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between border-b border-navy-800 pb-1">
                    <span className="text-slate-300">{cat}</span>
                    <strong className="text-white">{count}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className={panel}>
              <h2 className="font-semibold text-white mb-3">Technician Workload</h2>
              <div className="max-h-48 space-y-2 overflow-auto text-xs">
                {data.byTechnician?.map(({ technician, count }) => (
                  <div key={technician} className="flex justify-between border-b border-navy-800 pb-1">
                    <span className="text-slate-300">{technician}</span>
                    <strong className="text-emerald-400">{count} tickets</strong>
                  </div>
                ))}
                {!data.byTechnician?.length && <p className="text-slate-500">No assigned technicians.</p>}
              </div>
            </article>
          </section>
        </div>
      )}

      {/* TAB 2: SUPPORT TICKET QUEUE */}
      {tab === 'TICKETS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Support Ticket Queue</h2>
            <button className={action} onClick={() => setShowTicketForm(!showTicketForm)}><PlusCircle className="mr-1 inline h-4 w-4" />Submit Support Request</button>
          </div>

          {showTicketForm && (
            <form className={`${panel} space-y-3 border-emerald-500/30`} onSubmit={handleTicketSubmit}>
              <h3 className="text-sm font-semibold text-emerald-400">Log New Technical or Stadium Operations Ticket</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <input className={field} name="facilityId" placeholder="Facility ID" />
                <select className={field} name="category" required>
                  <option value="TICKETING">Ticketing Systems</option>
                  <option value="PAYMENTS">M-PESA & Payments</option>
                  <option value="QR_SCANNING">Turnstile QR Scanners</option>
                  <option value="USER_ACCOUNTS">User Accounts & Accreditation</option>
                  <option value="NETWORK_CONNECTIVITY">Network & Wi-Fi Connectivity</option>
                  <option value="CCTV_INTEGRATIONS">CCTV & VMS Integrations</option>
                  <option value="IOT_DEVICES">IoT Sensors & Building Telemetry</option>
                  <option value="DIGITAL_SIGNAGE">Digital Signage Displays</option>
                  <option value="ACCESS_CONTROL">Physical Access Control</option>
                  <option value="HARDWARE_FAULTS">Hardware & Server Faults</option>
                  <option value="STADIUM_OPERATIONS">General Stadium Operations</option>
                </select>
                <select className={field} name="priority" required>
                  <option value="LOW">LOW Priority (48h SLA)</option>
                  <option value="MEDIUM">MEDIUM Priority (24h SLA)</option>
                  <option value="HIGH">HIGH Priority (8h SLA)</option>
                  <option value="CRITICAL">CRITICAL Priority (4h SLA)</option>
                </select>
                <input className={field} name="department" placeholder="Department (e.g. Turnstiles / IT)" />
                <input className={field} name="equipmentInvolved" placeholder="Equipment Involved (e.g. CAM-NORTH-04 / Gate B Scanner)" />
                <input className={field} name="creatorEmail" type="email" placeholder="Requester Email" />
              </div>
              <input className={field} name="title" placeholder="Ticket Title *" required />
              <textarea className={field} name="description" placeholder="Detailed Description of Technical Issue *" required />
              <button className={action} disabled={busy}>Submit Support Ticket</button>
            </form>
          )}

          {/* FILTER CONTROLS */}
          <div className={`${panel} grid gap-3 sm:grid-cols-3`}>
            <input className={field} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets, equipment, number" />
            <select className={field} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              {['TICKETING', 'PAYMENTS', 'QR_SCANNING', 'USER_ACCOUNTS', 'NETWORK_CONNECTIVITY', 'CCTV_INTEGRATIONS', 'IOT_DEVICES', 'DIGITAL_SIGNAGE', 'ACCESS_CONTROL', 'HARDWARE_FAULTS', 'STADIUM_OPERATIONS'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select className={field} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {['NEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_INFO', 'ESCALATED', 'RESOLVED', 'CLOSED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            {filteredTickets.map((t) => (
              <article key={t.id} className={panel}>
                <div className="flex flex-wrap justify-between items-start gap-2 border-b border-navy-800 pb-3">
                  <div>
                    <span className="font-mono font-bold text-emerald-400">{t.ticketNumber}</span> · <strong className="text-white">{t.title}</strong>
                    <div className="text-xs text-slate-400">Category: {t.category} · Priority: <span className={t.priority === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-slate-200'}>{t.priority}</span></div>
                  </div>
                  <div className="text-right">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-300' : t.status === 'ESCALATED' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>{t.status}</span>
                    {t.isOverdue && <div className="text-[10px] font-bold text-rose-400 mt-1">SLA OVERDUE</div>}
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-300">{t.description}</p>
                {t.equipmentInvolved && <div className="mt-1 text-xs text-blue-400 font-mono">Equipment: {t.equipmentInvolved}</div>}
                {t.assignedTechnicianName && <div className="mt-1 text-xs text-purple-300">Assigned: {t.assignedTechnicianName}</div>}

                {t.resolutionNotes && (
                  <div className="mt-2 rounded bg-navy-950 p-2 text-xs text-emerald-300 border border-emerald-500/20">
                    <strong>Resolution Notes:</strong> {t.resolutionNotes}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  {t.status === 'NEW' && <button className={quietAction} onClick={() => handleStatusUpdate(t.id, 'ASSIGNED')}>Assign Technician</button>}
                  {t.status !== 'RESOLVED' && <button className={quietAction} onClick={() => setSelectedTicketForWorklog(t)}>+ Log Work</button>}
                  {t.status !== 'ESCALATED' && t.status !== 'RESOLVED' && <button className={quietAction} onClick={() => handleStatusUpdate(t.id, 'ESCALATED')}>Escalate</button>}
                  {t.status !== 'RESOLVED' && <button className={action} onClick={() => handleStatusUpdate(t.id, 'RESOLVED')}>Resolve Ticket</button>}
                </div>
              </article>
            ))}
          </div>

          {/* WORKLOG MODAL FORM */}
          {selectedTicketForWorklog && (
            <form className={`${panel} border-purple-500/40 space-y-3`} onSubmit={handleWorklogSubmit}>
              <div className="flex justify-between items-center text-sm font-semibold text-purple-300">
                <h3>Log Technician Work Done for {selectedTicketForWorklog.ticketNumber}</h3>
                <button type="button" className={quietAction} onClick={() => setSelectedTicketForWorklog(null)}>Close</button>
              </div>
              <textarea className={field} name="workSummary" placeholder="Summary of work performed and diagnostics *" required />
              <input className={field} name="equipmentAction" placeholder="Equipment Action (e.g. Recalibrated LiDAR / Replaced Gateway Power supply)" />
              <input className={field} name="timeSpentMinutes" type="number" min="5" placeholder="Time Spent (Minutes, e.g. 30)" />
              <button className={action} disabled={busy}>Save Technician Worklog</button>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: KNOWLEDGE BASE SOLUTION CENTER */}
      {tab === 'KNOWLEDGE_BASE' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Technical Support Knowledge Base Solution Center</h2>
            <button className={action} onClick={() => setShowKbForm(!showKbForm)}><PlusCircle className="mr-1 inline h-4 w-4" />Publish Solution Article</button>
          </div>

          {showKbForm && (
            <form className={`${panel} space-y-3 border-emerald-500/30`} onSubmit={handleKbSubmit}>
              <h3 className="text-sm font-semibold text-emerald-400">Publish Technical Solution Article</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <select className={field} name="category" required>
                  <option value="TICKETING">Ticketing Systems</option>
                  <option value="PAYMENTS">M-PESA & Payments</option>
                  <option value="QR_SCANNING">Turnstile QR Scanners</option>
                  <option value="NETWORK_CONNECTIVITY">Network & Wi-Fi</option>
                  <option value="CCTV_INTEGRATIONS">CCTV & VMS</option>
                  <option value="ACCESS_CONTROL">Access Control</option>
                  <option value="GENERAL">General Technical</option>
                </select>
                <input className={field} name="title" placeholder="Article Title *" required />
              </div>
              <input className={field} name="summary" placeholder="Brief Summary *" required />
              <textarea className={field} name="solutionBody" placeholder="Step-by-Step Technical Solution Body *" required />
              <input className={field} name="tags" placeholder="Tags (comma-separated, e.g. scanner, haptic, offline)" />
              <button className={action} disabled={busy}>Publish Article</button>
            </form>
          )}

          <div className="space-y-3">
            {kbArticles.map((kb) => (
              <article key={kb.id} className={panel}>
                <div className="flex justify-between items-start text-xs border-b border-navy-800 pb-2">
                  <div>
                    <span className="font-mono text-purple-400 font-bold">{kb.articleRef}</span> · <strong className="text-white">{kb.title}</strong>
                    <div className="text-slate-400">Category: {kb.category} · Views: {kb.viewCount}</div>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-200">{kb.summary}</p>
                <div className="mt-2 text-xs text-slate-300 font-mono bg-navy-950 p-3 rounded whitespace-pre-wrap">{kb.solutionBody}</div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SLA TARGET CONFIGURATION */}
      {tab === 'SLA_CONFIG' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Service Level Agreement (SLA) Target Configurations</h2>
            <button className={action} onClick={() => setShowSlaForm(!showSlaForm)}><PlusCircle className="mr-1 inline h-4 w-4" />Configure SLA Targets</button>
          </div>

          {showSlaForm && (
            <form className={`${panel} space-y-3 border-emerald-500/30`} onSubmit={handleSlaSubmit}>
              <h3 className="text-sm font-semibold text-emerald-400">Set SLA Targets per Priority</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <select className={field} name="priority" required>
                  <option value="CRITICAL">CRITICAL Priority</option>
                  <option value="HIGH">HIGH Priority</option>
                  <option value="MEDIUM">MEDIUM Priority</option>
                  <option value="LOW">LOW Priority</option>
                </select>
                <input className={field} name="responseTargetHours" type="number" min="1" placeholder="First Response Target (Hours) *" required />
                <input className={field} name="resolutionTargetHours" type="number" min="1" placeholder="Resolution Target (Hours) *" required />
              </div>
              <button className={action} disabled={busy}>Save SLA Targets</button>
            </form>
          )}

          <div className={`${panel} space-y-3`}>
            <h3 className="font-semibold text-white text-sm">Default SLA Target Matrix</h3>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-xs">
              <div className="bg-navy-950 p-3 rounded border border-rose-500/30">
                <div className="font-bold text-rose-400">CRITICAL</div>
                <div className="mt-1">Response: 1h | Resolution: 4h</div>
              </div>
              <div className="bg-navy-950 p-3 rounded border border-amber-500/30">
                <div className="font-bold text-amber-400">HIGH</div>
                <div className="mt-1">Response: 2h | Resolution: 8h</div>
              </div>
              <div className="bg-navy-950 p-3 rounded border border-blue-500/30">
                <div className="font-bold text-blue-400">MEDIUM</div>
                <div className="mt-1">Response: 4h | Resolution: 24h</div>
              </div>
              <div className="bg-navy-950 p-3 rounded border border-slate-500/30">
                <div className="font-bold text-slate-300">LOW</div>
                <div className="mt-1">Response: 8h | Resolution: 48h</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
