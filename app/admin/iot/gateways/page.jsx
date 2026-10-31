'use client';

import React, { useState } from 'react';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import StatCard from '../../../../components/StatCard';
import {
  Wifi,
  Activity,
  CheckCircle,
  RefreshCw,
  Search,
  Server
} from 'lucide-react';

export default function AdminIoTGatewaysPage() {
  const [gateways, setGateways] = useState([
    { id: 'GW-MQTT-PITCH-01', name: 'Main Pitch Climate Gateway', protocol: 'MQTT', brokerUrl: 'mqtts://iot-broker.sttech.co.ke:8883', connectedDevices: 8, status: 'ONLINE', messageRate: '45 msgs/sec' },
    { id: 'GW-MQTT-GATEA-01', name: 'Concourse Air Quality Gateway', protocol: 'MQTT', brokerUrl: 'mqtts://iot-broker.sttech.co.ke:8883', connectedDevices: 12, status: 'ONLINE', messageRate: '60 msgs/sec' },
    { id: 'GW-MODBUS-SUB01', name: 'Substation Alpha Power Gateway', protocol: 'MODBUS', brokerUrl: 'tcp://192.168.10.50:502', connectedDevices: 6, status: 'ONLINE', messageRate: '15 msgs/sec' },
    { id: 'GW-BACNET-WATER-01', name: 'Precinct Drainage BACnet Gateway', protocol: 'BACNET', brokerUrl: 'bacnet://192.168.20.10:47808', connectedDevices: 4, status: 'MAINTENANCE', messageRate: '0 msgs/sec' },
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            IOT BROKER & PROTOCOL GATEWAYS
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            IoT Gateways & Message Brokers
          </h1>
          <p className="text-xs text-slate-400">
            Monitor MQTT message brokers, BACnet building controllers, and MODBUS industrial gateways.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Gateways"
          value={gateways.length.toString()}
          subtitle="MQTT / Modbus / BACnet"
          icon={Server}
          accentColor="emerald"
        />

        <StatCard
          title="Connected Devices"
          value="30 Sensors"
          subtitle="Physical IoT Endpoints"
          icon={CheckCircle}
          accentColor="emerald"
        />

        <StatCard
          title="Message Ingestion Rate"
          value="120 / sec"
          subtitle="Broker Ingestion"
          icon={Activity}
          accentColor="sky"
        />

        <StatCard
          title="Protocol Encryption"
          value="TLS 1.3"
          subtitle="Encrypted MQTT & REST"
          icon={Wifi}
          accentColor="gold"
        />
      </div>

      {/* Gateways Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Gateway ID & Name</th>
                <th className="p-4">Protocol</th>
                <th className="p-4">Broker / Endpoint URL</th>
                <th className="p-4">Connected Devices</th>
                <th className="p-4">Message Rate</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {gateways.map((gw) => (
                <tr key={gw.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{gw.name}</div>
                    <div className="font-mono text-[10px] text-emerald-400">{gw.id}</div>
                  </td>

                  <td className="p-4 font-bold text-white">{gw.protocol}</td>

                  <td className="p-4 font-mono text-slate-400 text-[11px]">{gw.brokerUrl}</td>

                  <td className="p-4 font-bold text-white">{gw.connectedDevices} Devices</td>

                  <td className="p-4 font-mono font-bold text-emerald-400">{gw.messageRate}</td>

                  <td className="p-4">
                    <Badge variant={gw.status === 'ONLINE' ? 'success' : 'danger'}>
                      {gw.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
