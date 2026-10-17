import React, { useState, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, MaterialRecord } from '../../types';
import { db } from '../../core/db/database';
import {
  Package,
  Building,
  Calendar,
  IndianRupee,
  X,
  CheckCircle2,
} from 'lucide-react';

interface AddMaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  defaultSiteId?: string;
  onMaterialAdded: () => void;
}

export const AddMaterialModal: React.FC<AddMaterialModalProps> = ({
  isOpen,
  onClose,
  sites,
  defaultSiteId,
  onMaterialAdded,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [siteId, setSiteId] = useState(defaultSiteId || (sites[0]?.id || ''));
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<string>(''); // Blank by default
  const [unit, setUnit] = useState('bags');
  const [unitPrice, setUnitPrice] = useState<string>(''); // Blank by default
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<MaterialRecord['paymentStatus']>('paid');
  const [paidAmount, setPaidAmount] = useState<string>(''); // Blank by default
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setItemName('');
    setQuantity('');
    setUnit('bags');
    setUnitPrice('');
    setPaidAmount('');
    setNotes('');
    setPaymentStatus('paid');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (defaultSiteId) {
        setSiteId(defaultSiteId);
      } else if (sites.length > 0 && !sites.some((s) => s.id === siteId)) {
        setSiteId(sites[0].id);
      }
    }
  }, [isOpen, defaultSiteId, sites]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const totalCost = (Number(quantity) || 0) * (Number(unitPrice) || 0);

  const handleApplyTemplate = (title: string, defaultCost?: number, templateUnit?: string) => {
    setItemName(title);
    if (templateUnit) setUnit(templateUnit);
    if (defaultCost) {
      setUnitPrice(String(defaultCost));
      setQuantity('1');
      setPaidAmount(String(defaultCost));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !siteId) return;

    setIsSubmitting(true);
    try {
      const newMaterial: MaterialRecord = {
        id: `mat-${Date.now()}`,
        siteId,
        itemName: itemName.trim(),
        quantity: Number(quantity) || 1,
        unit,
        unitPrice: Number(unitPrice) || 0,
        totalCost,
        purchaseDate,
        paymentStatus,
        paidAmount: paymentStatus === 'paid' ? totalCost : paymentStatus === 'pending' ? 0 : Number(paidAmount) || 0,
        notes: notes.trim() || undefined,
      };

      await db.materials.put(newMaterial);

      // If pending or partial, automatically log to Pending Dues Tracker!
      if (newMaterial.paidAmount < newMaterial.totalCost) {
        const balanceDue = newMaterial.totalCost - newMaterial.paidAmount;
        await db.dues.put({
          id: `due-${Date.now()}`,
          siteId,
          title: `Material Due: ${newMaterial.itemName}`,
          category: 'material',
          amountDue: balanceDue,
          amountPaid: 0,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          notes: `Auto-generated from material purchase of ${newMaterial.quantity} ${newMaterial.unit}`,
        });
      }

      resetForm();
      onMaterialAdded();
      onClose();
    } catch (err) {
      console.error('Failed to add material', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={handleClose} />

      {/* Interactive Sharp Dialog Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {language === 'hi' ? 'सामान / मटेरियल दर्ज करें' : 'Add Material Purchase'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'सीमेंट, स्टील, पाइप, प्लेट्स व अन्य सामग्री' : 'Log supplies and vendor payment status'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Quick Trade Suggestions */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
              {language === 'hi' ? '⚡ 1-टैप मटेरियल टेम्पलेट:' : '⚡ Quick Trade Templates:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {tradeConfig.quickAddTemplates
                .filter((t) => t.category === 'material')
                .map((tItem, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() =>
                      handleApplyTemplate(
                        language === 'hi' ? tItem.titleHi : tItem.titleEn,
                        tItem.defaultCost,
                        tItem.unit
                      )
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    + {language === 'hi' ? tItem.titleHi : tItem.titleEn}
                  </button>
                ))}
            </div>
          </div>

          {/* Site Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-orange-500" />
              <span>{language === 'hi' ? 'साइट चुनें *' : 'Target Site *'}</span>
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

          {/* Item Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'सामान का नाम *' : 'Material Item Name *'}
            </label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder={language === 'hi' ? 'अल्ट्राटेक सीमेंट, टीएमटी स्टील आदि...' : 'Ultratech Cement (PPC), TMT Steel...'}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'मात्रा (Quantity) *' : 'Quantity *'}
              </label>
              <input
                type="number"
                required
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="100"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'इकाई / साइज (Unit)' : 'Unit / Size'}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              >
                <option value="bags">Bags (बोरियां)</option>
                <option value="plates">Plates (4x4, 2x4)</option>
                <option value="kg">Kg (किलोग्राम)</option>
                <option value="tons">Tons (टन)</option>
                <option value="meters">Meters (मीटर)</option>
                <option value="rolls">Rolls / Bundles</option>
                <option value="brass">Brass (ब्रास)</option>
                <option value="truck">Truck / Trolley</option>
                <option value="pieces">Pieces (नग)</option>
              </select>
            </div>
          </div>

          {/* Rate & Total Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-green-500" />
                <span>{language === 'hi' ? 'दर / Rate प्रति इकाई *' : 'Rate Per Unit (₹) *'}</span>
              </label>
              <input
                type="number"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="385"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div className="flex flex-col justify-end">
              <span className="text-[11px] font-bold text-slate-500 mb-1">
                {language === 'hi' ? 'कुल रकम (Total)' : 'Total Cost'}
              </span>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-sm text-slate-900 dark:text-white">
                ₹{totalCost.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'भुगतान स्थिति' : 'Payment Status'}
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              >
                <option value="paid">Paid (पूर्ण नकद/ऑनलाइन)</option>
                <option value="pending">Pending (उधारी / बिल बाकी)</option>
                <option value="partial">Partial (आंशिक भुगतान)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'तारीख' : 'Purchase Date'}
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'बिल नंबर / दुकानदार का नाम' : 'Supplier / Invoice Details'}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'hi' ? 'बिल #849, खंडेलवाल हार्डवेयर' : 'Bill #849, Hardware vendor'}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
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
