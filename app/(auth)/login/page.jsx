'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import { Shield, Lock, Mail, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(process.env.NODE_ENV === 'development' ? 'admin@sttech.co.ke' : '');
  const [password, setPassword] = useState(process.env.NODE_ENV === 'development' ? '123456' : '');
  const [phase, setPhase] = useState('credentials');
  const [challengeToken, setChallengeToken] = useState('');
  const [enrollment, setEnrollment] = useState(null);
  const [code, setCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [loginRole, setLoginRole] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function finishLogin(user) {
    if (recoveryCodes.length) {
      setPhase('recovery');
      return;
    }
    router.push(user.role === 'CUSTOMER' ? '/portal' : '/admin');
  }

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) finishLogin(data.user);
      else if (data.mfaRequired) {
        setChallengeToken(data.challengeToken);
        setPhase('mfa');
        setMessage(data.message);
      } else if (data.mfaSetupRequired) {
        setChallengeToken(data.challengeToken);
        const setupResponse = await fetch('/api/auth/mfa/enroll', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ challengeToken: data.challengeToken }),
        });
        const setupData = await setupResponse.json();
        if (!setupResponse.ok || !setupData.success) throw new Error(setupData.message || 'MFA setup could not start.');
        setEnrollment(setupData);
        setPhase('enroll');
        setMessage(data.message);
      } else {
        setMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      setMessage(error.message || 'Login service is unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChallenge = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      const enrollmentFlow = phase === 'enroll';
      const response = await fetch(enrollmentFlow ? '/api/auth/mfa/confirm' : '/api/auth/mfa/verify', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enrollmentFlow ? { challengeToken, code } : { challengeToken, code }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Verification failed.');
      if (enrollmentFlow) {
        setRecoveryCodes(data.recoveryCodes || []);
        setLoginRole(data.user.role);
        setPhase('recovery');
      }
      else finishLogin(data.user);
      setCode('');
    } catch (error) {
      setMessage(error.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  function continueAfterRecovery() {
    router.push(loginRole === 'CUSTOMER' ? '/portal' : '/admin');
  }

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-navy-900 border border-navy-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto"><Shield className="w-6 h-6" /></div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{phase === 'credentials' ? 'Portal Sign In' : phase === 'mfa' ? 'Verify your identity' : phase === 'enroll' ? 'Set up required MFA' : 'Save recovery codes'}</h1>
            <p className="text-xs text-slate-400">{phase === 'credentials' ? 'Access customer tickets or administrative operations' : message}</p>
          </div>

          {process.env.NODE_ENV === 'development' && phase === 'credentials' && <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-[11px] text-slate-300 space-y-1">
            <div className="font-semibold text-emerald-400">Quick Demo Credentials:</div>
            <div>Admin: <code className="text-white">admin@sttech.co.ke</code> (Pass: 123456)</div>
            <div>Patron: <code className="text-white">patron@example.com</code> (Pass: 123456)</div>
          </div>}

          {phase === 'credentials' && <form onSubmit={handleLogin} className="space-y-4">
            <label className="block"><span className="text-xs text-slate-300 font-medium">Email Address</span><span className="relative mt-1 block"><Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" /><input type="email" required autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none" /></span></label>
            <label className="block"><span className="text-xs text-slate-300 font-medium">Password</span><span className="relative mt-1 block"><Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" /><input type="password" required autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none" /></span></label>
            <Button type="submit" variant="primary" className="w-full justify-center py-3 space-x-2" isLoading={isLoading}><span>Sign In to Portal</span><ArrowRight className="w-4 h-4" /></Button>
            <div className="text-right"><Link href="/forgot-password" className="text-xs text-emerald-300 hover:underline">Forgot password?</Link></div>
          </form>}

          {(phase === 'mfa' || phase === 'enroll') && <form onSubmit={handleChallenge} className="space-y-4">
            {phase === 'enroll' && enrollment && <div className="break-all rounded-lg border border-navy-700 bg-navy-950 p-3 text-xs"><p className="font-semibold text-emerald-300">Scan with an authenticator app</p><code className="mt-2 block">{enrollment.otpauthUri}</code><p className="mt-2 text-slate-400">Manual secret: <code className="text-white">{enrollment.secret}</code></p></div>}
            <label className="block"><span className="text-xs text-slate-300">{phase === 'mfa' ? 'Authenticator or recovery code' : 'Authenticator code'}</span><input autoComplete="one-time-code" inputMode="numeric" maxLength={20} required value={code} onChange={(event) => setCode(event.target.value)} className="mt-1 w-full rounded-xl border border-navy-700 bg-navy-950 px-4 py-3 text-center font-mono tracking-widest text-white" /></label>
            <Button type="submit" variant="primary" className="w-full justify-center py-3" isLoading={isLoading}>{phase === 'mfa' ? 'Verify and sign in' : 'Enable MFA'}</Button>
          </form>}

          {phase === 'recovery' && <div className="space-y-4"><div className="grid grid-cols-2 gap-2 rounded-lg border border-amber-500/30 bg-navy-950 p-4 font-mono text-xs text-amber-100">{recoveryCodes.map((item) => <code key={item}>{item}</code>)}</div><p className="text-xs text-slate-400">Save these one-time recovery codes securely. They cannot be shown again.</p><Button type="button" variant="primary" className="w-full justify-center py-3" onClick={continueAfterRecovery}>Continue</Button></div>}

          {message && phase === 'credentials' && <p role="alert" className="text-center text-xs text-rose-300">{message}</p>}
          {phase === 'credentials' && <div className="text-center text-xs text-slate-400 pt-2 border-t border-navy-800">Don't have an account? <Link href="/register" className="text-emerald-400 font-semibold hover:underline">Create Patron Account</Link></div>}
        </div>
      </main>
      <Footer />
    </div>
  );
}
