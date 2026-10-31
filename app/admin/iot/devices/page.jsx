'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import StatCard from '../../../../components/StatCard';
import Modal from '../../../../components/Modal';
import { initialIoTDevices } from '../../../../lib/mockData';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

export default function AdminIoTDeviceDirectoryPage() {
  const [devices, setDevices] = useState(initialIoTDevices);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [category, setCategory] = useState('ENVIRONMENTAL');
  const [zoneLocation, setZoneLocation] = useState('Main Bowl Pitch Surface');
  const [protocol, setProtocol] = useState('MQTT');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/iot/devices');
      const data = await res.json();
      if (data.success && data.devices) setDevices(data.devices);
    } catch (err) {
      console.warn('Using local devices fallback');
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRegisterDevice = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/iot/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: deviceName,
          category,
          zoneLocation,
          protocol,
        }),
      });

      const data = await res.json();
      if (data.success && data.device) {
        setDevices((prev) => [data.device, ...prev]);
        setRegisterModalOpen(false);
        setDeviceName('');
      }
    } catch (err) {
      alert('Error registering IoT device');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDevices = devices.filter((dev) => {
    const matchesSearch =
      dev.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dev.zoneLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' || dev.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            IOT DEVICE REGISTRY
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Registered Stadium Smart Devices
          </h1>
          <p className="text-xs text-slate-400">
            Manage environmental sensors, pitch monitors, power sub-meters, and gateway endpoints.
          </p>
        </div>

        <div className="flex space-x-3">
          <Button variant="secondary" size="sm" onClick={fetchDevices}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button variant="primary" onClick={() => setRegisterModalOpen(true)} className="space-x-2">
            <Plus className="w-4 h-4" />
            <span>Register New Device</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Device Name, Device ID, or Zone Location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-navy-950 border border-navy-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Categories</option>
            <option value="ENVIRONMENTAL">Environmental</option>
            <option value="AIR_QUALITY">Air Quality</option>
            <option value="ENERGY_METER">Energy Meter</option>
            <option value="WATER_MONITORING">Water Monitoring</option>
          </select>
        </div>
      </div>

      {/* Devices Data Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Device ID & Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Zone Location</th>
                <th className="p-4">Protocol & Gateway</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredDevices.map((dev) => (
                <tr key={dev.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{dev.name}</div>
                    <div className="font-mono text-[10px] text-emerald-400">{dev.deviceId}</div>
                  </td>

                  <td className="p-4 font-medium text-slate-300">{dev.category}</td>

                  <td className="p-4 font-bold text-white">{dev.zoneLocation}</td>

                  <td className="p-4 font-mono text-slate-400">
                    {dev.protocol} • {dev.gatewayId || 'GW-MAIN-01'}
                  </td>

                  <td className="p-4">
                    <Badge variant={dev.status === 'ONLINE' ? 'success' : 'danger'}>
                      {dev.status}
                    </Badge>
                  </td>

                  <td className="p-4 text-right">
                    <Link href={`/admin/iot/devices/${dev.deviceId}`}>
                      <button
                        title="View Device Telemetry"
                        className="p-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 text-slate-300 border border-navy-800"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Device Modal */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Register New IoT Smart Device"
      >
        <form onSubmit={handleRegisterDevice} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Device Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. VIP Canopy Humidity & Air Sensor"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none"
              >
                <option value="ENVIRONMENTAL">Environmental</option>
                <option value="AIR_QUALITY">Air Quality</option>
                <option value="ENERGY_METER">Energy Meter</option>
                <option value="WATER_MONITORING">Water Monitoring</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Protocol</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none"
              >
                <option value="MQTT">MQTT (Lightweight Publish/Subscribe)</option>
                <option value="HTTPS_REST">HTTPS REST API</option>
                <option value="MODBUS">MODBUS Industrial</option>
                <option value="BACNET">BACnet Building Control</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Zone Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Substation Alpha / Gate A"
              value={zoneLocation}
              onChange={(e) => setZoneLocation(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Register Device Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
