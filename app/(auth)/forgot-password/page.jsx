'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [developmentToken, setDevelopmentToken] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setDevelopmentToken('');
    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Password recovery is unavailable.');
      setMessage(result.message);
      setDevelopmentToken(result.developmentToken || '');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="min-h-screen bg-navy-950 px-4 py-16 text-slate-100">
    <div className="mx-auto max-w-md rounded-2xl border border-navy-800 bg-navy-900 p-7">
      <Link href="/login" className="text-sm text-emerald-300 hover:underline">Back to sign in</Link>
      <h1 className="mt-5 text-2xl font-bold text-white">Password recovery</h1>
      <p className="mt-2 text-sm text-slate-400">Request a one-time reset link. If an active account matches the address, instructions will be sent.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm">Email address<input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-white" /></label>
        <button disabled={busy} className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-navy-950 disabled:opacity-50">{busy ? 'Requesting…' : 'Send recovery instructions'}</button>
      </form>
      {message && <p role="status" className="mt-4 text-sm text-emerald-200">{message}</p>}
      {developmentToken && <Link href={`/reset-password?token=${encodeURIComponent(developmentToken)}`} className="mt-4 block break-all rounded-lg border border-amber-500/30 p-3 text-xs text-amber-200">Development-only reset link: open reset page</Link>}
    </div>
  </main>;
}
