'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

const fieldClass = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-white';

export default function AccountSecurityPage() {
  const [sessions, setSessions] = useState([]);
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [setup, setSetup] = useState(null);
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/sessions', { cache: 'no-store' });
      const result = await response.json();
      if (response.ok && result.success) setSessions(result.sessions || []);
    } catch { setMessage('Session information is temporarily unavailable.'); }
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  async function post(url, body) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Request failed.');
      return result;
    } catch (error) {
      setMessage(error.message);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function beginEnrollment(event) {
    event.preventDefault();
    const result = await post('/api/auth/mfa/enroll', { currentPassword: password });
    if (result) {
      setSetup(result);
      setPassword('');
      setMessage('Scan this enrollment URI with an authenticator app. The secret is shown only during setup.');
    }
  }

  async function confirmEnrollment(event) {
    event.preventDefault();
    const result = await post('/api/auth/mfa/confirm', { code });
    if (result) {
      setRecoveryCodes(result.recoveryCodes || []);
      setSetup(null);
      setCode('');
      setMessage('MFA is enabled. Save the recovery codes now; they will not be shown again.');
      await loadSessions();
    }
  }

  async function revoke(sessionId) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Session could not be revoked.');
      setMessage(result.message);
      await loadSessions();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function rotateCodes(event) {
    event.preventDefault();
    const result = await post('/api/auth/mfa/recovery-codes', { code });
    if (result) {
      setRecoveryCodes(result.recoveryCodes || []);
      setCode('');
      setMessage(result.message);
    }
  }

  async function disableMfa(event) {
    event.preventDefault();
    const currentPassword = event.currentTarget.elements.currentPassword.value;
    const result = await post('/api/auth/mfa/disable', { currentPassword, code });
    if (result) {
      setRecoveryCodes([]);
      setCode('');
      event.currentTarget.reset();
      setMessage(result.message);
    }
  }

  return (
    <main className="min-h-screen bg-navy-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <header><Link href="/admin" className="text-sm text-emerald-300 hover:underline">Back to platform</Link><h1 className="mt-4 text-3xl font-bold text-white">Account security</h1><p className="mt-2 text-sm text-slate-400">Manage authenticator MFA and active sessions. Recovery codes are displayed only when first issued or regenerated.</p></header>
        {message && <div role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">{message}</div>}

        <section className="rounded-2xl border border-navy-800 bg-navy-900 p-5">
          <h2 className="text-lg font-semibold">Authenticator app MFA</h2>
          {!setup ? <form onSubmit={beginEnrollment} className="mt-4 flex flex-wrap gap-3">
            <input className={`${fieldClass} min-w-56 flex-1`} type="password" autoComplete="current-password" placeholder="Current password to start enrollment" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button disabled={busy} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-navy-950 disabled:opacity-50">Start enrollment</button>
          </form> : <div className="mt-4 space-y-4">
            <div className="break-all rounded-lg border border-navy-700 bg-navy-950 p-3 text-xs"><div className="font-semibold text-emerald-300">Enrollment URI</div><code className="mt-2 block">{setup.otpauthUri}</code><div className="mt-3 text-slate-400">Manual secret: <code className="text-white">{setup.secret}</code></div></div>
            <form onSubmit={confirmEnrollment} className="flex flex-wrap gap-3">
              <input className={`${fieldClass} min-w-40 flex-1`} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit authenticator code" value={code} onChange={(event) => setCode(event.target.value)} required />
              <button disabled={busy} className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-navy-950 disabled:opacity-50">Confirm MFA</button>
            </form>
          </div>}
          {recoveryCodes.length > 0 && <div className="mt-5 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4"><h3 className="font-semibold text-amber-200">One-time recovery codes</h3><div className="mt-3 grid grid-cols-2 gap-2 font-mono text-sm">{recoveryCodes.map((item) => <code key={item}>{item}</code>)}</div><p className="mt-3 text-xs text-amber-100">Store securely. The server stores only hashes; these codes cannot be recovered after leaving this page.</p></div>}
          <form onSubmit={rotateCodes} className="mt-5 flex flex-wrap gap-3 border-t border-navy-800 pt-4">
            <input className={`${fieldClass} min-w-40 flex-1`} inputMode="numeric" maxLength={20} placeholder="MFA code to regenerate recovery codes" value={code} onChange={(event) => setCode(event.target.value)} required />
            <button disabled={busy} className="rounded-lg border border-navy-700 px-4 py-2 text-sm hover:border-emerald-400">Regenerate codes</button>
          </form>
          <form onSubmit={disableMfa} className="mt-3 flex flex-wrap gap-3">
            <input className={`${fieldClass} min-w-48 flex-1`} name="currentPassword" type="password" autoComplete="current-password" placeholder="Current password to disable MFA" required />
            <input className={`${fieldClass} min-w-40 flex-1`} inputMode="numeric" maxLength={20} placeholder="Authenticator or recovery code" value={code} onChange={(event) => setCode(event.target.value)} required />
            <button disabled={busy} className="rounded-lg border border-rose-500/30 px-4 py-2 text-sm text-rose-200 hover:bg-rose-500/10">Disable MFA</button>
          </form>
        </section>

        <section className="rounded-2xl border border-navy-800 bg-navy-900 p-5">
          <h2 className="text-lg font-semibold">Active sessions</h2>
          <p className="mt-1 text-xs text-slate-400">A revoked managed session is rejected by IAM endpoints. Other legacy platform APIs still validate signed tokens until their eight-hour expiry.</p>
          <div className="mt-4 space-y-3">{sessions.map((session) => <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-navy-800 p-3">
            <div><div className="text-sm font-medium">{session.userAgent || 'Unknown browser'}</div><div className="mt-1 text-xs text-slate-500">Last active {new Date(session.lastSeenAt).toLocaleString()} · Expires {new Date(session.expiresAt).toLocaleString()}</div></div>
            <button disabled={busy} onClick={() => revoke(session.id)} className="rounded-md border border-rose-500/30 px-3 py-1.5 text-xs text-rose-200">Revoke</button>
          </div>)}
            {!sessions.length && <div className="text-sm text-slate-500">No active managed sessions found.</div>}
          </div>
        </section>
      </div>
    </main>
  );
}
