'use client';

import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import { initialDigitalTwinAssets } from '../../api/digital-twin/assets/route';
import {
  Box,
  Layers,
  Cpu,
  Activity,
  CheckCircle,
  RefreshCw,
  Plus,
  Eye,
  MapPin,
  Building2,
  Zap,
  ShieldCheck,
  Info
} from 'lucide-react';

export default function AdminDigitalTwinPlatformPage() {
  const [assets, setAssets] = useState(initialDigitalTwinAssets);
  const [selectedZone, setSelectedZone] = useState('Main Bowl Pitch Surface');
  const [selectedAsset, setSelectedAsset] = useState(initialDigitalTwinAssets[0]);

  // Asset Registration Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [assetName, setAssetName] = useState('');
  const [category, setCategory] = useState('ENVIRONMENTAL_SENSOR');
  const [zoneLocation, setZoneLocation] = useState('Main Bowl Pitch Surface');
  const [coordX, setCoordX] = useState(0);
  const [coordY, setCoordY] = useState(1);
  const [coordZ, setCoordZ] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/digital-twin/assets');
      const data = await res.json();
      if (data.success && data.assets) setAssets(data.assets);
    } catch (err) {
      console.warn('Using local 3D assets fallback');
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleRegisterAsset = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/digital-twin/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: assetName,
          category,
          zoneLocation,
          coordinates3D: { x: Number(coordX), y: Number(coordY), z: Number(coordZ) },
        }),
      });

      const data = await res.json();
      if (data.success && data.asset) {
        setAssets((prev) => [data.asset, ...prev]);
        setModalOpen(false);
        setAssetName('');
      }
    } catch (err) {
      alert('Error registering 3D asset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const zonesList = [
    { name: 'Main Bowl Pitch Surface', assetCount: 2, status: 'ONLINE', temp: '24.5 °C' },
    { name: 'Gate A Concourse Corridor', assetCount: 4, status: 'ONLINE', scanRate: '480/min' },
    { name: 'South Infrastructure Precinct', assetCount: 3, status: 'INSPECTION_DUE', power: '850 kW' },
    { name: 'West Stand VIP Canopy', assetCount: 2, status: 'ONLINE', temp: '21.0 °C' },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <Box className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">3D DIGITAL TWIN & SPATIAL PLATFORM</Badge>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">WEBGL / THREE.JS</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Stadium 3D Digital Twin & Asset Platform
            </h1>
            <p className="text-xs text-slate-400">
              3D spatial visualization of stadium infrastructure, equipment asset locations, and live IoT telemetry overlays.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={fetchAssets}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button variant="primary" onClick={() => setModalOpen(true)} className="space-x-2">
            <Plus className="w-4 h-4" />
            <span>Register 3D Asset</span>
          </Button>
        </div>
      </div>

      {/* Model Disclaimer */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center space-x-3 text-xs text-slate-300">
        <Info className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
          <strong>Architectural Disclaimer:</strong> The 3D spatial Canvas below represents a conceptual WebGL demonstration layout. Upon civil engineering handover by CRBC/KDF, official GLTF/GLB 3D architectural models will replace the mesh.
        </span>
      </div>

      {/* Interactive 3D Canvas & Spatial Zone Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left WebGL 3D Canvas Viewport */}
        <div className="lg:col-span-7 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <span>3D Spatial WebGL Canvas Viewport</span>
            </h2>
            <Badge variant="success">3D Interactive</Badge>
          </div>

          {/* 3D Model Visualization Canvas Mock */}
          <div className="relative h-80 rounded-2xl bg-navy-950 border-2 border-navy-800 overflow-hidden flex flex-col items-center justify-center p-6 group">
            <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none"></div>

            {/* Conceptual 3D Stadium Mesh Representation */}
            <div className="w-64 h-44 border-4 border-emerald-500/60 rounded-3xl relative flex items-center justify-center transform -rotate-12 group-hover:rotate-0 transition-all duration-700 shadow-2xl shadow-emerald-500/20">
              <div className="w-44 h-28 border-2 border-dashed border-teal-400/80 rounded-2xl flex items-center justify-center">
                <span className="text-emerald-400 font-black text-xs tracking-widest uppercase">
                  Main Bowl Arena
                </span>
              </div>

              {/* 3D Asset Hotspots */}
              <div
                title="Pitch Grass Sensor (0, 0.5, 0)"
                onClick={() => setSelectedZone('Main Bowl Pitch Surface')}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-400 animate-ping cursor-pointer"
              ></div>

              <div
                title="Gate A Turnstiles (-45, 2.0, 20)"
                onClick={() => setSelectedZone('Gate A Concourse Corridor')}
                className="absolute top-2 left-2 w-3 h-3 rounded-full bg-teal-300 cursor-pointer"
              ></div>

              <div
                title="Substation Alpha (60, 1.0, -30)"
                onClick={() => setSelectedZone('South Infrastructure Precinct')}
                className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-amber-400 cursor-pointer"
              ></div>
            </div>

            <div className="absolute bottom-3 left-4 text-[10px] text-slate-400 font-mono">
              Controls: Click 3D hotspots to inspect zone assets • Orbit/Pan Enabled
            </div>
          </div>

          {/* Zone Selector Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {zonesList.map((z) => (
              <button
                key={z.name}
                onClick={() => setSelectedZone(z.name)}
                className={`p-2.5 rounded-xl border text-[11px] font-semibold text-left transition-all ${
                  selectedZone === z.name
                    ? 'bg-emerald-500/15 border-emerald-500 text-white'
                    : 'bg-navy-950 border-navy-800 text-slate-400 hover:border-navy-700'
                }`}
              >
                <span className="block truncate font-bold">{z.name}</span>
                <span className="text-[10px] text-emerald-400 font-mono">{z.assetCount} Assets</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Zone & Asset Inspector */}
        <div className="lg:col-span-5 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="border-b border-navy-800 pb-3">
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Zone Inspector</span>
            <h2 className="text-lg font-bold text-white">{selectedZone}</h2>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-white block">Connected Assets in Zone:</span>

            {assets
              .filter((a) => a.zoneLocation === selectedZone || selectedZone === 'Main Bowl Pitch Surface')
              .map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2 ${
                    selectedAsset?.id === asset.id
                      ? 'bg-emerald-500/10 border-emerald-500 text-white'
                      : 'bg-navy-950 border-navy-800 text-slate-300 hover:border-navy-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{asset.name}</span>
                    <Badge variant={asset.status === 'ONLINE' ? 'success' : 'warning'} size="sm">
                      {asset.status}
                    </Badge>
                  </div>

                  <div className="font-mono text-[11px] text-slate-400">
                    3D Coords: ({asset.coordinates3D.x}, {asset.coordinates3D.y}, {asset.coordinates3D.z})
                  </div>

                  {asset.lastTelemetry && (
                    <div className="p-2 rounded-xl bg-navy-900 border border-navy-800 text-[10px] font-mono text-emerald-400 flex flex-wrap gap-2">
                      {Object.entries(asset.lastTelemetry).map(([k, v]) => (
                        <span key={k}>{k}: <strong>{v}</strong></span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-navy-800">
          <h3 className="text-sm font-bold text-white">Registered Infrastructure Asset Location Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Asset Code & Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Zone Location</th>
                <th className="p-4">3D Spatial Coordinates (X, Y, Z)</th>
                <th className="p-4">Linked Device ID</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {assets.map((ast) => (
                <tr key={ast.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{ast.name}</div>
                    <div className="font-mono text-[10px] text-emerald-400">{ast.assetCode}</div>
                  </td>

                  <td className="p-4 font-bold text-white">{ast.category}</td>

                  <td className="p-4 text-slate-300">{ast.zoneLocation}</td>

                  <td className="p-4 font-mono font-bold text-white">
                    ({ast.coordinates3D.x}, {ast.coordinates3D.y}, {ast.coordinates3D.z})
                  </td>

                  <td className="p-4 font-mono text-emerald-400">{ast.linkedDeviceId}</td>

                  <td className="p-4">
                    <Badge variant={ast.status === 'ONLINE' ? 'success' : 'warning'}>
                      {ast.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Asset Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register 3D Infrastructure Asset"
      >
        <form onSubmit={handleRegisterAsset} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Asset Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. VIP Suite Climate Control Sensor"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
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
                <option value="ENVIRONMENTAL_SENSOR">Environmental Sensor</option>
                <option value="TURNSTILE_GATE">Turnstile Gate</option>
                <option value="ELECTRICAL_SUBSTATION">Electrical Substation</option>
                <option value="HVAC_EQUIPMENT">HVAC Equipment</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Zone Location</label>
              <input
                type="text"
                required
                value={zoneLocation}
                onChange={(e) => setZoneLocation(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 block">3D Spatial Placement Coordinates (X, Y, Z)</label>
            <div className="grid grid-cols-3 gap-2 font-mono">
              <input
                type="number"
                value={coordX}
                onChange={(e) => setCoordX(e.target.value)}
                placeholder="X"
                className="bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white"
              />
              <input
                type="number"
                value={coordY}
                onChange={(e) => setCoordY(e.target.value)}
                placeholder="Y"
                className="bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white"
              />
              <input
                type="number"
                value={coordZ}
                onChange={(e) => setCoordZ(e.target.value)}
                placeholder="Z"
                className="bg-navy-950 border border-navy-700 rounded-lg p-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Register 3D Asset
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
