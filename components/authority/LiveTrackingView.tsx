// components/authority/LiveTrackingView.tsx - RECTIFIED & FULLY FUNCTIONAL

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { routes as mockRoutes } from '../../data';
import { LiveVehicle, Route } from '../../types';
import VehicleListPanel from './VehicleListPanel';
import VehicleDetailsPanel from './VehicleDetailsPanel';
import LiveTrackingMap from './LiveTrackingMap';
import { subscribeToVehicleUpdates, getVehicles } from '../../services/apiService';
import SpinnerIcon from '../icons/SpinnerIcon';

interface LiveTrackingViewProps {
  initialVehicleId: string | null;
}

const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({ initialVehicleId }) => {
  const [liveVehicles, setLiveVehicles] = useState<LiveVehicle[]>([]);
  const [allRoutes] = useState<Route[]>(mockRoutes);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(initialVehicleId);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const initial = await getVehicles();
        if (isMounted) {
          setLiveVehicles(initial);
          setIsLoading(false);
        }
      } catch {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    const unsubscribe = subscribeToVehicleUpdates((updatedVehicles) => {
      if (isMounted && updatedVehicles && updatedVehicles.length > 0) {
        setLiveVehicles(updatedVehicles);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleVehicleSelect = useCallback((vehicleId: string | null) => {
    setSelectedVehicleId(prevId => (prevId === vehicleId ? null : vehicleId));
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedVehicleId(null);
  }, []);

  const selectedVehicle = useMemo(() => {
    return liveVehicles.find(v => v.id === selectedVehicleId) || null;
  }, [liveVehicles, selectedVehicleId]);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center space-y-3">
        <SpinnerIcon className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          Initializing live fleet telematics & GPS connection...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-8rem)] min-h-[500px] flex flex-col lg:flex-row relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg bg-white dark:bg-slate-900">
      {/* LEFT VEHICLE LIST PANEL */}
      <VehicleListPanel
        vehicles={liveVehicles}
        routes={allRoutes}
        selectedVehicle={selectedVehicle}
        onVehicleSelect={handleVehicleSelect}
      />

      {/* MAP CANVAS */}
      <div className="flex-1 relative h-full min-h-[350px]">
        <LiveTrackingMap
          selectedVehicle={selectedVehicle}
          vehicles={liveVehicles}
          routes={allRoutes}
          onVehicleSelect={handleVehicleSelect}
        />
      </div>

      {/* SLIDING VEHICLE DETAILS DRAWER / PANEL */}
      <VehicleDetailsPanel
        vehicle={selectedVehicle}
        routes={allRoutes}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

export default LiveTrackingView;
