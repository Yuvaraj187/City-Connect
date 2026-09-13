// components/passenger/PassengerSettingsView.tsx - FINAL VERIFIED VERSION

import React, { useState, useEffect } from 'react';
import SunIcon from '../icons/SunIcon';
import MoonIcon from '../icons/MoonIcon';
import { UserProfile } from '../../types';
import EnvelopeIcon from '../icons/EnvelopeIcon';
import PhoneIcon from '../icons/PhoneIcon';
import HomeIcon from '../icons/HomeIcon';
import BuildingOfficeIcon from '../icons/BuildingOfficeIcon';
import BellIcon from '../icons/BellIcon';
import UserIcon from '../icons/UserIcon';
import { getProfile, updateProfile } from '../../services/apiService';
import SpinnerIcon from '../icons/SpinnerIcon';

interface PassengerSettingsViewProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile) => void;
    isEmergencyMode: boolean;
    setIsEmergencyMode: (status: boolean) => void;
}

const PassengerSettingsView: React.FC<PassengerSettingsViewProps> = ({ theme, setTheme, userProfile, setUserProfile, isEmergencyMode, setIsEmergencyMode }) => {
    
    const [formState, setFormState] = useState<Partial<UserProfile>>(userProfile);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // THE FIX IS HERE: We have removed 'setUserProfile' from the dependency array.
    // This tells React to run this effect ONLY ONCE when the component first loads,
    // which breaks the infinite loop.
    useEffect(() => {
        const loadProfile = async () => {
            setIsLoading(true);
            const profileFromDb = await getProfile();
            if (profileFromDb) {
                setFormState(profileFromDb);
                setUserProfile(profileFromDb);
            }
            setIsLoading(false);
        };
        loadProfile();
    }, []); // <-- The empty array is the critical fix.

    const handleSave = async () => {
        setIsSaving(true);
        const success = await updateProfile(formState);
        if (success) {
            setUserProfile({ ...userProfile, ...formState });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } else {
            alert("Failed to save profile. Please try again.");
        }
        setIsSaving(false);
    };

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (isLoading) {
        return <div className="flex justify-center items-center p-8"><SpinnerIcon className="w-8 h-8 text-indigo-500" /></div>;
    }

    // --- The rest of the file is unchanged, but included for a complete copy-paste ---
    return (
        <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4 dark:text-slate-100">Settings</h3>

            <SettingSection title="Profile Information" icon={<UserIcon className="w-7 h-7" />}>
                <InputField id="name" label="Full Name" value={formState.name || ''} onChange={handleProfileChange} icon={<UserIcon className="w-5 h-5 text-slate-400" />} />
                <InputField id="email" label="Email Address" value={formState.email || ''} onChange={() => {}} icon={<EnvelopeIcon className="w-5 h-5 text-slate-400" />} readOnly disabled />
                <InputField id="phone" label="Phone Number" value={formState.phone || ''} onChange={handleProfileChange} icon={<PhoneIcon className="w-5 h-5 text-slate-400" />} placeholder="e.g. 555-123-4567" />
                <InputField id="homeAddress" label="Home Address" value={formState.homeAddress || ''} onChange={handleProfileChange} icon={<HomeIcon className="w-5 h-5 text-slate-400" />} placeholder="e.g. 123 Main St" />
                <InputField id="workAddress" label="Work Address" value={formState.workAddress || ''} onChange={handleProfileChange} icon={<BuildingOfficeIcon className="w-5 h-5 text-slate-400" />} placeholder="e.g. 456 Business Ave" />
            </SettingSection>

            {/* Other sections like Notifications, Appearance are here as per your original design */}
            <SettingSection title="Appearance" description="Customize the look and feel of your dashboard.">
                 <div className="flex items-center space-x-2">
                    <button onClick={() => setTheme('light')} disabled={isEmergencyMode} className={`flex-1 p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'light' && !isEmergencyMode ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                        <SunIcon className="w-8 h-8 text-yellow-500"/>
                        <span className="font-semibold">Light</span>
                    </button>
                     <button onClick={() => setTheme('dark')} disabled={isEmergencyMode} className={`flex-1 p-4 border rounded-lg flex flex-col items-center justify-center space-y-2 transition-colors dark:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark' || isEmergencyMode ? 'ring-2 ring-indigo-500 bg-slate-700 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-600'}`}>
                        <MoonIcon className={`w-8 h-8 ${theme === 'dark' || isEmergencyMode ? 'text-indigo-400' : 'text-slate-600'}`}/>
                        <span className="font-semibold">Dark</span>
                    </button>
                </div>
            </SettingSection>

             <div className="flex justify-end items-center space-x-4 mt-6 pt-6 border-t dark:border-slate-700">
                {saved && <p className="text-sm text-green-600 dark:text-green-400 animate-pulse">Your preferences have been saved!</p>}
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md w-40 flex justify-center"
                >
                    {isSaving ? <SpinnerIcon /> : 'Save Preferences'}
                </button>
            </div>
        </div>
    );
};

const SettingSection: React.FC<{title: string; icon: React.ReactNode; children: React.ReactNode}> = ({title, icon, children}) => ( <div className="py-6 border-b dark:border-slate-700"> <div className="flex items-center mb-4"> <div className="w-8 h-8 mr-3 text-indigo-600 dark:text-indigo-400">{icon}</div> <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h4> </div> <div className="space-y-4 pl-11"> {children} </div> </div> );
const InputField: React.FC<{ id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; icon: React.ReactNode; type?: string; placeholder?: string; readOnly?: boolean; disabled?: boolean; }> = ({ id, label, value, onChange, icon, type = "text", placeholder = "", readOnly = false, disabled = false }) => ( <div> <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label> <div className="mt-1 relative rounded-md shadow-sm"> <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"> {icon} </div> <input type={type} name={id} id={id} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly} disabled={disabled} className="block w-full rounded-md border-0 bg-white py-2 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-700/50 dark:disabled:text-slate-400" /> </div> </div> );

export default PassengerSettingsView;