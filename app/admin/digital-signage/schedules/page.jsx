'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  Clock,
  Plus,
  ArrowLeft,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Tv,
  Layers,
  Search
} from 'lucide-react';

export default function AdminSignageSchedulesPage() {
  const [schedules, setSchedules] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [screens, setScreens] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScheduleData = async () => {
    setIsLoading(true);
    try {
      const [resPlay, resScr] = await Promise.all([
        fetch('/api/digital-signage/playlists'),
        fetch('/api/digital-signage/screens'),
      ]);

      const [dataPlay, dataScr] = await Promise.all([
        resPlay.json(),
        resScr.json(),
      ]);

      if (dataPlay.success) {
        setPlaylists(dataPlay.playlists);
        setSchedules(dataPlay.schedules || []);
      }
      if (dataScr.success) {
        setScreens(dataScr.screens);
      }
    } catch (err) {
      console.error('Failed to load schedule data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/digital-signage">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">PUBLICATION SCHEDULES</Badge>
              <span className="text-[10px] text-slate-400 font-mono">{schedules.length} Active Rules</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Screen Assignments & Scheduled Broadcasts
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="secondary" size="sm" onClick={fetchScheduleData}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Active Schedules Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl space-y-3">
        <div className="p-4 border-b border-navy-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white">Active Screen Assignment & Schedule Rules</h2>
          <span className="text-[10px] text-emerald-400 font-mono">Matchday Rules Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Schedule Ref & Name</th>
                <th className="p-4">Assigned Playlist</th>
                <th className="p-4">Target Display Screens</th>
                <th className="p-4">Publication Window</th>
                <th className="p-4">Recurrence</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {schedules.map((sch) => (
                <tr key={sch.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4">
                    <div className="font-mono font-bold text-white">{sch.id}</div>
                    <div className="text-[11px] text-slate-300 font-bold mt-0.5">{sch.playlistName}</div>
                  </td>

                  <td className="p-4 font-mono text-emerald-400 text-xs font-bold">
                    {sch.playlistId}
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {sch.assignedScreenIds.map((sid) => (
                        <span key={sid} className="px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-[10px] font-mono text-white">
                          {sid}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4 font-mono text-[10px] text-slate-300">
                    <div>From: {new Date(sch.startDate).toLocaleDateString()}</div>
                    <div>Until: {new Date(sch.endDate).toLocaleDateString()}</div>
                  </td>

                  <td className="p-4">
                    <Badge variant="info" size="sm">{sch.recurrence}</Badge>
                  </td>

                  <td className="p-4 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {sch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
