'use client';

import { useCallback, useEffect, useState } from 'react';
import { Database, FileCheck2, LockKeyhole, ShieldAlert, UsersRound } from 'lucide-react';

const panel = 'rounded-2xl border border-navy-800 bg-navy-900 p-5';
const input = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-white';
const button = 'rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-navy-950 disabled:opacity-50';
const csv = (value) => value.split(',').map((entry) => entry.trim()).filter(Boolean);

export default function DataGovernancePage() {
  const [dashboard, setDashboard] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [contacts, setContacts] = useState({});

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/governance/dashboard', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Governance dashboard unavailable.');
      setDashboard(result.dashboard);
      setMessage('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submit(event, endpoint, transform = (form) => form, method = 'POST') {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    try {
      const values = Object.fromEntries(new FormData(formElement).entries());
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transform(values)),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'The governance record could not be saved.');
      setMessage(result.message || 'Governance record saved.');
      formElement.reset();
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function updateRequest(id, status) {
    await updateRecord('/api/governance/requests', { id, status }, 'Request status updated.');
  }

  async function assignRequest(request) {
    const assignedToId = window.prompt('Enter the active responsible user account ID:', request.assignedToId || '');
    if (!assignedToId?.trim()) return;
    await updateRecord('/api/governance/requests', { id: request.id, assignedToId: assignedToId.trim() }, 'Responsible personnel updated.');
  }

  async function changeRequestHold(request) {
    const preservationHold = !request.preservationHold;
    const holdReason = preservationHold ? window.prompt('Enter the legal or operational preservation reason:') : undefined;
    if (preservationHold && !holdReason?.trim()) return;
    await updateRecord('/api/governance/requests', { id: request.id, preservationHold, holdReason }, preservationHold ? 'Preservation hold recorded.' : 'Preservation hold released.');
  }

  async function updateRecord(endpoint, body, successMessage) {
    try {
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'The governance record could not be updated.');
      setMessage(successMessage);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function revealContact(request) {
    try {
      const response = await fetch(`/api/governance/requests/${encodeURIComponent(request.id)}/contact`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Contact access was denied.');
      setContacts((previous) => ({ ...previous, [request.id]: result.contact }));
      setMessage(`Contact access for ${request.reference} was recorded in the governance audit log.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const stats = dashboard ? [
    { title: 'Data categories', value: dashboard.categories.length, icon: Database },
    { title: 'Open privacy requests', value: Object.entries(dashboard.requestCounts).filter(([status]) => !['COMPLETED', 'DECLINED'].includes(status)).reduce((sum, [, count]) => sum + count, 0), icon: UsersRound },
    { title: 'Retention reviews due', value: dashboard.retentionDue.length, icon: ShieldAlert },
    { title: 'Access reviews (7 days)', value: dashboard.accessAuditSummary.lastSevenDays, icon: LockKeyhole },
  ] : [];

  return (
    <main className="min-h-screen space-y-6 bg-navy-950 p-4 text-slate-100 md:p-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Administration</p>
        <h1 className="mt-2 text-3xl font-bold text-white">Data Governance & Privacy</h1>
        <p className="mt-2 max-w-4xl text-sm text-slate-400">Maintain the data inventory, classifications, privacy notices, consent evidence, subject-request workflow, retention reviews, and processor register. This supports assessment; it does not certify legal compliance.</p>
      </header>

      {message && <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{message}</div>}
      {busy && !dashboard && <p className="text-sm text-slate-400">Loading governance records…</p>}
      {!dashboard && !busy && <div className={panel}>Governance records are unavailable. Confirm the managed administrator session, encryption keys, and deployed database migration.</div>}

      {dashboard && <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ title, value, icon: Icon }) => <article key={title} className={panel}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">{title}</span><Icon className="h-5 w-5 text-emerald-400" /></div>
            <div className="mt-3 text-3xl font-bold text-white">{value}</div>
          </article>)}
        </section>

        <section className={panel}>
          <div className="mb-4"><h2 className="text-lg font-semibold">Data inventory</h2><p className="text-xs text-slate-400">Catalog entries describe platform data types; third-party connections are not implied by an inventory entry.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">Category</th><th className="p-3">Classification</th><th className="p-3">Purpose</th><th className="p-3">Modules</th><th className="p-3">Third parties</th></tr></thead>
              <tbody>{dashboard.categories.map((item) => <tr key={item.id} className="border-t border-navy-800 align-top">
                <td className="p-3"><strong>{item.label}</strong><p className="mt-1 max-w-md text-xs text-slate-500">{item.description}</p></td>
                <td className="p-3"><select className={`${input} min-w-36`} value={item.classification} onChange={(event) => updateRecord('/api/governance/inventory', { ...item, id: item.id, classification: event.target.value }, 'Data classification updated.')}>{['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'].map((value) => <option key={value}>{value}</option>)}</select></td><td className="p-3">{item.purposes.join(', ')}</td><td className="p-3">{item.modules.join(', ')}</td><td className="p-3">{item.thirdParties.join(', ') || 'None recorded'}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-emerald-300">Add inventory category</summary>
            <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => submit(event, '/api/governance/inventory', (form) => ({ ...form, purposes: csv(form.purposes), modules: csv(form.modules), systems: csv(form.systems), thirdParties: csv(form.thirdParties) }))}>
              <input className={input} name="categoryKey" placeholder="category-key" required /><input className={input} name="label" placeholder="Category label" required />
              <textarea className={`${input} md:col-span-2`} name="description" placeholder="Description and data elements" required />
              <input className={input} name="purposes" placeholder="Purposes (comma separated)" required /><input className={input} name="modules" placeholder="Modules (comma separated)" required />
              <input className={input} name="systems" placeholder="Systems (comma separated)" required /><input className={input} name="thirdParties" placeholder="Third parties (comma separated; leave blank if none recorded)" />
              <select className={input} name="classification" defaultValue="INTERNAL"><option>PUBLIC</option><option>INTERNAL</option><option>CONFIDENTIAL</option><option>RESTRICTED</option></select>
              <button className={button} disabled={busy}>Save category</button>
            </form>
          </details>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <article className={panel}>
            <h2 className="mb-1 text-lg font-semibold">Privacy requests</h2>
            <p className="mb-4 text-xs text-slate-400">Contact details are encrypted at rest and masked in lists. Use audited contact access only when needed. Apply holds where preservation is required.</p>
            <div className="max-h-96 space-y-3 overflow-auto">
              {dashboard.requests.map((request) => <div key={request.id} className="rounded-lg border border-navy-800 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><strong>{request.reference} · {request.requestType}</strong><select className={`${input} w-auto`} value={request.status} onChange={(event) => updateRequest(request.id, event.target.value)}>{['RECEIVED', 'VERIFYING', 'IN_REVIEW', 'ON_HOLD', 'COMPLETED', 'DECLINED'].map((status) => <option key={status}>{status}</option>)}</select></div>
                <p className="mt-1 text-xs text-slate-400">Contact: {contacts[request.id] || request.contactHint} · Responsible: {request.assignedToId || 'Unassigned'} · {request.preservationHold ? `PRESERVATION HOLD: ${request.holdReason}` : 'No request hold recorded'}</p>
                {!contacts[request.id] && <button className="mt-2 text-xs text-emerald-300 underline" onClick={() => revealContact(request)}>Access contact (audited)</button>}
                <button className="ml-4 mt-2 text-xs text-emerald-300 underline" onClick={() => assignRequest(request)}>Assign</button>
                <button className="ml-4 mt-2 text-xs text-amber-300 underline" onClick={() => changeRequestHold(request)}>{request.preservationHold ? 'Release preservation hold' : 'Set preservation hold'}</button>
              </div>)}
              {!dashboard.requests.length && <p className="text-sm text-slate-500">No privacy requests recorded.</p>}
            </div>
            <details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-emerald-300">Register request</summary>
              <form className="mt-3 space-y-3" onSubmit={(event) => submit(event, '/api/governance/requests', (form) => ({ ...form, requestedCategories: csv(form.requestedCategories || '') }))}>
                <select className={input} name="requestType">{['ACCESS', 'CORRECTION', 'ERASURE', 'OBJECTION', 'PORTABILITY', 'RESTRICTION', 'OTHER'].map((type) => <option key={type}>{type}</option>)}</select>
                <input className={input} name="contact" type="email" placeholder="Data subject contact email" required />
                <input className={input} name="requestedCategories" placeholder="Relevant category keys (comma separated)" />
                <input className={input} name="dueAt" type="date" />
                <button className={button} disabled={busy}>Register request</button>
              </form>
            </details>
          </article>

          <article className={panel}>
            <h2 className="mb-1 text-lg font-semibold">Retention policies and reviews</h2>
            <p className="mb-4 text-xs text-amber-300">Schedules are configurable review targets, not automatic deletion. A human must assess lawful holds and authorize any separate deletion procedure.</p>
            <div className="space-y-2">{dashboard.retentionDue.map((policy) => <div key={policy.id} className="rounded-lg border border-amber-500/20 p-3 text-sm">
              <strong>{policy.categoryKey}</strong> · Review due {new Date(policy.nextReviewAt).toLocaleDateString()} · {policy.retentionDays} days
            </div>)}</div>
            <div className="mt-3 space-y-2">{dashboard.retentionPolicies.map((policy) => <div key={policy.id} className="rounded-lg border border-navy-800 p-3 text-sm">
              <strong>{policy.categoryKey}</strong> · {policy.retentionDays} days · review every {policy.reviewCycleDays} days · {policy.enabled ? 'Enabled' : 'Disabled'} · {policy.preservationHold ? `HOLD: ${policy.preservationReason}` : 'No category hold'}
            </div>)}</div>
            <details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-emerald-300">Create or update retention policy</summary>
              <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={(event) => submit(event, '/api/governance/retention', (form) => ({ ...form, retentionDays: Number(form.retentionDays), reviewCycleDays: Number(form.reviewCycleDays), preservationHold: form.preservationHold === 'true', nextReviewAt: form.nextReviewAt || null }))}>
                <input className={input} name="categoryKey" placeholder="Category key" required />
                <input className={input} name="retentionDays" type="number" min="1" max="36500" placeholder="Retention days" required />
                <input className={input} name="reviewCycleDays" type="number" min="1" max="3650" placeholder="Review cycle days" required />
                <input className={input} name="nextReviewAt" type="date" />
                <select className={input} name="preservationHold" defaultValue="false"><option value="false">No category-wide preservation hold</option><option value="true">Category-wide hold active</option></select>
                <input className={input} name="preservationReason" placeholder="Hold rationale (required if held)" />
                <button className={button} disabled={busy}>Save policy</button>
              </form>
            </details>
            <details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-emerald-300">Record a retention review or decision</summary>
              <form className="mt-3 space-y-3" onSubmit={(event) => submit(event, '/api/governance/retention', (form) => ({ policyId: form.policyId, recordReference: form.recordReference, action: form.action, rationale: form.rationale }), 'PATCH')}>
                <select className={input} name="policyId" required><option value="">Select policy</option>{dashboard.retentionPolicies.map((policy) => <option key={policy.id} value={policy.id}>{policy.categoryKey}</option>)}</select>
                <input className={input} name="recordReference" placeholder="Internal record reference (no personal details)" required />
                <select className={input} name="action">{['REVIEWED', 'PRESERVE', 'RELEASE_HOLD', 'DELETE_APPROVED'].map((action) => <option key={action}>{action}</option>)}</select>
                <textarea className={input} name="rationale" placeholder="Review rationale / hold reason" required />
                <button className={button} disabled={busy}>Record decision</button>
              </form>
            </details>
            <div className="mt-4 max-h-56 space-y-2 overflow-auto text-xs">{dashboard.retentionReviews.map((review) => <div key={review.id} className="border-t border-navy-800 pt-2">{review.action} · {review.recordReference} · {review.rationale} · {new Date(review.createdAt).toLocaleString()}</div>)}</div>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <article className={panel}>
            <h2 className="mb-1 text-lg font-semibold">Processor register</h2>
            <p className="mb-3 text-xs text-slate-400">Record providers, categories shared, processing purpose and evidence-review status. Status is administrator-entered, not independently verified.</p>
            {dashboard.processors.map((provider) => <div key={provider.id} className="border-t border-navy-800 py-3 text-sm"><strong>{provider.displayName}</strong><div className="mt-2 grid gap-2 sm:grid-cols-2">
              <select className={input} value={provider.integrationStatus} onChange={(event) => updateRecord('/api/governance/providers', { id: provider.id, integrationStatus: event.target.value }, 'Processor integration status updated.')}>{['PENDING_REVIEW', 'CONFIGURED', 'DISCONNECTED', 'SIMULATED'].map((value) => <option key={value}>{value}</option>)}</select>
              <select className={input} value={provider.agreementStatus} onChange={(event) => updateRecord('/api/governance/providers', { id: provider.id, agreementStatus: event.target.value }, 'Processor agreement review status updated.')}>{['REVIEW_REQUIRED', 'UNDER_REVIEW', 'APPROVED', 'NOT_APPLICABLE'].map((value) => <option key={value}>{value}</option>)}</select>
            </div><p className="mt-1 text-xs text-slate-500">{provider.purpose}</p></div>)}
            <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-emerald-300">Register processor</summary>
              <form className="mt-3 space-y-3" onSubmit={(event) => submit(event, '/api/governance/providers', (form) => ({ ...form, categories: csv(form.categories), systems: csv(form.systems) }))}>
                <input className={input} name="providerKey" placeholder="PROVIDER_KEY" required /><input className={input} name="displayName" placeholder="Provider name" required />
                <input className={input} name="categories" placeholder="Data category keys shared" required /><textarea className={input} name="purpose" placeholder="Processing purpose" required />
                <input className={input} name="systems" placeholder="Systems/integration touchpoints" required /><button className={button} disabled={busy}>Save processor</button>
              </form>
            </details>
          </article>

          <article className={panel}>
            <h2 className="mb-1 text-lg font-semibold">Privacy notices and consent evidence</h2>
            <p className="mb-3 text-xs text-slate-400">Consent should be recorded only where it is the selected and appropriate legal basis; this tool does not determine legal basis.</p>
            {dashboard.notices.map((notice) => <div key={notice.id} className="border-t border-navy-800 py-3 text-sm"><strong>{notice.version} · {notice.title}</strong> · Basis review: {notice.legalBasis}
              <select className={`${input} mt-2`} value={notice.status} onChange={(event) => updateRecord('/api/governance/notices', { id: notice.id, status: event.target.value }, 'Privacy notice status updated.')}>{['DRAFT', 'PUBLISHED', 'RETIRED'].map((value) => <option key={value}>{value}</option>)}</select>
            </div>)}
            <p className="mt-2 text-xs text-slate-400">Consent records: {dashboard.consentCount}</p>
            <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold text-emerald-300">Create privacy notice</summary>
              <form className="mt-3 space-y-3" onSubmit={(event) => submit(event, '/api/governance/notices')}>
                <input className={input} name="version" placeholder="Version identifier" required /><input className={input} name="title" placeholder="Notice title" required />
                <textarea className={input} name="body" placeholder="Notice wording" required /><input className={input} name="legalBasis" placeholder="Proposed legal basis (requires review)" />
                <select className={input} name="status"><option>DRAFT</option><option>PUBLISHED</option></select><button className={button} disabled={busy}>Save notice</button>
              </form>
            </details>
            <details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-emerald-300">Record consent or withdrawal</summary>
              <form className="mt-3 space-y-3" onSubmit={(event) => submit(event, '/api/governance/consents')}>
                <input className={input} name="subjectReference" placeholder="Subject reference (hashed before storage)" required /><input className={input} name="categoryKey" placeholder="Category key" required />
                <input className={input} name="purpose" placeholder="Specific purpose" required /><input className={input} name="noticeVersion" placeholder="Notice version" required />
                <input className={input} name="legalBasis" placeholder="Legal basis (requires review)" required />
                <select className={input} name="status"><option>GRANTED</option><option>WITHDRAWN</option></select><button className={button} disabled={busy}>Record consent status</button>
              </form>
            </details>
          </article>
        </section>

        <section className={panel}>
          <div className="flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-emerald-400" /><h2 className="text-lg font-semibold">Access audit summary</h2></div>
          <p className="mt-1 text-xs text-slate-400">Recent governance reads and administrative actions, recorded by actor and resource without storing subject contact content.</p>
          <div className="mt-3 max-h-64 space-y-2 overflow-auto">{dashboard.accessAuditSummary.recent.map((entry) => <div key={entry.id} className="flex flex-wrap justify-between gap-2 border-t border-navy-800 pt-2 text-xs"><span>{entry.action} · {entry.entityType} · actor {entry.actorId}</span><time>{new Date(entry.createdAt).toLocaleString()}</time></div>)}</div>
        </section>
      </>}
    </main>
  );
}
