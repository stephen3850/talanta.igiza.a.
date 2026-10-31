'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  Radio,
  Plus,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  Send,
  Trash2,
  Activity
} from 'lucide-react';

export default function AdminWebhooksPage() {
  const [webhooks, setWebhooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Register Webhook Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientId, setClientId] = useState('CLI-2026-001');
  const [targetUrl, setTargetUrl] = useState('https://api.partner.co.ke/webhooks/stadium-events');
  const [selectedEvents, setSelectedEvents] = useState(['payment.confirmed']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedSecret, setIssuedSecret] = useState(null);

  // Dispatch Test Event Modal
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchName, setDispatchName] = useState('payment.confirmed');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState(null);

  const fetchWebhooks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/integrations/webhooks');
      const json = await res.json();
      if (json.success) {
        setWebhooks(json.webhooks);
      }
    } catch (err) {
      console.error('Failed to load webhooks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleRegisterWebhookSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIssuedSecret(null);

    try {
      const res = await fetch('/api/v1/integrations/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          targetUrl,
          eventTypes: selectedEvents,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIssuedSecret(data.unmaskedSigningSecret);
        fetchWebhooks();
      }
    } catch (err) {
      console.error('Failed to register webhook:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualDispatch = async (e) => {
    e.preventDefault();
    setIsDispatching(true);
    setDispatchFeedback(null);

    try {
      const res = await fetch('/api/v1/integrations/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DISPATCH',
          eventName: dispatchName,
          payload: {
            transactionRef: 'MPE-2026-9841',
            amount: 2500,
            eventRef: 'EVT-2026-AFCON-01',
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setDispatchFeedback(`Event ${dispatchName} dispatched to ${data.dispatchResults.deliveredCount} subscribers with HMAC-SHA256 signature header.`);
        fetchWebhooks();
      }
    } catch (err) {
      console.error('Dispatch failed:', err);
    } finally {
      setIsDispatching(false);
    }
  };

  const handleRevokeWebhook = async (id) => {
    try {
      const res = await fetch(`/api/v1/integrations/webhooks?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchWebhooks();
      }
    } catch (err) {
      console.error('Failed to revoke webhook:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/integrations">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">WEBHOOK ENGINE</Badge>
              <span className="text-[10px] text-slate-400 font-mono">{webhooks.length} Subscriptions Active</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Webhook Event Subscriptions & HMAC Delivery Dispatcher
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setIsDispatchModalOpen(true)}>
            <Send className="w-4 h-4 mr-1 text-emerald-400" />
            <span>Test Event Dispatcher</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Register Webhook</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchWebhooks}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Webhooks Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Active Webhook Callback Subscriptions</h2>
          <span className="text-[10px] text-emerald-400 font-mono">X-Talanta-Signature Header HMAC-SHA256 Enforced</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Webhook Ref & Client</th>
                <th className="p-4">Target Endpoint URL</th>
                <th className="p-4">Subscribed Event Types</th>
                <th className="p-4">Deliveries (Pass/Fail)</th>
                <th className="p-4">Last Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {webhooks.map((hk) => (
                <tr key={hk.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono font-bold text-white">{hk.id}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{hk.clientId}</div>
                  </td>

                  <td className="p-4 font-mono text-[11px] text-emerald-400 font-bold max-w-xs truncate">
                    {hk.targetUrl}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {hk.eventTypes.map((ev, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-[10px] font-mono text-slate-300">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 font-mono text-xs">
                    <span className="text-emerald-400">{hk.deliveredCount}</span> / <span className="text-rose-400">{hk.failedCount}</span>
                  </td>

                  <td className="p-4 font-mono text-[10px]">
                    <span className="text-emerald-400 font-bold">{hk.lastDeliveryStatus}</span> ({hk.lastDeliveryLatencyMs}ms)
                  </td>

                  <td className="p-4 text-right">
                    {hk.status === 'ACTIVE' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevokeWebhook(hk.id)}
                        className="text-xs py-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Revoke</span>
                      </Button>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-mono italic">REVOKED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Webhook Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIssuedSecret(null);
        }}
        title="Register Webhook Event Subscription"
      >
        <form onSubmit={handleRegisterWebhookSubmit} className="space-y-4 text-xs">
          {issuedSecret ? (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500 text-emerald-200 space-y-2">
              <div className="font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Webhook Subscription Created!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Copy the secret key below to verify HMAC-SHA256 signature headers (<code>X-Talanta-Signature</code>) on incoming webhook payloads:
              </p>
              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 font-mono font-black text-emerald-400 text-sm select-all break-all">
                {issuedSecret}
              </div>
              <Button
                variant="primary"
                size="sm"
                type="button"
                className="w-full justify-center mt-2"
                onClick={() => {
                  setIsModalOpen(false);
                  setIssuedSecret(null);
                }}
              >
                I Have Saved My Webhook Secret
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Client ID *</label>
                <input
                  type="text"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Target Callback URL (HTTPS) *</label>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Subscribed Event Types</label>
                <select
                  multiple
                  value={selectedEvents}
                  onChange={(e) => setSelectedEvents(Array.from(e.target.selectedOptions, (o) => o.value))}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono h-24"
                >
                  <option value="payment.confirmed">payment.confirmed</option>
                  <option value="payment.failed">payment.failed</option>
                  <option value="ticket.issued">ticket.issued</option>
                  <option value="gate.scanned">gate.scanned</option>
                  <option value="incident.reported">incident.reported</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  Register Webhook
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* Manual Dispatcher Modal */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Test Webhook Dispatcher Engine"
      >
        <form onSubmit={handleManualDispatch} className="space-y-4 text-xs">
          {dispatchFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{dispatchFeedback}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Select Webhook Event Type</label>
            <select
              value={dispatchName}
              onChange={(e) => setDispatchName(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="payment.confirmed">payment.confirmed</option>
              <option value="ticket.issued">ticket.issued</option>
              <option value="gate.scanned">gate.scanned</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsDispatchModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isDispatching}>
              <Send className="w-3.5 h-3.5 mr-1" />
              <span>Dispatch Test Event</span>
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
