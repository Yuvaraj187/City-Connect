import React, { useState } from 'react';
import BusIcon from './icons/BusIcon';
import EnvelopeIcon from './icons/EnvelopeIcon';
import PhoneIcon from './icons/PhoneIcon';
import LockClosedIcon from './icons/LockClosedIcon';
import UserIcon from './icons/UserIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import XMarkIcon from './icons/XMarkIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface AuthorityAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSwitch: (staffDetails?: { staffId: string; roleName: string }) => void;
}

export const AuthorityAuthModal: React.FC<AuthorityAuthModalProps> = ({
  isOpen,
  onClose,
  onConfirmSwitch
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('phone');
  
  const [staffId, setStaffId] = useState('MTC-CON-2041');
  const [email, setEmail] = useState('inspector.kumar@mtc.gov.in');
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('••••••••');
  const [fullName, setFullName] = useState('K. Kumar (Senior Inspector)');
  const [designation, setDesignation] = useState('Conductor / Ticket Inspector');
  const [depot, setDepot] = useState('Central T. Nagar Depot');

  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);

    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Staff credentials verified! Redirecting to Transit Authority Portal...');
      setTimeout(() => {
        onConfirmSwitch({ staffId, roleName: designation });
        onClose();
      }, 1000);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        {/* Header */}
        <div className="bg-indigo-600 dark:bg-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl">
              <ShieldCheckIcon className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Transit Authority Staff Gateway</h3>
              <p className="text-xs text-indigo-200">Sign in or register with official transport staff credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Dual Role Context Banner */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="text-base">👥</span>
              <div>
                <strong className="block font-bold">Dual-Role Account Active</strong>
                <span>Common Public Commuter + Transit Official Staff</span>
              </div>
            </div>
            <button
              onClick={() => onConfirmSwitch({ staffId: 'MTC-STAFF-001', roleName: 'Verified Official' })}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow text-[11px] shrink-0"
            >
              Quick Switch ➔
            </button>
          </div>

          {/* SIGN IN VS SIGN UP TABS */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2.5 font-bold text-xs border-b-2 transition-colors ${
                authMode === 'signin'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Authority Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2.5 font-bold text-xs border-b-2 transition-colors ${
                authMode === 'signup'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Register New Official / Staff
            </button>
          </div>

          {/* EMAIL VS PHONE TOGGLE */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex text-xs font-bold gap-1">
            <button
              type="button"
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                authMethod === 'phone'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <PhoneIcon className="w-3.5 h-3.5" />
              <span>Mobile Phone</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-2 transition-all ${
                authMethod === 'email'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <EnvelopeIcon className="w-3.5 h-3.5" />
              <span>Official Email</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. K. Kumar"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Official Staff / Badge ID
              </label>
              <input
                type="text"
                required
                value={staffId}
                onChange={e => setStaffId(e.target.value.toUpperCase())}
                placeholder="e.g. MTC-CON-2041"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400"
              />
            </div>

            {authMethod === 'phone' ? (
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Staff Mobile Number
                </label>
                <div className="relative">
                  <PhoneIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <EnvelopeIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="official@mtc.gov.in"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            {authMode === 'signup' && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Designation
                  </label>
                  <select
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="Conductor / Ticket Inspector">Conductor / Ticket Inspector</option>
                    <option value="Bus Driver">Bus Driver</option>
                    <option value="Depot Manager">Depot Manager</option>
                    <option value="Fleet Traffic Controller">Fleet Traffic Controller</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                    Assigned Depot
                  </label>
                  <input
                    type="text"
                    value={depot}
                    onChange={e => setDepot(e.target.value)}
                    placeholder="e.g. T. Nagar Depot"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">
                Security Password / Official PIN
              </label>
              <div className="relative">
                <LockClosedIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            {successMsg && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-bold text-center">
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              {loading ? <SpinnerIcon className="w-4 h-4" /> : authMode === 'signin' ? 'Verify & Launch Authority Portal' : 'Register Official Credentials'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
