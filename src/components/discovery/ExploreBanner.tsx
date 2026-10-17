import React from 'react';
import { Interactive3DCharacter } from '../common/Interactive3DCharacter';
import { useTheme } from '../../core/theme/ThemeContext';
import { ShieldCheck, Sparkles, Move3d } from 'lucide-react';

interface ExploreBannerProps {
  onActionClick?: () => void;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  buttonText?: string;
}

export const ExploreBanner: React.FC<ExploreBannerProps> = () => {
  const { language } = useTheme();

  return (
    <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#D7EBFF] via-[#E2EEFF] to-[#FFE8DA] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-3.5 sm:p-4 shadow-[0_8px_25px_rgba(37,99,235,0.08)] border border-blue-100/70 dark:border-slate-800 transition-all">
      
      {/* Ambient background glow */}
      <div className="absolute -top-10 -left-10 w-36 h-36 bg-blue-300/30 dark:bg-blue-900/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-32 h-32 bg-orange-300/30 dark:bg-orange-900/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10">
        
        {/* Left Side: Interactive 3D Rotating Character (Spins on Touch/Drag) */}
        <div className="shrink-0">
          <Interactive3DCharacter
            imageSrc="/images/builder_character.jpg"
            alt="SiteSaathi 3D Contractor"
            className="w-24 h-24 sm:w-28 sm:h-28"
            showHint={true}
          />
        </div>

        {/* Right Side: Clean Minimalist Companion Info & 3D Interactive Guide */}
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100/80 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">
              {language === 'hi' ? '100% ऑफलाइन सक्रिय' : '100% Offline Active'}
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-heading tracking-tight flex items-center gap-1.5">
            <span>{language === 'hi' ? 'साइट साथी 3D' : 'SiteSaathi 3D Companion'}</span>
            <span className="text-orange-500 text-xs">✨</span>
          </h3>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed flex items-center gap-1">
            <Move3d className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>
              {language === 'hi'
                ? 'हाथ या उंगली से घुमाएं — 3D में घूमेगा'
                : 'Touch or drag the character to spin in 3D'}
            </span>
          </p>
        </div>

      </div>
    </div>
  );
};
