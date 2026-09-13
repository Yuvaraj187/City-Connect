import React, { useState } from 'react';
import UserCircleIcon from '../icons/UserCircleIcon';
import BellIcon from '../icons/BellIcon';
import CreditCardIcon from '../icons/CreditCardIcon';
import SunIcon from '../icons/SunIcon';
import MoonIcon from '../icons/MoonIcon';
import ArrowUpOnSquareIcon from '../icons/ArrowUpOnSquareIcon';
import { UserRole } from '../../types';

interface SettingsViewProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme }) => {
    
    const SettingSection: React.FC<{title: string; description: string; children: React.ReactNode}> = ({title, description, children}) => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b dark:border-slate-700">
            <div className="md:col-span-1">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md border dark:bg-slate-800 dark:border-slate-700">
                {children}
            </div>
        </div>
    );
    
    const Toggle: React.FC<{label: string; description:string; enabled: boolean; setEnabled: (e:boolean) => void}> = ({label, description, enabled, setEnabled}) => (
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium dark:text-slate-100">{label}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            <button
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${enabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}
            >
                <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`}/>
            </button>
        </div>
    );

    return (
    <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2 dark:text-slate-100">Settings</h2>
        <p className="text-slate-600 mb-6 dark:text-slate-400">Manage your account settings and set e-mail preferences.</p>

        <div className="max-w-4xl mx-auto">
            <SettingSection title="Profile" description="This information will be displayed publicly so be careful what you share.">
                <div className="space-y-4">
                     <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 dark:bg-slate-700">
                           <UserCircleIcon className="w-12 h-12" />
                        </div>
                        <button className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700">Change</button>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                        <input type="text" defaultValue="David Jankowski" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
                    </div>
                </div>
            </SettingSection>

            <SettingSection title="Account" description="Manage your account and billing information.">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                        <input type="email" defaultValue="manager@cityconnect.com" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Plan</label>
                        <div className="mt-1 flex items-center justify-between p-3 border rounded-md dark:border-slate-700">
                            <div>
                                <p className="font-semibold text-indigo-600 dark:text-indigo-400">Enterprise Plan</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Unlimited vehicles, premium support.</p>
                            </div>
                            <button className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700">Upgrade</button>
                        </div>
                    </div>
                </div>
            </SettingSection>
            
            <SettingSection title="Notifications" description="Decide how you want to be notified about important events.">
                <div className="space-y-4">
                    <Toggle label="Email Notifications" description="Get emails for critical alerts and summaries." enabled={true} setEnabled={() => {}} />
                    <Toggle label="Push Notifications" description="Receive push notifications on your mobile device." enabled={true} setEnabled={() => {}} />
                    <Toggle label="Monthly Reports" description="Send a performance report at the start of each month." enabled={false} setEnabled={() => {}} />
                </div>
            </SettingSection>

            <SettingSection title="Appearance" description="Customize the look and feel of your dashboard.">
                 <div className="flex items-center space-x-2">
                    <button onClick={() => setTheme('light')} className={`flex-1 p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors ${theme === 'light' ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-700'}`}>
                        <SunIcon className="w-8 h-8 text-yellow-500"/>
                        <span className="font-semibold">Light</span>
                    </button>
                     <button onClick={() => setTheme('dark')} className={`flex-1 p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors ${theme === 'dark' ? 'ring-2 ring-indigo-500 bg-slate-700 text-white' : 'hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-600'}`}>
                        <MoonIcon className={`w-8 h-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-600'}`}/>
                        <span className="font-semibold">Dark</span>
                    </button>
                </div>
            </SettingSection>
        </div>

        <div className="flex justify-end mt-8">
            <button className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition">Save Changes</button>
        </div>
    </div>
  );
};

export default SettingsView;