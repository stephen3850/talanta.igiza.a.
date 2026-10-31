'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, MapPin, Plus, RefreshCw } from 'lucide-react';

const initialForm = { facilityCode: '', name: '', type: 'STADIUM', description: '', address: '', city: '', country: '' };

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState([]);
  const [canCreate, setCanCreate] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function loadFacilities() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/facilities', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Facilities could not be loaded.');
      setFacilities(result.facilities || []);
      setCanCreate(Boolean(result.canCreateFacilities));
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadFacilities(); }, []);

  async function createFacility(event) {
    event.preventDefault();
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const response = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Facility could not be registered.');
      setNotice(`Registered ${result.facility.name}. No operational assets or events were generated.`);
      setForm(initialForm);
      await loadFacilities();
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  }

  const records = facilities.reduce((totals, facility) => {
    totals.events += facility._count?.events || 0;
    totals.assets += facility._count?.hardwareAssets || 0;
    totals.devices += facility._count?.iotDevices || 0;
    return totals;
  }, { events: 0, assets: 0, devices: 0 });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400 font-bold">Enterprise administration</p>
          <h2 className="mt-2 text-3xl font-black text-white">Facilities</h2>
          <p className="mt-2 max-w-3xl text-sm text-slate-400">Manage authorized venues and open a facility-specific operations view. Counts are database records, not proof of live operations.</p>
        </div>
        <button onClick={loadFacilities} className="inline-flex items-center gap-2 rounded-xl border border-navy-700 px-4 py-2 text-sm text-slate-200 hover:bg-navy-800">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </header>

      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">{notice}</div>}

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ['Authorized facilities', facilities.length],
          ['Event records', records.events],
          ['Asset / device records', records.assets + records.devices],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-navy-800 bg-navy-900 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-black text-white">{value}</p>
            <p className="mt-1 text-[11px] text-slate-500">Database records</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-navy-800 bg-navy-900 p-5">
        <h3 className="text-lg font-bold text-white">Facility directory</h3>
        {loading ? <p className="py-8 text-sm text-slate-400">Loading authorized facilities…</p> : facilities.length === 0 ? (
          <p className="py-8 text-sm text-slate-400">No facilities are assigned to your account.</p>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {facilities.map((facility) => (
              <Link key={facility.id} href={`/admin/facilities/${encodeURIComponent(facility.id)}`} onClick={() => {
                document.cookie = `talanta_facility=${encodeURIComponent(facility.id)}; Path=/; Max-Age=28800; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
                window.dispatchEvent(new CustomEvent('talanta-facility-change', { detail: facility.id }));
              }} className="rounded-xl border border-navy-700 bg-navy-950 p-4 transition hover:border-emerald-500/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400"><Building2 className="h-5 w-5" /></div>
                  <span className="rounded-full bg-navy-800 px-2.5 py-1 text-[10px] font-bold text-slate-300">{facility.status}</span>
                </div>
                <h4 className="mt-4 font-bold text-white">{facility.name}</h4>
                <p className="mt-1 text-xs text-slate-400">{facility.facilityCode} · {facility.type.replaceAll('_', ' ')}</p>
                {(facility.city || facility.country) && <p className="mt-2 flex items-center gap-1 text-xs text-slate-500"><MapPin className="h-3 w-3" />{[facility.city, facility.country].filter(Boolean).join(', ')}</p>}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-navy-800 pt-3 text-center">
                  <Metric label="Events" value={facility._count?.events || 0} />
                  <Metric label="Staff" value={facility._count?.staffAccreditations || 0} />
                  <Metric label="Assets" value={facility._count?.hardwareAssets || 0} />
                </div>
                <p className="mt-3 text-xs font-semibold text-emerald-400">Open facility dashboard →</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {canCreate && (
        <form onSubmit={createFacility} className="rounded-2xl border border-navy-800 bg-navy-900 p-5">
          <div className="flex items-center gap-2"><Plus className="h-5 w-5 text-emerald-400" /><h3 className="text-lg font-bold text-white">Register facility</h3></div>
          <p className="mt-1 text-xs text-slate-400">Registration creates a facility record only. It does not create sample events, staff, assets or devices.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Facility code" value={form.facilityCode} onChange={(facilityCode) => setForm({ ...form, facilityCode })} required />
            <Field label="Name" value={form.name} onChange={(name) => setForm({ ...form, name })} required />
            <label className="text-xs text-slate-400">Facility type
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-white">
                {['STADIUM', 'TRAINING_FACILITY', 'PARKING_FACILITY', 'SPORTS_FACILITY', 'OTHER'].map((type) => <option key={type} value={type}>{type.replaceAll('_', ' ')}</option>)}
              </select>
            </label>
            <Field label="City" value={form.city} onChange={(city) => setForm({ ...form, city })} />
            <Field label="Country" value={form.country} onChange={(country) => setForm({ ...form, country })} />
            <Field label="Address" value={form.address} onChange={(address) => setForm({ ...form, address })} />
          </div>
          <button disabled={saving} className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-bold text-navy-950 disabled:opacity-50">{saving ? 'Saving…' : 'Register facility'}</button>
        </form>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return <div><p className="text-sm font-bold text-white">{value}</p><p className="text-[10px] text-slate-500">{label}</p></div>;
}

function Field({ label, value, onChange, required = false }) {
  return <label className="text-xs text-slate-400">{label}<input required={required} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-white" /></label>;
}
