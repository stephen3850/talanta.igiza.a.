'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Password reset failed.');
      setMessage(result.message);
      window.history.replaceState({}, '', '/reset-password');
      setTimeout(() => router.push('/login'), 1500);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="min-h-screen bg-navy-950 px-4 py-16 text-slate-100">
    <div className="mx-auto max-w-md rounded-2xl border border-navy-800 bg-navy-900 p-7">
      <Link href="/login" className="text-sm text-emerald-300 hover:underline">Back to sign in</Link>
      <h1 className="mt-5 text-2xl font-bold text-white">Choose a new password</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm">New password<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-white" /></label>
        <label className="block text-sm">Confirm password<input type="password" required minLength={12} maxLength={128} autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-white" /></label>
        <button disabled={busy || !token} className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 font-semibold text-navy-950 disabled:opacity-50">{busy ? 'Saving…' : 'Reset password'}</button>
      </form>
      {message && <p role="status" className="mt-4 text-sm text-emerald-200">{message}</p>}
    </div>
  </main>;
}
