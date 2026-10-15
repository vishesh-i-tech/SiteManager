import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';

interface SiteSaathiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const SiteSaathiLogo: React.FC<SiteSaathiLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  const { tradeConfig } = useTheme();

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Precision Geometric Architectural Logo Mark */}
      <div
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center text-white shadow-sm relative overflow-hidden transition-transform duration-200 group-hover:scale-105 bg-blue-600`}
      >
        {/* Subtle geometric structural mesh background */}
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5"
        >
          {/* Isometric Foundation Cube & Structural Frame */}
          <path
            d="M20 4L34 12V28L20 36L6 28V12L20 4Z"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          <path
            d="M20 4V20L34 28"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
          <path
            d="M20 20L6 28"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.3"
          />
          
          {/* Interlocking S-Monogram Beam Architecture */}
          <path
            d="M13 13.5H27C28.1 13.5 29 14.4 29 15.5V17C29 18.1 28.1 19 27 19H13C11.9 19 11 19.9 11 21V22.5C11 23.6 11.9 24.5 13 24.5H27"
            stroke="white"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          <circle cx="27" cy="24.5" r="2" fill="white" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-lg sm:text-xl tracking-tight font-heading text-slate-900 dark:text-white leading-none">
            SiteSaathi
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase mt-1">
            Site Manager
          </span>
        </div>
      )}
    </div>
  );
};
