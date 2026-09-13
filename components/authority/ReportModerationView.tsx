import React, { useState } from 'react';
import { Report } from '../../types';
import CheckBadgeIcon from '../icons/CheckBadgeIcon';
import ExclamationTriangleIcon from '../icons/ExclamationTriangleIcon';
import TrashIcon from '../icons/TrashIcon';
import SearchIcon from '../icons/SearchIcon';

export const ReportModerationView: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 'REP-101',
      type: 'Traffic',
      location: 'Anna Flyover Signal, Mount Road',
      description: 'Heavy congestion due to pipeline water work. Expect 15-20 mins delay for buses #21G, #47D, #18A.',
      upvotes: 14,
      downvotes: 1,
      verified: true,
      reporterId: 'USR-201',
      reporterName: 'M. Ramesh',
      reporterReputation: 'Trusted',
      time: '10 mins ago',
      isSynced: true,
      status: 'active'
    },
    {
      id: 'REP-102',
      type: 'Overcrowded',
      location: 'CMBT Koyambedu Bus Terminus',
      description: 'Massive rush for #570 Express & #70V routes. Additional frequency requested.',
      upvotes: 22,
      downvotes: 0,
      verified: true,
      reporterId: 'USR-302',
      reporterName: 'S. Priya',
      reporterReputation: 'Trusted',
      time: '18 mins ago',
      isSynced: true,
      status: 'active'
    },
    {
      id: 'REP-103',
      type: 'Breakdown',
      location: 'Porur Junction Signal',
      description: 'Bus #54 engine overheating near Porur flyover. Single lane blocked.',
      upvotes: 8,
      downvotes: 0,
      verified: false,
      reporterId: 'USR-405',
      reporterName: 'V. Anand',
      reporterReputation: 'Regular',
      time: '25 mins ago',
      isSynced: true,
      status: 'active'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'breakdown'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const handleVerify = (reportId: string) => {
    setReports(prev =>
      prev.map(r => (r.id === reportId ? { ...r, verified: true } : r))
    );
    setNotificationMsg(`Report ${reportId} marked as Official Verified Community Alert.`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleFlagFalse = (reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
    setNotificationMsg(`Report ${reportId} removed and flagged for false information review.`);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch =
      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'pending') return matchesSearch && !r.verified;
    if (filter === 'verified') return matchesSearch && r.verified;
    if (filter === 'breakdown') return matchesSearch && r.type === 'Breakdown';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-extrabold uppercase rounded">
            Transit Dispatch Moderation Center
          </span>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-1">
            Crowdsourced Commuter Incident & Live Condition Moderation
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verify commuter traffic, overcrowding, or breakdown logs and dispatch real-time official alerts.
          </p>
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-300 dark:border-emerald-800">
            {reports.filter(r => r.verified).length} Official Verified
          </span>
          <span className="px-3 py-1.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-bold rounded-xl border border-amber-300 dark:border-amber-800">
            {reports.filter(r => !r.verified).length} Pending Inspection
          </span>
        </div>
      </div>

      {notificationMsg && (
        <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 rounded-2xl text-xs font-bold text-center animate-fade-in">
          {notificationMsg}
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search report location, description..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            All Reports ({reports.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'pending'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Pending ({reports.filter(r => !r.verified).length})
          </button>
          <button
            onClick={() => setFilter('verified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'verified'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Verified ({reports.filter(r => r.verified).length})
          </button>
          <button
            onClick={() => setFilter('breakdown')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filter === 'breakdown'
                ? 'bg-red-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Breakdowns ({reports.filter(r => r.type === 'Breakdown').length})
          </button>
        </div>
      </div>

      {/* REPORTS LIST */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 text-xs">
            No incident reports matching filter criteria.
          </div>
        ) : (
          filteredReports.map(report => (
            <div
              key={report.id}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded ${
                      report.type === 'Breakdown'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : report.type === 'Overcrowded'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {report.type}
                  </span>

                  <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
                    {report.location}
                  </span>

                  {report.verified && (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-extrabold rounded flex items-center gap-1">
                      <CheckBadgeIcon className="w-3 h-3 text-emerald-600" />
                      Official Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {report.description}
                </p>

                <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1 flex-wrap">
                  <span>Reporter: <strong>{report.reporterName}</strong> ({report.reporterReputation} Contributor)</span>
                  <span>• {report.time}</span>
                  <span>• 👍 {report.upvotes} | 👎 {report.downvotes}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                {!report.verified && (
                  <button
                    onClick={() => handleVerify(report.id)}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckBadgeIcon className="w-4 h-4" />
                    <span>Verify Alert</span>
                  </button>
                )}

                <button
                  onClick={() => handleFlagFalse(report.id)}
                  className="flex-1 sm:flex-initial px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/60 dark:hover:bg-red-900/60 dark:text-red-300 font-bold text-xs rounded-xl border border-red-300 dark:border-red-800 transition-colors flex items-center justify-center gap-1"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Flag / Remove</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
