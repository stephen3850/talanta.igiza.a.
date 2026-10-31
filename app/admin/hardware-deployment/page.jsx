'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, Camera, Check, ClipboardCheck, HardDrive, Plus, RefreshCw, Wrench } from 'lucide-react';

const panel = 'rounded-2xl border border-navy-800 bg-navy-900 shadow-xl';
const input = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none';
const categories = ['CCTV_CAMERA', 'NETWORK_SWITCH', 'ROUTER', 'WIFI_ACCESS_POINT', 'IOT_SENSOR', 'DIGITAL_SIGNAGE', 'ACCESS_CONTROLLER', 'TICKET_SCANNER', 'ENVIRONMENTAL_EQUIPMENT', 'SERVER_STORAGE'];
const checks = [
  ['POWER_VERIFIED', 'Power verification'],
  ['NETWORK_VERIFIED', 'Network connectivity'],
  ['CONFIGURATION_VERIFIED', 'Device configuration'],
  ['SECURITY_VERIFIED', 'Security configuration'],
  ['FUNCTIONAL_TEST', 'Functional test'],
];
const mandatoryCheckKeys = checks.map(([key]) => key);

export default function HardwareDeploymentPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [asset, setAsset] = useState({ assetId: '', name: '', category: categories[0], manufacturer: '', model: '', serialNumber: '', installationLocation: '', supplier: '', warrantyStart: '', warrantyExpiry: '', iotDeviceId: '' });
  const [task, setTask] = useState({ assetId: '', technicianId: '', title: '', details: '' });
  const [taskNotes, setTaskNotes] = useState({});
  const [taskInstallDates, setTaskInstallDates] = useState({});
  const [maintenance, setMaintenance] = useState({ assetId: '', recordType: 'INSPECTION', status: 'OPEN', scheduledAt: '', technicianId: '', details: '' });
  const [checkAssetId, setCheckAssetId] = useState('');
  const [checkValues, setCheckValues] = useState(Object.fromEntries(checks.map(([key]) => [key, false])));
  const [templateCategory, setTemplateCategory] = useState(categories[0]);
  const [templateDraft, setTemplateDraft] = useState('');
  const [evidence, setEvidence] = useState({ assetId: '', taskRef: '', file: null });

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await fetch('/api/hardware-deployment/dashboard', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Hardware operations dashboard is unavailable.');
      setDashboard(result.dashboard);
    } catch (loadError) { setError(loadError.message); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!templateDraft && dashboard?.commissioningTemplates?.length) {
      const currentTemplate = dashboard.commissioningTemplates.find((item) => item.category === templateCategory);
      if (currentTemplate) setTemplateDraft(currentTemplate.checks.map((item) => `${item.key}=${item.label}`).join('\n'));
    }
  }, [dashboard, templateCategory, templateDraft]);

  async function submit(path, method, body, successMessage) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Hardware operation failed.');
      setNotice(result.message || successMessage);
      await load();
      return result;
    } catch (submitError) {
      setError(submitError.message);
      return null;
    } finally { setBusy(false); }
  }

  async function uploadEvidence(event) {
    event.preventDefault();
    if (!evidence.file) return setError('Choose a document or photograph first.');
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const form = new FormData();
      form.set('assetId', evidence.assetId);
      form.set('taskRef', evidence.taskRef);
      form.set('file', evidence.file);
      const response = await fetch('/api/hardware-deployment/attachments', { method: 'POST', body: form });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Evidence upload failed.');
      setNotice(`Evidence stored privately: ${result.attachment.attachmentRef}`);
      setEvidence({ assetId: '', taskRef: '', file: null });
      await load();
    } catch (uploadError) { setError(uploadError.message); }
    finally { setBusy(false); }
  }

  const metrics = dashboard?.metrics || {};
  const assets = dashboard?.assets || [];
  const selectedCommissioningAsset = assets.find((item) => item.assetId === checkAssetId);
  const commissioningChecks = dashboard?.commissioningTemplates?.find((item) => item.category === selectedCommissioningAsset?.category)?.checks
    || dashboard?.commissioningTemplates?.find((item) => item.category === templateCategory)?.checks
    || checks.map(([key, label]) => ({ key, label }));
  const saveTemplate = () => {
    const parsed = templateDraft.split(/\r?\n/).map((line) => {
      const separator = line.indexOf('=');
      return separator < 1 ? null : { key: line.slice(0, separator).trim(), label: line.slice(separator + 1).trim() };
    });
    if (parsed.some((entry) => !entry || !entry.label)) return setError('Use one KEY=Label entry per line.');
    if (mandatoryCheckKeys.some((key) => !parsed.some((entry) => entry.key === key))) return setError('The five mandatory checks must remain in every category template.');
    submit('/api/hardware-deployment/templates', 'PUT', { category: templateCategory, checks: parsed }, 'Commissioning template saved.');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-emerald-300"><HardDrive className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Stadium Infrastructure</span></div>
          <h1 className="text-2xl font-black text-white md:text-3xl">Hardware Deployment & Commissioning</h1>
          <p className="mt-1 text-xs text-slate-400">Inventory, installation tasks, acceptance checks and maintenance evidence.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-navy-700 px-3 py-2 text-xs text-slate-300 hover:bg-navy-800"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </header>
      <aside className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-100">
        <strong>No actual deployments are assumed.</strong> Create records from verified procurement and site data. IoT inventory links are informational; they do not prove installation, security configuration, or acceptance.
      </aside>
      {error && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">{notice}</div>}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {[
          ['Registered', metrics.totalAssets ?? 0, HardDrive],
          ['Installed', metrics.installed ?? 0, Check],
          ['Pending install', metrics.pendingInstallation ?? 0, Activity],
          ['Commissioned', metrics.commissioned ?? 0, ClipboardCheck],
          ['Failed checks', metrics.failedInspections ?? 0, Camera],
          ['Maintenance due', metrics.maintenanceRequired ?? 0, Wrench],
        ].map(([label, value, Icon]) => <article key={label} className={`${panel} p-4`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400"><span>{label}</span><Icon className="h-4 w-4 text-emerald-300" /></div>
          <div className="mt-2 text-xl font-black text-white">{value}</div>
        </article>)}
      </section>

      <div className="flex flex-wrap gap-2">
        {['inventory', 'installations', 'commissioning', 'maintenance'].map((type) => <a key={type} href={`/api/hardware-deployment/reports?type=${type}`} className="rounded-lg border border-navy-700 px-3 py-2 text-xs font-semibold capitalize text-slate-300 hover:bg-navy-800">Download {type} CSV</a>)}
      </div>

      <section className={`${panel} p-5`}>
        <h2 className="mb-2 font-bold text-white">Configurable commissioning templates</h2>
        <p className="mb-3 text-[11px] text-slate-400">Templates are per equipment category. Preserve the mandatory power, network, configuration, security, and functional checks. Add category-specific checks as needed.</p>
        <div className="grid gap-3 lg:grid-cols-[220px_1fr_auto]">
          <select className={input} value={templateCategory} onChange={(event) => {
            const nextCategory = event.target.value;
            setTemplateCategory(nextCategory);
            const template = dashboard?.commissioningTemplates?.find((item) => item.category === nextCategory);
            setTemplateDraft(template?.checks.map((item) => `${item.key}=${item.label}`).join('\n') || '');
          }}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          <textarea className={`${input} min-h-32 font-mono`} value={templateDraft} onChange={(event) => setTemplateDraft(event.target.value)} />
          <button type="button" disabled={busy} onClick={saveTemplate} className="rounded-lg border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-200 disabled:opacity-50">Save category checklist</button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className={`${panel} p-5`}>
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white"><Plus className="h-4 w-4 text-emerald-300" /> Register equipment</h2>
          <form onSubmit={async (event) => {
            event.preventDefault();
            const result = await submit('/api/hardware-deployment/assets', 'POST', asset, 'Equipment registered.');
            if (result) setAsset({ assetId: '', name: '', category: categories[0], manufacturer: '', model: '', serialNumber: '', installationLocation: '', supplier: '', warrantyStart: '', warrantyExpiry: '', iotDeviceId: '' });
          }} className="grid gap-3 sm:grid-cols-2">
            <input className={input} required maxLength={64} placeholder="Unique asset ID *" value={asset.assetId} onChange={(event) => setAsset({ ...asset, assetId: event.target.value })} />
            <input className={input} required maxLength={180} placeholder="Equipment name *" value={asset.name} onChange={(event) => setAsset({ ...asset, name: event.target.value })} />
            <select className={input} value={asset.category} onChange={(event) => setAsset({ ...asset, category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
            <input className={input} placeholder="Manufacturer" value={asset.manufacturer} onChange={(event) => setAsset({ ...asset, manufacturer: event.target.value })} />
            <input className={input} placeholder="Model" value={asset.model} onChange={(event) => setAsset({ ...asset, model: event.target.value })} />
            <input className={input} placeholder="Serial number" value={asset.serialNumber} onChange={(event) => setAsset({ ...asset, serialNumber: event.target.value })} />
            <input className={input} placeholder="Verified installation location" value={asset.installationLocation} onChange={(event) => setAsset({ ...asset, installationLocation: event.target.value })} />
            <input className={input} placeholder="Supplier" value={asset.supplier} onChange={(event) => setAsset({ ...asset, supplier: event.target.value })} />
            <label className="text-[10px] text-slate-400">Warranty start<input className={`${input} mt-1`} type="date" value={asset.warrantyStart} onChange={(event) => setAsset({ ...asset, warrantyStart: event.target.value })} /></label>
            <label className="text-[10px] text-slate-400">Warranty expiry<input className={`${input} mt-1`} type="date" value={asset.warrantyExpiry} onChange={(event) => setAsset({ ...asset, warrantyExpiry: event.target.value })} /></label>
            <input className={input} placeholder="Linked IoT device ID (optional)" value={asset.iotDeviceId} onChange={(event) => setAsset({ ...asset, iotDeviceId: event.target.value })} />
            <button disabled={busy} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50 sm:col-span-2">Register equipment</button>
          </form>
        </article>
        <article className={`${panel} p-5`}>
          <h2 className="mb-4 font-bold text-white">Create installation task</h2>
          <form onSubmit={(event) => { event.preventDefault(); submit('/api/hardware-deployment/installations', 'POST', task, 'Installation task created.'); }} className="space-y-3">
            <select className={input} required value={task.assetId} onChange={(event) => setTask({ ...task, assetId: event.target.value })}><option value="">Select registered asset</option>{assets.filter((item) => !item.installationDate).map((item) => <option key={item.assetId} value={item.assetId}>{item.assetId} — {item.name}</option>)}</select>
            <input className={input} required placeholder="Assigned technician/user ID" value={task.technicianId} onChange={(event) => setTask({ ...task, technicianId: event.target.value })} />
            <input className={input} required maxLength={160} placeholder="Task title" value={task.title} onChange={(event) => setTask({ ...task, title: event.target.value })} />
            <textarea className={`${input} min-h-20`} maxLength={1000} placeholder="Work scope and verified site instructions" value={task.details} onChange={(event) => setTask({ ...task, details: event.target.value })} />
            <button disabled={busy} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Create task</button>
          </form>
          <div className="mt-5 space-y-2 border-t border-navy-800 pt-4">
            {(dashboard?.installationTasks || []).slice(0, 5).map((item) => <div key={item.taskRef} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy-800 p-3 text-[11px]">
              <span className="text-slate-300">{item.taskRef} · {item.title}</span><span className="text-amber-200">{item.status}</span>
              {item.status !== 'INSTALLED' && item.status !== 'CANCELLED' && <div className="flex flex-wrap items-center gap-2"><input className={`${input} max-w-44`} placeholder="Progress / inspection note" value={taskNotes[item.taskRef] || ''} onChange={(event) => setTaskNotes({ ...taskNotes, [item.taskRef]: event.target.value })} />{item.status !== 'PENDING' && <input aria-label="Actual installation date" className={`${input} max-w-36`} type="date" value={taskInstallDates[item.taskRef] || ''} onChange={(event) => setTaskInstallDates({ ...taskInstallDates, [item.taskRef]: event.target.value })} />}<button onClick={() => submit('/api/hardware-deployment/installations', 'PATCH', { taskRef: item.taskRef, status: item.status === 'PENDING' ? 'IN_PROGRESS' : 'INSTALLED', note: taskNotes[item.taskRef] || '', installationDate: taskInstallDates[item.taskRef] || undefined }, 'Installation updated.')} className="rounded border border-navy-700 px-2 py-1 text-emerald-200">{item.status === 'PENDING' ? 'Start' : 'Record installed'}</button></div>}
              {item.status === 'INSTALLED' && !item.approvalById && <button onClick={() => submit('/api/hardware-deployment/installations', 'PUT', { taskRef: item.taskRef }, 'Installation inspection approved.')} className="rounded border border-amber-500/40 px-2 py-1 text-amber-200">Manager inspection approval</button>}
              {item.approvalById && <span className="text-emerald-300">Approved by {item.approvalById}</span>}
            </div>)}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className={`${panel} p-5 xl:col-span-2`}>
          <h2 className="mb-4 font-bold text-white">Commissioning checklist</h2>
          <div className="mb-3 flex flex-wrap gap-2">
            <select className={`${input} max-w-md`} value={checkAssetId} onChange={(event) => {
              const nextId = event.target.value;
              const nextAsset = assets.find((item) => item.assetId === nextId);
              const nextChecks = dashboard?.commissioningTemplates?.find((item) => item.category === nextAsset?.category)?.checks || [];
              setCheckAssetId(nextId);
              setCheckValues(Object.fromEntries(nextChecks.map(({ key }) => [key, false])));
            }}><option value="">Select installed equipment</option>{assets.filter((item) => item.installationDate && !item.isIoTLinked).map((item) => <option key={item.assetId} value={item.assetId}>{item.assetId} — {item.name} ({item.commissioningStatus})</option>)}</select>
            <button disabled={busy || !checkAssetId} onClick={() => submit('/api/hardware-deployment/commissioning', 'POST', { assetId: checkAssetId, checks: commissioningChecks.map((item) => ({ key: item.key, passed: Boolean(checkValues[item.key]) })) }, 'Checklist recorded. Acceptance approval remains separate.')} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Record results</button>
            <button disabled={busy || !checkAssetId || assets.find((item) => item.assetId === checkAssetId)?.commissioningStatus !== 'PASSED'} onClick={() => submit('/api/hardware-deployment/commissioning', 'PUT', { assetId: checkAssetId }, 'Acceptance approved.')} className="rounded-lg border border-amber-500/40 px-4 py-2 text-xs font-bold text-amber-200 disabled:opacity-40">Separate acceptance approval</button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">{commissioningChecks.map(({ key, label }) => <label key={key} className="flex items-center gap-2 rounded-lg border border-navy-800 p-3 text-xs text-slate-300"><input type="checkbox" checked={Boolean(checkValues[key])} onChange={(event) => setCheckValues({ ...checkValues, [key]: event.target.checked })} />{label}</label>)}</div>
          <p className="mt-3 text-[10px] text-slate-500">Unchecked means the verification has not passed. A different authorized manager must approve acceptance after all five checks pass.</p>
        </article>
        <article className={`${panel} p-5`}>
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white"><Wrench className="h-4 w-4 text-emerald-300" /> Maintenance record</h2>
          <form onSubmit={(event) => { event.preventDefault(); submit('/api/hardware-deployment/maintenance', 'POST', maintenance, 'Maintenance record created.'); }} className="space-y-3">
            <select className={input} required value={maintenance.assetId} onChange={(event) => setMaintenance({ ...maintenance, assetId: event.target.value })}><option value="">Select asset</option>{assets.map((item) => <option key={item.assetId} value={item.assetId}>{item.assetId} — {item.name}</option>)}</select>
            <select className={input} value={maintenance.recordType} onChange={(event) => setMaintenance({ ...maintenance, recordType: event.target.value })}><option>INSPECTION</option><option>FAULT</option><option>REPAIR</option><option>REPLACEMENT</option></select>
            <select className={input} value={maintenance.status} onChange={(event) => setMaintenance({ ...maintenance, status: event.target.value })}><option>OPEN</option><option>IN_PROGRESS</option><option>COMPLETED</option><option>CANCELLED</option></select>
            {maintenance.recordType === 'REPLACEMENT' && <select className={input} required value={maintenance.replacementAssetId || ''} onChange={(event) => setMaintenance({ ...maintenance, replacementAssetId: event.target.value })}><option value="">Select replacement asset</option>{assets.filter((item) => item.assetId !== maintenance.assetId).map((item) => <option key={item.assetId} value={item.assetId}>{item.assetId} — {item.name}</option>)}</select>}
            <input className={input} placeholder="Technician ID (optional)" value={maintenance.technicianId} onChange={(event) => setMaintenance({ ...maintenance, technicianId: event.target.value })} />
            <label className="block text-[10px] text-slate-400">Scheduled<input className={`${input} mt-1`} type="datetime-local" value={maintenance.scheduledAt} onChange={(event) => setMaintenance({ ...maintenance, scheduledAt: event.target.value })} /></label>
            <textarea className={`${input} min-h-20`} required placeholder="Inspection/fault/repair details" value={maintenance.details} onChange={(event) => setMaintenance({ ...maintenance, details: event.target.value })} />
            <button disabled={busy} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Save maintenance record</button>
          </form>
        </article>
      </section>

      {dashboard?.attachments?.length > 0 && <section className={`${panel} p-5`}>
        <h2 className="mb-3 font-bold text-white">Installation evidence files</h2>
        <div className="space-y-2">{dashboard.attachments.map((file) => <div key={file.attachmentRef} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy-800 p-3 text-xs"><span className="text-slate-300">{file.assetId} · {file.originalName} · {(file.sizeBytes / 1024).toFixed(1)} KB</span><a className="text-emerald-300 underline" href={`/api/hardware-deployment/attachments?ref=${encodeURIComponent(file.attachmentRef)}`}>Authenticated download</a></div>)}</div>
      </section>}

      <section className={`${panel} p-5`}>
        <h2 className="mb-3 flex items-center gap-2 font-bold text-white"><Camera className="h-4 w-4 text-emerald-300" /> Private installation evidence</h2>
        <form onSubmit={uploadEvidence} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <select className={input} required value={evidence.assetId} onChange={(event) => setEvidence({ ...evidence, assetId: event.target.value })}><option value="">Select asset</option>{assets.filter((item) => !item.isIoTLinked).map((item) => <option key={item.assetId} value={item.assetId}>{item.assetId} — {item.name}</option>)}</select>
          <input className={input} placeholder="Installation task reference (optional)" value={evidence.taskRef} onChange={(event) => setEvidence({ ...evidence, taskRef: event.target.value })} />
          <input className={`${input} file:mr-2`} required type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(event) => setEvidence({ ...evidence, file: event.target.files?.[0] || null })} />
          <button disabled={busy} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Upload private evidence</button>
        </form>
        <p className="mt-2 text-[10px] text-slate-500">PDF/JPEG/PNG/WEBP up to 10 MB. Files are stored outside the web root and require an authenticated download.</p>
      </section>

      <section className={`${panel} overflow-hidden`}>
        <h2 className="border-b border-navy-800 p-5 font-bold text-white">Registered equipment inventory</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-xs">
            <thead className="text-[10px] uppercase text-slate-500"><tr>{['Asset ID / name', 'Category', 'Manufacturer / model', 'Serial', 'Verified location', 'Install', 'Commissioning', 'Maintenance', 'Source'].map((title) => <th key={title} className="p-3">{title}</th>)}</tr></thead>
            <tbody className="divide-y divide-navy-800">
              {assets.map((item) => <tr key={item.assetId}><td className="p-3"><strong className="block text-slate-200">{item.assetId}</strong><span className="text-slate-400">{item.name}</span></td><td className="p-3">{item.category}</td><td className="p-3">{[item.manufacturer, item.model].filter(Boolean).join(' / ') || 'Not recorded'}</td><td className="p-3">{item.serialNumber || 'Not recorded'}</td><td className="p-3">{item.installationLocation || 'Not recorded'}</td><td className="p-3">{item.installationDate ? new Date(item.installationDate).toLocaleDateString() : 'Pending'}</td><td className="p-3">{item.commissioningStatus || 'NOT_STARTED'}</td><td className="p-3">{item.maintenanceStatus || 'NOT_ASSESSED'}</td><td className="p-3">{item.isIoTLinked ? 'IoT linked' : item.isSimulated ? 'Development record' : 'Hardware record'}</td></tr>)}
              {!assets.length && <tr><td colSpan="9" className="p-8 text-center text-slate-500">No hardware records yet. Register verified equipment to begin.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <section className="grid gap-5 xl:grid-cols-2">
        <article className={`${panel} overflow-hidden`}>
          <h2 className="border-b border-navy-800 p-5 font-bold text-white">Recent commissioning results</h2>
          <div className="divide-y divide-navy-800">{(dashboard?.commissioningChecks || []).slice(0, 10).map((check) => <div key={check.checkRef} className="flex flex-wrap items-center justify-between gap-2 p-3 text-xs"><span className="text-slate-300">{check.assetId} · {check.checkKey} · {check.performedById}</span><span className={check.passed ? 'text-emerald-300' : 'text-red-300'}>{check.passed ? 'PASS' : 'FAIL'} · {check.status}</span></div>)}{!dashboard?.commissioningChecks?.length && <p className="p-5 text-xs text-slate-500">No commissioning checks recorded.</p>}</div>
        </article>
        <article className={`${panel} overflow-hidden`}>
          <h2 className="border-b border-navy-800 p-5 font-bold text-white">Maintenance and replacement history</h2>
          <div className="divide-y divide-navy-800">{(dashboard?.maintenanceRecords || []).slice(0, 10).map((record) => <div key={record.maintenanceRef} className="p-3 text-xs"><div className="flex flex-wrap justify-between gap-2 text-slate-300"><span>{record.assetId} · {record.recordType} · {record.status}</span><span>{record.technicianId || 'Technician not assigned'}</span></div><p className="mt-1 text-slate-500">{record.details}{record.replacementAssetId ? ` · Replaced with ${record.replacementAssetId}` : ''}</p></div>)}{!dashboard?.maintenanceRecords?.length && <p className="p-5 text-xs text-slate-500">No maintenance records entered.</p>}</div>
        </article>
      </section>
    </div>
  );
}
