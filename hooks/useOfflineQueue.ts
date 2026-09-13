// hooks/useOfflineQueue.ts - RECTIFIED FOR AUTO-SYNC & FK ERROR RECOVERY

import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Report } from '../types';
import useLocalStorage from './useLocalStorage';
import toast from 'react-hot-toast';

type PendingReport = Omit<Report, 'id' | 'upvotes' | 'verified' | 'reporterId' | 'time' | 'isSynced' | 'created_at'> & {
  tempId: string;
};

export const useOfflineQueue = () => {
  const [pendingReports, setPendingReports] = useLocalStorage<PendingReport[]>('pending-reports', []);
  const isSyncingRef = useRef(false);

  // Sync function with automatic FK constraint error handling (Code 23503)
  const syncPendingReports = useCallback(async () => {
    if (isSyncingRef.current || pendingReports.length === 0) {
      return 0;
    }

    isSyncingRef.current = true;
    
    const reportsToSync = [...pendingReports];

    console.log(`Syncing ${reportsToSync.length} report(s)...`);
    toast.loading(`Syncing ${reportsToSync.length} pending report(s)...`, { id: 'syncing' });

    // Fetch existing vehicle IDs from DB to validate FK references
    let validVehicleIds = new Set<string>();
    try {
      const { data: dbVehicles } = await supabase.from('vehicles').select('id');
      if (dbVehicles) {
        dbVehicles.forEach(v => validVehicleIds.add(v.id));
      }
    } catch {
      // Ignore DB fetch failure
    }

    let successfulSyncCount = 0;
    const syncedTempIds = new Set<string>();

    for (const report of reportsToSync) {
      const { tempId, ...reportData } = report;

      // Clean vehicle_id if it's not a valid FK in vehicles table
      let payload = { ...reportData };
      if (payload.vehicle_id && !validVehicleIds.has(payload.vehicle_id)) {
        payload.vehicle_id = null;
      }

      let { error } = await supabase.from('reports').insert([payload]);

      // If foreign key constraint failed (e.g. 23503), retry with vehicle_id = null
      if (error && (error.code === '23503' || error.message?.includes('foreign key') || error.message?.includes('violates'))) {
        console.warn(`Foreign key violation on report ${tempId}. Retrying with vehicle_id = null...`);
        const retryRes = await supabase.from('reports').insert([{ ...payload, vehicle_id: null }]);
        error = retryRes.error;
      }

      if (error) {
        console.error(`Failed to sync report ${tempId}:`, error);
        // If permanent schema error 23503 still occurs, mark as synced to prevent infinite blocking loop
        if (error.code === '23503') {
          syncedTempIds.add(tempId);
        }
      } else {
        console.log(`Successfully synced report ${tempId}`);
        successfulSyncCount++;
        syncedTempIds.add(tempId);
      }
    }

    // Safely filter out synced reports from LocalStorage while preserving new items added during sync
    if (syncedTempIds.size > 0) {
      setPendingReports(prev => prev.filter(r => !syncedTempIds.has(r.tempId)));
    }
    
    toast.dismiss('syncing');
    if (successfulSyncCount > 0) {
      toast.success(`${successfulSyncCount} report(s) successfully synced!`);
    }

    isSyncingRef.current = false;
    return successfulSyncCount;
  }, [pendingReports, setPendingReports]);

  useEffect(() => {
    const handleOnline = () => {
      console.log("App came online, triggering automatic sync.");
      syncPendingReports();
    };

    window.addEventListener('online', handleOnline);
    if (navigator.onLine && pendingReports.length > 0) {
      handleOnline();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [syncPendingReports, pendingReports.length]);

  return { pendingReports, setPendingReports };
};
