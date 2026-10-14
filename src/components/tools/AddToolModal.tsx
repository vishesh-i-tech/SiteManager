import React, { useState, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, ToolRecord } from '../../types';
import { db } from '../../core/db/database';
import {
  Wrench,
  Building,
  Calendar,
  IndianRupee,
  X,
  CheckCircle2,
  Layers,
} from 'lucide-react';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  defaultSiteId?: string;
  onToolAdded: () => void;
}

export const AddToolModal: React.FC<AddToolModalProps> = ({
  isOpen,
  onClose,
  sites,
  defaultSiteId,
  onToolAdded,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [siteId, setSiteId] = useState(defaultSiteId || (sites[0]?.id || ''));
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [size, setSize] = useState('');
  const [dateSent, setDateSent] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [rentCost, setRentCost] = useState<number>(1500);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (defaultSiteId) {
        setSiteId(defaultSiteId);
      } else if (sites.length > 0 && !sites.some((s) => s.id === siteId)) {
        setSiteId(sites[0].id);
      }
    }
  }, [isOpen, defaultSiteId, sites]);

  if (!isOpen) return null;

  // Preset tools per trade for 1-tap fill
  const sampleTools = tradeConfig.quickAddTemplates.filter((t) => t.category === 'tool_rent');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !siteId) return;

    setIsSubmitting(true);
    try {
      const newTool: ToolRecord = {
        id: `tool-${Date.now()}`,
        siteId,
        name: name.trim(),
        quantity: Number(quantity) || 1,
        size: size.trim() || undefined,
        dateSent,
        expectedReturnDate,
        actualReturnDate: null,
        rentOrRepairCost: Number(rentCost) || 0,
        status: 'on_site',
        notes: notes.trim() || undefined,
      };

      await db.tools.put(newTool);
      onToolAdded();
      onClose();
    } catch (err) {
      console.error('Failed to add tool', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Interactive Sharp Dialog Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {t('addTool')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'साइट पर भेजा गया औजार या मशीनरी दर्ज करें' : 'Track equipment dispatched to job site'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* 1-tap quick suggestions */}
          {sampleTools.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                {language === 'hi' ? '⚡ आम औजार (1-टैप चुनें):' : '⚡ Quick Trade Templates:'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sampleTools.map((s, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setName(language === 'hi' ? s.titleHi : s.titleEn);
                      if (s.defaultCost) setRentCost(s.defaultCost);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    + {language === 'hi' ? s.titleHi : s.titleEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Site selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-orange-500" />
              <span>{language === 'hi' ? 'किस साइट पर भेजा गया? *' : 'Target Site *'}</span>
            </label>
            <select
              required
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.location})
                </option>
              ))}
            </select>
          </div>

          {/* Tool Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'औजार / मशीन का नाम *' : 'Equipment Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MS Shuttering Plates, Concrete Vibrator..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Quantity & Size */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'संख्या (Qty) *' : 'Quantity *'}
              </label>
              <input
                type="number"
                required
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'साइज / प्रकार (वैकल्पिक)' : 'Size / Specs'}
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 4x4 ft, 60mm needle"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Date Sent & Expected Return */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? 'भेजने की तारीख' : 'Date Sent'}</span>
              </label>
              <input
                type="date"
                required
                value={dateSent}
                onChange={(e) => setDateSent(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? 'वापसी तारीख *' : 'Expected Return *'}</span>
              </label>
              <input
                type="date"
                required
                value={expectedReturnDate}
                onChange={(e) => setExpectedReturnDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Rent / Repair Cost */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-green-500" />
              <span>{language === 'hi' ? 'किराया या रिपेयर खर्च (₹)' : 'Rental / Repair Cost (₹)'}</span>
            </label>
            <input
              type="number"
              value={rentCost}
              onChange={(e) => setRentCost(Number(e.target.value))}
              placeholder="1500"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'नोट (किससे लिया/शर्तें)' : 'Notes / Vendor Name'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sent from Gupta Scaffolding..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center gap-2 transition-all btn-tactile glow-theme"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : t('confirm')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
