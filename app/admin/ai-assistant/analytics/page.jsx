'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import {
  BarChart2,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  Plus
} from 'lucide-react';

export default function AdminAiAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [unanswered, setUnanswered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/visitor-assistant/analytics');
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.analytics);
        setUnanswered(json.unansweredQuestions || []);
      }
    } catch (err) {
      console.error('Failed to load AI analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/ai-assistant">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">CONVERSATION ANALYTICS</Badge>
              <span className="text-[10px] text-slate-400 font-mono">Anonymized Query Telemetry</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Visitor AI Interaction Metrics & Unanswered Questions
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Query Category Breakdown */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-navy-800 pb-3">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span>Top Query Categories & Interaction Frequency</span>
        </h2>

        {analytics && analytics.categoryBreakdown && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            {Object.entries(analytics.categoryBreakdown).map(([cat, count]) => (
              <div key={cat} className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
                <span className="text-[10px] text-slate-400 block truncate">{cat.replace('_', ' ')}</span>
                <span className="text-base font-bold text-white block">{count.toLocaleString()} queries</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unanswered Questions Log Requirement 6 */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Unanswered Visitor Questions Log</h2>
          </div>
          <span className="text-[10px] text-amber-400 font-mono">Flagged for Knowledge Base Coverage</span>
        </div>

        <div className="space-y-3">
          {unanswered.map((uq) => (
            <div key={uq.id} className="p-4 rounded-xl bg-navy-950 border border-navy-800 flex items-center justify-between space-x-4 text-xs">
              <div className="space-y-1">
                <div className="font-bold text-white text-xs">{uq.question}</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Frequency: <strong className="text-amber-400">{uq.frequency} times asked</strong> • Last: {new Date(uq.lastAskedAt).toLocaleDateString()}
                </div>
              </div>

              <Link href="/admin/ai-assistant/knowledge">
                <Button variant="outline" size="sm" className="text-xs shrink-0">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Create KB Article</span>
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
