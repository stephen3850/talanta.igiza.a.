'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { initialOrders } from '../../lib/mockData';
import { Ticket, QrCode, Calendar, MapPin, Download, CheckCircle, ArrowRight } from 'lucide-react';

export default function CustomerPortalPage() {
  const [orders, setOrders] = useState(initialOrders);

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* User Welcome Header */}
        <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Badge variant="success" size="sm" className="mb-2">
              PATRON DIGITAL WALLET
            </Badge>
            <h1 className="text-2xl font-bold text-white">David Omondi's Tickets</h1>
            <p className="text-xs text-slate-400">Manage your active matchday credentials and order receipts</p>
          </div>

          <Link href="/fixtures">
            <Button variant="primary" size="sm" className="space-x-2">
              <Ticket className="w-4 h-4" />
              <span>Book More Matches</span>
            </Button>
          </Link>
        </div>

        {/* Active Digital Tickets Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-emerald-400" />
            <span>Active Matchday Pass Credentials</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.flatMap((ord) =>
              ord.tickets.map((tkt, idx) => (
                <div
                  key={tkt.ticketNumber}
                  className="bg-navy-900 border border-navy-800 hover:border-emerald-500/40 rounded-2xl p-6 shadow-xl space-y-4 transition-all"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-navy-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ticket Reference</span>
                      <span className="font-mono text-sm font-bold text-emerald-400">{tkt.ticketNumber}</span>
                    </div>
                    <Badge variant="success">VALIDATED READY</Badge>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">{ord.eventTitle}</h3>
                    <p className="text-xs text-emerald-400 font-medium mt-0.5">{ord.categoryName}</p>
                  </div>

                  <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seat Allocation:</span>
                      <span className="font-bold text-white">{tkt.seatNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">M-PESA Ref:</span>
                      <span className="font-mono text-slate-300">{ord.mpesaReceipt}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <Link href={`/portal/tickets/${tkt.ticketNumber}`} className="flex-1">
                      <Button variant="primary" size="sm" className="w-full justify-center space-x-2">
                        <QrCode className="w-4 h-4" />
                        <span>Display Dynamic QR Token</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
