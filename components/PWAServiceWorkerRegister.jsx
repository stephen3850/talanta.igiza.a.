'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import Button from './Button';

export default function PWAServiceWorkerRegister() {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered with scope:', registration.scope);

          // Check if an update is already waiting
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setShowUpdateToast(true);
          }

          // Listen for new waiting workers
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setShowUpdateToast(true);
                }
              });
            }
          });
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });

      // Reload on controller change
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdateToast(false);
  };

  if (!showUpdateToast) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-navy-900 border-2 border-emerald-500 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 flex items-start justify-between space-x-3 text-xs">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>

        <div className="flex-1 space-y-1">
          <span className="font-bold text-white block">Talanta Platform Update Available</span>
          <p className="text-[11px] text-slate-300">
            A new version of the stadium digital operating system is ready to install.
          </p>

          <div className="pt-2 flex items-center space-x-2">
            <Button variant="primary" size="sm" onClick={handleUpdate} className="text-xs py-1 px-3">
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              <span>Update Now</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpdateToast(false)}
              className="text-xs py-1 px-3"
            >
              Later
            </Button>
          </div>
        </div>

        <button
          onClick={() => setShowUpdateToast(false)}
          className="text-slate-400 hover:text-white shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
