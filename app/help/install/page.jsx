'use client';

import React from 'react';
import Link from 'next/link';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { Smartphone, Download, Share, PlusSquare, ArrowLeft, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

export default function PwaInstallGuidePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 p-4 sm:p-6 pb-24">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            <span>Return to Portal</span>
          </Button>
        </Link>
        <Badge variant="success" size="sm">PWA INSTALLATION GUIDE</Badge>
      </div>

      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Smartphone className="w-7 h-7 text-emerald-400" />
            <span>Installing Talanta Stadium Mobile App</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Follow these simple steps to install the official Progressive Web App (PWA) directly on your Android or iOS device for fast, offline-capable matchday access.
          </p>
        </div>

        {/* Disclaimer Requirement 9 */}
        <div className="p-4 rounded-2xl bg-navy-950 border border-emerald-500/30 text-xs text-slate-300 space-y-1">
          <div className="font-bold text-emerald-400 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Direct Web Browser Installation Notice</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This Progressive Web App (PWA) installs directly from your web browser without requiring a Google Play Store or Apple App Store download. It delivers fullscreen standalone display, instant offline ticket retrieval, and camera-integrated gate scanning.
          </p>
        </div>

        {/* Android Instructions */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-navy-800 pb-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
              A
            </span>
            <span>Android (Google Chrome / Edge / Samsung Internet)</span>
          </h2>

          <ol className="space-y-3 text-xs text-slate-300 leading-relaxed pl-2">
            <li className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-navy-950 border border-navy-800 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                Open <strong className="text-white">Talanta Stadium Portal</strong> in Google Chrome or Microsoft Edge on your phone.
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-navy-950 border border-navy-800 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                Tap the floating <strong className="text-emerald-400">Install App</strong> banner at the bottom of the screen, or open the browser menu (3 dots top right) and select <strong className="text-white">Install App / Add to Home screen</strong>.
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-navy-950 border border-navy-800 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                Confirm <strong>Install</strong>. The Talanta icon will be added to your home screen and launcher.
              </div>
            </li>
          </ol>
        </div>

        {/* iOS Instructions */}
        <div className="space-y-3 pt-4">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2 border-b border-navy-800 pb-2">
            <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-mono font-bold text-xs">
              i
            </span>
            <span>iOS (iPhone & iPad - Apple Safari)</span>
          </h2>

          <ol className="space-y-3 text-xs text-slate-300 leading-relaxed pl-2">
            <li className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-navy-950 border border-navy-800 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <div>
                Open the portal using <strong className="text-white">Apple Safari</strong> browser on your iPhone or iPad.
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-navy-950 border border-navy-800 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <div>
                Tap the <Share className="w-4 h-4 text-sky-400 inline mx-1" /> <strong>Share button</strong> in the Safari bottom toolbar.
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-navy-950 border border-navy-800 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <div>
                Scroll down the action list and select <PlusSquare className="w-4 h-4 text-emerald-400 inline mx-1" /> <strong className="text-white">Add to Home Screen</strong>.
              </div>
            </li>

            <li className="flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-navy-950 border border-navy-800 text-sky-400 font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
              <div>
                Tap <strong>Add</strong> in the top right corner. The app will launch in fullscreen standalone mode.
              </div>
            </li>
          </ol>
        </div>

        {/* Benefits List */}
        <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-2 text-xs">
          <span className="font-bold text-white block">Key PWA Advantages:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Offline Digital Ticket Cache</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Instant Camera Gate Scanner</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Low Battery & Memory Usage</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Auto Update Background Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
