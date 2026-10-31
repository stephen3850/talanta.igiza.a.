'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, CheckCircle2, CircleHelp, Globe2, LockKeyhole,
  Network, Plus, RefreshCw, Router, ShieldCheck, Wifi, WifiOff,
} from 'lucide-react';

const zones = ['ALL', 'BOWL', 'CONCOURSE', 'ENTRANCE', 'EXIT', 'PARKING', 'ADMINISTRATION', 'DATA_CENTRE', 'CRITICAL_INFRASTRUCTURE', 'OTHER'];
const categories = ['ROUTER', 'CORE_SWITCH', 'EDGE_SWITCH', 'WIRELESS_AP', 'WIRELESS_CONTROLLER', 'NETWORK_GATEWAY'];
const fieldClass = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none';
const panelClass = 'rounded-2xl border border-navy-800 bg-navy-900 shadow-xl';

function StatusTag({ value, simulated = false }) {
  const tone = simulated
    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
    : value === 'ONLINE'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : value === 'OFFLINE'
        ? 'border-red-500/30 bg-red-500/10 text-red-300'
        : 'border-slate-600 bg-slate-700/40 text-slate-300';
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${tone}`}>{simulated ? `Simulated · ${value}` : value}</span>;
}

export default function StadiumWifiManagementPage() {
  const [dashboard, setDashboard] = useState(null);
  const [permissions, setPermissions] = useState({});
  const [zone, setZone] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [deviceForm, setDeviceForm] = useState({ deviceId: '', name: '', category: 'WIRELESS_AP', zone: 'BOWL', manufacturer: '', model: '' });
  const [controllerForm, setControllerForm] = useState({ providerName: '', protocol: 'CONTROLLER_API', endpointUrl: '', secretReference: '' });
  const [policyForm, setPolicyForm] = useState({ ssid: 'Talanta-Guest', captivePortalProvider: '', bandwidthMbps: 10, sessionMinutes: 240, idleTimeoutMinutes: 30, maxDevicesPerSession: 2 });

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/network-management/dashboard?zone=${encodeURIComponent(zone)}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Network dashboard is unavailable.');
      setDashboard(result.dashboard);
      setPermissions(result.permissions || {});
    } catch (loadError) { setError(loadError.message); }
    finally { setLoading(false); }
  }, [zone]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  async function submit(url, body) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.message || 'Request failed.');
    return result;
  }

  async function handleSubmit(event, url, body, successMessage, reset) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const result = await submit(url, body);
      setNotice(result.message || successMessage);
      reset?.();
      await loadDashboard();
    } catch (submitError) { setError(submitError.message); }
    finally { setSaving(false); }
  }

  const devices = dashboard?.devices || [];
  const usage = dashboard?.usage?.[0];
  const alerts = dashboard?.alerts || [];
  const activeAlerts = alerts.filter((alert) => alert.status === 'ACTIVE' || alert.status === 'ACKNOWLEDGED');

  return (
    <div className="space-y-6">
      <header className={`${panelClass} flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between`}>
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            <Wifi className="h-3.5 w-3.5" /> Stadium network & smart Wi-Fi
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Network operations centre</h1>
          <p className="mt-1 text-xs text-slate-400">Inventory, guest policy drafts, aggregate usage and logical segmentation.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="sr-only" htmlFor="network-zone-filter">Filter by stadium zone</label>
          <select id="network-zone-filter" className={`${fieldClass} sm:w-56`} value={zone} onChange={(event) => setZone(event.target.value)}>
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
        <div className={`flex items-start gap-3 rounded-xl border p-4 text-xs ${dashboard.adapter.mode === 'SIMULATED_DEVELOPMENT' ? 'border-amber-500/30 bg-amber-500/10 text-amber-100' : 'border-sky-500/30 bg-sky-500/10 text-sky-100'}`}>
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p><strong>{dashboard.adapter.mode === 'SIMULATED_DEVELOPMENT' ? 'SIMULATED DEVELOPMENT ADAPTER — NOT LIVE.' : 'Controller state is unverified.'}</strong> No physical wireless controller is connected to this module. Any amber status and usage figure are development fixtures; a registered device or controller configuration is not proof of connectivity. Policies remain drafts and this console never applies changes to live network equipment.</p>
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ['Network inventory', dashboard?.metrics?.inventory ?? 0, 'Routers, switches, APs, gateways'],
          ['Live online', dashboard?.metrics?.liveOnline ?? 0, 'Verified controller telemetry'],
          ['Live offline', dashboard?.metrics?.liveOffline ?? 0, 'Verified controller telemetry'],
          ['Active alerts', activeAlerts.length, 'Only shown where monitoring reports'],
          ['Guest devices', usage?.connectedDevices ?? '—', 'Aggregate count; no personal identifiers'],
        ].map(([label, value, helper]) => (
          <div key={label} className={`${panelClass} p-4`}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
            <p className="mt-1 text-[10px] text-slate-500">{helper}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className={`${panelClass} overflow-hidden xl:col-span-2`}>
          <div className="flex items-center justify-between border-b border-navy-800 p-5">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-white"><Router className="h-4 w-4 text-emerald-400" /> Network equipment</h2>
              <p className="mt-1 text-[11px] text-slate-400">Identifiers, vendor, model, zone, and reported status.</p>
            </div>
            <span className="text-[10px] text-slate-500">{devices.length} devices</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[690px] text-left text-xs">
              <thead className="bg-navy-950 text-[10px] uppercase tracking-wide text-slate-400">
                <tr><th className="p-4">Device</th><th className="p-4">Category / zone</th><th className="p-4">Manufacturer / model</th><th className="p-4">Connectivity</th><th className="p-4">Performance</th></tr>
              </thead>
              <tbody className="divide-y divide-navy-800/70 text-slate-300">
                {devices.map((device) => (
                  <tr key={device.deviceId || device.id} className="hover:bg-navy-800/30">
                    <td className="p-4"><div className="font-semibold text-white">{device.name}</div><div className="mt-1 font-mono text-[10px] text-emerald-300">{device.deviceId || device.id}</div></td>
                    <td className="p-4">{device.category}<div className="mt-1 text-[10px] text-slate-500">{device.zone?.replaceAll('_', ' ') || 'Zone not recorded'}</div></td>
                    <td className="p-4">{device.manufacturer || 'Unknown'}<div className="mt-1 text-[10px] text-slate-500">{device.model || 'Model not recorded'}</div></td>
                    <td className="p-4"><StatusTag value={device.operationalStatus || device.status || 'UNKNOWN'} simulated={device.isSimulated} /><div className="mt-1 text-[10px] text-slate-500">{device.statusSource || 'UNVERIFIED'}</div></td>
                    <td className="p-4 text-[10px] text-slate-400">{device.latencyMs == null ? 'No live metrics' : `${device.latencyMs} ms · ${device.packetLossPercent ?? '—'}% loss`}{device.connectedDevices != null && <div className="mt-1">{device.connectedDevices.toLocaleString()} attached devices</div>}</td>
                  </tr>
                ))}
                {!loading && devices.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500">No network devices registered in this zone.</td></tr>}
                {loading && <tr><td colSpan="5" className="p-8 text-center text-slate-500">Loading authorized network inventory…</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><Activity className="h-4 w-4 text-sky-400" /> Guest Wi-Fi usage</h2>
          <p className="text-[11px] text-slate-400">Aggregate controller statistics only; browsing history and user-level identifiers are not collected.</p>
          {usage ? (
            <div className="mt-5 space-y-3">
              <div className="rounded-xl border border-navy-800 bg-navy-950 p-4">
                <p className="text-[10px] uppercase tracking-wide text-slate-500">Connected devices</p>
                <p className="mt-1 text-2xl font-bold text-white">{usage.connectedDevices.toLocaleString()}</p>
                <p className="text-[10px] text-slate-500">15-minute aggregate</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-3"><p className="text-[10px] text-slate-500">Sessions</p><p className="mt-1 font-bold text-white">{usage.sessions.toLocaleString()}</p></div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-3"><p className="text-[10px] text-slate-500">Aggregate data</p><p className="mt-1 font-bold text-white">{usage.totalDataMb.toLocaleString()} MB</p></div>
              </div>
              <StatusTag value={usage.source || 'SIMULATED'} simulated={usage.isSimulated} />
            </div>
          ) : <p className="mt-5 rounded-xl border border-dashed border-navy-700 p-5 text-center text-xs text-slate-500">No aggregate usage data reported by a controller.</p>}
        </section>
      </div>

      <section className={`${panelClass} p-5`}>
        <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><Network className="h-4 w-4 text-emerald-400" /> Logical network segmentation</h2>
        <p className="mb-4 text-[11px] text-slate-400">Separation plan only. These proposed logical domains do not create VLANs or change infrastructure.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(dashboard?.segments || []).map((segment) => (
            <article key={segment.segmentKey} className="rounded-xl border border-navy-800 bg-navy-950 p-3">
              <div className="flex items-center justify-between gap-2"><h3 className="text-xs font-bold text-white">{segment.name}</h3><StatusTag value={segment.status || 'PROPOSED'} simulated={segment.isSimulated} /></div>
              <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{segment.purpose}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><Globe2 className="h-4 w-4 text-sky-400" /> Guest access policy</h2>
          <p className="mb-4 text-[11px] text-slate-400">Policy drafts require approval. Captive portal and rate/session limits are not pushed to any controller.</p>
          <div className="mb-4 space-y-2">
            {(dashboard?.policies || []).map((policy) => (
              <div key={policy.id} className="rounded-xl border border-navy-800 bg-navy-950 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-xs text-white">{policy.ssid}</strong><StatusTag value={policy.status} simulated={policy.isSimulated} /></div>
                <p className="mt-2 text-[10px] text-slate-400">{policy.bandwidthMbps} Mbps · {policy.sessionMinutes} min session · {policy.idleTimeoutMinutes} min idle · {policy.maxDevicesPerSession} devices/session</p>
                <p className="mt-1 text-[10px] text-slate-500">Portal: {policy.captivePortalProvider || 'Not selected'}</p>
              </div>
            ))}
            {!dashboard?.policies?.length && <p className="text-xs text-slate-500">No guest access policies configured.</p>}
          </div>
          {permissions.canManage && (
            <form onSubmit={(event) => handleSubmit(event, '/api/network-management/wifi-policies', policyForm, 'Policy saved as draft.', () => setPolicyForm({ ...policyForm, ssid: '', captivePortalProvider: '' }))} className="grid gap-3 sm:grid-cols-2">
              <input required className={fieldClass} maxLength="32" placeholder="Guest SSID" value={policyForm.ssid} onChange={(e) => setPolicyForm({ ...policyForm, ssid: e.target.value })} />
              <input className={fieldClass} placeholder="Captive portal provider (if supported)" value={policyForm.captivePortalProvider} onChange={(e) => setPolicyForm({ ...policyForm, captivePortalProvider: e.target.value })} />
              <label className="text-[10px] text-slate-400">Bandwidth cap (Mbps)<input required type="number" min="1" max="1000" className={`${fieldClass} mt-1`} value={policyForm.bandwidthMbps} onChange={(e) => setPolicyForm({ ...policyForm, bandwidthMbps: e.target.value })} /></label>
              <label className="text-[10px] text-slate-400">Session length (minutes)<input required type="number" min="5" max="1440" className={`${fieldClass} mt-1`} value={policyForm.sessionMinutes} onChange={(e) => setPolicyForm({ ...policyForm, sessionMinutes: e.target.value })} /></label>
              <label className="text-[10px] text-slate-400">Idle timeout (minutes)<input required type="number" min="1" max="240" className={`${fieldClass} mt-1`} value={policyForm.idleTimeoutMinutes} onChange={(e) => setPolicyForm({ ...policyForm, idleTimeoutMinutes: e.target.value })} /></label>
              <label className="text-[10px] text-slate-400">Devices per session<input required type="number" min="1" max="10" className={`${fieldClass} mt-1`} value={policyForm.maxDevicesPerSession} onChange={(e) => setPolicyForm({ ...policyForm, maxDevicesPerSession: e.target.value })} /></label>
              <button disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50 sm:col-span-2">{saving ? 'Saving…' : 'Save draft pending approval'}</button>
            </form>
          )}
        </section>

        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><LockKeyhole className="h-4 w-4 text-emerald-400" /> Controller integration</h2>
          <p className="mb-4 text-[11px] text-slate-400">Only HTTPS, approved controller API or SNMPv3 metadata. Credentials belong in an external secret manager; no controller adapter is installed.</p>
          {(dashboard?.controllers || []).map((controller) => (
            <div key={controller.id} className="mb-3 rounded-xl border border-navy-800 bg-navy-950 p-3">
              <div className="flex items-center justify-between"><strong className="text-xs text-white">{controller.providerName}</strong><StatusTag value={controller.connectionStatus} simulated /></div>
              <p className="mt-2 text-[10px] text-slate-400">{controller.protocol} · {controller.isSimulated ? 'Development configuration' : 'Stored configuration'}</p>
              {controller.endpointUrl && <p className="mt-1 break-all text-[10px] text-slate-500">{controller.endpointUrl}</p>}
            </div>
          ))}
          {!dashboard?.controllers?.length && <p className="mb-4 text-xs text-slate-500">No controller integration configured.</p>}
          {permissions.canConfigureController && (
            <form onSubmit={(event) => handleSubmit(event, '/api/network-management/controllers', controllerForm, 'Controller metadata saved.', () => setControllerForm({ providerName: '', protocol: 'CONTROLLER_API', endpointUrl: '', secretReference: '' }))} className="space-y-3">
              <input required className={fieldClass} placeholder="Controller provider / model" value={controllerForm.providerName} onChange={(e) => setControllerForm({ ...controllerForm, providerName: e.target.value })} />
              <select className={fieldClass} value={controllerForm.protocol} onChange={(e) => setControllerForm({ ...controllerForm, protocol: e.target.value })}><option value="CONTROLLER_API">Wireless controller API over HTTPS</option><option value="SNMPV3">SNMPv3 AuthPriv</option></select>
              <input required type="url" className={fieldClass} placeholder="HTTPS management endpoint" value={controllerForm.endpointUrl} onChange={(e) => setControllerForm({ ...controllerForm, endpointUrl: e.target.value })} />
              <input className={fieldClass} placeholder="Secret-manager reference only" value={controllerForm.secretReference} onChange={(e) => setControllerForm({ ...controllerForm, secretReference: e.target.value })} />
              <button disabled={saving} className="rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-2 text-xs font-bold text-sky-200 disabled:opacity-50">{saving ? 'Saving…' : 'Save unverified metadata'}</button>
            </form>
          )}
        </section>
      </div>

      <section className={`${panelClass} p-5`}>
        <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><AlertTriangle className="h-4 w-4 text-amber-400" /> Network alerts</h2>
        <p className="mb-4 text-[11px] text-slate-400">Alert records are marked simulated when not supplied by an installed monitoring integration.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {alerts.map((alert) => (
            <article key={alert.id} className="rounded-xl border border-navy-800 bg-navy-950 p-3">
              <div className="flex items-center justify-between gap-2"><strong className="text-xs text-white">{alert.title}</strong><StatusTag value={alert.severity} simulated={alert.isSimulated} /></div>
              <p className="mt-2 text-[11px] text-slate-400">{alert.description}</p>
              <p className="mt-2 font-mono text-[10px] text-slate-500">{alert.id} · {alert.deviceId} · {alert.status}</p>
            </article>
          ))}
          {!alerts.length && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-slate-300"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No monitoring alerts reported.</div>}
        </div>
      </section>

      {permissions.canManage && (
        <section className={`${panelClass} p-5`}>
          <h2 className="mb-1 flex items-center gap-2 font-bold text-white"><Plus className="h-4 w-4 text-emerald-400" /> Register network equipment</h2>
          <p className="mb-4 text-[11px] text-slate-400">New hardware defaults to UNKNOWN/UNVERIFIED; registration will not claim the device is online.</p>
          <form onSubmit={(event) => handleSubmit(event, '/api/network-management/devices', deviceForm, 'Device inventory record created.', () => setDeviceForm({ ...deviceForm, deviceId: '', name: '', manufacturer: '', model: '' }))} className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <input className={fieldClass} placeholder="Device ID (auto-generated if blank)" value={deviceForm.deviceId} onChange={(e) => setDeviceForm({ ...deviceForm, deviceId: e.target.value })} />
            <input required className={fieldClass} placeholder="Device name" value={deviceForm.name} onChange={(e) => setDeviceForm({ ...deviceForm, name: e.target.value })} />
            <select className={fieldClass} value={deviceForm.category} onChange={(e) => setDeviceForm({ ...deviceForm, category: e.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select>
            <select className={fieldClass} value={deviceForm.zone} onChange={(e) => setDeviceForm({ ...deviceForm, zone: e.target.value })}>{zones.slice(1).map((item) => <option key={item}>{item}</option>)}</select>
            <input className={fieldClass} placeholder="Manufacturer" value={deviceForm.manufacturer} onChange={(e) => setDeviceForm({ ...deviceForm, manufacturer: e.target.value })} />
            <input className={fieldClass} placeholder="Model" value={deviceForm.model} onChange={(e) => setDeviceForm({ ...deviceForm, model: e.target.value })} />
            <button disabled={saving} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50 md:col-span-2 xl:col-span-3">{saving ? 'Saving…' : 'Register equipment record'}</button>
          </form>
        </section>
      )}

      <aside className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 text-xs text-slate-300">
        <h2 className="mb-2 flex items-center gap-2 font-bold text-sky-200"><CircleHelp className="h-4 w-4" /> Hardware and provider requirements</h2>
        <p>Deployment requires installed managed routers, switches, Wi-Fi access points and controller/gateway; stadium coverage and capacity survey; vendor-supported controller API or SNMPv3 AuthPriv documentation and licensing; HTTPS endpoints, network paths and read-only monitoring credentials via a secret manager; captive-portal provider support; policy limits and approval/change-control ownership. Define guest isolation and independent administration, ticketing/payment, CCTV/security, IoT, staff and critical-infrastructure security zones with the network team. This dashboard does not configure VLANs, ACLs, SSIDs, bandwidth, or live sessions.</p>
      </aside>
    </div>
  );
}
