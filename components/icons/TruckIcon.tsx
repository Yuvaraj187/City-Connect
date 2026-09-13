import React from 'react';

const TruckIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 17.5V14H3V12l1-5h12.5" />
        <path d="M14 17.5h5.5a1 1 0 0 0 .8-1.6l-2-3" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
);

export default TruckIcon;