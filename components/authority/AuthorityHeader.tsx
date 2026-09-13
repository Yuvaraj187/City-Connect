import React, { useState, useRef, useEffect } from 'react';
import UserCircleIcon from '../icons/UserCircleIcon';
import SunIcon from '../icons/SunIcon';
import MoonIcon from '../icons/MoonIcon';
import Bars3Icon from '../icons/Bars3Icon';
import { UserRole } from '../../types';

interface AuthorityHeaderProps {
    onRoleChange: (role: UserRole) => void;
    onSignOut: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    onMenuClick: () => void;
    activeViewLabel?: string;
}

const SwitchRoleIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691V5.25a3.375 3.375 0 00-3.375-3.375H8.25a3.375 3.375 0 00-3.375 3.375v5.002" />
  </svg>
);

const SignOutIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

export const AuthorityHeader: React.FC<AuthorityHeaderProps> = ({ onRoleChange, onSignOut, theme, setTheme, onMenuClick, activeViewLabel = 'Analytics' }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-white px-4 shadow-sm sm:px-6 lg:px-8 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-3">
            <button
                type="button"
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                onClick={onMenuClick}
                aria-label="Open navigation menu"
            >
                <Bars3Icon className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                TRANSIT AUTHORITY
              </span>
              <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
              <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 truncate max-w-[150px] sm:max-w-none">
                {activeViewLabel}
              </h2>
            </div>
        </div>
      
        <div className="flex items-center gap-2 sm:gap-3">
             <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors"
                aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            >
                {theme === 'light' ? (
                    <MoonIcon className="h-5 w-5 text-slate-600" />
                ) : (
                    <SunIcon className="h-5 w-5 text-amber-400" />
                )}
            </button>

            <div className="relative" ref={profileRef}>
                <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)} 
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    aria-label="Open staff profile menu"
                >
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      MTC
                    </div>
                    <span className="hidden md:inline-block text-xs font-bold text-slate-700 dark:text-slate-200">
                      Officer Inspector
                    </span>
                </button>

                {isProfileOpen && (
                    <div className="absolute right-0 z-30 mt-2 w-64 origin-top-right rounded-2xl bg-white shadow-xl border border-slate-200 p-2 dark:bg-slate-800 dark:border-slate-700">
                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                            <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Official Badge #MTC-CON-2041</p>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">Inspector R. Kumar</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">inspector.kumar@mtc.gov.in</p>
                        </div>
                        <button 
                          onClick={() => { setIsProfileOpen(false); onRoleChange(UserRole.Passenger); }} 
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 rounded-xl hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                           <SwitchRoleIcon className="h-4 w-4 text-slate-500" />
                           <span>Switch to Public Passenger</span>
                        </button>
                        <button 
                          onClick={() => { setIsProfileOpen(false); onSignOut(); }} 
                          className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 rounded-xl hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 transition-colors mt-1"
                        >
                            <SignOutIcon className="h-4 w-4 text-red-500" />
                            <span>Sign Out Authority Portal</span>
                        </button>
                    </div>
                )}
            </div>
      </div>
    </header>
  );
};
