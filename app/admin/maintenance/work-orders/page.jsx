'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  Wrench,
  Plus,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Check,
  AlertTriangle,
  User,
  FileCheck
} from 'lucide-react';

export default function AdminWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Complete Work Order Modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [targetWoId, setTargetWoId] = useState(null);
  const [completionDetails, setCompletionDetails] = useState('');

  const fetchWorkOrders = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedPriority !== 'ALL') params.append('priority', selectedPriority);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/maintenance/work-orders?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setWorkOrders(json.workOrders);
        setPriorities(json.priorities);
        setStatuses(json.statuses);
      }
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [selectedStatus, selectedPriority]);

  const handleExecuteCompletion = async (e) => {
    e.preventDefault();
    if (!targetWoId) return;

    try {
      const res = await fetch('/api/maintenance/work-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          woId: targetWoId,
          status: 'COMPLETED',
          completionDetails,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsResolveModalOpen(false);
        setTargetWoId(null);
        setCompletionDetails('');
        fetchWorkOrders();
      }
    } catch (err) {
      console.error('Failed to complete work order:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/maintenance">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">WORK ORDER QUEUE</Badge>
              <span className="text-[10px] text-slate-400 font-mono">{workOrders.length} Orders Active</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Maintenance Work Orders & Technician Dispatch
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={fetchWorkOrders}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search WO ID, asset, technician..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWorkOrders()}
            className="w-full bg-navy-950 border border-navy-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-navy-950 border border-navy-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Priorities</option>
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-semibold">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-navy-950 border border-navy-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Work Orders List */}
      <div className="space-y-4">
        {workOrders.map((wo) => (
          <div
            key={wo.id}
            className="bg-navy-900 border border-navy-800 hover:border-slate-700 transition-all rounded-2xl p-5 shadow-xl space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-white">{wo.id}</span>
                <Badge
                  variant={wo.priority === 'CRITICAL' || wo.priority === 'HIGH' ? 'danger' : 'warning'}
                  size="sm"
                >
                  {wo.priority}
                </Badge>
                <span className="text-[10px] text-slate-400 font-mono">{wo.category}</span>
              </div>

              {wo.status !== 'COMPLETED' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setTargetWoId(wo.id);
                    setIsResolveModalOpen(true);
                  }}
                  className="text-xs py-1"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  <span>Mark Completed</span>
                </Button>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  COMPLETED
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-white text-sm">{wo.title}</h3>
              <p className="text-[11px] text-slate-300 leading-relaxed mt-1">{wo.description}</p>
            </div>

            <div className="p-3 rounded-xl bg-navy-950 border border-navy-850 flex flex-wrap justify-between items-center text-[10px] font-mono text-slate-400">
              <span>Target Asset: <strong className="text-white">{wo.assetName}</strong></span>
              <span>Assigned Lead: <strong className="text-emerald-400">{wo.assignedTechnician}</strong></span>
              <span>Due Date: <strong className="text-slate-300">{wo.dueDate}</strong></span>
              <span>Est. Cost: <strong className="text-purple-400">KES {wo.costExpenditureKes?.toLocaleString() || 0}</strong></span>
            </div>

            {wo.completionDetails && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] text-emerald-200">
                <strong>Completion Sign-off:</strong> {wo.completionDetails}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Complete Work Order Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Sign-off & Complete Work Order"
      >
        <form onSubmit={handleExecuteCompletion} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Completion Notes & Technical Report *</label>
            <textarea
              rows={3}
              placeholder="Detail repair actions performed, parts replaced, and test results..."
              value={completionDetails}
              onChange={(e) => setCompletionDetails(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Approve & Complete Work Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
