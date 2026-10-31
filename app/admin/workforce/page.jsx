'use client';

import React, { useState } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import Modal from '../../../components/Modal';
import { initialStaffAccreditation } from '../../../lib/mockData';
import { Users, Plus, ShieldCheck, Search, Key, UserCheck } from 'lucide-react';

export default function WorkforceManagementPage() {
  const [staffList, setStaffList] = useState(initialStaffAccreditation);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Accreditation Form
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [organisation, setOrganisation] = useState('G4S Security');
  const [roleTitle, setRoleTitle] = useState('Perimeter Steward');
  const [zones, setZones] = useState('Outer Gates A-D');

  const handleCreateAccreditation = (e) => {
    e.preventDefault();
    const newStaff = {
      id: `ACC-00${staffList.length + 1}`,
      accreditationNo: `TAL-STF-2026-${Math.floor(Math.random() * 900 + 100)}`,
      fullName,
      idNumber,
      organisation,
      roleTitle,
      zonePermissions: zones,
      validFrom: '2026-10-01',
      validUntil: '2026-12-31',
      status: 'ACTIVE',
    };

    setStaffList([newStaff, ...staffList]);
    setIsModalOpen(false);
    setFullName('');
    setIdNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            WORKFORCE & ZONE ACCESS PERMISSIONS
          </Badge>
          <h1 className="text-2xl font-bold text-white">Staff & Contractor Accreditation</h1>
          <p className="text-xs text-slate-400">Issue matchday credentials, assign zone access rights, and monitor workforce shifts</p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} className="space-x-2">
          <Plus className="w-4 h-4" />
          <span>Issue Accreditation Pass</span>
        </Button>
      </div>

      {/* Staff Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Accreditation No</th>
                <th className="p-4">Full Name & National ID</th>
                <th className="p-4">Organisation & Role</th>
                <th className="p-4">Zone Access Permissions</th>
                <th className="p-4">Valid Until</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {staffList.map((st) => (
                <tr key={st.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-emerald-400">{st.accreditationNo}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{st.fullName}</div>
                    <div className="text-[10px] text-slate-400">ID: {st.idNumber}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium">{st.roleTitle}</div>
                    <div className="text-[10px] text-slate-400">{st.organisation}</div>
                  </td>
                  <td className="p-4 font-mono text-emerald-300">{st.zonePermissions}</td>
                  <td className="p-4 text-slate-400">{st.validUntil}</td>
                  <td className="p-4">
                    <Badge variant={st.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {st.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Issue Accreditation */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Issue Staff Accreditation Pass">
        <form onSubmit={handleCreateAccreditation} className="space-y-4">
          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Inspector Peter Ochieng"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">National ID / Passport</label>
              <input
                type="text"
                required
                placeholder="29481029"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 font-medium block mb-1">Organisation</label>
              <input
                type="text"
                required
                value={organisation}
                onChange={(e) => setOrganisation(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-300 font-medium block mb-1">Permitted Zone Rights</label>
            <input
              type="text"
              required
              value={zones}
              onChange={(e) => setZones(e.target.value)}
              placeholder="e.g. Zone A, VIP, Control Room, Pitch Side"
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Issue Pass
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
