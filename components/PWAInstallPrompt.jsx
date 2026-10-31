'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Globe, Share2, PlusSquare } from 'lucide-react';
import Button from './Button';
import Modal from './Modal';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if already in standalone PWA mode
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    setIsStandalone(isStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Capture Android/Chromium beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      setShowInstructionsModal(true);
    }
  };

  // If already running standalone or user dismissed, don't show the bottom banner
  if (isStandalone || dismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Install Prompt Banner (Repositioned to Bottom-Left to Avoid Collision) */}
      <div className="fixed bottom-4 left-4 right-4 sm:right-auto sm:left-6 sm:max-w-xs z-30 animate-in slide-in-from-bottom-3 duration-300">
        <div className="bg-navy-900 border border-emerald-500/40 rounded-2xl p-3 shadow-2xl flex items-center justify-between space-x-2 text-xs">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-md shadow-emerald-500/20 text-xs">
              TS
            </div>
            <div>
              <span className="font-bold text-white block text-xs">Install Talanta App</span>
              <span className="text-[9px] text-slate-400 block">Fast mobile access & offline passes</span>
            </div>
          </div>

          <div className="flex items-center space-x-1 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={handleInstallClick}
              className="py-1 px-2.5 text-[10px] shadow-emerald-500/20"
            >
              <Download className="w-3 h-3 mr-1" />
              <span>Install</span>
            </Button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-navy-800"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Manual Instructions Modal (For iOS and Unsupported Browsers) */}
      <Modal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        title="Install Talanta Stadium Web App"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3.5 rounded-xl bg-navy-950 border border-navy-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Progressive Web Application (PWA)</h4>
              <p className="text-[11px] text-slate-400">
                Installs directly on your mobile device home screen with no app store download required.
              </p>
            </div>
          </div>

          {/* iOS Safari Instructions */}
          <div className="space-y-2 p-3.5 rounded-xl bg-navy-950 border border-navy-800">
            <div className="flex items-center space-x-2 font-bold text-white text-xs">
              <Smartphone className="w-4 h-4 text-slate-200" />
              <span>Apple iOS (Safari Browser)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 pl-1 leading-relaxed">
              <li>Open this website in <strong>Safari</strong>.</li>
              <li className="flex items-center space-x-1">
                <span>Tap the</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-navy-900 border border-navy-700 text-white font-mono text-[10px]">
                  <Share2 className="w-3 h-3 mr-1" /> Share
                </span>
                <span>button at the bottom toolbar.</span>
              </li>
              <li className="flex items-center space-x-1">
                <span>Scroll down and select</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-navy-900 border border-navy-700 text-white font-mono text-[10px]">
                  <PlusSquare className="w-3 h-3 mr-1" /> Add to Home Screen
                </span>.
              </li>
              <li>Tap <strong>Add</strong> at top right to confirm installation.</li>
            </ol>
          </div>

          {/* Android Chrome Instructions */}
          <div className="space-y-2 p-3.5 rounded-xl bg-navy-950 border border-navy-800">
            <div className="flex items-center space-x-2 font-bold text-white text-xs">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Android (Chrome / Edge / Samsung Internet)</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400 pl-1 leading-relaxed">
              <li>Tap the three vertical dots (<strong>⋮</strong>) in the top-right corner.</li>
              <li>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
              <li>Follow the on-screen prompt to confirm installation.</li>
            </ol>
          </div>

          <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800/80 text-[10px] text-slate-500 font-mono">
            * PWA is directly deployed via the Talanta Sports City secure web platform. Independent of Google Play or Apple App Store.
          </div>

          <div className="flex justify-end pt-2 border-t border-navy-800">
            <Button variant="secondary" size="sm" onClick={() => setShowInstructionsModal(false)}>
              Got it
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
