'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import {
  Tv,
  Siren,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Layers,
  MapPin,
  Play,
  ShieldCheck,
  Radio,
  Sliders,
  XCircle,
  Video,
  FileText
} from 'lucide-react';

export default function AdminDigitalSignageOverviewPage() {
  const [screens, setScreens] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Emergency Display Override Modal State (Requirement 7)
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyTitle, setEmergencyTitle] = useState('');
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [targetCategory, setTargetCategory] = useState('ALL');
  const [authorizedOfficer, setAuthorizedOfficer] = useState('');
  const [confirmationPasscode, setConfirmationPasscode] = useState('');
  const [isSubmittingEmergency, setIsSubmittingEmergency] = useState(false);
  const [emergencyFeedback, setEmergencyFeedback] = useState(null);

  const fetchSignageData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/digital-signage/screens');
      const json = await res.json();
      if (json.success) {
        setScreens(json.screens);
        setMetrics(json.metrics);
      }
    } catch (err) {
      console.error('Failed to load digital signage data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSignageData();
  }, []);

  const handleTriggerEmergencyOverride = async (e) => {
    e.preventDefault();
    if (!confirmationPasscode) return;

    setIsSubmittingEmergency(true);
    setEmergencyFeedback(null);

    try {
      const res = await fetch('/api/digital-signage/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergencyTitle,
          emergencyMessage,
          targetCategory,
          authorizedOfficer,
          confirmationPasscode,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setEmergencyFeedback(data.message);
        fetchSignageData();
        setTimeout(() => {
          setIsEmergencyModalOpen(false);
          setConfirmationPasscode('');
          setEmergencyFeedback(null);
        }, 2000);
      }
    } catch (err) {
      console.error('Error triggering emergency override:', err);
    } finally {
      setIsSubmittingEmergency(false);
    }
  };

  const handleClearEmergencyOverride = async () => {
    try {
      const res = await fetch('/api/digital-signage/emergency', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchSignageData();
      }
    } catch (err) {
      console.error('Error clearing emergency override:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Tv className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">SMART DISPLAY PLATFORM</Badge>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-semibold">
                SIMULATED / UNVERIFIED
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Digital Signage & Display Operations
            </h1>
            <p className="text-xs text-slate-400">
              Development signage inventory only. No physical display connection or real-time telemetry is verified.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled title="Use the approved emergency communications workflow; no physical signage adapter is verified.">
            <Siren className="w-4 h-4 mr-1 text-rose-400" />
            <span>Legacy emergency override unavailable</span>
          </Button>

          <Link href="/admin/digital-signage/screens">
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              <span>Register Screen</span>
            </Button>
          </Link>

          <Button variant="secondary" size="sm" onClick={fetchSignageData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Safety Warning Requirement 7 */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-rose-500/30 flex items-start space-x-3 text-xs text-slate-300 shadow-lg">
        <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-white flex items-center space-x-2">
            <span>Public Safety Display Mandate</span>
            <Badge variant="warning" size="sm">SUPERVISORY SYSTEM</Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Emergency signage publishing capability provides visual advisories; it <strong>must not replace certified fire alarms, physical sirens, evacuation systems or emergency public-address infrastructure</strong>.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Display Displays"
          value={metrics ? metrics.totalScreens.toString() : '6'}
          subtitle={`${metrics?.onlineScreens || 5} Online | ${metrics?.offlineScreens || 1} Offline`}
          icon={Tv}
          accentColor="sky"
        />

        <StatCard
          title="Network Sync Health"
          value={metrics ? `${metrics.syncHealthPercent}%` : '83%'}
          subtitle="Real-Time Player Telemetry"
          icon={CheckCircle2}
          accentColor="emerald"
        />

        <StatCard
          title="Active Content Assets"
          value={metrics ? metrics.totalContent.toString() : '5'}
          subtitle="4K UHD, FHD & Ultra-Wide"
          icon={FileText}
          accentColor="gold"
        />

        <StatCard
          title="Active Playlists & Schedules"
          value={metrics ? metrics.totalPlaylists.toString() : '3'}
          subtitle="Scheduled Matchday Streams"
          icon={Layers}
          accentColor="purple"
        />
      </div>

      {/* Navigation Quick Links Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/admin/digital-signage/screens">
          <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all text-center space-y-1 group">
            <Tv className="w-5 h-5 text-emerald-400 mx-auto group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">Screen Registry</span>
            <span className="text-[10px] text-slate-400 block">Manage 6 Stadium Displays</span>
          </div>
        </Link>

        <Link href="/admin/digital-signage/content">
          <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all text-center space-y-1 group">
            <Video className="w-5 h-5 text-sky-400 mx-auto group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">Content Library</span>
            <span className="text-[10px] text-slate-400 block">Upload & Approve Assets</span>
          </div>
        </Link>

        <Link href="/admin/digital-signage/playlists">
          <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all text-center space-y-1 group">
            <Layers className="w-5 h-5 text-purple-400 mx-auto group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">Playlists & Player</span>
            <span className="text-[10px] text-slate-400 block">Arrange Loops & Preview</span>
          </div>
        </Link>

        <Link href="/admin/digital-signage/schedules">
          <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all text-center space-y-1 group">
            <Clock className="w-5 h-5 text-amber-400 mx-auto group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">Publication Schedules</span>
            <span className="text-[10px] text-slate-400 block">Screen Assignments & Timing</span>
          </div>
        </Link>
      </div>

      {/* Screen Telemetry & Real-Time Distribution Status Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Live Screen Hardware Telemetry & Current Playlists</h2>
          <span className="text-[10px] text-emerald-400 font-mono">Heartbeat Rate: 15s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Screen ID & Name</th>
                <th className="p-4">Location / Zone</th>
                <th className="p-4">Resolution & Player</th>
                <th className="p-4">Current Playlist / Broadcast</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Last Sync</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {screens.map((s) => (
                <tr key={s.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono font-bold text-white">{s.id}</div>
                    <div className="text-[11px] text-slate-300 font-bold mt-0.5">{s.name}</div>
                  </td>

                  <td className="p-4">
                    <div className="text-slate-200">{s.location}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{s.category.replace('_', ' ')}</div>
                  </td>

                  <td className="p-4 font-mono text-[11px]">
                    <div className="text-white">{s.resolution}</div>
                    <div className="text-slate-400 text-[10px]">{s.connectedPlayer}</div>
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-emerald-400 text-xs">{s.currentPlaylistName}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{s.activeContentTitle}</div>
                  </td>

                  <td className="p-4">
                    {s.status === 'ONLINE' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">ONLINE</span>
                    ) : s.status === 'EMERGENCY_OVERRIDE' ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-black animate-pulse">EMERGENCY OVERRIDE</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30 text-[10px] font-bold">OFFLINE</span>
                    )}
                  </td>

                  <td className="p-4 text-right font-mono text-[10px] text-slate-400">
                    {new Date(s.lastSyncAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Display Override Modal (Requirement 7) */}
      <Modal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        title="Legacy emergency signage action unavailable"
      >
        <form onSubmit={handleTriggerEmergencyOverride} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
            <div className="font-bold flex items-center space-x-1.5">
              <Siren className="w-4 h-4 text-amber-400" />
              <span>NO PHYSICAL SIGNAGE CONNECTION VERIFIED</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              This legacy action is disabled. Prepare messages in the approved emergency-communications workflow; certified life-safety systems remain independent.
            </p>
          </div>

          {emergencyFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{emergencyFeedback}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Emergency Directive Title *</label>
            <input
              type="text"
              value={emergencyTitle}
              onChange={(e) => setEmergencyTitle(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Instructional Message for Displays *</label>
            <textarea
              rows={2}
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Target Display Category</label>
              <select
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">All Stadium Displays (6 Screens)</option>
                <option value="CONCOURSE_WAYFINDING">Concourse Wayfinding Only</option>
                <option value="SECTOR_TICKETING">Sector Ticketing Displays Only</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Authorizing Officer Signature *</label>
              <input
                type="text"
                value={authorizedOfficer}
                onChange={(e) => setAuthorizedOfficer(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Security Passcode Confirmation *</label>
            <input
              type="password"
              placeholder="Enter EOC safety override passcode..."
              value={confirmationPasscode}
              onChange={(e) => setConfirmationPasscode(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsEmergencyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmittingEmergency || !confirmationPasscode}>
              Confirm & Override Displays
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
