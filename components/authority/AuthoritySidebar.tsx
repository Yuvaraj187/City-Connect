import React from 'react';
import { AuthorityViewType, AuthorityNavItem } from '../../types';
import BusIcon from '../icons/BusIcon';

interface AuthoritySidebarProps {
    activeView: AuthorityViewType;
    setActiveView: (view: AuthorityViewType) => void;
    navItems: AuthorityNavItem[];
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const AuthoritySidebar: React.FC<AuthoritySidebarProps> = ({ activeView, setActiveView, navItems, isSidebarOpen, setIsSidebarOpen }) => {
    
    const SidebarContent = () => (
        <div className="flex h-full w-64 flex-col bg-white border-r dark:border-slate-700 dark:bg-slate-800">
            <div className="flex h-16 flex-shrink-0 items-center border-b px-6 dark:border-slate-700">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <BusIcon className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">CityConnect</h1>
            </div>
            <nav className="flex-1 space-y-1 px-4 py-6">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setActiveView(item.id);
                            setIsSidebarOpen(false); // Close sidebar on selection
                        }}
                        className={`group flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                            activeView === item.id
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100'
                        }`}
                    >
                        <div className={`mr-3 ${activeView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300'}`}>
                            {React.cloneElement(item.icon, { className: "h-6 w-6" })}
                        </div>
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );
    
    return (
       <>
         {/* Backdrop */}
         {isSidebarOpen && (
            <div 
                className="fixed inset-0 bg-black/30 z-30 transition-opacity lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
                aria-hidden="true"
            ></div>
         )}
         
         {/* Mobile Sidebar */}
         <div 
            className={`fixed inset-y-0 left-0 z-40 flex lg:hidden transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
            role="dialog"
            aria-modal="true"
         >
            <div className="relative flex w-full max-w-xs flex-1">
                <SidebarContent />
            </div>
         </div>

         {/* Desktop Sidebar */}
         <aside className="hidden lg:flex lg:flex-shrink-0">
            <SidebarContent />
         </aside>
       </>
    );
};

export default AuthoritySidebar;
