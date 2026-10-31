'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../../../../components/Button';
import Badge from '../../../../../components/Badge';
import { initialIoTDevices } from '../../../../../lib/mockData';
import {
  Cpu,
  ArrowLeft,
  Wifi,
  Activity,
  ShieldCheck,
  Building2,
  Clock,
  Key,
  Gauge
} from 'lucide-react';

export default function SingleIoTDeviceProfilePage() {
  const params = useParams();
  const router = useRouter();

  const [device, setDevice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDevice() {
      try {
        const res = await fetch(`/api/iot/devices/${params.id}`);
        const data = await res.json();
        if (data.success && data.device) {
          setDevice(data.device);
        } else {
          const fallback = initialIoTDevices.find(
            (d) => d.id === params.id || d.deviceId === params.id
          );
          if (fallback) setDevice(fallback);
        }
      } catch (err) {
        console.warn('Fallback device search');
      } finally {
        setIsLoading(false);
      }
    }
    loadDevice();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading IoT device profile...
      </div>
    );
  }

  if (!device) {
    return (
      <div className="p-8 text-center space-y-4">
        <Badge variant="danger" size="md">DEVICE NOT FOUND</Badge>
        <h1 className="text-xl font-bold text-white">IoT Device Not Found</h1>
        <Button variant="primary" onClick={() => router.push('/admin/iot/devices')}>
          Back to Device Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs text-slate-400 hover:text-white space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Device Directory</span>
        </button>

        <Badge variant={device.status === 'ONLINE' ? 'success' : 'danger'} size="sm">
          {device.status}
        </Badge>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-navy-800 pb-4">
          <div>
            <Badge variant="navy" size="sm" className="mb-1">{device.category}</Badge>
            <h1 className="text-2xl font-bold text-white">{device.name}</h1>
            <p className="font-mono text-xs text-emerald-400 mt-1">{device.deviceId} • {device.zoneLocation}</p>
          </div>
        </div>

        {/* Device Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-navy-950 p-5 rounded-2xl border border-navy-800">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Manufacturer</span>
            <span className="font-bold text-white">{device.manufacturer || 'Siemens / Schneider'}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Model</span>
            <span className="font-bold text-white">{device.model || 'Smart-Sense 100'}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Serial Number</span>
            <span className="font-mono font-bold text-emerald-400">{device.serialNumber || 'SN-8821-X'}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Communication Protocol</span>
            <span className="font-bold text-white">{device.protocol || 'MQTT'}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Gateway ID</span>
            <span className="font-mono font-bold text-white">{device.gatewayId || 'GW-MQTT-PITCH-01'}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Last Communication</span>
            <span className="font-medium text-white">{new Date(device.lastSeenAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Latest Live Readings */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
            <Gauge className="w-4 h-4" />
            <span>Latest Sensor Readings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {device.latestReadings && Object.entries(device.latestReadings).map(([key, val]) => (
              <div key={key} className="bg-navy-950 p-4 rounded-2xl border border-navy-800 space-y-1">
                <span className="text-xs text-slate-400 uppercase font-semibold block">{key}</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
