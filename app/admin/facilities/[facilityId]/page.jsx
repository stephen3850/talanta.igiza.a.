'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Building2, CalendarDays, ShieldAlert, Wrench } from 'lucide-react';

export default function FacilityDashboardPage() {
  const { facilityId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    document.cookie = `talanta_facility=${encodeURIComponent(facilityId)}; Path=/; Max-Age=28800; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`;
    window.dispatchEvent(new CustomEvent('talanta-facility-change', { detail: facilityId }));
    fetch(`/api/facilities/${encodeURIComponent(facilityId)}`, { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Facility data could not be loaded.');
        if (active) setData(result);
      })
      .catch((loadError) => { if (active) setError(loadError.message); });
    return () => { active = false; };
  }, [facilityId]);

  if (error) return <div role="alert" className="mx-auto max-w-4xl rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-200">{error}<p className="mt-3"><Link className="underline" href="/admin/facilities">Back to facility directory</Link></p></div>;
  if (!data) return <div className="p-8 text-sm text-slate-400">Loading facility dashboard…</div>;

  const { facility, metrics } = data;
  const cards = [
    { title: 'Published events', value: metrics.eventRecords, icon: CalendarDays },
    { title: 'Paid bookings', value: metrics.paidBookings, detail: `KES ${Number(metrics.verifiedTicketRevenueKes).toLocaleString('en-KE')} verified payment records`, icon: Building2 },
    { title: 'Approved entries · 24h', value: metrics.verifiedEntries24h, icon: ShieldAlert },
    { title: 'Active security alerts', value: metrics.activeSecurityAlerts, icon: ShieldAlert },
    { title: 'Open security incidents', value: metrics.openSecurityIncidents, icon: ShieldAlert },
    { title: 'Maintenance required', value: metrics.maintenanceRequired, icon: Wrench },
    { title: 'Registered IoT devices', value: metrics.registeredIoTDevices, detail: `${metrics.reportingIoTDevices24h} reported non-simulated telemetry in 24h`, icon: Building2 },
    { title: 'Registered assets', value: metrics.registeredAssets, detail: `${metrics.registeredNetworkDevices} network devices · ${metrics.registeredAccessPoints} access points`, icon: Wrench },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link href="/admin/facilities" className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400"><ArrowLeft className="h-4 w-4" />All facilities</Link>
      <header className="rounded-2xl border border-navy-800 bg-navy-900 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">{facility.facilityCode} · {facility.type.replaceAll('_', ' ')}</p>
            <h2 className="mt-2 text-3xl font-black text-white">{facility.name}</h2>
            <p className="mt-2 text-sm text-slate-400">{[facility.address, facility.city, facility.country].filter(Boolean).join(', ') || 'No address configured'}</p>
            {facility.description && <p className="mt-3 max-w-3xl text-sm text-slate-300">{facility.description}</p>}
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-300">{facility.status}</span>
        </div>
        <p className="mt-5 border-t border-navy-800 pt-4 text-xs text-slate-500">Metrics are facility-scoped database records. They do not prove physical connectivity, verified installation, or independent operational acceptance.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, detail, icon: Icon }) => (
          <div key={title} className="rounded-2xl border border-navy-800 bg-navy-900 p-5">
            <div className="flex items-center justify-between"><p className="text-xs uppercase tracking-wider text-slate-500">{title}</p><Icon className="h-4 w-4 text-emerald-400" /></div>
            <p className="mt-3 text-3xl font-black text-white">{value}</p>
            {detail && <p className="mt-2 text-[11px] leading-relaxed text-slate-400">{detail}</p>}
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-navy-800 bg-navy-900 p-5">
        <h3 className="text-lg font-bold text-white">Upcoming events</h3>
        {metrics.upcomingEvents.length ? (
          <div className="mt-4 divide-y divide-navy-800">
            {metrics.upcomingEvents.map((event) => <div key={event.id} className="flex flex-wrap justify-between gap-2 py-3"><div><p className="text-sm font-semibold text-white">{event.title}</p><p className="mt-1 text-xs text-slate-500">{event.venue}</p></div><time className="text-xs text-slate-400">{new Date(event.startDate).toLocaleString()}</time></div>)}
          </div>
        ) : <p className="mt-3 text-sm text-slate-400">No published upcoming events are recorded for this facility.</p>}
      </section>
    </div>
  );
}
