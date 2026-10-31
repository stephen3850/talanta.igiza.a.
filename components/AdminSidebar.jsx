'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  BookOpen,
  CreditCard,
  Users,
  Award,
  Smartphone,
  Activity,
  FileBarChart,
  Settings,
  Shield,
  Bell,
  Cpu,
  Sparkles,
  Car,
  Box,
  Building2,
  Zap,
  Droplets,
  Thermometer,
  ShieldAlert,
  Siren,
  Tv,
  Video,
  Wifi,
  Network,
  DoorOpen,
  Megaphone,
  Wrench,
  Globe,
  Share2,
  Bot,
  HardDrive,
  ShoppingCart,
  KeyRound,
  Database,
  X
} from 'lucide-react';

export default function AdminSidebar({ mobileOpen = false, setMobileOpen = () => {} }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Executive Intelligence', href: '/admin/executive', icon: Activity },
    { name: 'Facilities', href: '/admin/facilities', icon: Building2 },
    { name: 'Identity & Access Management', href: '/admin/identity', icon: KeyRound },
    { name: 'Data Governance & Privacy', href: '/admin/data-governance', icon: Database },
    { name: 'Emergency Operations Centre', href: '/admin/emergency-centre', icon: Siren },
    { name: 'Emergency Communications', href: '/admin/emergency-communications', icon: Megaphone },
    { name: 'Cybersecurity Operations Centre', href: '/admin/security-operations', icon: Shield },
    { name: 'Disaster Recovery & Backups', href: '/admin/disaster-recovery', icon: ShieldAlert },
    { name: 'Hardware Deployment & Commissioning', href: '/admin/hardware-deployment', icon: HardDrive },
    { name: 'Incident Management', href: '/admin/incidents', icon: ShieldAlert },
    { name: 'AI Visitor Assistant KB', href: '/admin/ai-assistant', icon: Bot },
    { name: 'API Gateway & Integrations', href: '/admin/integrations', icon: Share2 },
    { name: 'Asset Management', href: '/admin/assets', icon: Box },
    { name: 'Predictive Maintenance', href: '/admin/maintenance', icon: Wrench },
    { name: 'Network Operations (NOC)', href: '/admin/network-operations', icon: Network },
    { name: 'Smart Wi-Fi Management', href: '/admin/network-operations/wifi', icon: Wifi },
    { name: 'Digital Signage OS', href: '/admin/digital-signage', icon: Tv },
    { name: 'CCTV & Video Management', href: '/admin/cctv', icon: Video },
    { name: 'Physical Access Control', href: '/admin/access-control', icon: DoorOpen },
    { name: 'Building Management', href: '/admin/building-management', icon: Building2 },
    { name: 'Energy Monitoring', href: '/admin/energy', icon: Zap },
    { name: 'Water Management', href: '/admin/water', icon: Droplets },
    { name: 'Environmental Monitoring', href: '/admin/environment', icon: Thermometer },
    { name: 'Event Management', href: '/admin/events', icon: Calendar },
    { name: 'Ticket Credentials', href: '/admin/tickets', icon: Ticket },
    { name: 'Bookings & Sales', href: '/admin/bookings', icon: BookOpen },
    { name: 'Finance & Reconciliation', href: '/admin/finance', icon: CreditCard },
    { name: 'M-PESA Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Procurement & Suppliers', href: '/admin/procurement', icon: ShoppingCart },
    { name: 'Helpdesk & Support', href: '/admin/helpdesk', icon: Wrench },
    { name: 'Smart Parking OS', href: '/admin/parking', icon: Car },
    { name: 'Customer Accounts', href: '/admin/customers', icon: Users },
    { name: 'Staff & Accreditation', href: '/admin/staff', icon: Award },
    { name: 'Gate Operations', href: '/admin/gates', icon: Smartphone },
    { name: 'Crowd Safety & Density', href: '/admin/crowd-management', icon: Users },
    { name: 'IoT Smart Infrastructure', href: '/admin/iot', icon: Cpu },
    { name: '3D Digital Twin Platform', href: '/admin/digital-twin', icon: Box },
    { name: 'AI Predictive Intelligence', href: '/admin/ai-intelligence', icon: Sparkles },
    { name: 'Command Centre', href: '/admin/command', icon: Activity },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: FileBarChart },
    { name: 'Notification Gateway', href: '/admin/notifications', icon: Bell },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
    { name: 'Audit Logs', href: '/admin/audit-logs', icon: Shield },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-navy-900 border-r border-navy-800 z-50 transition-transform duration-300 flex flex-col justify-between ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
                TS
              </div>
              <div>
                <span className="font-extrabold text-white text-base tracking-tight block">
                  TALANTA
                </span>
                <span className="text-[10px] text-emerald-400 uppercase font-semibold tracking-wider block">
                  ADMIN OPERATING OS
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <nav className="space-y-1 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shadow-md shadow-emerald-500/5'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-navy-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-navy-800 text-[11px] text-slate-500 space-y-1">
          <div className="font-semibold text-slate-300">ST-Tech ICT Consultants</div>
          <div>Talanta Sports City OS v1.0</div>
        </div>
      </aside>
    </>
  );
}
