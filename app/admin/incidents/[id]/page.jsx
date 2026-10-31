'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  ShieldAlert,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Users,
  MapPin,
  Calendar,
  MessageSquare,
  Siren,
  PhoneCall,
  Activity,
  Layers,
  FileCheck,
  Check,
  Radio,
  Share2,
  CheckCircle
} from 'lucide-react';

export default function AdminIncidentDetailsPage() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [responseTeams, setResponseTeams] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Note addition
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Status transition state
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Escalation modal
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateTo, setEscalateTo] = useState('');
  const [escalateReason, setEscalateReason] = useState('');
  const [escalateDirectives, setEscalateDirectives] = useState('');

  // Resolution modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [preventativeAction, setPreventativeAction] = useState('');
  const [signOffOfficer, setSignOffOfficer] = useState('');

  // Emergency Broadcast modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastRecipientGroup, setBroadcastRecipientGroup] = useState('STADIUM_SECURITY');
  const [broadcastChannel, setBroadcastChannel] = useState('SMS_AND_RADIO');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(null);

  const fetchIncidentDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/incidents/${id}`);
      const json = await res.json();
      if (json.success) {
        setIncident(json.incident);
        setResponseTeams(json.responseTeams);
        setStatuses(json.statuses);
      }
    } catch (err) {
      console.error('Failed to load incident details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentDetails();
  }, [id]);

  const handleStatusTransition = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus,
          noteText: `Workflow status updated to ${newStatus} by Operations Command.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIncident(data.incident);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignTeam = async (teamId) => {
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus: 'ASSIGNED',
          assignedTeamId: teamId,
          noteText: `Response team reassigned to ${teamId}.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIncident(data.incident);
      }
    } catch (err) {
      console.error('Error assigning team:', err);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setIsAddingNote(true);
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus: incident.status,
          noteText: newNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIncident(data.incident);
        setNewNote('');
      }
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleExecuteEscalation = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus: 'ESCALATED',
          escalationDetails: {
            escalateTo,
            reason: escalateReason,
            tacticalDirectives: escalateDirectives,
          },
          noteText: `ESCALATION: Incident escalated to ${escalateTo}. Directives: ${escalateDirectives}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIncident(data.incident);
        setIsEscalateModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteResolution = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newStatus: 'RESOLVED',
          resolutionDetails: {
            resolvedBy: 'EOC Incident Controller',
            resolutionSummary,
            rootCause,
            preventativeAction,
            signOffOfficer,
          },
          noteText: `INCIDENT RESOLVED: ${resolutionSummary}. Root Cause: ${rootCause}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIncident(data.incident);
        setIsResolveModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendEmergencyBroadcast = async (e) => {
    e.preventDefault();
    setIsBroadcasting(true);
    setBroadcastSuccess(null);

    try {
      const res = await fetch('/api/emergency/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId: incident.id,
          recipientGroup: broadcastRecipientGroup,
          channel: broadcastChannel,
          message: broadcastMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBroadcastSuccess(data.message);
        setBroadcastMessage('');
        fetchIncidentDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (isLoading || !incident) {
    return (
      <div className="p-12 text-center text-slate-400 text-xs">
        Loading incident coordination console...
      </div>
    );
  }

  const workflowSteps = [
    'REPORTED',
    'ACKNOWLEDGED',
    'ASSIGNED',
    'IN_PROGRESS',
    'ESCALATED',
    'RESOLVED',
    'CLOSED',
  ];

  const currentStepIdx = workflowSteps.indexOf(incident.status);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/incidents">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold text-rose-400">{incident.id}</span>
              <Badge variant={incident.priority === 'CRITICAL' ? 'danger' : incident.priority === 'HIGH' ? 'warning' : 'info'} size="sm">
                {incident.priority} PRIORITY
              </Badge>
              <span className="text-[10px] text-slate-400 font-mono">
                {incident.category.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              {incident.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/admin/emergency-communications">
            <Button variant="outline" size="sm">
              <Radio className="w-4 h-4 mr-1 text-rose-400" />
              <span>Prepare Approved Communication</span>
            </Button>
          </Link>

          {incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && (
            <Button
              variant="outline"
              size="sm"
              className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
              onClick={() => setIsEscalateModalOpen(true)}
            >
              <AlertTriangle className="w-4 h-4 mr-1 text-purple-400" />
              <span>Escalate</span>
            </Button>
          )}

          {incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsResolveModalOpen(true)}
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              <span>Resolve Incident</span>
            </Button>
          )}
        </div>
      </div>

      {/* Incident Status Workflow Bar (Requirement 5) */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 border-b border-navy-800 pb-2">
          <span>Incident Status Workflow Pipeline</span>
          <span className="font-mono text-emerald-400">Current: {incident.status}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {workflowSteps.map((step, idx) => {
            const isCompleted = idx <= currentStepIdx;
            const isCurrent = incident.status === step;

            return (
              <button
                key={step}
                onClick={() => handleStatusTransition(step)}
                disabled={isUpdatingStatus}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? 'bg-rose-500/20 border-rose-500 text-white font-bold shadow-lg shadow-rose-500/10'
                    : isCompleted
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-navy-950 border-navy-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="text-[10px] font-mono flex items-center justify-center space-x-1">
                  {isCompleted && !isCurrent && <Check className="w-3 h-3 text-emerald-400" />}
                  <span>{step.replace('_', ' ')}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Details & Coordination */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details, Timeline, Notes, Escalation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Incident Overview Card */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Incident Overview & Situation Report</span>
            </h2>

            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 text-xs text-slate-300 space-y-3 leading-relaxed">
              <p>{incident.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-navy-900 text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Zone Location</span>
                  <span className="font-bold text-emerald-400">{incident.zoneLocation}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Event Reference</span>
                  <span className="font-bold text-white">{incident.eventReference}</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Reporting User</span>
                  <span className="text-white">{incident.reportedBy.name} ({incident.reportedBy.role})</span>
                </div>

                <div>
                  <span className="text-slate-500 block text-[9px] uppercase">Reported Contact</span>
                  <span className="text-slate-300">{incident.reportedBy.contact}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Escalation Record Banner if Present */}
          {incident.escalationRecord && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-200 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-purple-300">
                <AlertTriangle className="w-4 h-4 text-purple-400" />
                <span>OFFICIAL ESCALATION RECORD (TIER 2 DIRECTIVE)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div>Escalated To: <strong>{incident.escalationRecord.escalateTo}</strong></div>
                <div>Escalated At: {new Date(incident.escalationRecord.escalatedAt).toLocaleTimeString()}</div>
              </div>
              <p className="text-[11px] text-slate-300 pt-1">
                <strong>Reason:</strong> {incident.escalationRecord.reason}
              </p>
              <p className="text-[11px] text-slate-300">
                <strong>Tactical Directives:</strong> {incident.escalationRecord.tacticalDirectives}
              </p>
            </div>
          )}

          {/* Resolution Record Banner if Present */}
          {incident.resolution && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-200 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-emerald-300">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>FORMAL RESOLUTION & ROOT CAUSE SIGN-OFF</span>
              </div>
              <p className="text-[11px] text-slate-300">
                <strong>Summary:</strong> {incident.resolution.resolutionSummary}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 font-mono">
                <div>Root Cause: {incident.resolution.rootCause}</div>
                <div>Sign-off: {incident.resolution.signOffOfficer}</div>
              </div>
              <p className="text-[11px] text-slate-400">
                <strong>Preventative Measure:</strong> {incident.resolution.preventativeAction}
              </p>
            </div>
          )}

          {/* Response Notes Chronolog */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>Response Chronolog & Operations Notes</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                {incident.responseNotes?.length || 0} Entries
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {incident.responseNotes?.map((n) => (
                <div key={n.id} className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{n.author}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{n.note}</p>
                </div>
              ))}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="flex gap-2 pt-2 border-t border-navy-800">
              <input
                type="text"
                placeholder="Type operational update, responder message or observation..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <Button variant="primary" size="sm" type="submit" disabled={isAddingNote || !newNote.trim()}>
                <Send className="w-3.5 h-3.5 mr-1" />
                <span>Post Note</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Right Col: Team Assignment, Timestamps, Comms */}
        <div className="space-y-6">
          {/* Response Team Assignment Card */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Assigned Response Unit</span>
              </h2>
              {incident.assignedTeam && (
                <Badge variant="success" size="sm">DISPATCHED</Badge>
              )}
            </div>

            {incident.assignedTeam ? (
              <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1.5 text-xs">
                <div className="font-bold text-white text-sm">{incident.assignedTeam.name}</div>
                <div className="text-[11px] text-emerald-400 font-mono">Lead: {incident.assignedTeam.leadOfficer}</div>
                <div className="text-[10px] text-slate-400 font-mono">Unit ID: {incident.assignedTeam.id}</div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                No response team currently assigned. Choose an available unit below.
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-slate-300 text-xs font-semibold block">Re-assign Response Team</label>
              <select
                onChange={(e) => {
                  if (e.target.value) handleAssignTeam(e.target.value);
                }}
                defaultValue=""
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="" disabled>-- Select Unit to Dispatch --</option>
                {responseTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Tracking Card */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Response Time Milestones</span>
              </h2>
              <span className="text-[10px] font-mono text-slate-400">Record timestamps (source-dependent)</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between p-2 rounded-lg bg-navy-950 border border-navy-850">
                <span className="text-slate-400">1. Reported:</span>
                <span className="text-white font-bold">
                  {new Date(incident.timestamps.reportedAt).toLocaleTimeString()}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-navy-950 border border-navy-850">
                <span className="text-slate-400">2. Acknowledged:</span>
                <span className={incident.timestamps.acknowledgedAt ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {incident.timestamps.acknowledgedAt ? new Date(incident.timestamps.acknowledgedAt).toLocaleTimeString() : 'Pending'}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-navy-950 border border-navy-850">
                <span className="text-slate-400">3. Dispatched:</span>
                <span className={incident.timestamps.dispatchedAt ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {incident.timestamps.dispatchedAt ? new Date(incident.timestamps.dispatchedAt).toLocaleTimeString() : 'Pending'}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-navy-950 border border-navy-850">
                <span className="text-slate-400">4. On Scene:</span>
                <span className={incident.timestamps.onSceneAt ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                  {incident.timestamps.onSceneAt ? new Date(incident.timestamps.onSceneAt).toLocaleTimeString() : 'Pending'}
                </span>
              </div>

              <div className="flex justify-between p-2 rounded-lg bg-navy-950 border border-navy-850">
                <span className="text-slate-400">5. Resolved:</span>
                <span className={incident.timestamps.resolvedAt ? 'text-teal-400 font-bold' : 'text-slate-600'}>
                  {incident.timestamps.resolvedAt ? new Date(incident.timestamps.resolvedAt).toLocaleTimeString() : 'Open'}
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Communication Dispatch History */}
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-purple-400" />
                <span>Communication Records</span>
              </h2>
              <span className="text-[10px] font-mono text-purple-400">
                {incident.communicationLogs?.length || 0} simulated records
              </span>
            </div>

            <div className="space-y-2">
              {incident.communicationLogs?.length === 0 ? (
                <div className="text-slate-500 text-xs italic">
                  No communication records are available for this incident.
                </div>
              ) : (
                incident.communicationLogs?.map((c) => (
                  <div key={c.id} className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-white">
                      <span>{c.recipientGroup}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">{c.deliveryStatus}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{c.messagePreview || c.message}</p>
                    <div className="text-[9px] text-slate-500 font-mono flex justify-between pt-1">
                      <span>Channel: {c.channel}</span>
                      <span>{new Date(c.recordedAt || c.sentAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Escalation Modal */}
      <Modal
        isOpen={isEscalateModalOpen}
        onClose={() => setIsEscalateModalOpen(false)}
        title="Escalate Incident to Tier 2 Command"
      >
        <form onSubmit={handleExecuteEscalation} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
            Escalating will raise incident priority to <strong>CRITICAL</strong> and alert the Executive Stadium Safety Officer and national emergency services.
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Escalate To Agency / Authority *</label>
            <input
              type="text"
              value={escalateTo}
              onChange={(e) => setEscalateTo(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Escalation Justification *</label>
            <textarea
              rows={2}
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Tactical Operational Directives *</label>
            <textarea
              rows={2}
              value={escalateDirectives}
              onChange={(e) => setEscalateDirectives(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsEscalateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Confirm Escalation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Resolution Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Record Formal Incident Resolution"
      >
        <form onSubmit={handleExecuteResolution} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Resolution Summary *</label>
            <textarea
              rows={2}
              placeholder="Detail actions taken to stabilize situation..."
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Root Cause Determination *</label>
            <input
              type="text"
              placeholder="e.g. Patron dehydration / faulty RJ45 cable pin"
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Preventative Action Required</label>
            <input
              type="text"
              placeholder="e.g. Post-match connector inspection"
              value={preventativeAction}
              onChange={(e) => setPreventativeAction(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Sign-off Officer</label>
            <input
              type="text"
              value={signOffOfficer}
              onChange={(e) => setSignOffOfficer(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Sign-off & Resolve
            </Button>
          </div>
        </form>
      </Modal>

      {/* Emergency Broadcast Modal */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => {
          setIsBroadcastModalOpen(false);
          setBroadcastSuccess(null);
        }}
        title="Dispatch Emergency Responder Broadcast"
      >
        <form onSubmit={handleSendEmergencyBroadcast} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300">
            Dispatches priority emergency SMS, Push Notification, and Radio alert to active duty stadium responders.
          </div>

          {broadcastSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{broadcastSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Target Group</label>
              <select
                value={broadcastRecipientGroup}
                onChange={(e) => setBroadcastRecipientGroup(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="STADIUM_SECURITY">Stadium Security & Police</option>
                <option value="MEDICAL_TEAMS">Medical & First Aid Teams</option>
                <option value="FACILITIES_PERSONNEL">Facilities Rapid Response</option>
                <option value="EVENT_OPERATIONS">Event Operations & Stewards</option>
                <option value="MANAGEMENT">Executive Directorate</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Delivery Channel</label>
              <select
                value={broadcastChannel}
                onChange={(e) => setBroadcastChannel(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="SMS_AND_RADIO">SMS + Radio Dispatch</option>
                <option value="SMS">SMS Only</option>
                <option value="PUSH_NOTIFICATION">Mobile App Push Notification</option>
                <option value="EMAIL_BROADCAST">Email Broadcast</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Broadcast Message *</label>
            <textarea
              rows={3}
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsBroadcastModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isBroadcasting || !broadcastMessage.trim()}>
              <Send className="w-3.5 h-3.5 mr-1" />
              <span>{isBroadcasting ? 'Dispatching...' : 'Dispatch Broadcast'}</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
