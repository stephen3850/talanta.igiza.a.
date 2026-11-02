'use client';

import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import { initialOrders } from '../../../lib/mockData';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  Ticket,
  QrCode,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Eye,
  ShieldCheck,
  Printer
} from 'lucide-react';
import RevenueTrendChart from '../../../components/RevenueTrendChart';

export default function AdminTicketsPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [revokeReason, setRevokeReason] = useState('Scalping Violation');
  const [isProcessing, setIsProcessing] = useState(false);

  // Flatten all tickets across orders
  const allTickets = orders.flatMap((order) =>
    order.tickets.map((tkt) => ({
      ...tkt,
      bookingRef: order.bookingRef || order.orderRef,
      userEmail: order.userEmail,
      userName: order.userName,
      eventTitle: order.eventTitle,
      categoryName: order.categoryName,
      mpesaReceipt: order.mpesaReceipt,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
    }))
  );

  // Filtered Tickets
  const filteredTickets = allTickets.filter((tkt) => {
    const matchesSearch =
      tkt.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tkt.userEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' || tkt.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalTickets = allTickets.length;
  const issuedCount = allTickets.filter((t) => t.status === 'ISSUED' || t.status === 'VALID').length;
  const validatedCount = allTickets.filter((t) => t.status === 'VALIDATED' || t.status === 'USED').length;
  const revokedCount = allTickets.filter((t) => t.status === 'REVOKED' || t.status === 'CANCELLED').length;

  // Handle Revoke Ticket
  const handleConfirmRevoke = async () => {
    if (!selectedTicket) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/tickets/${selectedTicket.ticketNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REVOKED' }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((order) => ({
            ...order,
            tickets: order.tickets.map((t) =>
              t.ticketNumber === selectedTicket.ticketNumber
                ? { ...t, status: 'REVOKED' }
                : t
            ),
          }))
        );
        setRevokeModalOpen(false);
        setSelectedTicket(null);
      }
    } catch (err) {
      alert('Error revoking ticket');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            STADIUM TICKETING CONTROL
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Digital Ticket Credential Management
          </h1>
          <p className="text-xs text-slate-400">
            Monitor issued passes, verify cryptographic QR tokens, and handle ticket revocations.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Issued Passes"
          value={totalTickets.toString()}
          subtitle="All Confirmed Orders"
          icon={Ticket}
          accentColor="emerald"
        />

        <StatCard
          title="Active Valid Passes"
          value={issuedCount.toString()}
          subtitle="Ready for Gate Entry"
          icon={CheckCircle}
          accentColor="emerald"
        />

        <StatCard
          title="Validated at Gates"
          value={validatedCount.toString()}
          subtitle="Used Turnstile Passes"
          icon={ShieldCheck}
          accentColor="sky"
        />

        <StatCard
          title="Revoked Passes"
          value={revokedCount.toString()}
          subtitle="Cancelled / Flagged"
          icon={XCircle}
          accentColor="red"
        />
      </div>

      {/* Daily Ticketing Revenue Trend Graph */}
      <RevenueTrendChart
        title="Daily Ticketing Revenue Trend (LAST 30 DAYS)"
        subtitle="Daily revenue aggregated directly from closed sales transactions"
        totalAmount={orders.filter((o) => o.paymentStatus === 'PAID' || o.bookingStatus === 'CONFIRMED').reduce((sum, o) => sum + (o.totalAmount || 0), 0)}
        currency="KSh"
        accentColor="sky"
      />

      {/* Search and Filters Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Ticket Number, Booking Ref, Event, or Customer Email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-navy-950 border border-navy-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Ticket Statuses</option>
            <option value="ISSUED">Issued / Valid</option>
            <option value="VALIDATED">Validated / Used</option>
            <option value="REVOKED">Revoked</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Tickets Data Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Ticket Number / Ref</th>
                <th className="p-4">Event & Seat Allocation</th>
                <th className="p-4">Customer Email</th>
                <th className="p-4">M-PESA Receipt</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No matching ticket credentials found.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((tkt) => (
                  <tr key={tkt.ticketNumber} className="hover:bg-navy-850/50 transition-colors">
                    <td className="p-4">
                      <div className="font-mono font-bold text-white">{tkt.ticketNumber}</div>
                      <div className="font-mono text-[10px] text-emerald-400">
                        {tkt.bookingRef}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{tkt.eventTitle}</div>
                      <div className="text-[10px] text-slate-400">
                        {tkt.categoryName} • {tkt.seatNumber}
                      </div>
                    </td>

                    <td className="p-4 text-slate-300">{tkt.userEmail}</td>

                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {tkt.mpesaReceipt || 'SJK849102X'}
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={
                          tkt.status === 'ISSUED' || tkt.status === 'VALID'
                            ? 'success'
                            : tkt.status === 'VALIDATED'
                            ? 'navy'
                            : 'danger'
                        }
                      >
                        {tkt.status}
                      </Badge>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <a href={`/api/tickets/${tkt.ticketNumber}/pdf`} target="_blank" rel="noreferrer">
                        <button
                          title="Print / Export PDF Ticket"
                          className="p-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 text-slate-300 border border-navy-800"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </a>

                      {tkt.status !== 'REVOKED' && (
                        <button
                          title="Revoke Ticket Credential"
                          onClick={() => {
                            setSelectedTicket(tkt);
                            setRevokeModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Ticket Revocation */}
      <Modal
        isOpen={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
        title="Revoke Digital Ticket Credential"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-red-400 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-xs">
              Revoking a ticket immediately invalidates its cryptographic QR token at turnstile gate scanners.
            </p>
          </div>

          <p className="text-xs text-slate-300">
            Ticket Number: <strong className="font-mono text-emerald-400">{selectedTicket?.ticketNumber}</strong><br />
            Event: <span className="text-white">{selectedTicket?.eventTitle}</span>
          </p>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Select Revocation Reason</label>
            <select
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="Scalping Violation">Scalping / Unauthorized Secondary Market Resale</option>
              <option value="Order Refunded">Order Refunded / Financial Cancellation</option>
              <option value="Security Sanction">Security Steward Sanction / Venue Exclusion</option>
              <option value="Duplicate Issue">Duplicate Ticket Generation Error</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setRevokeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmRevoke} isLoading={isProcessing}>
              Confirm Ticket Revocation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
