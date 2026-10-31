'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import Button from '../../../components/Button';
import Badge from '../../../components/Badge';
import { initialEvents, initialParkingZones } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { Car, ArrowLeft, ShieldCheck, CheckCircle2, AlertTriangle, Smartphone } from 'lucide-react';

function ParkingBookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const defaultZoneId = searchParams.get('zoneId') || 'PRK-ZONE-GA-LOT1';

  const [vehiclePlate, setVehiclePlate] = useState('KDA 891X');
  const [vehicleCategory, setVehicleCategory] = useState('SALOON_CAR');
  const [zoneId, setZoneId] = useState(defaultZoneId);
  const [eventId, setEventId] = useState('EVT-001');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const selectedZone = initialParkingZones.find((z) => z.id === zoneId) || initialParkingZones[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehiclePlate.trim()) {
      setErrorMsg('Vehicle plate number is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/parking/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehiclePlate: vehiclePlate.toUpperCase(),
          vehicleCategory,
          zoneId,
          userEmail: 'patron@example.com',
          userName: 'David Omondi',
        }),
      });

      const data = await res.json();
      if (data.success && data.reservation) {
        setReservationSuccess(data.reservation);
      } else {
        setErrorMsg(data.message || 'Parking reservation failed');
      }
    } catch (err) {
      setErrorMsg('Server connection error during parking reservation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-xs text-slate-400 hover:text-white space-x-1"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Parking Directory</span>
      </button>

      {reservationSuccess ? (
        /* SUCCESS STATE */
        <div className="bg-navy-900 border border-emerald-500/50 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <Badge variant="success" size="md" className="mb-2">
              PARKING SPOT RESERVED
            </Badge>
            <h1 className="text-2xl font-bold text-white">Parking Permit Issued!</h1>
            <p className="text-xs text-slate-300 mt-1">
              Permit Ref: <span className="font-mono text-emerald-400 font-bold">{reservationSuccess.reservationRef}</span>
            </p>
          </div>

          <div className="bg-navy-950 p-5 rounded-2xl border border-navy-800 text-xs text-left space-y-2">
            <div className="flex justify-between border-b border-navy-800 pb-2">
              <span className="text-slate-400">Vehicle Plate:</span>
              <span className="font-mono font-bold text-white">{reservationSuccess.vehiclePlate}</span>
            </div>
            <div className="flex justify-between border-b border-navy-800 pb-2">
              <span className="text-slate-400">Parking Zone:</span>
              <span className="font-bold text-emerald-400">{reservationSuccess.zoneName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Fee Paid:</span>
              <span className="font-bold text-white">{formatCurrency(reservationSuccess.amountKes)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={() => router.push('/account/parking')}
            className="w-full justify-center py-3"
          >
            View Parking Permit in Wallet
          </Button>
        </div>
      ) : (
        /* RESERVATION FORM */
        <div className="bg-navy-900 border border-navy-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Reserve Matchday Parking Spot</h1>
            <p className="text-xs text-slate-400 mt-1">
              Register vehicle registration number and select assigned stadium parking zone
            </p>
          </div>

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Vehicle Registration Plate Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. KDA 891X"
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full bg-navy-950 border border-navy-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Vehicle Category</label>
                <select
                  value={vehicleCategory}
                  onChange={(e) => setVehicleCategory(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  <option value="SALOON_CAR">Saloon Car</option>
                  <option value="SUV_4X4">SUV / 4x4</option>
                  <option value="BUS_MINIBUS">Minibus / Bus</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Assigned Parking Zone</label>
                <select
                  value={zoneId}
                  onChange={(e) => setZoneId(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-700 text-xs text-white rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  {initialParkingZones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({formatCurrency(z.priceKes)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 text-xs space-y-1">
              <span className="text-slate-400 block">Selected Zone Fee:</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {selectedZone.priceKes === 0 ? 'FREE' : formatCurrency(selectedZone.priceKes)}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full justify-center py-3.5 space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm & Issue Parking Permit</span>
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ParkingBookPage() {
  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading parking form...</div>}>
          <ParkingBookingContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
