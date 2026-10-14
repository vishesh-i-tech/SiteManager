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
} from 'lucide-react';

interface EditToolModalProps {
  tool: ToolRecord | null;
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  onToolUpdated: () => void;
}

export const EditToolModal: React.FC<EditToolModalProps> = ({
  tool,
  isOpen,
  onClose,
  sites,
  onToolUpdated,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [siteId, setSiteId] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [size, setSize] = useState('');
  const [dateSent, setDateSent] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [actualReturnDate, setActualReturnDate] = useState('');
  const [rentCost, setRentCost] = useState<number>(0);
  const [status, setStatus] = useState<ToolRecord['status']>('on_site');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tool) {
      setSiteId(tool.siteId);
      setName(tool.name);
      setQuantity(tool.quantity);
      setSize(tool.size || '');
      setDateSent(tool.dateSent || '');
      setExpectedReturnDate(tool.expectedReturnDate || '');
      setActualReturnDate(tool.actualReturnDate || '');
      setRentCost(tool.rentOrRepairCost || 0);
      setStatus(tool.status);
      setNotes(tool.notes || '');
    }
  }, [tool]);

  if (!isOpen || !tool) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !siteId) return;

    setIsSubmitting(true);
    try {
      await db.tools.update(tool.id, {
        siteId,
        name: name.trim(),
        quantity: Number(quantity) || 1,
        size: size.trim() || undefined,
        dateSent,
        expectedReturnDate,
        actualReturnDate: actualReturnDate || null,
        rentOrRepairCost: Number(rentCost) || 0,
        status: actualReturnDate ? 'returned' : status,
        notes: notes.trim() || undefined,
      });

      onToolUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update tool', err);
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
                {language === 'hi' ? 'औजार विवरण बदलें (Edit Tool)' : 'Edit Tool Details'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tool.name}
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
          
          {/* Site selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-orange-500" />
              <span>{language === 'hi' ? 'साइट *' : 'Assigned Site *'}</span>
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
                {language === 'hi' ? 'साइज / प्रकार' : 'Size / Specs'}
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
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

          {/* Actual Return Date & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-green-500" />
                <span>{language === 'hi' ? 'वास्तविक वापसी तारीख' : 'Actual Returned Date'}</span>
              </label>
              <input
                type="date"
                value={actualReturnDate}
                onChange={(e) => setActualReturnDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'स्थिति (Status)' : 'Status'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              >
                <option value="on_site">On Site (साइट पर)</option>
                <option value="overdue">Overdue (देरी)</option>
                <option value="returned">Returned (वापस आ चुका)</option>
              </select>
            </div>
          </div>

          {/* Rent Cost */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <IndianRupee className="w-3.5 h-3.5 text-green-500" />
              <span>{language === 'hi' ? 'किराया या रिपेयर खर्च (₹)' : 'Rental / Repair Cost (₹)'}</span>
            </label>
            <input
              type="number"
              value={rentCost}
              onChange={(e) => setRentCost(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'नोट / दुकानदार का नाम' : 'Notes / Vendor Name'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              <span>{isSubmitting ? 'Saving...' : t('save')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
