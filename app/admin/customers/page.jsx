'use client';

import React, { useState } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import { formatCurrency } from '../../../lib/utils';
import { maskPhoneNumber } from '../../../lib/payments';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  CheckCircle,
  Lock
} from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([
    {
      id: 'USR-PATRON-01',
      fullName: 'David Omondi',
      email: 'patron@example.com',
      phoneNumber: '254712345678',
      role: 'CUSTOMER',
      isActive: true,
      totalBookings: 3,
      totalSpentKes: 6500,
      createdAt: '2026-09-15T10:00:00.000Z',
    },
    {
      id: 'USR-PATRON-02',
      fullName: 'Amina Mohamed',
      email: 'amina.m@example.co.ke',
      phoneNumber: '254722987654',
      role: 'CUSTOMER',
      isActive: true,
      totalBookings: 2,
      totalSpentKes: 14000,
      createdAt: '2026-10-01T11:20:00.000Z',
    },
    {
      id: 'USR-PATRON-03',
      fullName: 'John Kiprop',
      email: 'kiprop.j@example.com',
      phoneNumber: '254733112233',
      role: 'CUSTOMER',
      isActive: false,
      totalBookings: 1,
      totalSpentKes: 1000,
      createdAt: '2026-10-10T14:00:00.000Z',
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery)
  );

  const toggleAccountStatus = (id) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            PATRON & USER DIRECTORY
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Customer Account Management
          </h1>
          <p className="text-xs text-slate-400">
            View registered patron profiles, manage account activation states, and review spending.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Patrons"
          value={customers.length.toString()}
          subtitle="Verified Accounts"
          icon={Users}
          accentColor="emerald"
        />

        <StatCard
          title="Active Accounts"
          value={customers.filter((c) => c.isActive).length.toString()}
          subtitle="Valid Booking Rights"
          icon={UserCheck}
          accentColor="emerald"
        />

        <StatCard
          title="Suspended Accounts"
          value={customers.filter((c) => !c.isActive).length.toString()}
          subtitle="Deactivated Accounts"
          icon={UserX}
          accentColor="red"
        />

        <StatCard
          title="Avg Lifetime Spend"
          value={formatCurrency(7166)}
          subtitle="Per Patron Account"
          icon={CheckCircle}
          accentColor="sky"
        />
      </div>

      {/* Search */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search customer name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Customer Name & Email</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Role</th>
                <th className="p-4">Total Bookings</th>
                <th className="p-4">Total Spent (KES)</th>
                <th className="p-4">Account Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{c.fullName}</div>
                    <div className="text-[10px] text-slate-400">{c.email}</div>
                  </td>

                  <td className="p-4 font-mono text-slate-300">
                    {maskPhoneNumber(c.phoneNumber)}
                  </td>

                  <td className="p-4">
                    <Badge variant="navy">{c.role}</Badge>
                  </td>

                  <td className="p-4 font-mono font-bold text-white">
                    {c.totalBookings} Booking(s)
                  </td>

                  <td className="p-4 font-mono font-bold text-emerald-400">
                    {formatCurrency(c.totalSpentKes)}
                  </td>

                  <td className="p-4">
                    <Badge variant={c.isActive ? 'success' : 'danger'}>
                      {c.isActive ? 'ACTIVE' : 'SUSPENDED'}
                    </Badge>
                  </td>

                  <td className="p-4 text-right">
                    <Button
                      variant={c.isActive ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => toggleAccountStatus(c.id)}
                    >
                      {c.isActive ? 'Suspend Account' : 'Activate Account'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
