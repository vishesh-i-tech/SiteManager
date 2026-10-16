import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react';
import { WorkerCard } from './WorkerCard';
import { WORKER_DIRECTORY, WorkerProfile } from '../../data/workersDirectory';

interface PopularServicesDirectoryProps {
  initialCategory?: string;
  onBack: () => void;
  onViewProfile: (worker: WorkerProfile) => void;
  onBookNow: (worker: WorkerProfile) => void;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'Plumber', label: 'Plumbing' },
  { id: 'Electrician', label: 'Electrical' },
  { id: 'Mason', label: 'Masonry' },
  { id: 'Carpenter', label: 'Carpentry' },
  { id: 'Painter', label: 'Painting' },
  { id: 'Cleaner', label: 'Cleaning' },
  { id: 'Welder', label: 'Welding' },
  { id: 'Supervisor', label: 'Supervisor' },
];

export const PopularServicesDirectory: React.FC<PopularServicesDirectoryProps> = ({
  initialCategory = 'all',
  onBack,
  onViewProfile,
  onBookNow,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredWorkers = useMemo(() => {
    return WORKER_DIRECTORY.filter((worker) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        worker.role.toLowerCase() === selectedCategory.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        worker.name.toLowerCase().includes(query) ||
        worker.role.toLowerCase().includes(query) ||
        worker.skills.some((s) => s.toLowerCase().includes(query)) ||
        worker.location.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="space-y-4 animate-fade-in pb-16">
      
      {/* Top Header Row (Matching Screen 2) */}
      <div className="flex items-center gap-3 px-1">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-heading tracking-tight">
          Most Popular Services
        </h2>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for any service, worker, or skill..."
          className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition-all"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
      </div>

      {/* Horizontal Category Filter Pills (Exact match to Screen 2) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar -mx-1 px-1">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#1877F2] to-[#0084FF] text-white shadow-[0_4px_14px_rgba(24,119,242,0.35)]'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Workers Card Feed */}
      <div className="space-y-3">
        {filteredWorkers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-[22px] p-8 text-center border border-slate-200/70 dark:border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-500">
              No service professionals found matching "{searchQuery}"
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-blue-600 underline cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              worker={worker}
              onViewProfile={onViewProfile}
              onBookNow={onBookNow}
            />
          ))
        )}
      </div>

    </div>
  );
};
