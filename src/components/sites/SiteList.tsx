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
  onSelectSite: (site: Site) => void;
  onOpenAddSite: () => void;
  onOpenVoiceModal: () => void;
  onOpenReport: (site: Site) => void;
  onEditSite?: (site: Site) => void;
  onDeleteSite?: (site: Site) => void;
}

export const SiteList: React.FC<SiteListProps> = ({
  sites,
  onSelectSite,
  onOpenAddSite,
  onOpenVoiceModal,
  onOpenReport,
  onEditSite,
  onDeleteSite,
}) => {
  const { t, language, tradeConfig } = useTheme();
  const [search, setSearch] = useState('');
  const [workFilter, setWorkFilter] = useState<'all' | 'ongoing' | 'completed' | 'planning'>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'unpaid' | 'partially_paid' | 'paid'>('all');

  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.location.toLowerCase().includes(search.toLowerCase()) ||
      site.siteType.toLowerCase().includes(search.toLowerCase());

    const matchesWork = workFilter === 'all' || site.workStatus === workFilter;
    const matchesPayment = paymentFilter === 'all' || site.paymentStatus === paymentFilter;

    return matchesSearch && matchesWork && matchesPayment;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
            {t('navSites')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'hi' ? 'सभी चालू, पूर्ण व योजनागत साइट्स का संपूर्ण हिसाब' : 'Manage project workspaces, budgets, status and financial statements'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenVoiceModal}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center gap-1.5 btn-tactile hover:bg-orange-100"
          >
            <Mic className="w-4 h-4" />
            <span>{language === 'hi' ? 'बोलकर जोड़ें' : 'Voice-Fill'}</span>
          </button>

          <button
            onClick={onOpenAddSite}
            className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center justify-center gap-2 transition-all btn-tactile glow-theme"
            style={{ backgroundColor: tradeConfig.primaryColor }}
          >
            <Plus className="w-4 h-4" />
            <span>{t('addSite')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'hi' ? 'साइट का नाम या लोकेशन खोजें...' : 'Search sites or location...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Work Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {(['all', 'ongoing', 'completed', 'planning'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setWorkFilter(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all capitalize ${
                  workFilter === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            {(['all', 'unpaid', 'partially_paid', 'paid'] as const).map((pay) => (
              <button
                key={pay}
                onClick={() => setPaymentFilter(pay)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all capitalize ${
                  paymentFilter === pay
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {pay === 'partially_paid' ? 'Partial' : pay}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
