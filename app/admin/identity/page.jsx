'use client';

import { useCallback, useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, Users, Monitor, CircleAlert, LoaderCircle } from 'lucide-react';

const panel = 'rounded-2xl border border-navy-800 bg-navy-900 p-5';
const input = 'rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-white';

export default function IdentityManagementPage() {
  const [dashboard, setDashboard] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState({ providerKey: '', displayName: '', protocol: 'OIDC', issuerUrl: '', clientId: '', secretReference: '', scopes: 'openid profile email' });

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch('/api/iam/dashboard', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'IAM dashboard unavailable.');
      setDashboard(result.dashboard);
      setMessage('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateUser(userId, values) {
    const response = await fetch(`/api/iam/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'User access update failed.');
    await load();
  }

  async function saveProvider(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch('/api/iam/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Provider metadata could not be saved.');
      setMessage(result.message);
      setProvider({ providerKey: '', displayName: '', protocol: 'OIDC', issuerUrl: '', clientId: '', secretReference: '', scopes: 'openid profile email' });
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  const stats = dashboard ? [
    { title: 'Accounts', value: dashboard.totalUsers, icon: Users },
    { title: 'Active sessions', value: dashboard.activeSessions, icon: Monitor },
    { title: 'MFA enabled', value: dashboard.mfaEnabledCount, icon: ShieldCheck },
    { title: 'Identity providers', value: dashboard.providers.length, icon: KeyRound },
  ] : [];

  return (
    <main className="min-h-screen space-y-6 bg-navy-950 p-4 text-slate-100 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Administration</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Identity & Access Management</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">Account access, authenticator MFA, managed sessions and identity-provider metadata. No passwords, session tokens or MFA secrets are displayed.</p>
        </div>
        <a href="/account/security" className="rounded-lg border border-emerald-500/40 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/10">My account security</a>
      </header>

      {message && <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{message}</div>}
      {busy && !dashboard && <div className="flex items-center gap-2 text-slate-400"><LoaderCircle className="h-4 w-4 animate-spin" /> Loading IAM records…</div>}
      {!dashboard && !busy && <div className={panel}>IAM dashboard data could not be loaded. Confirm the managed administrator session and deployed database migration.</div>}

      {dashboard && <>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ title, value, icon: Icon }) => <article key={title} className={panel}>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">{title}</span><Icon className="h-5 w-5 text-emerald-400" /></div>
            <div className="mt-3 text-3xl font-bold text-white">{value}</div>
          </article>)}
        </section>

        <section className={panel}>
          <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Accounts and role assignments</h2><p className="text-xs text-slate-400">Showing up to 200 newest accounts. Role aliases inherit the permissions of the existing platform role shown in the selector.</p></div></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500"><tr><th className="p-3">Account</th><th className="p-3">Role</th><th className="p-3">MFA</th><th className="p-3">Sessions</th><th className="p-3">Status</th><th className="p-3">Actions</th></tr></thead>
              <tbody>{dashboard.users.map((user) => <tr key={user.id} className="border-t border-navy-800">
                <td className="p-3"><div className="font-medium text-white">{user.fullName}</div><div className="text-xs text-slate-500">{user.email}</div></td>
                <td className="p-3">
                  <select className={input} value={user.role} disabled={busy || user.id === dashboard.currentUserId} onChange={(event) => updateUser(user.id, { role: event.target.value }).catch((error) => setMessage(error.message))}>
                    {dashboard.roles.map((item) => <option key={item.role} value={item.role}>{item.label}</option>)}
                  </select>
                </td>
                <td className="p-3">{user.mfaEnabled ? <span className="text-emerald-300">Enabled</span> : <span className="text-amber-300">Not enabled</span>}</td>
                <td className="p-3">{user.activeSessions}</td>
                <td className="p-3">{user.isActive ? 'Active' : 'Suspended'}</td>
                <td className="p-3"><button className="rounded-md border border-navy-700 px-3 py-1.5 text-xs hover:border-amber-500/50" disabled={busy || user.id === dashboard.currentUserId} onClick={() => updateUser(user.id, { isActive: !user.isActive }).catch((error) => setMessage(error.message))}>{user.isActive ? 'Suspend' : 'Activate'}</button></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <article className={panel}>
            <h2 className="mb-1 text-lg font-semibold">Active managed sessions</h2>
            <p className="mb-4 text-xs text-slate-400">Limited to the 100 most recently active sessions. IP addresses are not displayed.</p>
            <div className="max-h-80 space-y-3 overflow-auto">
              {dashboard.sessions.map((session) => <div key={session.id} className="rounded-lg border border-navy-800 p-3 text-sm">
                <div className="flex justify-between gap-3"><span className="font-medium">{session.user.email}</span><span className="text-xs text-emerald-300">{session.user.role}</span></div>
                <div className="mt-1 truncate text-xs text-slate-500">{session.userAgent || 'Unknown browser'} · Last active {new Date(session.lastSeenAt).toLocaleString()}</div>
              </div>)}
              {!dashboard.sessions.length && <div className="text-sm text-slate-500">No active managed sessions were found.</div>}
            </div>
          </article>
          <article className={panel}>
            <h2 className="mb-1 text-lg font-semibold">Authentication events</h2>
            <p className="mb-4 text-xs text-slate-400">Recent authentication security events from the security operations log.</p>
            <div className="max-h-80 space-y-3 overflow-auto">
              {dashboard.events.map((event) => <div key={event.eventRef} className="flex gap-3 rounded-lg border border-navy-800 p-3">
                <CircleAlert className={`mt-0.5 h-4 w-4 shrink-0 ${event.severity === 'HIGH' || event.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-300'}`} />
                <div><div className="text-sm font-medium">{event.summary}</div><div className="mt-1 text-xs text-slate-500">{event.eventType} · {new Date(event.occurredAt).toLocaleString()}{event.isSimulated ? ' · Simulated' : ''}</div></div>
              </div>)}
              {!dashboard.events.length && <div className="text-sm text-slate-500">No recorded authentication events.</div>}
            </div>
          </article>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <article className={panel}>
            <h2 className="mb-1 text-lg font-semibold">OIDC / OAuth 2.0 provider metadata</h2>
            <p className="mb-4 text-xs text-slate-400">Configuration is stored as pending metadata only; this project does not activate a federated login flow. Never enter client secrets here.</p>
            <form onSubmit={saveProvider} className="grid gap-3 sm:grid-cols-2">
              <input className={input} placeholder="Provider key" value={provider.providerKey} onChange={(event) => setProvider({ ...provider, providerKey: event.target.value })} required />
              <input className={input} placeholder="Display name" value={provider.displayName} onChange={(event) => setProvider({ ...provider, displayName: event.target.value })} required />
              <select className={input} value={provider.protocol} onChange={(event) => setProvider({ ...provider, protocol: event.target.value })}><option>OIDC</option><option>OAUTH2</option><option disabled>SAML (no approved library)</option></select>
              <input className={input} placeholder="Issuer URL (HTTPS)" value={provider.issuerUrl} onChange={(event) => setProvider({ ...provider, issuerUrl: event.target.value })} required />
              <input className={input} placeholder="Client ID" value={provider.clientId} onChange={(event) => setProvider({ ...provider, clientId: event.target.value })} required />
              <input className={input} placeholder="Secret environment variable name" value={provider.secretReference} onChange={(event) => setProvider({ ...provider, secretReference: event.target.value })} required />
              <input className={`${input} sm:col-span-2`} placeholder="Scopes" value={provider.scopes} onChange={(event) => setProvider({ ...provider, scopes: event.target.value })} />
              <button disabled={busy} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-navy-950 disabled:opacity-50 sm:col-span-2">Save pending provider metadata</button>
            </form>
          </article>
          <article className={panel}>
            <h2 className="mb-4 text-lg font-semibold">Configured identity providers</h2>
            <div className="space-y-3">{dashboard.providers.map((item) => <div key={item.id} className="rounded-lg border border-navy-800 p-3">
              <div className="flex justify-between gap-3"><span className="font-medium">{item.displayName}</span><span className="text-xs text-amber-300">{item.status}</span></div>
              <div className="mt-1 truncate text-xs text-slate-500">{item.protocol} · {item.issuerUrl}</div>
            </div>)}
              {!dashboard.providers.length && <p className="text-sm text-slate-500">No provider metadata configured.</p>}
            </div>
            <div className="mt-5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-100">MFA enforcement: {dashboard.mfaEnforcement ? 'enabled for privileged roles' : 'not enforced by configuration'}. SAML: {dashboard.integrations.saml.toLowerCase().replaceAll('_', ' ')}.</div>
          </article>
        </section>
      </>}
    </main>
  );
}
