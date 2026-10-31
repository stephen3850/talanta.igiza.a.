'use client';

import React, { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import { initialEvents } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import {
  Sparkles,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Sliders,
  Cpu,
  ShieldCheck,
  Zap,
  Info,
  Building2,
  Clock
} from 'lucide-react';

export default function AdminAIIntelligenceDashboardPage() {
  const [selectedEventId, setSelectedEventId] = useState('EVT-001');
  const [aiData, setAiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Scenario Simulator State
  const [salesBoostInput, setSalesBoostInput] = useState(3000);
  const [simulationResult, setSimulationResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const fetchAIData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/ai/forecast?eventId=${selectedEventId}`);
      const data = await res.json();
      if (data.success) {
        setAiData(data);
      }
    } catch (err) {
      console.warn('Using local AI engine fallback');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAIData();
  }, [selectedEventId]);

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setIsSimulating(true);

    try {
      const res = await fetch('/api/ai/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: selectedEventId,
          customSalesBoost: Number(salesBoostInput),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSimulationResult(data);
      }
    } catch (err) {
      alert('Error running AI scenario simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading || !aiData) {
    return (
      <div className="p-8 text-center text-slate-400">
        Initializing Talanta AI Predictive Analytics Engine...
      </div>
    );
  }

  const { attendanceForecast, gateCongestionPredictions, predictiveMaintenance, ticketDemandInsights, modelMetadata } = aiData;

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">AI PREDICTIVE INTELLIGENCE</Badge>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                {modelMetadata.modelVersion}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              AI Stadium Intelligence & Analytics
            </h1>
            <p className="text-xs text-slate-400">
              Data-driven attendance forecasts, demand advisory, gate congestion predictions, and predictive maintenance.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Matchday Event Selector */}
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
          >
            {initialEvents.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.category})
              </option>
            ))}
          </select>

          <Button variant="secondary" size="sm" onClick={fetchAIData}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Human-in-the-loop Governance Banner */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex items-center space-x-3 text-xs text-slate-300">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <span>
          <strong>Human Oversight Policy:</strong> AI recommendations provide decision support for venue managers. The system does not automatically adjust ticket prices or alter security access without human review and confirmation.
        </span>
      </div>

      {/* Attendance Forecast & Confidence Gauge */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-navy-800 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">AI Matchday Attendance Forecast</span>
            <h2 className="text-xl font-bold text-white">{attendanceForecast.eventTitle}</h2>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {attendanceForecast.forecastAttendance.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 block">
              Forecast Spectators ({attendanceForecast.occupancyPercentage}% Occupancy)
            </span>
          </div>
        </div>

        {/* Forecast Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-navy-950 p-4 rounded-2xl border border-navy-800 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase">Current Tickets Sold</span>
            <span className="text-xl font-bold text-white font-mono">
              {attendanceForecast.currentTicketsSold.toLocaleString()}
            </span>
          </div>

          <div className="bg-navy-950 p-4 rounded-2xl border border-navy-800 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase">Model Confidence Score</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">
              {attendanceForecast.confidenceScore}
            </span>
          </div>

          <div className="bg-navy-950 p-4 rounded-2xl border border-navy-800 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase">Days to Matchday</span>
            <span className="text-xl font-bold text-white font-mono">
              {attendanceForecast.daysRemaining} Days
            </span>
          </div>

          <div className="bg-navy-950 p-4 rounded-2xl border border-navy-800 space-y-1">
            <span className="text-slate-400 block text-[10px] uppercase">Projected Peak Entry</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {attendanceForecast.projectedPeakGateTime}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Demand Advisory & Predictive Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Ticket Demand Advisory */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Ticket Demand & Category Advisory</span>
            </h3>
            <Badge variant="success">Decision Support</Badge>
          </div>

          <div className="space-y-3">
            {ticketDemandInsights.map((insight) => (
              <div key={insight.categoryId} className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{insight.categoryName}</span>
                  <Badge variant="success" size="sm">{insight.demandIndex}</Badge>
                </div>

                <p className="text-slate-300 leading-relaxed">{insight.advisoryNote}</p>

                <div className="pt-2 border-t border-navy-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sales Pace: <strong className="text-white font-mono">{insight.salesVelocity}</strong></span>
                  <span className="text-emerald-400 font-semibold">Human Review Required</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Predictive Maintenance Advisory */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              <span>IoT Predictive Maintenance Advisory</span>
            </h3>
            <Badge variant="warning">Telemetry Trends</Badge>
          </div>

          <div className="space-y-3">
            {predictiveMaintenance.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-navy-950 border border-amber-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{item.deviceName}</span>
                  <Badge variant="warning" size="sm">{item.probability} Risk</Badge>
                </div>

                <p className="text-slate-300">{item.recommendedAction}</p>

                <div className="p-2.5 rounded-xl bg-navy-900 text-[11px] text-slate-400 space-y-1">
                  <span className="font-semibold text-amber-400 block">Supporting Evidence:</span>
                  <span>{item.supportingEvidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gate Congestion & Flow Predictions */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            <span>Turnstile Gate Traffic & Congestion Predictions</span>
          </h3>
          <Badge variant="success">Steward Allocation Guide</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Gate & Location</th>
                <th className="p-4">Predicted Peak Arrival Window</th>
                <th className="p-4">Predicted Scan Rate</th>
                <th className="p-4">Congestion Risk</th>
                <th className="p-4">Recommended Stewards</th>
                <th className="p-4">Supporting Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {gateCongestionPredictions.map((gate) => (
                <tr key={gate.gateId} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-white">{gate.gateId}</div>
                    <div className="text-[10px] text-slate-400">{gate.zoneLocation}</div>
                  </td>

                  <td className="p-4 font-mono font-bold text-white">{gate.predictedPeakTime}</td>

                  <td className="p-4 font-mono font-bold text-emerald-400">{gate.predictedScanRate}</td>

                  <td className="p-4">
                    <Badge variant={gate.congestionRisk === 'HIGH' ? 'danger' : 'success'}>
                      {gate.congestionRisk}
                    </Badge>
                  </td>

                  <td className="p-4 font-bold text-white">
                    {gate.recommendedStewardAllocation} Stewards
                  </td>

                  <td className="p-4 text-slate-400 text-[11px] max-w-xs">
                    {gate.supportingEvidence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scenario Simulator Launcher */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <span>Custom Attendance Scenario Simulator</span>
        </h3>

        <form onSubmit={handleRunSimulation} className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Simulated Promotional Sales Boost (+ Tickets)
            </label>
            <input
              type="number"
              value={salesBoostInput}
              onChange={(e) => setSalesBoostInput(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <Button type="submit" variant="primary" isLoading={isSimulating} className="mt-5 space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Run Simulation</span>
          </Button>
        </form>

        {simulationResult && (
          <div className="p-4 rounded-2xl bg-navy-950 border border-emerald-500/40 text-xs space-y-1">
            <span className="font-bold text-white block">Simulation Output:</span>
            <span className="text-emerald-400 font-mono font-bold block">
              Projected Attendance: {simulationResult.simulatedAttendance.toLocaleString()} Spectators ({simulationResult.simulatedOccupancyPercentage}% Occupancy)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
