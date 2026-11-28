'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Fuel,
  Wrench,
  ShieldAlert,
  X,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Clock,
  Pill,
  PackageCheck,
  Truck,
  UserCheck,
  Zap,
  Droplets,
  Camera,
  Upload
} from 'lucide-react';
import { apiRequest } from '../lib/api';

export type SosModalType = 'fuel' | 'puncture' | 'pharmacy' | 'genie' | 'truck' | 'driver' | 'electrician' | 'plumber' | null;

interface SosSectionProps {
  onDispatchCreated: (dispatch: any) => void;
  sosModal: SosModalType;
  setSosModal: (modal: SosModalType) => void;
}

export default function SosSection({ onDispatchCreated, sosModal, setSosModal }: SosSectionProps) {
  const { t, userCoords, lang } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Fuel Assist State
  const [fuelType, setFuelType] = useState<'PETROL' | 'DIESEL'>('PETROL');
  const [liters, setLiters] = useState<number>(3);
  const [vehicleModel, setVehicleModel] = useState('Honda City (KA 01 MJ 4321)');
  const [notes, setNotes] = useState('Car stalled on service road, hazard lights on');

  // 2. Roadside Puncture State
  const [roadsideIssue, setRoadsideIssue] = useState('Tyre Puncture');
  const [vehicleType, setVehicleType] = useState('Car / Sedan');

  // 3. Emergency Pharmacy State
  const [pharmacyItems, setPharmacyItems] = useState('Paracetamol 650mg, ORS packets, Cough syrup');
  const [prescriptionPhoto, setPrescriptionPhoto] = useState<string | null>(null);

  // 4. Local Genie State
  const [genieItem, setGenieItem] = useState('Home keys & Laptop charger');
  const [genieDropAddress, setGenieDropAddress] = useState('Koramangala 5th Block, Bangalore');
  const [genieRecipientPhone, setGenieRecipientPhone] = useState('+91 9876543210');

  // 5. Mini-Truck State
  const [truckType, setTruckType] = useState('Tata Ace / Chota Hathi (750kg)');
  const [truckDropAddress, setTruckDropAddress] = useState('Whitefield Main Road, Bangalore');
  const [truckGoodsType, setTruckGoodsType] = useState('Wooden Sofa & 4 Chairs');
  const [truckHelpers, setTruckHelpers] = useState(1);

  // 6. Acting Driver State
  const [driverTransmission, setDriverTransmission] = useState<'Manual' | 'Automatic'>('Manual');
  const [driverTripType, setDriverTripType] = useState('City Hourly (4 Hours - ₹350)');
  const [driverCarModel, setDriverCarModel] = useState('Maruti Ertiga (KA 05 MN 1234)');

  // 7. Electrician State
  const [electricianIssue, setElectricianIssue] = useState('Short Circuit / MCB Tripping');
  const [electricianNotes, setElectricianNotes] = useState('Main MCB trips repeatedly');

  // 8. Plumber State
  const [plumberIssue, setPlumberIssue] = useState('Pipe Burst / Major Leakage');
  const [plumberNotes, setPlumberNotes] = useState('Water leaking from pipe joint under sink');

  // Submit Handlers
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
          requestDetails: { fuelType, liters, vehicleModel, notes }
        })
      });
      if (res.success && res.dispatch) {
        onDispatchCreated(res.dispatch);
        setSosModal(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch fuel runner');
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
          requestDetails: { issue: roadsideIssue, vehicleType, vehicleModel }
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

  const handlePharmacySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/dispatch/request', {
        method: 'POST',
        body: JSON.stringify({
          categorySlug: 'emergency-pharmacy',
          pickupLatitude: userCoords.lat,
          pickupLongitude: userCoords.lng,
          pickupAddress: userCoords.address,
          requestDetails: {
            medicines: pharmacyItems,
            prescriptionUploaded: !!prescriptionPhoto,
            urgentDelivery: true
          }
        })
      });
      if (res.success && res.dispatch) {
        onDispatchCreated(res.dispatch);
        setSosModal(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch pharmacy runner');
    } finally {
      setLoading(false);
    }
  };

  const handleGenieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/dispatch/request', {
        method: 'POST',
        body: JSON.stringify({
          categorySlug: 'genie-pickup-drop',
          pickupLatitude: userCoords.lat,
          pickupLongitude: userCoords.lng,
          pickupAddress: userCoords.address,
          dropAddress: genieDropAddress,
          requestDetails: {
            itemDescription: genieItem,
            recipientPhone: genieRecipientPhone
          }
        })
      });
      if (res.success && res.dispatch) {
        onDispatchCreated(res.dispatch);
        setSosModal(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch Genie runner');
    } finally {
      setLoading(false);
    }
  };

  const handleTruckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/dispatch/request', {
        method: 'POST',
        body: JSON.stringify({
          categorySlug: 'goods-auto-booking',
          pickupLatitude: userCoords.lat,
          pickupLongitude: userCoords.lng,
          pickupAddress: userCoords.address,
          dropAddress: truckDropAddress,
          requestDetails: {
            vehicleType: truckType,
            goodsType: truckGoodsType,
            helpers: truckHelpers
          }
        })
      });
      if (res.success && res.dispatch) {
        onDispatchCreated(res.dispatch);
        setSosModal(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch mini-truck');
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/dispatch/request', {
        method: 'POST',
        body: JSON.stringify({
          categorySlug: 'acting-drivers',
          pickupLatitude: userCoords.lat,
          pickupLongitude: userCoords.lng,
          pickupAddress: userCoords.address,
          requestDetails: {
            transmission: driverTransmission,
            tripType: driverTripType,
            carModel: driverCarModel
          }
        })
      });
      if (res.success && res.dispatch) {
        onDispatchCreated(res.dispatch);
        setSosModal(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch acting driver');
    } finally {
      setLoading(false);
    }
  };

  const handleElectricianSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/dispatch/request', {
        method: 'POST',
        body: JSON.stringify({
          categorySlug: 'electrician-services',
          pickupLatitude: userCoords.lat,
          pickupLongitude: userCoords.lng,
          pickupAddress: userCoords.address,
          requestDetails: {
            issue: electricianIssue,
            notes: electricianNotes
          }
        })
      });
      if (res.success && res.dispatch) {
        onDispatchCreated(res.dispatch);
        setSosModal(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch electrician');
    } finally {
      setLoading(false);
    }
  };

  const handlePlumberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/dispatch/request', {
        method: 'POST',
        body: JSON.stringify({
          categorySlug: 'plumbing-services',
          pickupLatitude: userCoords.lat,
          pickupLongitude: userCoords.lng,
          pickupAddress: userCoords.address,
          requestDetails: {
            issue: plumberIssue,
            notes: plumberNotes
          }
        })
      });
      if (res.success && res.dispatch) {
        onDispatchCreated(res.dispatch);
        setSosModal(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch emergency plumber');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 sm:mb-8">
      {/* 2 Big SOS Emergency Hero Buttons */}
      <div className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 p-0.5 sm:p-1 rounded-2xl sm:rounded-3xl shadow-md sm:shadow-lg shadow-red-500/10">
        <div className="bg-white rounded-[14px] sm:rounded-[22px] p-3 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-red-500"></span>
              </span>
              <h2 className="text-xs sm:text-lg font-black tracking-tight text-slate-900 uppercase">
                {t.emergencySectionTitle}
              </h2>
            </div>
            <span className="text-[9px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600" />
              <span>24/7 Verified</span>
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-500 mb-2.5 sm:mb-4 line-clamp-1">
            {t.sosSubtitle}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-4">
            {/* SOS Button 1: Fuel Assist */}
            <div
              onClick={() => setSosModal('fuel')}
              className="group cursor-pointer rounded-xl sm:rounded-2xl p-2.5 sm:p-4 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm sm:shadow-md hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between min-h-[105px] sm:min-h-[140px] active:scale-95"
            >
              <div className="flex items-start justify-between">
                <div className="p-1.5 sm:p-3 bg-white/20 backdrop-blur-md rounded-lg sm:rounded-xl">
                  <Fuel className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="bg-black/30 text-[8px] sm:text-[10px] uppercase tracking-wider font-extrabold px-1.5 sm:px-2.5 py-0.5 rounded-full text-white">
                  2-5L
                </span>
              </div>
              <div className="mt-1 sm:mt-2">
                <h3 className="font-extrabold text-xs sm:text-lg leading-tight line-clamp-1">
                  {t.fuelAssistTitle}
                </h3>
                <p className="text-[10px] sm:text-xs text-orange-100 mt-0.5 line-clamp-1">
                  15-min Reach Runner
                </p>
              </div>
              <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-white/20 text-[9px] sm:text-xs font-semibold">
                <span className="truncate">Petrol & Diesel</span>
                <span className="shrink-0 underline group-hover:translate-x-1 transition-transform">
                  Dispatch →
                </span>
              </div>
            </div>

            {/* SOS Button 2: Tyre & Puncture */}
            <div
              onClick={() => setSosModal('puncture')}
              className="group cursor-pointer rounded-xl sm:rounded-2xl p-2.5 sm:p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-sm sm:shadow-md hover:shadow-xl transition-all relative overflow-hidden flex flex-col justify-between min-h-[105px] sm:min-h-[140px] active:scale-95"
            >
              <div className="flex items-start justify-between">
                <div className="p-1.5 sm:p-3 bg-white/10 backdrop-blur-md rounded-lg sm:rounded-xl">
                  <Wrench className="w-4 h-4 sm:w-6 sm:h-6 text-orange-400" />
                </div>
                <span className="bg-red-500 text-[8px] sm:text-[10px] uppercase tracking-wider font-extrabold px-1.5 sm:px-2.5 py-0.5 rounded-full text-white">
                  24/7 Rapid
                </span>
              </div>
              <div className="mt-1 sm:mt-2">
                <h3 className="font-extrabold text-xs sm:text-lg leading-tight line-clamp-1">
                  {t.tyreRoadsideTitle}
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5 line-clamp-1">
                  Mechanic in 15-20 Mins
                </p>
              </div>
              <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-slate-700 text-[9px] sm:text-xs font-semibold text-slate-300">
                <span className="truncate">Puncture & Towing</span>
                <span className="shrink-0 underline text-orange-400 group-hover:translate-x-1 transition-transform">
                  Call →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL 1: EMERGENCY FUEL ASSIST */}
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
                  <p className="text-xs text-slate-500">Reach-to-Pump Safety Can Delivery</p>
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

            <form onSubmit={handleFuelSubmit} className="mt-4 space-y-4">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Strict Emergency Regulatory Rule:</span>
                </div>
                <p>
                  Fuel delivery is <strong>strictly capped between 2.0 and 5.0 Litres</strong> in PESO-certified safety cans. The partner will upload the official fuel pump receipt photo and verify your 4-digit start OTP upon arrival.
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

              {/* Liters Selector */}
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

              {/* Fee Notice */}
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
                  <span>Actual Pump Receipt Attached</span>
                </div>
              </div>

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

      {/* ==================================================================== */}
      {/* MODAL 3: 24/7 EMERGENCY PHARMACY & RUNNER */}
      {/* ==================================================================== */}
      {sosModal === 'pharmacy' && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
                  <Pill className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    24/7 Emergency Pharmacy & Runner
                  </h3>
                  <p className="text-xs text-slate-500">30-Min Delivery from Open Night Chemists</p>
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

            <form onSubmit={handlePharmacySubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Required Medicines / Emergency Medical Supplies
                </label>
                <textarea
                  required
                  rows={3}
                  value={pharmacyItems}
                  onChange={(e) => setPharmacyItems(e.target.value)}
                  placeholder="e.g. Paracetamol 650, ORS Sachet, Inhaler, Insulin, Baby Care"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upload Doctor&apos;s Prescription (Optional / Required for Rx Drugs)
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-rose-300 hover:border-rose-500 bg-rose-50/50 text-rose-700 text-xs font-bold transition-all">
                    <Camera className="w-4 h-4" />
                    <span>{prescriptionPhoto ? 'Prescription Attached ✓' : 'Take Photo / Upload Prescription'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setPrescriptionPhoto(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Delivery Destination (GPS Pin)
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">{userCoords.address}</p>
                    <p className="text-slate-400 text-[10px]">Lat: {userCoords.lat}, Lng: {userCoords.lng}</p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Urgent Pharmacy Runner Fee:</span>
                  <span>₹80</span>
                </div>
                <p className="text-[11px] text-rose-700">
                  Medicines purchased at actual MRP bill. Bill receipt verified with 4-digit completion OTP.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Assigning Nearest Runner...' : '💊 Dispatch Pharmacy Runner Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 4: LOCAL GENIE (PICKUP & DROP) */}
      {/* ==================================================================== */}
      {sosModal === 'genie' && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                  <PackageCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Local Genie (Pickup & Drop)
                  </h3>
                  <p className="text-xs text-slate-500">Point-to-Point City Courier for Keys, Documents, Tiffins</p>
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

            <form onSubmit={handleGenieSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  What should the runner pick up?
                </label>
                <input
                  type="text"
                  required
                  value={genieItem}
                  onChange={(e) => setGenieItem(e.target.value)}
                  placeholder="e.g. Forgotten house keys, laptop charger, signed paperwork"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pickup Location (Your Current Pin)
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{userCoords.address}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Drop-off Address & Destination
                </label>
                <input
                  type="text"
                  required
                  value={genieDropAddress}
                  onChange={(e) => setGenieDropAddress(e.target.value)}
                  placeholder="e.g. Flat 302, Green Glen Layout, Bellandur, Bangalore"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Recipient Contact Phone
                </label>
                <input
                  type="text"
                  required
                  value={genieRecipientPhone}
                  onChange={(e) => setGenieRecipientPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs">
                Base Fee: <strong>₹50</strong> for first 3 km + ₹12/km thereafter. Verified with 4-digit pickup & drop OTPs.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Finding Nearby Genie Runner...' : '📦 Dispatch Genie Runner Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 5: MINI-TRUCK & GOODS AUTO */}
      {/* ==================================================================== */}
      {sosModal === 'truck' && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Mini-Truck & Goods Auto
                  </h3>
                  <p className="text-xs text-slate-500">Instant Booking for House Shifting, Furniture & Goods</p>
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

            <form onSubmit={handleTruckSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Choose Vehicle Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'Piaggio Ape 3W (500kg)', fee: '₹250' },
                    { id: 'Tata Ace / Chota Hathi (750kg)', fee: '₹450' },
                    { id: 'Bolero Pickup 8ft (1.2 Ton)', fee: '₹750' }
                  ].map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setTruckType(v.id)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                        truckType === v.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div>{v.id}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">From {v.fee}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Goods / Items Description
                </label>
                <input
                  type="text"
                  required
                  value={truckGoodsType}
                  onChange={(e) => setTruckGoodsType(e.target.value)}
                  placeholder="e.g. 1 Bed, Refrigerator, 4 cartons"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Drop-off Destination
                </label>
                <input
                  type="text"
                  required
                  value={truckDropAddress}
                  onChange={(e) => setTruckDropAddress(e.target.value)}
                  placeholder="e.g. ITPL Main Road, Whitefield, Bangalore"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Loading Helpers Needed?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { count: 0, label: 'Driver Only (₹0)' },
                    { count: 1, label: '1 Helper (+₹200)' },
                    { count: 2, label: '2 Helpers (+₹400)' }
                  ].map((h) => (
                    <button
                      key={h.count}
                      type="button"
                      onClick={() => setTruckHelpers(h.count)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        truckHelpers === h.count
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Contacting Fleet Drivers...' : '🚚 Dispatch Mini-Truck Driver'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL 6: ACTING DRIVERS ON CALL */}
      {/* ==================================================================== */}
      {sosModal === 'driver' && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Acting Drivers on Call
                  </h3>
                  <p className="text-xs text-slate-500">Verified Professional Drivers for Your Own Car</p>
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

            <form onSubmit={handleDriverSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Car Transmission
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Manual', 'Automatic'].map((trans) => (
                    <button
                      key={trans}
                      type="button"
                      onClick={() => setDriverTransmission(trans as any)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs border text-center transition-all ${
                        driverTransmission === trans
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {trans} Transmission
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Trip Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    'City Hourly (4 Hours - ₹350)',
                    'Night Drop (One-way - ₹250)',
                    'Outstation Return (₹800/day)'
                  ].map((trip) => (
                    <button
                      key={trip}
                      type="button"
                      onClick={() => setDriverTripType(trip)}
                      className={`p-2 rounded-xl text-xs font-bold border text-left transition-all ${
                        driverTripType === trip
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {trip}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Car Make & Model
                </label>
                <input
                  type="text"
                  required
                  value={driverCarModel}
                  onChange={(e) => setDriverCarModel(e.target.value)}
                  placeholder="e.g. Hyundai Creta / Honda City"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pickup Location & Driver Reporting Point
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">{userCoords.address}</p>
                    <p className="text-slate-400 text-[10px]">Lat: {userCoords.lat}, Lng: {userCoords.lng}</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Finding Available Drivers...' : '🚗 Book Verified Acting Driver'}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* 7. Emergency Electrician Modal */}
      {sosModal === 'electrician' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    24/7 Electrician & Power Breakdown
                  </h3>
                  <p className="text-xs text-slate-500">20-Min Rapid Arrival • ₹149 Base Inspection</p>
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

            <form onSubmit={handleElectricianSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Select Electrical Issue
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Short Circuit / MCB Tripping',
                    'Switchboard Burning / Sparking',
                    'Fan / Geyser Wiring Issue',
                    'Complete House Blackout'
                  ].map((issue) => (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => setElectricianIssue(issue)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                        electricianIssue === issue
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Describe Problem (Optional)
                </label>
                <input
                  type="text"
                  value={electricianNotes}
                  onChange={(e) => setElectricianNotes(e.target.value)}
                  placeholder="e.g. Sparking sound from main distribution box"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Service Address & GPS Location
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">{userCoords.address}</p>
                    <p className="text-slate-400 text-[10px]">Lat: {userCoords.lat}, Lng: {userCoords.lng}</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Broadcasting to Nearest Electricians...' : '⚡ Dispatch 24/7 Electrician (₹149)'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 8. Emergency Plumber Modal */}
      {sosModal === 'plumber' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Emergency Plumber & Leak Repair
                  </h3>
                  <p className="text-xs text-slate-500">25-Min Rapid Arrival • ₹149 Base Inspection</p>
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

            <form onSubmit={handlePlumberSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                  Select Plumbing Issue
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Pipe Burst / Major Leakage',
                    'Water Pump Motor Not Working',
                    'Tap Broken / Continuous Gush',
                    'Bathroom / Kitchen Drain Choked'
                  ].map((issue) => (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => setPlumberIssue(issue)}
                      className={`p-2.5 rounded-xl text-xs font-bold border text-left transition-all ${
                        plumberIssue === issue
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {issue}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Describe Leak / Details (Optional)
                </label>
                <input
                  type="text"
                  value={plumberNotes}
                  onChange={(e) => setPlumberNotes(e.target.value)}
                  placeholder="e.g. Under-sink supply line joint is broken"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Service Address & GPS Location
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">{userCoords.address}</p>
                    <p className="text-slate-400 text-[10px]">Lat: {userCoords.lat}, Lng: {userCoords.lng}</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-extrabold py-3 rounded-2xl shadow-lg active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
              >
                {loading ? 'Broadcasting to Nearest Plumbers...' : '🚰 Dispatch Emergency Plumber (₹149)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
