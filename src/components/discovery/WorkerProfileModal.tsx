import React, { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  MapPin,
  Star,
  MessageSquare,
  Calendar,
  Phone,
  CheckCircle,
  Share2,
} from 'lucide-react';
import { WorkerProfile } from '../../data/workersDirectory';

interface WorkerProfileModalProps {
  worker: WorkerProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (worker: WorkerProfile) => void;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  worker,
  isOpen,
  onClose,
  onBookNow,
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!isOpen || !worker) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      
      {/* Phone modal container */}
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-[420px] bg-white dark:bg-slate-900 sm:rounded-[36px] overflow-hidden flex flex-col shadow-2xl relative">
        
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative pb-24 custom-scrollbar">
          
          {/* Top Floating Control Bar */}
          <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/50 flex items-center justify-center text-slate-800 dark:text-slate-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`w-10 h-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-md border border-slate-200/50 flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isBookmarked ? 'text-blue-600' : 'text-slate-700 dark:text-slate-200'
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
            </button>
          </div>

          {/* Hero Worker Image (Full width / tall portrait matching Screen 3) */}
          <div className="w-full h-[320px] sm:h-[340px] relative bg-slate-100 dark:bg-slate-800">
            <img
              src={worker.heroPhotoUrl}
              alt={worker.name}
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* Profile Card Section (Elevated rounded sheet matching Screen 3) */}
          <div className="relative -mt-6 bg-white dark:bg-slate-900 rounded-t-[32px] px-5 pt-5 pb-4 space-y-4 shadow-lg">
            
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
                    {worker.name}
                  </h2>
                  {worker.isVerified && (
                    <CheckCircle className="w-4 h-4 fill-emerald-500 text-white shrink-0" />
                  )}
                </div>

                {/* Orange Role Tag */}
                <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-[#FFF1EB] text-[#FF5A26] border border-[#FFE0D3]">
                  {worker.tag}
                </span>
              </div>

              {/* Location & Star Rating */}
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{worker.location}</span>
                </div>

                <div className="flex items-center gap-1 font-semibold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-slate-800 dark:text-slate-100 font-bold">
                    {worker.rating.toFixed(1)}
                  </span>
                  <span className="text-slate-400 font-normal">
                    ({worker.reviewsCount})
                  </span>
                </div>
              </div>

              {/* Rate */}
              <div className="mt-2.5 flex items-baseline gap-1">
                <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                  ₹{worker.rate}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {worker.rateUnit}
                </span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {worker.experienceYears}+ Yrs Experience
                </span>
              </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* About Me Section */}
            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                About Me
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {worker.aboutMe}
              </p>
            </div>

            {/* Skills & Specialties */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Key Skills & Verified Trade Specialties
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {worker.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Gallery Section */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">
                  Gallery
                </h3>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 cursor-pointer">
                  View all
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {worker.gallery.map((item) => (
                  <div
                    key={item.id}
                    className="h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 shadow-2xs group relative"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Sticky Bottom Action Bar (Matching Screen 3) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 z-30 flex items-center gap-3">
          
          {/* Message / Call button */}
          <a
            href={`tel:${worker.phone}`}
            className="flex-1 py-3 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 transition-all shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Message</span>
          </a>

          {/* Book Now / Hire button */}
          <button
            onClick={() => onBookNow(worker)}
            className="flex-[2] py-3 px-4 rounded-2xl bg-gradient-to-r from-[#1877F2] to-[#0084FF] hover:from-[#1565D8] hover:to-[#0072DC] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[0_6px_20px_rgba(24,119,242,0.4)] active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-white" />
            <span>Book Now</span>
          </button>

        </div>

      </div>
    </div>
  );
};
