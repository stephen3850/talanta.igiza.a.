'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import { Shield, User, Mail, Lock, Phone, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Account created successfully! Redirecting to login...');
        router.push('/login');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Registration error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-navy-900 border border-navy-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <User className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Patron Account</h1>
            <p className="text-xs text-slate-400">Register for fast M-PESA ticketing & digital wallet access</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. David Omondi"
                className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Safaricom Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XXXXXXXX"
                className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-3 space-x-2"
              isLoading={isLoading}
            >
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center text-xs text-slate-400 pt-2 border-t border-navy-800">
            Already registered?{' '}
            <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
