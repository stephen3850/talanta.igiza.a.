'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle, Archive, CheckCircle2, Clock3, Database, HardDrive,
  RefreshCw, ShieldCheck, Siren,
} from 'lucide-react';

const panel = 'rounded-2xl border border-navy-800 bg-navy-900 shadow-xl';
const input = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none';

function Status({ value }) {
  const good = value === 'SUCCEEDED' || value === 'PASSED' || value === 'AVAILABLE';
  const bad = value === 'FAILED' || value === 'UNAVAILABLE';
  const tone = good ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'
    : bad ? 'text-red-300 bg-red-500/10 border-red-500/30'
      : 'text-amber-200 bg-amber-500/10 border-amber-500/30';
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${tone}`}>{value || 'UNKNOWN'}</span>;
}

export default function DisasterRecoveryPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [policy, setPolicy] = useState({ rpoMinutes: 60, rtoMinutes: 240, backupScheduleCron: '0 2 * * *' });
  const [test, setTest] = useState({ testType: 'BACKUP_INTEGRITY', status: 'PASSED', details: '', durationSeconds: '' });

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await fetch('/api/disaster-recovery/dashboard', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Recovery dashboard unavailable.');
      setDashboard(result.dashboard);
      setPolicy({
        rpoMinutes: result.dashboard.policy.rpoMinutes,
        rtoMinutes: result.dashboard.policy.rtoMinutes,
        backupScheduleCron: result.dashboard.policy.backupScheduleCron || '0 2 * * *',
      });
    } catch (loadError) { setError(loadError.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function submit(path, method, body, message) {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Request failed.');
      setNotice(result.message || message);
      await load();
    } catch (submitError) { setError(submitError.message); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen space-y-6 bg-navy-950 p-4 text-slate-100 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-emerald-300"><ShieldCheck className="h-5 w-5" /><span className="text-xs font-bold uppercase tracking-widest">Continuity & Resilience</span></div>
          <h1 className="text-2xl font-black text-white md:text-3xl">Disaster Recovery</h1>
          <p className="mt-1 text-xs text-slate-400">Backup evidence, recovery exercises, and proposed service objectives.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-navy-700 px-3 py-2 text-xs text-slate-300 hover:bg-navy-800"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </header>

      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-100">
        <strong>Deployment status: NOT VERIFIED.</strong> This console does not claim that backups, scheduling, high availability, failover, or disaster recovery are operational. A backup record is evidence only; recovery capability requires a successful isolated restore and application validation.
      </div>
      {error && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">{error}</div>}
      {notice && <div role="status" className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200">{notice}</div>}
      {dashboard && <section className={`${panel} grid gap-3 p-4 text-xs sm:grid-cols-3`}>
        <div className="flex items-center justify-between gap-2"><span className="text-slate-400">Application</span><Status value={dashboard.health.application} /></div>
        <div className="flex items-center justify-between gap-2"><span className="text-slate-400">Database</span><Status value={dashboard.health.database} /></div>
        <div className="flex items-center justify-between gap-2"><span className="text-slate-400">Backup scheduler</span><Status value={dashboard.health.backupScheduler} /></div>
        {(dashboard.warnings || []).map((warning) => <p key={warning} className="text-[11px] leading-relaxed text-amber-200 sm:col-span-3">• {warning}</p>)}
      </section>}
      {dashboard?.failedBackups > 0 && <section role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-100">
        <strong>{dashboard.failedBackups} backup failure(s) require administrator review.</strong>
        <ul className="mt-2 space-y-1 text-[11px]">{dashboard.backups.filter((backup) => backup.status === 'FAILED').map((backup) => <li key={backup.backupRef}>{backup.backupRef} · {new Date(backup.completedAt || backup.startedAt).toLocaleString()} · {backup.errorCode || 'Execution failed'}</li>)}</ul>
      </section>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Latest backup', dashboard?.lastSuccessfulBackup?.completedAt ? new Date(dashboard.lastSuccessfulBackup.completedAt).toLocaleString() : 'No successful backup recorded', Archive],
          ['Failed backup alerts', dashboard?.failedBackups ?? '—', AlertTriangle],
          ['Recovery tests recorded', dashboard?.recoveryTests?.length ?? '—', CheckCircle2],
          ['Backup scheduler', dashboard?.health?.backupScheduler || 'UNVERIFIED', Clock3],
        ].map(([label, value, Icon]) => <article key={label} className={`${panel} p-4`}>
          <div className="flex items-center justify-between text-xs text-slate-400"><span>{label}</span><Icon className="h-4 w-4 text-emerald-300" /></div>
          <div className="mt-3 break-words text-sm font-bold text-white">{value}</div>
        </article>)}
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className={`${panel} overflow-hidden xl:col-span-2`}>
          <div className="flex items-center gap-2 border-b border-navy-800 p-5"><HardDrive className="h-4 w-4 text-emerald-300" /><h2 className="font-bold text-white">Backup history</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="text-[10px] uppercase text-slate-500"><tr><th className="p-4">Reference</th><th className="p-4">Started</th><th className="p-4">Status</th><th className="p-4">Encryption</th><th className="p-4">Artifact</th></tr></thead>
              <tbody className="divide-y divide-navy-800">
                {(dashboard?.backups || []).map((backup) => <tr key={backup.backupRef}>
                  <td className="p-4 font-mono text-slate-300">{backup.backupRef}</td>
                  <td className="p-4 text-slate-400">{new Date(backup.startedAt).toLocaleString()}</td>
                  <td className="p-4"><Status value={backup.status} /></td>
                  <td className="p-4">{backup.encrypted ? 'AES-256-GCM' : 'Not verified'}</td>
                  <td className="p-4 text-slate-400">{backup.artifactName || 'No artifact recorded'}</td>
                </tr>)}
                {!dashboard?.backups?.length && <tr><td colSpan="5" className="p-8 text-center text-slate-500">No backup execution history available.</td></tr>}
              </tbody>
            </table>
          </div>
        </article>
        <article className={`${panel} p-5`}>
          <div className="mb-4 flex items-center gap-2"><Database className="h-4 w-4 text-emerald-300" /><h2 className="font-bold text-white">Recovery objectives</h2></div>
          <p className="mb-4 text-[11px] leading-relaxed text-amber-200">Proposed targets only. These remain pending stakeholder approval and are not an achieved service commitment.</p>
          <form onSubmit={(event) => { event.preventDefault(); submit('/api/disaster-recovery/policy', 'PUT', policy, 'Targets saved.'); }} className="space-y-3">
            <label className="block text-xs text-slate-300">RPO (minutes)<input className={`${input} mt-1`} type="number" min="1" max="10080" required value={policy.rpoMinutes} onChange={(event) => setPolicy({ ...policy, rpoMinutes: Number(event.target.value) })} /></label>
            <label className="block text-xs text-slate-300">RTO (minutes)<input className={`${input} mt-1`} type="number" min="1" max="10080" required value={policy.rtoMinutes} onChange={(event) => setPolicy({ ...policy, rtoMinutes: Number(event.target.value) })} /></label>
            <label className="block text-xs text-slate-300">Backup schedule (UTC cron)<input className={`${input} mt-1 font-mono`} required maxLength={80} value={policy.backupScheduleCron} onChange={(event) => setPolicy({ ...policy, backupScheduleCron: event.target.value })} /><span className="mt-1 block text-[10px] text-slate-500">Saved schedule proposal only; configure an external scheduler to invoke the backup job.</span></label>
            <div className="text-[10px] text-slate-400">Approval: <Status value={dashboard?.policy?.approvalStatus || 'PENDING_STAKEHOLDER_APPROVAL'} /></div>
            <button disabled={busy} className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Save proposed objectives</button>
          </form>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className={`${panel} p-5`}>
          <h2 className="mb-1 font-bold text-white">Record a recovery exercise</h2>
          <p className="mb-4 text-[11px] text-slate-400">Record only tests that were actually performed. A dashboard entry does not execute a restore.</p>
          <form onSubmit={(event) => { event.preventDefault(); submit('/api/disaster-recovery/tests', 'POST', { ...test, durationSeconds: test.durationSeconds === '' ? null : Number(test.durationSeconds) }, 'Recovery exercise recorded.'); }} className="space-y-3">
            <select className={input} value={test.testType} onChange={(event) => setTest({ ...test, testType: event.target.value })}>
              <option value="BACKUP_INTEGRITY">Backup integrity verification</option><option value="ISOLATED_RESTORE">Isolated database restore</option><option value="APPLICATION_RECOVERY">Application recovery</option><option value="FAILOVER_EXERCISE">Failover exercise</option>
            </select>
            <select className={input} value={test.status} onChange={(event) => setTest({ ...test, status: event.target.value })}><option>PASSED</option><option>FAILED</option><option>BLOCKED</option></select>
            <input className={input} type="number" min="0" placeholder="Duration in seconds (optional)" value={test.durationSeconds} onChange={(event) => setTest({ ...test, durationSeconds: event.target.value })} />
            <textarea className={`${input} min-h-24`} required maxLength={1000} placeholder="Environment, backup reference, validation performed, and outcome" value={test.details} onChange={(event) => setTest({ ...test, details: event.target.value })} />
            <button disabled={busy} className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-navy-950 disabled:opacity-50">Record test evidence</button>
          </form>
          <div className="mt-4 space-y-2">
            {(dashboard?.recoveryTests || []).slice(0, 5).map((item) => <div key={item.testRef} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-navy-800 p-3 text-[11px]"><span className="text-slate-300">{item.testType} · {new Date(item.testedAt).toLocaleString()}</span><Status value={item.status} /></div>)}
          </div>
        </article>
        <article className={`${panel} p-5`}>
          <h2 className="mb-4 flex items-center gap-2 font-bold text-white"><Siren className="h-4 w-4 text-amber-300" />Operational dependencies & recovery order</h2>
          <ol className="space-y-2 text-xs leading-relaxed text-slate-300">
            <li>1. Confirm incident scope, authorize recovery, preserve evidence and notify stakeholders.</li>
            <li>2. Provision isolated trusted compute, network access, DNS/TLS, PostgreSQL and secret-manager access.</li>
            <li>3. Verify encrypted backup integrity and select a known-good restore point.</li>
            <li>4. Restore to an isolated database, validate schema/data, and recover approved application configuration.</li>
            <li>5. Run application health checks, payment sandbox checks, ticket validation and reconciliation tests.</li>
            <li>6. Obtain business-owner sign-off, cut over through approved change control, monitor, and document results.</li>
          </ol>
          <div className="mt-4 border-t border-navy-800 pt-4 text-[11px] text-slate-400">
            Dependencies: {(dashboard?.dependencies || []).join(' · ')}
          </div>
        </article>
      </section>
    </main>
  );
}
