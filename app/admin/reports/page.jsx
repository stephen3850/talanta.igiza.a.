'use client';

import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import { formatCurrency } from '../../../lib/utils';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  CreditCard,
  Ticket,
  Smartphone,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  DollarSign
} from 'lucide-react';
import RevenueTrendChart from '../../../components/RevenueTrendChart';

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState('ALL');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?dateRange=${dateRange}`);
      const data = await res.json();
      if (data.success) {
        setReportData(data);
      }
    } catch (err) {
      console.warn('Using local fallback report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const handleExportCSV = () => {
    window.open(`/api/reports?export=csv&dateRange=${dateRange}`, '_blank');
  };

  if (isLoading || !reportData) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading financial & attendance analytics reports...
      </div>
    );
  }

  const { financials, ticketing, gates, workforce, events } = reportData;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <span className="mb-1 inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold tracking-wide text-amber-300">
            SIMULATED DEVELOPMENT REPORT - NOT OPERATIONAL DATA
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Reporting & Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            All displayed figures are development fixtures; live payment, attendance, gate, and workforce reporting is not connected.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Date Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today (Matchday)</option>
            <option value="7DAYS">Last 7 Days</option>
            <option value="30DAYS">Last 30 Days</option>
          </select>

          <Button variant="secondary" size="sm" onClick={fetchReportData}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button variant="primary" size="sm" onClick={handleExportCSV} className="space-x-1">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>

          <button
            onClick={() => window.print()}
            className="p-2.5 rounded-xl bg-navy-950 hover:bg-navy-800 text-slate-300 border border-navy-800"
            title="Print Summary"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Financial Settlement Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <CreditCard className="w-5 h-5 text-emerald-400" />
          <span>Verified Financial Settlement (KES)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Gross Revenue"
            value={formatCurrency(financials.grossRevenueKes)}
            subtitle="Verified M-PESA Collections"
            icon={CreditCard}
            accentColor="emerald"
          />

          <StatCard
            title="Refunds & Reversals"
            value={formatCurrency(financials.refundedAmountKes)}
            subtitle={`${financials.refundRecordsCount} Refunded Orders`}
            icon={XCircle}
            accentColor="red"
          />

          <StatCard
            title="Net Settlement Revenue"
            value={formatCurrency(financials.netRevenueKes)}
            subtitle="Net Stadium Operating Collections"
            icon={DollarSign}
            accentColor="sky"
          />

          <StatCard
            title="M-PESA Transactions"
            value={`${financials.successfulPaymentsCount} Successful`}
            subtitle={`${financials.failedPaymentsCount} Failed / Timeout`}
            icon={CheckCircle}
            accentColor="emerald"
          />
        </div>

        <RevenueTrendChart
          title="Daily Gross Settlement Revenue Trend (LAST 30 DAYS)"
          subtitle="Daily revenue aggregated directly from closed sales transactions"
          totalAmount={financials.grossRevenueKes}
          currency="KSh"
          accentColor="emerald"
        />
      </div>

      {/* Ticketing & Attendance Analytics */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <Ticket className="w-5 h-5 text-emerald-400" />
          <span>Ticketing & Attendance Performance</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Tickets Sold"
            value={ticketing.totalTicketsSold.toString()}
            subtitle="Confirmed Patron Passes"
            icon={Ticket}
            accentColor="emerald"
          />

          <StatCard
            title="Turnstile Verified Entries"
            value={ticketing.ticketsValidatedCount.toString()}
            subtitle="Used Gate Credentials"
            icon={CheckCircle}
            accentColor="emerald"
          />

          <StatCard
            title="Stadium Attendance Rate"
            value={ticketing.attendancePercentage == null ? 'Unavailable' : `${ticketing.attendancePercentage}%`}
            subtitle="No verified occupancy or capacity data"
            icon={Users}
            accentColor="sky"
          />

          <StatCard
            title="Revoked Passes"
            value={ticketing.ticketsRevokedCount.toString()}
            subtitle="Security Sanctions"
            icon={XCircle}
            accentColor="red"
          />
        </div>
      </div>

      {/* Gate Analytics Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-emerald-400" />
          <span>Gate Access Analytics Breakdown</span>
        </h2>

        <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Gate Identifier & Name</th>
                <th className="p-4">Approved Entries</th>
                <th className="p-4">Duplicate Rejections</th>
                <th className="p-4">Offline Cached Scans</th>
                <th className="p-4">Operational Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {gates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No verified persistent gate activity is available.</td>
                </tr>
              ) : gates.map((g) => (
                <tr key={g.gateId} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{g.name}</div>
                    <div className="font-mono text-[10px] text-emerald-400">{g.gateId}</div>
                  </td>

                  <td className="p-4 font-mono font-bold text-emerald-400">
                    {g.approvedScans.toLocaleString()}
                  </td>

                  <td className="p-4 font-mono font-bold text-red-400">
                    {g.rejectedScans}
                  </td>

                  <td className="p-4 font-mono text-amber-400">
                    {g.offlineScans}
                  </td>

                  <td className="p-4">
                    <Badge variant={g.offlineScans > 0 ? 'warning' : 'success'}>
                      {g.offlineScans > 0 ? 'OFFLINE CACHED' : 'ONLINE LIVE'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workforce Accreditation Summary */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <Users className="w-5 h-5 text-emerald-400" />
          <span>Workforce Accreditation Summary</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-navy-900 border border-navy-800 p-5 rounded-2xl space-y-1">
            <span className="text-slate-400 text-xs font-medium block">Total Accredited Personnel</span>
            <span className="text-2xl font-black text-white">{workforce.registeredStaffCount} Members</span>
          </div>

          <div className="bg-navy-900 border border-navy-800 p-5 rounded-2xl space-y-1">
            <span className="text-slate-400 text-xs font-medium block">Approved Active Passes</span>
            <span className="text-2xl font-black text-emerald-400">{workforce.approvedStaffCount} Active</span>
          </div>

          <div className="bg-navy-900 border border-navy-800 p-5 rounded-2xl space-y-1">
            <span className="text-slate-400 text-xs font-medium block">Suspended / Revoked Passes</span>
            <span className="text-2xl font-black text-red-400">{workforce.suspendedStaffCount} Restricted</span>
          </div>
        </div>
      </div>
    </div>
  );
}
