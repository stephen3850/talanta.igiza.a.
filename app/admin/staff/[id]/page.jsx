'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import { initialStaffAccreditation } from '../../../../lib/mockData';
import { generateQRSVGDataUri } from '../../../../lib/tickets';
import { maskPhoneNumber } from '../../../../lib/payments';
import {
  Award,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Calendar,
  XCircle,
  Printer,
  QrCode
} from 'lucide-react';

export default function SingleStaffPassViewPage() {
  const params = useParams();
  const router = useRouter();

  const [staff, setStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetch(`/api/staff/${params.id}`);
        const data = await res.json();
        if (data.success && data.staff) {
          setStaff(data.staff);
        } else {
          const fallback = initialStaffAccreditation.find(
            (s) => s.id === params.id || s.accreditationNo === params.id
          );
          if (fallback) setStaff(fallback);
        }
      } catch (err) {
        console.warn('Fallback workforce search');
      } finally {
        setIsLoading(false);
      }
    }
    loadStaff();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading workforce accreditation profile...
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="p-8 text-center space-y-4">
        <Badge variant="danger" size="md">RECORD NOT FOUND</Badge>
        <h1 className="text-xl font-bold text-white">Workforce Pass Not Found</h1>
        <Button variant="primary" onClick={() => router.push('/admin/staff')}>
          Back to Workforce Directory
        </Button>
      </div>
    );
  }

  const qrSvg = generateQRSVGDataUri(staff.accreditationNo);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs text-slate-400 hover:text-white space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workforce Directory</span>
        </button>

        <Badge variant={staff.status === 'APPROVED' ? 'success' : 'danger'} size="sm">
          {staff.status} ACCREDITATION
        </Badge>
      </div>

      {/* Digital Staff Pass Card */}
      <div className="bg-navy-900 border-2 border-emerald-500/50 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        <div className="border-b border-navy-800 pb-4">
          <Badge variant="success" size="sm" className="mb-2">
            OFFICIAL WORKFORCE CREDENTIAL
          </Badge>
          <h1 className="text-2xl font-black text-white tracking-tight">{staff.fullName}</h1>
          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider mt-1">
            {staff.roleTitle} • {staff.organisation}
          </p>
        </div>

        {/* QR Credential */}
        <div className="bg-white p-5 rounded-2xl inline-block shadow-inner max-w-[200px] mx-auto border-4 border-emerald-500">
          <img src={qrSvg} alt="Staff Pass QR" className="w-36 h-36 mx-auto" />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Accreditation Reference</span>
          <span className="font-mono text-base font-bold text-emerald-400">{staff.accreditationNo}</span>
        </div>

        {/* Authorized Access Zones */}
        <div className="bg-navy-950 p-4 rounded-2xl border border-navy-800 space-y-2 text-left">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">
            Authorized Access Zones
          </span>
          <div className="font-mono text-xs font-bold text-emerald-300">
            {staff.zonePermissions}
          </div>
        </div>

        {/* Validity & Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs text-left bg-navy-950 p-4 rounded-2xl border border-navy-800">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Department</span>
            <span className="font-bold text-white">{staff.department || 'Operations'}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Category</span>
            <span className="font-bold text-white">{staff.category || 'STADIUM_EMPLOYEE'}</span>
          </div>

          <div className="col-span-2 border-t border-navy-800 pt-2">
            <span className="text-slate-500 block text-[10px] uppercase">Accreditation Validity</span>
            <span className="font-medium text-white">{staff.validFrom} to {staff.validUntil}</span>
          </div>
        </div>

        <div className="pt-2 flex justify-center space-x-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print Badge Credential</span>
          </button>
        </div>
      </div>
    </div>
  );
}
