import React from 'react';
import { SiteSaathiLogo } from './SiteSaathiLogo';

export const SplashScreen: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-between bg-white dark:bg-[#0A192F] text-slate-900 dark:text-white select-none transition-opacity duration-300 animate-fade-in p-6"
      style={{ minHeight: '100dvh' }}
    >
      {/* Top spacing */}
      <div className="w-full h-8" />

      {/* Center Branded Logo & Typography (Matching Reference Splash Screen) */}
      <div className="flex flex-col items-center text-center space-y-6 max-w-xs mx-auto my-auto animate-scale-in">
        {/* Large Logo Emblem */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 drop-shadow-md">
          <SiteSaathiLogo size="2xl" className="w-full h-full justify-center" />
        </div>

        {/* Brand Name Typography */}
        <div className="space-y-1.5">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight font-heading leading-tight">
            <span className="text-[#0F2744] dark:text-white">Site</span>
            <span className="text-[#0D9488]">Saathi</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-bold tracking-normal">
            Construction Management Made Simple
          </p>
        </div>
      </div>

      {/* Bottom Subtle Native Progress Indicator */}
      <div className="w-full max-w-[140px] flex flex-col items-center space-y-2 pb-6">
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#0D9488] to-[#06B6D4] rounded-full animate-pulse w-3/4 mx-auto" />
        </div>
        <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">
          SiteSaathi Offline
        </span>
      </div>
    </div>
  );
};
