'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  Video,
  Plus,
  ArrowLeft,
  RefreshCw,
  Search,
  CheckCircle2,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Film,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminSignageContentPage() {
  const [contentItems, setContentItems] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload/Add Content Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('WAYFINDING');
  const [mediaUrl, setMediaUrl] = useState('/images/content/gate_b_wayfinding.png');
  const [durationSeconds, setDurationSeconds] = useState('15');
  const [resolution, setResolution] = useState('3840x2160');
  const [tagsInput, setTagsInput] = useState('WAYFINDING, GATE_B, MATCHDAY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchContent = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== 'ALL') params.append('type', selectedType);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/digital-signage/content?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setContentItems(json.contentItems);
        setContentTypes(json.contentTypes);
      }
    } catch (err) {
      console.error('Failed to load content items:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [selectedType]);

  const handleAddContentSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await fetch('/api/digital-signage/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type,
          mediaUrl,
          durationSeconds: Number(durationSeconds),
          resolution,
          tags,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to create content item.');
      }

      setIsModalOpen(false);
      setTitle('');
      fetchContent();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <Link href="/admin/digital-signage">
            <button className="w-9 h-9 rounded-xl bg-navy-950 border border-navy-800 text-slate-400 hover:text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Badge variant="success" size="sm">CONTENT LIBRARY</Badge>
              <span className="text-[10px] text-slate-400 font-mono">{contentItems.length} Assets Approved</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Signage Media Library & Content Assets
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Upload Content Asset</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchContent}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search content title, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchContent()}
            className="w-full bg-navy-950 border border-navy-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-semibold">Asset Type:</span>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-navy-950 border border-navy-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Asset Types</option>
            {contentTypes.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentItems.map((c) => (
          <div
            key={c.id}
            className="bg-navy-900 border border-navy-800 hover:border-slate-700 transition-all rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Media Preview Box */}
              <div className="h-36 bg-navy-950 border-b border-navy-800 relative flex items-center justify-center p-4">
                <div className="text-center space-y-1">
                  {c.mediaUrl.endsWith('.mp4') ? (
                    <Film className="w-8 h-8 text-sky-400 mx-auto" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-emerald-400 mx-auto" />
                  )}
                  <span className="font-mono text-[10px] text-slate-400 block font-semibold">{c.resolution}</span>
                </div>

                <div className="absolute top-2 right-2">
                  <Badge variant="success" size="sm">{c.type.replace('_', ' ')}</Badge>
                </div>

                <div className="absolute bottom-2 left-2 bg-navy-900/90 backdrop-blur-sm border border-navy-800 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                  Duration: {c.durationSeconds > 0 ? `${c.durationSeconds}s` : 'Continuous'}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <span className="font-mono text-[10px] font-bold text-emerald-400">{c.id}</span>
                  <h3 className="font-bold text-white text-xs mt-0.5">{c.title}</h3>
                </div>

                <div className="flex flex-wrap gap-1">
                  {c.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-navy-950 border border-navy-800 text-[9px] font-mono text-slate-400">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-navy-950/60 border-t border-navy-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Approved by: {c.approvedBy}</span>
              <span className="text-emerald-400">{c.approvalStatus}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Upload/Add Content Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload & Register Content Asset"
      >
        <form onSubmit={handleAddContentSubmit} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Content Title *</label>
            <input
              type="text"
              placeholder="e.g. Turnstile Gate B Concourse Directional Map"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Asset Category Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {contentTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Display Duration (Seconds)</label>
              <input
                type="number"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Media File Path / URL (.jpg, .png, .mp4) *</label>
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Target Resolution</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="3840x2160">3840x2160 (4K UHD)</option>
                <option value="1920x1080">1920x1080 (FHD)</option>
                <option value="5760x1080">5760x1080 (LED Ribbon)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold block">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              Upload & Approve
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
