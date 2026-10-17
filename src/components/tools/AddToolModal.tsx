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
  Package,
  ShoppingBag,
  Warehouse,
  Sparkles,
} from 'lucide-react';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  defaultSiteId?: string;
  onToolAdded: () => void;
}

const TRADE_DEFAULT_TOOLS: Record<string, string[]> = {
  construction: ['MS Shuttering Plates', 'Needle Vibrator', 'Cube Moulds', 'Spirit Level & Pipe', 'Demolition Breaker', 'Groove Cutter'],
  plumbing: ['Pipe Threader Machine', 'Core Cutting Machine', 'Pressure Test Pump', 'Pipe Wrench 24"', 'Heat Fusion Machine'],
  electrical: ['Wall Chaser Cutter', 'Rotary Hammer Drill', 'Cable Pulling Spring', 'Crimping Plier Set', 'Digital Multimeter'],
  painting: ['Wall Sander Machine', 'Airless Spray Gun', 'Folding Aluminum Ladder', 'Putty Knives Set', 'Scaffolding H-Frames'],
  carpentry: ['Circular Saw 7"', 'Wood Trimmer Router', 'Air Nailer Gun', 'Electric Hand Planer', 'Right Angle Clamps'],
  fabrication: ['Inverter Welding Machine', 'Heavy Angle Grinder 4"', 'Magnetic Core Drill', 'Gas Cutting Set', 'Bench Vice'],
  flooring: ['Tile Cutter 48"', 'Marble Polish Machine', 'Suction Cup Lifters', 'Notched Trowel', 'Cross Laser Level'],
  ceiling: ['Laser Level 360', 'Drywall Screw Gun', 'Tin Snips & Punch', 'Aluminum Ladder 8ft', 'POP Mixing Tub'],
  hvac: ['Vacuum Pump 1/2HP', 'Manifold Gauge Set', 'Flaring Swaging Kit', 'Nitrogen Regulator', 'Electronic Leak Detector'],
  interior: ['Laser Distance Meter', 'Rotary Hammer Drill', 'Cordless Impact Driver', 'Inspection Light', 'Step Ladder'],
};

export const AddToolModal: React.FC<AddToolModalProps> = ({
  isOpen,
  onClose,
  sites,
  defaultSiteId,
  onToolAdded,
}) => {
  const { language, tradeConfig } = useTheme();

  const [sourceType, setSourceType] = useState<'self_owned' | 'purchased_for_site'>('self_owned');
  const [siteId, setSiteId] = useState(defaultSiteId || (sites[0]?.id || ''));
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<string>(''); // Blank by default, no 0 stuck
  const [size, setSize] = useState('');
  const [dateSent, setDateSent] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [purchasePrice, setPurchasePrice] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setQuantity('');
    setSize('');
    setPurchasePrice('');
    setNotes('');
    setSourceType('self_owned');
    setDateSent(new Date().toISOString().split('T')[0]);
    setExpectedReturnDate(
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
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

  const quickTools = TRADE_DEFAULT_TOOLS[tradeConfig.id] || TRADE_DEFAULT_TOOLS.construction;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !siteId) return;

    setIsSubmitting(true);
    try {
      const parsedPrice = sourceType === 'purchased_for_site' ? Number(purchasePrice) || 0 : 0;
      const newTool: ToolRecord = {
        id: `tool-${Date.now()}`,
        siteId,
        name: name.trim(),
        quantity: Number(quantity) || 1,
        size: size.trim() || undefined,
        dateSent,
        expectedReturnDate,
        actualReturnDate: null,
        sourceType,
        purchasePrice: parsedPrice,
        rentOrRepairCost: parsedPrice, // Backwards compatible cost tracking
        status: 'on_site',
        notes: notes.trim() || undefined,
      };

      await db.tools.put(newTool);
      resetForm();
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
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={handleClose} />

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
                {language === 'hi' ? 'साइट पर औजार / टूल्स जोड़ें' : 'Add Tool to Site'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? 'गोदाम से भेजा गया या साइट पर खरीदा गया औजार दर्ज करें'
                  : 'Track own tools sent to site or new tools bought during work'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">

          {/* Source Type Selector (Self-Owned vs Purchased) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              {language === 'hi' ? 'औजार का प्रकार चुनें *' : 'Tool Source Type *'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setSourceType('self_owned')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  sourceType === 'self_owned'
                    ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 dark:border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${sourceType === 'self_owned' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <Warehouse className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {language === 'hi' ? 'खुद का औजार' : 'Self-Owned Tool'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {language === 'hi' ? 'गोदाम / वर्कशॉप से साइट पर भेजा गया' : 'Dispatched from godown/workshop'}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('purchased_for_site')}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1.5 ${
                  sourceType === 'purchased_for_site'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${sourceType === 'purchased_for_site' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {language === 'hi' ? 'साइट के लिए खरीदा' : 'Bought for Site'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  {language === 'hi' ? 'चलते काम में नया खरीदा गया' : 'Purchased during ongoing work'}
                </p>
              </button>
            </div>
          </div>

          {/* Quick Tool Tags */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{language === 'hi' ? '⚡ आम औजार (1-टैप नाम भरें):' : '⚡ Quick Tools (1-Tap):'}</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTools.map((toolName, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setName(toolName)}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  + {toolName}
                </button>
              ))}
            </div>
          </div>

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
              {language === 'hi' ? 'औजार / मशीन का नाम *' : 'Tool / Equipment Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={language === 'hi' ? 'शटरिंग प्लेट्स, कटर मशीन, वाइब्रेटर आदि' : 'MS Shuttering Plates, Cutter, Vibrator...'}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Quantity & Spec */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'संख्या / मात्रा (Qty) *' : 'Quantity (Qty) *'}
              </label>
              <input
                type="number"
                required
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
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
                placeholder={language === 'hi' ? '4x4 ft, 5 inch, 2 HP आदि' : '4x4 ft, 5-inch, 2 HP...'}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Purchase Price (Only for Site Purchased Tools) */}
          {sourceType === 'purchased_for_site' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 animate-fade-in">
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'hi' ? 'औजार खरीद मूल्य (₹) *' : 'Purchase Price / Cost (₹) *'}</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="उदा. 2400"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white focus:outline-none"
              />
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                {language === 'hi' ? 'यह रकम साइट के औजार खर्च में जुड़ेगी।' : 'This cost will be logged into site tool expenses.'}
              </p>
            </div>
          )}

          {/* Date Sent / Purchased & Expected Return Date */}
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

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {sourceType === 'purchased_for_site'
                ? (language === 'hi' ? 'दुकानदार / बिल विवरण' : 'Vendor / Shop / Invoice Details')
                : (language === 'hi' ? 'नोट (किसके पास सौंपा / वाहन नंबर)' : 'Notes / Handed to Whom')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                sourceType === 'purchased_for_site'
                  ? (language === 'hi' ? 'शर्मा टूल्स स्टोर से खरीदा, बिल #234' : 'Bought from Sharma Hardware, Inv #234')
                  : (language === 'hi' ? 'मुख्य गोदाम से पिकअप गाड़ी द्वारा भेजा गया...' : 'Dispatched with driver Mohan...')
              }
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
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
              <span>{isSubmitting ? (language === 'hi' ? 'सहेज रहे हैं...' : 'Saving...') : (language === 'hi' ? 'औजार जोड़ें' : 'Add Tool')}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
