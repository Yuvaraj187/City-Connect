// components/passenger/TicketDetailsModal.tsx

import React, { useState, useEffect } from 'react';
import { Ticket } from '../../types';
import QrCodeIcon from '../icons/QrCodeIcon';
import XMarkIcon from '../icons/XMarkIcon';
import ReceiptIcon from '../icons/ReceiptIcon';
import SpinnerIcon from '../icons/SpinnerIcon';

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  onValidate: (ticketId: string, busCode?: string) => void;
  onTagBusCode?: (ticketId: string, busCode: string) => void;
  availableVehicles?: { id: string; stickerCode?: string }[];
}

const TicketDetailsModal: React.FC<TicketDetailsModalProps> = ({ ticket, onClose, onValidate, onTagBusCode, availableVehicles = [] }) => {
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [inputBusCode, setInputBusCode] = useState<string>('');

  useEffect(() => {
    if (ticket) {
      setIsValidating(false);
      setValidationStatus('idle');
      // Extract existing bus code if present in route_name or validated_on_bus
      if (ticket.validated_on_bus) {
        setInputBusCode(ticket.validated_on_bus);
      } else {
        setInputBusCode('');
      }
    }
  }, [ticket]);

  if (!ticket) return null;

  const isExpired = new Date() > new Date(ticket.valid_until);

  // Extract assigned bus code from route_name if present (e.g. "Route 21G [MTC-21G-01]")
  const assignedBusMatch = ticket.route_name.match(/\[(.*?)\]/);
  const currentAssignedBus = ticket.validated_on_bus || (assignedBusMatch ? assignedBusMatch[1] : null);

  const handleValidation = () => {
    setIsValidating(true);
    setValidationStatus('pending');
    setTimeout(() => {
      setValidationStatus('success');
      setTimeout(() => {
        if (ticket) {
          onValidate(ticket.id, inputBusCode || currentAssignedBus || 'MTC Bus');
        }
      }, 1200);
    }, 1800);
  };

  const handleTagBus = () => {
    if (!inputBusCode.trim()) return;
    if (onTagBusCode) {
      onTagBusCode(ticket.id, inputBusCode.trim().toUpperCase());
    }
  };

  const renderValidationContent = () => {
    switch (validationStatus) {
      case 'pending':
        return (
          <div className="text-center py-2">
            <SpinnerIcon className="mx-auto w-7 h-7 text-indigo-500 animate-spin" />
            <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-300">Validating QR Code...</p>
          </div>
        );
      case 'success':
        return (
          <div className="text-center py-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center gap-2">
            <ReceiptIcon className="w-5 h-5" />
            <span>Ticket Validated Successfully!</span>
          </div>
        );
      default:
        return (
          <button
            onClick={handleValidation}
            disabled={isExpired || ticket.status === 'validated'}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors disabled:opacity-50 text-sm"
          >
            {isExpired ? 'Ticket Expired' : 'Validate Offline Ticket'}
          </button>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-sm m-auto flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 flex justify-between items-center border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">Digital Ticket Pass</h3>
          <button onClick={onClose} className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-grow p-6 overflow-y-auto space-y-5">
          {/* QR Container */}
          <div className="relative flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            {ticket.status === 'validated' && (
              <div className="absolute inset-0 z-10 bg-emerald-950/70 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-3 text-center">
                <ReceiptIcon className="w-12 h-12 text-emerald-400 mb-1" />
                <h4 className="font-extrabold text-base">VALIDATED TICKET</h4>
                <p className="text-[11px] opacity-90">Bus: {ticket.validated_on_bus}</p>
              </div>
            )}
            <QrCodeIcon className={`w-44 h-44 text-slate-800 dark:text-slate-100 ${ticket.status === 'validated' || isExpired ? 'opacity-20' : ''}`} />
            <p className="text-[10px] font-mono text-slate-400 mt-2">ID: {ticket.id}</p>
          </div>

          {/* Details */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
              <span className="text-slate-400 font-medium">Route:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{ticket.route_name}</span>
            </div>

            {/* BUS CODE / BILL LINKING SECTION */}
            <div className="p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                  🚌 Billed Bus Code:
                </span>
                {currentAssignedBus ? (
                  <span className="font-mono font-black text-indigo-800 dark:text-indigo-200 bg-indigo-200 dark:bg-indigo-900 px-2 py-0.5 rounded text-xs">
                    {currentAssignedBus}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.5 rounded">
                    Unassigned
                  </span>
                )}
              </div>

              {/* SELECT OR UPDATE BUS CODE ON BOARDING */}
              {ticket.status !== 'validated' && (
                <div className="pt-1.5 border-t border-indigo-200/60 dark:border-indigo-800/60 space-y-1">
                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    {currentAssignedBus ? 'Change / Confirm Bus Code for Driver:' : 'Select Bus Code upon boarding:'}
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={inputBusCode}
                      onChange={e => setInputBusCode(e.target.value.toUpperCase())}
                      placeholder="e.g. MTC-21G-01"
                      className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg font-mono font-bold text-xs uppercase dark:text-slate-100"
                    />
                    {onTagBusCode && (
                      <button
                        type="button"
                        onClick={handleTagBus}
                        disabled={!inputBusCode.trim()}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg shadow transition-colors disabled:opacity-50 shrink-0"
                      >
                        Tag Bus
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
              <span className="text-slate-400 font-medium">Boarding:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.from_stop}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
              <span className="text-slate-400 font-medium">Destination:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.to_stop}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2">
              <span className="text-slate-400 font-medium">Passengers:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{ticket.passenger_count} Person(s)</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700/60 pb-2">
              <span className="text-slate-400 font-medium">Total Fare:</span>
              <span className="font-black text-lg text-emerald-600 dark:text-emerald-400">₹{ticket.total_fare}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Valid Until:</span>
              <span className={`font-medium ${isExpired ? 'text-red-500 font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
                {new Date(ticket.valid_until).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
          {ticket.status === 'validated' ? (
            <div className="text-center p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold">
              <p>Validated on {ticket.validated_on_bus}</p>
              <p className="text-[10px] opacity-80 mt-0.5">{new Date(ticket.validated_at!).toLocaleString()}</p>
            </div>
          ) : (
            renderValidationContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetailsModal;
