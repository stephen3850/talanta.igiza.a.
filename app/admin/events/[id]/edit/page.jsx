'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Button from '../../../../../components/Button';
import Badge from '../../../../../components/Badge';
import {
  ArrowLeft,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Globe,
  FileText
} from 'lucide-react';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [eventId, setEventId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Football');
  const [venue, setVenue] = useState('Main Bowl');
  const [organizer, setOrganizer] = useState('Ministry of Sports / FKF');
  const [contactInfo, setContactInfo] = useState('tickets@sports.go.ke');
  const [image, setImage] = useState('');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ticketSalesStart, setTicketSalesStart] = useState('');
  const [ticketSalesEnd, setTicketSalesEnd] = useState('');

  const [status, setStatus] = useState('PUBLISHED');
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      try {
        const res = await fetch(`/api/events/${params.id}`);
        const data = await res.json();
        if (data.success && data.event) {
          const evt = data.event;
          setEventId(evt.id);
          setTitle(evt.title || '');
          setSlug(evt.slug || '');
          setDescription(evt.description || '');
          setCategory(evt.category || 'Football');
          setVenue(evt.venue || 'Main Bowl');
          setOrganizer(evt.organizer || 'Ministry of Sports / FKF');
          setContactInfo(evt.contactInfo || 'tickets@sports.go.ke');
          setImage(evt.image || evt.bannerUrl || '');
          setStartDate(evt.startDate ? new Date(evt.startDate).toISOString().slice(0, 16) : '');
          setEndDate(evt.endDate ? new Date(evt.endDate).toISOString().slice(0, 16) : '');
          setTicketSalesStart(evt.ticketSalesStart ? new Date(evt.ticketSalesStart).toISOString().slice(0, 16) : '');
          setTicketSalesEnd(evt.ticketSalesEnd ? new Date(evt.ticketSalesEnd).toISOString().slice(0, 16) : '');
          setStatus(evt.status || 'DRAFT');
          setFeatured(Boolean(evt.featured || evt.isFeatured));
        }
      } catch (err) {
        setErrorMsg('Error loading event details');
      } finally {
        setIsLoading(false);
      }
    }
    loadEvent();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (new Date(endDate) <= new Date(startDate)) {
      setErrorMsg('Event End Date/Time must be after Start Date/Time.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        slug,
        description,
        category,
        venue,
        organizer,
        contactInfo,
        image,
        bannerUrl: image,
        startDate,
        endDate,
        ticketSalesStart,
        ticketSalesEnd,
        status,
        featured,
      };

      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/events');
      } else {
        setErrorMsg(data.message || 'Event update failed');
      }
    } catch (err) {
      setErrorMsg('Server connection error during event update');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-400">
        Loading event details for editing...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs text-slate-400 hover:text-white space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events Overview</span>
        </button>

        <Badge variant="success" size="sm">
          EDIT EVENT RECORD
        </Badge>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Event: {title}</h1>
          <p className="text-xs text-slate-400 mt-1">
            Update fixture details, change sales windows, or adjust publication status
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Event Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Public Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Football">Football</option>
                  <option value="Rugby">Rugby</option>
                  <option value="Athletics">Athletics</option>
                  <option value="Concerts">Concerts</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Community">Community</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Cover Image URL</label>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Event Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-navy-800">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-navy-800 flex items-center justify-between">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="PUBLISHED">PUBLISHED (Live on Public Site)</option>
                <option value="DRAFT">DRAFT (Private Admin Only)</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>

            <div className="flex space-x-3">
              <Button type="button" variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Update Event
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
