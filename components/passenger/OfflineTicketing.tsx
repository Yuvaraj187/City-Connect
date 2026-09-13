// components/passenger/OfflineTicketing.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { getRoutes, getVehicles } from '../../services/apiService';
import { Ticket, Route, Vehicle } from '../../types';
import { buyTicket, getMyTickets, validateTicket } from '../../services/apiService';
import TicketDetailsModal from './TicketDetailsModal';
import SpinnerIcon from '../icons/SpinnerIcon';
import TrashIcon from '../icons/TrashIcon';
import toast from 'react-hot-toast';

interface OfflineTicketingProps {
  isOnline: boolean;
}

const OfflineTicketing: React.FC<OfflineTicketingProps> = ({ isOnline }) => {
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<(Vehicle & { stickerCode?: string })[]>([]);
  
  // Booking mode: common_route vs specific_bus
  const [bookingMode, setBookingMode] = useState<'common_route' | 'specific_bus'>('common_route');
  const [busStickerCode, setBusStickerCode] = useState<string>('');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [fromStop, setFromStop] = useState<string>('');
  const [toStop, setToStop] = useState<string>('');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  
  // Payment modal state
  const [showUpiModal, setShowUpiModal] = useState<boolean>(false);
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'qr'>('gpay');
  const [upiId, setUpiId] = useState<string>('passenger@okaxis');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);

  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const [ticketsFromDb, routesFromDb, vehiclesFromDb] = await Promise.all([
        getMyTickets(),
        getRoutes(),
        getVehicles()
      ]);
      setMyTickets(ticketsFromDb);
      setAllRoutes(routesFromDb);
      setVehicles(vehiclesFromDb);

      if (routesFromDb.length > 0) {
        setSelectedRouteId(routesFromDb[0].id);
      }
      setIsLoading(false);
    };
    loadInitialData();
  }, []);

  // Match active vehicle by sticker code or ID
  const matchedVehicle = useMemo(() => {
    if (!busStickerCode.trim()) return null;
    const normInput = busStickerCode.trim().toLowerCase();
    return vehicles.find(v => 
      (v.stickerCode && v.stickerCode.toLowerCase().includes(normInput)) ||
      v.id.toLowerCase().includes(normInput)
    ) || null;
  }, [busStickerCode, vehicles]);

  // When vehicle matches or changes, automatically update the route!
  useEffect(() => {
    if (matchedVehicle && matchedVehicle.routeId) {
      setSelectedRouteId(matchedVehicle.routeId);
    }
  }, [matchedVehicle]);

  const selectedRoute = useMemo(() => {
    return allRoutes.find(r => r.id === selectedRouteId) || (allRoutes.length > 0 ? allRoutes[0] : null);
  }, [allRoutes, selectedRouteId]);

  const fromStops = useMemo(() => selectedRoute?.stops || [], [selectedRoute]);
  
  const toStops = useMemo(() => {
    if (!selectedRoute || !fromStop) return [];
    const fromIndex = selectedRoute.stops.indexOf(fromStop);
    return fromIndex === -1 ? [] : selectedRoute.stops.slice(fromIndex + 1);
  }, [selectedRoute, fromStop]);

  useEffect(() => {
    if (selectedRoute && fromStops.length > 0) {
      setFromStop(fromStops[0]);
    }
  }, [selectedRouteId, selectedRoute]);

  useEffect(() => {
    if (toStops.length > 0) {
      setToStop(toStops[0]);
    } else {
      setToStop('');
    }
  }, [fromStop, selectedRouteId]);

  // Auto-calculated fare
  const totalFare = useMemo(() => {
    if (!selectedRoute || !fromStop || !toStop) return 0;
    const fromIndex = selectedRoute.stops.indexOf(fromStop);
    const toIndex = selectedRoute.stops.indexOf(toStop);
    if (fromIndex === -1 || toIndex === -1) return 0;
    const stopsTravelled = Math.abs(toIndex - fromIndex);
    const baseFare = 10;
    const farePerStop = 2.5;
    return Math.round((baseFare + (stopsTravelled * farePerStop)) * passengerCount);
  }, [selectedRoute, fromStop, toStop, passengerCount]);

  const activeTickets = useMemo(() => myTickets.filter(t => t.status === 'active'), [myTickets]);
  const historyTickets = useMemo(() => myTickets.filter(t => t.status === 'validated'), [myTickets]);

  const handleOpenUpiModal = () => {
    if (!selectedRoute || !fromStop || !toStop) {
      toast.error("Please select boarding and destination stops.");
      return;
    }
    if (totalFare <= 0) {
      toast.error("Invalid route fare calculation.");
      return;
    }
    setShowUpiModal(true);
  };

  const handleCompleteUpiPayment = async () => {
    setIsProcessingPayment(true);

    // Simulate UPI Gateway handshake (1.2s delay)
    await new Promise(resolve => setTimeout(resolve, 1200));

    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + 4); // Ticket valid for 4 hours

    const isCommonPass = bookingMode === 'common_route' || !busStickerCode.trim();
    const busLabel = isCommonPass ? 'Common Route Pass' : (matchedVehicle ? (matchedVehicle.stickerCode || matchedVehicle.id) : busStickerCode.trim());

    const newTicketData = {
      route_id: selectedRoute!.id,
      route_name: isCommonPass ? `${selectedRoute!.name} (Common Ticket)` : `${selectedRoute!.name} [${busLabel}]`,
      from_stop: fromStop,
      to_stop: toStop,
      passenger_count: passengerCount,
      total_fare: totalFare,
      valid_until: validUntil.toISOString()
    };

    const boughtTicket = await buyTicket(newTicketData);
    setIsProcessingPayment(false);
    setShowUpiModal(false);

    if (boughtTicket) {
      toast.success(`UPI Payment Successful! Ticket for ₹${totalFare} generated.`);
      setMyTickets([boughtTicket, ...myTickets]);
    } else {
      toast.error("Failed to generate ticket. Please try again.");
    }
  };

  const handleTagBusCode = (ticketId: string, busCode: string) => {
    setMyTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const baseRouteName = t.route_name.replace(/\s*\(Common Ticket\)/g, '').replace(/\s*\[.*?\]/g, '').trim();
        return {
          ...t,
          route_name: `${baseRouteName} [${busCode}]`,
          validated_on_bus: busCode
        };
      }
      return t;
    }));
    toast.success(`Ticket tagged to Bus ${busCode}! The driver can now identify this bill.`);
    
    setSelectedTicket(prev => prev && prev.id === ticketId ? {
      ...prev,
      route_name: `${prev.route_name.replace(/\s*\(Common Ticket\)/g, '').replace(/\s*\[.*?\]/g, '').trim()} [${busCode}]`,
      validated_on_bus: busCode
    } : prev);
  };

  const handleValidateTicket = async (ticketId: string, customBusCode?: string) => {
    const ticketToValidate = myTickets.find(t => t.id === ticketId);
    if (!ticketToValidate) return;
    
    const assignedBusMatch = ticketToValidate.route_name.match(/\[(.*?)\]/);
    const busName = customBusCode || ticketToValidate.validated_on_bus || (assignedBusMatch ? assignedBusMatch[1] : null) || allRoutes.find(r => r.id === ticketToValidate.route_id)?.name || 'MTC Bus';

    const success = await validateTicket(ticketId, busName);
    if (success) {
      setMyTickets(prev => prev.map(t => 
        t.id === ticketId 
          ? { ...t, status: 'validated', validated_on_bus: busName, validated_at: new Date().toISOString() } 
          : t
      ));
      toast.success(`Ticket validated successfully on Bus ${busName}!`);
    }
    setSelectedTicket(null);
  };

  const handleClearHistory = () => {
    setMyTickets(prev => prev.filter(t => t.status !== 'validated'));
    toast.success("Ticket history cleared.");
  };

  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">MTC Digital Ticketing</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter the unique stickered bus code displayed inside the bus to purchase instant UPI tickets.
            </p>
          </div>
          <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Verified MTC Service
          </div>
        </div>

        {!isOnline && (
          <div className="p-3 bg-amber-100 text-amber-800 rounded-xl text-sm text-center font-medium dark:bg-amber-500/10 dark:text-amber-300 mb-4 border border-amber-200 dark:border-amber-700/50">
            ⚠️ You are currently offline. Purchased tickets remain stored on your device for offline QR verification.
          </div>
        )}

        <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 shadow-md space-y-5">
          {/* STEP 1: BOOKING MODE & BUS CODE CHOICE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                1. Select Ticket Type
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Don't know the bus code? Select Common Route Pass!
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setBookingMode('common_route');
                  setBusStickerCode('');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  bookingMode === 'common_route'
                    ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30 text-indigo-900 dark:text-indigo-100 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🎟️</span>
                  <div>
                    <div className="text-xs font-extrabold">Common Route Ticket</div>
                    <div className="text-[10px] font-normal opacity-80">Buy for route now; select bus code on boarding</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setBookingMode('specific_bus');
                  if (!busStickerCode) setBusStickerCode('MTC-21G-01');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  bookingMode === 'specific_bus'
                    ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/60 ring-2 ring-indigo-500/30 text-indigo-900 dark:text-indigo-100 font-bold shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🚌</span>
                  <div>
                    <div className="text-xs font-extrabold">Specific Bus Sticker Code</div>
                    <div className="text-[10px] font-normal opacity-80">Enter sticker code printed inside the bus</div>
                  </div>
                </div>
              </button>
            </div>

            {bookingMode === 'specific_bus' && (
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={busStickerCode}
                    onChange={e => setBusStickerCode(e.target.value.toUpperCase())}
                    placeholder="e.g. MTC-21G-01, MTC-47D-02, MTC-570-01"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-mono font-bold text-lg border border-slate-300 dark:border-slate-600 rounded-xl shadow-inner focus:ring-2 focus:ring-indigo-500 uppercase tracking-wide"
                  />
                  <div className="absolute right-3 top-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2.5 py-1 rounded-lg text-xs font-semibold">
                    Bus Code
                  </div>
                </div>

                {/* Quick Sticker Pills */}
                <div className="mt-2.5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">Popular Buses:</span>
                  {[
                    { code: 'MTC-21G-01', label: '#21G (T. Nagar ➔ Marina)' },
                    { code: 'MTC-47D-01', label: '#47D (Guindy ➔ Anna Nagar)' },
                    { code: 'MTC-570-01', label: '#570 Express (CMBT ➔ OMR)' },
                    { code: 'MTC-70V-01', label: '#70V (CMBT ➔ Tambaram)' },
                    { code: 'MTC-54-01', label: '#54 (Broadway ➔ Porur)' },
                  ].map(b => (
                    <button
                      key={b.code}
                      type="button"
                      onClick={() => setBusStickerCode(b.code)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                        busStickerCode.toUpperCase() === b.code
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-600'
                      }`}
                    >
                      {b.code}
                    </button>
                  ))}
                </div>

                {/* Matched Bus Badge Info */}
                {matchedVehicle ? (
                  <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow">
                        MTC
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          Bus Code: <span className="text-indigo-600 dark:text-indigo-400 font-mono">{matchedVehicle.stickerCode || matchedVehicle.id}</span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Reg: {matchedVehicle.id} • Driver: {matchedVehicle.driver.name}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs font-bold rounded">
                        Active & On Road
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">
                    * Note: Entering any valid MTC Bus sticker code automatically syncs route & stops.
                  </div>
                )}
              </div>
            )}

            {bookingMode === 'common_route' && (
              <div className="p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2.5">
                <span className="text-lg">💡</span>
                <div>
                  <strong className="block font-bold">Common Route Ticket:</strong>
                  Select your route & stops below to buy a common ticket. When you step onto the bus, you can select or enter the bus sticker code so the driver can identify your bill!
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: SELECT ROUTE & STOPS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-700/60">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Bus Line Route</label>
              <select
                value={selectedRouteId}
                onChange={e => setSelectedRouteId(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                {allRoutes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.name} ({route.from} ➔ {route.to})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Boarding Stop (From)</label>
              <select
                value={fromStop}
                onChange={e => setFromStop(e.target.value)}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              >
                {fromStops.map(stop => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Destination Stop (To)</label>
              <select
                value={toStop}
                onChange={e => setToStop(e.target.value)}
                disabled={toStops.length === 0}
                className="w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {toStops.map(stop => (
                  <option key={stop} value={stop}>{stop}</option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 3: PASSENGERS & AUTO FARE CALCULATION */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Passengers:</span>
              <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-700">
                <button
                  type="button"
                  onClick={() => setPassengerCount(Math.max(1, passengerCount - 1))}
                  className="px-3 py-1.5 text-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                >
                  -
                </button>
                <span className="px-4 font-bold text-slate-900 dark:text-slate-100 text-base">{passengerCount}</span>
                <button
                  type="button"
                  onClick={() => setPassengerCount(Math.min(10, passengerCount + 1))}
                  className="px-3 py-1.5 text-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Fare</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{totalFare}</span>
              </div>

              <button
                type="button"
                onClick={handleOpenUpiModal}
                disabled={!isOnline || totalFare <= 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Pay via UPI (₹{totalFare})</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TICKETS DISPLAY SECTIONS */}
      <div className="space-y-8">
        <ActiveTicketsSection tickets={activeTickets} onSelect={setSelectedTicket} onTagBusCode={handleTagBusCode} />
        <HistoryTicketsSection tickets={historyTickets} onSelect={setSelectedTicket} onClear={handleClearHistory} />
      </div>

      {/* UPI PAYMENT MODAL */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  UPI
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">Quick UPI Ticket Checkout</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Instant MTC Ticket Generation</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpiModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Fare Summary Box */}
            <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Ticket Type:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {bookingMode === 'common_route' || !busStickerCode.trim() ? 'Common Route Ticket' : (matchedVehicle?.stickerCode || busStickerCode)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Route:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{fromStop} ➔ {toStop}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Passengers:</span>
                <span className="font-medium text-slate-700 dark:text-slate-200">{passengerCount} Person(s)</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span className="text-slate-800 dark:text-slate-100">Total Payable:</span>
                <span className="text-emerald-600 dark:text-emerald-400 text-xl font-black">₹{totalFare}</span>
              </div>
            </div>

            {/* UPI Option Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gpay', name: 'Google Pay', icon: '🔵' },
                  { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                  { id: 'paytm', name: 'Paytm UPI', icon: '🔷' },
                  { id: 'bhim', name: 'BHIM UPI', icon: '🟢' },
                ].map(app => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => setSelectedUpiApp(app.id as any)}
                    className={`p-3 rounded-xl text-left border flex items-center gap-2 font-semibold text-xs transition-all ${
                      selectedUpiApp === app.id
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{app.icon}</span>
                    <span>{app.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Virtual Payment Address (VPA) Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Enter VPA / UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                placeholder="mobile@upi or username@okaxis"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowUpiModal(false)}
                className="w-1/3 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteUpiPayment}
                disabled={isProcessingPayment}
                className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isProcessingPayment ? (
                  <>
                    <SpinnerIcon className="w-5 h-5 text-white" />
                    <span>Authorizing UPI...</span>
                  </>
                ) : (
                  <span>Approve & Pay ₹{totalFare}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TICKET DETAILS MODAL */}
      <TicketDetailsModal 
        ticket={selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
        onValidate={handleValidateTicket}
        onTagBusCode={handleTagBusCode}
        availableVehicles={vehicles}
      />
    </div>
  );
};

// ACTIVE TICKETS LIST
const ActiveTicketsSection: React.FC<{ 
  tickets: Ticket[]; 
  onSelect: (ticket: Ticket) => void;
  onTagBusCode: (ticketId: string, busCode: string) => void;
}> = ({ tickets, onSelect, onTagBusCode }) => {
  const [taggingTicketId, setTaggingTicketId] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState<string>('');

  return (
    <div>
      <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>Active Digital Tickets</span>
          <span className="px-2 py-0.5 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full font-bold">
            {tickets.length} Available
          </span>
        </div>
      </h4>
      {tickets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tickets.map(ticket => {
            const assignedBusMatch = ticket.route_name.match(/\[(.*?)\]/);
            const assignedBus = ticket.validated_on_bus || (assignedBusMatch ? assignedBusMatch[1] : null);

            return (
              <div
                key={ticket.id}
                className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-white/5 rounded-full blur-lg"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                      {ticket.route_name}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] uppercase font-extrabold bg-emerald-500 text-slate-950 rounded shadow">
                      Active Pass
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-200">{ticket.from_stop} ➔ {ticket.to_stop}</p>

                  {/* BUS CODE BADGE OR TAGGER */}
                  <div className="mt-3 p-2.5 bg-white/10 rounded-xl text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-indigo-200 font-medium">Billed Bus Code:</span>
                      {assignedBus ? (
                        <span className="font-mono font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded text-xs border border-emerald-400/40">
                          {assignedBus}
                        </span>
                      ) : (
                        <span className="font-bold bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">
                          Unassigned
                        </span>
                      )}
                    </div>

                    {!assignedBus && taggingTicketId === ticket.id ? (
                      <div className="flex gap-1 pt-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="text"
                          value={inputCode}
                          onChange={e => setInputCode(e.target.value.toUpperCase())}
                          placeholder="e.g. MTC-21G-01"
                          className="flex-1 px-2 py-1 bg-slate-800 border border-slate-600 rounded text-xs font-mono font-bold uppercase text-white"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (inputCode.trim()) {
                              onTagBusCode(ticket.id, inputCode.trim().toUpperCase());
                              setTaggingTicketId(null);
                              setInputCode('');
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded shadow"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTaggingTicketId(null);
                          }}
                          className="px-2 py-1 bg-slate-700 text-slate-300 text-[11px] rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ) : !assignedBus ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaggingTicketId(ticket.id);
                          setInputCode('');
                        }}
                        className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] rounded transition-colors text-center shadow-sm"
                      >
                        🚌 Select / Tag Bus Code on Boarding
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-3">
                  <div>
                    <span className="text-2xl font-black text-white">₹{ticket.total_fare}</span>
                    <span className="text-xs text-slate-300 ml-1 font-medium">({ticket.passenger_count} pass)</span>
                  </div>
                  <button
                    onClick={() => onSelect(ticket)}
                    className="text-xs text-indigo-200 hover:text-white font-bold flex items-center gap-1 underline"
                  >
                    View QR Pass ➔
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-slate-500 dark:text-slate-400 p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-dashed border-2 dark:border-slate-700">
          <p className="font-semibold text-slate-700 dark:text-slate-300">No active tickets found.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select a route or bus code above to purchase your journey ticket.</p>
        </div>
      )}
    </div>
  );
};

// HISTORY TICKETS LIST
const HistoryTicketsSection: React.FC<{ tickets: Ticket[]; onSelect: (ticket: Ticket) => void; onClear: () => void }> = ({ tickets, onSelect, onClear }) => (
  <div>
    <div className="flex justify-between items-center mb-3">
      <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">Validated Ticket History</h4>
      {tickets.length > 0 && (
        <button
          onClick={onClear}
          className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-slate-100 text-slate-600 font-semibold rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      )}
    </div>
    {tickets.length > 0 ? (
      <div className="space-y-3">
        {tickets.map(ticket => (
          <button
            key={ticket.id}
            onClick={() => onSelect(ticket)}
            className="w-full text-left bg-white dark:bg-slate-800/80 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{ticket.route_name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{ticket.from_stop} to {ticket.to_stop}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Validated: {new Date(ticket.validated_at!).toLocaleTimeString()} on {ticket.validated_on_bus}
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-slate-700 dark:text-slate-300">₹{ticket.total_fare}</span>
              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Validated</span>
            </div>
          </button>
        ))}
      </div>
    ) : (
      <div className="text-center text-slate-500 dark:text-slate-400 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl border-dashed border-2 dark:border-slate-700">
        <p className="font-medium text-xs">No validated historical tickets.</p>
      </div>
    )}
  </div>
);

export default OfflineTicketing;
