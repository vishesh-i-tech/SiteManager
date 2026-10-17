import React, { useState, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, ClientPayment, PaymentMode } from '../../types';
import { db } from '../../core/db/database';
import { getTodayFormatted, toIsoDate } from '../../utils/dateUtils';
import {
  IndianRupee,
  Calendar,
  CreditCard,
  User,
  FileText,
  X,
  CheckCircle2,
  Wallet,
  Building,
} from 'lucide-react';

interface RecordClientPaymentModalProps {
  site: Site;
  isOpen: boolean;
  onClose: () => void;
  onPaymentRecorded: () => void;
  clientBalanceDue?: number;
}

export const RecordClientPaymentModal: React.FC<RecordClientPaymentModalProps> = ({
  site,
  isOpen,
  onClose,
  onPaymentRecorded,
  clientBalanceDue = 0,
}) => {
  const { language, tradeConfig } = useTheme();

  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(getTodayFormatted());
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI / Online');
  const [payerName, setPayerName] = useState<string>(site.clientName || '');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const resetForm = () => {
    setAmount('');
    setPaymentDate(getTodayFormatted());
    setPaymentMode('UPI / Online');
    setPayerName(site.clientName || '');
    setReferenceNo('');
    setNotes('');
    setError('');
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen, site.clientName]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const milestoneSuggestions = [
    'Booking Advance',
    'Plinth Beam Stage',
    '1st Slab Casting',
    'Brickwork & Plaster',
    'Running Bill (RA) Payment',
    'Final Settlement',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError(language === 'hi' ? 'कृपया सही राशि दर्ज करें।' : 'Please enter a valid payment amount.');
      return;
    }
    if (!paymentDate) {
      setError(language === 'hi' ? 'भुगतान की तारीख चुनें।' : 'Please choose payment date.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const newPayment: ClientPayment = {
        id: `cp-${Date.now()}`,
        siteId: site.id,
        amount: numAmount,
        paymentDate: toIsoDate(paymentDate),
        paymentMode,
        payerName: payerName.trim() || undefined,
        referenceNo: referenceNo.trim() || undefined,
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      await db.recordClientPayment(newPayment);
      resetForm();
      onPaymentRecorded();
      onClose();
    } catch (err) {
      console.error('Failed to record client payment', err);
      setError('Failed to record payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={handleClose} />

      {/* Modal Card */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <IndianRupee className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white font-heading">
                {language === 'hi' ? 'क्लाइंट से मिली पेमेंट दर्ज करें' : 'Record Client Payment'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {site.name} • {language === 'hi' ? 'अनुबंध रसीद' : 'Contract Receipt'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Quick Balance Status Pill */}
          {clientBalanceDue > 0 && (
            <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between text-xs">
              <span className="font-medium text-amber-800 dark:text-amber-300">
                {language === 'hi' ? 'क्लाइंट से कुल बाकी लेना:' : 'Remaining Client Balance:'}
              </span>
              <button
                type="button"
                onClick={() => setAmount(clientBalanceDue.toString())}
                className="font-black text-amber-900 dark:text-amber-200 hover:underline"
              >
                ₹{clientBalanceDue.toLocaleString('en-IN')} (Fill Full)
              </button>
            </div>
          )}

          {/* Amount Received (kitne) */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>{language === 'hi' ? 'मिली हुई राशि (₹) *' : 'Amount Received (₹) *'}</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {language === 'hi' ? 'कितने मिले' : 'Payment amount'}
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">₹</span>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl text-base font-black bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Quick Fill Suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[10000, 25000, 50000, 100000, 200000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  +₹{(preset / 1000).toLocaleString('en-IN')}k
                </button>
              ))}
            </div>
          </div>

          {/* Payment Date */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'hi' ? 'भुगतान की तारीख *' : 'Payment Date *'}</span>
              </label>
              <span className="text-[10px] text-slate-400 font-normal">DD-MM-YYYY</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Payment Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'hi' ? 'भुगतान का तरीका *' : 'Payment Mode *'}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['UPI / Online', 'Bank Transfer', 'Cash', 'Cheque'] as PaymentMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    paymentMode === mode
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Client / Payer Name & Reference No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? 'देने वाले का नाम' : 'Client / Payer Name'}</span>
              </label>
              <input
                type="text"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="e.g. Mr. Sharma / PWD Dept"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'रेफरेंस / चेक नंबर' : 'Ref / Cheque / UTR No'}
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="e.g. UPI-92810 / CHQ-4029"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Milestone / Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? 'विवरण / माइलस्टोन' : 'Milestone / Purpose / Notes'}</span>
              </span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Booking Advance or 1st Slab Completion"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {/* Quick Suggestion Chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {milestoneSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setNotes(suggestion)}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {language === 'hi' ? 'रद्द करें' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 btn-tactile"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? (language === 'hi' ? 'दर्ज हो रहा है...' : 'Saving...')
                  : (language === 'hi' ? 'पेमेंट दर्ज करें' : 'Save Payment Receipt')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
