'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import { initialIoTDevices, initialIoTAlerts } from '../../../lib/mockData';
import {
  Cpu,
  Wifi,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle,
  RefreshCw,
  Search,
  Plus,
  ArrowRight,
  Gauge,
  Wind,
  Droplets,
  Thermometer
} from 'lucide-react';

export default function AdminIoTPlatformDashboardPage() {
  const [devices, setDevices] = useState(initialIoTDevices);
  const [alerts, setAlerts] = useState(initialIoTAlerts);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchIoTData = async () => {
    setIsRefreshing(true);
    try {
      const resDev = await fetch('/api/iot/devices');
      const dataDev = await resDev.json();
      if (dataDev.success && dataDev.devices) setDevices(dataDev.devices);

      const resAlt = await fetch('/api/iot/alerts');
      const dataAlt = await resAlt.json();
      if (dataAlt.success && dataAlt.alerts) setAlerts(dataAlt.alerts);
    } catch (err) {
      console.warn('Using local fallback IoT data');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIoTData();
    const interval = setInterval(fetchIoTData, 5000); // Poll every 5 sec
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledgeAlert = async (id) => {
    try {
      await fetch('/api/iot/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    } catch (err) {
      console.warn('Error acknowledging alert');
    }
  };

  const onlineCount = devices.filter((d) => d.status === 'ONLINE').length;
  const pendingAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">IOT & SMART DEVICE PLATFORM</Badge>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center space-x-1">
                <Wifi className="w-3 h-3 text-emerald-400 animate-pulse mr-1" /> MQTT / REST LIVE
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Stadium IoT Infrastructure Engine
            </h1>
            <p className="text-xs text-slate-400">
              Real-time environmental sensors, pitch climate monitors, power sub-metering, and gateway health.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm" onClick={fetchIoTData}>
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>

          <Link href="/admin/iot/devices">
            <Button variant="primary" className="space-x-2">
              <Plus className="w-4 h-4" />
              <span>Register Device</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Connected Devices"
          value={devices.length.toString()}
          subtitle="Registered Physical Sensors"
          icon={Cpu}
          accentColor="emerald"
        />

        <StatCard
          title="Online Devices"
          value={onlineCount.toString()}
          subtitle="Streaming Telemetry"
          icon={CheckCircle}
          accentColor="emerald"
        />

        <StatCard
          title="Pending Threshold Alerts"
          value={pendingAlertsCount.toString()}
          subtitle="Requires Operator Review"
          icon={AlertTriangle}
          accentColor="gold"
        />

        <StatCard
          title="Telemetry Data Velocity"
          value="120 / sec"
          subtitle="MQTT Broker Ingestion"
          icon={Activity}
          accentColor="sky"
        />
      </div>

      {/* Alert Feed & Live Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Threshold Alerts Feed */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Sensor Threshold Alerts</span>
            </h2>
            <Link href="/admin/iot/alerts" className="text-xs text-emerald-400 font-semibold hover:underline">
              View All Alerts
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No active threshold alerts.</div>
            ) : (
              alerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-4 rounded-2xl border space-y-2 transition-all ${
                    alt.severity === 'WARNING'
                      ? 'bg-amber-500/10 border-amber-500/40 text-slate-200'
                      : 'bg-navy-950 border-navy-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{alt.title}</span>
                    <Badge variant={alt.severity === 'WARNING' ? 'warning' : 'navy'} size="sm">
                      {alt.severity}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300">{alt.message}</p>

                  <div className="pt-2 flex items-center justify-between text-[10px]">
                    <span className="font-mono text-emerald-400">{alt.deviceId}</span>
                    {!alt.acknowledged ? (
                      <button
                        onClick={() => handleAcknowledgeAlert(alt.id)}
                        className="px-2.5 py-1 rounded bg-navy-950 hover:bg-navy-800 text-emerald-400 border border-navy-800 font-bold"
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span className="text-slate-500 font-semibold">Acknowledged</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Live Sensor Readings Stream */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-emerald-400" />
              <span>Live Sensor Telemetry Feed</span>
            </h2>
            <Badge variant="success">Simulated Dev Stream</Badge>
          </div>

          <div className="space-y-3">
            {devices.map((dev) => (
              <div key={dev.id} className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white block">{dev.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{dev.deviceId} • {dev.zoneLocation}</span>
                  </div>
                  <Badge variant={dev.status === 'ONLINE' ? 'success' : 'danger'}>{dev.status}</Badge>
                </div>

                {dev.latestReadings && (
                  <div className="pt-2 grid grid-cols-2 gap-2 text-xs font-mono">
                    {Object.entries(dev.latestReadings).map(([key, val]) => (
                      <div key={key} className="bg-navy-900 p-2 rounded-xl border border-navy-800/80 flex justify-between">
                        <span className="text-slate-400 uppercase text-[10px]">{key}:</span>
                        <span className="font-bold text-emerald-400">{val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
