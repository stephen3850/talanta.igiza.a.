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
  const [competition, setCompetition] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Football');
  const [venue, setVenue] = useState('Raila Odinga International Stadium, Talanta Sports City, Nairobi');
  const [organizer, setOrganizer] = useState('Confederation of African Football (CAF) / FKF');
  const [contactInfo, setContactInfo] = useState('events@talanta.go.ke');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop');

  const [startDate, setStartDate] = useState('2027-01-05T18:00');
  const [endDate, setEndDate] = useState('2027-01-05T21:00');
  const [displayDate, setDisplayDate] = useState('TUE., JAN. 5, 2027 / 6 PM EAT');

  const [status, setStatus] = useState('PROPOSED');
  const [ticketApproved, setTicketApproved] = useState(false);
  const [featured, setFeatured] = useState(false);

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

  // Handle Image Upload
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

    if (new Date(endDate) <= new Date(startDate)) {
      setErrorMsg('Event End Date/Time must be after Start Date/Time.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title,
        slug,
        competition,
        description,
        category,
        venue,
        organizer,
        contactInfo,
        image,
        bannerUrl: image,
        startDate,
        endDate,
        displayDate,
        status,
        ticketApproved,
        featured,
        categories: ticketApproved ? [
          { name: 'General Admission', price: 1000, capacity: 45000, available: 45000 },
          { name: 'VIP Pavilion', price: 3500, capacity: 10000, available: 10000 },
        ] : [],
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
    <div className="space-y-6 max-w-4xl mx-auto font-sans">
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
            Configure event details, provisional statuses, cover imagery, and venue details
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
              1. Event Overview & Title
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Event Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. BAYERN MUNICH VS. AJAX"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Competition / Tournament Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Official Inaugural Test Match or AFCON 2027"
                  value={competition}
                  onChange={(e) => setCompetition(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
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
                  <option value="Soccer">Soccer</option>
                  <option value="Rugby">Rugby</option>
                  <option value="Athletics">Athletics</option>
                  <option value="Concerts">Concerts</option>
                  <option value="Tours">Tours</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

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
              <label className="text-xs font-medium text-slate-300 block mb-1">Event Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A proposed test match or tournament fixture details..."
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

          {/* Section 3: Schedule Dates & Venue */}
          <div className="space-y-4 pt-4 border-t border-navy-800">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              3. Matchday Date & Venue Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Display Date String</label>
                <input
                  type="text"
                  value={displayDate}
                  onChange={(e) => setDisplayDate(e.target.value)}
                  placeholder="TUE., JAN. 5, 2027 / 6 PM EAT"
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Start Date/Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">End Date/Time *</label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Venue Location *</label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Raila Odinga International Stadium, Talanta Sports City, Nairobi"
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Status Category & Ticket Approval */}
          <div className="pt-4 border-t border-navy-800 space-y-4">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              4. Event Status Category & Ticketing Configuration
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Status Category *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <option value="PROPOSED">PROPOSED (Provisional Test / Match)</option>
                  <option value="AWAITING_CONFIRMATION">AWAITING CONFIRMATION</option>
                  <option value="CANDIDATE_VENUE">CANDIDATE VENUE</option>
                  <option value="CONFIRMED">CONFIRMED (Approved Matchday)</option>
                  <option value="PUBLISHED">PUBLISHED (Live Ticket Sales)</option>
                  <option value="DRAFT">DRAFT (Admin Only)</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="POSTPONED">POSTPONED</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ticketApproved}
                    onChange={(e) => setTicketApproved(e.target.checked)}
                    className="rounded border-navy-700 bg-navy-950 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="font-bold text-white">Approve Event for Live Ticket Sales</span>
                </label>
                <p className="text-[10px] text-slate-400">
                  When unchecked, the event displays "AWAITING CONFIRMATION" instead of "BUY TICKETS".
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-navy-800 flex justify-end space-x-3">
            <Button type="button" variant="secondary" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} className="space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Save Event Record</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
