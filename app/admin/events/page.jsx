'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import StatCard from '../../../components/StatCard';
import Modal from '../../../components/Modal';
import { initialEvents } from '../../../lib/mockData';
import { formatDate } from '../../../lib/utils';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Globe,
  FileText,
  CheckCircle,
  Archive,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export default function AdminEventsOverviewPage() {
  const [events, setEvents] = useState(initialEvents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (err) {
      console.warn('Using local events state');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filtered Events List
  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.eventCode.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'ALL' ||
      evt.category.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' || evt.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate Overview Stats
  const totalEvents = events.length;
  const publishedCount = events.filter((e) => e.status === 'PUBLISHED').length;
  const draftCount = events.filter((e) => e.status === 'DRAFT').length;
  const upcomingCount = events.filter(
    (e) => new Date(e.startDate) > new Date()
  ).length;
  const completedCount = events.filter(
    (e) => e.status === 'COMPLETED' || new Date(e.endDate) < new Date()
  ).length;

  // Toggle Publish / Unpublish Status
  const handleTogglePublish = async (evt) => {
    const newStatus = evt.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/events/${evt.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) =>
          prev.map((item) =>
            item.id === evt.id ? { ...item, status: newStatus } : item
          )
        );
      }
    } catch (err) {
      alert('Error updating event status');
    }
  };

  // Confirm Delete
  const confirmDelete = async () => {
    if (!eventToDelete) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/events/${eventToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) => prev.filter((e) => e.id !== eventToDelete.id));
        setDeleteModalOpen(false);
        setEventToDelete(null);
      }
    } catch (err) {
      alert('Error deleting event');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div>
          <Badge variant="success" size="sm" className="mb-1">
            STADIUM FIXTURE & CONTENT SUITE
          </Badge>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Event Management System
          </h1>
          <p className="text-xs text-slate-400">
            Create, edit, publish, and manage matchday events for Talanta Stadium.
          </p>
        </div>

        <div className="flex space-x-3">
          <Button variant="secondary" size="sm" onClick={fetchEvents}>
            <RefreshCw className="w-4 h-4" />
          </Button>

          <Link href="/admin/events/create">
            <Button variant="primary" className="space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create New Event</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Events"
          value={totalEvents.toString()}
          subtitle="All Stadium Fixtures"
          icon={Calendar}
          accentColor="emerald"
        />

        <StatCard
          title="Published"
          value={publishedCount.toString()}
          subtitle="Live on Website"
          icon={Globe}
          accentColor="emerald"
        />

        <StatCard
          title="Drafts"
          value={draftCount.toString()}
          subtitle="In Review / Pending"
          icon={FileText}
          accentColor="gold"
        />

        <StatCard
          title="Upcoming"
          value={upcomingCount.toString()}
          subtitle="Future Matchdays"
          icon={CheckCircle}
          accentColor="sky"
        />

        <StatCard
          title="Completed"
          value={completedCount.toString()}
          subtitle="Past Events"
          icon={Archive}
          accentColor="red"
        />
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by title, slug, or event code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-navy-950 border border-navy-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Categories</option>
              <option value="Football">Football</option>
              <option value="Rugby">Rugby</option>
              <option value="Athletics">Athletics</option>
              <option value="Concerts">Concerts</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Community">Community</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-navy-950 border border-navy-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Events Data Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 text-slate-400 font-semibold border-b border-navy-800 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Cover / Event Details</th>
                <th className="p-4">Public Slug URL</th>
                <th className="p-4">Category & Venue</th>
                <th className="p-4">Start Date & Time</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No matching events found. Try adjusting your search query or filters.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-navy-850/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={evt.image || evt.bannerUrl}
                          alt={evt.title}
                          className="w-12 h-12 rounded-xl object-cover border border-navy-800 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white">{evt.title}</div>
                          <div className="font-mono text-[10px] text-emerald-400">
                            {evt.eventCode}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      /events/{evt.slug}
                    </td>

                    <td className="p-4">
                      <div className="text-white font-medium">{evt.category}</div>
                      <div className="text-[10px] text-slate-400">{evt.venue}</div>
                    </td>

                    <td className="p-4 text-slate-300">
                      {formatDate(evt.startDate)}
                    </td>

                    <td className="p-4">
                      <Badge
                        variant={
                          evt.status === 'PUBLISHED'
                            ? 'success'
                            : evt.status === 'DRAFT'
                            ? 'pending'
                            : 'danger'
                        }
                      >
                        {evt.status}
                      </Badge>
                    </td>

                    <td className="p-4 text-right space-x-2">
                      {/* View Public Link if Published */}
                      {evt.status === 'PUBLISHED' && (
                        <Link href={`/events/${evt.slug}`} target="_blank">
                          <button
                            title="View Public Page"
                            className="p-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 text-slate-300 border border-navy-800"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      )}

                      {/* Toggle Publish / Unpublish */}
                      <button
                        title={evt.status === 'PUBLISHED' ? 'Unpublish Event' : 'Publish Event'}
                        onClick={() => handleTogglePublish(evt)}
                        className={`p-1.5 rounded-lg border ${
                          evt.status === 'PUBLISHED'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Event */}
                      <Link href={`/admin/events/${evt.id}/edit`}>
                        <button
                          title="Edit Event"
                          className="p-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 text-slate-300 border border-navy-800"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </Link>

                      {/* Delete Event Confirmation Modal Trigger */}
                      <button
                        title="Delete Event"
                        onClick={() => {
                          setEventToDelete(evt);
                          setDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Event Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-red-400 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-xs">
              This action will permanently delete the event record from the system.
            </p>
          </div>

          <p className="text-xs text-slate-300">
            Are you sure you want to delete event{' '}
            <strong className="text-white">"{eventToDelete?.title}"</strong> (
            <span className="font-mono text-emerald-400">{eventToDelete?.eventCode}</span>)?
          </p>

          <div className="pt-2 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={isProcessing}
            >
              Confirm Permanent Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
