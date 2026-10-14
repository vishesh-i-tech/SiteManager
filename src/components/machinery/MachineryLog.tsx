import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { MachineryRecord, Site } from '../../types';
import {
  Truck,
  Plus,
  Search,
  Building,
  Calendar,
  Fuel,
  IndianRupee,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';

interface MachineryLogProps {
  machinery: MachineryRecord[];
  sites: Site[];
  onOpenAddMachinery: () => void;
  onEditMachinery?: (machinery: MachineryRecord) => void;
  onDeleteMachinery?: (machinery: MachineryRecord) => void;
}

export const MachineryLog: React.FC<MachineryLogProps> = ({
  machinery,
  sites,
  onOpenAddMachinery,
  onEditMachinery,
  onDeleteMachinery,
}) => {
  const { t, language, tradeConfig } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');

  const siteMap = new Map(sites.map((s) => [s.id, s.name]));

  const filtered = machinery.filter((m) => {
    const siteName = siteMap.get(m.siteId) || '';
    const matchesSearch =
      m.machineType.toLowerCase().includes(search.toLowerCase()) ||
      siteName.toLowerCase().includes(search.toLowerCase());
    const matchesSite = selectedSiteId === 'all' || m.siteId === selectedSiteId;
    return matchesSearch && matchesSite;
  });

  const totalFuelLitres = machinery.reduce((acc, m) => acc + (m.fuelLitres || 0), 0);
  const totalFuelCost = machinery.reduce((acc, m) => acc + (m.fuelCost || 0), 0);
  const totalMachineryCost = machinery.reduce((acc, m) => acc + (m.totalCost || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
            {t('navMachinery')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'hi' ? 'मिक्सर, ट्रैक्टर, जेसीबी, जनरेटर व डीजल का दैनिक हिसाब' : 'Track equipment hours, diesel consumption and machine rentals'}
          </p>
        </div>

        <button
          onClick={onOpenAddMachinery}
          className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center justify-center gap-2 transition-all btn-tactile glow-theme self-start sm:self-auto"
          style={{ backgroundColor: tradeConfig.primaryColor }}
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi' ? 'डीजल / मशीनरी जोड़ें' : 'Log Machine / Fuel'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
            Total Machinery Outflow
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            ₹{totalMachineryCost.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 block flex items-center gap-1">
            <Fuel className="w-3.5 h-3.5" /> Total Diesel Fuel
          </span>
          <span className="text-xl sm:text-2xl font-black text-blue-800 dark:text-blue-300 mt-1 block">
            {totalFuelLitres} Litres (₹{totalFuelCost.toLocaleString('en-IN')})
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
            Active Heavy Machines
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            {machinery.length} Logs
          </span>
        </div>
      </div>

      {/* Search & Site Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search machine or site..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedSiteId('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedSiteId === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {language === 'hi' ? 'सभी साइट्स' : 'All Sites'}
          </button>
          {sites.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSiteId(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedSiteId === s.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Machinery Log Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m) => {
          const siteName = siteMap.get(m.siteId) || 'Assigned Site';

          return (
            <div
              key={m.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 font-heading">
                      {m.machineType}
                    </h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {m.fuelLitres ? `${m.fuelLitres}L Diesel` : 'Rental'} {m.rentalHoursOrDays ? `• ${m.rentalHoursOrDays} hrs/days` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onEditMachinery && (
                      <button
                        onClick={() => onEditMachinery(m)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                        title="Edit Machine Log"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteMachinery && (
                      <button
                        onClick={() => onDeleteMachinery(m)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                        title="Delete Machine Log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <span className="font-black text-base text-slate-900 dark:text-white">
                      ₹{m.totalCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                    <Building className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{siteName}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="w-3 h-3" />
                    Logged: {m.logDate}
                  </div>
                </div>

                {m.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{m.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Fuel: ₹{m.fuelCost || 0}</span>
                <span>Rent: ₹{m.rentalCost || 0}</span>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <Truck className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base">
            {language === 'hi' ? 'कोई मशीनरी लॉग नहीं है' : 'No machinery logs yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi' ? 'मिक्सर, जेसीबी या ट्रैक्टर का डीजल और किराया दर्ज करें।' : 'Log heavy equipment rentals, mixer fuel and tractor hours.'}
          </p>
        </div>
      )}

    </div>
  );
};
