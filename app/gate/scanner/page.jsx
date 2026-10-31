'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Wifi,
  WifiOff,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Flashlight,
  Sparkles,
  Smartphone
} from 'lucide-react';

function GateScannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const eventId = searchParams.get('eventId') || '';
  const gateId = searchParams.get('gateId') || '';
  const deviceId = searchParams.get('deviceId') || '';

  const [ticketInput, setTicketInput] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Camera & Mobile Features State (Requirement 6)
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const videoRef = useRef(null);

  // Load Offline Queue from localStorage
  useEffect(() => {
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Camera Permission & Stream Handling
  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraPermissionGranted(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraPermissionGranted(true);
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access denied or unavailable, using viewport simulation:', err);
      setCameraPermissionGranted(false);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Haptic Feedback for Mobile Turnstile Operator (Requirement 6)
  const triggerHapticFeedback = (isApproved) => {
    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      if (isApproved) {
        window.navigator.vibrate([80, 40, 80]); // Double short pulse
      } else {
        window.navigator.vibrate([250, 100, 250]); // Long warning pulse
      }
    }
  };

  // Process Scan Submission
  const handleScanSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!ticketInput.trim()) return;

    setIsProcessing(true);
    setValidationResult(null);

    const scanPayload = {
      qrToken: ticketInput.trim(),
      eventId,
      gateId,
      deviceId,
    };

    if (isOffline) {
      triggerHapticFeedback(false);
      setValidationResult({
        success: false,
        status: 'VALIDATION_UNAVAILABLE',
        message: 'Offline scans are unverified. Follow the venue-approved offline procedure; no admission was approved.',
      });
      setIsProcessing(false);
      return;
    }

    // ONLINE SERVER VALIDATION
    try {
      const res = await fetch('/api/gate/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scanPayload),
      });

      const data = await res.json();
      setValidationResult(data);
      if (data.status === 'APPROVED') {
        triggerHapticFeedback(true);
        setTicketInput('');
      } else {
        triggerHapticFeedback(false);
      }
    } catch (err) {
      triggerHapticFeedback(false);
      setValidationResult({
        success: false,
        status: 'ERROR',
        message: 'Validation service is unavailable. No admission was approved.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-800 rounded-2xl p-4 shadow-xl">
        <button
          onClick={() => router.push('/staff')}
          className="inline-flex items-center text-xs text-slate-400 hover:text-white space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to Staff Hub</span>
        </button>

        <div className="flex items-center space-x-4">
          {/* Offline Mode Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={isOffline}
              onChange={(e) => setIsOffline(e.target.checked)}
              className="rounded border-navy-700 bg-navy-950 text-emerald-500"
            />
            {isOffline ? (
              <span className="text-amber-400 font-bold flex items-center space-x-1">
                <WifiOff className="w-3.5 h-3.5 mr-1" /> OFFLINE - UNVERIFIED
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                <Wifi className="w-3.5 h-3.5 mr-1" /> ONLINE SYNCED
              </span>
            )}
          </label>

        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Camera Viewfinder & Scanner */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-navy-800 pb-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Active Lane</span>
              <span className="text-base font-bold text-white">{gateId || 'No gate assigned'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="navy">{deviceId || 'No scanner assigned'}</Badge>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1 text-slate-400 hover:text-white rounded-md"
                title={soundEnabled ? 'Audio Chime Enabled' : 'Audio Chime Muted'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>

          {/* Camera preview is not a QR decoder. */}
          <div className="relative h-64 rounded-2xl overflow-hidden bg-navy-950 border-2 border-dashed border-emerald-500/50 flex flex-col items-center justify-center space-y-3 group">
            {cameraActive ? (
              <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-cover"
                playsInline
                muted
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-emerald-500/5 pointer-events-none"></div>
            )}

            {/* Target Reticle Frame */}
            <div className="w-48 h-48 border-2 border-emerald-400 rounded-2xl relative flex items-center justify-center animate-pulse z-10">
              <QrCode className="w-16 h-16 text-emerald-400/30" />
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400"></div>
            </div>

            {/* Camera Control Overlays */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20">
              <button
                type="button"
                onClick={cameraActive ? stopCamera : startCamera}
                className="px-2.5 py-1 rounded-lg bg-navy-950/80 backdrop-blur-sm border border-navy-700 text-xs text-emerald-300 flex items-center space-x-1"
              >
                {cameraActive ? <CameraOff className="w-3.5 h-3.5 mr-1" /> : <Camera className="w-3.5 h-3.5 mr-1" />}
                <span>{cameraActive ? 'Stop Camera' : 'Start Camera'}</span>
              </button>

              <button
                type="button"
                onClick={() => setTorchOn(!torchOn)}
                className={`p-1.5 rounded-lg border text-xs ${
                  torchOn ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-navy-950/80 text-slate-400 border-navy-700'
                }`}
                title="Toggle Torch/Flash"
              >
                <Flashlight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Manual Input Form */}
          <form onSubmit={handleScanSubmit} className="space-y-3">
            <label className="text-xs font-medium text-slate-300 block">QR credential (ticket numbers alone are not proof)</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Paste the signed QR credential"
                value={ticketInput}
                onChange={(e) => setTicketInput(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center space-x-2 py-3"
              isLoading={isProcessing}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Validate Ticket Entry</span>
            </Button>
          </form>

        </div>

        {/* Right Real-time Validation Result Banner */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-2xl space-y-6">
            <h2 className="text-base font-bold text-white">Validation Feedback Banner</h2>

            {validationResult ? (
              <div
                className={`p-6 rounded-2xl border text-center space-y-4 animate-in fade-in duration-200 ${
                  validationResult.status === 'APPROVED'
                    ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-emerald-500/20 shadow-xl'
                    : validationResult.status === 'REJECTED_ALREADY_USED'
                    ? 'bg-red-500/20 border-red-500 text-white shadow-red-500/20 shadow-xl'
                    : 'bg-amber-500/15 border-amber-500 text-white'
                }`}
              >
                {/* Result Icon */}
                <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center border">
                  {validationResult.status === 'APPROVED' ? (
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-400" />
                  )}
                </div>

                <div>
                  <Badge
                    variant={validationResult.status === 'APPROVED' ? 'success' : 'danger'}
                    size="md"
                    className="mb-2"
                  >
                    {validationResult.status}
                  </Badge>
                  <h3 className="text-xl font-bold">{validationResult.message}</h3>
                </div>

                {/* Ticket Details */}
                {validationResult.ticket && (
                  <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 text-xs text-left space-y-2">
                    <div className="flex justify-between border-b border-navy-800 pb-1.5">
                      <span className="text-slate-400">Ticket Ref:</span>
                      <span className="font-mono font-bold text-emerald-400">{validationResult.ticket.ticketNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-navy-800 pb-1.5">
                      <span className="text-slate-400">Seat Allocation:</span>
                      <span className="font-bold text-white">{validationResult.ticket.seatNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-medium text-slate-200">{validationResult.ticket.categoryName}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 border border-dashed border-navy-800 rounded-2xl space-y-2">
                <ShieldCheck className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">Awaiting a signed QR credential and assigned scanner configuration...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GateScannerPage() {
  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col p-4">
      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading scanner module...</div>}>
        <GateScannerContent />
      </Suspense>
    </div>
  );
}
