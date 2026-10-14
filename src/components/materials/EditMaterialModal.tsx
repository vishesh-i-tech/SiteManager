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

interface EditMaterialModalProps {
  material: MaterialRecord | null;
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  onMaterialUpdated: () => void;
}

export const EditMaterialModal: React.FC<EditMaterialModalProps> = ({
  material,
  isOpen,
  onClose,
  sites,
  onMaterialUpdated,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [siteId, setSiteId] = useState('');
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('bags');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<MaterialRecord['paymentStatus']>('paid');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (material) {
      setSiteId(material.siteId);
      setItemName(material.itemName);
      setQuantity(material.quantity);
      setUnit(material.unit);
      setUnitPrice(material.unitPrice);
      setPurchaseDate(material.purchaseDate);
      setPaymentStatus(material.paymentStatus);
      setPaidAmount(material.paidAmount);
      setNotes(material.notes || '');
    }
  }, [material]);

  if (!isOpen || !material) return null;

  const totalCost = (Number(quantity) || 0) * (Number(unitPrice) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || !siteId) return;

    setIsSubmitting(true);
    try {
      await db.materials.update(material.id, {
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
      });

      onMaterialUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update material', err);
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
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {language === 'hi' ? 'मटेरियल विवरण बदलें (Edit Material)' : 'Edit Material Entry'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {material.itemName}
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
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'इकाई (Unit)' : 'Unit'}
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

          {/* Unit Price & Total Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-green-500" />
                <span>{language === 'hi' ? 'दर प्रति इकाई (₹) *' : 'Rate Per Unit (₹) *'}</span>
              </label>
              <input
                type="number"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div className="flex flex-col justify-end">
              <span className="text-[11px] font-bold text-slate-500 mb-1">
                {language === 'hi' ? 'कुल रकम:' : 'Total Cost:'}
              </span>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-black text-sm text-slate-900 dark:text-white">
                ₹{totalCost.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Payment Status & Paid Amount */}
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
                <option value="paid">Paid (पूर्ण चुकता)</option>
                <option value="pending">Pending (उधारी)</option>
                <option value="partial">Partial (आंशिक)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'दिया गया भुगतान (₹)' : 'Paid Amount (₹)'}
              </label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Purchase Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? 'खरीद तारीख' : 'Purchase Date'}</span>
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'बिल / सप्लायर विवरण' : 'Supplier / Invoice Info'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
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
