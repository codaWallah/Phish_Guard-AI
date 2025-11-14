import React from 'react';

export const ShieldCheckIcon: React.FC<{className?: string}> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path fillRule="evenodd" d="M12 21a9 9 0 100-18 9 9 0 000 18zm.707-11.293a1 1 0 00-1.414 0L9 12.086l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" />
  </svg>
);
