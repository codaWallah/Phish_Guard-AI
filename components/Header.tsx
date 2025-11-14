
import React from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-secondary/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-center">
        <ShieldCheckIcon className="h-8 w-8 text-safe" />
        <h1 className="ml-3 text-2xl md:text-3xl font-bold tracking-tight text-light">
          PhishGuard AI
        </h1>
      </div>
    </header>
  );
};

export default Header;
