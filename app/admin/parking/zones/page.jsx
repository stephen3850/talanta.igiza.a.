'use client';

import React, { useState } from 'react';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import { initialParkingZones } from '../../../../lib/mockData';
import { formatCurrency } from '../../../../lib/utils';
import { Car, MapPin, RefreshCw, Plus } from 'lucide-react';

export default function AdminParkingZonesPage() {
  const [zones, setZones] = useState(initialParkingZones);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            PARKING ZONE CAPACITY MANAGER
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Stadium Parking Zone Allocation
          </h1>
          <p className="text-xs text-slate-400">
            Configure parking space capacity, location zones, and pricing fees for matchday events.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="p-4">Zone ID & Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Location</th>
              <th className="p-4">Configured Capacity</th>
              <th className="p-4">Reserved Spots</th>
              <th className="p-4">Pass Fee (KES)</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800/60">
            {zones.map((z) => (
              <tr key={z.id} className="hover:bg-navy-850/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-white">{z.name}</div>
                  <div className="font-mono text-[10px] text-emerald-400">{z.id}</div>
                </td>
                <td className="p-4 font-bold text-white">{z.category}</td>
                <td className="p-4 text-slate-300">{z.location}</td>
                <td className="p-4 font-mono font-bold text-white">{z.capacity.toLocaleString()} Spots</td>
                <td className="p-4 font-mono font-bold text-emerald-400">{z.reserved.toLocaleString()} Booked</td>
                <td className="p-4 font-mono font-bold text-white">{z.priceKes === 0 ? 'FREE' : formatCurrency(z.priceKes)}</td>
                <td className="p-4"><Badge variant="success">{z.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
