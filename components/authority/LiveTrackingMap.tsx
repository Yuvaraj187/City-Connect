// components/authority/LiveTrackingMap.tsx - RECTIFIED WITHOUT RENDERTOSTRING

import React, { useEffect } from 'react';
import { LiveVehicle, Route } from '../../types';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';

// Status metadata mapping for custom icons
const getStatusMeta = (status: LiveVehicle['status']) => {
  if (status === 'Failure') {
    return {
      label: 'BREAKDOWN',
      bgColor: '#EF4444', // Red
      borderRingColor: '#DC2626',
      badgeBg: '#FEE2E2',
      badgeText: '#991B1B',
      shadowColor: 'rgba(239, 68, 68, 0.65)',
      type: 'breakdown',
      statusText: '🔴 Vehicle Breakdown Alert',
      // Exclamation hazard triangle icon SVG
      iconSvg: `<path d="M12 2L1 21h22L12 2zm1 14h-2v-2h2v2zm0-4h-2V10h2v2z"/>`
    };
  }
  if (status === 'Pause') {
    return {
      label: 'DELAYED',
      bgColor: '#F59E0B', // Amber
      borderRingColor: '#D97706',
      badgeBg: '#FEF3C7',
      badgeText: '#92400E',
      shadowColor: 'rgba(245, 158, 11, 0.55)',
      type: 'delayed',
      statusText: '🟠 Delayed / Service Pause',
      // Clock/Pause icon SVG
      iconSvg: `<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>`
    };
  }
  // Default 'On road' / Active
  return {
    label: 'ACTIVE',
    bgColor: '#10B981', // Green
    borderRingColor: '#059669',
    badgeBg: '#D1FAE5',
    badgeText: '#065F46',
    shadowColor: 'rgba(16, 185, 129, 0.55)',
    type: 'active',
    statusText: '🟢 Active & On Schedule',
    // Bus icon SVG
    iconSvg: `<path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>`
  };
};

// Create custom status-aware Leaflet icon directly with pure string SVG
const createStatusAwareIcon = (status: LiveVehicle['status'], isSelected: boolean, stickerCode?: string) => {
  const meta = getStatusMeta(status);
  const size = isSelected ? 38 : 30;
  const labelText = stickerCode ? stickerCode.replace('MTC-', '') : meta.label;

  const pulseRingHtml = meta.type === 'breakdown'
    ? `<div style="
        position: absolute;
        top: -6px;
        left: -6px;
        width: ${size + 12}px;
        height: ${size + 12}px;
        border-radius: 50%;
        border: 2px solid #EF4444;
        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        opacity: 0.75;
      "></div>`
    : meta.type === 'delayed'
    ? `<div style="
        position: absolute;
        top: -4px;
        left: -4px;
        width: ${size + 8}px;
        height: ${size + 8}px;
        border-radius: 50%;
        border: 2px dashed #F59E0B;
      "></div>`
    : isSelected
    ? `<div style="
        position: absolute;
        top: -4px;
        left: -4px;
        width: ${size + 8}px;
        height: ${size + 8}px;
        border-radius: 50%;
        border: 2px solid #10B981;
      "></div>`
    : '';

  const badgeDotHtml = `
    <div style="
      position: absolute;
      top: -2px;
      right: -2px;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: ${meta.bgColor};
      border: 2px solid #FFFFFF;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    "></div>
  `;

  const iconHtml = `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    ">
      ${pulseRingHtml}
      <div style="
        background-color: ${meta.bgColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        box-shadow: 0 4px 14px ${meta.shadowColor};
        border: ${isSelected ? '3.5px solid #4F46E5' : '2.5px solid #FFFFFF'};
        display: flex;
        justify-content: center;
        align-items: center;
        transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
        transition: all 0.2s ease;
        position: relative;
      ">
        <svg style="width: ${isSelected ? 20 : 16}px; height: ${isSelected ? 20 : 16}px; fill: white;" viewBox="0 0 24 24">
          ${meta.iconSvg}
        </svg>
        ${badgeDotHtml}
      </div>

      <div style="
        background-color: ${isSelected ? '#4F46E5' : '#0F172A'};
        color: #FFFFFF;
        font-size: 10px;
        font-weight: 800;
        font-family: monospace;
        padding: 2px 6px;
        border-radius: 6px;
        margin-top: 3px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        border: 1px solid rgba(255,255,255,0.2);
      ">
        ${labelText}
      </div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-status-leaflet-icon',
    iconSize: [size + 16, size + 24],
    iconAnchor: [(size + 16) / 2, (size + 24) / 2],
  });
};

interface LiveTrackingMapProps {
  selectedVehicle: LiveVehicle | null;
  vehicles: LiveVehicle[];
  routes: Route[];
  onVehicleSelect: (vehicleId: string | null) => void;
}

// Controller component to handle map invalidation & smooth pan/flyto
const MapController: React.FC<{ selectedVehicle: LiveVehicle | null }> = ({ selectedVehicle }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size to fix blank grey tile bugs on tab change or container resize
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (selectedVehicle && selectedVehicle.lat && selectedVehicle.lng) {
      map.flyTo([selectedVehicle.lat, selectedVehicle.lng], 14, {
        duration: 0.8,
      });
    }
  }, [selectedVehicle, map]);

  return null;
};

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  selectedVehicle,
  vehicles,
  routes,
  onVehicleSelect,
}) => {
  const defaultCenter: [number, number] = [13.0827, 80.2707]; // Chennai

  return (
    <div className="w-full h-full min-h-[350px] relative">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full z-10"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController selectedVehicle={selectedVehicle} />

        {/* Draw polyline route for selected vehicle */}
        {selectedVehicle && (
          <Polyline
            pathOptions={{ color: '#4F46E5', weight: 5, opacity: 0.8, dashArray: '8, 8' }}
            positions={routes.find(r => r.id === selectedVehicle.routeId)?.stopsCoords || []}
          />
        )}

        {/* Status-aware Vehicle Markers */}
        {vehicles.map(vehicle => {
          const isSelected = selectedVehicle?.id === vehicle.id;
          const route = routes.find(r => r.id === vehicle.routeId);
          const driver = vehicle.driver as { name: string; phone: string };
          const stickerCode = (vehicle as any).stickerCode || vehicle.id;
          const meta = getStatusMeta(vehicle.status);

          return (
            <Marker
              key={vehicle.id}
              position={[vehicle.lat, vehicle.lng]}
              icon={createStatusAwareIcon(vehicle.status, isSelected, stickerCode)}
              zIndexOffset={isSelected ? 1000 : 0}
              eventHandlers={{ click: () => onVehicleSelect(vehicle.id) }}
            >
              <Popup>
                <div className="p-2 font-sans space-y-2 text-slate-900 min-w-[210px]">
                  {/* HEADER WITH CODE & STATUS BADGE */}
                  <div className="flex items-center justify-between border-b pb-1.5 border-slate-200">
                    <span className="font-mono text-xs font-black text-indigo-700">{stickerCode}</span>
                    <span
                      style={{ backgroundColor: meta.badgeBg, color: meta.badgeText }}
                      className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider"
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* DETAILS */}
                  <div className="space-y-1 text-xs">
                    <div className="font-black text-slate-800 text-sm">{vehicle.id}</div>
                    <div className="text-slate-600">
                      Route: <strong className="text-slate-900">{route?.name || 'Unassigned'}</strong>
                    </div>
                    <div className="text-slate-600">
                      Driver: <strong>{driver?.name || 'Assigned Crew'}</strong>
                    </div>
                    <div className="text-slate-600">
                      📍 Location: <strong>{vehicle.location}</strong>
                    </div>
                    <div className="text-slate-500 text-[11px] font-semibold pt-1">
                      {meta.statusText}
                    </div>
                  </div>

                  {/* TELEMETRY TRIGGER */}
                  <button
                    onClick={() => onVehicleSelect(vehicle.id)}
                    className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition-all text-center flex items-center justify-center gap-1"
                  >
                    <span>View Telemetry & Diagnostics</span>
                    <span>➔</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LiveTrackingMap;
