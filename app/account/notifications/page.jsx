'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { initialNotifications } from '../../../lib/notifications';
import {
  Bell,
  CheckCircle2,
  Mail,
  Smartphone,
  ShieldCheck,
  Check,
  Search,
  Filter,
  ArrowLeft,
  Settings
} from 'lucide-react';

export default function PatronNotificationCenterPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?email=patron@example.com');
      const data = await res.json();
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn('Using local notification state');
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail: 'patron@example.com', markAllRead: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Error marking read');
    }
  };

  const filtered = notifications.filter(
    (n) => selectedCategory === 'ALL' || n.category === selectedCategory
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Badge variant="success" size="sm">PATRON NOTIFICATION CENTER</Badge>
                {unreadCount > 0 && (
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} Unread
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white mt-1">Communications & Updates</h1>
            </div>
          </div>

          <div className="flex space-x-3">
            {unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={handleMarkAllRead} className="space-x-1">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Mark All Read</span>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Notification Feed */}
          <div className="lg:col-span-8 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white">In-App Notification Feed</h2>

              {/* Category Filter */}
              <div className="flex items-center space-x-2 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="TICKETING">Ticketing</option>
                  <option value="SECURITY">Security</option>
                  <option value="SYSTEM">System Alerts</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No notifications in this category.
                </div>
              ) : (
                filtered.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2 ${
                      !notif.read
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-navy-950 border-navy-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        )}
                        <span className="font-bold text-white">{notif.title}</span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-400">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{notif.message}</p>

                    <div className="pt-2 border-t border-navy-800/80 flex items-center justify-between text-[10px]">
                      <Badge variant="navy" size="sm">{notif.category}</Badge>
                      <span className="text-emerald-400 font-mono">{notif.deliveryStatus}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Communication Preferences */}
          <div className="lg:col-span-4 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="border-b border-navy-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <Settings className="w-4 h-4 text-emerald-400" />
                <span>Notification Preferences</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Control how you receive matchday alerts</p>
            </div>

            <div className="space-y-4 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-navy-950 border border-navy-800 cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <Mail className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white block">Email E-Ticket Confirmations</span>
                    <span className="text-[10px] text-slate-400">Receive HTML tickets & receipts</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-navy-700 bg-navy-900 text-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-navy-950 border border-navy-800 cursor-pointer">
                <div className="flex items-center space-x-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="font-bold text-white block">Safaricom SMS Payment Alerts</span>
                    <span className="text-[10px] text-slate-400">Receive M-PESA SMS receipts</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="rounded border-navy-700 bg-navy-900 text-emerald-500"
                />
              </label>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
