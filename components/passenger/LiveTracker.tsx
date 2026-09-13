// components/passenger/LiveTracker.tsx - ENHANCED WITH SEARCH & FLY-TO ZOOM & ALL ROUTE BUSES

import React, { useState, useEffect, useMemo } from 'react';
import { routes, vehicles as mockVehicles } from '../../data';
import { Route, LiveVehicle, Report } from '../../types';
import BusIcon from '../icons/BusIcon';
import { subscribeToVehicleUpdates, getReportsForVehicle } from '../../services/apiService';
import SpinnerIcon from '../icons/SpinnerIcon';
import useLocalStorage from '../../hooks/useLocalStorage';

// Leaflet map imports
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';

// Helper component to smoothly animate and zoom map view to searched bus
const MapFlyToController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.5, animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

// Custom bus marker generator with status-aware styling & SVG indicators
const createBusIcon = (status: LiveVehicle['status'], isSelected: boolean, stickerCode?: string) => {
  const isFailure = status === 'Failure';
  const isPause = status === 'Pause';

  // Status-aware colors
  const pinColor = isFailure ? '#EF4444' : isPause ? '#F59E0B' : '#10B981'; // Red for breakdown, Amber for delayed, Green for active
  const label = stickerCode ? stickerCode.replace('MTC-', '') : 'BUS';
  const size = isSelected ? 36 : 28;

  const statusSvg = isFailure
    ? `<path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V10h2v2z"/>` // Hazard triangle
    : isPause
    ? `<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>` // Clock
    : `<path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>`; // Bus

  const pulseRing = isFailure
    ? `<div style="position: absolute; top: -5px; left: -5px; width: ${size + 10}px; height: ${size + 10}px; border-radius: 50%; border: 2px solid #EF4444; animation: ping 1.5s infinite; opacity: 0.8;"></div>`
    : isPause
    ? `<div style="position: absolute; top: -3px; left: -3px; width: ${size + 6}px; height: ${size + 6}px; border-radius: 50%; border: 2px dashed #F59E0B;"></div>`
    : '';

  const iconHtml = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      ${pulseRing}
      <div style="
        background-color: ${pinColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        box-shadow: ${isSelected ? '0 0 16px rgba(16, 185, 129, 0.9)' : '0 3px 10px rgba(0,0,0,0.35)'};
        border: ${isSelected ? '3.5px solid #4F46E5' : '2.5px solid #FFFFFF'};
        display: flex;
        justify-content: center;
        align-items: center;
        transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'};
        transition: all 0.25s ease;
      ">
        <svg style="width: ${isSelected ? 18 : 15}px; height: ${isSelected ? 18 : 15}px; fill: white;" viewBox="0 0 24 24">
          ${statusSvg}
        </svg>
      </div>
      <div style="
        background-color: ${isSelected ? '#4F46E5' : '#1E293B'};
        color: #FFFFFF;
        font-size: 10px;
        font-weight: 800;
        font-family: monospace;
        padding: 1.5px 5px;
        border-radius: 5px;
        margin-top: 3px;
        white-space: nowrap;
        box-shadow: 0 2px 4px rgba(0,0,0,0.4);
      ">
        ${label}
      </div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-passenger-leaflet-icon',
    iconSize: [size + 16, size + 22],
    iconAnchor: [(size + 16) / 2, (size + 22) / 2]
  });
};

interface LiveTrackerProps {
  isEmergencyMode: boolean;
}

const LiveTracker: React.FC<LiveTrackerProps> = ({ isEmergencyMode }) => {
  const [liveVehicles, setLiveVehicles] = useState<(LiveVehicle & { stickerCode?: string })[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<(LiveVehicle & { stickerCode?: string }) | null>(null);
  const [vehicleReports, setVehicleReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Search Bus State
  const [searchQuery, setSearchQuery] = useState('');
  
  // Map View State
  const [mapCenter, setMapCenter] = useState<[number, number]>([13.0827, 80.2707]);
  const [mapZoom, setMapZoom] = useState<number>(12);

  // User votes for reports in tracker bottom sheet
  const [trackerVotes, setTrackerVotes] = useLocalStorage<Record<string, 'up' | 'down'>>('user-report-votes', {});

  useEffect(() => {
    const unsubscribe = subscribeToVehicleUpdates(updatedVehicles => {
      // Merge sticker codes from mockVehicles if missing
      const enriched = updatedVehicles.map(v => {
        const mockMatch = mockVehicles.find(mv => mv.id === v.id);
        return {
          ...v,
          stickerCode: (v as any).stickerCode || mockMatch?.stickerCode || `MTC-${v.id.slice(-4)}`
        };
      });
      setLiveVehicles(enriched);
      if (isLoading) setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isLoading]);

  // Handle vehicle reports fetching when a vehicle is selected
  useEffect(() => {
    if (selectedVehicle) {
      const updatedSelected = liveVehicles.find(v => v.id === selectedVehicle.id);
      if (updatedSelected) setSelectedVehicle(updatedSelected);

      const fetchReports = async () => {
        setIsLoadingReports(true);
        const reports = await getReportsForVehicle(selectedVehicle.id);
        setVehicleReports(reports);
        setIsLoadingReports(false);
      };
      fetchReports();
    } else {
      setVehicleReports([]);
    }
  }, [liveVehicles, selectedVehicle?.id]);

  // Filtered buses based on search query across ALL routes
  const filteredVehicles = useMemo(() => {
    if (!searchQuery.trim()) return liveVehicles;
    const query = searchQuery.trim().toLowerCase();
    return liveVehicles.filter(v => {
      const sticker = (v.stickerCode || '').toLowerCase();
      const id = v.id.toLowerCase();
      const destination = (v.routeDetails?.destination || '').toLowerCase();
      const nextStop = (v.routeDetails?.nextStop || '').toLowerCase();
      const route = routes.find(r => r.id === v.routeId);
      const routeName = (route?.name || '').toLowerCase();

      return (
        sticker.includes(query) ||
        id.includes(query) ||
        destination.includes(query) ||
        nextStop.includes(query) ||
        routeName.includes(query) ||
        (query.includes('21g') && sticker.includes('21g')) ||
        (query.includes('570') && sticker.includes('570')) ||
        (query.includes('47d') && sticker.includes('47d')) ||
        (query.includes('54') && sticker.includes('54'))
      );
    });
  }, [liveVehicles, searchQuery]);

  // Zoom in & fly to searched/selected bus
  const handleSelectBus = (vehicle: LiveVehicle & { stickerCode?: string }) => {
    setSelectedVehicle(vehicle);
    setMapCenter([vehicle.lat, vehicle.lng]);
    setMapZoom(15);
  };

  // Upvote/Downvote report inside tracker bottom sheet
  const handleVoteInTracker = (reportId: string, type: 'up' | 'down') => {
    setTrackerVotes(prev => ({ ...prev, [reportId]: type }));
    setVehicleReports(prev => prev.map(r => {
      if (r.id !== reportId) return r;
      return {
        ...r,
        upvotes: type === 'up' ? r.upvotes + 1 : Math.max(0, r.upvotes - 1),
        downvotes: type === 'down' ? (r.downvotes || 0) + 1 : Math.max(0, (r.downvotes || 0) - 1)
      };
    }));
  };

  // Get route coords for selected bus to draw polyline
  const activeRoute = useMemo(() => {
    if (!selectedVehicle) return null;
    return routes.find(r => r.id === selectedVehicle.routeId);
  }, [selectedVehicle]);

  const activeRoutePolyline = useMemo(() => {
    if (!activeRoute?.stopsCoords) return [];
    return activeRoute.stopsCoords.map(c => [c.lat, c.lng] as [number, number]);
  }, [activeRoute]);

  return (
    <div className="space-y-4">
      {/* HEADER & BUS SEARCH CONTROLS */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>📍 Live Vehicle Tracker</span>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {liveVehicles.length} Buses Active
              </span>
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Search any bus sticker code or route to zoom in, plot live coordinates, and view condition reports.
            </p>
          </div>

          {/* Quick Clear or Reset Zoom */}
          <button
            onClick={() => {
              setSelectedVehicle(null);
              setSearchQuery('');
              setMapCenter([13.0827, 80.2707]);
              setMapZoom(12);
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shrink-0"
          >
            🗺️ Reset Map View
          </button>
        </div>

        {/* SEARCH BAR INPUT */}
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search bus sticker # (e.g. 21G, 570, 54, 47D), Reg # or Route Name..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-semibold dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 shadow-inner"
            />
            <span className="absolute left-3.5 top-3.5 text-slate-400 text-base">🔍</span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full"
              >
                Clear
              </button>
            )}
          </div>

          {/* QUICK SEARCH PILLS */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-bold shrink-0">Quick Search:</span>
            {[
              { code: '21G', name: 'Marina' },
              { code: '570', name: 'OMR IT' },
              { code: '54', name: 'Porur' },
              { code: '47D', name: 'Anna Nagar' },
              { code: '70V', name: 'Tambaram' },
              { code: 'G18', name: 'Airport' }
            ].map(item => (
              <button
                key={item.code}
                onClick={() => {
                  setSearchQuery(item.code);
                  const matched = liveVehicles.find(v => (v.stickerCode || '').includes(item.code));
                  if (matched) handleSelectBus(matched);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border transition-all ${
                  searchQuery.toUpperCase().includes(item.code)
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700'
                }`}
              >
                #{item.code} ({item.name})
              </button>
            ))}
          </div>
        </div>

        {/* SEARCH RESULTS SUGGESTIONS OVERLAY */}
        {searchQuery && filteredVehicles.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 max-h-40 overflow-y-auto">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Matching Buses ({filteredVehicles.length}):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {filteredVehicles.map(bus => (
                <button
                  key={bus.id}
                  onClick={() => handleSelectBus(bus)}
                  className={`text-left p-2 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    selectedVehicle?.id === bus.id
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  <div>
                    <span className="font-mono font-extrabold">{bus.stickerCode || bus.id}</span>
                    <p className="text-[10px] opacity-80 truncate max-w-[140px]">{bus.routeDetails.destination}</p>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shrink-0">
                    Zoom 🔎
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MAP CONTAINER */}
      <div className="h-[65vh] max-h-[720px] bg-slate-200 rounded-2xl overflow-hidden relative border-2 border-slate-300 shadow-md dark:bg-slate-700 dark:border-slate-600">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800">
            <SpinnerIcon className="w-12 h-12 text-indigo-500 animate-spin" />
            <p className="mt-4 text-sm font-semibold text-slate-500 dark:text-slate-400">
              Connecting to live vehicle tracking network...
            </p>
          </div>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            {/* Smooth Fly-To controller */}
            <MapFlyToController center={mapCenter} zoom={mapZoom} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* DRAW ROUTE POLYLINE IF BUS SELECTED */}
            {activeRoutePolyline.length > 0 && (
              <Polyline
                positions={activeRoutePolyline}
                pathOptions={{ color: '#4F46E5', weight: 5, opacity: 0.8, dashArray: '8, 8' }}
              />
            )}

            {/* HIGHLIGHT RIPPLE FOR SEARCHED/SELECTED BUS */}
            {selectedVehicle && (
              <CircleMarker
                center={[selectedVehicle.lat, selectedVehicle.lng]}
                radius={24}
                pathOptions={{
                  color: '#10B981',
                  fillColor: '#10B981',
                  fillOpacity: 0.25,
                  weight: 2
                }}
              />
            )}

            {/* RENDER ALL BUSES ACROSS ALL ROUTES */}
            {filteredVehicles.map(vehicle => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              return (
                <Marker
                  key={vehicle.id}
                  position={[vehicle.lat, vehicle.lng]}
                  icon={createBusIcon(vehicle.status, isSelected, vehicle.stickerCode)}
                  eventHandlers={{
                    click: () => handleSelectBus(vehicle),
                  }}
                >
                  <Popup>
                    <div className="text-xs p-1.5 space-y-1.5 min-w-[190px] font-sans">
                      <div className="flex items-center justify-between border-b pb-1 border-slate-200">
                        <span className="font-mono font-black text-indigo-700 text-xs">🚌 {vehicle.stickerCode || vehicle.id}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-black uppercase ${
                          vehicle.status === 'Failure'
                            ? 'bg-red-100 text-red-800'
                            : vehicle.status === 'Pause'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {vehicle.status === 'Failure' ? 'Breakdown' : vehicle.status === 'Pause' ? 'Delayed' : 'Active'}
                        </span>
                      </div>
                      <p className="text-slate-800 font-bold">To: <strong>{vehicle.routeDetails.destination}</strong></p>
                      <p className="text-slate-600">📍 Next Stop: <b>{vehicle.routeDetails.nextStop}</b></p>
                      <p className="text-slate-500">⏱️ ETA: <b className="text-slate-800">{vehicle.routeDetails.time || '10 mins'}</b></p>
                      
                      <button
                        onClick={() => handleSelectBus(vehicle)}
                        className="w-full mt-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px] text-center shadow transition-colors"
                      >
                        Inspect Live Details ➔
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {/* BOTTOM VEHICLE DETAILS CARD WITH LIVE REPORTS */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-500 ease-in-out ${selectedVehicle ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'} z-[1000]`}>
          <div className="bg-white/90 backdrop-blur-md dark:bg-slate-800/95 p-5 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-xl mx-auto space-y-4">
            {selectedVehicle && (
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 text-xs font-mono font-extrabold bg-indigo-600 text-white rounded-lg shadow-sm">
                        {selectedVehicle.stickerCode || selectedVehicle.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Reg: {selectedVehicle.id}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 mt-1">
                      {selectedVehicle.routeDetails.destination}
                    </h4>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                      Route: {routes.find(r => r.id === selectedVehicle.routeId)?.name}
                    </p>
                  </div>

                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusTextColor(selectedVehicle.status)}`}>
                    {selectedVehicle.status}
                  </span>
                </div>

                {/* DETAILS GRID */}
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-slate-400">Current Location</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{selectedVehicle.location}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Next Stop</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{selectedVehicle.routeDetails.nextStop}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-slate-400">Driver Contact</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200">{selectedVehicle.driver.name}</p>
                  </div>
                </div>

                {/* CROWDSOURCED CONDITION REPORTS FOR THIS BUS */}
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                      Live Commuter Reports for Bus {selectedVehicle.stickerCode || selectedVehicle.id}
                    </h5>
                  </div>

                  {isLoadingReports ? (
                    <p className="text-xs text-center text-slate-400 py-2">Loading reports...</p>
                  ) : vehicleReports.length > 0 ? (
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                      {vehicleReports.map(report => (
                        <div key={report.id} className="text-xs p-2.5 bg-slate-100 rounded-xl dark:bg-slate-700/60 border border-slate-200/60 dark:border-slate-600/60 flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                              <span className="text-indigo-600 dark:text-indigo-400">[{report.type}]</span>
                              <span>{report.description}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              📍 {report.location} • {report.time}
                            </p>
                          </div>

                          {/* Upvote & Downvote buttons in tracker sheet */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleVoteInTracker(report.id, 'up')}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                trackerVotes[report.id] === 'up'
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              👍 {report.upvotes}
                            </button>
                            <button
                              onClick={() => handleVoteInTracker(report.id, 'down')}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                trackerVotes[report.id] === 'down'
                                  ? 'bg-red-600 text-white border-red-600'
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              👎 {report.downvotes || 0}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-center text-slate-400 py-2 italic">
                      No active condition reports for this vehicle.
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="w-full mt-3 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline py-1"
                >
                  Close Bus Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusTextColor = (status: LiveVehicle['status']) => {
  switch (status) {
    case 'On road':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
    case 'Failure':
      return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300';
    case 'Pause':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300';
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
  }
};

export default LiveTracker;
