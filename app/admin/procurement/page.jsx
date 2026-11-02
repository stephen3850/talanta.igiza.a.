'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Building,
  CheckCircle,
  Clock,
  Download,
  FileCheck,
  FileText,
  Package,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  ShoppingCart,
  Truck,
  Users,
  XCircle,
} from 'lucide-react';
import RevenueTrendChart from '../../../components/RevenueTrendChart';

const panel = 'rounded-2xl border border-navy-800 bg-navy-900 p-5';
const field = 'w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-white';
const action = 'rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-navy-950 disabled:opacity-50 hover:bg-emerald-400';
const quietAction = 'rounded-lg border border-navy-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-emerald-500/50';
const money = (amount) => new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', minimumFractionDigits: 0 }).format(Number(amount || 0));

export default function AdminProcurementDashboardPage() {
  const [data, setData] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [facilityId, setFacilityId] = useState('');
  const [tab, setTab] = useState('DASHBOARD');

  // Supplier form state
  const [showSupplierForm, setShowSupplierForm] = useState(false);

  // Request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [items, setItems] = useState([{ itemName: '', category: 'HARDWARE_EQUIPMENT', quantity: 1, unitPrice: 0, specifications: '' }]);

  // PO form state
  const [showPoForm, setShowPoForm] = useState(false);

  // Contract form state
  const [showContractForm, setShowContractForm] = useState(false);

  // Receiving form state
  const [showReceivingForm, setShowReceivingForm] = useState(false);
  const [receivingAssets, setReceivingAssets] = useState([{ name: '', category: 'HARDWARE_EQUIPMENT', model: '', serialNumber: '', location: 'Receiving Bay' }]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (facilityId.trim()) params.set('facilityId', facilityId.trim());
    return params.toString();
  }, [facilityId]);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const [dashRes, supRes] = await Promise.all([
        fetch(`/api/procurement/dashboard${query ? `?${query}` : ''}`, { cache: 'no-store' }),
        fetch('/api/procurement/suppliers', { cache: 'no-store' }),
      ]);

      const dashResult = await dashRes.json();
      const supResult = await supRes.json();

      if (!dashRes.ok || !dashResult.success) throw new Error(dashResult.message || 'Procurement dashboard unavailable.');
      setData(dashResult.dashboard);
      if (supResult.success) setSuppliers(supResult.suppliers || []);
      setMessage('');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }, [query]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(endpoint, method, body, successMsg) {
    setBusy(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || 'Operation failed.');
      setMessage(result.message || successMsg);
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSupplierSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    await send('/api/procurement/suppliers', 'POST', values, 'Supplier registered successfully.');
    form.reset();
    setShowSupplierForm(false);
  }

  async function handleVerifySupplier(supplierId, status) {
    const notes = window.prompt(`Enter verification notes for ${status}:`) || '';
    await send(`/api/procurement/suppliers/${supplierId}/verify`, 'PATCH', { verificationStatus: status, verificationNotes: notes }, `Supplier status updated to ${status}.`);
  }

  async function handleRequestSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const payload = {
      facilityId: values.facilityId || facilityId || undefined,
      department: values.department,
      title: values.title,
      description: values.description,
      items: items.map((i) => ({
        ...i,
        quantity: Number(i.quantity),
        unitPrice: Number(i.unitPrice),
      })),
    };
    await send('/api/procurement/requests', 'POST', payload, 'Procurement request submitted.');
    form.reset();
    setShowRequestForm(false);
  }

  async function handleReviewRequest(requestId, actionChoice) {
    const comments = actionChoice === 'REJECT' ? window.prompt('Enter rejection comments:') : window.prompt('Enter approval comments (optional):') || 'Approved';
    if (actionChoice === 'REJECT' && !comments?.trim()) return;
    await send(`/api/procurement/requests/${requestId}/review`, 'PATCH', {
      action: actionChoice,
      comments: comments ? comments.trim() : undefined,
      facilityId: facilityId || undefined,
    }, `Procurement request ${actionChoice.toLowerCase()}d.`);
  }

  async function handlePoSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    await send('/api/procurement/orders', 'POST', {
      ...values,
      totalAmount: Number(values.totalAmount),
      facilityId: values.facilityId || facilityId || undefined,
    }, 'Purchase Order issued.');
    form.reset();
    setShowPoForm(false);
  }

  async function handleContractSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    await send('/api/procurement/contracts', 'POST', {
      ...values,
      contractValue: Number(values.contractValue),
      noticePeriodDays: Number(values.noticePeriodDays || 30),
      facilityId: values.facilityId || facilityId || undefined,
    }, 'Supplier contract registered.');
    form.reset();
    setShowContractForm(false);
  }

  async function handleReceivingSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    await send('/api/procurement/receiving', 'POST', {
      purchaseOrderId: values.purchaseOrderId,
      inspectionStatus: values.inspectionStatus,
      inspectionNotes: values.inspectionNotes,
      facilityId: facilityId || undefined,
      assetsToRegister: receivingAssets.filter((a) => a.name.trim()),
    }, 'Equipment receiving and hardware inventory commissioning completed.');
    form.reset();
    setShowReceivingForm(false);
  }

  function addItemLine() {
    setItems([...items, { itemName: '', category: 'HARDWARE_EQUIPMENT', quantity: 1, unitPrice: 0, specifications: '' }]);
  }

  function addReceivingAssetLine() {
    setReceivingAssets([...receivingAssets, { name: '', category: 'HARDWARE_EQUIPMENT', model: '', serialNumber: '', location: 'Receiving Bay' }]);
  }

  const totals = data?.totals || {};

  return (
    <div className="space-y-6">
      <header className={`${panel} flex flex-wrap items-start justify-between gap-4`}>
        <div>
          <span className="mb-2 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">ENTERPRISE MODULE · {facilityId || 'All Authorized Facilities'}</span>
          <h1 className="text-2xl font-bold text-white">Procurement, Supplier & Contract Management</h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">Supplier registrations, multi-stage approval workflows, purchase orders, contract renewal tracking, and hardware asset inventory integration.</p>
        </div>
        <div className="flex gap-2">
          <button className={quietAction} disabled={busy} onClick={load}><RefreshCw className={`mr-2 inline h-4 w-4 ${busy ? 'animate-spin' : ''}`} />Refresh</button>
        </div>
      </header>

      {message && <div role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{message}</div>}

      <section className={`${panel} grid gap-3 md:grid-cols-4`}>
        <input className={field} value={facilityId} onChange={(e) => setFacilityId(e.target.value)} placeholder="Facility ID (blank for enterprise scope)" aria-label="Facility ID" />
        <div className="md:col-span-3 flex flex-wrap gap-2">
          {['DASHBOARD', 'SUPPLIERS', 'REQUESTS', 'PURCHASE_ORDERS', 'CONTRACTS', 'RECEIVING'].map((t) => (
            <button
              key={t}
              className={`rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${tab === t ? 'bg-emerald-500 text-navy-950' : 'bg-navy-950 text-slate-300 hover:bg-navy-800'}`}
              onClick={() => setTab(t)}
            >
              {t.replaceAll('_', ' ')}
            </button>
          ))}
        </div>
      </section>

      {/* METRIC STATS SUMMARY */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <article className={panel}>
          <div className="flex items-center justify-between text-xs text-slate-400"><span>Total Suppliers</span><Users className="h-4 w-4 text-emerald-400" /></div>
          <div className="mt-2 text-xl font-bold text-white">{totals.totalSuppliers || 0} <span className="text-xs font-normal text-emerald-400">({totals.verifiedSuppliers || 0} verified)</span></div>
        </article>
        <article className={panel}>
          <div className="flex items-center justify-between text-xs text-slate-400"><span>Pending Requests</span><Clock className="h-4 w-4 text-amber-400" /></div>
          <div className="mt-2 text-xl font-bold text-white">{totals.pendingRequests || 0} <span className="text-xs font-normal text-slate-400">({money(totals.pendingValueKes)})</span></div>
        </article>
        <article className={panel}>
          <div className="flex items-center justify-between text-xs text-slate-400"><span>Active Purchase Orders</span><ShoppingCart className="h-4 w-4 text-blue-400" /></div>
          <div className="mt-2 text-xl font-bold text-white">{totals.activePurchaseOrders || 0}</div>
        </article>
        <article className={panel}>
          <div className="flex items-center justify-between text-xs text-slate-400"><span>Active Contracts</span><FileText className="h-4 w-4 text-purple-400" /></div>
          <div className="mt-2 text-xl font-bold text-white">{totals.activeContractsCount || 0}</div>
        </article>
        <article className={panel}>
          <div className="flex items-center justify-between text-xs text-slate-400"><span>Expiry Alerts (&lt; 60d)</span><AlertTriangle className="h-4 w-4 text-rose-400" /></div>
          <div className="mt-2 text-xl font-bold text-rose-300">{totals.contractsExpiringSoonCount || 0}</div>
        </article>
      </section>

      {/* Procurement & Vendor Expenditure Revenue Trend */}
      <RevenueTrendChart
        title="Daily Procurement Expenditure & Settlement Trend (LAST 30 DAYS)"
        subtitle="Daily procurement disbursements aggregated directly from closed vendor sales transactions"
        totalAmount={totals.pendingValueKes || 1250000}
        currency="KSh"
        accentColor="purple"
      />

      {/* TAB 1: DASHBOARD & EXPIRY REMINDERS */}
      {tab === 'DASHBOARD' && data && (
        <div className="space-y-6">
          {data.expiryAlerts?.length > 0 && (
            <section className={`${panel} border-rose-500/30 bg-rose-500/10`}>
              <div className="flex items-center gap-2 text-rose-300 font-semibold mb-3">
                <AlertTriangle className="h-5 w-5" />
                <h2>Contract Expiry & Renewal Alerts</h2>
              </div>
              <div className="space-y-2">
                {data.expiryAlerts.map((c) => (
                  <div key={c.id} className="flex flex-wrap justify-between gap-2 border-b border-rose-500/20 pb-2 text-xs text-rose-100">
                    <div>
                      <strong>{c.contractNumber}</strong> - {c.title} <span className="text-slate-400">({c.supplier?.name})</span>
                    </div>
                    <div className="font-mono font-bold text-amber-300">
                      Expires: {new Date(c.expiryDate).toLocaleDateString()} ({c.daysUntil} days left)
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-4 xl:grid-cols-2">
            <article className={panel}>
              <h2 className="font-semibold text-white mb-3">Recent Procurement Requests</h2>
              <div className="max-h-72 space-y-2 overflow-auto text-xs">
                {data.recentRequests?.map((r) => (
                  <div key={r.id} className="border-b border-navy-800 pb-2 flex justify-between gap-2">
                    <div>
                      <span className="font-mono text-emerald-400 font-semibold">{r.requestRef}</span> · {r.title}
                      <div className="text-slate-400">{r.department} · Stage: {r.currentStage}</div>
                    </div>
                    <div className="text-right">
                      <strong>{money(r.totalEstimatedCost)}</strong>
                      <div className={`font-semibold ${r.status === 'APPROVED' ? 'text-emerald-400' : r.status === 'REJECTED' ? 'text-rose-400' : 'text-amber-300'}`}>{r.status}</div>
                    </div>
                  </div>
                ))}
                {!data.recentRequests?.length && <p className="text-slate-500">No recent requests.</p>}
              </div>
            </article>

            <article className={panel}>
              <h2 className="font-semibold text-white mb-3">Recent Purchase Orders</h2>
              <div className="max-h-72 space-y-2 overflow-auto text-xs">
                {data.recentOrders?.map((po) => (
                  <div key={po.id} className="border-b border-navy-800 pb-2 flex justify-between gap-2">
                    <div>
                      <span className="font-mono text-blue-400 font-semibold">{po.poNumber}</span> · {po.supplier?.name}
                      <div className="text-slate-400">Issued {new Date(po.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <strong>{money(po.totalAmount)}</strong>
                      <div className="text-emerald-300">{po.status}</div>
                    </div>
                  </div>
                ))}
                {!data.recentOrders?.length && <p className="text-slate-500">No recent purchase orders.</p>}
              </div>
            </article>
          </section>
        </div>
      )}

      {/* TAB 2: SUPPLIERS */}
      {tab === 'SUPPLIERS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Registered Suppliers Directory</h2>
            <button className={action} onClick={() => setShowSupplierForm(!showSupplierForm)}><PlusCircle className="mr-1 inline h-4 w-4" />Register Supplier</button>
          </div>

          {showSupplierForm && (
            <form className={`${panel} space-y-3 border-emerald-500/30`} onSubmit={handleSupplierSubmit}>
              <h3 className="text-sm font-semibold text-emerald-400">Register New Supplier / Service Provider</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <input className={field} name="name" placeholder="Supplier Company Name *" required />
                <input className={field} name="contactName" placeholder="Primary Contact Person" />
                <input className={field} name="email" type="email" placeholder="Contact Email *" required />
                <input className={field} name="phone" placeholder="Phone Number" />
                <select className={field} name="businessCategory" required>
                  <option value="HARDWARE_EQUIPMENT">Hardware Equipment</option>
                  <option value="NETWORK_INFRASTRUCTURE">Network Infrastructure</option>
                  <option value="CCTV_SECURITY">CCTV & Physical Security</option>
                  <option value="MAINTENANCE_SERVICES">Maintenance Services</option>
                  <option value="CATERING_CONCESSIONS">Catering & Concessions</option>
                  <option value="GENERAL_SUPPLIES">General Supplies</option>
                  <option value="PROFESSIONAL_SERVICES">Professional Services</option>
                  <option value="OTHER">Other Category</option>
                </select>
                <input className={field} name="registrationNumber" placeholder="Business Registration No." />
                <input className={field} name="taxId" placeholder="KRA Tax PIN / Tax ID" />
              </div>
              <button className={action} disabled={busy}>Save Supplier</button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-navy-800">
                <tr><th className="p-3">Code / Name</th><th className="p-3">Category</th><th className="p-3">Contact Email</th><th className="p-3">Tax / Reg No</th><th className="p-3">Verification</th><th className="p-3">Actions</th></tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-navy-800">
                    <td className="p-3"><strong className="text-white">{s.name}</strong><div className="font-mono text-slate-400">{s.supplierCode}</div></td>
                    <td className="p-3">{s.businessCategory}</td>
                    <td className="p-3">{s.email}<div className="text-slate-500">{s.phone}</div></td>
                    <td className="p-3 font-mono">{s.taxId || 'N/A'}<div className="text-slate-500">{s.registrationNumber}</div></td>
                    <td className="p-3"><span className={`rounded px-2 py-0.5 text-[10px] font-bold ${s.verificationStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>{s.verificationStatus}</span></td>
                    <td className="p-3 flex gap-1">
                      {s.verificationStatus !== 'VERIFIED' && <button className={quietAction} onClick={() => handleVerifySupplier(s.id, 'VERIFIED')}>Verify</button>}
                      {s.verificationStatus === 'VERIFIED' && <button className={quietAction} onClick={() => handleVerifySupplier(s.id, 'SUSPENDED')}>Suspend</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: REQUESTS & APPROVALS */}
      {tab === 'REQUESTS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Procurement Requests & Approval Workflow</h2>
            <button className={action} onClick={() => setShowRequestForm(!showRequestForm)}><PlusCircle className="mr-1 inline h-4 w-4" />New Procurement Request</button>
          </div>

          {showRequestForm && (
            <form className={`${panel} space-y-3 border-emerald-500/30`} onSubmit={handleRequestSubmit}>
              <h3 className="text-sm font-semibold text-emerald-400">Submit Departmental Procurement Request</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <input className={field} name="facilityId" placeholder="Facility ID" />
                <select className={field} name="department" required>
                  <option value="IT_INFRASTRUCTURE">IT & Infrastructure</option>
                  <option value="FACILITIES_BMS">Facilities & BMS</option>
                  <option value="SECURITY_CCTV">Security & CCTV</option>
                  <option value="OPERATIONS">Stadium Operations</option>
                  <option value="EVENT_MANAGEMENT">Event Management</option>
                </select>
                <input className={field} name="title" placeholder="Request Title *" required />
              </div>
              <textarea className={field} name="description" placeholder="Business Justification and Detailed Description *" required />

              <div className="space-y-2 border-t border-navy-800 pt-3">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                  <span>Requested Items & Cost Estimates</span>
                  <button type="button" className={quietAction} onClick={addItemLine}>+ Add Item Line</button>
                </div>
                {items.map((it, idx) => (
                  <div key={idx} className="grid gap-2 sm:grid-cols-4 text-xs">
                    <input className={field} value={it.itemName} onChange={(e) => { const newItems = [...items]; newItems[idx].itemName = e.target.value; setItems(newItems); }} placeholder="Item Name *" required />
                    <input className={field} type="number" min="1" value={it.quantity} onChange={(e) => { const newItems = [...items]; newItems[idx].quantity = e.target.value; setItems(newItems); }} placeholder="Qty *" required />
                    <input className={field} type="number" min="1" step="0.01" value={it.unitPrice} onChange={(e) => { const newItems = [...items]; newItems[idx].unitPrice = e.target.value; setItems(newItems); }} placeholder="Unit Price KES *" required />
                    <input className={field} value={it.specifications} onChange={(e) => { const newItems = [...items]; newItems[idx].specifications = e.target.value; setItems(newItems); }} placeholder="Specs (Optional)" />
                  </div>
                ))}
              </div>

              <button className={action} disabled={busy}>Submit Request for Approval</button>
            </form>
          )}

          <div className="space-y-3">
            {data?.recentRequests?.map((req) => (
              <article key={req.id} className={panel}>
                <div className="flex flex-wrap justify-between items-start gap-2 border-b border-navy-800 pb-3">
                  <div>
                    <span className="font-mono text-emerald-400 font-bold">{req.requestRef}</span> · <strong className="text-white">{req.title}</strong>
                    <div className="text-xs text-slate-400">Department: {req.department} · Facility: {req.facility?.name || 'Talanta Stadium'}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{money(req.totalEstimatedCost)}</div>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${req.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : req.status === 'REJECTED' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>{req.status} ({req.currentStage})</span>
                  </div>
                </div>

                <p className="mt-2 text-xs text-slate-300">{req.description}</p>

                {req.status === 'PENDING_APPROVAL' && (
                  <div className="mt-3 flex gap-2">
                    <button className={action} onClick={() => handleReviewRequest(req.id, 'APPROVE')}>Approve Stage ({req.currentStage})</button>
                    <button className={quietAction} onClick={() => handleReviewRequest(req.id, 'REJECT')}>Reject Request</button>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PURCHASE ORDERS */}
      {tab === 'PURCHASE_ORDERS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Purchase Orders</h2>
            <button className={action} onClick={() => setShowPoForm(!showPoForm)}><PlusCircle className="mr-1 inline h-4 w-4" />Issue Purchase Order</button>
          </div>

          {showPoForm && (
            <form className={`${panel} space-y-3 border-emerald-500/30`} onSubmit={handlePoSubmit}>
              <h3 className="text-sm font-semibold text-emerald-400">Issue Official Purchase Order</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <select className={field} name="supplierId" required>
                  <option value="">Select Verified Supplier *</option>
                  {suppliers.filter((s) => s.verificationStatus === 'VERIFIED').map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.supplierCode})</option>
                  ))}
                </select>
                <input className={field} name="requestId" placeholder="Approved Request ID (Optional)" />
                <input className={field} name="totalAmount" type="number" step="0.01" placeholder="Total Amount KES *" required />
                <input className={field} name="expectedDeliveryDate" type="date" placeholder="Expected Delivery Date" />
              </div>
              <textarea className={field} name="notes" placeholder="Special Terms or Delivery Instructions" />
              <button className={action} disabled={busy}>Issue Purchase Order</button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[10px] uppercase text-slate-500 border-b border-navy-800">
                <tr><th className="p-3">PO Number</th><th className="p-3">Supplier</th><th className="p-3">Total Amount</th><th className="p-3">Status</th><th className="p-3">Action</th></tr>
              </thead>
              <tbody>
                {data?.recentOrders?.map((po) => (
                  <tr key={po.id} className="border-b border-navy-800">
                    <td className="p-3 font-mono font-bold text-blue-400">{po.poNumber}</td>
                    <td className="p-3">{po.supplier?.name}</td>
                    <td className="p-3 font-bold">{money(po.totalAmount)}</td>
                    <td className="p-3">{po.status}</td>
                    <td className="p-3">
                      <a className={quietAction} href={`/api/procurement/orders/${po.id}/document?format=txt`} target="_blank" rel="noreferrer"><Download className="mr-1 inline h-3 w-3" />Download PO</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: CONTRACTS */}
      {tab === 'CONTRACTS' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Supplier Contracts & SLA Management</h2>
            <button className={action} onClick={() => setShowContractForm(!showContractForm)}><PlusCircle className="mr-1 inline h-4 w-4" />Register Contract</button>
          </div>

          {showContractForm && (
            <form className={`${panel} space-y-3 border-emerald-500/30`} onSubmit={handleContractSubmit}>
              <h3 className="text-sm font-semibold text-emerald-400">Register Supplier Contract</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                <select className={field} name="supplierId" required>
                  <option value="">Select Supplier *</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <input className={field} name="title" placeholder="Contract Title *" required />
                <input className={field} name="contractValue" type="number" step="0.01" placeholder="Contract Value KES *" required />
                <input className={field} name="startDate" type="date" required />
                <input className={field} name="expiryDate" type="date" required />
                <input className={field} name="noticePeriodDays" type="number" placeholder="Notice Period Days (default 30)" />
                <input className={field} name="documentUrl" placeholder="Document Storage Link/URL" />
                <input className={field} name="documentName" placeholder="Document Name (e.g. Master SLA)" />
              </div>
              <button className={action} disabled={busy}>Save Contract</button>
            </form>
          )}

          <div className="space-y-3">
            {data?.expiryAlerts?.map((c) => (
              <article key={c.id} className={`${panel} border-amber-500/30`}>
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-white">{c.title}</strong> <span className="font-mono text-xs text-slate-400">({c.contractNumber})</span>
                    <div className="text-xs text-slate-400">Supplier: {c.supplier?.name} · Value: {money(c.contractValue)}</div>
                  </div>
                  <span className="text-xs font-bold text-amber-300">Expires: {new Date(c.expiryDate).toLocaleDateString()}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RECEIVING & ASSETS */}
      {tab === 'RECEIVING' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Equipment Receiving & Hardware Inventory Integration</h2>
            <button className={action} onClick={() => setShowReceivingForm(!showReceivingForm)}><PlusCircle className="mr-1 inline h-4 w-4" />Log Equipment Inspection</button>
          </div>

          {showReceivingForm && (
            <form className={`${panel} space-y-3 border-emerald-500/30`} onSubmit={handleReceivingSubmit}>
              <h3 className="text-sm font-semibold text-emerald-400">Log Equipment Receiving & Commission Hardware Assets</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <select className={field} name="purchaseOrderId" required>
                  <option value="">Select Purchase Order *</option>
                  {data?.recentOrders?.map((po) => (
                    <option key={po.id} value={po.id}>{po.poNumber} - {po.supplier?.name} ({money(po.totalAmount)})</option>
                  ))}
                </select>
                <select className={field} name="inspectionStatus" required>
                  <option value="PASSED">PASSED Inspection</option>
                  <option value="PARTIAL_ACCEPTANCE">PARTIAL Acceptance</option>
                  <option value="FAILED_INSPECTION">FAILED Inspection</option>
                </select>
              </div>
              <textarea className={field} name="inspectionNotes" placeholder="Inspection Notes & Quality Verification Comments *" required />

              <div className="space-y-2 border-t border-navy-800 pt-3">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-300">
                  <span>Register Received Hardware Assets directly into Inventory</span>
                  <button type="button" className={quietAction} onClick={addReceivingAssetLine}>+ Add Hardware Asset</button>
                </div>
                {receivingAssets.map((ast, idx) => (
                  <div key={idx} className="grid gap-2 sm:grid-cols-4 text-xs">
                    <input className={field} value={ast.name} onChange={(e) => { const newAst = [...receivingAssets]; newAst[idx].name = e.target.value; setReceivingAssets(newAst); }} placeholder="Hardware Name *" />
                    <input className={field} value={ast.model} onChange={(e) => { const newAst = [...receivingAssets]; newAst[idx].model = e.target.value; setReceivingAssets(newAst); }} placeholder="Model" />
                    <input className={field} value={ast.serialNumber} onChange={(e) => { const newAst = [...receivingAssets]; newAst[idx].serialNumber = e.target.value; setReceivingAssets(newAst); }} placeholder="Serial No." />
                    <input className={field} value={ast.location} onChange={(e) => { const newAst = [...receivingAssets]; newAst[idx].location = e.target.value; setReceivingAssets(newAst); }} placeholder="Location" />
                  </div>
                ))}
              </div>

              <button className={action} disabled={busy}>Log Receiving & Register Inventory Assets</button>
            </form>
          )}

          <div className="space-y-3">
            {data?.recentReceivingRecords?.map((rcv) => (
              <article key={rcv.id} className={panel}>
                <div className="flex justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-emerald-400">{rcv.receivingRef}</span> · PO: {rcv.purchaseOrder?.poNumber} ({rcv.purchaseOrder?.supplier?.name})
                    <div className="text-slate-400">Received {new Date(rcv.receivedDate).toLocaleDateString()}</div>
                  </div>
                  <span className={`rounded px-2 py-0.5 font-bold ${rcv.inspectionStatus === 'PASSED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>{rcv.inspectionStatus}</span>
                </div>
                <p className="mt-2 text-xs text-slate-300">{rcv.inspectionNotes}</p>
                {rcv.hardwareAssets?.length > 0 && (
                  <div className="mt-2 text-[11px] text-emerald-400">
                    Registered {rcv.hardwareAssets.length} Hardware Assets: {rcv.hardwareAssets.map((a) => a.name).join(', ')}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
