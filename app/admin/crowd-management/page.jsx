'use client';

import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import { initialStadiumZones } from '../../api/crowd/zones/route';
import { initialIncidents } from '../../api/crowd/incidents/route';
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Activity,
  RefreshCw,
  Plus,
  Clock,
  MapPin,
  Building2,
  Check
} from 'lucide-react';

export default function AdminCrowdManagementPage() {
  const [zones, setZones] = useState(initialStadiumZones);
  const [incidents, setIncidents] = useState(initialIncidents);
  const [isLoading, setIsLoading] = useState(true);

  // New Incident Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [classification, setClassification] = useState('CONGESTION_BOTTLENECK');
  const [location, setLocation] = useState('');
  const [severity, setSeverity] = useState('WARNING');
  const [assignedUnit, setAssignedUnit] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCrowdData = async () => {
    setIsLoading(true);
    try {
      const resZones = await fetch('/api/crowd/zones');
      const dataZones = await resZones.json();
      if (dataZones.success && dataZones.zones) setZones(dataZones.zones);

      const resInc = await fetch('/api/crowd/incidents');
      const dataInc = await resInc.json();
      if (dataInc.success && dataInc.incidents) setIncidents(dataInc.incidents);
    } catch (err) {
      console.warn('Using local crowd fallback data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrowdData();
  }, []);

  const handleRegisterIncident = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/crowd/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classification,
          location,
          severity,
          assignedUnit,
          description,
        }),
      });

      const data = await res.json();
      if (data.success && data.incident) {
        setIncidents((prev) => [data.incident, ...prev]);
        setModalOpen(false);
      }
    } catch (err) {
      alert('Error registering safety incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveIncident = async (id) => {
    try {
      const response = await fetch('/api/crowd/incidents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, responseStatus: 'RESOLVED' }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Incident status could not be updated.');
      setIncidents((prev) =>
        prev.map((i) => (i.id === id ? { ...i, responseStatus: 'RESOLVED' } : i))
      );
    } catch (err) {
      alert(err.message || 'Error resolving incident');
    }
  };

  const totalEntries = zones.reduce((sum, z) => sum + z.currentEntries, 0);
  const totalExits = zones.reduce((sum, z) => sum + z.currentExits, 0);
  const totalOccupancy = zones.reduce((sum, z) => sum + z.estimatedOccupancy, 0);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 font-semibold tracking-wide text-amber-300">DEVELOPMENT SIMULATION ONLY</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Intelligent Crowd Management & Safety
            </h1>
            <p className="text-xs text-slate-400">
Fixture counts only. No live gate sensors or crowd-monitoring hardware are connected; do not use these values for safety decisions.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Button variant="secondary" size="sm" onClick={fetchCrowdData}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Button variant="primary" onClick={() => setModalOpen(true)} className="space-x-2">
            <Plus className="w-4 h-4" />
            <span>Report Safety Incident</span>
          </Button>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center space-x-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
This demo uses static aggregate fixtures and receives no live sensor feed. It does not establish operational privacy compliance or indicate that stadium sensors are connected.
        </span>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Simulated Occupancy"
          value={totalOccupancy.toLocaleString()}
          subtitle="No verified capacity or occupancy"
          icon={Users}
          accentColor="emerald"
        />

        <StatCard
          title="Simulated Gate Entries"
          value={totalEntries.toLocaleString()}
          subtitle="Not physical turnstile scans"
          icon={CheckCircle}
          accentColor="emerald"
        />

        <StatCard
          title="Simulated Venue Exits"
          value={totalExits.toLocaleString()}
          subtitle="Not physical egress scans"
          icon={Activity}
          accentColor="sky"
        />

        <StatCard
          title="Active Safety Incidents"
          value={incidents.filter((i) => i.responseStatus !== 'RESOLVED').length.toString()}
          subtitle="Emergency Response Units On-Scene"
          icon={AlertTriangle}
          accentColor="gold"
        />
      </div>

      {/* Visual Stadium Zone Map & Density Heatmap */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Visual Floorplan Density Map</span>
            <h2 className="text-lg font-bold text-white">Stadium Zone Density Heatmap</h2>
          </div>
          <Badge variant="success">5 Zones Active</Badge>
        </div>

        {/* Heatmap Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((z) => (
            <div
              key={z.id}
              className={`p-5 rounded-2xl border space-y-3 transition-all ${
                z.densityStatus === 'CONGESTED'
                  ? 'bg-amber-500/10 border-amber-500/40 text-slate-100 shadow-amber-500/10 shadow-lg'
                  : z.densityStatus === 'CRITICAL'
                  ? 'bg-red-500/15 border-red-500 text-white shadow-red-500/20 shadow-xl'
                  : 'bg-navy-950 border-navy-800 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-base block">{z.name}</span>
                  <span className="text-[10px] text-slate-400">{z.building}</span>
                </div>
                <Badge
                  variant={
                    z.densityStatus === 'CONGESTED' || z.densityStatus === 'CRITICAL'
                      ? 'warning'
                      : 'success'
                  }
                >
                  {z.densityStatus}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Capacity Load:</span>
                  <span className="font-mono font-bold text-emerald-400">{z.occupancyPercentage}%</span>
                </div>
                <div className="w-full bg-navy-900 rounded-full h-2.5 overflow-hidden border border-navy-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      z.occupancyPercentage > 70 ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${z.occupancyPercentage}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-navy-800/80 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Occupancy</span>
                  <span className="font-bold text-white">{z.estimatedOccupancy.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Approved Limit</span>
                  <span className="font-bold text-slate-300">{z.approvedCapacity.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Incident & Emergency Response Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Safety Incidents & Emergency Responses</span>
          </h3>
          <Badge variant="warning">{incidents.filter((i) => i.responseStatus !== 'RESOLVED').length} Active</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Incident ID & Classification</th>
                <th className="p-4">Location</th>
                <th className="p-4">Assigned Response Unit</th>
                <th className="p-4">Description</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono font-bold text-white">{inc.id}</div>
                    <Badge variant={inc.severity === 'URGENT' ? 'danger' : 'warning'} size="sm" className="mt-1">
                      {inc.classification}
                    </Badge>
                  </td>

                  <td className="p-4 font-bold text-white">{inc.location}</td>

                  <td className="p-4 font-medium text-emerald-400">{inc.assignedUnit}</td>

                  <td className="p-4 text-slate-300 text-[11px] max-w-xs">{inc.description}</td>

                  <td className="p-4">
                    <Badge variant={inc.responseStatus === 'RESOLVED' ? 'success' : 'warning'}>
                      {inc.responseStatus}
                    </Badge>
                  </td>

                  <td className="p-4 text-right">
                    {inc.responseStatus !== 'RESOLVED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleResolveIncident(inc.id)}
                        className="space-x-1 py-1 px-3"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Resolve Incident</span>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Registration Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Report Matchday Safety Incident"
      >
        <form onSubmit={handleRegisterIncident} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Classification</label>
              <select
                value={classification}
                onChange={(e) => setClassification(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none"
              >
                <option value="CONGESTION_BOTTLENECK">Congestion Bottleneck</option>
                <option value="MEDICAL">Medical Emergency</option>
                <option value="PERIMETER_SECURITY">Perimeter Security</option>
                <option value="OBSTRUCTION">Evacuation Obstruction</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none"
              >
                <option value="WARNING">WARNING</option>
                <option value="URGENT">URGENT</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Incident Location *</label>
            <input
              type="text"
              required
              placeholder="e.g. Gate B Lower Concourse"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Assigned Response Unit</label>
            <input
              type="text"
              required
              placeholder="e.g. G4S Unit 2 / St John Medical"
              value={assignedUnit}
              onChange={(e) => setAssignedUnit(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Description *</label>
            <textarea
              rows={3}
              required
              placeholder="Describe crowd density, bottleneck cause, or medical situation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Dispatch Emergency Incident
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
