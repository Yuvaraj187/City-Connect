// components/authority/VehicleDetailsPanel.tsx

import React from 'react';
import { LiveVehicle, Route } from '../../types';
import BusIcon from '../icons/BusIcon';
import XMarkIcon from '../icons/XMarkIcon';
import PhoneIcon from '../icons/PhoneIcon';
import ExclamationTriangleIcon from '../icons/ExclamationTriangleIcon';
import CheckBadgeIcon from '../icons/CheckBadgeIcon';

interface VehicleDetailsPanelProps {
  vehicle: LiveVehicle | null;
  routes: Route[];
  onClose: () => void;
}

const VehicleDetailsPanel: React.FC<VehicleDetailsPanelProps> = ({ vehicle, routes, onClose }) => {
  if (!vehicle) return null;

  const route = routes.find(r => r.id === vehicle.routeId);
  const driver = vehicle.driver as { name: string; phone: string };
  const stickerCode = (vehicle as any).stickerCode || vehicle.id;

  return (
    <div className="fixed inset-x-4 bottom-20 lg:bottom-4 lg:right-4 lg:left-auto lg:w-96 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl z-30 overflow-hidden flex flex-col max-h-[80vh] lg:max-h-[calc(100vh-6rem)] animate-in slide-in-from-bottom-5 duration-200">
      {/* HEADER BAR */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow">
            <BusIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-indigo-300">{stickerCode}</span>
              <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                vehicle.status === 'On road'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : vehicle.status === 'Failure'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {vehicle.status}
              </span>
            </div>
            <h3 className="text-sm font-extrabold text-white truncate max-w-[200px]">{vehicle.id}</h3>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* CONTENT SCROLL */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* ROUTE INFORMATION */}
        <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Assigned Transit Route
          </div>
          <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
            {route?.name || 'Unassigned Route'}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
            <span>Destination: <strong>{vehicle.routeDetails?.destination || 'Terminus'}</strong></span>
            <span>Next Stop: <strong>{vehicle.routeDetails?.nextStop || 'En route'}</strong></span>
          </div>
        </div>

        {/* TELEMETRY & SPEED STATS */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl text-center">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Speed</span>
            <p className="text-sm font-black text-indigo-900 dark:text-indigo-100 mt-0.5">38 km/h</p>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Pax Load</span>
            <p className="text-sm font-black text-emerald-900 dark:text-emerald-100 mt-0.5">72% Full</p>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">ETA</span>
            <p className="text-sm font-black text-amber-900 dark:text-amber-100 mt-0.5">{vehicle.routeDetails?.time || '12 mins'}</p>
          </div>
        </div>

        {/* DRIVER CONTACT & CREW */}
        <div className="p-3 bg-white dark:bg-slate-700/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase text-slate-400">Assigned Driver</div>
            <div className="font-bold text-xs text-slate-800 dark:text-slate-100">{driver?.name || 'Assigned Staff'}</div>
            <div className="text-[11px] text-slate-500">{driver?.phone || '+91 98765 00000'}</div>
          </div>
          {driver?.phone && (
            <a
              href={`tel:${driver.phone}`}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <PhoneIcon className="w-4 h-4" />
              <span>Call Crew</span>
            </a>
          )}
        </div>

        {/* TIMELINE / RECENT ACTIVITY */}
        {vehicle.timeline && vehicle.timeline.length > 0 && (
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Live Transit Timeline
            </div>
            <div className="space-y-2 pl-2 border-l-2 border-indigo-500/30">
              {vehicle.timeline.map((item, idx) => (
                <div key={idx} className="relative pl-3 text-xs space-y-0.5">
                  <div className="absolute -left-[11px] top-1 w-2 h-2 rounded-full bg-indigo-600"></div>
                  <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>{item.location}</span>
                    <span className="text-[10px] font-mono text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{item.event}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUICK AUTHORITY ACTIONS */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex gap-2">
          <button
            onClick={() => alert(`Broadcast dispatch ping sent to vehicle ${stickerCode}`)}
            className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors shadow"
          >
            Dispatch Ping
          </button>
          <button
            onClick={() => alert(`Emergency maintenance request logged for ${stickerCode}`)}
            className="flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold text-xs rounded-xl border border-red-300 dark:border-red-800 transition-colors"
          >
            Report Failure
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPanel;
