import React from 'react';
import { Star, CheckCircle, Eye, Calendar, Sparkles } from 'lucide-react';
import { WorkerProfile } from '../../data/workersDirectory';

interface WorkerCardProps {
  worker: WorkerProfile;
  onViewProfile: (worker: WorkerProfile) => void;
  onBookNow: (worker: WorkerProfile) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onViewProfile,
  onBookNow,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-[22px] p-3.5 sm:p-4 border border-slate-100 dark:border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] transition-all space-y-3">
      
      {/* Top Header Row */}
      <div className="flex items-start gap-3">
        
        {/* Avatar with Verified Badge */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm bg-blue-50">
            <img
              src={worker.avatarUrl}
              alt={worker.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          {worker.isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xs">
              <CheckCircle className="w-2.5 h-2.5 fill-white text-emerald-500" />
            </div>
          )}
        </div>

        {/* Worker Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white font-heading truncate">
              {worker.name}
            </h4>

            {/* Orange Tag Badge (Exact match to reference UI) */}
            <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF1EB] text-[#FF5A26] border border-[#FFE0D3]">
              {worker.tag}
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">
              ₹{worker.rate}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {worker.rateUnit}
            </span>
          </div>

          {/* Rating & Reviews */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="ml-1 font-bold text-slate-800 dark:text-slate-200">
                {worker.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-slate-400">
              ({worker.reviewsCount} reviews)
            </span>
          </div>
        </div>

      </div>

      {/* Action Buttons Row (Exact match to reference UI) */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50 dark:border-slate-800/80">
        
        {/* View Profile Button (Soft bordered button with Eye icon) */}
        <button
          onClick={() => onViewProfile(worker)}
          className="w-full py-2 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-97 transition-all cursor-pointer shadow-2xs"
        >
          <Eye className="w-3.5 h-3.5 text-slate-500" />
          <span>View Profile</span>
        </button>

        {/* Book Now / Assign Button (Solid Vibrant Blue Gradient button) */}
        <button
          onClick={() => onBookNow(worker)}
          className="w-full py-2 px-2 rounded-xl bg-gradient-to-r from-[#1877F2] to-[#0084FF] hover:from-[#1565D8] hover:to-[#0072DC] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_14px_rgba(24,119,242,0.35)] hover:shadow-[0_6px_20px_rgba(24,119,242,0.45)] active:scale-97 transition-all cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5 text-white" />
          <span>Book Now</span>
        </button>

      </div>

    </div>
  );
};
