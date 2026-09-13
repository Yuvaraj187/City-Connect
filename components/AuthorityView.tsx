// AuthorityView.tsx - RECTIFIED (Driver Mode Removed)

import React, { useState } from 'react';
import { UserRole, AuthorityViewType, AuthorityNavItem } from '../types';
import { AuthorityHeader } from './authority/AuthorityHeader';
import AuthoritySidebar from './authority/AuthoritySidebar';
import Dashboard from './authority/Dashboard';
import ChatView from './authority/ChatView';
import SettingsView from './authority/SettingsView';
import ChartBarIcon from './icons/ChartBarIcon';
import ChatIcon from './icons/ChatIcon';
import TruckIcon from './icons/TruckIcon';
import CogIcon from './icons/CogIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
import TicketIcon from './icons/TicketIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import VehiclesTableView from './authority/VehiclesTableView';
import LiveTrackingView from './authority/LiveTrackingView';
import { TicketScannerView } from './authority/TicketScannerView';
import { ReportModerationView } from './authority/ReportModerationView';

interface AuthorityViewProps {
    onRoleChange: (role: UserRole) => void;
    onSignOut: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const AuthorityView: React.FC<AuthorityViewProps> = ({ onRoleChange, onSignOut, theme, setTheme }) => {
  const [activeView, setActiveView] = useState<AuthorityViewType>('analytics');
  const [vehicleToTrack, setVehicleToTrack] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleTrackVehicle = (vehicleId: string) => {
    setVehicleToTrack(vehicleId);
    setActiveView('live-tracking');
  };

  const navItems: AuthorityNavItem[] = [
    { id: 'analytics', icon: <ChartBarIcon />, label: 'Analytics' },
    { id: 'tickets', icon: <TicketIcon />, label: 'Ticket Verifier' },
    { id: 'vehicles', icon: <TruckIcon />, label: 'Vehicles' },
    { id: 'live-tracking', icon: <GlobeAltIcon />, label: 'Live Tracking' },
    { id: 'reports', icon: <ExclamationTriangleIcon />, label: 'Report Moderation' },
    { id: 'chat', icon: <ChatIcon />, label: 'Chat' },
    { id: 'settings', icon: <CogIcon />, label: 'Settings' },
  ];
  
  const needsPadding = ['analytics', 'tickets', 'vehicles', 'reports', 'settings'].includes(activeView);

  const renderActiveView = () => {
    switch (activeView) {
        case 'analytics':
            return <Dashboard />;
        case 'tickets':
            return <TicketScannerView />;
        case 'vehicles':
            return <VehiclesTableView onTrackVehicle={handleTrackVehicle} />;
        case 'live-tracking':
            const initialVehicleId = vehicleToTrack;
            if (vehicleToTrack) setVehicleToTrack(null);
            return <LiveTrackingView initialVehicleId={initialVehicleId} />;
        case 'reports':
            return <ReportModerationView />;
        case 'chat':
            return <ChatView />;
        case 'settings':
            return <SettingsView theme={theme} setTheme={setTheme} />;
        default:
            return <Dashboard />;
    }
  }

  return (
    <div className="flex h-screen w-screen bg-slate-50 text-slate-900 overflow-hidden dark:bg-slate-900 dark:text-slate-300">
      <AuthoritySidebar 
        navItems={navItems}
        activeView={activeView}
        setActiveView={setActiveView}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AuthorityHeader 
          onRoleChange={onRoleChange}
          onSignOut={onSignOut}
          theme={theme}
          setTheme={setTheme}
          onMenuClick={() => setIsSidebarOpen(true)}
          activeViewLabel={navItems.find(i => i.id === activeView)?.label || 'Dashboard'}
        />
        <div className="flex-1 overflow-hidden relative">
            <main className={`absolute inset-0 overflow-y-auto pb-20 lg:pb-0 ${needsPadding ? 'p-4 sm:p-6 lg:p-8' : ''}`}>
                {renderActiveView()}
            </main>
        </div>
      </div>

      {/* Responsive mobile bottom navigation bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-around z-30 shadow-lg px-1 py-1">
        {navItems.map(item => {
          const isActive = activeView === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-center min-w-[54px] transition-all ${
                isActive 
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 font-bold' 
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {React.cloneElement(item.icon, { className: "h-5 w-5" })}
              <span className="text-[10px] tracking-tight leading-tight mt-0.5 whitespace-nowrap">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AuthorityView;