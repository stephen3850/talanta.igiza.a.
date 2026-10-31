'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import {
  Award,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building2,
  ShieldCheck
} from 'lucide-react';

export default function CreateStaffAccreditationPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [idNumber, setIdNumber] = useState('28491029');
  const [organisation, setOrganisation] = useState('G4S Secure Solutions');
  const [department, setDepartment] = useState('Security & Stewards');
  const [roleTitle, setRoleTitle] = useState('Perimeter Security Lead');
  const [category, setCategory] = useState('SECURITY');

  const [selectedZones, setSelectedZones] = useState([
    'Zone A',
    'VIP Canopy',
    'Control Room',
  ]);

  const [validFrom, setValidFrom] = useState('2026-01-01');
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [status, setStatus] = useState('APPROVED');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const allZones = [
    'Zone A (Outer Perimeter)',
    'Zone B (Main Concourse)',
    'VIP Canopy & Hospitality',
    'VVIP Presidential Suite',
    'Pitch Side & Technical Area',
    'Media Centre & Broadcast',
    'Command & Control Room',
    'Server & Telecom Room',
  ];

  const handleZoneToggle = (zone) => {
    if (selectedZones.includes(zone)) {
      setSelectedZones(selectedZones.filter((z) => z !== zone));
    } else {
      setSelectedZones([...selectedZones, zone]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !roleTitle) {
      setErrorMsg('Full name and role title are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        fullName,
        email,
        phoneNumber,
        idNumber,
        organisation,
        department,
        roleTitle,
        category,
        zonePermissions: selectedZones.join(', '),
        validFrom,
        validUntil,
        status,
      };

      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/staff');
      } else {
        setErrorMsg(data.message || 'Registration failed');
      }
    } catch (err) {
      setErrorMsg('Server connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs text-slate-400 hover:text-white space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workforce Directory</span>
        </button>

        <Badge variant="success" size="sm">
          WORKFORCE REGISTRATION
        </Badge>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Register Workforce Member</h1>
          <p className="text-xs text-slate-400 mt-1">
            Capture personnel credentials, assign employer organization, and select authorized access zones
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              1. Personal & Employer Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Capt. James Mwangi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">National ID / Passport Number</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="james.m@g4s.co.ke"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Role & Category */}
          <div className="space-y-4 pt-4 border-t border-navy-800">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              2. Role & Employer Classification
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Employer / Organization</label>
                <input
                  type="text"
                  required
                  placeholder="G4S / ST-Tech / FKF"
                  value={organisation}
                  onChange={(e) => setOrganisation(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Chief Gate Lead / Senior Admin"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Workforce Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="STADIUM_EMPLOYEE">Stadium Employee</option>
                  <option value="SECURITY">Security Personnel</option>
                  <option value="EVENT_ORGANIZER">Event Organizer</option>
                  <option value="CONTRACTOR">Contractor</option>
                  <option value="VENDOR">Vendor / Concession</option>
                  <option value="TECHNICAL">Technical / ICT</option>
                  <option value="MEDICAL_EMERGENCY">Medical & Emergency</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Access Zone Permissions */}
          <div className="space-y-4 pt-4 border-t border-navy-800">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              3. Assigned Stadium Access Zones
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-navy-950 p-4 rounded-2xl border border-navy-800">
              {allZones.map((zone) => {
                const zoneShort = zone.split(' ')[0];
                const isSelected = selectedZones.includes(zoneShort);
                return (
                  <label
                    key={zone}
                    onClick={() => handleZoneToggle(zoneShort)}
                    className={`p-3 rounded-xl border cursor-pointer text-xs font-medium flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500 text-white'
                        : 'bg-navy-900 border-navy-800 text-slate-400 hover:border-navy-700'
                    }`}
                  >
                    <span>{zone}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded border-navy-700 bg-navy-950 text-emerald-500"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 4: Validity & Approval */}
          <div className="space-y-4 pt-4 border-t border-navy-800">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              4. Accreditation Validity & Status
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Valid From Date</label>
                <input
                  type="date"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Valid Until Date</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Approval Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="APPROVED">APPROVED (Active Pass)</option>
                  <option value="PENDING">PENDING (Under Review)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-navy-800 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>

            <Button type="submit" variant="primary" isLoading={isSubmitting} className="space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Issue Workforce Accreditation</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
