'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, DoorOpen, KeyRound, LockKeyhole, Plus, RefreshCw, ShieldCheck,
} from 'lucide-react';

const zones = ['ALL', 'BOWL', 'CONCOURSE', 'ENTRANCE', 'EXIT', 'PARKING', 'ADMINISTRATION', 'CONTROL_ROOM', 'PITCH_SIDE', 'VIP', 'DATA_CENTRE', 'OTHER'];
const pointTypes = ['GATE', 'STAFF_ENTRANCE', 'RESTRICTED_DOOR', 'TURNSTILE', 'VEHICLE_GATE', 'OTHER'];
const inputClass = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none';
const panelClass = 'rounded-2xl border border-navy-800 bg-navy-900 shadow-xl';

function Status({ value, simulated }) {
  const tone = simulated
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    : value === 'ONLINE' || value === 'AUTHORIZED'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : value === 'DENIED' || value === 'OFFLINE'
        ? 'border-red-500/30 bg-red-500/10 text-red-300'
        : 'border-slate-600 bg-slate-700/40 text-slate-300';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${tone}`}>{simulated ? `Simulated · ${value}` : value}</span>;
}

export default function AccessControlDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [canManage, setCanManage] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [zone, setZone] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [pointForm, setPointForm] = useState({ pointId: '', name: '', zone: 'ENTRANCE', location: '', hardwareType: 'STAFF_ENTRANCE', manufacturer: '', model: '', isEmergencyExit: false });
  const [permissionForm, setPermissionForm] = useState({ pointId: '', targetType: 'ACCREDITATION', targetId: '', zone: 'ENTRANCE', validFrom: '2025-01-01', expiresAt: '2030-01-01', reason: '' });
  const [decisionForm, setDecisionForm] = useState({ pointId: '', subjectType: 'ACCREDITATION', subjectId: '' });
  const [integrationForm, setIntegrationForm] = useState({ providerName: '', protocol: 'VENDOR_API_HTTPS', endpointUrl: '', secretReference: '' });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/access-control/dashboard?zone=${encodeURIComponent(zone)}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Access-control dashboard is unavailable.');
      setDashboard(result.dashboard);
      const manageAccess = Boolean(result.permissions?.canManage);
      setCanManage(manageAccess);
      if (manageAccess) {
        const permissionResponse = await fetch(`/api/access-control/permissions?zone=${encodeURIComponent(zone)}`, { cache: 'no-store' });
        const permissionResult = await permissionResponse.json();
        if (!permissionResponse.ok || !permissionResult.success) throw new Error(permissionResult.message || 'Access permissions are unavailable.');
        setPermissions(permissionResult.permissions || []);
      } else {
        setPermissions([]);
      }
      const firstPoint = result.dashboard.points[0] || null;
      const availablePoint = (pointId) => result.dashboard.points.find((point) => point.pointId === pointId) || firstPoint;
      setPermissionForm((current) => {
        const point = availablePoint(current.pointId);
        return { ...current, pointId: point?.pointId || '', zone: point?.zone || current.zone };
      });
      setDecisionForm((current) => ({ ...current, pointId: availablePoint(current.pointId)?.pointId || '' }));
    } catch (loadError) { setError(loadError.message); }
    finally { setLoading(false); }
  }, [zone]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  async function revokePermission(permissionId) {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(`/api/access-control/permissions/${encodeURIComponent(permissionId)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Permission could not be revoked.');
      setNotice(result.message || 'Access permission revoked.');
      await loadDashboard();
    } catch (revokeError) { setError(revokeError.message); }
    finally { setSaving(false); }
  }

  async function submit(event, path, body, successMessage, reset) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Request failed.');
      setNotice(result.message || successMessage);
      reset?.();
      await loadDashboard();
    } catch (submitError) { setError(submitError.message); }
    finally { setSaving(false); }
  }

  const points = dashboard?.points || [];
  const alerts = dashboard?.alerts || [];
  const events = dashboard?.events || [];
  const pointOptions = points.map((point) => <option key={point.pointId} value={point.pointId}>{point.pointId} · {point.name}</option>);

  return (
    <div className="space-y-6">
      <header className={`${panelClass} flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" /> Physical access governance
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Access control operations</h1>
          <p className="mt-1 text-xs text-slate-400">Access point inventory, time-bound permissions, authorization history and alerts.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="access-zone">Filter by stadium zone</label>
          <select id="access-zone" className={`${inputClass} sm:w-56`} value={zone} onChange={(event) => setZone(event.target.value)}>
            {zones.map((item) => <option key={item} value={item}>{item === 'ALL' ? 'All stadium zones' : item.replaceAll('_', ' ')}</option>)}
          </select>
          <button type="button" onClick={loadDashboard} className="inline-flex items-center gap-2 rounded-xl border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-slate-200 hover:border-emerald-500/50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">{notice}</div>}

      {dashboard && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p><strong>{dashboard.adapter.mode === 'SIMULATED_DEVELOPMENT' ? 'SIMULATED DEVELOPMENT ADAPTER — NOT LIVE.' : 'NO VERIFIED HARDWARE ADAPTER.'}</strong> No physical controller is connected. Device connectivity is unverified. Authorization records are audit decisions only: this module has no unlock, gate actuation, fire-exit override, or life-safety command endpoint.</p>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ['Access points', dashboard?.metrics?.points ?? 0, 'Registered inventory'],
          ['Verified online', dashboard?.metrics?.liveOnline ?? 0, 'Vendor-confirmed telemetry only'],
          ['Unknown status', dashboard?.metrics?.unknown ?? 0, 'No verified connectivity'],
          ['Active permissions', dashboard?.metrics?.activePermissions ?? 0, 'Date-bound grants'],
          ['Security alerts', dashboard?.metrics?.activeAlerts ?? 0, 'Repeated denied attempts'],
        ].map(([label, value, helper]) => (
          <div key={label} className={`${panelClass} p-4`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-[10px] text-slate-500">{helper}</p>
          </div>
        ))}
      </section>

      <section className={`${panelClass} overflow-hidden`}>
        <div className="flex items-center justify-between border-b border-navy-800 p-5">
          <div><h2 className="flex items-center gap-2 font-bold text-white"><DoorOpen className="h-4 w-4 text-emerald-400" /> Access points</h2><p className="mt-1 text-[11px] text-slate-400">Unique identifiers, hardware metadata, zone, integration and operational status.</p></div>
          <span className="text-[10px] text-slate-500">{points.length} points</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-navy-950 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="p-4">Access point</th><th className="p-4">Type / zone</th><th className="p-4">Manufacturer / model</th><th className="p-4">Device status</th></tr></thead>
            <tbody className="divide-y divide-navy-800/70 text-slate-300">
              {points.map((point) => (
                <tr key={point.pointId} className="hover:bg-navy-800/30">
                  <td className="p-4"><div className="font-semibold text-white">{point.name}</div><div className="mt-1 font-mono text-[10px] text-emerald-300">{point.pointId}</div><div className="mt-1 text-[10px] text-slate-500">{point.location}</div></td>
                  <td className="p-4">{point.hardwareType}<div className="mt-1 text-[10px] text-slate-500">{point.zone.replaceAll('_', ' ')}{point.isEmergencyExit ? ' · LIFE-SAFETY EXIT' : ''}</div></td>
                  <td className="p-4">{point.manufacturer || 'Unknown'}<div className="mt-1 text-[10px] text-slate-500">{point.model || 'Model not recorded'}</div></td>
                  <td className="p-4"><Status value={point.operationalStatus || 'UNKNOWN'} simulated={point.isSimulated} /><div className="mt-1 text-[10px] text-slate-500">{point.integrationStatus} · {point.statusSource}</div></td>
                </tr>
              ))}
              {!loading && points.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500">No access points registered in this zone.</td></tr>}
              {loading && <tr><td colSpan="4" className="p-8 text-center text-slate-500">Loading authorized access inventory…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className={`${panelClass} p-5 xl:col-span-2`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><Activity className="h-4 w-4 text-sky-400" /> Access event history</h2>
          <p className="mb-4 text-[11px] text-slate-400">Authorization outcomes only. Credential references are keyed and masked; raw credentials are not retained.</p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="bg-navy-950 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="p-3">Time</th><th className="p-3">Point</th><th className="p-3">Decision</th><th className="p-3">Reason</th><th className="p-3">Credential ref</th></tr></thead>
              <tbody className="divide-y divide-navy-800/70 text-slate-300">
                {events.map((event) => <tr key={event.id || event.eventRef}><td className="p-3 whitespace-nowrap">{new Date(event.occurredAt).toLocaleString()}</td><td className="p-3 font-mono">{event.pointId}</td><td className="p-3"><Status value={event.outcome} simulated={event.isSimulated} /></td><td className="p-3">{event.reasonCode.replaceAll('_', ' ')}</td><td className="p-3 font-mono text-[10px]">{event.subjectHash}</td></tr>)}
                {!events.length && <tr><td colSpan="5" className="p-6 text-center text-slate-500">No access events recorded.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><AlertTriangle className="h-4 w-4 text-amber-400" /> Security alerts</h2>
          <p className="mb-4 text-[11px] text-slate-400">Repeated unsuccessful attempts within a rolling 10-minute window.</p>
          <div className="space-y-3">
            {alerts.map((alert) => <article key={alert.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3"><div className="flex items-center justify-between gap-2"><strong className="text-xs text-white">{alert.title}</strong><Status value={alert.severity} simulated={alert.isSimulated} /></div><p className="mt-2 text-[10px] text-slate-400">{alert.pointId} · {alert.attemptCount} denied attempts · {alert.subjectHash}</p></article>)}
            {!alerts.length && <p className="rounded-xl border border-dashed border-navy-700 p-5 text-center text-xs text-slate-500">No active access alerts.</p>}
          </div>
        </section>
      </div>

      {canManage && (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className={`${panelClass} p-5`}>
            <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><Plus className="h-4 w-4 text-emerald-400" /> Register access point</h2>
            <p className="mb-4 text-[11px] text-slate-400">New records start UNKNOWN / UNVERIFIED. Registration never connects or actuates hardware.</p>
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => submit(event, '/api/access-control/points', pointForm, 'Access point saved.', () => setPointForm({ pointId: '', name: '', zone: 'ENTRANCE', location: '', hardwareType: 'STAFF_ENTRANCE', manufacturer: '', model: '', isEmergencyExit: false }))}>
              <input aria-label="Access point ID (optional)" className={inputClass} placeholder="Point ID (auto-generated if blank)" value={pointForm.pointId} onChange={(event) => setPointForm({ ...pointForm, pointId: event.target.value })} />
              <input required aria-label="Access point name" className={inputClass} placeholder="Access point name" value={pointForm.name} onChange={(event) => setPointForm({ ...pointForm, name: event.target.value })} />
              <select className={inputClass} value={pointForm.hardwareType} onChange={(event) => setPointForm({ ...pointForm, hardwareType: event.target.value })}>{pointTypes.map((type) => <option key={type}>{type}</option>)}</select>
              <select className={inputClass} value={pointForm.zone} onChange={(event) => setPointForm({ ...pointForm, zone: event.target.value })}>{zones.filter((item) => item !== 'ALL').map((item) => <option key={item}>{item}</option>)}</select>
              <input required aria-label="Location" className={inputClass} placeholder="Stadium location" value={pointForm.location} onChange={(event) => setPointForm({ ...pointForm, location: event.target.value })} />
              <input aria-label="Manufacturer" className={inputClass} placeholder="Manufacturer" value={pointForm.manufacturer} onChange={(event) => setPointForm({ ...pointForm, manufacturer: event.target.value })} />
              <input aria-label="Model" className={inputClass} placeholder="Hardware model" value={pointForm.model} onChange={(event) => setPointForm({ ...pointForm, model: event.target.value })} />
              <label className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-[10px] text-amber-200"><input type="checkbox" checked={pointForm.isEmergencyExit} onChange={(event) => setPointForm({ ...pointForm, isEmergencyExit: event.target.checked })} /> Life-safety / emergency exit (permissions disabled)</label>
              <button disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Register inventory record</button>
            </form>
          </section>

          <section className={`${panelClass} p-5`}>
            <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><KeyRound className="h-4 w-4 text-emerald-400" /> Grant time-bound permission</h2>
            <p className="mb-4 text-[11px] text-slate-400">User IDs and accreditation numbers resolve against the existing user and accreditation directories.</p>
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => submit(event, '/api/access-control/permissions', permissionForm, 'Access permission saved.')}>
              <select required className={inputClass} value={permissionForm.pointId} onChange={(event) => { const point = points.find((item) => item.pointId === event.target.value); setPermissionForm({ ...permissionForm, pointId: event.target.value, zone: point?.zone || permissionForm.zone }); }}><option value="">Select access point</option>{pointOptions}</select>
              <select className={inputClass} value={permissionForm.zone} onChange={(event) => setPermissionForm({ ...permissionForm, zone: event.target.value })}>{zones.filter((item) => item !== 'ALL').map((item) => <option key={item}>{item}</option>)}</select>
              <select className={inputClass} value={permissionForm.targetType} onChange={(event) => setPermissionForm({ ...permissionForm, targetType: event.target.value, targetId: '' })}>{['ACCREDITATION', 'USER', 'ROLE', 'GROUP'].map((type) => <option key={type}>{type}</option>)}</select>
              {permissionForm.targetType === 'GROUP'
                ? <select className={inputClass} value={permissionForm.targetId} onChange={(event) => setPermissionForm({ ...permissionForm, targetId: event.target.value })}><option value="">Select staff group</option>{['STADIUM_EMPLOYEE', 'SECURITY', 'EVENT_ORGANIZER', 'CONTRACTOR', 'VENDOR', 'TECHNICAL', 'MEDICAL_EMERGENCY', 'OTHER'].map((group) => <option key={group}>{group}</option>)}</select>
                : permissionForm.targetType === 'ROLE'
                  ? <select className={inputClass} value={permissionForm.targetId} onChange={(event) => setPermissionForm({ ...permissionForm, targetId: event.target.value })}><option value="">Select system role</option>{['SYSTEM_ADMIN', 'VENUE_MANAGER', 'STEWARD', 'GATE_OPERATOR', 'FINANCE_OFFICER', 'CUSTOMER'].map((role) => <option key={role}>{role}</option>)}</select>
                  : <input required aria-label="User or accreditation ID" className={inputClass} placeholder={permissionForm.targetType === 'USER' ? 'Existing user ID' : 'Accreditation number'} value={permissionForm.targetId} onChange={(event) => setPermissionForm({ ...permissionForm, targetId: event.target.value })} />}
              <label className="text-[10px] text-slate-400">Starts<input required type="date" className={`${inputClass} mt-1`} value={permissionForm.validFrom} onChange={(event) => setPermissionForm({ ...permissionForm, validFrom: event.target.value })} /></label>
              <label className="text-[10px] text-slate-400">Expires<input required type="date" className={`${inputClass} mt-1`} value={permissionForm.expiresAt} onChange={(event) => setPermissionForm({ ...permissionForm, expiresAt: event.target.value })} /></label>
              <input aria-label="Reason for access" className={inputClass} placeholder="Reason / approval reference" value={permissionForm.reason} onChange={(event) => setPermissionForm({ ...permissionForm, reason: event.target.value })} />
              <button disabled={saving || !permissionForm.pointId} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Save permission</button>
            </form>
            <div className="mt-5 overflow-x-auto border-t border-navy-800 pt-4">
              <h3 className="mb-3 text-xs font-bold text-white">Permission register</h3>
              <table className="w-full min-w-[560px] text-left text-[10px]">
                <thead className="text-slate-500"><tr><th className="p-2">Point</th><th className="p-2">Target</th><th className="p-2">Validity</th><th className="p-2">State</th><th className="p-2">Action</th></tr></thead>
                <tbody className="divide-y divide-navy-800 text-slate-300">
                  {permissions.map((permission) => <tr key={permission.id}><td className="p-2 font-mono">{permission.pointId}</td><td className="p-2">{permission.targetType}: {permission.targetId}</td><td className="p-2">{new Date(permission.validFrom).toLocaleDateString()} – {new Date(permission.expiresAt).toLocaleDateString()}</td><td className="p-2">{permission.revokedAt ? 'REVOKED' : permission.isSimulated ? 'SIMULATED' : 'ACTIVE'}</td><td className="p-2">{!permission.revokedAt && <button type="button" disabled={saving} onClick={() => revokePermission(permission.id)} className="text-red-300 underline disabled:opacity-50">Revoke</button>}</td></tr>)}
                  {!permissions.length && <tr><td colSpan="5" className="p-3 text-center text-slate-500">No access grants recorded.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`${panelClass} p-5`}>
            <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><ShieldCheck className="h-4 w-4 text-sky-400" /> Record authorization decision</h2>
            <p className="mb-4 text-[11px] text-slate-400">Audit-only evaluation; no command is sent to a lock, gate, panel, or life-safety system.</p>
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => submit(event, '/api/access-control/events', decisionForm, 'Decision recorded.')}>
              <select required className={inputClass} value={decisionForm.pointId} onChange={(event) => setDecisionForm({ ...decisionForm, pointId: event.target.value })}><option value="">Select access point</option>{pointOptions}</select>
              <select className={inputClass} value={decisionForm.subjectType} onChange={(event) => setDecisionForm({ ...decisionForm, subjectType: event.target.value, subjectId: '' })}><option value="ACCREDITATION">Accreditation</option><option value="USER">User ID</option></select>
              <input required aria-label="Credential reference" className={inputClass} placeholder={decisionForm.subjectType === 'USER' ? 'Existing user ID' : 'Accreditation number'} value={decisionForm.subjectId} onChange={(event) => setDecisionForm({ ...decisionForm, subjectId: event.target.value })} />
              <button disabled={saving || !decisionForm.pointId} className="rounded-lg bg-sky-400 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Evaluate and record (no actuation)</button>
            </form>
          </section>

          <section className={`${panelClass} p-5`}>
            <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><LockKeyhole className="h-4 w-4 text-sky-400" /> Vendor integration metadata</h2>
            <p className="mb-4 text-[11px] text-slate-400">Only HTTPS endpoint and secret-manager reference are accepted. Status remains UNVERIFIED.</p>
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={(event) => submit(event, '/api/access-control/integrations', integrationForm, 'Integration metadata saved.')}>
              <input required aria-label="Provider name" className={inputClass} placeholder="Panel/controller provider" value={integrationForm.providerName} onChange={(event) => setIntegrationForm({ ...integrationForm, providerName: event.target.value })} />
              <select className={inputClass} value={integrationForm.protocol} onChange={(event) => setIntegrationForm({ ...integrationForm, protocol: event.target.value })}>{['VENDOR_API_HTTPS', 'OSDP_SECURE_CHANNEL', 'ONVIF', 'OTHER'].map((protocol) => <option key={protocol}>{protocol}</option>)}</select>
              <input required type="url" aria-label="HTTPS endpoint" className={inputClass} placeholder="https://controller.example" value={integrationForm.endpointUrl} onChange={(event) => setIntegrationForm({ ...integrationForm, endpointUrl: event.target.value })} />
              <input aria-label="Secret manager reference" className={inputClass} placeholder="Secret-manager reference (not a credential)" value={integrationForm.secretReference} onChange={(event) => setIntegrationForm({ ...integrationForm, secretReference: event.target.value })} />
              <button disabled={saving} className="rounded-lg bg-sky-400 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Save unverified metadata</button>
            </form>
            <div className="mt-5 space-y-2 border-t border-navy-800 pt-4">
              {(dashboard?.integrations || []).map((integration) => <div key={integration.id} className="flex items-center justify-between gap-3 rounded-lg border border-navy-800 bg-navy-950 p-3"><div><p className="text-xs font-semibold text-white">{integration.providerName}</p><p className="mt-1 text-[10px] text-slate-500">{integration.protocol} · endpoint withheld</p></div><Status value={integration.connectionStatus} simulated={integration.isSimulated} /></div>)}
              {!dashboard?.integrations?.length && <p className="text-[10px] text-slate-500">No controller metadata registered. Connectivity remains unverified.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
