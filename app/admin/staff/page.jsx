'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import { initialStaffAccreditation } from '../../../lib/mockData';
import { maskPhoneNumber } from '../../../lib/payments';
import {
  Award,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Eye,
  AlertTriangle,
  UserCheck,
  Building2
} from 'lucide-react';

export default function AdminStaffAccreditationPage() {
  const [staffList, setStaffList] = useState(initialStaffAccreditation);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      if (data.success && data.staff) {
        setStaffList(data.staff);
      }
    } catch (err) {
      console.warn('Using local workforce fallback');
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Filtered Workforce List
  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.accreditationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.organisation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roleTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' || s.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // KPI Computations
  const totalStaff = staffList.length;
  const approvedCount = staffList.filter((s) => s.status === 'APPROVED' || s.status === 'ACTIVE').length;
  const pendingCount = staffList.filter((s) => s.status === 'PENDING' || s.status === 'UNDER_REVIEW').length;
  const suspendedCount = staffList.filter((s) => s.status === 'SUSPENDED' || s.status === 'REJECTED').length;

  // Toggle Approval / Suspension
  const handleToggleStatus = async (member, newStatus) => {
    try {
      const res = await fetch(`/api/staff/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setStaffList((prev) =>
          prev.map((item) => (item.id === member.id ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      alert('Error updating status');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            WORKFORCE & ACCREDITATION CONTROL
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Staff & Contractor Accreditation
          </h1>
          <p className="text-xs text-slate-400">
            Register workforce members, assign zone access permissions, and issue digital staff passes.
          </p>
        </div>

        <div className="flex space-x-3">
          <Button variant="secondary" size="sm" onClick={fetchStaff}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Link href="/admin/staff/create">
            <Button variant="primary" className="space-x-2">
              <Plus className="w-4 h-4" />
              <span>Register New Personnel</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={totalStaff.toString()}
          subtitle="Accredited Personnel"
          icon={Award}
          accentColor="emerald"
        />

        <StatCard
          title="Approved Passes"
          value={approvedCount.toString()}
          subtitle="Active Zone Rights"
          icon={CheckCircle}
          accentColor="emerald"
        />

        <StatCard
          title="Pending Approvals"
          value={pendingCount.toString()}
          subtitle="Under Review"
          icon={Clock}
          accentColor="gold"
        />

        <StatCard
          title="Suspended / Revoked"
          value={suspendedCount.toString()}
          subtitle="Access Restricted"
          icon={XCircle}
          accentColor="red"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Name, Accreditation No, Organization, or Role..."
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
            <option value="ALL">All Accreditation Statuses</option>
            <option value="APPROVED">Approved / Active</option>
            <option value="PENDING">Pending Approval</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Workforce Data Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Accreditation No / Name</th>
                <th className="p-4">Organization & Role</th>
                <th className="p-4">Zone Permissions</th>
                <th className="p-4">Validity Window</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No matching workforce personnel found.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member.id} className="hover:bg-navy-850/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{member.fullName}</div>
                      <div className="font-mono text-[10px] text-emerald-400">
                        {member.accreditationNo}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-white">{member.roleTitle}</div>
                      <div className="text-[10px] text-slate-400">{member.organisation}</div>
                    </td>

                    <td className="p-4 font-mono text-emerald-300 text-[11px]">
                      {member.zonePermissions}
                    </td>

                    <td className="p-4 text-slate-400 text-[11px]">
                      {member.validFrom} to {member.validUntil}
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={
                          member.status === 'APPROVED' || member.status === 'ACTIVE'
                            ? 'success'
                            : member.status === 'PENDING'
                            ? 'pending'
                            : 'danger'
                        }
                      >
                        {member.status}
                      </Badge>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      <Link href={`/admin/staff/${member.id}`}>
                        <button
                          title="View Digital Staff Pass"
                          className="p-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 text-slate-300 border border-navy-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Link>

                      {member.status === 'PENDING' && (
                        <button
                          title="Approve Accreditation"
                          onClick={() => handleToggleStatus(member, 'APPROVED')}
                          className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px]"
                        >
                          Approve
                        </button>
                      )}

                      {member.status === 'APPROVED' && (
                        <button
                          title="Suspend Pass"
                          onClick={() => handleToggleStatus(member, 'SUSPENDED')}
                          className="px-2 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px]"
                        >
                          Suspend
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
    </div>
  );
}
