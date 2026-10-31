'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity, AlertOctagon, AlertTriangle, CheckCheck, ClipboardList, RefreshCw, Shield,
} from 'lucide-react';

const panelClass = 'rounded-2xl border border-navy-800 bg-navy-900 shadow-xl';
const inputClass = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none';
const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const roles = ['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD'];

function Severity({ value, simulated }) {
  const tone = simulated
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    : value === 'CRITICAL'
      ? 'border-red-500/30 bg-red-500/10 text-red-300'
      : value === 'HIGH'
        ? 'border-orange-500/30 bg-orange-500/10 text-orange-300'
        : value === 'MEDIUM'
          ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
          : 'border-slate-600 bg-slate-700/40 text-slate-300';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${tone}`}>{simulated ? `${value} · SIMULATED` : value}</span>;
}

export default function SecurityOperationsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [policy, setPolicy] = useState(null);
  const [siemForm, setSiemForm] = useState({ providerName: '', protocol: 'HTTPS_API', endpointUrl: '', secretReference: '' });
  const [incidentForm, setIncidentForm] = useState({ alertId: '', title: '', summary: '', severity: 'MEDIUM', assignedToId: '' });
  const [noteInputs, setNoteInputs] = useState({});
  const [incidentUpdates, setIncidentUpdates] = useState({});
  const [filters, setFilters] = useState({ source: 'ALL', severity: 'ALL' });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/security-operations/dashboard', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'SOC dashboard is unavailable.');
      setDashboard(result.dashboard);
      setRole(result.currentUser?.role || '');
      setPolicy(result.dashboard.policy);
    } catch (loadError) { setError(loadError.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  async function request(path, method = 'POST', body) {
    const response = await fetch(path, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Request failed.');
    return result;
  }

  async function act(operation, successMessage) {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await operation();
      setNotice(result.message || successMessage);
      await loadDashboard();
    } catch (actionError) { setError(actionError.message); }
    finally { setSaving(false); }
  }

  async function submitIncident(event) {
    event.preventDefault();
    await act(() => request('/api/security-operations/incidents', 'POST', incidentForm), 'Security incident opened.');
    setIncidentForm({ alertId: '', title: '', summary: '', severity: 'MEDIUM', assignedToId: '' });
  }

  async function submitSiem(event) {
    event.preventDefault();
    await act(() => request('/api/security-operations/siem', 'POST', siemForm), 'SIEM metadata registered.');
    setSiemForm({ providerName: '', protocol: 'HTTPS_API', endpointUrl: '', secretReference: '' });
  }

  async function savePolicy(event) {
    event.preventDefault();
    await act(() => request('/api/security-operations/policy', 'PATCH', policy), 'Alert policy updated.');
  }

  async function updateIncident(incident) {
    const update = incidentUpdates[incident.id] || { status: incident.status, resolution: incident.resolution || '', assignedToId: incident.assignedToId || '' };
    await act(() => request(`/api/security-operations/incidents/${encodeURIComponent(incident.id)}`, 'PATCH', update), 'Incident updated.');
  }

  async function addNote(incident) {
    const note = noteInputs[incident.id] || '';
    if (!note.trim()) return;
    await act(() => request(`/api/security-operations/incidents/${encodeURIComponent(incident.id)}/notes`, 'POST', { note }), 'Investigation note added.');
    setNoteInputs((current) => ({ ...current, [incident.id]: '' }));
  }

  const canManage = ['SYSTEM_ADMIN', 'VENUE_MANAGER'].includes(role);
  const metrics = dashboard?.metrics || {};
  const events = (dashboard?.events || []).filter((event) =>
    (filters.source === 'ALL' || event.source === filters.source) &&
    (filters.severity === 'ALL' || event.severity === filters.severity));
  const alerts = dashboard?.alerts || [];
  const incidents = dashboard?.incidents || [];

  return (
    <div className="space-y-6">
      <header className={`${panelClass} flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><Shield className="h-3.5 w-3.5" /> Cybersecurity operations centre</div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Security monitoring & investigations</h1>
          <p className="mt-1 text-xs text-slate-400">Centralized defensive event visibility, alert triage, and human-managed incident response.</p>
        </div>
        <button type="button" onClick={loadDashboard} className="inline-flex items-center gap-2 self-start rounded-xl border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-slate-200 hover:border-emerald-500/50 lg:self-auto"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh</button>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">{notice}</div>}
      {dashboard && <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-100"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>{dashboard.adapter.mode === 'SIMULATED_DEVELOPMENT' ? 'SIMULATED DEVELOPMENT TELEMETRY.' : 'PARTIAL SECURITY FEEDS.'}</strong> No active scanning, account disabling, automated network isolation, or other containment is performed. SIEM records are configuration metadata only until a separately approved adapter is implemented. Some source systems remain simulated or disconnected.</p></div>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ['Security events · 24h', metrics.eventsLast24h ?? 0, 'Sanitized feed'],
          ['Active alerts', metrics.activeAlerts ?? 0, 'Requires human triage'],
          ['Open incidents', metrics.openIncidents ?? 0, 'Investigation workflow'],
          ['Auth events · 24h', metrics.authenticationEventsLast24h ?? 0, 'Success/failure event count'],
          ['Critical alerts', metrics.unresolvedCritical ?? 0, 'Priority response'],
        ].map(([label, value, helper]) => <div key={label} className={`${panelClass} p-4`}><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-2xl font-bold text-white">{value}</p><p className="mt-1 text-[10px] text-slate-500">{helper}</p></div>)}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className={`${panelClass} p-5 xl:col-span-2`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><Activity className="h-4 w-4 text-sky-400" /> Connected security sources</h2>
          <p className="mb-4 text-[11px] text-slate-400">Source health is not proof of complete coverage; missing adapters are identified explicitly.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {(dashboard?.systems || []).map((system) => <article key={system.source} className="rounded-xl border border-navy-800 bg-navy-950 p-3"><div className="flex items-center justify-between gap-2"><h3 className="text-[10px] font-bold text-white">{system.source.replaceAll('_', ' ')}</h3><span className={`rounded-full border px-2 py-1 text-[9px] font-bold ${system.status.includes('SIMULATED') ? 'border-amber-500/30 text-amber-300' : 'border-sky-500/30 text-sky-300'}`}>{system.status}</span></div><p className="mt-2 text-[10px] leading-relaxed text-slate-500">{system.detail}</p></article>)}
          </div>
        </section>
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><AlertOctagon className="h-4 w-4 text-red-400" /> Incident severity</h2>
          <p className="mb-4 text-[11px] text-slate-400">Unresolved investigation cases.</p>
          <div className="space-y-2">{severities.map((severity) => <div key={severity} className="flex items-center justify-between rounded-lg border border-navy-800 bg-navy-950 p-3"><Severity value={severity} /><strong className="text-sm text-white">{dashboard?.severityCounts?.[severity] ?? 0}</strong></div>)}</div>
        </section>
      </div>

      <section className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-navy-800 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="flex items-center gap-2 font-bold text-white"><AlertTriangle className="h-4 w-4 text-amber-400" /> Security alerts</h2><p className="mt-1 text-[11px] text-slate-400">Threshold-based detections; acknowledge or open an investigation with an authorized human.</p></div>
          <span className="text-[10px] text-slate-500">{alerts.length} active</span>
        </div>
        <div className="divide-y divide-navy-800/70">
          {alerts.map((alert) => <article key={alert.id} className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><strong className="text-xs text-white">{alert.title}</strong><Severity value={alert.severity} simulated={alert.isSimulated} /></div><p className="mt-1 text-[10px] text-slate-400">{alert.description}</p><p className="mt-1 text-[10px] text-slate-500">{alert.ruleKey} · {alert.occurrenceCount} events · Last seen {new Date(alert.lastSeenAt).toLocaleString()}</p></div>{canManage && alert.status === 'ACTIVE' && <button disabled={saving} onClick={() => act(() => request(`/api/security-operations/alerts/${encodeURIComponent(alert.id)}/acknowledge`), 'Alert acknowledged.')} className="inline-flex items-center gap-1 self-start rounded-lg border border-sky-500/30 px-3 py-2 text-[10px] font-bold text-sky-200 disabled:opacity-50"><CheckCheck className="h-3 w-3" /> Acknowledge</button>}</article>)}
          {!alerts.length && <p className="p-8 text-center text-xs text-slate-500">No active alerts.</p>}
        </div>
      </section>

      <section className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-navy-800 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="flex items-center gap-2 font-bold text-white"><Activity className="h-4 w-4 text-sky-400" /> Central security events</h2><p className="mt-1 text-[11px] text-slate-400">Authentication, admin audit, ticket/payment metadata, API status, network, IoT and access-control sources.</p></div>
          <div className="flex gap-2"><select aria-label="Filter event source" className={`${inputClass} w-44`} value={filters.source} onChange={(event) => setFilters({ ...filters, source: event.target.value })}><option value="ALL">All sources</option>{['AUTHENTICATION', 'ADMIN_ACTIVITY', 'TICKETING_PAYMENTS', 'API_INTEGRATIONS', 'NETWORK_MONITORING', 'IOT_DEVICES', 'ACCESS_CONTROL', 'APPLICATION_INFRASTRUCTURE'].map((source) => <option key={source} value={source}>{source.replaceAll('_', ' ')}</option>)}</select><select aria-label="Filter event severity" className={`${inputClass} w-32`} value={filters.severity} onChange={(event) => setFilters({ ...filters, severity: event.target.value })}><option value="ALL">All severities</option>{severities.map((severity) => <option key={severity}>{severity}</option>)}</select></div>
        </div>
        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[760px] text-left text-xs"><thead className="sticky top-0 bg-navy-950 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="p-3">Time</th><th className="p-3">Source / type</th><th className="p-3">Severity</th><th className="p-3">Event summary</th><th className="p-3">Reference</th></tr></thead><tbody className="divide-y divide-navy-800/70 text-slate-300">{events.map((event) => <tr key={event.eventRef}><td className="p-3 whitespace-nowrap">{new Date(event.occurredAt).toLocaleString()}</td><td className="p-3">{event.source.replaceAll('_', ' ')}<div className="mt-1 text-[10px] text-slate-500">{event.eventType.replaceAll('_', ' ')}</div></td><td className="p-3"><Severity value={event.severity} simulated={event.isSimulated} /></td><td className="max-w-md p-3">{event.summary}{event.subjectHash && <div className="mt-1 font-mono text-[9px] text-slate-500">keyed reference {event.subjectHash}</div>}</td><td className="p-3 font-mono text-[10px]">{event.eventRef}</td></tr>)}{!events.length && <tr><td colSpan="5" className="p-8 text-center text-slate-500">No events match these filters.</td></tr>}</tbody></table>
        </div>
      </section>

      {canManage && <section className={`${panelClass} p-5`}>
        <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><ClipboardList className="h-4 w-4 text-emerald-400" /> Open a security investigation</h2><p className="mb-4 text-[11px] text-slate-400">Human-managed incident record; no automated containment or account/network changes occur.</p>
        <form className="grid gap-3 lg:grid-cols-3" onSubmit={submitIncident}>
          <select className={inputClass} value={incidentForm.alertId} onChange={(event) => setIncidentForm({ ...incidentForm, alertId: event.target.value })}><option value="">No linked alert</option>{alerts.map((alert) => <option key={alert.id} value={alert.id}>{alert.alertRef} · {alert.title}</option>)}</select>
          <input required aria-label="Incident title" className={inputClass} placeholder="Investigation title" value={incidentForm.title} onChange={(event) => setIncidentForm({ ...incidentForm, title: event.target.value })} />
          <select className={inputClass} value={incidentForm.severity} onChange={(event) => setIncidentForm({ ...incidentForm, severity: event.target.value })}>{severities.map((severity) => <option key={severity}>{severity}</option>)}</select>
          <input aria-label="Assignee user ID" className={inputClass} placeholder="Authorized assignee user ID (optional)" value={incidentForm.assignedToId} onChange={(event) => setIncidentForm({ ...incidentForm, assignedToId: event.target.value })} />
          <textarea required aria-label="Incident summary" className={`${inputClass} min-h-20 lg:col-span-2`} placeholder="Initial triage summary; exclude passwords, payment secrets and unnecessary personal data." value={incidentForm.summary} onChange={(event) => setIncidentForm({ ...incidentForm, summary: event.target.value })} />
          <button disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Create investigation</button>
        </form>
      </section>}

      <section className={`${panelClass} overflow-hidden`}>
        <div className="border-b border-navy-800 p-5"><h2 className="flex items-center gap-2 font-bold text-white"><ClipboardList className="h-4 w-4 text-emerald-400" /> Security incident investigations</h2><p className="mt-1 text-[11px] text-slate-400">Authorized operators record assignments, notes, status changes, and resolutions.</p></div>
        <div className="divide-y divide-navy-800/70">
          {incidents.map((incident) => {
            const update = incidentUpdates[incident.id] || { status: incident.status, resolution: incident.resolution || '', assignedToId: incident.assignedToId || '' };
            return <article key={incident.id} className="space-y-3 p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-white">{incident.title}</h3><Severity value={incident.severity} simulated={incident.isSimulated} /></div><p className="mt-1 text-[10px] text-slate-500">{incident.incidentRef} · Created by {incident.createdByEmail} · Assigned to {incident.assignedToEmail || 'Unassigned'}</p></div><span className="rounded-full border border-slate-700 px-2.5 py-1 text-[10px] font-bold text-slate-300">{incident.status}</span></div>
              <p className="whitespace-pre-wrap text-xs text-slate-300">{incident.summary}</p>
              <div className="space-y-2 border-l border-navy-700 pl-3">{(incident.notes || []).map((note) => <p key={note.id} className="text-[10px] text-slate-400">{new Date(note.createdAt).toLocaleString()} · {note.authorEmail} ({note.authorRole}): {note.note}</p>)}{!incident.notes?.length && <p className="text-[10px] text-slate-500">No investigation notes.</p>}</div>
              {canManage && <div className="grid gap-2 lg:grid-cols-4">
                <select className={inputClass} value={update.status} onChange={(event) => setIncidentUpdates({ ...incidentUpdates, [incident.id]: { ...update, status: event.target.value } })}>{['OPEN', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'CLOSED'].map((status) => <option key={status}>{status}</option>)}</select>
                <input aria-label="Assignee user ID" className={inputClass} placeholder="Authorized assignee user ID" value={update.assignedToId} onChange={(event) => setIncidentUpdates({ ...incidentUpdates, [incident.id]: { ...update, assignedToId: event.target.value } })} />
                <input aria-label="Resolution summary" className={inputClass} placeholder="Required when resolving" value={update.resolution} onChange={(event) => setIncidentUpdates({ ...incidentUpdates, [incident.id]: { ...update, resolution: event.target.value } })} />
                <button disabled={saving} onClick={() => updateIncident(incident)} className="rounded-lg border border-sky-500/30 px-3 py-2 text-[10px] font-bold text-sky-200 disabled:opacity-50">Save status / assignment</button>
                <textarea aria-label="Investigation note" className={`${inputClass} min-h-14 lg:col-span-3`} placeholder="Investigation note; keep sensitive data out of notes" value={noteInputs[incident.id] || ''} onChange={(event) => setNoteInputs({ ...noteInputs, [incident.id]: event.target.value })} />
                <button disabled={saving || !(noteInputs[incident.id] || '').trim()} onClick={() => addNote(incident)} className="rounded-lg border border-emerald-500/30 px-3 py-2 text-[10px] font-bold text-emerald-200 disabled:opacity-50">Add investigation note</button>
              </div>}
            </article>;
          })}
          {!incidents.length && <p className="p-8 text-center text-xs text-slate-500">No security investigations are open.</p>}
        </div>
      </section>

      {canManage && <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 font-bold text-white">Configure detection thresholds</h2><p className="mb-4 text-[11px] text-slate-400">Rules only raise alerts. They do not disable accounts, block traffic, or isolate devices.</p>
          <form onSubmit={savePolicy} className="grid gap-3 sm:grid-cols-2">
            <label className="text-[10px] text-slate-400">Failed-login count<input required type="number" min="3" max="100" className={`${inputClass} mt-1`} value={policy?.failedLoginThreshold ?? 5} onChange={(event) => setPolicy({ ...policy, failedLoginThreshold: Number(event.target.value) })} /></label>
            <label className="text-[10px] text-slate-400">Failed-login window (minutes)<input required type="number" min="1" max="120" className={`${inputClass} mt-1`} value={policy?.failedLoginWindowMinutes ?? 15} onChange={(event) => setPolicy({ ...policy, failedLoginWindowMinutes: Number(event.target.value) })} /></label>
            <label className="text-[10px] text-slate-400">API errors before alert<input required type="number" min="3" max="500" className={`${inputClass} mt-1`} value={policy?.apiErrorThreshold ?? 10} onChange={(event) => setPolicy({ ...policy, apiErrorThreshold: Number(event.target.value) })} /></label>
            <label className="text-[10px] text-slate-400">API error window (minutes)<input required type="number" min="1" max="60" className={`${inputClass} mt-1`} value={policy?.apiErrorWindowMinutes ?? 5} onChange={(event) => setPolicy({ ...policy, apiErrorWindowMinutes: Number(event.target.value) })} /></label>
            <button disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50 sm:col-span-2">Save detection thresholds</button>
          </form>
        </section>
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 font-bold text-white">SIEM integration metadata</h2><p className="mb-4 text-[11px] text-slate-400">HTTPS/TLS endpoint and secret-manager reference only. Event forwarding is not implemented; status stays UNVERIFIED.</p>
          <form onSubmit={submitSiem} className="space-y-3">
            <input required aria-label="SIEM provider" className={inputClass} placeholder="Approved SIEM / provider name" value={siemForm.providerName} onChange={(event) => setSiemForm({ ...siemForm, providerName: event.target.value })} />
            <select className={inputClass} value={siemForm.protocol} onChange={(event) => setSiemForm({ ...siemForm, protocol: event.target.value })}>{['HTTPS_API', 'SYSLOG_TLS', 'CEF_TLS', 'LEEF_TLS'].map((protocol) => <option key={protocol}>{protocol}</option>)}</select>
            <input required aria-label="SIEM endpoint URL" className={inputClass} placeholder="https://siem.example/ingest" value={siemForm.endpointUrl} onChange={(event) => setSiemForm({ ...siemForm, endpointUrl: event.target.value })} />
            <input aria-label="SIEM secret reference" className={inputClass} placeholder="Secret-manager reference (not a credential)" value={siemForm.secretReference} onChange={(event) => setSiemForm({ ...siemForm, secretReference: event.target.value })} />
            <button disabled={saving} className="rounded-lg border border-sky-500/30 px-4 py-2 text-xs font-bold text-sky-200 disabled:opacity-50">Save unverified metadata</button>
          </form>
          <div className="mt-4 space-y-2">{(dashboard?.siemIntegrations || []).map((integration) => <div key={integration.id} className="flex justify-between rounded-lg border border-navy-800 bg-navy-950 p-3 text-[10px] text-slate-300"><span>{integration.providerName} · {integration.protocol}</span><span>{integration.connectionStatus}{integration.isSimulated ? ' · SIMULATED' : ''}</span></div>)}{!dashboard?.siemIntegrations?.length && <p className="text-[10px] text-slate-500">No SIEM integration metadata registered.</p>}</div>
        </section>
      </div>}
      <p className="rounded-xl border border-navy-800 bg-navy-950 p-4 text-[10px] leading-relaxed text-slate-400">Security monitoring is defensive and observation-only. This console does not run vulnerability scans, penetration tests, account lockouts, firewall changes, network isolation, or automatic containment. Treat simulations as test data; verify each producer’s identity, timestamps, completeness and retention before operational reliance.</p>
    </div>
  );
}
