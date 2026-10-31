'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import {
  Sparkles,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Activity,
  ShieldAlert,
  Sliders,
  FileCheck
} from 'lucide-react';

export default function AdminPredictiveAnalyticsPage() {
  const [recommendations, setRecommendations] = useState([]);
  const [disclaimer, setDisclaimer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/maintenance/analytics');
      const json = await res.json();
      if (json.success) {
        setRecommendations(json.recommendations);
        setDisclaimer(json.disclaimer);
      }
    } catch (err) {
      console.error('Failed to load predictive analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/maintenance">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">PREDICTIVE INTELLIGENCE</Badge>
              <span className="text-[10px] text-slate-400 font-mono">HUMAN-IN-THE-LOOP INTERLOCK</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              AI-Assisted Predictive Maintenance & Component Decay Models
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={fetchAnalyticsData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Safety Interlock Banner Requirement 6 & 7 */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-amber-500/40 flex items-start space-x-3 text-xs text-slate-300 shadow-lg">
        <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-white flex items-center space-x-2">
            <span>Mandatory AI Recommendation Safety Interlock</span>
            <Badge variant="warning" size="sm">SUPERVISORY ADVISORY ONLY</Badge>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            AI recommendations generate diagnostic advisories for authorized technicians. The system <strong>must NOT automatically start, shut down, or alter physical equipment</strong> through an AI prediction. All consequential maintenance actions require authorized technical review and manual sign-off.
          </p>
        </div>
      </div>

      {/* AI Recommendations List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Active Predictive Maintenance Recommendations ({recommendations.length})</span>
        </h2>

        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-navy-900 border border-purple-500/30 hover:border-purple-500/60 transition-all rounded-2xl p-6 shadow-xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-purple-400">{rec.id}</span>
                <Badge variant={rec.urgency === 'HIGH' ? 'danger' : 'warning'} size="sm">
                  {rec.urgency} URGENCY
                </Badge>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">
                  Model Confidence: {rec.confidencePercent}%
                </span>
              </div>

              <span className="text-[10px] text-slate-400 font-mono">
                {rec.predictionModel}
              </span>
            </div>

            <div>
              <h3 className="font-bold text-white text-sm">{rec.assetName}</h3>
              <p className="text-xs text-amber-300 font-semibold mt-1">{rec.issueSummary}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-2 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Explanatory Reasoning:</span>
                <p className="text-slate-300 leading-relaxed">{rec.explanatoryReason}</p>
              </div>

              <div className="pt-2 border-t border-navy-900">
                <span className="text-amber-400/90 text-[10px] uppercase font-bold block">Uncertainty Information & Bounds:</span>
                <p className="text-slate-400 text-[11px] italic leading-relaxed">{rec.uncertaintyDisclaimer}</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold block text-white">Recommended Action:</span>
                <span className="text-[11px] text-emerald-300">{rec.recommendedAction}</span>
              </div>

              <Link href="/admin/maintenance/work-orders">
                <Button variant="primary" size="sm" className="text-xs shrink-0 ml-3">
                  <Wrench className="w-3.5 h-3.5 mr-1" />
                  <span>Create Work Order</span>
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
