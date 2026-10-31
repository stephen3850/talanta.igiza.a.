'use client';

import React from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminHeader from '../../components/AdminHeader';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-navy-950 text-slate-100">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Talanta Stadium Operations Console" subtitle="ST-Tech ICT Platform • Ministry of Sports" />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
