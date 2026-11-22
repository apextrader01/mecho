'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Fuel, Wrench, ShieldAlert, X, MapPin, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { apiRequest } from '../lib/api';

interface SosSectionProps {
  onDispatchCreated: (dispatch: any) => void;
  sosModal: 'fuel' | 'puncture' | null;
  setSosModal: (modal: 'fuel' | 'puncture' | null) => void;
}

export default function SosSection({ onDispatchCreated, sosModal, setSosModal }: SosSectionProps) {
  const { t, userCoords, lang } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fuel Assist Form State
  const [fuelType, setFuelType] = useState<'PETROL' | 'DIESEL'>('PETROL');
  const [liters, setLiters] = useState<number>(3);
  const [vehicleModel, setVehicleModel] = useState('Honda City (KA 01 MJ 4321)');
  const [notes, setNotes] = useState('Car stalled on service road, hazard lights on');

  // Roadside Assist Form State
  const [roadsideIssue, setRoadsideIssue] = useState('Tyre Puncture');
  const [vehicleType, setVehicleType] = useState('Car / Sedan');

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/dispatch/request', {
        method: 'POST',
        body: JSON.stringify({
          categorySlug: 'emergency-fuel',
          pickupLatitude: userCoords.lat,
          pickupLongitude: userCoords.lng,
          pickupAddress: userCoords.address,
          requestDetails: {
            fuelType,
            liters,
            vehicleModel,
            notes
          }
        })
      });

      if (res.success && res.dispatch) {
        onDispatchCreated(res.dispatch);
        setSosModal(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch runner');
    } finally {
      setLoading(false);
    }
  };

  const handlePunctureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest('/dispatch/request', {
        method: 'POST',
        body: JSON.stringify({
          categorySlug: 'roadside-puncture',
          pickupLatitude: userCoords.lat,
          pickupLongitude: userCoords.lng,
          pickupAddress: userCoords.address,
          requestDetails: {
            issue: roadsideIssue,
            vehicleType,
            vehicleModel
          }
        })
      });

      if (res.success && res.dispatch) {
        onDispatchCreated(res.dispatch);
        setSosModal(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch mechanic');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      {/* 2 Big SOS Emergency Hero Buttons */}
      <div className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 p-1 rounded-3xl shadow-lg shadow-red-500/10">
        <div className="bg-white rounded-[22px] p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-red-100 text-red-600">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                  {t.emergencyAssist}
                </h2>
                <p className="text-xs text-slate-500">
                  Instant runner & mechanic dispatch with 4-digit OTP security
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              24/7 Verified Partners Active
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {/* Action 1: Highway Fuel Assist */}
            <button
              onClick={() => setSosModal('fuel')}
              className="group relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-4 sm:p-5 rounded-2xl shadow-md shadow-orange-500/20 text-left transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Fuel className="w-6 h-6 text-amber-200" />
                    <span className="font-extrabold text-base sm:text-lg">{t.fuelAssistBtn}</span>
                  </div>
                  <p className="text-xs text-amber-100 font-medium">{t.fuelAssistSub}</p>
                </div>
                <span className="bg-white/20 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
                  Capped 2-5L
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-amber-100">
                <span>⚡ Petrol & Diesel</span>
                <span className="font-bold underline">Tap to Dispatch &rarr;</span>
              </div>
            </button>

            {/* Action 2: Roadside Tyre & Puncture */}
            <button
              onClick={() => setSosModal('puncture')}
              className="group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md shadow-slate-900/20 text-left transition-all active:scale-[0.99]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Wrench className="w-6 h-6 text-red-400" />
                    <span className="font-extrabold text-base sm:text-lg">{t.punctureBtn}</span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{t.punctureSub}</p>
                </div>
                <span className="bg-red-500/30 text-red-300 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider">
                  24/7 Rapid
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between text-xs text-slate-300">
                <span>Puncture, Jumpstart, Towing</span>
                <span className="font-bold text-orange-400 underline">Tap to Call &rarr;</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: EMERGENCY FUEL ASSIST (Strict 2-5L Runner Model) */}
      {/* ==================================================================== */}
      {sosModal === 'fuel' && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
                  <Fuel className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {lang === 'hi' ? 'आपातकालीन पेट्रोल/डीजल डिलीवरी' : 'Emergency Highway Fuel Assist'}
                  </h3>
                  <p className="text-xs text-slate-500">Reach-to-Pump Emergency Runner Service</p>
                </div>
              </div>
              <button
                onClick={() => setSosModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleFuelSubmit} className="mt-4 space-y-4">
              {/* Strict Notice banner */}
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Strict Emergency Regulatory Rule:</span>
                </div>
                <p>
                  Fuel delivery is <strong>strictly capped between 2.0 and 5.0 Litres</strong> in PESO-certified safety cans. The partner will upload the official fuel pump receipt photo and verify your Photo ID upon delivery.
                </p>
              </div>

              {/* Fuel Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  {t.fuelType}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFuelType('PETROL')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border text-center transition-all ${
                      fuelType === 'PETROL'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ⛽ Petrol (पेट्रोल)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFuelType('DIESEL')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs border text-center transition-all ${
                      fuelType === 'DIESEL'
                        ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    🛢️ Diesel (डीजल)
                  </button>
                </div>
              </div>

              {/* Liters Selector (Strictly 2 to 5) */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">
                    {t.fuelLiters}
                  </label>
                  <span className="text-xs font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    {liters} Litres
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="5"
                  step="0.5"
                  value={liters}
                  onChange={(e) => setLiters(parseFloat(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold px-0.5">
                  <span>2.0L (Min)</span>
                  <span>3.0L</span>
                  <span>4.0L</span>
                  <span>5.0L (Max Capped)</span>
                </div>
              </div>

              {/* Vehicle Model */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.vehicleModel}
                </label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Maruti Swift (KA 03 AB 1234)"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Live GPS Breakdown Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.dropGpsPin}
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">{userCoords.address}</p>
                    <p className="text-slate-400 text-[10px]">Lat: {userCoords.lat}, Lng: {userCoords.lng}</p>
                  </div>
                </div>
              </div>

              {/* Additional notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Landmark / Notes
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Parked before flyover ramp, hazard lights blinking"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Transparent Fee breakdown */}
              <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Day Runner Service Charge:</span>
                  <span>₹150 (Flat)</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Night SOS Charge (10 PM - 6 AM):</span>
                  <span>₹250</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Fuel Cost:</span>
                  <span>Actual Pump Receipt (Attached upon arrival)</span>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold py-3 rounded-2xl shadow-lg shadow-orange-500/25 active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Broadcasting to Nearest Runners...' : '🚨 Request Emergency Fuel Runner'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 2: 24/7 ROADSIDE PUNCTURE & BREAKDOWN */}
      {/* ==================================================================== */}
      {sosModal === 'puncture' && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-red-100 text-red-600">
                  <Wrench className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    {lang === 'hi' ? '24/7 रोडसाइड पंक्चर व मैकेनिक' : '24/7 Roadside & Tyre Puncture Assist'}
                  </h3>
                  <p className="text-xs text-slate-500">Immediate On-Site Mobile Mechanic</p>
                </div>
              </div>
              <button
                onClick={() => setSosModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handlePunctureSubmit} className="mt-4 space-y-4">
              {/* Issue Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Select Issue
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Tyre Puncture', 'Battery Jumpstart', 'Towing Assistance', 'Key Lockout'].map((issue) => (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => setRoadsideIssue(issue)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                        roadsideIssue === issue
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Vehicle Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['2-Wheeler', 'Car / Sedan', 'SUV / Mini-Truck'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVehicleType(type)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        vehicleType === type
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Model & Reg No */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.vehicleModel}
                </label>
                <input
                  type="text"
                  required
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="e.g. Royal Enfield Hunter / Tata Nexon"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {t.dropGpsPin}
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">{userCoords.address}</p>
                    <p className="text-slate-400 text-[10px]">Lat: {userCoords.lat}, Lng: {userCoords.lng}</p>
                  </div>
                </div>
              </div>

              {/* Fee notice */}
              <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs">
                Base Visit & Inspection Fee: <strong>₹200</strong>. Includes 4-digit start/end verification OTP.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Locating Nearest Mechanics...' : '🚨 Dispatch Mobile Mechanic Now'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
