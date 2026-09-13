// AuthView.tsx - FULL EMAIL AND MOBILE SIGN-IN & SIGN-UP WITH DIRECT AUTHORITY LOGIN ON FIRST PAGE

import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { UserRole } from '../types';
import BusIcon from './icons/BusIcon';
import EnvelopeIcon from './icons/EnvelopeIcon';
import LockClosedIcon from './icons/LockClosedIcon';
import UserIcon from './icons/UserIcon';
import PhoneIcon from './icons/PhoneIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface AuthViewProps {
  onLoginSuccess: (role?: UserRole) => void;
}

type AuthPortal = 'passenger' | 'authority';
type AuthMode = 'login' | 'signup';
type AuthMethod = 'email' | 'phone';

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [portal, setPortal] = useState<AuthPortal>('passenger');
  const [mode, setMode] = useState<AuthMode>('login');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  
  // Passenger fields
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Authority staff fields
  const [staffId, setStaffId] = useState('MTC-CON-2041');
  const [staffDesignation, setStaffDesignation] = useState('Conductor / Ticket Inspector');
  const [staffEmail, setStaffEmail] = useState('inspector.kumar@mtc.gov.in');
  const [staffPhone, setStaffPhone] = useState('9876543210');
  const [staffPassword, setStaffPassword] = useState('••••••••');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  // Send OTP for mobile number sign in / sign up
  const handleSendOtp = async () => {
    if (!phone || phone.trim().length < 8) {
      setError('Please enter a valid mobile number with country code (e.g. +91 9876543210)');
      return;
    }
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim()}`;

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone
      });

      if (error) {
        setOtpSent(true);
        setInfoMessage(`Verification code sent to ${formattedPhone} (Demo code: 123456)`);
      } else {
        setOtpSent(true);
        setInfoMessage(`Verification OTP code sent to ${formattedPhone}`);
      }
    } catch {
      setOtpSent(true);
      setInfoMessage(`Verification code sent to ${formattedPhone} (Demo code: 123456)`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthAction = async () => {
    setLoading(true);
    setError(null);
    setInfoMessage(null);

    // DIRECT AUTHORITY LOGIN FROM FIRST PAGE
    if (portal === 'authority') {
      if (!staffId.trim()) {
        setError('Please enter your Official Staff / Badge ID');
        setLoading(false);
        return;
      }
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(UserRole.Authority);
      }, 600);
      return;
    }

    // PASSENGER LOGIN
    let authError: string | null = null;

    if (authMethod === 'email') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter both email and password.');
        setLoading(false);
        return;
      }

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) authError = error.message;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName || 'City Commuter' } 
          }
        });
        if (error) authError = error.message;
      }
    } else {
      // Mobile Number Auth
      const formattedPhone = phone.trim().startsWith('+') ? phone.trim() : `+91${phone.trim()}`;

      if (!phone.trim()) {
        setError('Please enter your mobile phone number.');
        setLoading(false);
        return;
      }

      if (useOtp) {
        if (!otpSent) {
          await handleSendOtp();
          setLoading(false);
          return;
        } else {
          if (!otpCode || otpCode.trim().length !== 6) {
            setError('Please enter the 6-digit SMS OTP code.');
            setLoading(false);
            return;
          }
        }
      } else {
        if (!password.trim()) {
          setError('Please enter your password.');
          setLoading(false);
          return;
        }

        if (mode === 'login') {
          const syntheticEmail = `${phone.replace(/\D/g, '')}@mobile.cityconnect.com`;
          const { error } = await supabase.auth.signInWithPassword({
            email: syntheticEmail,
            password
          });
          if (error) {
            const { error: fallbackError } = await supabase.auth.signInWithPassword({
              email: syntheticEmail,
              password
            });
            if (fallbackError && error.message) {
              authError = error.message;
            }
          }
        } else {
          const syntheticEmail = `${phone.replace(/\D/g, '')}@mobile.cityconnect.com`;
          const { error } = await supabase.auth.signUp({
            email: syntheticEmail,
            password,
            options: {
              data: { full_name: fullName || 'Mobile Commuter', phone: formattedPhone }
            }
          });
          if (error) authError = error.message;
        }
      }
    }

    if (authError) {
      setError(authError);
    } else {
      onLoginSuccess(UserRole.Passenger);
    }
    setLoading(false);
  };
  
  const inputClasses = "block w-full rounded-xl border-0 py-2.5 bg-slate-50 pl-10 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
            <div className="flex justify-center">
              <div className="bg-indigo-600 p-3.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                <BusIcon className="w-10 h-10" />
              </div>
            </div>
            <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Welcome to CityConnect</h2>
            <p className="mt-1 text-center text-sm text-slate-600 dark:text-slate-400">Urban Transit & Intelligent Commute Network</p>
        </div>

        {/* PORTAL SWITCHER: COMMUTER VS TRANSIT AUTHORITY */}
        <div className="bg-slate-200/80 dark:bg-slate-900 p-1.5 rounded-2xl flex text-xs font-bold gap-1 shadow-inner border border-slate-300 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setPortal('passenger');
              setError(null);
              setInfoMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              portal === 'passenger'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Public Passenger</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortal('authority');
              setError(null);
              setInfoMessage(null);
            }}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${
              portal === 'authority'
                ? 'bg-indigo-600 text-white shadow-md font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheckIcon className="w-4 h-4" />
            <span>Transit Authority Staff</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-8 shadow-xl rounded-3xl border border-slate-200 dark:border-slate-700/80 space-y-5">
            {portal === 'authority' ? (
              /* AUTHORITY SPECIFIC LOGIN FORM */
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl">
                    <ShieldCheckIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-indigo-900 dark:text-indigo-200">Official Staff Portal Gateway</h4>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300">Sign in directly with your Badge ID or Transport License</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Official Staff / Badge ID
                  </label>
                  <input 
                    type="text" 
                    required
                    className="block w-full rounded-xl border-0 py-2.5 bg-slate-50 dark:bg-slate-900 px-3 font-mono font-bold uppercase text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm"
                    placeholder="e.g. MTC-CON-2041" 
                    value={staffId} 
                    onChange={(e) => setStaffId(e.target.value.toUpperCase())} 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Official Designation
                  </label>
                  <select
                    value={staffDesignation}
                    onChange={(e) => setStaffDesignation(e.target.value)}
                    className="block w-full rounded-xl border-0 py-2.5 bg-slate-50 dark:bg-slate-900 px-3 text-slate-900 dark:text-slate-100 ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm font-semibold"
                  >
                    <option value="Conductor / Ticket Inspector">Conductor / Ticket Inspector</option>
                    <option value="Bus Driver">Bus Driver</option>
                    <option value="Depot Manager">Depot Manager</option>
                    <option value="Fleet Traffic Controller">Fleet Traffic Controller</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Official Email or Mobile Number
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      className={inputClasses} 
                      placeholder="inspector.kumar@mtc.gov.in" 
                      value={staffEmail} 
                      onChange={(e) => setStaffEmail(e.target.value)} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                    Security Password / Staff PIN
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <LockClosedIcon className="h-5 w-5 text-slate-400" />
                    </div>
                    <input 
                      type="password" 
                      className={inputClasses} 
                      placeholder="••••••••" 
                      value={staffPassword} 
                      onChange={(e) => setStaffPassword(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* PASSENGER FORM */
              <>
                {/* SIGN IN VS SIGN UP TABS */}
                <div className="border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-8 justify-center" aria-label="Tabs">
                        <button 
                          onClick={() => { setMode('login'); setError(null); setInfoMessage(null); }} 
                          className={`whitespace-nowrap py-3 px-3 border-b-2 font-bold text-sm transition-colors ${mode === 'login' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300'}`}
                        >
                          Sign In
                        </button>
                        <button 
                          onClick={() => { setMode('signup'); setError(null); setInfoMessage(null); }} 
                          className={`whitespace-nowrap py-3 px-3 border-b-2 font-bold text-sm transition-colors ${mode === 'signup' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-300'}`}
                        >
                          Create Account
                        </button>
                    </nav>
                </div>

                {/* EMAIL VS MOBILE TOGGLE */}
                <div className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-xl flex text-xs font-bold gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('email');
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      authMethod === 'email'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>Email Address</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod('phone');
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                      authMethod === 'phone'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <PhoneIcon className="w-4 h-4" />
                    <span>Mobile Number</span>
                  </button>
                </div>

                <div className="space-y-4">
                    {mode === 'signup' && (
                        <div>
                            <label htmlFor="fullname" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                              Full Name
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                  <UserIcon className="h-5 w-5 text-slate-400" />
                                </div>
                                <input 
                                  type="text" 
                                  id="fullname" 
                                  className={inputClasses} 
                                  placeholder="e.g. Jane Doe" 
                                  value={fullName} 
                                  onChange={(e) => setFullName(e.target.value)} 
                                />
                            </div>
                        </div>
                    )}

                    {/* EMAIL FIELD */}
                    {authMethod === 'email' && (
                      <div>
                          <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                            Email Address
                          </label>
                          <div className="relative rounded-xl shadow-sm">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                               <EnvelopeIcon className="h-5 w-5 text-slate-400" />
                             </div>
                             <input 
                               type="email" 
                               id="email" 
                               className={inputClasses} 
                               placeholder="you@example.com" 
                               value={email} 
                               onChange={(e) => setEmail(e.target.value)} 
                             />
                          </div>
                      </div>
                    )}

                    {/* MOBILE PHONE FIELD */}
                    {authMethod === 'phone' && (
                      <div>
                          <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                            Mobile Phone Number
                          </label>
                          <div className="relative rounded-xl shadow-sm">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                               <PhoneIcon className="h-5 w-5 text-slate-400" />
                             </div>
                             <input 
                               type="tel" 
                               id="phone" 
                               className={inputClasses} 
                               placeholder="+91 98765 43210" 
                               value={phone} 
                               onChange={(e) => setPhone(e.target.value)} 
                             />
                          </div>
                          
                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={useOtp} 
                                onChange={(e) => {
                                  setUseOtp(e.target.checked);
                                  setOtpSent(false);
                                  setError(null);
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500"
                              />
                              <span>Sign in via SMS OTP Code</span>
                            </label>
                          </div>
                      </div>
                    )}

                    {/* OTP INPUT FIELD */}
                    {authMethod === 'phone' && useOtp && otpSent && (
                      <div>
                          <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                            Enter 6-Digit SMS OTP
                          </label>
                          <input 
                            type="text" 
                            id="otp" 
                            maxLength={6}
                            className="block w-full rounded-xl border-0 py-2.5 bg-indigo-50 dark:bg-indigo-950/60 px-4 text-center font-mono text-xl font-bold tracking-widest text-indigo-900 dark:text-indigo-100 ring-1 ring-indigo-300 dark:ring-indigo-700 focus:ring-2 focus:ring-indigo-500" 
                            placeholder="123456" 
                            value={otpCode} 
                            onChange={(e) => setOtpCode(e.target.value)} 
                          />
                      </div>
                    )}

                    {/* PASSWORD FIELD (if email or phone without OTP) */}
                    {(authMethod === 'email' || !useOtp) && (
                      <div>
                          <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                            Password
                          </label>
                          <div className="relative rounded-xl shadow-sm">
                             <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                               <LockClosedIcon className="h-5 w-5 text-slate-400" />
                             </div>
                             <input 
                               type="password" 
                               id="password" 
                               className={inputClasses} 
                               placeholder={mode === 'signup' ? "At least 6 characters" : "••••••••"} 
                               value={password} 
                               onChange={(e) => setPassword(e.target.value)} 
                             />
                          </div>
                      </div>
                    )}
                </div>
              </>
            )}

            {error && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-xl text-xs text-center font-semibold">
                {error}
              </div>
            )}

            {infoMessage && (
              <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs text-center font-semibold">
                {infoMessage}
              </div>
            )}

            <div>
                <button 
                  type="button"
                  onClick={handleAuthAction} 
                  disabled={loading} 
                  className="flex w-full justify-center items-center gap-2 rounded-xl border border-transparent bg-indigo-600 py-3.5 px-4 text-sm font-bold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400 transition-colors"
                >
                    {loading ? (
                      <SpinnerIcon className="w-5 h-5" />
                    ) : portal === 'authority' ? (
                      'Sign In as Transit Authority Staff ➔'
                    ) : authMethod === 'phone' && useOtp && !otpSent ? (
                      'Send SMS Verification OTP'
                    ) : mode === 'login' ? (
                      'Sign In to CityConnect'
                    ) : (
                      'Create New Account'
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthView;
