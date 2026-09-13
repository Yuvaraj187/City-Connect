import React, { useState } from 'react';
import { Ticket } from '../../types';
import TicketIcon from '../icons/TicketIcon';
import QrCodeIcon from '../icons/QrCodeIcon';
import CheckBadgeIcon from '../icons/CheckBadgeIcon';
import SearchIcon from '../icons/SearchIcon';
import XMarkIcon from '../icons/XMarkIcon';

export const TicketScannerView: React.FC = () => {
  const [selectedBusCode, setSelectedBusCode] = useState<string>('MTC-21G-01');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'common' | 'specific'>('all');
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);
  const [scanning, setScanning] = useState<boolean>(false);

  // Sample live active tickets issued across the route network
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TCK-9281-MTC',
      route_id: 'R-21G',
      route_name: '21G (T. Nagar ➔ Marina Beach)',
      from_stop: 'T. Nagar Bus Terminus',
      to_stop: 'Marina Beach',
      passenger_count: 2,
      total_fare: 30,
      purchase_date: new Date().toISOString(),
      valid_until: new Date(Date.now() + 7200000).toISOString(),
      is_synced: true,
      transaction_id: 'UPI-TXN-882910',
      signature: 'SIG-MTC-8812',
      status: 'active',
      validated_on_bus: 'MTC-21G-01',
      user_id: 'USR-881'
    },
    {
      id: 'TCK-7712-MTC',
      route_id: 'R-21G',
      route_name: '21G Common Route Pass',
      from_stop: 'Anna Salai',
      to_stop: 'Light House',
      passenger_count: 1,
      total_fare: 15,
      purchase_date: new Date().toISOString(),
      valid_until: new Date(Date.now() + 7200000).toISOString(),
      is_synced: true,
      transaction_id: 'UPI-TXN-991204',
      signature: 'SIG-MTC-9912',
      status: 'active',
      validated_on_bus: undefined, // Common route pass waiting to be bound/inspected
      user_id: 'USR-772'
    },
    {
      id: 'TCK-4019-MTC',
      route_id: 'R-47D',
      route_name: '47D (Guindy ➔ Anna Nagar)',
      from_stop: 'Guindy Estate',
      to_stop: 'Koyambedu CMBT',
      passenger_count: 3,
      total_fare: 60,
      purchase_date: new Date().toISOString(),
      valid_until: new Date(Date.now() + 7200000).toISOString(),
      is_synced: true,
      transaction_id: 'UPI-TXN-112049',
      signature: 'SIG-MTC-4019',
      status: 'active',
      validated_on_bus: 'MTC-47D-01',
      user_id: 'USR-401'
    },
    {
      id: 'TCK-3301-MTC',
      route_id: 'R-21G',
      route_name: '21G Common Route Pass',
      from_stop: 'Mylapore Tank',
      to_stop: 'Marina Beach',
      passenger_count: 1,
      total_fare: 10,
      purchase_date: new Date().toISOString(),
      valid_until: new Date(Date.now() + 7200000).toISOString(),
      is_synced: true,
      transaction_id: 'UPI-TXN-330192',
      signature: 'SIG-MTC-3301',
      status: 'active',
      user_id: 'USR-330'
    }
  ]);

  const [scanSuccessMsg, setScanSuccessMsg] = useState<string | null>(null);

  const handleValidate = (ticketId: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status: 'validated',
            validated_at: new Date().toLocaleTimeString(),
            validated_on_bus: t.validated_on_bus || selectedBusCode
          };
        }
        return t;
      })
    );
    setScanSuccessMsg(`Ticket ${ticketId} verified and validated on bus ${selectedBusCode}!`);
    setTimeout(() => setScanSuccessMsg(null), 4000);
  };

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setShowScannerModal(false);
      // Pick first unvalidated ticket or first ticket
      const target = tickets.find(t => t.status !== 'validated') || tickets[0];
      if (target) {
        handleValidate(target.id);
      }
    }, 1500);
  };

  const handleBindBusCode = (ticketId: string, busCode: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            validated_on_bus: busCode
          };
        }
        return t;
      })
    );
    setScanSuccessMsg(`Common Route Ticket ${ticketId} successfully bound to bus code ${busCode}!`);
    setTimeout(() => setScanSuccessMsg(null), 4000);
  };

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.from_stop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.to_stop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.validated_on_bus && t.validated_on_bus.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterType === 'common') {
      return matchesSearch && (!t.validated_on_bus || t.route_name.includes('Common'));
    }
    if (filterType === 'specific') {
      return matchesSearch && t.validated_on_bus && t.validated_on_bus === selectedBusCode;
    }
    return matchesSearch;
  });

  const totalValidated = tickets.filter(t => t.status === 'validated').length;
  const totalRevenueOnBus = tickets
    .filter(t => t.validated_on_bus === selectedBusCode)
    .reduce((sum, t) => sum + t.total_fare, 0);

  return (
    <div className="space-y-6">
      {/* HEADER BANNER FOR CONDUCTOR & INSPECTION */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-extrabold text-[10px] uppercase rounded">
              Conductor & Inspector Live Mode
            </span>
            <span className="text-xs text-indigo-200">Depot: Central T. Nagar</span>
          </div>
          <h2 className="text-2xl font-black">On-Board Digital Ticket Inspector</h2>
          <p className="text-xs text-indigo-200 mt-1">
            Scan QR passes, inspect Common Route Tickets, and bind bus codes upon boarding.
          </p>
        </div>

        {/* ACTIVE BUS SELECTION & SCANNER TRIGGER */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowScannerModal(true)}
            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <QrCodeIcon className="w-5 h-5" />
            <span>Launch Camera QR Scanner</span>
          </button>

          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/15 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white font-black text-sm flex items-center justify-center shadow">
              MTC
            </div>
            <div>
              <div className="text-[10px] text-indigo-200 uppercase font-bold">Bus Code</div>
              <select
                value={selectedBusCode}
                onChange={e => setSelectedBusCode(e.target.value)}
                className="bg-transparent font-mono font-bold text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="MTC-21G-01" className="bg-slate-900">MTC-21G-01 (#21G T.Nagar ➔ Marina)</option>
                <option value="MTC-47D-01" className="bg-slate-900">MTC-47D-01 (#47D Guindy ➔ Anna Nagar)</option>
                <option value="MTC-570-01" className="bg-slate-900">MTC-570-01 (#570 Express CMBT ➔ OMR)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {scanSuccessMsg && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-200 rounded-2xl flex items-center gap-3 animate-fade-in text-xs font-bold">
          <CheckBadgeIcon className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{scanSuccessMsg}</span>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Inspected Bus</span>
          <p className="text-base sm:text-xl font-mono font-black text-indigo-600 dark:text-indigo-400 mt-1">{selectedBusCode}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Validated Passes</span>
          <p className="text-base sm:text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{totalValidated}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Common Route</span>
          <p className="text-base sm:text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {tickets.filter(t => !t.validated_on_bus).length} Pending
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Total Revenue</span>
          <p className="text-base sm:text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">₹{totalRevenueOnBus}</p>
        </div>
      </div>

      {/* CONTROLS & SEARCH */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <SearchIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Ticket ID, Stop, or Bus Code..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            All Tickets
          </button>
          <button
            onClick={() => setFilterType('specific')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === 'specific'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Bus {selectedBusCode}
          </button>
          <button
            onClick={() => setFilterType('common')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterType === 'common'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Common Route Tickets
          </button>
        </div>
      </div>

      {/* TICKETS LIST TABLE / CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTickets.map(ticket => {
          const isValidated = ticket.status === 'validated';
          const isCommonRoute = !ticket.validated_on_bus || ticket.route_name.includes('Common');

          return (
            <div
              key={ticket.id}
              className={`p-5 rounded-2xl border transition-all ${
                isValidated
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                  : isCommonRoute
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {ticket.id}
                  </span>
                  <div className="text-xs font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
                    {ticket.route_name}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-0.5 text-[10px] uppercase font-extrabold rounded ${
                    isValidated
                      ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200'
                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200'
                  }`}
                >
                  {isValidated ? 'Verified & Validated' : 'Active Pass'}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 mb-4">
                <div>
                  <strong className="text-slate-800 dark:text-slate-100">Journey:</strong> {ticket.from_stop} ➔ {ticket.to_stop}
                </div>
                <div className="flex justify-between">
                  <span>Passengers: <strong>{ticket.passenger_count}</strong></span>
                  <span>Total Fare: <strong className="text-indigo-600 dark:text-indigo-400">₹{ticket.total_fare}</strong></span>
                </div>
                <div className="flex justify-between font-mono text-[11px] pt-1">
                  <span>Txn: {ticket.transaction_id}</span>
                  <span>
                    Bus Tag:{' '}
                    <strong className="text-emerald-600 dark:text-emerald-400">
                      {ticket.validated_on_bus || 'Unassigned (Common Route)'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center gap-2 border-t border-slate-200 dark:border-slate-700/80 pt-3">
                {!ticket.validated_on_bus && (
                  <button
                    onClick={() => handleBindBusCode(ticket.id, selectedBusCode)}
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-colors text-center"
                  >
                    🚌 Bind to Bus {selectedBusCode}
                  </button>
                )}

                <button
                  onClick={() => handleValidate(ticket.id)}
                  disabled={isValidated}
                  className={`flex-1 py-2 font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 ${
                    isValidated
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <CheckBadgeIcon className="w-4 h-4" />
                  <span>{isValidated ? `Validated at ${ticket.validated_at}` : 'Verify & Validate Pass'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CAMERA QR SCANNER SIMULATOR MODAL */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative text-center space-y-4">
            <button
              onClick={() => setShowScannerModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="space-y-1">
              <h3 className="text-lg font-black">Camera QR Scanner</h3>
              <p className="text-xs text-slate-400">Point lens at passenger's mobile digital ticket</p>
            </div>

            {/* VIEWFINDER ANIMATION */}
            <div className="relative w-48 h-48 mx-auto border-2 border-dashed border-emerald-500 rounded-2xl flex items-center justify-center bg-slate-950 overflow-hidden">
              <QrCodeIcon className="w-32 h-32 text-slate-700 animate-pulse" />
              <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-bounce"></div>
            </div>

            <button
              onClick={handleSimulateScan}
              disabled={scanning}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all"
            >
              {scanning ? 'Scanning QR Code...' : 'Simulate Scan Passenger QR'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
