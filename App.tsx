import React, { useState, useCallback, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import PassengerView from './components/PassengerView';
import AuthorityView from './components/AuthorityView';
import AuthView from './components/AuthView';
import { UserRole, UserProfile } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { useOfflineQueue } from './hooks/useOfflineQueue';
import { getProfile } from './services/apiService';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.Passenger);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [isEmergencyMode, setIsEmergencyMode] = useLocalStorage<boolean>('emergency-mode', false);
  const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('user-profile', {
    name: 'Jane Doe',
    email: 'passenger@cityconnect.com',
    phone: '+91 98765 00000',
    homeAddress: 'T. Nagar, Chennai',
    workAddress: 'Guindy, Chennai',
    notifications: { serviceAlerts: true, proximityAlerts: true, promotions: false }
  });

  useOfflineQueue();

  const handleLoginSuccess = async (initialRole?: UserRole) => {
    const profile = await getProfile();
    if (profile) {
      setUserProfile(profile);
    }
    if (initialRole !== undefined) {
      setUserRole(initialRole);
    }
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isEmergencyMode) {
      root.classList.add('emergency-mode', 'dark');
    } else {
      root.classList.remove('emergency-mode');
      root.classList.toggle('dark', theme === 'dark');
    }
  }, [theme, isEmergencyMode]);

  const handleRoleChange = useCallback((role: UserRole) => setUserRole(role), []);
  const handleOnlineStatusChange = useCallback((status: boolean) => setIsOnline(status), []);
  const handleSignOut = useCallback(() => {
    try {
      supabase.auth.signOut();
    } catch {
      // ignore
    }
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) {
    return <AuthView onLoginSuccess={handleLoginSuccess} />;
  }

  if (userRole === UserRole.Authority) {
    return <AuthorityView onRoleChange={handleRoleChange} onSignOut={handleSignOut} theme={theme} setTheme={setTheme} />;
  }

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200">
        <Header
          isOnline={isOnline}
          onOnlineStatusChange={handleOnlineStatusChange}
          onRoleChange={handleRoleChange}
          onSignOut={handleSignOut}
          userProfile={userProfile}
          theme={isEmergencyMode ? 'dark' : theme}
          setTheme={setTheme}
        />
        <main>
          <PassengerView
            isOnline={isOnline}
            theme={isEmergencyMode ? 'dark' : theme}
            setTheme={setTheme}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            isEmergencyMode={isEmergencyMode}
            setIsEmergencyMode={setIsEmergencyMode}
          />
        </main>
      </div>
    </div>
  );
};

export default App;
