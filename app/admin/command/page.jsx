'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, AlertTriangle, Calendar, CheckCircle2, RefreshCw, Shield, Ticket, Wifi } from 'lucide-react';
import RevenueTrendChart from '../../../components/RevenueTrendChart';

const panel = 'rounded-2xl border border-navy-800 bg-navy-900 p-5 shadow-xl';

function metric(value) {
  return Number(value || 0).toLocaleString();
}

function timestamp(value) {
  return value ? new Date(value).toLocaleString() : 'No recorded result';
}

function IntegrationStatus({ item }) {
  const isAvailable = ['AVAILABLE', 'DATABASE_BACKED'].includes(item.status);
  return (
    <div className="flex items-start justify-between gap-4 border-b border-navy-800 py-3 last:border-0">
      <div>
        <div className="text-sm font-semibold text-white">{item.name}</div>
        <p className="mt-1 text-xs text-slate-400">{item.evidence}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${isAvailable ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'}`}>
        {item.status.replaceAll('_', ' ')}
      </span>
    </div>
  );
}

export default function CommandCentrePage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/command/metrics', { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Command dashboard is unavailable.');
      setDashboard(result);
    } catch (loadError) {
      setDashboard(null);
      setError(loadError.message || 'Command dashboard is unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const metrics = dashboard?.metrics || {};
  const cards = [
    { label: 'Published events', value: metric(metrics.eventsPublished), icon: Calendar },
    { label: 'Provider-paid bookings', value: metric(metrics.paidBookings), icon: Ticket },
    { label: 'Issued, paid tickets', value: metric(metrics.issuedTickets), icon: CheckCircle2 },
    { label: 'Verified gate entries · 24h', value: metric(metrics.verifiedEntries24h), icon: Activity },
    { label: 'Verified ticket revenue (KES)', value: metric(metrics.verifiedTicketRevenueKes), icon: Ticket },
    { label: 'Active security alerts', value: metric(metrics.activeSecurityAlerts), icon: AlertTriangle },
    { label: 'Payments pending', value: metric(metrics.pendingPayments), icon: Activity },
    { label: 'Non-simulated IoT reporters · 24h', value: `${metric(metrics.telemetryReportingDevices24h)} / ${metric(metrics.registeredIoTDevices)}`, icon: Wifi },
  ];

  return (
    <div className="space-y-6">
      <header className={`${panel} flex flex-wrap items-center justify-between gap-4`}>
        <div>
          <div className="mb-2 flex items-center gap-2 text-emerald-300">
            <Shield className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Executive operations dashboard</span>
          </div>
          <h1 className="text-2xl font-black text-white md:text-3xl">Talanta Stadium Command Centre</h1>
          <p className="mt-1 text-xs text-slate-400">
            {dashboard?.dataMode === 'DATABASE' ? `Database snapshot · ${timestamp(dashboard.generatedAt)}` : 'No verified operational snapshot loaded'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dashboard && <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[10px] font-bold text-amber-200">{dashboard.operationalStatus?.replaceAll('_', ' ')}</span>}
          <button type="button" onClick={refresh} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-navy-700 px-3 py-2 text-xs text-slate-200 hover:bg-navy-800 disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </header>

      <aside className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-100">
        <strong>Readiness notice:</strong> Database counts are verified records, not independent proof of physical deployment or device connectivity. Unverified, simulated, and unavailable integrations are identified below. This dashboard does not issue hardware commands or test external providers.
      </aside>
      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}

      {dashboard && (
        <>
          <section aria-label="Verified database metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon }) => (
              <article key={label} className={panel}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="mt-3 text-2xl font-black text-white">{value}</p>
                    <p className="mt-1 text-[10px] text-slate-500">Database-backed count</p>
                  </div>
                  <Icon className="h-5 w-5 text-emerald-400" />
                </div>
              </article>
            ))}
          </section>

          <RevenueTrendChart
            title="Daily Command Centre Revenue Trend (LAST 30 DAYS)"
            subtitle="Daily revenue aggregated directly from closed sales transactions"
            totalAmount={metrics.verifiedTicketRevenueKes}
            currency="KSh"
            accentColor="emerald"
          />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className={panel}>
              <h2 className="mb-2 flex items-center gap-2 text-base font-bold text-white"><Activity className="h-5 w-5 text-emerald-400" /> Integration and infrastructure status</h2>
              <div>{dashboard.integrations?.map((item) => <IntegrationStatus key={item.name} item={item} />)}</div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-3">
                  <span className="text-slate-400">Reported network devices</span>
                  <div className="mt-1 font-bold text-white">{metric(metrics.reportedNetworkDevices)} / {metric(metrics.registeredNetworkDevices)}</div>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-3">
                  <span className="text-slate-400">Reported access points</span>
                  <div className="mt-1 font-bold text-white">{metric(metrics.reportedAccessPoints)}</div>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-3">
                  <span className="text-slate-400">Maintenance required records</span>
                  <div className="mt-1 font-bold text-white">{metric(metrics.maintenanceRequiredRecords)}</div>
                </div>
                <div className="rounded-xl border border-navy-800 bg-navy-950 p-3">
                  <span className="text-slate-400">Commissioning approvals recorded</span>
                  <div className="mt-1 font-bold text-white">{metric(metrics.commissionedAssets)}</div>
                </div>
              </div>
            </section>

            <section className={panel}>
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white"><AlertTriangle className="h-5 w-5 text-amber-300" /> Active security alerts</h2>
              {dashboard.alerts?.length ? <div className="space-y-3">
                {dashboard.alerts.map((alert) => (
                  <article key={alert.alertRef} className="rounded-xl border border-navy-800 bg-navy-950 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white">{alert.title}</span>
                      <span className="text-[10px] font-bold text-amber-200">{alert.severity}</span>
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">{alert.alertRef} · {timestamp(alert.lastSeenAt)} · occurrences {alert.occurrenceCount}</div>
                  </article>
                ))}
              </div> : <p className="text-xs text-slate-400">No active persisted SOC alerts.</p>}
              <p className="mt-4 text-xs text-slate-400">Open cybersecurity incidents: <strong className="text-white">{metric(metrics.openSecurityIncidents)}</strong>. Venue incident records are not included unless separately integrated.</p>
            </section>
          </div>

          <section className={panel}>
            <h2 className="mb-4 text-base font-bold text-white">Upcoming published events</h2>
            {dashboard.upcomingEvents?.length ? <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {dashboard.upcomingEvents.map((event) => (
                <article key={event.id} className="rounded-xl border border-navy-800 bg-navy-950 p-4">
                  <div className="font-semibold text-white">{event.title}</div>
                  <div className="mt-1 text-xs text-slate-400">{event.venue} · {timestamp(event.startDate)}</div>
                </article>
              ))}
            </div> : <p className="text-xs text-slate-400">No upcoming published database events.</p>}
          </section>

          <section className={`${panel} text-xs text-slate-400`}>
            <h2 className="mb-2 text-sm font-bold text-white">Backup and recovery evidence</h2>
            <p>Latest backup record: {metrics.latestBackup ? `${metrics.latestBackup.status} · ${timestamp(metrics.latestBackup.completedAt || metrics.latestBackup.startedAt)} · encrypted: ${metrics.latestBackup.encrypted ? 'yes' : 'no'}` : 'No backup record.'}</p>
            <p className="mt-1">Latest recovery test: {metrics.latestRecoveryTest ? `${metrics.latestRecoveryTest.status} · ${timestamp(metrics.latestRecoveryTest.testedAt)}` : 'No recovery test record.'}</p>
          </section>

          <ul className="space-y-1 px-1 text-[10px] text-slate-500">
            {dashboard.notes?.map((note) => <li key={note}>{note}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}
