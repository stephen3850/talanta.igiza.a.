'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import {
  Calendar,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Globe,
  FileText
} from 'lucide-react';

export default function CreateEventPage() {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Football');
  const [venue, setVenue] = useState('Main Bowl');
  const [organizer, setOrganizer] = useState('Ministry of Sports / FKF');
  const [contactInfo, setContactInfo] = useState('tickets@sports.go.ke');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop');

  const [startDate, setStartDate] = useState('2026-12-01T16:00');
  const [endDate, setEndDate] = useState('2026-12-01T19:00');
  const [ticketSalesStart, setTicketSalesStart] = useState('2026-11-01T08:00');
  const [ticketSalesEnd, setTicketSalesEnd] = useState('2026-12-01T14:00');

  const [status, setStatus] = useState('PUBLISHED');
  const [featured, setFeatured] = useState(false);

  // Ticket Categories Setup
  const [gaPrice, setGaPrice] = useState(1000);
  const [gaCapacity, setGaCapacity] = useState(45000);
  const [vipPrice, setVipPrice] = useState(3500);
  const [vipCapacity, setVipCapacity] = useState(10000);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-generate slug from title if slug not manually edited
  const handleTitleChange = (val) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(autoSlug);
  };

  // Handle Cover Image Upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setImage(data.imageUrl);
      } else {
        setErrorMsg(data.message || 'Image upload failed');
      }
    } catch (err) {
      setErrorMsg('Image upload server error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Date Relationships Validation
    if (new Date(endDate) <= new Date(startDate)) {
      setErrorMsg('Event End Date/Time must be after Start Date/Time.');
      return;
    }

    if (new Date(ticketSalesEnd) > new Date(startDate)) {
      setErrorMsg('Ticket Sales Closing Date should be before or at event Start Time.');
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
        categories: [
          { name: 'General Admission', price: Number(gaPrice), capacity: Number(gaCapacity), available: Number(gaCapacity) },
          { name: 'VIP Pavilion', price: Number(vipPrice), capacity: Number(vipCapacity), available: Number(vipCapacity) },
        ],
      };

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/admin/events');
      } else {
        setErrorMsg(data.message || 'Event creation failed');
      }
    } catch (err) {
      setErrorMsg('Server connection error during event creation');
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
          <span>Back to Events Overview</span>
        </button>

        <Badge variant="success" size="sm">
          ADMIN EVENT CREATOR
        </Badge>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Stadium Event</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure event details, cover imagery, sales windows, and seating category pricing
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Core Details */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              1. Event Overview & Public URL
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Event Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Kenya Shujaa vs Uganda - Safari Sevens 2026"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Public Slug (URL Identifier) *
                </label>
                <div className="flex items-center bg-navy-950 border border-navy-700 rounded-xl overflow-hidden focus-within:border-emerald-500">
                  <span className="text-[11px] text-slate-500 px-3 bg-navy-900 border-r border-navy-800">
                    /events/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
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
              <label className="text-xs font-medium text-slate-300 block mb-1">Event Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Match description, participating teams, and stadium rules..."
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>
          </div>

          {/* Section 2: Cover Poster Image */}
          <div className="space-y-3 pt-4 border-t border-navy-800">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              2. Cover Poster Image
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              <div className="sm:col-span-8 space-y-2">
                <label className="text-xs font-medium text-slate-300 block">
                  Cover Image URL or File Upload
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                <div className="flex items-center space-x-3">
                  <label className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-xs text-slate-200 cursor-pointer border border-navy-700">
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Upload Local File</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {isUploading && <span className="text-xs text-slate-400">Uploading...</span>}
                </div>
              </div>

              <div className="sm:col-span-4">
                <div className="h-28 rounded-xl border border-navy-800 overflow-hidden bg-navy-950 relative">
                  <img
                    src={image}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-2 text-[9px] bg-navy-950/80 px-1.5 py-0.5 rounded text-slate-300">
                    Preview
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Schedule Dates & Times */}
          <div className="space-y-4 pt-4 border-t border-navy-800">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              3. Matchday & Ticket Sales Schedule
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Event Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Event End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Ticket Sales Opening Date
                </label>
                <input
                  type="datetime-local"
                  value={ticketSalesStart}
                  onChange={(e) => setTicketSalesStart(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Ticket Sales Closing Date
                </label>
                <input
                  type="datetime-local"
                  value={ticketSalesEnd}
                  onChange={(e) => setTicketSalesEnd(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Venue & Organizer Details */}
          <div className="space-y-4 pt-4 border-t border-navy-800">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              4. Venue & Organizer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Venue Location</label>
                <input
                  type="text"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Main Bowl"
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Organizer</label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="Ministry of Sports / FKF"
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Contact Info</label>
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="tickets@sports.go.ke"
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Ticket Category Pricing */}
          <div className="space-y-4 pt-4 border-t border-navy-800">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              5. Ticket Categories & Pricing Setup
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-navy-950 p-4 rounded-2xl border border-navy-800">
              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">General Admission Category</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={gaPrice}
                    onChange={(e) => setGaPrice(e.target.value)}
                    placeholder="Price KES"
                    className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="number"
                    value={gaCapacity}
                    onChange={(e) => setGaCapacity(e.target.value)}
                    placeholder="Capacity Seats"
                    className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold text-white block">VIP Category</span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={vipPrice}
                    onChange={(e) => setVipPrice(e.target.value)}
                    placeholder="Price KES"
                    className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="number"
                    value={vipCapacity}
                    onChange={(e) => setVipCapacity(e.target.value)}
                    placeholder="Capacity Seats"
                    className="bg-navy-900 border border-navy-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Status & Publishing Options */}
          <div className="pt-4 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-6">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Event Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="PUBLISHED">PUBLISHED (Live on Website)</option>
                  <option value="DRAFT">DRAFT (Private Admin Only)</option>
                </select>
              </div>

              <label className="flex items-center space-x-2 pt-5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-navy-700 bg-navy-950 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Feature on Homepage Hero</span>
              </label>
            </div>

            <div className="flex space-x-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                className="space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Event Record</span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
