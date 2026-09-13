// components/authority/VehicleListPanel.tsx - RECTIFIED & ENHANCED

import React, { useState, useMemo } from 'react';
import { LiveVehicle, Route } from '../../types';
import SearchIcon from '../icons/SearchIcon';
import BusIcon from '../icons/BusIcon';

interface VehicleListPanelProps {
  vehicles: LiveVehicle[];
  routes: Route[];
  selectedVehicle: LiveVehicle | null;
  onVehicleSelect: (vehicleId: string | null) => void;
}

const VehicleListPanel: React.FC<VehicleListPanelProps> = ({
  vehicles,
  routes,
  selectedVehicle,
  onVehicleSelect,
}) => {
  const itemRefs = React.useRef<Map<string, HTMLLIElement | null>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'On road' | 'issues'>('all');

  React.useEffect(() => {
    if (selectedVehicle) {
      const node = itemRefs.current.get(selectedVehicle.id);
      if (node) {
        node.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedVehicle]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const route = routes.find(r => r.id === v.routeId);
      const stickerCode = (v as any).stickerCode || '';
      const driverName = (v.driver as { name: string })?.name || '';

      const matchesSearch =
        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stickerCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (route?.name || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (statusFilter === 'On road') return matchesSearch && v.status === 'On road';
      if (statusFilter === 'issues') return matchesSearch && (v.status === 'Failure' || v.status === 'Pause');
      return matchesSearch;
    });
  }, [vehicles, routes, searchQuery, statusFilter]);

  return (
    <div className="w-full lg:w-96 h-64 lg:h-full border-b lg:border-r lg:border-b-0 border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800 shrink-0">
      {/* PANEL HEADER */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BusIcon className="w-5 h-5 text-indigo-600" />
            <span>Live Fleet</span>
            <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-extrabold rounded-full">
              {filteredVehicles.length}
            </span>
          </h2>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search sticker code, ID, driver..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium transition dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        {/* STATUS FILTER PILLS */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('On road')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'On road'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            On Road ({vehicles.filter(v => v.status === 'On road').length})
          </button>
          <button
            onClick={() => setStatusFilter('issues')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
              statusFilter === 'issues'
                ? 'bg-red-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Issues ({vehicles.filter(v => v.status === 'Failure' || v.status === 'Pause').length})
          </button>
        </div>
      </div>

      {/* VEHICLES LIST */}
      <div className="flex-grow overflow-y-auto">
        {filteredVehicles.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No active fleet vehicles found.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredVehicles.map(vehicle => {
              const route = routes.find(r => r.id === vehicle.routeId);
              const isSelected = selectedVehicle?.id === vehicle.id;
              const stickerCode = (vehicle as any).stickerCode || vehicle.id;
              const driverName = (vehicle.driver as { name: string })?.name || 'Unassigned';

              return (
                <li
                  key={vehicle.id}
                  ref={el => { itemRefs.current.set(vehicle.id, el); }}
                  onClick={() => onVehicleSelect(vehicle.id)}
                  className={`p-3.5 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-l-4 border-indigo-600 font-semibold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">{stickerCode}</span>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100">{vehicle.id}</h3>
                    </div>

                    <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                      vehicle.status === 'On road'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : vehicle.status === 'Failure'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate max-w-[180px] font-medium">{route?.name || 'Unassigned'}</span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">👤 {driverName}</span>
                  </div>

                  <div className="mt-1 text-[11px] text-slate-400 truncate">
                    📍 {vehicle.location}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VehicleListPanel;
