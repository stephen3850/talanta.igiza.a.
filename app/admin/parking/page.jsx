'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import { initialParkingZones, initialParkingReservations } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import {
  Car,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  ShieldCheck,
  Smartphone,
  Check,
  XCircle
} from 'lucide-react';
import RevenueTrendChart from '../../../components/RevenueTrendChart';

export default function AdminParkingOperationsPage() {
  const [zones, setZones] = useState(initialParkingZones);
  const [reservations, setReservations] = useState(initialParkingReservations);
  const [vehicleInput, setVehicleInput] = useState('KCB 102Y');
  const [action, setAction] = useState('ENTRY');
  const [validationResult, setValidationResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const totalCapacity = zones.reduce((sum, z) => sum + z.capacity, 0);
  const totalReserved = zones.reduce((sum, z) => sum + z.reserved, 0);
  const totalParked = zones.reduce((sum, z) => sum + z.parkedInside, 0);
  const totalRevenue = reservations.reduce((sum, r) => sum + r.amountKes, 0);

  const handleValidateBarrier = async (e) => {
    e.preventDefault();
    if (!vehicleInput.trim()) return;

    setIsProcessing(true);
    setValidationResult(null);

    try {
      const res = await fetch('/api/parking/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehiclePlate: vehicleInput.trim(),
          action,
        }),
      });

      const data = await res.json();
      setValidationResult(data);
    } catch (err) {
      alert('Error validating barrier gate entry');
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
            SMART PARKING & BARRIER OS
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Stadium Parking & Barrier Gate Operations
          </h1>
          <p className="text-xs text-slate-400">
            Monitor real-time parking zone occupancy, validate vehicle barrier access, and manage permits.
          </p>
        </div>

        <div className="flex space-x-3">
          <Link href="/admin/parking/zones">
            <Button variant="secondary" size="sm">
              Manage Zones
            </Button>
          </Link>
          <Link href="/admin/parking/vehicles">
            <Button variant="primary" size="sm">
              Vehicle Records
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Configured Spaces"
          value={totalCapacity.toLocaleString()}
          subtitle="All Parking Zones"
          icon={Car}
          accentColor="emerald"
        />

        <StatCard
          title="Confirmed Reservations"
          value={totalReserved.toLocaleString()}
          subtitle="Booked Matchday Permits"
          icon={CheckCircle}
          accentColor="emerald"
        />

        <StatCard
          title="Vehicles Parked Inside"
          value={totalParked.toLocaleString()}
          subtitle="Verified Barrier Entries"
          icon={Car}
          accentColor="sky"
        />

        <StatCard
          title="Parking Revenue (KES)"
          value={formatCurrency(totalRevenue)}
          subtitle="Cleared Permit Fees"
          icon={ShieldCheck}
          accentColor="gold"
        />
      </div>

      {/* Parking Revenue Trend Graph */}
      <RevenueTrendChart
        title="Daily Parking Permit Revenue Trend (LAST 30 DAYS)"
        subtitle="Daily revenue aggregated directly from closed sales transactions"
        totalAmount={totalRevenue}
        currency="KSh"
        accentColor="emerald"
      />

      {/* Barrier Gate Access Validator Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2 border-b border-navy-800 pb-3">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <span>Barrier Gate Access Control Simulator</span>
          </h2>

          <form onSubmit={handleValidateBarrier} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Vehicle Plate / Permit Reference
              </label>
              <input
                type="text"
                required
                placeholder="e.g. KCB 102Y or PRK-2026-9842"
                value={vehicleInput}
                onChange={(e) => setVehicleInput(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Barrier Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none"
              >
                <option value="ENTRY">ENTRY (Gate Entry Barrier)</option>
                <option value="EXIT">EXIT (Gate Exit Barrier)</option>
              </select>
            </div>

            <Button type="submit" variant="primary" isLoading={isProcessing} className="w-full justify-center space-x-2 py-3">
              <ShieldCheck className="w-4 h-4" />
              <span>Validate Vehicle Barrier Access</span>
            </Button>
          </form>
        </div>

        {/* Validation Result Display */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h2 className="text-base font-bold text-white border-b border-navy-800 pb-3">Barrier Feedback</h2>

          {validationResult ? (
            <div
              className={`p-6 rounded-2xl border text-center space-y-3 ${
                validationResult.success
                  ? 'bg-emerald-500/15 border-emerald-500 text-white'
                  : 'bg-red-500/20 border-red-500 text-white'
              }`}
            >
              <Badge variant={validationResult.success ? 'success' : 'danger'} size="md">
                {validationResult.status}
              </Badge>
              <h3 className="text-lg font-bold">{validationResult.message}</h3>

              {validationResult.reservation && (
                <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 text-xs text-left space-y-1 font-mono">
                  <div>Plate: <strong className="text-white">{validationResult.reservation.vehiclePlate}</strong></div>
                  <div>Zone: <strong className="text-emerald-400">{validationResult.reservation.zoneName}</strong></div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs border border-dashed border-navy-800 rounded-2xl">
              Enter vehicle plate or scan QR permit to test barrier validation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
