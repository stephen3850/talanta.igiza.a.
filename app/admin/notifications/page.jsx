'use client';

import React, { useState } from 'react';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import { initialNotifications } from '../../../lib/notifications';
import { maskPhoneNumber } from '../../../lib/payments';
import {
  Bell,
  Send,
  Mail,
  Smartphone,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck
} from 'lucide-react';

export default function AdminNotificationDispatcherPage() {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [recipientEmail, setRecipientEmail] = useState('patron@example.com');
  const [category, setCategory] = useState('ANNOUNCEMENT');
  const [title, setTitle] = useState('Matchday Gate Access Advisory');
  const [message, setMessage] = useState('Gates open at 12:00 PM EAT. Please have your dynamic QR code ready for optical scanning at Gate A.');

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setIsDispatching(true);

    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: recipientEmail,
          category,
          title,
          message,
        }),
      });

      const data = await res.json();
      if (data.success && data.notification) {
        setNotifications((prev) => [data.notification, ...prev]);
        setDispatchSuccess(true);
        setTimeout(() => setDispatchSuccess(false), 3000);
      }
    } catch (err) {
      alert('Error dispatching notification');
    } finally {
      setIsDispatching(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            STADIUM COMMUNICATION GATEWAY
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Notification & Communication Management
          </h1>
          <p className="text-xs text-slate-400">
            Monitor email and SMS delivery logs, dispatch operational announcements, and track delivery status.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Broadcast Dispatcher Form */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-4 max-w-3xl">
        <h2 className="text-base font-bold text-white flex items-center space-x-2">
          <Send className="w-5 h-5 text-emerald-400" />
          <span>Dispatch Custom Operational Announcement</span>
        </h2>

        {dispatchSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Operational broadcast notification dispatched successfully!</span>
          </div>
        )}

        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Target Email Address</label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="ANNOUNCEMENT">Matchday Announcement</option>
                <option value="SECURITY">Security Advisory</option>
                <option value="TICKETING">Ticketing Update</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Subject / Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">Message Content</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <Button type="submit" variant="primary" isLoading={isDispatching} className="space-x-2">
            <Send className="w-4 h-4" />
            <span>Send Broadcast Notification</span>
          </Button>
        </form>
      </div>

      {/* Notification Dispatch Logs Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-navy-800">
          <h3 className="text-sm font-bold text-white">System Delivery Logs</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Notification ID</th>
                <th className="p-4">Recipient Email</th>
                <th className="p-4">Category & Title</th>
                <th className="p-4">Delivery Status</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-navy-850/50 transition-colors">
                  <td className="p-4 font-mono font-bold text-emerald-400">{n.id}</td>
                  <td className="p-4 text-white font-medium">{n.userEmail}</td>
                  <td className="p-4">
                    <div className="font-bold text-white">{n.title}</div>
                    <div className="text-[10px] text-slate-400">{n.category}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={n.deliveryStatus === 'DELIVERED' ? 'success' : 'danger'}>
                      {n.deliveryStatus}
                    </Badge>
                  </td>
                  <td className="p-4 text-slate-400 font-mono text-[11px]">
                    {new Date(n.createdAt).toLocaleString()}
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
