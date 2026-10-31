'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import {
  ShieldCheck,
  QrCode,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Bell,
  User,
  Radio,
  FileCheck,
  RefreshCw,
  ArrowLeft,
  Smartphone
} from 'lucide-react';

export default function MobileStaffPortalPage() {
  const [staff] = useState({
    name: 'Officer Denis Mwangi',
    role: 'G4S Crowd Safety Unit Lead',
    staffId: 'STF-2026-8841',
    accreditationLevel: 'ALL ACCESS - EOC / MEDIA / PITCHSIDE',
    badgeColor: 'EMERALD',
    dutyEvent: 'Harambee Stars vs Nigeria (AFCON Qualifier)',
    assignedZone: 'Gate B Concourse & Turnstiles 1-12',
    dutyShift: '10:00 - 22:00 EAT',
  });

  const [tasks, setTasks] = useState([
    { id: 'TSK-01', text: 'Inspect Gate B turnstile optical scanners before concourse open', done: true },
    { id: 'TSK-02', text: 'Verify crowd safety steward positions at Lanes 1-6', done: true },
    { id: 'TSK-03', text: 'Establish secondary queue diversion tape if density exceeds 3p/m²', done: false },
    { id: 'TSK-04', text: 'Conduct post-match egress check at Gate B main exit gates', done: false },
  ]);

  const [announcements] = useState([
    { id: 'ANN-101', title: 'Pre-Match Gate Open at 13:00 EAT', time: '11:30 AM', body: 'All Gate B stewards to be on post with handheld backup scanners active.' },
    { id: 'ANN-102', title: 'TETRA Radio Channel Shift', time: '10:15 AM', body: 'Crowd management teams switch to Channel 4 for EOC direct dispatch.' },
  ]);

  const toggleTask = (taskId) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)));
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20 p-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="outline" size="sm" className="text-xs">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Home</span>
          </Button>
        </Link>
        <Badge variant="success" size="sm">STAFF MOBILE PORTAL</Badge>
      </div>

      {/* Staff Digital Accreditation Badge */}
      <div className="bg-navy-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>

        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div className="flex items-center space-x-2 text-left">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black">
              TS
            </div>
            <div>
              <span className="font-extrabold text-white text-xs block uppercase">Talanta Stadium</span>
              <span className="text-[10px] text-emerald-400 font-mono">STAFF ACCREDITATION</span>
            </div>
          </div>
          <Badge variant="success" size="sm">ACTIVE DUTY</Badge>
        </div>

        {/* Staff Identity */}
        <div className="space-y-1">
          <h1 className="text-lg font-black text-white">{staff.name}</h1>
          <p className="text-xs text-slate-400 font-semibold">{staff.role}</p>
          <p className="text-[10px] text-emerald-400 font-mono font-bold">{staff.staffId}</p>
        </div>

        {/* Pass QR Code */}
        <div className="p-4 rounded-2xl bg-white max-w-[200px] mx-auto shadow-inner space-y-2">
          <div className="aspect-square bg-slate-900 rounded-xl p-2 flex items-center justify-center text-white">
            <QrCode className="w-32 h-32 text-emerald-400" />
          </div>
          <p className="text-[9px] text-slate-700 font-mono font-bold tracking-widest">
            ACCREDITATION REF: STF-2026-9911
          </p>
        </div>

        {/* Accreditation Level Banner */}
        <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-extrabold text-[11px]">
          {staff.accreditationLevel}
        </div>
      </div>

      {/* Duty Assignment Card */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
        <h2 className="text-xs font-bold text-white flex items-center space-x-2 border-b border-navy-800 pb-2">
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>Current Matchday Assignment</span>
        </h2>

        <div className="space-y-2 font-mono">
          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Event</span>
            <span className="font-bold text-white text-xs">{staff.dutyEvent}</span>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Assigned Sector / Zone</span>
            <span className="font-bold text-emerald-400">{staff.assignedZone}</span>
          </div>

          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Duty Shift Window</span>
            <span className="text-slate-300">{staff.dutyShift}</span>
          </div>
        </div>
      </div>

      {/* Operational Task Checklist */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-navy-800 pb-2">
          <h2 className="text-xs font-bold text-white flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>Operational Task Checklist</span>
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">
            {tasks.filter((t) => t.done).length}/{tasks.length} Completed
          </span>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`w-full p-3 rounded-xl border text-left flex items-start space-x-2.5 transition-all ${
                task.done
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-navy-950 border-navy-800 text-slate-300'
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${task.done ? 'text-emerald-400' : 'text-slate-600'}`} />
              <span className={`text-[11px] leading-snug ${task.done ? 'line-through opacity-80' : ''}`}>
                {task.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Operational Announcements Feed */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-navy-800 pb-2">
          <h2 className="text-xs font-bold text-white flex items-center space-x-2">
            <Bell className="w-4 h-4 text-rose-400" />
            <span>Command Operational Broadcasts</span>
          </h2>
          <span className="text-[10px] text-emerald-400 font-mono">LIVE FEED</span>
        </div>

        <div className="space-y-2.5">
          {announcements.map((ann) => (
            <div key={ann.id} className="p-3 rounded-xl bg-navy-950 border border-navy-800 space-y-1">
              <div className="flex justify-between font-bold text-white">
                <span>{ann.title}</span>
                <span className="text-[10px] text-slate-500 font-mono">{ann.time}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{ann.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
