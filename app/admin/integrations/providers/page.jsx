'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import {
  Globe,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Building,
  Radio,
  Tv,
  FileBarChart
} from 'lucide-react';

export default function AdminIntegrationProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProviders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/integrations/clients');
      const json = await res.json();
      if (json.success) {
        setProviders(json.providers || []);
      }
    } catch (err) {
      console.error('Failed to load integration providers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

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
              <Badge variant="success" size="sm">EXTERNAL SYSTEM PROVIDERS</Badge>
              <span className="text-[10px] text-slate-400 font-mono">8 Integration Bridges</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Configured External Integration Interfaces
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={fetchProviders}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Safaricom M-PESA Express (Daraja 2.0 API)', category: 'PAYMENT', authType: 'OAUTH2_BEARER', status: 'ACTIVE', docRef: 'Safaricom Daraja 2.0 API' },
          { name: "Africa's Talking SMS & Voice Gateway", category: 'COMMUNICATION', authType: 'API_KEY', status: 'ACTIVE', docRef: "Africa's Talking REST API v2" },
          { name: 'SendGrid Transactional Email Delivery', category: 'COMMUNICATION', authType: 'BEARER_TOKEN', status: 'ACTIVE', docRef: 'Twilio SendGrid v3 API' },
          { name: 'SAP S/4HANA ERP Financial Accounting Bridge', category: 'ACCOUNTING', authType: 'MUTUAL_TLS_OAUTH2', status: 'CONFIGURED', docRef: 'SAP OData API Services' },
          { name: 'Confederation of African Football (CAF) API', category: 'EVENT_PARTNER', authType: 'HMAC_SHA256', status: 'ACTIVE', docRef: 'CAF Matchday Ticketing Protocol' },
          { name: 'BACnet / Modbus Smart Building IoT Bridge', category: 'BUILDING_MANAGEMENT', authType: 'API_KEY', status: 'ACTIVE', docRef: 'BACnet/IP Gateway Spec' },
          { name: 'BrightSign Signage Content Push API', category: 'DIGITAL_SIGNAGE', authType: 'API_KEY', status: 'ACTIVE', docRef: 'BrightSign BSN.Cloud API' },
          { name: 'Microsoft PowerBI External Reporting Connector', category: 'REPORTING', authType: 'OAUTH2_BEARER', status: 'ACTIVE', docRef: 'PowerBI REST API v1.0' },
        ].map((prov, idx) => (
          <div
            key={idx}
            className="bg-navy-900 border border-navy-800 hover:border-slate-700 transition-all rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="info" size="sm">{prov.category}</Badge>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {prov.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-xs">{prov.name}</h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{prov.docRef}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Auth: {prov.authType}</span>
              <span className="text-emerald-400">Verified</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
