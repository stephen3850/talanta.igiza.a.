'use client';

import React, { useState } from 'react';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import { initialParkingReservations } from '../../../../lib/mockData';
import { formatCurrency } from '../../../../lib/utils';
import { Search, RefreshCw, Car } from 'lucide-react';

export default function AdminVehicleRecordsPage() {
  const [reservations, setReservations] = useState(initialParkingReservations);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = reservations.filter(
    (r) =>
      r.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reservationRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            VEHICLE REGISTRATION DIRECTORY
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Registered Vehicles & Parking Permits
          </h1>
          <p className="text-xs text-slate-400">
            Audit vehicle registration numbers, permit status, and entry/exit barrier logs.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Vehicle Plate Number, Permit Ref, or Customer Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Vehicle Plate & Permit Ref</th>
              <th className="p-4">Customer Name</th>
              <th className="p-4">Zone Assignment</th>
              <th className="p-4">Category</th>
              <th className="p-4">Fee Paid</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800/60">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-navy-850/50 transition-colors">
                <td className="p-4">
                  <div className="font-mono font-bold text-white text-sm">{r.vehiclePlate}</div>
                  <div className="font-mono text-[10px] text-emerald-400">{r.reservationRef}</div>
                </td>
                <td className="p-4 font-bold text-white">{r.userName}</td>
                <td className="p-4 text-slate-300">{r.zoneName}</td>
                <td className="p-4 font-bold text-white">{r.vehicleCategory}</td>
                <td className="p-4 font-mono font-bold text-emerald-400">{formatCurrency(r.amountKes)}</td>
                <td className="p-4">
                  <Badge variant={r.status === 'PARKED_INSIDE' ? 'success' : 'navy'}>
                    {r.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
