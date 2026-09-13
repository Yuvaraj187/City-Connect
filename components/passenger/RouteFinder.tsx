// components/passenger/RouteFinder.tsx
import React, { useState, useEffect } from 'react';
import { Route } from '../../types';
import SearchIcon from '../icons/SearchIcon';
import BusIcon from '../icons/BusIcon';
import SpinnerIcon from '../icons/SpinnerIcon';
import MapPinIcon from '../icons/MapPinIcon';
import TicketIcon from '../icons/TicketIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import AdjustmentsHorizontalIcon from '../icons/AdjustmentsHorizontalIcon';
import { searchChennaiRoutes, CHENNAI_LOCATIONS, RouteSearchResult } from '../../services/chennaiRouteEngine';
import { getRoutes } from '../../services/apiService';

interface RouteFinderProps {
  onNavigateTab?: (tab: 'tracker' | 'ticketing', routeData?: Route) => void;
}

const POPULAR_CONNECTIONS = [
  { from: 'Airport (MAA)', to: 'T. Nagar', label: '✈️ Airport ➔ T. Nagar' },
  { from: 'Chennai Central', to: 'Velachery', label: '🚆 Central ➔ Velachery' },
  { from: 'Koyambedu (CMBT)', to: 'Tambaram', label: '🚌 CMBT ➔ Tambaram' },
  { from: 'Guindy', to: 'Sholinganallur (OMR)', label: '💻 Guindy ➔ OMR Tech Corridor' },
  { from: 'Anna Nagar', to: 'Marina Beach', label: '🏖️ Anna Nagar ➔ Marina' },
  { from: 'Porur', to: 'Poonamallee', label: '🏬 Porur ➔ Poonamallee' }
];

const RouteFinder: React.FC<RouteFinderProps> = ({ onNavigateTab }) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [allRoutes, setAllRoutes] = useState<Route[]>([]);
  const [searchFilter, setSearchFilter] = useState<'all' | 'direct' | 'metro' | 'transfer'>('all');
  const [results, setResults] = useState<RouteSearchResult[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  useEffect(() => {
    const loadRoutes = async () => {
      const fetchedRoutes = await getRoutes();
      setAllRoutes(fetchedRoutes);
    };
    loadRoutes();
  }, []);

  const handleSearch = (fromVal = from, toVal = to) => {
    if (!fromVal.trim() || !toVal.trim()) return;
    setIsLoading(true);
    setSearched(true);

    setTimeout(() => {
      const foundResults = searchChennaiRoutes(fromVal, toVal, allRoutes);
      setResults(foundResults);
      if (foundResults.length > 0) {
        setExpandedRouteId(foundResults[0].route.id);
      }
      setIsLoading(false);
    }, 250);
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
    if (searched && temp && from) {
      handleSearch(to, temp);
    }
  };

  const handleQuickChipClick = (chipFrom: string, chipTo: string) => {
    setFrom(chipFrom);
    setTo(chipTo);
    handleSearch(chipFrom, chipTo);
  };

  const filteredResults = results.filter(res => {
    if (searchFilter === 'direct') return res.matchType === 'direct';
    if (searchFilter === 'transfer') return res.matchType === 'transfer';
    if (searchFilter === 'metro') {
      const name = res.route.name.toLowerCase();
      return name.includes('metro') || name.includes('train') || name.includes('mrts');
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>Find Your Route in Chennai</span>
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Search MTC Buses, Chennai Metro, and Local Trains connecting any two places across Chennai.
        </p>
      </div>

      {/* Popular Route Chips */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Popular Chennai Routes
        </label>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CONNECTIONS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickChipClick(chip.from, chip.to)}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20 text-xs font-medium rounded-full transition-all border border-indigo-200 dark:border-indigo-800/40"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Box */}
      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* From Input */}
          <div className="md:col-span-5 relative">
            <label htmlFor="from" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Origin (From)
            </label>
            <div className="relative">
              <input
                type="text"
                id="from"
                list="chennai-stops"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                placeholder="e.g., T. Nagar, Airport, Adyar..."
              />
              <MapPinIcon className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
              {from && (
                <button
                  onClick={() => setFrom('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center pt-2 md:pt-5">
            <button
              onClick={handleSwap}
              title="Swap From and To locations"
              className="p-2.5 rounded-full bg-white border border-slate-300 dark:bg-slate-700 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 transition-transform active:scale-95 shadow-sm"
            >
              <span className="text-base font-bold">⇄</span>
            </button>
          </div>

          {/* To Input */}
          <div className="md:col-span-5 relative">
            <label htmlFor="to" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Destination (To)
            </label>
            <div className="relative">
              <input
                type="text"
                id="to"
                list="chennai-stops"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-slate-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
                placeholder="e.g., Velachery, Sholinganallur..."
              />
              <MapPinIcon className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
              {to && (
                <button
                  onClick={() => setTo('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <datalist id="chennai-stops">
            {CHENNAI_LOCATIONS.map((stop) => (
              <option key={stop} value={stop} />
            ))}
          </datalist>
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleSearch()}
          disabled={!from.trim() || !to.trim() || isLoading}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 dark:disabled:bg-indigo-950 shadow-md active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-5 h-5 text-white" />
              <span>Searching Routes...</span>
            </>
          ) : (
            <>
              <SearchIcon className="w-5 h-5" />
              <span>Search Routes</span>
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      {searched && !isLoading && (
        <div className="space-y-4 pt-2">
          {/* Results Summary Header & Filters */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {results.length > 0 ? `Available Routes (${filteredResults.length})` : 'No Direct Routes Found'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing options from <span className="font-semibold text-slate-700 dark:text-slate-200">{from}</span> to <span className="font-semibold text-slate-700 dark:text-slate-200">{to}</span>
              </p>
            </div>

            {results.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <AdjustmentsHorizontalIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                {(['all', 'direct', 'metro', 'transfer'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSearchFilter(filter)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-colors ${
                      searchFilter === filter
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {filter === 'all' ? 'All' : filter === 'metro' ? 'Metro/Train' : filter}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* List of Route Cards */}
          {filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map((item) => {
                const isExpanded = expandedRouteId === item.route.id;
                const isMetro = item.route.name.toLowerCase().includes('metro') || item.route.name.toLowerCase().includes('train') || item.route.name.toLowerCase().includes('mrts');

                return (
                  <div
                    key={item.route.id}
                    className="p-5 border rounded-2xl shadow-sm bg-white hover:shadow-md transition-all dark:bg-slate-800 dark:border-slate-700"
                  >
                    {/* Top Row: Type Tag & Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                            isMetro
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300'
                              : item.matchType === 'transfer'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300'
                          }`}
                        >
                          {isMetro ? 'Metro / Train' : item.matchType === 'transfer' ? '1 Transfer' : 'Direct Service'}
                        </span>
                        {item.transferStop && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Via {item.transferStop}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{item.route.fare}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                          ~{item.route.average_eta_minutes} mins
                        </span>
                      </div>
                    </div>

                    {/* Main Info */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isMetro
                            ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                            : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                        }`}
                      >
                        <BusIcon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <h5 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                          {item.route.name}
                        </h5>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {item.fromStop} ➔ {item.toStop}
                        </p>
                      </div>
                    </div>

                    {/* Expandable Route Details */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                      <button
                        onClick={() => setExpandedRouteId(isExpanded ? null : item.route.id)}
                        className="flex items-center justify-between w-full text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        <span>{isExpanded ? 'Hide Route Details & Stops' : 'View Stops & Travel Directions'}</span>
                        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="mt-3 space-y-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl text-xs">
                          {/* Instructions */}
                          <div>
                            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                              Travel Guidance:
                            </span>
                            <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-400">
                              {item.instructions.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>

                          {/* Stops Timeline */}
                          {item.route.stops && item.route.stops.length > 0 && (
                            <div>
                              <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                                Stops Along Corridor ({item.route.stops.length}):
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {item.route.stops.map((stop, sIdx) => (
                                  <React.Fragment key={sIdx}>
                                    <span
                                      className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                                        sIdx === 0 || sIdx === item.route.stops.length - 1
                                          ? 'bg-indigo-600 text-white font-bold'
                                          : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      {stop}
                                    </span>
                                    {sIdx < item.route.stops.length - 1 && (
                                      <span className="text-slate-400 text-xs">➔</span>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Action CTAs */}
                    <div className="mt-4 flex flex-wrap gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-700">
                      {onNavigateTab && (
                        <>
                          <button
                            onClick={() => onNavigateTab('ticketing', item.route)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
                          >
                            <TicketIcon className="w-3.5 h-3.5" />
                            <span>Buy Ticket (₹{item.route.fare})</span>
                          </button>
                          <button
                            onClick={() => onNavigateTab('tracker', item.route)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors"
                          >
                            <MapPinIcon className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Track Live</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 dark:text-slate-400 p-8 bg-slate-50 rounded-2xl border-dashed border-2 dark:bg-slate-800/50 dark:border-slate-700">
              <h5 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-1">
                No matches for filter "{searchFilter}"
              </h5>
              <p className="text-xs">
                Try switching the filter to "All" or enter different pickup/destination stops in Chennai.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteFinder;
