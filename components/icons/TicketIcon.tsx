import React from 'react';

const TicketIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2V7a2 2 0 00-2-2H5zM15 11v2m-3-4H9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.586 11.414a2 2 0 010 2.828l-2.828 2.828a2 2 0 01-2.828 0l-4.244-4.243a2 2 0 010-2.828l2.828-2.828a2 2 0 012.828 0l4.244 4.243z" />
    </svg>
);

export default TicketIcon;
