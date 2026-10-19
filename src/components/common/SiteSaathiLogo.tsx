import React from 'react';

interface SiteSaathiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showText?: boolean;
}

export const SiteSaathiLogo: React.FC<SiteSaathiLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Precision Geometric Architectural SiteSaathi Logo Mark */}
      <div className={`${sizeClasses[size]} shrink-0 relative overflow-hidden transition-transform duration-200`}>
        <svg
          viewBox="0 0 512 512"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="ssSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            <linearGradient id="ssNavyMain" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#162D4A" />
              <stop offset="100%" stopColor="#0A182B" />
            </linearGradient>

            <linearGradient id="ssNavySide" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3E66" />
              <stop offset="100%" stopColor="#10253E" />
            </linearGradient>

            <linearGradient id="ssTealCheck" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="40%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            <linearGradient id="ssTealBevel" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0891B2" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            <filter id="ssShadow" x="-10%" y="-10%" width="125%" height="125%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0A192F" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* Sun */}
          <circle cx="180" cy="185" r="105" fill="url(#ssSunGrad)" />

          {/* Left Building (Shorter Tower) */}
          <path d="M 105 235 L 195 235 L 195 385 L 105 385 Z" fill="url(#ssNavyMain)" />
          <g fill="#FFFFFF" opacity="0.95">
            <rect x="122" y="255" width="16" height="24" rx="2" />
            <rect x="156" y="255" width="16" height="24" rx="2" />
            <rect x="122" y="295" width="16" height="24" rx="2" />
            <rect x="156" y="295" width="16" height="24" rx="2" />
            <rect x="122" y="335" width="16" height="24" rx="2" />
            <rect x="156" y="335" width="16" height="24" rx="2" />
          </g>

          {/* Center/Right Tall Building */}
          <path d="M 195 130 L 255 90 L 255 385 L 195 385 Z" fill="url(#ssNavySide)" />
          <path d="M 255 90 L 335 150 L 335 385 L 255 385 Z" fill="url(#ssNavyMain)" />
          <path d="M 195 130 L 255 90 L 335 150 L 335 162 L 255 104 L 195 142 Z" fill="#38BDF8" opacity="0.8" />

          {/* Center Building Windows */}
          <g fill="#FFFFFF" opacity="0.95">
            <rect x="270" y="170" width="18" height="28" rx="2" />
            <rect x="302" y="195" width="18" height="28" rx="2" />
            <rect x="270" y="215" width="18" height="28" rx="2" />
            <rect x="302" y="240" width="18" height="28" rx="2" />
            <rect x="270" y="260" width="18" height="28" rx="2" />
            <rect x="302" y="285" width="18" height="28" rx="2" />
            <rect x="270" y="305" width="18" height="28" rx="2" />
            <rect x="302" y="330" width="18" height="28" rx="2" />
          </g>

          {/* Site Supervisor Silhouette */}
          <path d="M 335 342 C 335 308, 365 296, 385 296 C 405 296, 435 308, 435 342 L 435 385 L 335 385 Z" fill="url(#ssNavyMain)" />
          <path d="M 374 320 L 385 340 L 396 320 Z" fill="#0D9488" />
          <circle cx="385" cy="272" r="23" fill="url(#ssNavyMain)" />
          <path d="M 356 266 C 358 240, 412 240, 414 266 Z" fill="#FFFFFF" />
          <path d="M 350 264 C 350 260, 420 260, 420 264 C 420 269, 350 269, 350 264 Z" fill="#E2E8F0" />
          <path d="M 383 241 L 387 241 L 387 262 L 383 262 Z" fill="#0D9488" />

          {/* Dynamic Foundation Checkmark Motif */}
          <path d="M 68 345 C 120 405, 185 450, 260 450 C 335 450, 400 395, 455 310 C 438 335, 395 395, 310 410 C 235 422, 155 385, 105 328 Z" fill="url(#ssTealBevel)" opacity="0.6" />
          <path d="M 68 335 C 118 395, 180 438, 255 438 C 330 438, 395 385, 450 298 C 435 322, 390 380, 305 395 C 230 408, 150 372, 100 318 Z" fill="url(#ssTealCheck)" filter="url(#ssShadow)" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="font-heading font-black text-xl sm:text-2xl tracking-tight leading-none">
            <span className="text-[#0F2744] dark:text-white">Site</span>
            <span className="text-[#0D9488]">Saathi</span>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-wider mt-1">
            Construction Management Made Simple
          </span>
        </div>
      )}
    </div>
  );
};
