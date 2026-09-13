// components/passenger/CrowdsourcedReports.tsx - RECTIFIED & ENHANCED WITH MODERATION & DOWNVOTES

import React, { useState, useEffect, useMemo } from 'react';
import { users } from '../../data';
import { Report, UserReputation, LiveVehicle, UserWarningProfile } from '../../types';
import { useOfflineQueue } from '../../hooks/useOfflineQueue';
import useLocalStorage from '../../hooks/useLocalStorage';
import toast from 'react-hot-toast';
import { getReports, submitReport, getVehicles, getRoutes } from '../../services/apiService';
import SpinnerIcon from '../icons/SpinnerIcon';
import CloudArrowUpIcon from '../icons/CloudArrowUpIcon';

interface CrowdsourcedReportsProps {
  isOnline: boolean;
}

const CrowdsourcedReports: React.FC<CrowdsourcedReportsProps> = ({ isOnline }) => {
  const [syncedReports, setSyncedReports] = useState<Report[]>([]);
  const [vehicles, setVehicles] = useLocalStorage<(LiveVehicle & { stickerCode?: string })[]>('vehicles-cache', []);
  const [routesList, setRoutesList] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { pendingReports, setPendingReports } = useOfflineQueue();

  // Active view tab: 'search' or 'submit'
  const [activeTab, setActiveTab] = useState<'search' | 'submit'>('search');
  
  // Feed filter: 'active' or 'flagged'
  const [feedFilter, setFeedFilter] = useState<'active' | 'flagged'>('active');

  // Submit Report state
  const [busStickerInput, setBusStickerInput] = useState<string>('MTC-21G-01');
  const [reportType, setReportType] = useState<'Traffic' | 'Breakdown' | 'Overcrowded' | 'Other'>('Traffic');
  const [reportLocation, setReportLocation] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search Running Buses by Route state
  const [searchRouteQuery, setSearchRouteQuery] = useState<string>('21G');

  // User warning profile state for moderation & false reporting block
  const [userProfile, setUserProfile] = useLocalStorage<UserWarningProfile>('user-warning-profile', {
    userId: 'user_current',
    userName: 'Yuvaraj M. (Commuter)',
    reputation: 'Trusted',
    warnings: 0,
    isBlocked: false,
    totalSubmitted: 2,
    totalFlaggedFalse: 0
  });

  // Track user votes locally: reportId -> 'up' | 'down'
  const [userVotes, setUserVotes] = useLocalStorage<Record<string, 'up' | 'down'>>('user-report-votes', {});

  useEffect(() => {
    setIsLoading(true);
    if (isOnline) {
      Promise.all([getReports(), getVehicles(), getRoutes()]).then(([fetchedReports, fetchedVehicles, fetchedRoutes]) => {
        // Ensure every report has default properties
        const normalized = fetchedReports.map(r => ({
          ...r,
          upvotes: r.upvotes || 1,
          downvotes: r.downvotes || 0,
          reporterName: r.reporterName || (r.reporterId === 'user123' ? 'Anand Sharma' : r.reporterId === 'user456' ? 'Priya Sundaram' : 'Community Commuter'),
          reporterReputation: r.reporterReputation || 'Regular',
          status: r.status || 'active'
        }));
        setSyncedReports(normalized);
        setVehicles(fetchedVehicles as any);
        setRoutesList(fetchedRoutes.map(r => ({ id: r.id, name: r.name })));
        setIsLoading(false);
      });
    } else {
      setSyncedReports([]);
      setIsLoading(false);
    }
  }, [isOnline]);

  // Handle report submission
  const handleSubmit = async () => {
    if (userProfile.isBlocked) {
      return toast.error("Your reporting privileges are blocked due to repeated false report submissions.");
    }

    if (!busStickerInput.trim() || !reportLocation.trim() || !reportDescription.trim()) {
      return toast.error("Please enter the unique bus code, location, and description.");
    }
    setIsSubmitting(true);
    const busCode = busStickerInput.trim().toUpperCase();

    // Match vehicle against local/cached vehicles to get valid DB foreign key
    const matchedVehicle = vehicles.find(v => 
      (v.stickerCode && v.stickerCode.toUpperCase() === busCode) ||
      v.id.toUpperCase() === busCode
    );

    const dbVehicleId = matchedVehicle ? matchedVehicle.id : null;
    const descWithBus = reportDescription.includes(busCode) ? reportDescription : `[Bus Code: ${busCode}] ${reportDescription}`;

    const newReportData = {
      type: reportType,
      location: reportLocation,
      description: descWithBus,
      vehicle_id: dbVehicleId,
      reporterName: userProfile.userName,
      reporterReputation: userProfile.reputation,
      status: 'active' as const
    };

    if (isOnline) {
      const submittedReport = await submitReport(newReportData);
      if (submittedReport) {
        toast.success(`Report for bus ${busCode} logged to live feed!`);
        const fullReport: Report = {
          ...submittedReport,
          upvotes: 1,
          downvotes: 0,
          reporterName: userProfile.userName,
          reporterReputation: userProfile.reputation,
          status: 'active',
          vehicle_id: dbVehicleId || busCode,
          time: 'Just now',
          isSynced: true
        };
        setSyncedReports(prev => [fullReport, ...prev]);
        setUserProfile(prev => ({ ...prev, totalSubmitted: prev.totalSubmitted + 1 }));
      } else {
        toast.error("Failed to submit report to server.");
      }
    } else {
      const tempId = `offline_${Date.now()}`;
      setPendingReports(prev => [...prev, { tempId, ...newReportData }]);
      toast.success(`Report for bus ${busCode} saved offline. Will sync when back online.`);
    }

    setReportLocation('');
    setReportDescription('');
    setIsSubmitting(false);
  };

  // Upvote / Downvote Handler for Evaluating Real vs False Reports
  const handleVote = (reportId: string, type: 'up' | 'down') => {
    const existingVote = userVotes[reportId];
    if (existingVote === type) {
      return toast("You already registered this vote.", { icon: "ℹ️" });
    }

    let newlyFlaggedReport: Report | null = null;

    setSyncedReports(prevReports => {
      return prevReports.map(report => {
        if (report.id !== reportId) return report;

        let newUpvotes = report.upvotes;
        let newDownvotes = report.downvotes;

        if (type === 'up') {
          newUpvotes += 1;
          if (existingVote === 'down') newDownvotes = Math.max(0, newDownvotes - 1);
        } else {
          newDownvotes += 1;
          if (existingVote === 'up') newUpvotes = Math.max(0, newUpvotes - 1);
        }

        const netScore = newUpvotes - newDownvotes;
        const isFalseReport = newDownvotes >= 3 || netScore <= -2;

        const newStatus: 'active' | 'flagged_false' = isFalseReport ? 'flagged_false' : report.status || 'active';

        if (isFalseReport && report.status !== 'flagged_false') {
          newlyFlaggedReport = report;
        }

        return {
          ...report,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          status: newStatus
        };
      });
    });

    setUserVotes(prev => ({ ...prev, [reportId]: type }));

    if (newlyFlaggedReport) {
      const r = newlyFlaggedReport as Report;
      toast.error(`Report "${r.type} at ${r.location}" flagged as FALSE info by community downvotes and removed from live feed!`, {
        duration: 5000,
        icon: '🚨'
      });

      if (r.reporterId === userProfile.userId || r.reporterName === userProfile.userName) {
        setUserProfile(prev => {
          const newWarnings = prev.warnings + 1;
          const shouldBlock = newWarnings >= 3;
          if (shouldBlock) {
            toast.error("ACCOUNT SUSPENDED: You have received 3 warnings for false reporting. Reporting privileges disabled.", { duration: 7000 });
          } else {
            toast(`⚠️ Warning ${newWarnings}/3 issued: Your report was flagged as false information by commuters.`, { duration: 6000, icon: '⚠️' });
          }
          return {
            ...prev,
            warnings: newWarnings,
            isBlocked: shouldBlock,
            totalFlaggedFalse: prev.totalFlaggedFalse + 1
          };
        });
      }
    } else if (type === 'up') {
      toast.success("Vote registered: Verified as real condition!", { duration: 2000 });
    } else {
      toast("Vote registered: Downvoted report as false/misleading.", { duration: 2000, icon: '👎' });
    }
  };

  // Reset user warnings for evaluation testing
  const handleResetWarnings = () => {
    setUserProfile(prev => ({
      ...prev,
      warnings: 0,
      isBlocked: false
    }));
    toast.success("Account reporting status reset to Active (0 warnings).");
  };

  // All combined reports (pending + synced)
  const allReports = useMemo(() => {
    const pending = pendingReports.map(p => ({
      id: p.tempId,
      isSynced: false,
      time: 'Pending Sync',
      upvotes: 1,
      downvotes: 0,
      verified: false,
      reporterId: userProfile.userId,
      reporterName: userProfile.userName,
      reporterReputation: userProfile.reputation,
      status: 'active' as const,
      ...p
    } as Report));
    return [...pending, ...syncedReports];
  }, [syncedReports, pendingReports, userProfile]);

  // Filtered reports for Live Feed
  const activeReports = useMemo(() => allReports.filter(r => r.status !== 'flagged_false'), [allReports]);
  const flaggedReports = useMemo(() => allReports.filter(r => r.status === 'flagged_false'), [allReports]);

  // Running buses matching search route query
  const runningBusesForRoute = useMemo(() => {
    if (!searchRouteQuery.trim()) return vehicles;
    const query = searchRouteQuery.trim().toLowerCase();
    
    return vehicles.filter(v => {
      const sticker = (v.stickerCode || '').toLowerCase();
      const id = v.id.toLowerCase();
      const routeName = (v.routeDetails?.destination || '').toLowerCase();
      return (
        sticker.includes(query) ||
        id.includes(query) ||
        routeName.includes(query) ||
        (query.includes('21g') && sticker.includes('21g')) ||
        (query.includes('47d') && sticker.includes('47d')) ||
        (query.includes('570') && sticker.includes('570')) ||
        (query.includes('70v') && sticker.includes('70v')) ||
        (query.includes('54') && sticker.includes('54'))
      );
    });
  }, [vehicles, searchRouteQuery]);

  return (
    <div className="space-y-6">
      {/* HEADER & NAVIGATION TABS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Live Bus Reports & Community Feed
            </h3>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
              Community Verified
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Log real-time bus conditions, search active route buses, and evaluate report accuracy via community voting.
          </p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'search'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🔍 Search Route Buses
          </button>
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'submit'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            📝 Submit Bus Log
          </button>
        </div>
      </div>

      {/* TAB 1: SEARCH ROUTE BUSES & VIEW LIVE PASSENGER CONDITIONS */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          {/* WARNING BANNER ONLY IF USER HAS WARNINGS/IS BLOCKED */}
          {(userProfile.warnings > 0 || userProfile.isBlocked) && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between gap-2 text-xs text-amber-900 dark:text-amber-200">
              <span className="font-semibold">
                ⚠️ Quality Notice: You have {userProfile.warnings}/3 community warnings.
              </span>
              <button
                onClick={handleResetWarnings}
                className="px-2.5 py-1 font-bold rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 shrink-0"
              >
                Reset Warnings
              </button>
            </div>
          )}

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🔍 Find Buses & View Live Passenger Conditions</span>
            </h4>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchRouteQuery}
                onChange={e => setSearchRouteQuery(e.target.value)}
                placeholder="Search bus sticker code e.g. MTC-21G-01, 570, 47D, 54, or route name..."
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-medium dark:text-slate-100 focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {['21G', '570', '47D', '54', '70V'].map(code => (
                  <button
                    key={code}
                    onClick={() => setSearchRouteQuery(code)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                      searchRouteQuery.toUpperCase().includes(code)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    #{code}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-indigo-600 dark:text-indigo-400">{runningBusesForRoute.length}</span> active running bus(es) matching search query.
            </p>
          </div>

          {/* RUNNING BUS CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {runningBusesForRoute.map((bus) => {
              const busSticker = bus.stickerCode || bus.id;
              const busReports = activeReports.filter(r => {
                const rVeh = (r.vehicle_id || '').toLowerCase();
                const sticker = (bus.stickerCode || '').toLowerCase();
                const busId = (bus.id || '').toLowerCase();
                const desc = (r.description || '').toLowerCase();
                return (
                  (rVeh && (rVeh === busId || rVeh === sticker)) ||
                  (sticker && desc.includes(sticker))
                );
              });

              return (
                <div
                  key={bus.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm space-y-4 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 text-xs font-mono font-extrabold bg-indigo-600 text-white rounded-lg shadow-sm">
                          {busSticker}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {bus.id}
                        </span>
                      </div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 mt-1">
                        {bus.routeDetails.destination}
                      </h5>
                    </div>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {bus.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-slate-400">Current Location</p>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{bus.location}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Next Stop</p>
                      <p className="font-bold text-slate-700 dark:text-slate-200">{bus.routeDetails.nextStop}</p>
                    </div>
                  </div>

                  {/* LOGGED CONDITIONS FOR THIS BUS */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80">
                    <div className="flex justify-between items-center mb-2">
                      <h6 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Live Condition Logs ({busReports.length})
                      </h6>
                      <button
                        onClick={() => {
                          setBusStickerInput(busSticker);
                          setActiveTab('submit');
                        }}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                      >
                        + Add Log for this Bus
                      </button>
                    </div>

                    {busReports.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No condition reports logged for bus {busSticker} yet. Be the first to log!
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {busReports.map(report => (
                          <ReportCard
                            key={report.id}
                            report={report}
                            userVote={userVotes[report.id] || null}
                            onVote={handleVote}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LOG NEW CONDITION REPORT & LIVE MODERATED FEED */}
      {activeTab === 'submit' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LOG REPORT FORM */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              Log Bus Information
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter the unique bus sticker code printed on the vehicle front/interior to tag your update.
            </p>

            <div className="space-y-4">
              {/* Bus Unique Code */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  1. Unique Bus Code / Sticker #
                </label>
                <input
                  type="text"
                  disabled={userProfile.isBlocked}
                  value={busStickerInput}
                  onChange={e => setBusStickerInput(e.target.value)}
                  placeholder="e.g. MTC-21G-01, MTC-570-01"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-mono font-bold dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 uppercase disabled:opacity-50"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  2. Condition Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Traffic', 'Breakdown', 'Overcrowded', 'Other'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      disabled={userProfile.isBlocked}
                      onClick={() => setReportType(type)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        reportType === type
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  3. Location / Stop Landmark
                </label>
                <input
                  type="text"
                  disabled={userProfile.isBlocked}
                  value={reportLocation}
                  onChange={e => setReportLocation(e.target.value)}
                  placeholder="e.g. Near Guindy Flyover / Vadapalani Signal"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                  4. Details / Remarks
                </label>
                <textarea
                  rows={3}
                  disabled={userProfile.isBlocked}
                  value={reportDescription}
                  onChange={e => setReportDescription(e.target.value)}
                  placeholder="e.g. Bus is moving smoothly, standing crowd heavy near door."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-sm dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                ></textarea>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || userProfile.isBlocked}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? <SpinnerIcon className="w-5 h-5" /> : 'Submit Bus Condition Log'}
              </button>
            </div>
          </div>

          {/* LIVE LOGGED REPORTS FEED WITH COMMUNITY MODERATION */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Live Reports Feed ({activeReports.length})
              </h4>

              {/* Filter active vs flagged */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setFeedFilter('active')}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${
                    feedFilter === 'active'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  🟢 Active ({activeReports.length})
                </button>
                <button
                  onClick={() => setFeedFilter('flagged')}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${
                    feedFilter === 'flagged'
                      ? 'bg-red-600 text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  🚨 Flagged ({flaggedReports.length})
                </button>
              </div>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {feedFilter === 'active' ? (
                activeReports.length === 0 ? (
                  <p className="text-sm text-slate-500 italic p-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    No active reports logged yet.
                  </p>
                ) : (
                  activeReports.map(report => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      userVote={userVotes[report.id] || null}
                      onVote={handleVote}
                    />
                  ))
                )
              ) : (
                flaggedReports.length === 0 ? (
                  <p className="text-sm text-slate-500 italic p-4 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                    No reports flagged as false information.
                  </p>
                ) : (
                  flaggedReports.map(report => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      userVote={userVotes[report.id] || null}
                      onVote={handleVote}
                      isFlaggedView
                    />
                  ))
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// REPORT CARD COMPONENT WITH USER DETAILS & UPVOTE/DOWNVOTE EVALUATION
const ReportCard: React.FC<{
  report: Report;
  userVote?: 'up' | 'down' | null;
  onVote: (id: string, type: 'up' | 'down') => void;
  isFlaggedView?: boolean;
}> = ({ report, userVote, onVote, isFlaggedView }) => {
  const typeColors = {
    Traffic: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
    Breakdown: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
    Overcrowded: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    Other: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
  };

  const reputationColors = {
    Trusted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
    Regular: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300',
    Newbie: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border-slate-300'
  };

  const reporterName = report.reporterName || 'Community Commuter';
  const reporterReputation = report.reporterReputation || 'Regular';

  return (
    <div className={`p-4 rounded-2xl border shadow-sm space-y-3 transition-all ${
      isFlaggedView || report.status === 'flagged_false'
        ? 'bg-red-50/50 dark:bg-red-950/20 border-red-300 dark:border-red-800/60 opacity-80'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }`}>
      {/* HEADER: TYPE, VEHICLE, REPORTER INFO */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${typeColors[report.type]}`}>
            {report.type}
          </span>
          <span className="text-xs font-mono font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
            {report.vehicle_id || 'MTC Bus'}
          </span>
        </div>

        {!report.isSynced ? (
          <div className="flex items-center text-xs font-semibold text-amber-600 animate-pulse">
            <CloudArrowUpIcon className="w-3.5 h-3.5 mr-1" />
            <span>Pending Sync</span>
          </div>
        ) : isFlaggedView || report.status === 'flagged_false' ? (
          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded bg-red-600 text-white">
            🚨 Flagged False Info
          </span>
        ) : (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
            ✓ Live Verified
          </span>
        )}
      </div>

      {/* REPORTER DETAILS & TRUST BADGE */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
            {reporterName.charAt(0)}
          </div>
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-200">{reporterName}</span>
            <span className={`ml-2 px-1.5 py-0.2 text-[9px] font-extrabold rounded border ${reputationColors[reporterReputation]}`}>
              {reporterReputation === 'Trusted' ? '⭐ Trusted' : reporterReputation === 'Regular' ? '🔹 Regular' : '🌱 Newbie'}
            </span>
          </div>
        </div>
        <span className="text-slate-400 text-[11px]">{report.time}</span>
      </div>

      {/* DESCRIPTION */}
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">
        {report.description}
      </p>

      {/* FOOTER: LOCATION & UPVOTE/DOWNVOTE CONTROLS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          📍 {report.location}
        </span>

        {/* EVALUATION VOTING BUTTONS */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onVote(report.id, 'up')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
              userVote === 'up'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'
            }`}
          >
            <span>👍 Real</span>
            <span className="font-mono bg-white/20 px-1 rounded text-[10px]">{report.upvotes}</span>
          </button>

          <button
            type="button"
            onClick={() => onVote(report.id, 'down')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
              userVote === 'down'
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/30'
            }`}
          >
            <span>👎 False</span>
            <span className="font-mono bg-white/20 px-1 rounded text-[10px]">{report.downvotes}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CrowdsourcedReports;
