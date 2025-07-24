import React from 'react';
import { ReactComponent as LauLogo } from './Lau.svg';

const Logo = ({ size = 'md', className = '', showText = true }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <LauLogo className="w-full h-full" />
      </div>
    </div>
  );
};

export default Logo; 