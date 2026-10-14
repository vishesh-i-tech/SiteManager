import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { MaterialRecord, Site } from '../../types';
import {
  Package,
  Plus,
  Search,
  Building,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  Filter,
  Edit2,
  Trash2,
} from 'lucide-react';

interface MaterialLogProps {
  materials: MaterialRecord[];
  sites: Site[];
  onOpenAddMaterial: () => void;
  onEditMaterial?: (material: MaterialRecord) => void;
  onDeleteMaterial?: (material: MaterialRecord) => void;
}

export const MaterialLog: React.FC<MaterialLogProps> = ({
  materials,
  sites,
  onOpenAddMaterial,
  onEditMaterial,
  onDeleteMaterial,
}) => {
  const { t, language, tradeConfig } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedSiteId, setSelectedSiteId] = useState<string>('all');

  const siteMap = new Map(sites.map((s) => [s.id, s.name]));

  const filteredMaterials = materials.filter((m) => {
    const siteName = siteMap.get(m.siteId) || '';
    const matchesSearch =
      m.itemName.toLowerCase().includes(search.toLowerCase()) ||
      siteName.toLowerCase().includes(search.toLowerCase());
    const matchesSite = selectedSiteId === 'all' || m.siteId === selectedSiteId;
    return matchesSearch && matchesSite;
  });

  const totalSpent = materials.reduce((acc, m) => acc + (m.totalCost || 0), 0);
  const totalPaid = materials.reduce((acc, m) => acc + (m.paidAmount || 0), 0);
  const totalPending = totalSpent - totalPaid;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
            {t('navMaterials')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {language === 'hi' ? 'सीमेंट, सरिया, पाइप, तार व शटरिंग प्लेट्स की खरीद व हिसाब' : 'Log material purchases, quantities, rates and supplier bills'}
          </p>
        </div>

        <button
          onClick={onOpenAddMaterial}
          className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center justify-center gap-2 transition-all btn-tactile glow-theme self-start sm:self-auto"
          style={{ backgroundColor: tradeConfig.primaryColor }}
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi' ? 'सामान दर्ज करें' : 'Add Material Entry'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
            Total Material Cost
          </span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
            ₹{totalSpent.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
            Amount Paid
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 mt-1 block">
            ₹{totalPaid.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">
            Vendor Udhaar / Pending
          </span>
          <span className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300 mt-1 block">
            ₹{totalPending.toLocaleString('en-IN')}
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
            placeholder={language === 'hi' ? 'सामान का नाम खोजें...' : 'Search material name or site...'}
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

      {/* Materials List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((item) => {
          const siteName = siteMap.get(item.siteId) || 'Assigned Site';

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1 font-heading">
                      {item.itemName}
                    </h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.quantity} {item.unit} @ ₹{item.unitPrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {onEditMaterial && (
                      <button
                        onClick={() => onEditMaterial(item)}
                        className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                        title="Edit Material"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {onDeleteMaterial && (
                      <button
                        onClick={() => onDeleteMaterial(item)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-slate-100"
                        title="Delete Material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.paymentStatus === 'paid'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400'
                          : item.paymentStatus === 'partial'
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                      }`}
                    >
                      {item.paymentStatus}
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
                    Purchased: {item.purchaseDate}
                  </div>
                </div>

                {item.notes && (
                  <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    "{item.notes}"
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">
                  Paid: ₹{item.paidAmount.toLocaleString('en-IN')}
                </span>
                <span className="font-black text-sm text-slate-900 dark:text-white">
                  ₹{item.totalCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
          <Package className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="font-extrabold text-slate-700 dark:text-slate-300 text-base">
            {language === 'hi' ? 'कोई मटेरियल दर्ज नहीं है' : 'No materials logged yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'hi' ? 'सीमेंट, सरिया, पाइप या प्लेट्स की खरीद दर्ज करें।' : 'Track material purchases, plate sizes and supplier udhaar bills.'}
          </p>
        </div>
      )}

    </div>
  );
};
