import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, Wifi, Battery } from 'lucide-react';

interface MobileDeviceShellProps {
  children: React.ReactNode;
}

type DeviceMode = 'mobile' | 'tablet' | 'fullscreen';

export const MobileDeviceShell: React.FC<MobileDeviceShellProps> = ({ children }) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('mobile');
  const [currentTime, setCurrentTime] = useState<string>('9:41');
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Detect if browser itself is already in mobile screen size (< 640px) or native APK
  useEffect(() => {
    const checkScreen = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // If already on a physical phone or narrow mobile window, render pure full native screen
  if (isMobileScreen) {
    return <div className="w-full min-h-screen bg-theme-base text-theme-main flex flex-col">{children}</div>;
  }

  const isFull = deviceMode === 'fullscreen';
  const isTablet = deviceMode === 'tablet';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-4 px-2 selection:bg-blue-600/30">
      
      {/* Top Desktop Simulator Control Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between px-4 py-2 mb-3 bg-slate-900/90 border border-slate-800 rounded-xl backdrop-blur-md shadow-lg text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-200">SiteSaathi Mobile App Simulator</span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 font-mono text-[10px] hidden sm:inline border border-blue-800">
            Android APK (100% Offline)
          </span>
        </div>

        {/* View Switchers */}
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
              deviceMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Mobile Phone View (390 x 844)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phone (390px)</span>
          </button>

          <button
            onClick={() => setDeviceMode('tablet')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
              isTablet
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Tablet / Phablet View (540px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phablet (540px)</span>
          </button>

          <button
            onClick={() => setDeviceMode('fullscreen')}
            className={`px-2.5 py-1 rounded-md flex items-center gap-1.5 font-medium transition-all ${
              isFull
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Full Width View"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Full Width</span>
          </button>
        </div>

        {/* Direct APK Link Info */}
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[11px] text-slate-400">
            APK: <code className="text-blue-400">app-debug.apk</code> (4.68MB)
          </span>
        </div>
      </header>

      {/* Device Frame */}
      <div
        className={`w-full transition-all duration-300 relative flex flex-col overflow-hidden ${
          isFull
            ? 'max-w-6xl rounded-2xl border border-slate-800 bg-slate-900 min-h-[85vh]'
            : isTablet
            ? 'max-w-[540px] rounded-[36px] border-[8px] border-slate-800 bg-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.85)] ring-1 ring-slate-700/50 min-h-[850px] max-h-[92vh]'
            : 'max-w-[412px] rounded-[44px] border-[10px] border-slate-800 bg-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.85)] ring-1 ring-slate-700/50 min-h-[850px] max-h-[92vh]'
        }`}
      >
        {/* Device Status Bar (shown in phone & tablet mode) */}
        {!isFull && (
          <div className="w-full bg-slate-900 text-slate-200 px-6 py-2.5 flex items-center justify-between text-xs font-semibold select-none z-50 border-b border-slate-800/80">
            <span className="font-mono text-[11px]">{currentTime}</span>
            
            {/* Dynamic Island / Camera Punch-hole */}
            <div className="w-24 h-4 bg-black rounded-full mx-auto flex items-center justify-end px-2">
              <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        )}

        {/* Scrollable Mobile Screen Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full bg-theme-base text-theme-main flex flex-col relative custom-scrollbar">
          {children}
        </div>

        {/* Mobile Device Home Bar (shown in phone & tablet mode) */}
        {!isFull && (
          <div className="w-full bg-slate-900/90 py-1.5 flex items-center justify-center select-none z-50 border-t border-slate-800/50">
            <div className="w-32 h-1 bg-slate-600 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
};
