import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site } from '../../types';
import { SiteCard } from './SiteCard';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Mic,
  Camera,
} from 'lucide-react';

interface SiteListProps {
  sites: Site[];
  initialWorkFilter?: 'all' | 'ongoing' | 'completed' | 'planning';
  onSelectSite: (site: Site) => void;
  onOpenAddSite: () => void;
  onOpenVoiceModal: () => void;
  onOpenReport: (site: Site) => void;
  onEditSite?: (site: Site) => void;
  onDeleteSite?: (site: Site) => void;
}

export const SiteList: React.FC<SiteListProps> = ({
  sites,
  initialWorkFilter = 'all',
  onSelectSite,
  onOpenAddSite,
  onOpenVoiceModal,
  onOpenReport,
  onEditSite,
  onDeleteSite,
}) => {
  const { t, language, tradeConfig } = useTheme();
  const [search, setSearch] = useState('');
  const [workFilter, setWorkFilter] = useState<'all' | 'ongoing' | 'completed' | 'planning'>(initialWorkFilter);

  React.useEffect(() => {
    setWorkFilter(initialWorkFilter);
  }, [initialWorkFilter]);

  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.location.toLowerCase().includes(search.toLowerCase()) ||
      site.siteType.toLowerCase().includes(search.toLowerCase());

    const matchesWork = workFilter === 'all' || site.workStatus === workFilter;

    return matchesSearch && matchesWork;
  });

  return (
    <div className="space-y-4">
      
      {/* Top Banner */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
            {t('navSites')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'hi' ? 'सभी चालू, पूर्ण व योजनागत साइट्स का विवरण' : 'Project workspaces, budgets and status'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenVoiceModal}
            className="w-10 h-10 rounded-xl text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center justify-center btn-tactile hover:bg-orange-100 transition-all cursor-pointer shadow-2xs"
            title={language === 'hi' ? 'बोलकर साइट जोड़ें' : 'Voice-Fill Site'}
            aria-label={language === 'hi' ? 'बोलकर साइट जोड़ें' : 'Voice-Fill Site'}
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            onClick={onOpenAddSite}
            className="w-10 h-10 rounded-xl text-white shadow-sm flex items-center justify-center transition-all btn-tactile cursor-pointer"
            style={{ backgroundColor: tradeConfig.primaryColor }}
            title={language === 'hi' ? 'नई साइट जोड़ें' : 'Add New Site'}
            aria-label={language === 'hi' ? 'नई साइट जोड़ें' : 'Add New Site'}
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Clean Single Search & Status Filter Bar (Removed crowded predefined pills) */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hi' ? 'साइट का नाम या जगह खोजें...' : 'Search sites...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border-none focus:outline-none dark:text-white"
          />
        </div>

        <select
          value={workFilter}
          onChange={(e) => setWorkFilter(e.target.value as any)}
          aria-label={language === 'hi' ? 'साइट स्थिति अनुसार फ़िल्टर करें' : 'Filter sites by status'}
          className="px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none focus:outline-none shrink-0"
        >
          <option value="all">{language === 'hi' ? 'सभी साइट्स' : 'All Sites'}</option>
          <option value="ongoing">{language === 'hi' ? 'चालू साइट्स' : 'Ongoing'}</option>
          <option value="completed">{language === 'hi' ? 'पूर्ण' : 'Completed'}</option>
          <option value="planning">{language === 'hi' ? 'योजना' : 'Planning'}</option>
        </select>
      </div>

      {/* Sites Column Format (Simple clean text, no overlapping!) */}
      <div className="flex flex-col gap-3">
        {filteredSites.map((site) => (
          <SiteCard
            key={site.id}
            site={site}
            onSelect={onSelectSite}
            onOpenReport={onOpenReport}
            onEditSite={onEditSite}
            onDeleteSite={onDeleteSite}
          />
        ))}
      </div>

      {filteredSites.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <Building2 className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base">
            {language === 'hi' ? 'कोई साइट नहीं मिली' : 'No matching sites found'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi' ? 'फ़िल्टर बदलें या नया प्रोजेक्ट दर्ज करें।' : 'Try adjusting search or add a new site using voice auto-fill.'}
          </p>
        </div>
      )}

    </div>
  );
};
