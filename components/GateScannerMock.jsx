import React, { useState } from 'react';
import { QrCode, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';

export default function GateScannerMock() {
  const [gateId, setGateId] = useState('GATE-A-01');
  const [scannedInput, setScannedInput] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const sampleTickets = [
    { label: 'Valid Ticket (TKT-9841-01)', token: 'eyJ0aWNrZXROdW1iZXIiOiJUS1QtOTg0MS0wMSIsIm9yZGVyUmVmIjoiVExOLTk4NDEtQTIiLCJldmVudElkIjoiRVZULTAwMSIsImNhdGVnb3J5TmFtZSI6IkdlbmVyYWwgQWRtaXNzaW9uIiwic2VhdE51bWJlciI6IEdBVEUgQSAtIFNFQyAxMDQiLCJpc3N1ZWRBdCI6MTcyOTk0MDAwMDAwMCwic2VjcmV0U2lnbmF0dXJlIjoidGFsYW50YS1zdGFkaXVtLWRpZ2l0YWwtdGlja2V0LXNpZ25pbmctc2VjcmV0LTIwMjYtVEtULTk4NDEtMDEifQ==' },
    { label: 'Used / Duplicate Scan (TKT-7712-09)', token: 'USED_TICKET_TOKEN_DEMO' },
    { label: 'Invalid Token Signature', token: 'INVALID_CRYPTOGRAPHIC_QR_PAYLOAD' }
  ];

  const handleScanSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!scannedInput.trim()) return;

    setIsValidating(true);
    setScanResult(null);

    try {
      const res = await fetch('/api/gate/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken: scannedInput,
          gateId: gateId,
          scannerDeviceId: 'SCANNER-MOB-01',
        }),
      });

      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      setScanResult({
        status: 'REJECTED',
        reason: 'NETWORK_ERROR',
        message: 'Scanner unable to reach validation service',
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl max-w-xl mx-auto">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-navy-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Turnstile Validation Scanner</h3>
            <p className="text-xs text-slate-400">Talanta Stadium Gate Control Kiosk</p>
          </div>
        </div>

        <select
          value={gateId}
          onChange={(e) => setGateId(e.target.value)}
          className="bg-navy-950 border border-navy-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
        >
          <option value="GATE-A-01">Gate A - Lane 01 (VIP)</option>
          <option value="GATE-B-04">Gate B - Lane 04 (General)</option>
          <option value="GATE-C-02">Gate C - Lane 02 (North Stand)</option>
        </select>
      </div>

      {/* Preset Test Credentials */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 font-medium block mb-2">Test Scanner Presets:</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {sampleTickets.map((st, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setScannedInput(st.token)}
              className="text-[11px] bg-navy-950 hover:bg-navy-800 border border-navy-700 hover:border-emerald-500/50 text-slate-300 rounded-lg p-2 text-left truncate transition-colors"
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scan Input Form */}
      <form onSubmit={handleScanSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 font-medium block mb-1">
            Scan Payload or Token String
          </label>
          <input
            type="text"
            value={scannedInput}
            onChange={(e) => setScannedInput(e.target.value)}
            placeholder="Paste QR payload or click a test preset..."
            className="w-full bg-navy-950 border border-navy-700 focus:border-emerald-500 text-white text-xs rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex space-x-3">
          <Button
            type="submit"
            variant="primary"
            className="flex-1 justify-center space-x-2"
            isLoading={isValidating}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Validate Ticket QR</span>
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setScannedInput('');
              setScanResult(null);
            }}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Validation Result Box */}
      {scanResult && (
        <div
          className={`mt-6 p-5 rounded-xl border animate-in fade-in duration-300 ${
            scanResult.status === 'APPROVED'
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/10 border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-start space-x-3">
            {scanResult.status === 'APPROVED' ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-7 h-7 text-red-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm tracking-wide">
                  {scanResult.status === 'APPROVED' ? 'GATE ENTRY APPROVED' : 'ENTRY REJECTED'}
                </span>
                <Badge variant={scanResult.status === 'APPROVED' ? 'success' : 'danger'}>
                  {scanResult.gateId}
                </Badge>
              </div>

              <p className="text-slate-200">{scanResult.message}</p>

              {scanResult.ticket && (
                <div className="pt-2 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div><span className="text-slate-400">Ticket:</span> {scanResult.ticket.ticketNumber}</div>
                  <div><span className="text-slate-400">Category:</span> {scanResult.ticket.categoryName}</div>
                  <div><span className="text-slate-400">Seat:</span> {scanResult.ticket.seatNumber}</div>
                  <div><span className="text-slate-400">Scan Time:</span> {new Date().toLocaleTimeString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
