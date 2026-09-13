import React, { useState } from 'react';
import RouteFinder from './passenger/RouteFinder';
import LiveTracker from './passenger/LiveTracker';
import OfflineTicketing from './passenger/OfflineTicketing';
import AiAssistant from './passenger/AiAssistant';
import SearchIcon from './icons/SearchIcon';
import MapPinIcon from './icons/MapPinIcon';
import TicketIcon from './icons/TicketIcon';
import ChatIcon from './icons/ChatIcon';
import { PassengerViewType, UserProfile } from '../types';
import CogIcon from './icons/CogIcon';
import PassengerSettingsView from './passenger/PassengerSettingsView';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import CrowdsourcedReports from './passenger/CrowdsourcedReports';

interface PassengerViewProps {
  isOnline: boolean;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  userProfile: UserProfile;
  setUserProfile: (profile: UserProfile) => void;
  isEmergencyMode: boolean;
  setIsEmergencyMode: (status: boolean) => void;
}

const PassengerView: React.FC<PassengerViewProps> = ({ isOnline, theme, setTheme, userProfile, setUserProfile, isEmergencyMode, setIsEmergencyMode }) => {
  const [activeTab, setActiveTab] = useState<PassengerViewType>('finder');

  const handleNavigateTab = (tab: 'tracker' | 'ticketing') => {
    setActiveTab(tab);
  };

  const tabs = [
    { id: 'finder', label: 'Finder', icon: <SearchIcon /> },
    { id: 'tracker', label: 'Tracker', icon: <MapPinIcon /> },
    { id: 'ticketing', label: 'Tickets', icon: <TicketIcon /> },
    { id: 'reports', label: 'Reports', icon: <ExclamationTriangleIcon /> },
    { id: 'ai', label: 'Assistant', icon: <ChatIcon /> },
    { id: 'settings', label: 'Settings', icon: <CogIcon /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'finder':
        return <RouteFinder onNavigateTab={handleNavigateTab} />;
      case 'tracker':
        return <LiveTracker isEmergencyMode={isEmergencyMode} />;
      case 'ticketing':
        return <OfflineTicketing isOnline={isOnline} />;
      case 'reports':
        return <CrowdsourcedReports isOnline={isOnline} />;
      case 'ai':
        return <AiAssistant onNavigateTab={handleNavigateTab} />;
      case 'settings':
        return <PassengerSettingsView 
                    theme={theme} 
                    setTheme={setTheme} 
                    userProfile={userProfile} 
                    setUserProfile={setUserProfile} 
                    isEmergencyMode={isEmergencyMode}
                    setIsEmergencyMode={setIsEmergencyMode}
                />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Tabs for sm and up */}
      <div className="hidden sm:block mb-6">
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PassengerViewType)}
                className={`flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                {React.cloneElement(tab.icon, { className: 'w-5 h-5' })}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md pb-24 sm:pb-6 dark:bg-slate-800">
        {renderContent()}
      </div>

      {/* Bottom Navigation for mobile */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-1px_4px_rgba(0,0,0,0.05)] z-20 dark:bg-slate-800 dark:border-slate-700">
        <nav className="flex justify-around" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PassengerViewType)}
              className={`flex flex-col items-center justify-center space-y-1 w-full py-2 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10'
              }`}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {React.cloneElement(tab.icon, { className: 'w-6 h-6' })}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default PassengerView;