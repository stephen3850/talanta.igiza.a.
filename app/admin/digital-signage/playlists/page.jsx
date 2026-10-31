'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '../../../../components/Button';
import Badge from '../../../../components/Badge';
import Modal from '../../../../components/Modal';
import {
  Layers,
  Plus,
  ArrowLeft,
  RefreshCw,
  Play,
  Pause,
  Clock,
  Tv,
  CheckCircle2,
  ListOrdered,
  Sparkles,
  Monitor
} from 'lucide-react';

export default function AdminSignagePlaylistsPage() {
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated Player State (Requirement 9)
  const [activePlayerPlaylist, setActivePlayerPlaylist] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Create Playlist Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetCategory, setTargetCategory] = useState('CONCOURSE_WAYFINDING');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlaylists = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/digital-signage/playlists');
      const json = await res.json();
      if (json.success) {
        setPlaylists(json.playlists);
        if (json.playlists.length > 0 && !activePlayerPlaylist) {
          setActivePlayerPlaylist(json.playlists[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load playlists:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaylists();
  }, []);

  // Simulated Player Interval Loop (Requirement 9)
  useEffect(() => {
    if (!isPlaying || !activePlayerPlaylist || !activePlayerPlaylist.items || activePlayerPlaylist.items.length === 0) {
      return;
    }

    const currentItem = activePlayerPlaylist.items[currentSlideIndex];
    const duration = (currentItem?.durationSeconds || 10) * 1000;

    const timer = setTimeout(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % activePlayerPlaylist.items.length);
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, activePlayerPlaylist, currentSlideIndex]);

  const handleCreatePlaylistSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/digital-signage/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          targetCategory,
          contentIds: ['CNT-2026-101', 'CNT-2026-102', 'CNT-2026-103'],
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setName('');
        fetchPlaylists();
      }
    } catch (err) {
      console.error('Failed to create playlist:', err);
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
              <Badge variant="success" size="sm">PLAYLIST MANAGER</Badge>
              <span className="text-[10px] text-slate-400 font-mono">{playlists.length} Playlists Configured</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-1">
              Signage Playlists & Development Screen Player
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            <span>Create Playlist</span>
          </Button>

          <Button variant="secondary" size="sm" onClick={fetchPlaylists}>
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Development Simulated Display Player (Requirement 9) */}
      <div className="bg-navy-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div className="flex items-center space-x-2">
            <Monitor className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-bold text-white">SIMULATED DISPLAY SCREEN PLAYER (DEVELOPMENT PREVIEW)</h2>
              <p className="text-[11px] text-slate-400">
                Simulated 4K UHD rendering engine for content timing, transition, and layout verification.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="warning" size="sm">SIMULATED SCREEN</Badge>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded-lg bg-navy-950 border border-navy-800 text-slate-300 hover:text-white"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>

        {/* 16:9 Screen Viewport Simulator */}
        <div className="relative aspect-video rounded-2xl bg-navy-950 border-2 border-emerald-500/30 overflow-hidden flex flex-col justify-between p-6 shadow-2xl">
          {/* Simulated Screen Top Telemetry Overlay */}
          <div className="flex items-center justify-between text-[11px] font-mono bg-navy-900/80 backdrop-blur-sm p-3 rounded-xl border border-navy-800">
            <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              <span>SIMULATED SCREEN ID: SCR-2026-001 (Gate B Video Wall)</span>
            </span>

            <span className="text-slate-300">
              Playlist: <strong className="text-white">{activePlayerPlaylist?.name || 'Matchday Master Loop'}</strong>
            </span>
          </div>

          {/* Active Content Slide Visual Display */}
          <div className="text-center space-y-3 my-auto py-8">
            <Badge variant="success" size="sm">
              SLIDE {currentSlideIndex + 1} OF {activePlayerPlaylist?.items?.length || 1}
            </Badge>

            <h3 className="text-2xl font-black text-white tracking-tight max-w-xl mx-auto">
              {activePlayerPlaylist?.items?.[currentSlideIndex]?.title || 'AFCON Qualifier Match Schedule & Gate Maps'}
            </h3>

            <p className="text-xs text-slate-400 font-mono">
              Display Duration: {activePlayerPlaylist?.items?.[currentSlideIndex]?.durationSeconds || 15} Seconds
            </p>
          </div>

          {/* Screen Bottom Bar */}
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-navy-850 pt-2">
            <span>TalantaOS Signage SoC Engine v8.5.122</span>
            <span>Resolution: 3840x2160 (4K UHD) • 60 FPS</span>
          </div>
        </div>
      </div>

      {/* Playlists List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {playlists.map((pl) => {
          const isSelected = activePlayerPlaylist?.id === pl.id;

          return (
            <div
              key={pl.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                isSelected
                  ? 'bg-navy-900 border-emerald-500 shadow-lg shadow-emerald-500/10'
                  : 'bg-navy-900 border-navy-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-emerald-400">{pl.id}</span>
                  <Badge variant="secondary" size="sm">{pl.targetCategory.replace('_', ' ')}</Badge>
                </div>

                <div>
                  <h3 className="font-bold text-white text-sm">{pl.name}</h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{pl.description}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-navy-800">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Arranged Loop Content ({pl.items.length} items):</span>
                  {pl.items.map((item, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-navy-950 text-[11px] text-slate-300 flex justify-between">
                      <span className="truncate max-w-[180px]">{idx + 1}. {item.title}</span>
                      <span className="font-mono text-emerald-400">{item.durationSeconds}s</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">Loop: {pl.totalDurationSeconds}s</span>
                <Button
                  variant={isSelected ? 'primary' : 'outline'}
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setActivePlayerPlaylist(pl);
                    setCurrentSlideIndex(0);
                  }}
                >
                  <Play className="w-3.5 h-3.5 mr-1" />
                  <span>{isSelected ? 'Playing in Player' : 'Preview in Player'}</span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Playlist Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Signage Playlist"
      >
        <form onSubmit={handleCreatePlaylistSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Playlist Name *</label>
            <input
              type="text"
              placeholder="e.g. Concourse Pre-Match Wayfinding Stream"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Playlist Purpose / Description</label>
            <input
              type="text"
              placeholder="e.g. Dynamic directional guide for Gate B and C"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Target Display Category</label>
            <select
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="CONCOURSE_WAYFINDING">Concourse Wayfinding</option>
              <option value="SECTOR_TICKETING">Sector Ticketing & Gate Info</option>
              <option value="VIP_LOUNGE">VIP Lounge & Hospitality</option>
              <option value="PERIMETER_LED_BOWL">Perimeter LED Ribbon</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-navy-800">
            <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              Create Playlist
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
