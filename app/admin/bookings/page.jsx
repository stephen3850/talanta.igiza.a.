'use client';

import React, { useState } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import { initialOrders } from '../../../lib/mockData';
import { formatCurrency, formatDate } from '../../../lib/utils';
import {
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Printer,
  AlertTriangle
} from 'lucide-react';

export default function AdminBookingsPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtered Bookings
  const filteredBookings = orders.filter((ord) => {
    const matchesSearch =
      (ord.bookingRef && ord.bookingRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.orderRef && ord.orderRef.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ord.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' ||
      ord.paymentStatus === selectedStatus ||
      ord.bookingStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // KPI Metrics
  const totalBookings = orders.length;
  const confirmedCount = orders.filter((o) => o.paymentStatus === 'PAID' || o.bookingStatus === 'CONFIRMED').length;
  const pendingCount = orders.filter((o) => o.paymentStatus === 'PENDING' || o.bookingStatus === 'PENDING').length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'PAID' || o.bookingStatus === 'CONFIRMED')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Handle Cancel Booking
  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === selectedBooking.id
              ? { ...o, paymentStatus: 'REFUNDED', bookingStatus: 'CANCELLED' }
              : o
          )
        );
        setCancelModalOpen(false);
        setSelectedBooking(null);
      }
    } catch (err) {
      alert('Error cancelling booking');
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
            RESERVATIONS & ORDERS
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Booking & Order Management
          </h1>
          <p className="text-xs text-slate-400">
            Monitor patron reservations, check seat hold statuses, and manage order cancellations.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={totalBookings.toString()}
          subtitle="All Transactions"
          icon={BookOpen}
          accentColor="emerald"
        />

        <StatCard
          title="Confirmed Orders"
          value={confirmedCount.toString()}
          subtitle="Verified & Issued"
          icon={CheckCircle}
          accentColor="emerald"
        />

        <StatCard
          title="Pending Payment"
          value={pendingCount.toString()}
          subtitle="Awaiting M-PESA STK"
          icon={Clock}
          accentColor="gold"
        />

        <StatCard
          title="Total Revenue (KES)"
          value={formatCurrency(totalRevenue)}
          subtitle="Cleared Sales"
          icon={CheckCircle}
          accentColor="sky"
        />
      </div>

      {/* Search and Filters */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Booking Ref, Customer Name, Email, or Match Title..."
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
            <option value="ALL">All Booking Statuses</option>
            <option value="PAID">Confirmed / Paid</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded / Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Booking Ref</th>
                <th className="p-4">Customer Name & Email</th>
                <th className="p-4">Event & Category</th>
                <th className="p-4">Quantity & Amount</th>
                <th className="p-4">M-PESA Receipt</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No matching booking records found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-navy-850/50 transition-colors">
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {b.bookingRef || b.orderRef}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{b.userName}</div>
                      <div className="text-[10px] text-slate-400">{b.userEmail}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{b.eventTitle}</div>
                      <div className="text-[10px] text-emerald-400">{b.categoryName}</div>
                    </td>

                    <td className="p-4 font-mono">
                      <span className="text-white font-bold">{b.quantity} Ticket(s)</span>
                      <div className="text-emerald-400 font-bold">{formatCurrency(b.totalAmount)}</div>
                    </td>

                    <td className="p-4 font-mono text-white">
                      {b.mpesaReceipt || <span className="text-slate-500 italic">Pending</span>}
                    </td>

                    <td className="p-4">
                      <Badge variant={b.paymentStatus === 'PAID' ? 'success' : 'danger'}>
                        {b.paymentStatus || b.bookingStatus}
                      </Badge>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {b.paymentStatus !== 'REFUNDED' && (
                        <button
                          title="Cancel Booking"
                          onClick={() => {
                            setSelectedBooking(b);
                            setCancelModalOpen(true);
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

      {/* Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Booking & Refund"
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Cancelling this booking will invalidate all associated digital tickets and release held inventory.</span>
          </div>

          <p className="text-xs text-slate-300">
            Are you sure you want to cancel booking <strong className="text-emerald-400 font-mono">{selectedBooking?.orderRef}</strong> for <span className="text-white">{selectedBooking?.userName}</span>?
          </p>

          <div className="pt-2 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setCancelModalOpen(false)}>
              Back
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel} isLoading={isProcessing}>
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
