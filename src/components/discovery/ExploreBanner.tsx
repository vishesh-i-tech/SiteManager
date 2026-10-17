import React from 'react';
import { Interactive3DCharacter } from '../common/Interactive3DCharacter';
import { useTheme } from '../../core/theme/ThemeContext';
import { Mic, Camera, Plus } from 'lucide-react';

interface ExploreBannerProps {
  onOpenVoiceModal?: () => void;
  onOpenOcrModal?: () => void;
  onOpenAddSite?: () => void;
}

export const ExploreBanner: React.FC<ExploreBannerProps> = ({
  onOpenVoiceModal,
  onOpenOcrModal,
  onOpenAddSite,
}) => {
  const { language } = useTheme();

  return (
    <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#D7EBFF] via-[#E2EEFF] to-[#FFE8DA] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-3 sm:p-3.5 shadow-[0_8px_25px_rgba(37,99,235,0.08)] border border-blue-100/70 dark:border-slate-800 transition-all flex items-center gap-3">
      
      {/* Ambient background glow */}
      <div className="absolute -top-10 -left-10 w-36 h-36 bg-blue-300/30 dark:bg-blue-900/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 right-10 w-32 h-32 bg-orange-300/30 dark:bg-orange-900/20 rounded-full blur-2xl pointer-events-none" />

      {/* Left: Interactive 3D Rotating Character (Spins on touch/drag) */}
      <div className="shrink-0 relative z-10">
        <Interactive3DCharacter
          imageSrc="/images/builder_character.jpg"
          alt="SiteSaathi 3D Contractor"
          className="w-20 h-20 sm:w-24 sm:h-24"
          showHint={false}
        />
      </div>

      {/* Right: Primary Site Action Shortcuts (Zero unusual / marketing text) */}
      <div className="flex-1 grid grid-cols-3 gap-2 relative z-10">
        <button
          type="button"
          onClick={onOpenVoiceModal}
          className="py-2.5 px-1 rounded-2xl bg-white/90 dark:bg-slate-800 border border-white/80 dark:border-slate-700 shadow-xs text-slate-800 dark:text-slate-200 hover:bg-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
            <Mic className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold truncate max-w-full">{language === 'hi' ? 'बोलकर भरें' : 'Voice Log'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenOcrModal}
          className="py-2.5 px-1 rounded-2xl bg-white/90 dark:bg-slate-800 border border-white/80 dark:border-slate-700 shadow-xs text-slate-800 dark:text-slate-200 hover:bg-white flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold truncate max-w-full">{language === 'hi' ? 'डायरी स्कैन' : 'Scan Diary'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddSite}
          className="py-2.5 px-1 rounded-2xl bg-gradient-to-r from-[#1877F2] to-[#0084FF] text-white shadow-md flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-white/20 text-white flex items-center justify-center">
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-bold truncate max-w-full">{language === 'hi' ? 'नई साइट' : 'New Site'}</span>
        </button>
      </div>

    </div>
  );
};
