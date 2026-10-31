'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  Box,
  ArrowLeft,
  Wrench,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Thermometer,
  ShieldCheck,
  Plus
} from 'lucide-react';

export default function AdminAssetDetailsPage() {
  const { id } = useParams();
  const [asset, setAsset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Work order creation modal
  const [isWoModalOpen, setIsWoModalOpen] = useState(false);
  const [woTitle, setWoTitle] = useState('');
  const [woPriority, setWoPriority] = useState('MEDIUM');
  const [assignedTechnician, setAssignedTechnician] = useState('Eng. Samuel Kipchumba');
  const [description, setDescription] = useState('');
  const [isSubmittingWo, setIsSubmittingWo] = useState(false);

  const fetchAssetDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/assets/${id}`);
      const json = await res.json();
      if (json.success) {
        setAsset(json.asset);
        setWoTitle(`Preventive Maintenance & Inspection - ${json.asset.name}`);
      }
    } catch (err) {
      console.error('Failed to load asset details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const handleCreateWoSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingWo(true);
    try {
      const res = await fetch('/api/maintenance/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: asset.id,
          title: woTitle,
          priority: woPriority,
          assignedTechnician,
          description,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsWoModalOpen(false);
        fetchAssetDetails();
      }
    } catch (err) {
      console.error('Failed to create work order:', err);
    } finally {
      setIsSubmittingWo(false);
    }
  };

  if (isLoading || !asset) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Loading asset record and condition telemetry...
      </div>
    );
  }

  const tele = asset.conditionTelemetry;

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/assets">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-emerald-400">{asset.id}</span>
              <Badge variant={asset.status === 'OPERATIONAL' ? 'success' : 'warning'} size="sm">
                {asset.status}
              </Badge>
              <span className="text-[10px] text-slate-400 font-mono">{asset.category}</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              {asset.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="primary" size="sm" onClick={() => setIsWoModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Create Work Order</span>
          </Button>
        </div>
      </div>

      {/* Main Grid: Details, Telemetry & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Asset Specifications & Condition Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          {/* Asset Specs Card */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Box className="w-4 h-4 text-emerald-400" />
              <span>Asset Hardware Specifications & Location</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-navy-950 border border-navy-800 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Manufacturer</span>
                <span className="font-bold text-white">{asset.manufacturer}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Model / Series</span>
                <span className="font-bold text-white">{asset.model}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Serial Number</span>
                <span className="text-slate-300">{asset.serialNumber}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Physical Location</span>
                <span className="text-emerald-400 font-bold">{asset.location}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Installation Date</span>
                <span className="text-slate-300">{asset.installationDate}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] uppercase block">Warranty Expiry</span>
                <span className="text-slate-300">{asset.warrantyExpiryDate}</span>
              </div>
            </div>
          </div>

          {/* Condition Telemetry Dashboard (Requirement 5 & 11) */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <h2 className="text-sm font-bold text-white">Live Condition Telemetry Sensors</h2>
              </div>
              <Badge variant="warning" size="sm">DEMONSTRATION SENSOR TELEMETRY</Badge>
            </div>

            {tele && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 text-center space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">Operating Temp</span>
                  <span className={`text-base font-bold ${tele.temperatureC > 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {tele.temperatureC} °C
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 text-center space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">Vibration RMS</span>
                  <span className={`text-base font-bold ${tele.vibrationMms > 2.5 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {tele.vibrationMms} mm/s
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 text-center space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">Operating Hours</span>
                  <span className="text-base font-bold text-sky-400">{tele.operatingHours} hrs</span>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 text-center space-y-1">
                  <span className="text-slate-500 text-[10px] uppercase block">Power / Pressure</span>
                  <span className="text-base font-bold text-purple-400">{tele.powerKw} kW</span>
                </div>
              </div>
            )}
          </div>

          {/* Maintenance History Log */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-navy-800 pb-3">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Historical Maintenance & Inspection Log</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              {asset.maintenanceHistory?.length === 0 ? (
                <div className="text-slate-500 text-xs italic">
                  No previous repair or maintenance records on file.
                </div>
              ) : (
                asset.maintenanceHistory?.map((mh) => (
                  <div key={mh.id} className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>{mh.type} MAINTENANCE</span>
                      <span className="text-[10px] text-slate-500 font-mono">{mh.date}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{mh.notes}</p>
                    <div className="text-[10px] text-emerald-400 font-mono pt-1">
                      Technician Sign-off: {mh.technician}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Health Index Gauge & Maintenance Schedule */}
        <div className="space-y-6">
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4 text-center">
            <h2 className="text-sm font-bold text-white">Asset Health Index</h2>
            <div className="w-24 h-24 rounded-full border-4 border-emerald-500 bg-navy-950 flex items-center justify-center mx-auto shadow-inner">
              <span className="text-2xl font-black text-white font-mono">{asset.healthIndexPercent}%</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Condition rating based on thermal, vibration, and hours telemetry.
            </p>
          </div>

          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-3 text-xs">
            <h2 className="text-sm font-bold text-white border-b border-navy-800 pb-2">Schedule Rule</h2>
            <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 font-mono text-slate-300">
              Frequency: <strong className="text-emerald-400">{asset.maintenanceSchedule}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Create Work Order Modal */}
      <Modal
        isOpen={isWoModalOpen}
        onClose={() => setIsWoModalOpen(false)}
        title="Create Maintenance Work Order"
      >
        <form onSubmit={handleCreateWoSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Work Order Title *</label>
            <input
              type="text"
              value={woTitle}
              onChange={(e) => setWoTitle(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Priority Level</label>
              <select
                value={woPriority}
                onChange={(e) => setWoPriority(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Assign Lead Technician</label>
              <input
                type="text"
                value={assignedTechnician}
                onChange={(e) => setAssignedTechnician(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Task Description & Directives</label>
            <textarea
              rows={2}
              placeholder="Detail required inspection, repair, or replacement tasks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsWoModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmittingWo}>
              Dispatch Work Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
