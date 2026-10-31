'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle, CalendarClock, CheckCircle2, Clock3, Megaphone, Plus, RefreshCw, ShieldCheck,
  Tv, Volume2, XCircle,
} from 'lucide-react';

const categories = ['OPERATIONAL', 'EVENT', 'SAFETY', 'EMERGENCY'];
const channels = ['PUBLIC_ADDRESS', 'DIGITAL_SIGNAGE', 'PA_AND_SIGNAGE'];
const inputClass = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none';
const panelClass = 'rounded-2xl border border-navy-800 bg-navy-900 shadow-xl';

function Status({ value, simulated }) {
  const tone = simulated
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    : value === 'APPROVED' || value === 'PUBLISHED'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : value === 'CANCELLED'
        ? 'border-slate-600 bg-slate-700/40 text-slate-300'
        : value === 'PENDING_APPROVAL'
          ? 'border-sky-500/30 bg-sky-500/10 text-sky-300'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-300';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${tone}`}>{simulated ? `${value} · SIMULATED` : value?.replaceAll('_', ' ')}</span>;
}

export default function EmergencyCommunicationsPage() {
  const [dashboard, setDashboard] = useState(null);
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ title: '', body: '', category: 'OPERATIONAL', priority: 'NORMAL', channel: 'PUBLIC_ADDRESS', incidentReference: '', templateId: '' });
  const [scheduleTimes, setScheduleTimes] = useState({});
  const [integrationForm, setIntegrationForm] = useState({ systemType: 'PUBLIC_ADDRESS', providerName: '', protocol: 'VENDOR_API_HTTPS', endpointUrl: '', secretReference: '' });
  const [templateForm, setTemplateForm] = useState({ templateKey: '', name: '', category: 'SAFETY', channel: 'PA_AND_SIGNAGE', titleTemplate: '', bodyTemplate: '' });
  const [operatorRoles, setOperatorRoles] = useState([]);
  const [supervisorRoles, setSupervisorRoles] = useState([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/emergency-communications/dashboard', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Communications dashboard is unavailable.');
      setDashboard(result.dashboard);
      setRole(result.role || '');
      setUserId(result.userId || '');
      setOperatorRoles(result.dashboard.policy.operatorRoles);
      setSupervisorRoles(result.dashboard.policy.supervisorRoles);
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

  async function runAction(action, successMessage) {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await action();
      setNotice(result.messageText || result.message || successMessage);
      await loadDashboard();
    } catch (actionError) { setError(actionError.message); }
    finally { setSaving(false); }
  }

  function submitMessage(event) {
    event.preventDefault();
    runAction(async () => {
      const result = await request('/api/emergency-communications/messages', 'POST', form);
      setForm({ title: '', body: '', category: 'OPERATIONAL', priority: 'NORMAL', channel: 'PUBLIC_ADDRESS', incidentReference: '', templateId: '' });
      return result;
    }, 'Draft saved.');
  }

  function applyTemplate(templateId) {
    const template = dashboard?.templates.find((item) => item.id === templateId);
    if (!template) {
      setForm((current) => ({ ...current, templateId: '' }));
      return;
    }
    setForm((current) => ({
      ...current,
      templateId,
      category: template.category,
      channel: template.channel,
      title: template.titleTemplate,
      body: template.bodyTemplate,
    }));
  }

  async function submitIntegration(event) {
    event.preventDefault();
    await runAction(() => request('/api/emergency-communications/integrations', 'POST', integrationForm), 'Integration metadata saved.');
  }

  async function submitTemplate(event) {
    event.preventDefault();
    await runAction(() => request('/api/emergency-communications/templates', 'POST', templateForm), 'Template created.');
  }

  async function savePolicy(event) {
    event.preventDefault();
    await runAction(() => request('/api/emergency-communications/policy', 'PATCH', { operatorRoles, supervisorRoles }), 'Permissions policy saved.');
  }

  async function messageAction(message, action, body = {}) {
    const result = await request(`/api/emergency-communications/messages/${encodeURIComponent(message.id)}/${action}`, 'POST', body);
    return result;
  }

  const policy = dashboard?.policy || { operatorRoles: [], supervisorRoles: [] };
  const canPrepare = policy.operatorRoles.includes(role);
  const canApprove = policy.supervisorRoles.includes(role);
  const canManage = role === 'SYSTEM_ADMIN';
  const messages = dashboard?.messages || [];
  const integrations = dashboard?.integrations || [];
  const templates = dashboard?.templates || [];
  const incidentOptions = dashboard?.incidentOptions || [];

  return (
    <div className="space-y-6">
      <header className={`${panelClass} flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-200">
            <Megaphone className="h-3.5 w-3.5" /> Emergency communications
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Stadium messaging operations</h1>
          <p className="mt-1 text-xs text-slate-400">Prepare, approve, schedule and audit operator-controlled announcements.</p>
        </div>
        <button type="button" onClick={loadDashboard} className="inline-flex items-center gap-2 self-start rounded-xl border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-slate-200 hover:border-emerald-500/50 lg:self-auto">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">{notice}</div>}

      {dashboard && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p><strong>{dashboard.adapter.mode === 'SIMULATED_DEVELOPMENT' ? 'SIMULATED DEVELOPMENT ADAPTER — NOT LIVE.' : 'NO VERIFIED PA OR SIGNAGE ADAPTER.'}</strong> PA and signage integrations are unverified. Publication actions create simulated preview/audit records only; they do not transmit to speakers, displays, or other hardware. This module does not replace certified fire alarms, emergency notification systems, or official emergency procedures.</p>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ['Total messages', dashboard?.metrics?.total ?? 0, 'Drafts and records'],
          ['Awaiting approval', dashboard?.metrics?.awaitingApproval ?? 0, 'Human review required'],
          ['Scheduled', dashboard?.metrics?.scheduled ?? 0, 'Queue only; no automatic dispatch'],
          ['Publication records', dashboard?.metrics?.published ?? 0, 'Includes simulated previews'],
          ['Connected systems', Number(dashboard?.adapter?.publicAddressConnected) + Number(dashboard?.adapter?.digitalSignageConnected), 'Vendor-verified only'],
        ].map(([label, value, helper]) => (
          <div key={label} className={`${panelClass} p-4`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-[10px] text-slate-500">{helper}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className={`${panelClass} p-5 xl:col-span-2`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><Volume2 className="h-4 w-4 text-emerald-400" /> Public address & digital signage status</h2>
          <p className="mb-4 text-[11px] text-slate-400">Metadata is not proof of connectivity. Status is UNVERIFIED until an approved provider adapter confirms the system.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {['PUBLIC_ADDRESS', 'DIGITAL_SIGNAGE'].map((systemType) => {
              const status = integrations.filter((item) => item.systemType === systemType);
              return <article key={systemType} className="rounded-xl border border-navy-800 bg-navy-950 p-4">
                <h3 className="flex items-center gap-2 text-xs font-bold text-white">{systemType === 'PUBLIC_ADDRESS' ? <Volume2 className="h-4 w-4 text-sky-400" /> : <Tv className="h-4 w-4 text-sky-400" />}{systemType.replaceAll('_', ' ')}</h3>
                <div className="mt-3 space-y-2">
                  {status.map((integration) => <div key={integration.id} className="flex items-center justify-between gap-2 rounded-lg border border-navy-800 p-3"><span className="text-[10px] text-slate-300">{integration.providerName}</span><Status value={integration.connectionStatus} simulated={integration.isSimulated} /></div>)}
                  {!status.length && <div className="flex items-center justify-between rounded-lg border border-navy-800 p-3"><span className="text-[10px] text-slate-400">No integration configured</span><Status value="UNVERIFIED" /></div>}
                </div>
              </article>;
            })}
          </div>
        </section>

        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Approval controls</h2>
          <p className="text-[11px] text-slate-400">Operators prepare and submit. A distinct authorized supervisor approves before scheduling or publication.</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-navy-800 bg-navy-950 p-3"><p className="text-[10px] uppercase text-slate-500">Operator roles</p><p className="mt-1 text-xs text-slate-200">{policy.operatorRoles.join(', ')}</p></div>
            <div className="rounded-xl border border-navy-800 bg-navy-950 p-3"><p className="text-[10px] uppercase text-slate-500">Supervisor roles</p><p className="mt-1 text-xs text-slate-200">{policy.supervisorRoles.join(', ')}</p></div>
            <p className="text-[10px] leading-relaxed text-amber-200">Emergency messages always require a separate supervisor approval. No message is automatically broadcast.</p>
          </div>
        </section>
      </div>

      {canPrepare && (
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><Plus className="h-4 w-4 text-emerald-400" /> Prepare announcement</h2>
          <p className="mb-4 text-[11px] text-slate-400">Use verified instructions only. Saving creates a draft; submitting moves it to human approval.</p>
          <form className="grid gap-3 lg:grid-cols-3" onSubmit={submitMessage}>
            <select aria-label="Message template" className={inputClass} value={form.templateId} onChange={(event) => applyTemplate(event.target.value)}><option value="">Start without template</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name}{template.isSimulated ? ' · simulated' : ''}</option>)}</select>
            <select aria-label="Category" className={inputClass} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
            <select aria-label="Priority" className={inputClass} value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>{['LOW', 'NORMAL', 'HIGH', 'CRITICAL'].map((priority) => <option key={priority}>{priority}</option>)}</select>
            <select aria-label="Delivery channel" className={inputClass} value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })}>{channels.map((channel) => <option key={channel} value={channel}>{channel.replaceAll('_', ' ')}</option>)}</select>
            <select aria-label="Linked incident" className={inputClass} value={form.incidentReference} onChange={(event) => setForm({ ...form, incidentReference: event.target.value })}><option value="">No linked incident</option>{incidentOptions.map((incident) => <option key={incident.id} value={incident.id}>{incident.id} · {incident.title}</option>)}</select>
            <input required maxLength={180} aria-label="Message title" className={inputClass} placeholder="Announcement title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <textarea required maxLength={2000} aria-label="Announcement text" className={`${inputClass} min-h-28 lg:col-span-3`} placeholder="Message text — verify all locations and instructions before approval" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} />
            <button disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Save draft</button>
          </form>
        </section>
      )}

      <section className={`${panelClass} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-navy-800 p-5">
          <div><h2 className="flex items-center gap-2 font-bold text-white"><CalendarClock className="h-4 w-4 text-sky-400" /> Message register & approval history</h2><p className="mt-1 text-[11px] text-slate-400">Approval, scheduling, cancellation, and simulated publication events are auditable.</p></div>
          <span className="text-[10px] text-slate-500">{messages.length} messages</span>
        </div>
        <div className="divide-y divide-navy-800/70">
          {messages.map((message) => (
            <article key={message.id} className="p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{message.title}</h3><Status value={message.status} simulated={message.isSimulated || message.publicationMode === 'SIMULATED_PREVIEW_NO_TRANSMISSION'} /></div>
                  <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-slate-300">{message.body}</p>
                  <p className="mt-2 text-[10px] text-slate-500">{message.messageRef} · {message.category} · {message.priority} · {message.channel.replaceAll('_', ' ')} · Operator: {message.createdByEmail} ({message.createdByRole}){message.incidentReference ? ` · Incident ${message.incidentReference}` : ''}</p>
                  {message.scheduledAt && <p className="mt-1 text-[10px] text-sky-300">Scheduled for {new Date(message.scheduledAt).toLocaleString()} · dispatch is not automatic</p>}
                  {message.publishedAt && <p className="mt-1 text-[10px] text-amber-300">Publication recorded {new Date(message.publishedAt).toLocaleString()} · {message.publicationMode?.replaceAll('_', ' ')}</p>}
                  <div className="mt-3 space-y-1">
                    {(message.approvals || []).map((approval) => <p key={approval.id} className="text-[10px] text-emerald-300"><CheckCircle2 className="mr-1 inline h-3 w-3" />{approval.decision} by {approval.approverEmail} ({approval.approverRole}) · {new Date(approval.createdAt).toLocaleString()}{approval.notes ? ` · ${approval.notes}` : ''}</p>)}
                    {!message.approvals?.length && message.status !== 'DRAFT' && <p className="text-[10px] text-slate-500">No approval record is available.</p>}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {canPrepare && message.status === 'DRAFT' && <button disabled={saving} onClick={() => runAction(() => messageAction(message, 'approval', { action: 'SUBMIT' }), 'Submitted for approval.')} className="rounded-lg border border-sky-500/30 px-3 py-2 text-[10px] font-bold text-sky-200 disabled:opacity-50">Submit for approval</button>}
                  {canApprove && message.status === 'PENDING_APPROVAL' && message.createdById !== userId && <button disabled={saving} onClick={() => runAction(() => messageAction(message, 'approval', { action: 'APPROVE', notes: '' }), 'Approved.')} className="rounded-lg border border-emerald-500/30 px-3 py-2 text-[10px] font-bold text-emerald-200 disabled:opacity-50">Approve</button>}
                  {canPrepare && message.status === 'APPROVED' && <label className="flex items-center gap-1 rounded-lg border border-navy-700 px-2 py-1 text-[10px] text-slate-300"><input type="datetime-local" value={scheduleTimes[message.id] || ''} onChange={(event) => setScheduleTimes({ ...scheduleTimes, [message.id]: event.target.value })} className="max-w-36 bg-transparent" /><button disabled={saving || !scheduleTimes[message.id]} onClick={() => runAction(() => messageAction(message, 'schedule', { scheduledAt: new Date(scheduleTimes[message.id]).toISOString() }), 'Scheduled.')} className="font-bold text-sky-200 disabled:opacity-40">Schedule</button></label>}
                  {canApprove && ['APPROVED', 'SCHEDULED'].includes(message.status) && <button disabled={saving} onClick={() => runAction(() => messageAction(message, 'publish'), 'Publication recorded.')} className="rounded-lg border border-amber-500/30 px-3 py-2 text-[10px] font-bold text-amber-200 disabled:opacity-50">Preview publish</button>}
                  {canPrepare && ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SCHEDULED'].includes(message.status) && <button disabled={saving} onClick={() => runAction(() => messageAction(message, 'cancel'), 'Cancelled.')} className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 px-3 py-2 text-[10px] font-bold text-red-200 disabled:opacity-50"><XCircle className="h-3 w-3" />Cancel</button>}
                </div>
              </div>
            </article>
          ))}
          {!messages.length && <p className="p-8 text-center text-xs text-slate-500">{loading ? 'Loading message register…' : 'No announcements have been prepared.'}</p>}
        </div>
      </section>

      {canManage && (
        <div className="grid gap-6 xl:grid-cols-3">
          <section className={`${panelClass} p-5`}>
            <h2 className="mb-1 font-bold text-white">Configure operator permissions</h2>
            <p className="mb-4 text-[11px] text-slate-400">System administrator only. SYSTEM_ADMIN is required to remain in supervisor roles.</p>
            <form onSubmit={savePolicy} className="space-y-4">
              <fieldset><legend className="mb-2 text-[10px] uppercase text-slate-500">Operator roles</legend>{['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR', 'STEWARD', 'FINANCE_OFFICER'].map((item) => <label key={item} className="mr-3 inline-flex items-center gap-1 py-1 text-[10px] text-slate-300"><input type="checkbox" checked={operatorRoles.includes(item)} onChange={(event) => setOperatorRoles(event.target.checked ? [...operatorRoles, item] : operatorRoles.filter((roleItem) => roleItem !== item))} />{item}</label>)}</fieldset>
              <fieldset><legend className="mb-2 text-[10px] uppercase text-slate-500">Supervisor roles</legend>{['SYSTEM_ADMIN', 'VENUE_MANAGER', 'GATE_OPERATOR'].map((item) => <label key={item} className="mr-3 inline-flex items-center gap-1 py-1 text-[10px] text-slate-300"><input type="checkbox" checked={supervisorRoles.includes(item)} disabled={item === 'SYSTEM_ADMIN'} onChange={(event) => setSupervisorRoles(event.target.checked ? [...supervisorRoles, item] : supervisorRoles.filter((roleItem) => roleItem !== item))} />{item}</label>)}</fieldset>
              <button disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Save role policy</button>
            </form>
          </section>
          <section className={`${panelClass} p-5`}>
            <h2 className="mb-1 font-bold text-white">Register provider metadata</h2>
            <p className="mb-4 text-[11px] text-slate-400">No credentials in the form. Secret references only. Registration remains UNVERIFIED.</p>
            <form onSubmit={submitIntegration} className="space-y-3">
              <select className={inputClass} value={integrationForm.systemType} onChange={(event) => setIntegrationForm({ ...integrationForm, systemType: event.target.value })}><option value="PUBLIC_ADDRESS">Public address</option><option value="DIGITAL_SIGNAGE">Digital signage</option></select>
              <input required aria-label="Provider name" className={inputClass} placeholder="Manufacturer / provider" value={integrationForm.providerName} onChange={(event) => setIntegrationForm({ ...integrationForm, providerName: event.target.value })} />
              <select className={inputClass} value={integrationForm.protocol} onChange={(event) => setIntegrationForm({ ...integrationForm, protocol: event.target.value })}>{['VENDOR_API_HTTPS', 'DOCUMENTED_GATEWAY_API', 'OTHER'].map((item) => <option key={item}>{item}</option>)}</select>
              <input required type="url" aria-label="HTTPS provider endpoint" className={inputClass} placeholder="https://provider.example" value={integrationForm.endpointUrl} onChange={(event) => setIntegrationForm({ ...integrationForm, endpointUrl: event.target.value })} />
              <input aria-label="Secret manager reference" className={inputClass} placeholder="Secret-manager reference" value={integrationForm.secretReference} onChange={(event) => setIntegrationForm({ ...integrationForm, secretReference: event.target.value })} />
              <button disabled={saving} className="rounded-lg border border-sky-500/30 px-4 py-2 text-xs font-bold text-sky-200 disabled:opacity-50">Save unverified metadata</button>
            </form>
          </section>
          <section className={`${panelClass} p-5`}>
            <h2 className="mb-1 font-bold text-white">Add configurable template</h2>
            <p className="mb-4 text-[11px] text-slate-400">Templates are drafts only. Emergency wording must be reviewed by authorized personnel.</p>
            <form onSubmit={submitTemplate} className="space-y-3">
              <input required aria-label="Template key" className={inputClass} placeholder="Unique template key" value={templateForm.templateKey} onChange={(event) => setTemplateForm({ ...templateForm, templateKey: event.target.value })} />
              <input required aria-label="Template name" className={inputClass} placeholder="Template name" value={templateForm.name} onChange={(event) => setTemplateForm({ ...templateForm, name: event.target.value })} />
              <div className="grid grid-cols-2 gap-2"><select className={inputClass} value={templateForm.category} onChange={(event) => setTemplateForm({ ...templateForm, category: event.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select><select className={inputClass} value={templateForm.channel} onChange={(event) => setTemplateForm({ ...templateForm, channel: event.target.value })}>{channels.map((item) => <option key={item} value={item}>{item}</option>)}</select></div>
              <input required aria-label="Template title text" className={inputClass} placeholder="Default announcement title" value={templateForm.titleTemplate} onChange={(event) => setTemplateForm({ ...templateForm, titleTemplate: event.target.value })} />
              <textarea required aria-label="Template body text" className={`${inputClass} min-h-20`} placeholder="Default announcement body" value={templateForm.bodyTemplate} onChange={(event) => setTemplateForm({ ...templateForm, bodyTemplate: event.target.value })} />
              <button disabled={saving} className="rounded-lg border border-sky-500/30 px-4 py-2 text-xs font-bold text-sky-200 disabled:opacity-50">Create template</button>
            </form>
          </section>
        </div>
      )}
      <section className={`${panelClass} overflow-hidden`}>
        <div className="border-b border-navy-800 p-5"><h2 className="flex items-center gap-2 font-bold text-white"><Clock3 className="h-4 w-4 text-sky-400" /> Approval and publication audit</h2><p className="mt-1 text-[11px] text-slate-400">Hash-linked record of operator actions, approvals, schedule changes, cancellations and publication previews.</p></div>
        <div className="divide-y divide-navy-800/70">
          {(dashboard?.auditHistory || []).map((record) => <div key={record.id} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-semibold text-slate-200">{record.action.replaceAll('_', ' ')}{record.messageRef ? ` · ${record.messageRef}` : ''}</p><p className="mt-1 text-[10px] text-slate-500">{record.actorEmail} ({record.actorRole})</p></div><div className="text-[10px] text-slate-500">{new Date(record.createdAt).toLocaleString()} · {record.isSimulated ? 'SIMULATED' : 'HASH-LINKED'}</div></div>)}
          {!dashboard?.auditHistory?.length && <p className="p-6 text-center text-xs text-slate-500">No audited communications actions yet.</p>}
        </div>
      </section>
      <p className="flex items-start gap-2 rounded-xl border border-navy-800 bg-navy-950 p-4 text-[10px] leading-relaxed text-slate-400"><Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />Scheduling records a future time and does not run an automatic dispatcher. “Preview publish” is a simulated record only. Certified fire alarms and independent emergency notification systems must retain their certified operation, controls, and approved procedures.</p>
    </div>
  );
}
