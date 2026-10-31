'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import { initialOrders } from '../../../../lib/mockData';
import { ShieldCheck, ArrowLeft, Download, RefreshCw, Smartphone } from 'lucide-react';

export default function TicketQRViewPage() {
  const params = useParams();
  const router = useRouter();

  const ticketNumber = params.id;
  const order = initialOrders[0];
  const ticket = order.tickets.find((t) => t.ticketNumber === ticketNumber) || order.tickets[0];

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-lg mx-auto px-4 py-10 w-full">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs text-slate-400 hover:text-white mb-6 space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Ticket Wallet</span>
        </button>

        {/* Digital Pass Card */}
        <div className="bg-navy-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-6 text-center">
          <div className="border-b border-navy-800 pb-4">
            <Badge variant="success" size="md" className="mb-2">
              OFFICIAL MATCHDAY CREDENTIAL
            </Badge>
            <h1 className="text-xl font-bold text-white">{order.eventTitle}</h1>
            <p className="text-xs text-slate-400 mt-1">Talanta Sports City Main Bowl • Gate A Entry</p>
          </div>

          {/* QR Code Container */}
          <div className="bg-white p-6 rounded-2xl inline-block shadow-inner max-w-[220px] mx-auto border-4 border-emerald-500">
            {/* SVG QR Code Simulation */}
            <svg className="w-40 h-40 mx-auto text-slate-950" viewBox="0 0 100 100" fill="currentColor">
              <rect x="0" y="0" width="30" height="30" />
              <rect x="5" y="5" width="20" height="20" fill="white" />
              <rect x="10" y="10" width="10" height="10" />

              <rect x="70" y="0" width="30" height="30" />
              <rect x="75" y="5" width="20" height="20" fill="white" />
              <rect x="80" y="10" width="10" height="10" />

              <rect x="0" y="70" width="30" height="30" />
              <rect x="5" y="75" width="20" height="20" fill="white" />
              <rect x="10" y="80" width="10" height="10" />

              <rect x="35" y="35" width="30" height="30" />
              <rect x="40" y="40" width="20" height="20" fill="white" />
              <rect x="45" y="45" width="10" height="10" />

              <rect x="35" y="0" width="10" height="10" />
              <rect x="50" y="10" width="10" height="10" />
              <rect x="70" y="40" width="10" height="10" />
              <rect x="85" y="85" width="15" height="15" />
            </svg>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Cryptographic Token ID</span>
            <span className="font-mono text-sm font-bold text-emerald-400">{ticket.ticketNumber}</span>
            <span className="text-[10px] text-slate-500 block font-mono">Seat: {ticket.seatNumber}</span>
          </div>

          <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 text-xs text-slate-300 space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Order Reference:</span>
              <span className="font-mono text-white">{order.orderRef}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">M-PESA Receipt:</span>
              <span className="font-mono text-emerald-400">{order.mpesaReceipt}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Validation Mode:</span>
              <span className="font-medium text-white">Dynamic Anti-Replay QR</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-center space-x-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Present to Turnstile Scanner at Gate Entry</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
