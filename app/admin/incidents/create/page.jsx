'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  Building,
  Users,
  HeartPulse,
  Flame,
  ZapOff,
  Droplets,
  Wrench,
  HelpCircle
} from 'lucide-react';

export default function AdminCreateIncidentPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [responseTeams, setResponseTeams] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [category, setCategory] = useState('MEDICAL');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zoneLocation, setZoneLocation] = useState('');
  const [eventReference, setEventReference] = useState('EVT-2026-AFCON-01');
  const [priority, setPriority] = useState('MEDIUM');
  const [reportedByName, setReportedByName] = useState('Steward Field Unit');
  const [reportedByRole, setReportedByRole] = useState('STEWARD');
  const [reportedByContact, setReportedByContact] = useState('+254 711 000 000');
  const [assignedTeamId, setAssignedTeamId] = useState('');
  const [initialNote, setInitialNote] = useState('');

  useEffect(() => {
    async function loadMeta() {
      try {
        const res = await fetch('/api/incidents');
        const json = await res.json();
        if (json.success) {
          setCategories(json.categories);
          setResponseTeams(json.responseTeams);
        }
      } catch (err) {
        console.error('Failed to load incident categories:', err);
      }
    }
    loadMeta();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          title,
          description,
          zoneLocation,
          eventReference,
          priority,
          reportedByName,
          reportedByRole,
          reportedByContact,
          assignedTeamId: assignedTeamId || null,
          initialNote,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to create incident record');
      }

      router.push(`/admin/incidents/${data.incident.id}`);
    } catch (err) {
      setErrorMsg(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/admin/incidents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Back to Incidents Registry</span>
          </Button>
        </Link>
        <Badge variant="danger" size="sm">NEW INCIDENT INTAKE</Badge>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Log Stadium Emergency or Operational Incident</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture incident coordinates, assign response unit, and dispatch notifications across stadium command channels.
          </p>
        </div>

        {/* DPA Privacy Banner */}
        <div className="p-3.5 rounded-2xl bg-navy-950 border border-navy-800 text-xs text-slate-300 flex items-start space-x-3">
          <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white">Data Minimization Notice (Kenya Data Protection Act 2019)</span>
            <p className="text-[11px] text-slate-400">
              Collect only strictly necessary operational and situational data. Do not record patron personal national ID numbers, medical histories, or sensitive health data unless authorized for emergency medical transfer.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Category Selector */}
          <div className="space-y-2">
            <label className="text-slate-200 font-bold block">1. Incident Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-3 rounded-2xl border text-left transition-all space-y-1 ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500 text-white font-bold shadow-lg shadow-rose-500/10'
                        : 'bg-navy-950 border-navy-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs font-bold text-white">{c.label}</span>
                    <span className="block text-[10px] text-slate-400 line-clamp-1">{c.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Level */}
          <div className="space-y-2">
            <label className="text-slate-200 font-bold block">2. Incident Priority Level *</label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { level: 'LOW', color: 'slate', desc: 'No immediate safety threat' },
                { level: 'MEDIUM', color: 'sky', desc: 'Operational disruption' },
                { level: 'HIGH', color: 'amber', desc: 'Urgent crowd / medical response' },
                { level: 'CRITICAL', color: 'rose', desc: 'Life safety / code emergency' },
              ].map((p) => {
                const isSelected = priority === p.level;
                return (
                  <button
                    key={p.level}
                    type="button"
                    onClick={() => setPriority(p.level)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? p.level === 'CRITICAL'
                          ? 'bg-rose-500 text-white font-black border-rose-400 shadow-lg'
                          : 'bg-emerald-500 text-slate-950 font-black border-emerald-400 shadow-lg'
                        : 'bg-navy-950 border-navy-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="block text-xs">{p.level}</span>
                    <span className="block text-[9px] mt-0.5 opacity-80">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incident Title & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-200 font-bold block">Incident Title *</label>
              <input
                type="text"
                placeholder="e.g. Spectator Fainting / Gate Surge"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-200 font-bold block">Stadium Location or Zone *</label>
              <input
                type="text"
                placeholder="e.g. Gate B Concourse Turnstile 4 / Zone A Row 12"
                value={zoneLocation}
                onChange={(e) => setZoneLocation(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Detailed Description */}
          <div className="space-y-1.5">
            <label className="text-slate-200 font-bold block">Incident Situation Description *</label>
            <textarea
              rows={3}
              placeholder="Provide concise, objective observations of what happened, current status, and urgent needs..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 leading-relaxed"
              required
            />
          </div>

          {/* Assigned Response Team & Event Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-200 font-bold block">Assign Primary Response Team</label>
              <select
                value={assignedTeamId}
                onChange={(e) => setAssignedTeamId(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Leave Unassigned for Dispatcher --</option>
                {responseTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.status}) - Lead: {t.leadOfficer}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-200 font-bold block">Match / Event Reference</label>
              <input
                type="text"
                value={eventReference}
                onChange={(e) => setEventReference(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Reporting User Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-navy-950 border border-navy-800">
            <div className="space-y-1">
              <label className="text-slate-400 font-semibold text-[11px] block">Reporting Officer / User</label>
              <input
                type="text"
                value={reportedByName}
                onChange={(e) => setReportedByName(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold text-[11px] block">Reporter Role</label>
              <select
                value={reportedByRole}
                onChange={(e) => setReportedByRole(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="STEWARD">STEWARD</option>
                <option value="GATE_OPERATOR">GATE_OPERATOR</option>
                <option value="SECURITY">SECURITY</option>
                <option value="MEDICAL">MEDICAL</option>
                <option value="VENUE_MANAGER">VENUE_MANAGER</option>
                <option value="SYSTEM_ADMIN">SYSTEM_ADMIN</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-400 font-semibold text-[11px] block">Radio / Phone Contact</label>
              <input
                type="text"
                value={reportedByContact}
                onChange={(e) => setReportedByContact(e.target.value)}
                className="w-full bg-navy-900 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Initial Response Note */}
          <div className="space-y-1.5">
            <label className="text-slate-200 font-bold block">Initial Dispatch Note / Instructions</label>
            <input
              type="text"
              placeholder="e.g. Paramedic AED kit required. Clear gate ramp for fast access."
              value={initialNote}
              onChange={(e) => setInitialNote(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-navy-800">
            <Link href="/admin/incidents">
              <Button variant="secondary" size="sm" type="button">
                Cancel
              </Button>
            </Link>

            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              <Send className="w-4 h-4 mr-1.5" />
              <span>{isSubmitting ? 'Logging Incident...' : 'Log & Dispatch Incident'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
