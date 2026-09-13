// components/authority/VehiclesTableView.tsx - RECTIFIED

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { routes } from '../../data'; // We still need this for route names
import { Vehicle } from '../../types';
import SearchIcon from '../icons/SearchIcon';
import FilterIcon from '../icons/FilterIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';
import { getVehicles } from '../../services/apiService'; // <- IMPORT the new function
import SpinnerIcon from '../icons/SpinnerIcon';

interface VehiclesTableViewProps {
    onTrackVehicle: (vehicleId: string) => void;
}

const StatusBadge: React.FC<{ status: Vehicle['status'] }> = ({ status }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full uppercase tracking-wider inline-block";
    const styles = {
        'On road': 'bg-green-100 text-green-800 dark:bg-green-500/10 dark:text-green-400',
        'Failure': 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
        'Pause': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-400',
    };
    return <span className={`${baseClasses} ${styles[status]}`}>{status}</span>;
}

const FilterDropdown: React.FC<{
    label: string;
    options: { value: string; label: string }[];
    selectedValue: string;
    onSelect: (value: string) => void;
}> = ({ label, options, selectedValue, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.value === selectedValue)?.label || label;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
            >
                <FilterIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>{selectedLabel}</span>
                <ChevronDownIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-10 border dark:bg-slate-700 dark:border-slate-600">
                    <div className="py-1">
                        {options.map(option => (
                            <a
                                key={option.value}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onSelect(option.value);
                                    setIsOpen(false);
                                }}
                                className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-600"
                            >
                                {option.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const VehiclesTableView: React.FC<VehiclesTableViewProps> = ({ onTrackVehicle }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]); // <- State for vehicles
    const [isLoading, setIsLoading] = useState(true); // <- Loading state
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ status: 'all', routeId: 'all' });

    // NEW: Fetch vehicles from the database when the component loads
    useEffect(() => {
        const loadVehicles = async () => {
            setIsLoading(true);
            const dbVehicles = await getVehicles();
            setVehicles(dbVehicles);
            setIsLoading(false);
        };
        loadVehicles();
    }, []);


    const statusOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'On road', label: 'On road' },
        { value: 'Failure', label: 'Failure' },
        { value: 'Pause', label: 'Pause' },
    ];

    const routeOptions = [
        { value: 'all', label: 'All Routes' },
        ...routes.map(r => ({ value: r.id, label: r.name })),
    ];

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(vehicle => {
            const searchLower = searchQuery.toLowerCase();
            const driverName = (vehicle.driver as { name: string })?.name || '';
            const searchMatch = vehicle.id.toLowerCase().includes(searchLower) || driverName.toLowerCase().includes(searchLower);
            const statusMatch = filters.status === 'all' || vehicle.status === filters.status;
            const routeMatch = filters.routeId === 'all' || vehicle.routeId === filters.routeId;
            return searchMatch && statusMatch && routeMatch;
        });
    }, [searchQuery, filters, vehicles]);

    return (
        <div className="h-full flex flex-col">
            <h2 className="text-2xl font-bold text-slate-800 mb-1 dark:text-slate-100">Vehicle Fleet</h2>
            <p className="text-slate-500 mb-6 dark:text-slate-400">A complete overview of all vehicles in operation.</p>

            <div className="bg-white p-4 rounded-xl shadow-md border dark:bg-slate-800 dark:border-slate-700 flex-grow flex flex-col">
                {/* Header with Search and Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="relative w-full sm:w-72">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="w-5 h-5 text-slate-400" />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by ID or driver..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:bg-slate-600"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                         <FilterDropdown 
                            label="Status"
                            options={statusOptions}
                            selectedValue={filters.status}
                            onSelect={status => setFilters(prev => ({...prev, status}))}
                        />
                        <FilterDropdown 
                            label="Route"
                            options={routeOptions}
                            selectedValue={filters.routeId}
                            onSelect={routeId => setFilters(prev => ({...prev, routeId}))}
                        />
                    </div>
                </div>

                {/* Table & Mobile Cards */}
                <div className="flex-grow overflow-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full py-12">
                            <SpinnerIcon className="w-8 h-8 text-indigo-500 animate-spin" />
                            <span className="ml-2 text-slate-500 font-medium">Loading fleet data...</span>
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                            No vehicles matching search criteria.
                        </div>
                    ) : (
                        <>
                            {/* Mobile Card List */}
                            <div className="block sm:hidden space-y-3">
                                {filteredVehicles.map(vehicle => {
                                    const route = routes.find(r => r.id === vehicle.routeId);
                                    const driver = vehicle.driver as { name?: string };
                                    return (
                                        <div key={vehicle.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">{vehicle.id}</span>
                                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{route?.name || 'Unassigned'}</h4>
                                                </div>
                                                <StatusBadge status={vehicle.status} />
                                            </div>
                                            <div className="text-xs text-slate-600 dark:text-slate-300 flex justify-between pt-1">
                                                <span>Driver: <strong className="text-slate-800 dark:text-slate-100">{driver?.name || 'N/A'}</strong></span>
                                                <span className="truncate max-w-[140px]">📍 {vehicle.location}</span>
                                            </div>
                                            <button 
                                                onClick={() => onTrackVehicle(vehicle.id)} 
                                                className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-colors text-center"
                                            >
                                                Track Vehicle on Map ➔
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop Table View */}
                            <table className="hidden sm:table min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700 sticky top-0">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-300">Vehicle ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-300">Driver</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-300">Route</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-300">Status</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider dark:text-slate-300">Current Location</th>
                                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200 dark:bg-slate-800 dark:divide-slate-700">
                                    {filteredVehicles.map(vehicle => {
                                        const route = routes.find(r => r.id === vehicle.routeId);
                                        const driver = vehicle.driver as { name?: string };
                                        return (
                                            <tr key={vehicle.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-slate-100">{vehicle.id}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{driver?.name || 'N/A'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{route?.name || 'Unassigned'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={vehicle.status} /></td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{vehicle.location}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => onTrackVehicle(vehicle.id)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold">View on Map</button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehiclesTableView;