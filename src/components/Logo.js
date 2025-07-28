import React from 'react';
import { ReactComponent as LauLogo } from './Group 2326.svg';

const Logo = ({ size = 'md', className = '', showText = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-3',
    md: 'w-12 h-4',
    lg: 'w-16 h-6',
    xl: 'w-20 h-7',
    '2xl': 'w-24 h-9'
  };

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <LauLogo className="w-full h-full" />
      </div>
      {showText && (
        <span className="text-3xl font-bold text-white">SignalOS</span>
      )}
    </div>
  );
};

export default Logo; 