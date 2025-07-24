import React from 'react';
import { ReactComponent as LauSvg } from '../Lau.svg';

const LauIcon = ({ className = "", width = 24, height = 24, ...props }) => {
  return (
    <LauSvg 
      className={className}
      width={width} 
      height={height}
      {...props}
    />
  );
};

export default LauIcon; 