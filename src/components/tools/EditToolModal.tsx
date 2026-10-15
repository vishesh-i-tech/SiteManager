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
  Warehouse,
  ShoppingBag,
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
  const { language, tradeConfig } = useTheme();

  const [sourceType, setSourceType] = useState<'self_owned' | 'purchased_for_site'>('self_owned');
  const [siteId, setSiteId] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [size, setSize] = useState('');
  const [dateSent, setDateSent] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [actualReturnDate, setActualReturnDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState<number | ''>('');
  const [status, setStatus] = useState<ToolRecord['status']>('on_site');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (tool) {
      setSourceType(tool.sourceType || (tool.purchasePrice ? 'purchased_for_site' : 'self_owned'));
      setSiteId(tool.siteId);
      setName(tool.name);
      setQuantity(tool.quantity);
      setSize(tool.size || '');
      setDateSent(tool.dateSent || '');
      setExpectedReturnDate(tool.expectedReturnDate || '');
      setActualReturnDate(tool.actualReturnDate || '');
      setPurchasePrice(tool.purchasePrice || (tool.rentOrRepairCost && tool.sourceType === 'purchased_for_site' ? tool.rentOrRepairCost : ''));
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
      const parsedPrice = sourceType === 'purchased_for_site' ? Number(purchasePrice) || 0 : 0;
      await db.tools.update(tool.id, {
        siteId,
        name: name.trim(),
        quantity: Number(quantity) || 1,
        size: size.trim() || undefined,
        dateSent,
        expectedReturnDate,
        actualReturnDate: actualReturnDate || null,
        sourceType,
        purchasePrice: parsedPrice,
        rentOrRepairCost: parsedPrice,
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

  const handleMarkReturnedToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setActualReturnDate(today);
    setStatus('returned');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {language === 'hi' ? 'औजार विवरण बदलें' : 'Edit Tool Record'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tool.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Source Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {language === 'hi' ? 'औजार का प्रकार' : 'Tool Source Type'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSourceType('self_owned')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  sourceType === 'self_owned'
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${sourceType === 'self_owned' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <Warehouse className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {language === 'hi' ? 'खुद का औजार' : 'Self-Owned'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {language === 'hi' ? 'गोदाम से साइट भेजा' : 'From godown / workshop'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('purchased_for_site')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                  sourceType === 'purchased_for_site'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${sourceType === 'purchased_for_site' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {language === 'hi' ? 'साइट पर खरीदा' : 'Bought for Site'}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {language === 'hi' ? 'चलते काम में खरीदा' : 'Bought during work'}
                </span>
              </button>
            </div>
          </div>

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
              {language === 'hi' ? 'औजार / मशीन का नाम *' : 'Tool / Equipment Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Quantity & Spec */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'संख्या / मात्रा (Qty) *' : 'Quantity *'}
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
                {language === 'hi' ? 'साइज / विवरण' : 'Size / Spec'}
              </label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="4x4, 5-inch आदि"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Purchase Price (If purchased for site) */}
          {sourceType === 'purchased_for_site' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 animate-fade-in">
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'hi' ? 'खरीद मूल्य (₹) *' : 'Purchase Cost (₹) *'}</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="उदा. 2400"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          )}

          {/* Date Sent / Purchased & Expected Return */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {sourceType === 'purchased_for_site'
                    ? (language === 'hi' ? 'खरीद तारीख' : 'Purchase Date')
                    : (language === 'hi' ? 'भेजने की तारीख' : 'Date Sent')}
                </span>
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
                <span>{language === 'hi' ? 'गोदाम वापसी तारीख *' : 'Expected Return *'}</span>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{language === 'hi' ? 'गोदाम वापसी तारीख' : 'Actual Returned Date'}</span>
                </label>
                {!actualReturnDate && (
                  <button
                    type="button"
                    onClick={handleMarkReturnedToday}
                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    {language === 'hi' ? 'आज लौटा' : 'Today'}
                  </button>
                )}
              </div>
              <input
                type="date"
                value={actualReturnDate}
                onChange={(e) => {
                  setActualReturnDate(e.target.value);
                  if (e.target.value) setStatus('returned');
                }}
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
                <option value="on_site">{language === 'hi' ? 'साइट पर मौजूद' : 'Active on Site'}</option>
                <option value="overdue">{language === 'hi' ? 'देरी (Overdue)' : 'Overdue'}</option>
                <option value="returned">{language === 'hi' ? 'गोदाम में वापस आ चुका' : 'Returned to Godown'}</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {sourceType === 'purchased_for_site'
                ? (language === 'hi' ? 'दुकानदार / बिल विवरण' : 'Shop / Vendor Details')
                : (language === 'hi' ? 'नोट / गाड़ी नंबर' : 'Notes / Handed to Whom')}
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
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center gap-2 transition-all btn-tactile glow-theme"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? (language === 'hi' ? 'सहेज रहे हैं...' : 'Saving...') : (language === 'hi' ? 'अपडेट करें' : 'Save Changes')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
