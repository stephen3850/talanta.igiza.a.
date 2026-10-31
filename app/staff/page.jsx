'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  QrCode,
  Radio,
  ShieldCheck,
  Smartphone,
  UserCheck,
  AlertTriangle,
  Bell,
  ArrowRight,
  ListTodo
} from 'lucide-react';

export default function MobileStaffPortalPage() {
  const [activeTab, setActiveTab] = useState('PASS'); // 'PASS' | 'ASSIGNMENTS' | 'TASKS' | 'ANNOUNCEMENTS'

  // Staff Credential State
  const staffMember = {
    accreditationNo: 'ACC-2026-9042',
    fullName: 'Dennis Mwangi Ndung\'u',
    roleTitle: 'Head Safety Steward & Incident Responder',
    category: 'SECURITY',
    organisation: 'Talanta Operations / G4S Kenya',
    department: 'Crowd Safety & Access Control',
    zonePermissions: 'Zone A, Zone B, VIP Deck, Pitch Perimeter, Media Gallery',
    validFrom: '2026-01-01',
    validUntil: '2026-12-31',
    status: 'APPROVED',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  };

  // Event Assignment
  const currentAssignment = {
    eventTitle: 'Harambee Stars vs Nigeria (Super Eagles)',
    eventReference: 'EVT-2026-AFCON-01',
    dutyStation: 'Gate B Concourse Turnstile Lane 4',
    reportingTime: '12:30 PM',
    shiftDuration: '13:00 - 21:30 EAT',
    supervisor: 'Col. (Rtd) Evans Kiprono (CSSO)',
    supervisorContact: '+254 722 100 001',
    radioChannel: 'Channel 4 (TETRA Security Net)',
  };

  // Approved Tasks Checklist
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete Digital Turnstile Scanner Calibration', completed: true },
    { id: 2, title: 'Inspect Emergency Exit Gate 4 Clear Way', completed: true },
    { id: 3, title: 'Perform TETRA Radio Voice Check with EOC Command', completed: false },
    { id: 4, title: 'Verify Defibrillator (AED) Station Seal at Bay B', completed: false },
    { id: 5, title: 'Distribute Crowd Barrier Funnel Tape for Gate Surge', completed: false },
  ]);

  // Operational Announcements
  const announcements = [
    {
      id: 'ANN-01',
      title: 'Concourse Gates Opening Time Confirmed',
      message: 'All turnstiles will open to public ticket holders promptly at 14:00 EAT. Pre-match stewarding positions active by 13:30.',
      time: '11:45 AM',
      priority: 'NORMAL',
    },
    {
      id: 'ANN-02',
      title: 'Weather & Heat Stress Advisory (FIFA WBGT 22.8°C)',
      message: 'Current pitch temperature 24.5°C. Hydration breaks scheduled. Ensure water stations in concourses are fully stocked.',
      time: '10:30 AM',
      priority: 'INFO',
    },
    {
      id: 'ANN-03',
      title: 'High Turnstile Influx Expected at Gate B',
      message: 'Gate B general admission ticket sales spike detected. Be ready to divert overflow patrons to secondary Gate C turnstiles.',
      time: '09:15 AM',
      priority: 'URGENT',
    },
  ];

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-xl mx-auto px-4 py-8 w-full space-y-6">
        <div role="status" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
          Demo-only staff identity, accreditation, permissions, and assignment. No real staff credential or shift is verified.
        </div>
        {/* Top Header Card */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="warning" size="sm">SIMULATED STAFF SAMPLE</Badge>
            <span className="font-mono text-[10px] text-amber-300 font-bold">NOT AN ISSUED CREDENTIAL</span>
          </div>

          <div className="flex items-center space-x-3.5 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-navy-950 border-2 border-emerald-500 overflow-hidden shrink-0 shadow-lg">
              <img
                src={staffMember.photoUrl}
                alt={staffMember.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">{staffMember.fullName}</h1>
              <p className="text-xs text-emerald-400 font-medium">{staffMember.roleTitle}</p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">{staffMember.accreditationNo}</p>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-navy-900 border border-navy-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('PASS')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'PASS'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Digital Pass
          </button>

          <button
            onClick={() => setActiveTab('ASSIGNMENTS')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'ASSIGNMENTS'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Shift Duty
          </button>

          <button
            onClick={() => setActiveTab('TASKS')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'TASKS'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tasks ({tasks.filter((t) => !t.completed).length})
          </button>

          <button
            onClick={() => setActiveTab('ANNOUNCEMENTS')}
            className={`py-2 rounded-xl transition-all ${
              activeTab === 'ANNOUNCEMENTS'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Alerts
          </button>
        </div>

        {/* TAB 1: DIGITAL STAFF PASS DISPLAY */}
        {activeTab === 'PASS' && (
          <div className="bg-navy-900 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-in fade-in duration-200">
            <div className="border-b border-navy-800 pb-3">
              <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest block font-bold">
                REPUBLIC OF KENYA • TALANTA SPORTS CITY
              </span>
              <h2 className="text-base font-bold text-white mt-1">OFFICIAL WORKFORCE CREDENTIAL</h2>
            </div>

            {/* QR Credential Barcode */}
            <div className="bg-white p-5 rounded-2xl inline-block shadow-inner mx-auto border-4 border-emerald-500">
              <svg className="w-36 h-36 mx-auto text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                <rect x="0" y="0" width="30" height="30" />
                <rect x="5" y="5" width="20" height="20" fill="white" />
                <rect x="10" y="10" width="10" height="10" />

                <rect x="70" y="0" width="30" height="30" />
                <rect x="75" y="5" width="20" height="20" fill="white" />
                <rect x="80" y="10" width="10" height="10" />

                <rect x="0" y="70" width="30" height="30" />
                <rect x="5" y="75" width="20" height="20" fill="white" />
                <rect x="10" y="80" width="10" height="10" />

                <rect x="35" y="35" width="30" height="30" />
                <rect x="40" y="40" width="20" height="20" fill="white" />
                <rect x="45" y="45" width="10" height="10" />
                <rect x="50" y="15" width="10" height="10" />
                <rect x="15" y="50" width="10" height="10" />
                <rect x="75" y="50" width="10" height="10" />
              </svg>
            </div>

            <div className="space-y-1">
              <span className="text-lg font-black text-white tracking-wide block">{staffMember.fullName}</span>
              <span className="text-xs text-emerald-400 font-bold block">{staffMember.category} • {staffMember.department}</span>
              <span className="text-[11px] text-slate-400 font-mono block">{staffMember.organisation}</span>
            </div>

            {/* Zone Permissions */}
            <div className="p-3.5 rounded-2xl bg-navy-950 border border-navy-800 text-left space-y-1.5 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Authorized Zone Access Permissions:</span>
              <div className="flex flex-wrap gap-1.5">
                {staffMember.zonePermissions.split(', ').map((zone) => (
                  <span
                    key={zone}
                    className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-bold"
                  >
                    {zone}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-[10px] text-amber-300 font-mono">
              Sample dates only • no credential issued or tamper protection verified
            </div>

            <Link href="/gate/scanner" className="block pt-2">
              <Button variant="primary" className="w-full justify-center space-x-2">
                <QrCode className="w-4 h-4" />
                <span>Launch Gate Turnstile Scanner</span>
              </Button>
            </Link>
          </div>
        )}

        {/* TAB 2: SHIFT DUTY ASSIGNMENT */}
        {activeTab === 'ASSIGNMENTS' && (
          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-5 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Active Matchday Assignment</span>
              </h2>
              <Badge variant="success" size="sm">CONFIRMED ON ROSTER</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Event Fixture</span>
                <span className="font-bold text-white text-sm block">{currentAssignment.eventTitle}</span>
                <span className="font-mono text-emerald-400 text-[10px] block">{currentAssignment.eventReference}</span>
              </div>

              <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Duty Post:</span>
                  <span className="font-bold text-white">{currentAssignment.dutyStation}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Shift Schedule:</span>
                  <span className="font-mono text-emerald-400 font-bold">{currentAssignment.shiftDuration}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Report In By:</span>
                  <span className="font-mono text-white">{currentAssignment.reportingTime}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Duty Supervisor:</span>
                  <span className="font-semibold text-white">{currentAssignment.supervisor}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Radio Frequency:</span>
                  <span className="font-mono text-amber-400">{currentAssignment.radioChannel}</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800/80 text-[11px] text-slate-400 flex items-start space-x-2">
              <Radio className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p>
                In the event of crowd surges or radio network loss, immediately report in person to Sector Commander at Gate B Upper Deck.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: APPROVED TASKS CHECKLIST */}
        {activeTab === 'TASKS' && (
          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <ListTodo className="w-4 h-4 text-emerald-400" />
                <span>Duty Readiness Checklist</span>
              </h2>
              <span className="text-emerald-400 font-mono font-bold">
                {tasks.filter((t) => t.completed).length} / {tasks.length} Completed
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-start space-x-3 transition-all ${
                    task.completed
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-300'
                      : 'bg-navy-950 border-navy-800 text-white hover:border-slate-700'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                    task.completed
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'border-slate-600 bg-navy-900'
                  }`}>
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-xs ${task.completed ? 'line-through text-slate-400' : 'font-medium'}`}>
                    {task.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OPERATIONAL ANNOUNCEMENTS */}
        {activeTab === 'ANNOUNCEMENTS' && (
          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-sm font-bold text-white flex items-center space-x-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Operational Announcements</span>
              </h2>
              <Badge variant="warning" size="sm">LIVE DISPATCH</Badge>
            </div>

            <div className="space-y-3">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-3.5 rounded-2xl bg-navy-950 border border-navy-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{ann.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{ann.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{ann.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
