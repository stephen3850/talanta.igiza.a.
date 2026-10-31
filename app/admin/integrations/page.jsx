'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import {
  Share2,
  Globe,
  Key,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Lock,
  Activity,
  Code,
  ShieldCheck,
  Radio,
  Copy,
  Check,
  Eye,
  FileText
} from 'lucide-react';

export default function AdminApiGatewayOverviewPage() {
  const [clients, setClients] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [allowedScopes, setAllowedScopes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Register Developer Client Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [organization, setOrganization] = useState('');
  const [selectedScopes, setSelectedScopes] = useState(['ticketing:read', 'payments:write']);
  const [rateLimitReqPerMin, setRateLimitReqPerMin] = useState('120');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedApiKey, setIssuedApiKey] = useState(null);

  // OpenAPI Spec Modal
  const [isOpenApiModalOpen, setIsOpenApiModalOpen] = useState(false);

  const fetchGatewayData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/integrations/clients');
      const json = await res.json();
      if (json.success) {
        setClients(json.clients);
        setMetrics(json.metrics);
        setAllowedScopes(json.allowedScopes || []);
      }
    } catch (err) {
      console.error('Failed to load API Gateway clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGatewayData();
  }, []);

  const handleRegisterClientSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIssuedApiKey(null);

    try {
      const res = await fetch('/api/v1/integrations/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName,
          organization,
          scopes: selectedScopes,
          rateLimitReqPerMin: Number(rateLimitReqPerMin),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIssuedApiKey(data.unmaskedApiKey);
        fetchGatewayData();
      }
    } catch (err) {
      console.error('Failed to register client:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRotateKey = async (clientId) => {
    try {
      const res = await fetch('/api/v1/integrations/clients', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`API Key Secret rotated successfully! New API Key: ${data.newUnmaskedApiKey}\nCopy it now; it will be masked on reload.`);
        fetchGatewayData();
      }
    } catch (err) {
      console.error('Key rotation failed:', err);
    }
  };

  const toggleScope = (scopeId) => {
    if (selectedScopes.includes(scopeId)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scopeId));
    } else {
      setSelectedScopes([...selectedScopes, scopeId]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
            <Share2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">ENTERPRISE API GATEWAY v1</Badge>
              <span className="px-2 py-0.5 text-[10px] rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-semibold">
                HMAC-SHA256 SIGNED
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              External Integration Gateway & API Clients
            </h1>
            <p className="text-xs text-slate-400">
              Scoped API keys, M-PESA payment webhooks, partner connectors, and OpenAPI 3.0 specification viewer.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpenApiModalOpen(true)}
          >
            <Code className="w-4 h-4 mr-1 text-emerald-400" />
            <span>OpenAPI Spec</span>
          </Button>

          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Register Client</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchGatewayData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Security Privacy Notice Requirement 6 */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-start space-x-3 text-xs text-slate-300 shadow-lg">
        <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-white flex items-center space-x-2">
            <span>Masked Secret Security Policy</span>
            <Badge variant="info" size="sm">ZERO FRONTEND SECRET EXPOSURE</Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Full unmasked API key secrets are displayed strictly once upon initial client registration or rotation. Only masked secrets (`ts_live_mpesa_****8841`) and SHA-256 hashes are stored in the gateway database.
          </p>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Integration Clients"
          value={metrics ? metrics.activeClients.toString() : '3'}
          subtitle="Safaricom, CAF, SAP ERP"
          icon={Key}
          accentColor="sky"
        />

        <StatCard
          title="Gateway Success Rate"
          value={metrics ? `${metrics.successRatePercent}%` : '100%'}
          subtitle="Avg Response Latency: 18ms"
          icon={CheckCircle2}
          accentColor="emerald"
        />

        <StatCard
          title="Active Webhooks"
          value={metrics ? metrics.activeWebhooks.toString() : '2'}
          subtitle="Subscribed Callbacks"
          icon={Radio}
          accentColor="purple"
        />

        <StatCard
          title="Monitored API Requests"
          value={metrics ? metrics.totalLogs.toString() : '3'}
          subtitle="Audit & Telemetry Log"
          icon={Activity}
          accentColor="gold"
        />
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/integrations/providers">
          <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all space-y-1 group">
            <Globe className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">Integration Providers</span>
            <span className="text-[10px] text-slate-400 block">M-PESA, SendGrid, SAP, BACnet BMS Bridge</span>
          </div>
        </Link>

        <Link href="/admin/integrations/webhooks">
          <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all space-y-1 group">
            <Radio className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">Webhook Subscriptions</span>
            <span className="text-[10px] text-slate-400 block">HMAC Signatures & Manual Dispatcher</span>
          </div>
        </Link>

        <Link href="/admin/integrations/logs">
          <div className="p-5 rounded-2xl bg-navy-900 border border-navy-800 hover:border-emerald-500/50 transition-all space-y-1 group">
            <Activity className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-white text-xs block">API Audit & Request Logs</span>
            <span className="text-[10px] text-slate-400 block">HTTP Methods, Status Codes & Latencies</span>
          </div>
        </Link>
      </div>

      {/* Registered Developer Clients Table (Requirement 8) */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Registered Integration Clients & Scoped API Keys</h2>
          <span className="text-[10px] text-slate-400 font-mono">{clients.length} Clients Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Client Ref & Name</th>
                <th className="p-4">Organization</th>
                <th className="p-4">Masked API Key</th>
                <th className="p-4">Granted Permission Scopes</th>
                <th className="p-4">Rate Limit</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {clients.map((cli) => (
                <tr key={cli.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono font-bold text-white">{cli.id}</div>
                    <div className="text-[11px] text-slate-300 font-bold mt-0.5">{cli.clientName}</div>
                  </td>

                  <td className="p-4">
                    <div className="text-slate-200">{cli.organization}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">Rotation: {cli.rotationStatus}</div>
                  </td>

                  <td className="p-4 font-mono text-[11px] text-emerald-400 font-bold">
                    {cli.apiKeyMasked}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {cli.scopes.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-[10px] font-mono text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 font-mono text-sky-400">
                    {cli.rateLimitReqPerMin} req/min
                  </td>

                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRotateKey(cli.id)}
                      className="text-xs py-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />
                      <span>Rotate Key</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Client Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setIssuedApiKey(null);
        }}
        title="Register New External Integration Client"
      >
        <form onSubmit={handleRegisterClientSubmit} className="space-y-4 text-xs">
          {issuedApiKey ? (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500 text-emerald-200 space-y-2">
              <div className="font-bold text-white flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Client Credentials Issued Successfully!</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Copy the private API key secret below. It will <strong>never be displayed again</strong> in unmasked form:
              </p>
              <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 font-mono font-black text-emerald-400 text-sm select-all break-all">
                {issuedApiKey}
              </div>
              <Button
                variant="primary"
                size="sm"
                type="button"
                className="w-full justify-center mt-2"
                onClick={() => {
                  setIsModalOpen(false);
                  setIssuedApiKey(null);
                }}
              >
                I Have Saved My Private API Key
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Client Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Turnstile Gate B Partner Validator"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Organization / Department *</label>
                <input
                  type="text"
                  placeholder="e.g. Safaricom FinTech Ops"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Granted Permission Scopes</label>
                <div className="grid grid-cols-2 gap-2">
                  {allowedScopes.map((scope) => {
                    const isChecked = selectedScopes.includes(scope.id);
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => toggleScope(scope.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all text-[11px] font-mono ${
                          isChecked
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                            : 'bg-navy-950 border-navy-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {scope.id}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Rate Limit (Requests per Minute)</label>
                <input
                  type="number"
                  value={rateLimitReqPerMin}
                  onChange={(e) => setRateLimitReqPerMin(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
                <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
                  Generate API Client
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* OpenAPI Spec Modal (Requirement 7) */}
      <Modal
        isOpen={isOpenApiModalOpen}
        onClose={() => setIsOpenApiModalOpen(false)}
        title="OpenAPI 3.0 Specification Documentation"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-slate-300">
            OpenAPI v3.0 Specification generated at <code>/api/v1/docs</code>. Contains requests, response schemas, and authentication schemes for M-PESA, Gate Validation, and Ticketing.
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 font-mono text-[10px] text-emerald-400 space-y-1 max-h-64 overflow-y-auto">
            <pre>{JSON.stringify({
              openapi: '3.0.3',
              info: { title: 'Talanta Stadium API Gateway v1', version: '1.0.0-v1' },
              paths: {
                '/tickets': { get: { summary: 'Query Issued Digital Passes' } },
                '/payments/mpesa': { post: { summary: 'Initiate M-PESA Express Payment' } },
                '/gate/validate': { post: { summary: 'Validate Pass at Gate Turnstile' } },
              },
            }, null, 2)}</pre>
          </div>

          <div className="flex justify-end pt-2 border-t border-navy-800">
            <Button variant="secondary" size="sm" onClick={() => setIsOpenApiModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
