'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle, Camera, CircleHelp, ExternalLink, LockKeyhole,
  Plus, RefreshCw, Shield, Video,
} from 'lucide-react';

const initialCameraForm = {
  cameraId: '', name: '', zone: 'BOWL', locationDescription: '', cameraType: 'FIXED',
  manufacturer: '', model: '', installationStatus: 'PLANNED',
  privacyMaskingSupported: false, privacyMaskingEnabled: false,
};

const zones = ['ALL', 'BOWL', 'CONCOURSE', 'ENTRANCE', 'EXIT', 'PARKING', 'RESTRICTED', 'OTHER'];
const cameraTypes = ['FIXED', 'PTZ', 'THERMAL', 'DOME', 'BULLET', 'OTHER'];
const installStatuses = ['PLANNED', 'INSTALLED', 'DECOMMISSIONED'];

function badge(status, simulated = false) {
  const tone = simulated
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    : status === 'ONLINE'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : status === 'OFFLINE'
        ? 'border-red-500/30 bg-red-500/10 text-red-300'
        : 'border-slate-600 bg-slate-700/40 text-slate-300';
  return `${tone} inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide`;
}

export default function CctvDashboardPage() {
  const [cameras, setCameras] = useState([]);
  const [events, setEvents] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [zone, setZone] = useState('ALL');
  const [permissions, setPermissions] = useState({});
  const [cameraForm, setCameraForm] = useState(initialCameraForm);
  const [integrationForm, setIntegrationForm] = useState({ providerName: '', protocol: 'VENDOR_API', endpointUrl: '', secretReference: '' });
  const [eventForm, setEventForm] = useState({ cameraId: '', eventType: 'SECURITY_ALERT', summary: '', occurredAt: '', incidentReference: '', vmsRecordingUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const cameraResponse = await fetch(`/api/cctv/cameras?zone=${encodeURIComponent(zone)}`, { cache: 'no-store' });
      const cameraData = await cameraResponse.json();
      if (!cameraResponse.ok || !cameraData.success) throw new Error(cameraData.message || 'Camera inventory could not be loaded.');
      const eventResponse = await fetch('/api/cctv/events', { cache: 'no-store' });
      const eventData = await eventResponse.json();
      if (!eventResponse.ok || !eventData.success) throw new Error(eventData.message || 'Camera event metadata could not be loaded.');
      setCameras(cameraData.cameras || []);
      setEvents(eventData.events || []);
      setMetrics(cameraData.metrics || {});
      setPermissions(cameraData.permissions || {});
      if (cameraData.permissions?.canConfigureIntegrations) {
        const integrationResponse = await fetch('/api/cctv/integrations', { cache: 'no-store' });
        const integrationData = await integrationResponse.json();
        if (!integrationResponse.ok || !integrationData.success) throw new Error(integrationData.message || 'VMS configuration could not be loaded.');
        setIntegrations(integrationData.integrations || []);
      } else {
        setIntegrations([]);
      }
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [zone]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  async function submitJson(url, method, body) {
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Request failed.');
    return result;
  }

  async function registerCamera(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await submitJson('/api/cctv/cameras', 'POST', cameraForm);
      setNotice(`Camera ${result.camera.cameraId} registered${result.camera.isSimulated ? ' as simulated development data' : ''}.`);
      setCameraForm(initialCameraForm);
      await loadDashboard();
    } catch (saveError) { setError(saveError.message); }
    finally { setSaving(false); }
  }

  async function updateInstallation(camera, installationStatus) {
    setError('');
    setNotice('');
    try {
      await submitJson(`/api/cctv/cameras/${encodeURIComponent(camera.cameraId)}`, 'PATCH', { installationStatus });
      setNotice(`${camera.cameraId} installation status updated.`);
      await loadDashboard();
    } catch (saveError) { setError(saveError.message); }
  }

  async function saveIntegration(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await submitJson('/api/cctv/integrations', 'POST', integrationForm);
      setNotice(`${result.integration.providerName} saved with unverified connection status.`);
      setIntegrationForm({ providerName: '', protocol: 'VENDOR_API', endpointUrl: '', secretReference: '' });
      await loadDashboard();
    } catch (saveError) { setError(saveError.message); }
    finally { setSaving(false); }
  }

  async function saveEvent(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await submitJson('/api/cctv/events', 'POST', {
        ...eventForm,
        occurredAt: new Date(eventForm.occurredAt).toISOString(),
      });
      setNotice(`Event metadata saved for ${result.event.incidentReference}.`);
      setEventForm({ cameraId: '', eventType: 'SECURITY_ALERT', summary: '', occurredAt: '', incidentReference: '', vmsRecordingUrl: '' });
      await loadDashboard();
    } catch (saveError) { setError(saveError.message); }
    finally { setSaving(false); }
  }

  const fieldClass = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none';
  const panelClass = 'rounded-2xl border border-navy-800 bg-navy-900 shadow-xl';

  return (
    <div className="space-y-6">
      <header className={`${panelClass} flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            <Video className="h-3.5 w-3.5" /> CCTV & Video Management
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Stadium camera operations</h1>
          <p className="mt-1 text-xs text-slate-400">Restricted inventory and event metadata. This dashboard does not display or store raw video.</p>
        </div>
        <button type="button" onClick={loadDashboard} className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy-700 bg-navy-950 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh inventory
        </button>
      </header>

      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-100">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
        <p><strong>Development fixtures are simulated.</strong> Amber labels are not live hardware status. Real camera status remains unknown until an equipment-specific, vendor-approved adapter reports verified data.</p>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-200">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200">{notice}</div>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ['Camera inventory', metrics.inventory ?? 0, 'All registered records'],
          ['Installed', metrics.installed ?? 0, 'Installation records'],
          ['Verified online', metrics.liveOnline ?? 0, 'Live data only'],
          ['Verified offline', metrics.liveOffline ?? 0, 'Live data only'],
          ['Simulated', metrics.simulated ?? 0, 'Development fixtures'],
        ].map(([label, value, helper]) => (
          <div key={label} className={`${panelClass} p-4`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-[10px] text-slate-500">{helper}</p>
          </div>
        ))}
      </section>

      <section className={`${panelClass} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-navy-800 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-white"><Camera className="h-4 w-4 text-emerald-400" /> Camera inventory</h2>
            <p className="mt-1 text-[11px] text-slate-400">Installation state is separate from connectivity; unverified cameras are never shown as connected.</p>
          </div>
          <select aria-label="Filter by zone" value={zone} onChange={(event) => setZone(event.target.value)} className={`${fieldClass} sm:w-48`}>
            {zones.map((item) => <option key={item} value={item}>{item === 'ALL' ? 'All stadium zones' : item}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead className="bg-navy-950 text-[10px] uppercase tracking-wide text-slate-400">
              <tr><th className="p-4">Camera</th><th className="p-4">Zone / location</th><th className="p-4">Type / make</th><th className="p-4">Installation</th><th className="p-4">Connectivity</th><th className="p-4">Privacy mask</th></tr>
            </thead>
            <tbody className="divide-y divide-navy-800/70 text-slate-300">
              {cameras.map((camera) => (
                <tr key={camera.cameraId} className="align-top hover:bg-navy-800/30">
                  <td className="p-4"><div className="font-bold text-white">{camera.name}</div><div className="mt-1 font-mono text-[10px] text-emerald-300">{camera.cameraId}</div></td>
                  <td className="p-4"><span className="font-semibold text-white">{camera.zone}</span><div className="mt-1 max-w-56 text-[11px] text-slate-400">{camera.locationDescription}</div></td>
                  <td className="p-4"><span>{camera.cameraType}</span><div className="mt-1 text-[10px] text-slate-500">{[camera.manufacturer, camera.model].filter(Boolean).join(' • ') || 'Manufacturer/model not recorded'}</div></td>
                  <td className="p-4">
                    {permissions.canManage ? (
                      <select aria-label={`Installation status for ${camera.cameraId}`} value={camera.installationStatus} onChange={(event) => updateInstallation(camera, event.target.value)} className="rounded-lg border border-navy-700 bg-navy-950 px-2 py-1.5 text-[10px] text-slate-200">
                        {installStatuses.map((status) => <option key={status}>{status}</option>)}
                      </select>
                    ) : <span className={badge(camera.installationStatus)}>{camera.installationStatus}</span>}
                  </td>
                  <td className="p-4"><span className={badge(camera.operationalStatus, camera.isSimulated)}>{camera.isSimulated ? `Simulated · ${camera.operationalStatus}` : camera.operationalStatus}</span><div className="mt-1 text-[10px] text-slate-500">{camera.statusSource || 'UNVERIFIED'}</div></td>
                  <td className="p-4"><span className={camera.privacyMaskingEnabled ? 'text-emerald-300' : 'text-slate-400'}>{camera.privacyMaskingEnabled ? 'Enabled' : 'Not enabled'}</span><div className="mt-1 text-[10px] text-slate-500">{camera.privacyMaskingSupported ? 'Supported' : 'Support unverified'}</div></td>
                </tr>
              ))}
              {!loading && cameras.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No cameras registered for this zone.</td></tr>}
              {loading && <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading authorized camera inventory…</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {permissions.canManage && (
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white"><Plus className="h-4 w-4 text-emerald-400" /> Register camera</h2>
          <form onSubmit={registerCamera} className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input className={fieldClass} placeholder="Camera ID (auto-generated if blank)" value={cameraForm.cameraId} onChange={(e) => setCameraForm({ ...cameraForm, cameraId: e.target.value })} />
            <input required className={fieldClass} placeholder="Camera name" value={cameraForm.name} onChange={(e) => setCameraForm({ ...cameraForm, name: e.target.value })} />
            <select className={fieldClass} value={cameraForm.zone} onChange={(e) => setCameraForm({ ...cameraForm, zone: e.target.value })}>{zones.slice(1).map((item) => <option key={item}>{item}</option>)}</select>
            <select className={fieldClass} value={cameraForm.cameraType} onChange={(e) => setCameraForm({ ...cameraForm, cameraType: e.target.value })}>{cameraTypes.map((item) => <option key={item}>{item}</option>)}</select>
            <input required className={fieldClass} placeholder="Precise location description" value={cameraForm.locationDescription} onChange={(e) => setCameraForm({ ...cameraForm, locationDescription: e.target.value })} />
            <input className={fieldClass} placeholder="Manufacturer" value={cameraForm.manufacturer} onChange={(e) => setCameraForm({ ...cameraForm, manufacturer: e.target.value })} />
            <input className={fieldClass} placeholder="Model" value={cameraForm.model} onChange={(e) => setCameraForm({ ...cameraForm, model: e.target.value })} />
            <select className={fieldClass} value={cameraForm.installationStatus} onChange={(e) => setCameraForm({ ...cameraForm, installationStatus: e.target.value })}>{installStatuses.map((item) => <option key={item}>{item}</option>)}</select>
            <label className="flex items-center gap-2 text-[11px] text-slate-300"><input type="checkbox" checked={cameraForm.privacyMaskingSupported} onChange={(e) => setCameraForm({ ...cameraForm, privacyMaskingSupported: e.target.checked, privacyMaskingEnabled: e.target.checked && cameraForm.privacyMaskingEnabled })} /> Privacy masking supported (verify with manufacturer)</label>
            <label className="flex items-center gap-2 text-[11px] text-slate-300"><input type="checkbox" disabled={!cameraForm.privacyMaskingSupported} checked={cameraForm.privacyMaskingEnabled} onChange={(e) => setCameraForm({ ...cameraForm, privacyMaskingEnabled: e.target.checked })} /> Privacy masking enabled on device</label>
            <button disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50 md:col-span-2 xl:col-span-2">{saving ? 'Saving…' : 'Register camera record'}</button>
          </form>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><Shield className="h-4 w-4 text-emerald-400" /> Authorized event metadata</h2>
          <p className="mb-4 text-[11px] text-slate-400">Incident references and approved VMS links only; no footage is copied into this system.</p>
          <div className="space-y-3">
            {events.map((item) => (
              <article key={item.id} className="rounded-xl border border-navy-800 bg-navy-950 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[10px] font-bold text-emerald-300">{item.incidentReference}</span>
                  <span className={badge(item.eventType, item.isSimulated)}>{item.isSimulated ? 'Simulated · ' : ''}{item.eventType}</span>
                </div>
                <p className="mt-2 text-xs text-slate-200">{item.summary}</p>
                <p className="mt-1 text-[10px] text-slate-500">{item.cameraId} · {new Date(item.occurredAt).toLocaleString()}</p>
                {item.vmsRecordingUrl && <a className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 hover:underline" href={item.vmsRecordingUrl} target="_blank" rel="noopener noreferrer">Open authorized VMS recording <ExternalLink className="h-3 w-3" /></a>}
              </article>
            ))}
            {!events.length && <p className="rounded-xl border border-dashed border-navy-700 p-5 text-center text-xs text-slate-500">No event metadata available.</p>}
          </div>
        </section>

        {permissions.canManage && (
          <section className={`${panelClass} p-5`}>
            <h2 className="mb-1 font-bold text-white">Add incident reference</h2>
            <p className="mb-4 text-[11px] text-slate-400">Only event metadata is stored. Recording links must use a configured VMS host.</p>
            <form onSubmit={saveEvent} className="space-y-3">
              <select required className={fieldClass} value={eventForm.cameraId} onChange={(e) => setEventForm({ ...eventForm, cameraId: e.target.value })}>
                <option value="">Select camera</option>{cameras.map((camera) => <option key={camera.cameraId} value={camera.cameraId}>{camera.cameraId} · {camera.name}</option>)}
              </select>
              <div className="grid gap-3 sm:grid-cols-2">
                <input required className={fieldClass} placeholder="Event type" value={eventForm.eventType} onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })} />
                <input required className={fieldClass} placeholder="Incident reference" value={eventForm.incidentReference} onChange={(e) => setEventForm({ ...eventForm, incidentReference: e.target.value })} />
                <input required type="datetime-local" className={fieldClass} value={eventForm.occurredAt} onChange={(e) => setEventForm({ ...eventForm, occurredAt: e.target.value })} />
                <input type="url" className={fieldClass} placeholder="HTTPS VMS recording link (optional)" value={eventForm.vmsRecordingUrl} onChange={(e) => setEventForm({ ...eventForm, vmsRecordingUrl: e.target.value })} />
              </div>
              <textarea required rows="2" className={fieldClass} placeholder="Brief event metadata summary — do not include sensitive identity data" value={eventForm.summary} onChange={(e) => setEventForm({ ...eventForm, summary: e.target.value })} />
              <button disabled={saving || !cameras.length} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">{saving ? 'Saving…' : 'Save metadata'}</button>
            </form>
          </section>
        )}
      </div>

      {permissions.canConfigureIntegrations && (
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><LockKeyhole className="h-4 w-4 text-emerald-400" /> VMS integration configuration</h2>
          <p className="mb-4 text-[11px] text-slate-400">Administrator only. Adapter execution is not installed; saved configurations remain UNVERIFIED. Credentials must remain in an approved secret manager.</p>
          <div className="mb-5 grid gap-2 md:grid-cols-2">
            {integrations.map((integration) => (
              <div key={integration.id} className="rounded-xl border border-navy-800 bg-navy-950 p-3 text-xs">
                <div className="flex items-center justify-between gap-2"><strong className="text-white">{integration.providerName}</strong><span className={badge(integration.connectionStatus, true)}>{integration.connectionStatus}</span></div>
                <p className="mt-2 break-all text-[10px] text-slate-400">{integration.protocol} · {integration.endpointUrl}</p>
                <p className="mt-1 text-[10px] text-slate-500">Secret reference: {integration.secretReference || 'Not configured'} · {integration.isSimulated ? 'Simulated configuration' : 'Stored configuration'}</p>
              </div>
            ))}
            {!integrations.length && <p className="text-xs text-slate-500">No VMS integrations configured.</p>}
          </div>
          <form onSubmit={saveIntegration} className="grid gap-3 md:grid-cols-2">
            <input required className={fieldClass} placeholder="VMS vendor/provider" value={integrationForm.providerName} onChange={(e) => setIntegrationForm({ ...integrationForm, providerName: e.target.value })} />
            <select className={fieldClass} value={integrationForm.protocol} onChange={(e) => setIntegrationForm({ ...integrationForm, protocol: e.target.value })}><option value="VENDOR_API">Vendor-approved API</option><option value="ONVIF">ONVIF (verify equipment support)</option></select>
            <input required type="url" className={fieldClass} placeholder="HTTPS VMS endpoint" value={integrationForm.endpointUrl} onChange={(e) => setIntegrationForm({ ...integrationForm, endpointUrl: e.target.value })} />
            <input className={fieldClass} placeholder="Secret-manager reference only (no credentials)" value={integrationForm.secretReference} onChange={(e) => setIntegrationForm({ ...integrationForm, secretReference: e.target.value })} />
            <button disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50 md:col-span-2">{saving ? 'Saving…' : 'Save unverified configuration'}</button>
          </form>
        </section>
      )}

      <aside className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 text-xs text-slate-300">
        <h2 className="mb-2 flex items-center gap-2 font-bold text-sky-200"><CircleHelp className="h-4 w-4" /> Deployment readiness</h2>
        <p>Provide the installed camera/VMS hardware inventory, vendor-approved API and ONVIF documentation/licensing, endpoint and network requirements, and approved secret-manager references. Verify privacy masking and retention controls on the real device. Legal review, necessity/proportionality assessment, and a DPIA are required where applicable before expanding monitoring. Facial recognition, biometric identification, and identity matching are not provided.</p>
      </aside>
      <div className="text-center text-[10px] text-slate-600">Camera information and event references are access-audited. Live feeds are not available in this integration module.</div>
    </div>
  );
}
