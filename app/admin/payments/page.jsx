'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock3, CreditCard, Download, FileUp, PlusCircle, RefreshCw, ShieldCheck, Wallet, XCircle } from 'lucide-react';
import RevenueTrendChart from '../../../components/RevenueTrendChart';

const panel = 'rounded-2xl border border-navy-800 bg-navy-900 p-5';
const field = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-white';
const action = 'rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-navy-950 disabled:opacity-50';
const quietAction = 'rounded-lg border border-navy-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/50';
const money = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 2 }).format(Number(amount || 0));

export default function AdminPaymentsDashboardPage() {
  const [report, setReport] = useState(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [facilityId, setFacilityId] = useState('');
  const [range, setRange] = useState({ from: '', to: '' });
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (facilityId.trim()) params.set('facilityId', facilityId.trim());
    if (range.from) params.set('from', range.from);
    if (range.to) params.set('to', range.to);
    return params.toString();
  }, [facilityId, range]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const response = await fetch(`/api/finance/dashboard${query ? `?${query}` : ''}`, { cache: 'no-store' });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Financial dashboard unavailable.');
      setReport(result.report);
      setMessage('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }, [query]);

  useEffect(() => { load(); }, [load]);

  async function send(endpoint, method, body, successMessage) {
    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Financial operation failed.');
      setMessage(result.message || successMessage);
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function submit(event, endpoint, transform) {
    event.preventDefault();
    const form = event.currentTarget;
    try {
      const values = Object.fromEntries(new FormData(form).entries());
      await send(endpoint, 'POST', transform ? transform(values) : values, 'Financial record saved.');
      form.reset();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function review(recordType, recordId, decision, facility) {
    const reason = decision === 'REJECT' ? window.prompt('Enter the reason for rejecting this financial record:') : undefined;
    if (decision === 'REJECT' && !reason?.trim()) return;
    await send('/api/finance/reviews', 'PATCH', { recordType, recordId, decision, reason, facilityId: facility || undefined }, 'Financial review recorded.');
  }

  async function reviewRefund(id, decision, facility) {
    const reason = decision === 'REJECT' ? window.prompt('Enter the reason for rejecting this refund:') : undefined;
    if (decision === 'REJECT' && !reason?.trim()) return;
    await send(`/api/finance/refunds/${encodeURIComponent(id)}`, 'PATCH', { decision, reason, facilityId: facility || undefined }, 'Refund request reviewed.');
  }

  async function completeRefund(id, facility) {
    const providerRefundReference = window.prompt('Enter verified provider refund reference (e.g. M-PESA transaction ref):');
    if (!providerRefundReference?.trim()) return;
    const providerConfirmation = window.prompt('Enter provider confirmation details and bank/settlement note:');
    if (!providerConfirmation?.trim()) return;
    await send(`/api/finance/refunds/${encodeURIComponent(id)}`, 'PATCH', {
      action: 'COMPLETE',
      providerRefundReference: providerRefundReference.trim(),
      providerConfirmation: providerConfirmation.trim(),
      facilityId: facility || undefined,
    }, 'Refund marked completed with verified provider confirmation.');
  }

  async function manualReconcile(paymentId, statementLineId) {
    await send('/api/finance/reconciliation', 'PATCH', { paymentId, statementLineId, facilityId: facilityId || undefined }, 'Payment manually reconciled with statement line.');
  }

  async function importStatement(event) {
    await submit(event, '/api/finance/reconciliation', (values) => {
      let lines;
      try { lines = JSON.parse(values.lines); }
      catch { throw new Error('Statement lines must be valid JSON.'); }
      if (!Array.isArray(lines)) throw new Error('Statement lines must be a JSON array.');
      return { statementReference: values.statementReference, verificationNote: values.verificationNote, verified: values.verified === 'on', facilityId: values.facilityId || undefined, provider: 'M-PESA', lines };
    });
  }

  const transactions = (report?.transactions || []).filter((row) => {
    const matchesText = `${row.paymentRef} ${row.providerReference || ''} ${row.eventTitle} ${row.facilityName}`.toLowerCase().includes(search.toLowerCase());
    return matchesText && (status === 'ALL' || row.status === status);
  });

  const stats = report ? [
    { label: 'Gross ticket revenue', value: money(report.totals.grossTicketRevenue), icon: CreditCard },
    { label: 'Refunds recorded', value: money(report.totals.refunds), icon: Wallet },
    { label: 'Net revenue', value: money(report.totals.netRevenue), icon: ShieldCheck },
    { label: 'Unreconciled payments', value: report.totals.unreconciledSuccessfulPayments, icon: Clock3 },
    { label: 'Unmatched statement lines', value: report.totals.unmatchedStatementLines, icon: XCircle },
  ] : [];

  const facilityFor = (record) => record.facilityId || facilityId || undefined;

  return (
    <div className="space-y-6">
      <header className={`${panel} flex flex-wrap items-start justify-between gap-4`}>
        <div>
          <span className="mb-2 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">{report?.dataMode || 'DATABASE'} · {report?.facilityId || 'Authorized facility scope'}</span>
          <h1 className="text-2xl font-bold text-white">Financial Management & Revenue Reconciliation</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">Enterprise financial management, M-PESA payment reconciliation, category breakdowns, maker-checker financial controls, and verified provider refund confirmation.</p>
        </div>
        <div className="flex gap-2">
          <a className={quietAction} href={`/api/finance/reports${query ? `?${query}&format=csv` : '?format=csv'}`}><Download className="mr-2 inline h-4 w-4" />Download CSV</a>
          <button className={quietAction} disabled={busy} onClick={load}><RefreshCw className={`mr-2 inline h-4 w-4 ${busy ? 'animate-spin' : ''}`} />Refresh</button>
        </div>
      </header>

      {message && <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{message}</div>}
      <section className={`${panel} grid gap-3 md:grid-cols-4`}>
        <input className={field} value={facilityId} onChange={(event) => setFacilityId(event.target.value)} placeholder="Facility ID (blank for enterprise admin)" aria-label="Facility ID" />
        <input className={field} type="date" value={range.from} onChange={(event) => setRange({ ...range, from: event.target.value })} aria-label="Start date" />
        <input className={field} type="date" value={range.to} onChange={(event) => setRange({ ...range, to: event.target.value })} aria-label="End date" />
        <button className={action} onClick={load} disabled={busy}>Apply report scope</button>
      </section>

      {!report && !busy && <div className={panel}>Financial data could not be loaded. Confirm finance permissions, facility membership, and the database migration.</div>}
      {report && <>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(({ label, value, icon: Icon }) => <article key={label} className={panel}><div className="flex items-center justify-between text-xs text-slate-400"><span>{label}</span><Icon className="h-4 w-4 text-emerald-400" /></div><div className="mt-3 text-xl font-bold text-white">{value}</div></article>)}
        </section>

        <RevenueTrendChart
          title="Daily Financial & M-PESA Revenue Trend (LAST 30 DAYS)"
          subtitle="Daily revenue aggregated directly from closed sales transactions"
          totalAmount={report.totals.grossTicketRevenue}
          currency="KSh"
          accentColor="emerald"
        />

        <section className="grid gap-4 lg:grid-cols-4">
          <article className={panel}><h2 className="font-semibold text-white">Payment state summary</h2><div className="mt-3 grid grid-cols-2 gap-2 text-sm">{Object.entries(report.paymentStatusCounts).map(([key, value]) => <div key={key} className="rounded-lg bg-navy-950 p-3"><div className="text-xs text-slate-400">{key.replaceAll('_', ' ')}</div><div className="mt-1 font-bold">{value}</div></div>)}</div></article>
          <article className={panel}><h2 className="font-semibold text-white">Revenue by event</h2><div className="mt-3 max-h-52 space-y-2 overflow-auto">{report.byEvent.map((row) => <div key={row.eventId} className="flex justify-between gap-3 border-b border-navy-800 pb-2 text-sm"><span>{row.eventTitle}</span><strong>{money(row.amount)}</strong></div>)}{!report.byEvent.length && <p className="text-sm text-slate-500">No verified payment or approved revenue records for this scope.</p>}</div></article>
          <article className={panel}><h2 className="font-semibold text-white">Revenue by facility</h2><div className="mt-3 max-h-52 space-y-2 overflow-auto">{report.byFacility.map((row) => <div key={row.facilityId} className="flex justify-between gap-3 border-b border-navy-800 pb-2 text-sm"><span>{row.facilityName}</span><strong>{money(row.amount)}</strong></div>)}{!report.byFacility.length && <p className="text-sm text-slate-500">No records in scope.</p>}</div></article>
          <article className={panel}><h2 className="font-semibold text-white">Revenue by category</h2><div className="mt-3 max-h-52 space-y-2 overflow-auto">{(report.byCategory || []).map((row) => <div key={row.category} className="flex justify-between gap-3 border-b border-navy-800 pb-2 text-sm"><span>{row.category}</span><strong>{money(row.amount)}</strong></div>)}{!(report.byCategory || []).length && <p className="text-sm text-slate-500">No category breakdown data.</p>}</div></article>
        </section>

        <section className={`${panel} space-y-3`}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold text-white">Payment transactions</h2><p className="text-xs text-slate-400">Phone numbers and payment credentials are never stored or displayed. Fee detail: {report.transactionFeesAvailable ? 'available' : 'unavailable from current provider data'}.</p></div><div className="flex gap-2"><input className={`${field} w-56`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search refs, event, facility" /><select className={`${field} w-40`} value={status} onChange={(event) => setStatus(event.target.value)}><option value="ALL">All statuses</option>{Object.keys(report.paymentStatusCounts).map((value) => <option key={value}>{value}</option>)}</select></div></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead className="text-[10px] uppercase text-slate-500"><tr><th className="p-3">Payment</th><th className="p-3">Event / Facility</th><th className="p-3">Provider reference</th><th className="p-3">Method</th><th className="p-3">Amount</th><th className="p-3">Status</th><th className="p-3">Reconciliation</th></tr></thead><tbody>{transactions.map((row) => <tr key={row.id} className="border-t border-navy-800"><td className="p-3 font-mono">{row.paymentRef}</td><td className="p-3">{row.eventTitle}<div className="text-slate-500">{row.facilityName}</div></td><td className="p-3 font-mono">{row.providerReference || '—'}</td><td className="p-3">{row.paymentMethod}</td><td className="p-3">{money(row.amount)}</td><td className="p-3">{row.status}</td><td className="p-3">{row.reconciled ? 'Matched' : row.status === 'SUCCESSFUL' ? 'Outstanding' : '—'}</td></tr>)}{!transactions.length && <tr><td className="p-5 text-center text-slate-500" colSpan={7}>No payment records match this filter.</td></tr>}</tbody></table></div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className={panel}><h2 className="font-semibold text-white">Unreconciled successful payments</h2><div className="mt-3 max-h-56 space-y-2 overflow-auto">{report.unreconciledPayments.map((item) => <div key={item.id} className="flex justify-between gap-2 border-b border-navy-800 pb-2 text-xs"><span>{item.paymentRef} · {item.mpesaReceipt || 'No provider receipt'} · {item.provider}</span><strong>{money(item.amount)}</strong></div>)}{!report.unreconciledPayments.length && <p className="text-sm text-slate-500">No successful payments currently outstanding.</p>}</div></article>
          <article className={panel}><h2 className="font-semibold text-white">Unmatched provider statement entries</h2><div className="mt-3 max-h-56 space-y-2 overflow-auto">{report.unmatchedStatementLines.map((item) => <div key={item.id} className="border-b border-navy-800 pb-2 text-xs"><strong>{item.providerReference}</strong> · {item.matchStatus} ({item.matchReason})<div className="text-slate-500">{item.batch.statementReference} · {money(item.amount)}</div></div>)}{!report.unmatchedStatementLines.length && <p className="text-sm text-slate-500">No unmatched provider statement entries.</p>}</div></article>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <article className={panel}><div className="flex items-center gap-2"><FileUp className="h-5 w-5 text-emerald-400" /><h2 className="font-semibold text-white">Import verified provider statement</h2></div><p className="mt-1 text-xs text-amber-300">Finance attests that the source statement was independently obtained and reviewed. Imports are not independently authenticated against Daraja by this application.</p>
            <form className="mt-4 space-y-3" onSubmit={importStatement}><input className={field} name="statementReference" placeholder="Provider statement reference" required /><input className={field} name="facilityId" placeholder="Facility ID (required for facility finance users)" /><textarea className={field} name="verificationNote" placeholder="Source, statement period, and verification notes" required /><textarea className={`${field} min-h-32 font-mono text-xs`} name="lines" placeholder={'[{"providerReference":"M-PESA-RECEIPT","amount":2500,"currency":"KES","status":"SUCCESSFUL","transactionAt":"2026-10-31T08:00:00Z"}]'} required /><label className="flex items-start gap-2 text-xs text-slate-300"><input type="checkbox" name="verified" required className="mt-0.5" />I confirm I reviewed the provider statement and these entries; this is a finance attestation, not provider authentication by the app.</label><button className={action} disabled={busy}>Import and match statement</button></form>
          </article>
          <article className={panel}><h2 className="font-semibold text-white">Recent statement batches</h2><div className="mt-3 space-y-2">{report.batches.map((batch) => <div key={batch.id} className="flex flex-wrap justify-between gap-2 border-b border-navy-800 pb-2 text-sm"><span>{batch.statementReference}<div className="text-xs text-slate-500">{batch.provider} · {batch.lineCount} lines · finance-attested</div></span><strong>{batch.matchedCount} matched / {batch.unmatchedCount} unmatched</strong></div>)}{!report.batches.length && <p className="text-sm text-slate-500">No statements imported.</p>}</div></article>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <article className={panel}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Other revenue entry</h2>
              <button className={quietAction} type="button" onClick={() => setShowCategoryForm(!showCategoryForm)}><PlusCircle className="mr-1 inline h-3.5 w-3.5" />Category</button>
            </div>
            {showCategoryForm && (
              <form className="my-3 space-y-2 rounded-lg border border-navy-700 bg-navy-950 p-3" onSubmit={(e) => submit(e, '/api/finance/categories', (v) => v)}>
                <p className="text-xs font-semibold text-emerald-400">New Configurable Category</p>
                <input className={field} name="categoryKey" placeholder="Category key (e.g. VIP_HOSPITALITY)" required />
                <input className={field} name="label" placeholder="Display Label (e.g. VIP Hospitality)" required />
                <input className={field} name="description" placeholder="Description" />
                <button className={action} disabled={busy}>Create category</button>
              </form>
            )}
            <p className="mt-1 text-xs text-slate-400">Requires a second finance approver before inclusion in net revenue.</p>
            <form className="mt-3 space-y-2" onSubmit={(event) => submit(event, '/api/finance/revenue', (values) => ({ ...values, amount: Number(values.amount), facilityId: values.facilityId || undefined, eventId: values.eventId || undefined, sourceReference: values.sourceReference || undefined }))}><input className={field} name="facilityId" placeholder="Facility ID" required /><input className={field} name="eventId" placeholder="Event ID (optional)" /><select className={field} name="categoryId" required><option value="">Revenue category</option>{report.revenueCategories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><input className={field} name="amount" type="number" min="0.01" step="0.01" placeholder="Amount KES" required /><select className={field} name="paymentMethod">{['CASH', 'M-PESA', 'CARD', 'BANK_TRANSFER', 'OTHER'].map((item) => <option key={item}>{item}</option>)}</select><input className={field} name="sourceReference" placeholder="Source reference (optional, unique)" /><input className={field} name="description" placeholder="Description" required /><input className={field} name="occurredAt" type="datetime-local" /><button className={action} disabled={busy}>Submit for approval</button></form>
          </article>
          <article className={panel}><h2 className="font-semibold text-white">Financial adjustment</h2><p className="mt-1 text-xs text-slate-400">Positive or negative adjustment; maker and approver must differ.</p><form className="mt-3 space-y-2" onSubmit={(event) => submit(event, '/api/finance/adjustments', (values) => ({ ...values, amount: Number(values.amount), facilityId: values.facilityId || undefined, eventId: values.eventId || undefined }))}><input className={field} name="facilityId" placeholder="Facility ID" required /><input className={field} name="eventId" placeholder="Event ID (optional)" /><input className={field} name="amount" type="number" step="0.01" placeholder="Signed adjustment amount" required /><textarea className={field} name="reason" placeholder="Reason and supporting reference" required /><button className={action} disabled={busy}>Submit adjustment</button></form></article>
          <article className={panel}><h2 className="font-semibold text-white">Refund request</h2><p className="mt-1 text-xs text-amber-300">Approval registers intention. Refunds are never marked completed without verified provider confirmation.</p><form className="mt-3 space-y-2" onSubmit={(event) => submit(event, '/api/finance/refunds', (values) => ({ ...values, amount: Number(values.amount), facilityId: values.facilityId || undefined }))}><input className={field} name="facilityId" placeholder="Facility ID (optional for enterprise admin)" /><input className={field} name="paymentId" placeholder="Successful payment ID" required /><input className={field} name="amount" type="number" min="0.01" step="0.01" placeholder="Refund amount KES" required /><textarea className={field} name="reason" placeholder="Refund reason" required /><button className={action} disabled={busy}>Create refund request</button></form></article>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <Queue title="Revenue pending approval" rows={report.revenueQueue} label={(row) => `${row.reference} · ${row.category?.label || 'Revenue'} · ${money(row.amount)}`} onApprove={(row) => review('REVENUE', row.id, 'APPROVE', facilityFor(row))} onReject={(row) => review('REVENUE', row.id, 'REJECT', facilityFor(row))} />
          <Queue title="Adjustments pending approval" rows={report.adjustmentQueue} label={(row) => `${row.reference} · ${money(row.amount)} · ${row.reason}`} onApprove={(row) => review('ADJUSTMENT', row.id, 'APPROVE', facilityFor(row))} onReject={(row) => review('ADJUSTMENT', row.id, 'REJECT', facilityFor(row))} />
          <article className={panel}><h2 className="font-semibold text-white">Refund workflow</h2><div className="mt-3 max-h-72 space-y-3 overflow-auto">{report.refundRequests.map((item) => <div key={item.id} className="border-b border-navy-800 pb-3 text-xs"><strong>{item.reference}</strong> · <span className={item.status === 'COMPLETED' ? 'text-emerald-400 font-bold' : item.status === 'APPROVED' ? 'text-amber-300' : ''}>{item.status}</span><div>{item.payment.paymentRef} · {money(item.amount)} · {item.reason}</div>{item.status === 'REQUESTED' && <div className="mt-2 flex gap-2"><button className={quietAction} disabled={busy} onClick={() => reviewRefund(item.id, 'APPROVE', facilityId || undefined)}>Approve for provider</button><button className={quietAction} disabled={busy} onClick={() => reviewRefund(item.id, 'REJECT', facilityId || undefined)}>Reject</button></div>}{item.status === 'APPROVED' && <div className="mt-2 space-y-1"><p className="text-amber-300">Approved; awaiting provider settlement confirmation.</p><button className="rounded-md bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30" disabled={busy} onClick={() => completeRefund(item.id, facilityId || undefined)}>Record Verified Provider Refund</button></div>}{item.status === 'COMPLETED' && item.providerRefundReference && <p className="mt-1 font-mono text-[11px] text-emerald-400">Provider Ref: {item.providerRefundReference}</p>}</div>)}{!report.refundRequests.length && <p className="text-sm text-slate-500">No refund requests.</p>}</div></article>
        </section>

        {report.reportLimit && <p className="text-xs text-amber-300">{report.reportLimit}</p>}
        <footer className="text-xs text-slate-500">Generated {new Date(report.generatedAt).toLocaleString()} · Transaction fee data: {report.transactionFeesAvailable ? 'available' : 'not supplied by current integrations'} · {report.isSimulated ? 'SIMULATED' : 'Stored database data; external statement verification is finance-attested'}.</footer>
      </>}
    </div>
  );
}

function Queue({ title, rows, label, onApprove, onReject }) {
  return <article className="rounded-2xl border border-navy-800 bg-navy-900 p-5"><h2 className="font-semibold text-white">{title}</h2><div className="mt-3 max-h-72 space-y-3 overflow-auto">{rows.map((row) => <div key={row.id} className="border-b border-navy-800 pb-3 text-xs"><p>{label(row)}</p><p className="mt-1 text-slate-500">{row.reason || row.description}</p><div className="mt-2 flex gap-2"><button className="rounded-md bg-emerald-500/15 px-3 py-1.5 text-emerald-300" onClick={() => onApprove(row)}>Approve</button><button className="rounded-md bg-red-500/10 px-3 py-1.5 text-red-300" onClick={() => onReject(row)}>Reject</button></div></div>)}{!rows.length && <p className="text-sm text-slate-500">No pending records.</p>}</div></article>;
}
