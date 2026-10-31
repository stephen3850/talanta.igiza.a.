'use client';

import React from 'react';
import Link from 'next/link';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { WifiOff, Ticket, RefreshCw, ArrowLeft, ShieldAlert, PhoneCall, AlertTriangle } from 'lucide-react';

export default function OfflineFallbackPage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-navy-900 border border-navy-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <WifiOff className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <Badge variant="warning" size="sm">NETWORK DISCONNECTED</Badge>
          <h1 className="text-xl font-bold text-white tracking-tight">
            You Are Currently Offline
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            Internet connectivity is unavailable. Previously viewed matchday digital tickets are accessible offline from your local wallet cache.
          </p>
        </div>

        {/* Offline Disclaimer Requirement 4 */}
        <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 text-left space-y-2 text-xs">
          <div className="flex items-center space-x-2 text-amber-400 font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Turnstile Validation Disclaimer</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Offline display allows viewing stored ticket details when disconnected. Gate turnstile barcode scanning requires live cryptographic counter synchronization or staff handheld verification.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/account/tickets" className="block">
            <Button variant="primary" size="sm" className="w-full justify-center">
              <Ticket className="w-4 h-4 mr-2" />
              <span>Access Cached Offline Tickets</span>
            </Button>
          </Link>

          <Button variant="secondary" size="sm" className="w-full justify-center" onClick={handleRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            <span>Retry Connection</span>
          </Button>

          <Link href="/" className="block">
            <Button variant="outline" size="sm" className="w-full justify-center text-xs">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span>Return Home</span>
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-navy-800 text-[10px] text-slate-500 font-mono">
          Talanta Stadium PWA Shell v2.0 • Offline Fallback Enabled
        </div>
      </div>
    </div>
  );
}
