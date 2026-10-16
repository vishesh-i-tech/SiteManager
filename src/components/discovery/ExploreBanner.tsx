import React from 'react';
import { Sparkles, Calendar, ArrowRight } from 'lucide-react';

interface ExploreBannerProps {
  onActionClick: () => void;
  title?: string;
  subtitle?: string;
  badgeText?: string;
  buttonText?: string;
}

export const ExploreBanner: React.FC<ExploreBannerProps> = ({
  onActionClick,
  title = 'Exclusive discounts on home service',
  subtitle = 'Save 25% Today!',
  badgeText = 'Save 25% Today!',
  buttonText = 'Book Now',
}) => {
  return (
    <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-r from-[#D7EBFF] via-[#E2EEFF] to-[#FFE8DA] p-4 sm:p-5 shadow-[0_8px_25px_rgba(37,99,235,0.08)] border border-blue-100/70 transition-all hover:shadow-[0_12px_32px_rgba(37,99,235,0.12)]">
      
      {/* Soft background ambient glow circles */}
      <div className="absolute -top-10 -left-10 w-36 h-36 bg-blue-300/30 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 right-24 w-32 h-32 bg-orange-300/30 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        
        {/* Left Column: Text & CTA */}
        <div className="flex-1 pr-2 max-w-[62%] sm:max-w-[65%] space-y-2">
          
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100/90 text-[#FF5A26] border border-orange-200/60 shadow-xs">
            <Sparkles className="w-3 h-3 fill-[#FF5A26]" />
            <span className="text-[11px] font-bold tracking-tight">
              {badgeText}
            </span>
          </div>

          {/* Main Headline */}
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-tight font-heading tracking-tight">
            {title}
          </h2>

          {/* CTA Pill Button (Matching user screenshot orange button) */}
          <div className="pt-1">
            <button
              onClick={onActionClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6A3D] to-[#FF541E] hover:from-[#ff5926] hover:to-[#eb430d] text-white text-xs font-bold shadow-[0_4px_14px_rgba(255,106,61,0.38)] hover:shadow-[0_6px_20px_rgba(255,106,61,0.5)] active:scale-95 transition-all cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{buttonText}</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Right Column: 3D Character Illustration */}
        <div className="relative shrink-0 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center">
          <div className="absolute inset-0 bg-white/40 rounded-full blur-md" />
          <img
            src="/images/builder_character.jpg"
            alt="Site Saathi Builder"
            className="w-full h-full object-cover rounded-2xl drop-shadow-lg transform transition-transform hover:scale-105"
            loading="eager"
          />
        </div>

      </div>
    </div>
  );
};
