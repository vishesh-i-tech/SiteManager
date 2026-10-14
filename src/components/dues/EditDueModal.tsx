import React, { useState, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, ExpenseDue } from '../../types';
import { db } from '../../core/db/database';
import {
  Receipt,
  Building,
  Calendar,
  IndianRupee,
  X,
  CheckCircle2,
} from 'lucide-react';

interface EditDueModalProps {
  due: ExpenseDue | null;
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  onDueUpdated: () => void;
}

export const EditDueModal: React.FC<EditDueModalProps> = ({
  due,
  isOpen,
  onClose,
  sites,
  onDueUpdated,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [siteId, setSiteId] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseDue['category']>('material');
  const [amountDue, setAmountDue] = useState<number>(0);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<ExpenseDue['status']>('pending');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (due) {
      setSiteId(due.siteId);
      setTitle(due.title);
      setCategory(due.category);
      setAmountDue(due.amountDue);
      setAmountPaid(due.amountPaid || 0);
      setDueDate(due.dueDate);
      setStatus(due.status);
      setNotes(due.notes || '');
    }
  }, [due]);

  if (!isOpen || !due) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !siteId) return;

    setIsSubmitting(true);
    try {
      const isPaid = Number(amountPaid) >= Number(amountDue);
      await db.dues.update(due.id, {
        siteId,
        title: title.trim(),
        category,
        amountDue: Number(amountDue) || 0,
        amountPaid: Number(amountPaid) || 0,
        dueDate,
        status: isPaid ? 'paid' : status,
        notes: notes.trim() || undefined,
      });

      onDueUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update due', err);
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
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {language === 'hi' ? 'बकाया बिल विवरण बदलें (Edit Due)' : 'Edit Due / Bill Details'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {due.title}
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
              <span>{language === 'hi' ? 'साइट *' : 'Target Site *'}</span>
            </label>
            <select
              required
              value={siteId}
              onChange={(e) => setSiteId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.workStatus.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'बिल / उधारी का शीर्षक *' : 'Due / Bill Title *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'श्रेणी (Category)' : 'Category'}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            >
              <option value="material">Material (सामान)</option>
              <option value="tool_rent">Tool Rent (औजार किराया)</option>
              <option value="machinery">Machinery (मशीनरी)</option>
              <option value="labour">Labour Wages (लेबर बाकी)</option>
              <option value="subcontract">Subcontractor (पेटी ठेकेदार)</option>
              <option value="other">Other (अन्य)</option>
            </select>
          </div>

          {/* Amount Due & Amount Paid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-red-500" />
                <span>{language === 'hi' ? 'कुल बिल (₹) *' : 'Total Amount (₹) *'}</span>
              </label>
              <input
                type="number"
                required
                value={amountDue}
                onChange={(e) => setAmountDue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-green-500" />
                <span>{language === 'hi' ? 'दिया गया (₹)' : 'Paid Amount (₹)'}</span>
              </label>
              <input
                type="number"
                value={amountPaid}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Due Date & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? 'अंतिम तारीख' : 'Due Date'}</span>
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
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
                <option value="pending">Pending (बकाया)</option>
                <option value="overdue">Overdue (समय समाप्त)</option>
                <option value="paid">Paid (पूर्ण चुकता)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'टिप्पणी' : 'Notes'}
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
