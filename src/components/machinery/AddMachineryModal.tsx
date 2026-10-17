import React, { useState, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, MachineryRecord } from '../../types';
import { db } from '../../core/db/database';
import {
  Truck,
  Building,
  Calendar,
  Fuel,
  IndianRupee,
  X,
  CheckCircle2,
} from 'lucide-react';

interface AddMachineryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  defaultSiteId?: string;
  onMachineryAdded: () => void;
}

export const AddMachineryModal: React.FC<AddMachineryModalProps> = ({
  isOpen,
  onClose,
  sites,
  defaultSiteId,
  onMachineryAdded,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [siteId, setSiteId] = useState(defaultSiteId || (sites[sites.length - 1]?.id || sites[0]?.id || ''));
  const [ownership, setOwnership] = useState<'rental' | 'owned'>('owned');
  const [machineType, setMachineType] = useState<MachineryRecord['machineType']>('Concrete Mixer');
  const [customMachine, setCustomMachine] = useState('');
  const [fuelLitres, setFuelLitres] = useState<string>('');
  const [fuelCost, setFuelCost] = useState<string>('');
  const [rentalHours, setRentalHours] = useState<string>('');
  const [rentalCost, setRentalCost] = useState<string>('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setOwnership('owned');
    setMachineType('Concrete Mixer');
    setCustomMachine('');
    setFuelLitres('');
    setFuelCost('');
    setRentalHours('');
    setRentalCost('');
    setLogDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (defaultSiteId) {
        setSiteId(defaultSiteId);
      } else if (sites.length > 0 && !sites.some((s) => s.id === siteId)) {
        setSiteId(sites[sites.length - 1]?.id || sites[0].id);
      }
    }
  }, [isOpen, defaultSiteId, sites]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const effectiveRentalCost = ownership === 'owned' ? 0 : (Number(rentalCost) || 0);
  const totalCost = (Number(fuelCost) || 0) + effectiveRentalCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) return;

    setIsSubmitting(true);
    try {
      const finalMachine = machineType === 'Other' && customMachine.trim() ? (customMachine.trim() as any) : machineType;
      const newMachinery: MachineryRecord = {
        id: `mach-${Date.now()}`,
        siteId,
        machineType: finalMachine,
        fuelLitres: Number(fuelLitres) || 0,
        fuelCost: Number(fuelCost) || 0,
        rentalHoursOrDays: Number(rentalHours) || 0,
        rentalCost: effectiveRentalCost,
        totalCost,
        logDate,
        notes: notes.trim() ? `${ownership === 'owned' ? '[Self-Owned] ' : ''}${notes.trim()}` : (ownership === 'owned' ? '[Self-Owned]' : undefined),
      };

      await db.machinery.put(newMachinery);
      resetForm();
      onMachineryAdded();
      onClose();
    } catch (err) {
      console.error('Failed to log machinery', err);
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
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {language === 'hi' ? 'मशीनरी व डीजल खर्च दर्ज करें' : 'Log Machinery & Fuel'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'जेसीबी, ट्रैक्टर, मिक्सर या जनरेटर का खर्च' : 'Track equipment hours, rent, and diesel usage'}
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
          
          {/* Site selection */}
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

          {/* Equipment Ownership: Rental vs Self-Owned */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'उपकरण का स्वामित्व *' : 'Equipment Ownership *'}
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setOwnership('owned');
                  setRentalCost('');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  ownership === 'owned'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-900/10 dark:border-white/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                {language === 'hi' ? 'खुद का (Self-Owned)' : 'Self / Owned'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setOwnership('rental');
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  ownership === 'rental'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-900/10 dark:border-white/10'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                {language === 'hi' ? 'किराया (Rental)' : 'Rental'}
              </button>
            </div>
          </div>

          {/* Machine Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'मशीन का प्रकार *' : 'Machinery Type *'}
            </label>
            <select
              value={machineType}
              onChange={(e) => setMachineType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            >
              <option value="Concrete Mixer">{language === 'hi' ? 'कंक्रीट मिक्सर' : 'Concrete Mixer'}</option>
              <option value="JCB Excavator">{language === 'hi' ? 'खुदाई मशीन (JCB)' : 'JCB Excavator'}</option>
              <option value="Tractor">{language === 'hi' ? 'ट्रैक्टर ट्रॉली' : 'Tractor / Trolley'}</option>
              <option value="Generator">{language === 'hi' ? 'डीजल जनरेटर' : 'Diesel Generator'}</option>
              <option value="Tower Crane">{language === 'hi' ? 'क्रेन' : 'Tower Crane'}</option>
              <option value="Breaker">{language === 'hi' ? 'ब्रेकर हैमर' : 'Breaker Hammer'}</option>
              <option value="Pipe Threader">{language === 'hi' ? 'पाइप थ्रेडर / कटर' : 'Pipe Threader / Cutter'}</option>
              <option value="Cable Puller">{language === 'hi' ? 'केबल विंच' : 'Cable Puller Winch'}</option>
              <option value="Other">{language === 'hi' ? 'अन्य उपकरण (कस्टम)' : 'Other Equipment'}</option>
            </select>

            {machineType === 'Other' && (
              <input
                type="text"
                required
                value={customMachine}
                onChange={(e) => setCustomMachine(e.target.value)}
                placeholder={language === 'hi' ? 'मशीन का नाम दर्ज करें (रोलर, वाटर टैंकर आदि)' : 'Specify equipment name (Road Roller, Water Tanker)'}
                className="mt-2 w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-orange-50/50 dark:bg-orange-950/20 border border-orange-300 dark:border-orange-800 focus:outline-none dark:text-white"
              />
            )}
          </div>

          {/* Fuel Litres & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'hi' ? 'डीजल मात्रा (Litres)' : 'Fuel Quantity (L)'}</span>
              </label>
              <input
                type="number"
                value={fuelLitres}
                onChange={(e) => {
                  const val = e.target.value;
                  setFuelLitres(val);
                  if (val === '') {
                    setFuelCost('');
                  } else {
                    const litres = Number(val) || 0;
                    setFuelCost(String(litres * 90));
                  }
                }}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-green-500" />
                <span>{language === 'hi' ? 'डीजल खर्च (₹)' : 'Fuel Cost (₹)'}</span>
              </label>
              <input
                type="number"
                value={fuelCost}
                onChange={(e) => setFuelCost(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Rental Hours & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'घंटे / दिन (Hours/Days)' : 'Usage Hours/Days'}
              </label>
              <input
                type="number"
                value={rentalHours}
                onChange={(e) => setRentalHours(e.target.value)}
                placeholder="1"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-green-500" />
                <span>{language === 'hi' ? 'मशीन किराया (₹)' : 'Machine Rent (₹)'}</span>
              </label>
              {ownership === 'rental' ? (
                <input
                  type="number"
                  value={rentalCost}
                  onChange={(e) => setRentalCost(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
                />
              ) : (
                <div className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center">
                  ₹0 ({language === 'hi' ? 'निजी उपकरण' : 'Self-Owned'})
                </div>
              )}
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? 'तारीख' : 'Log Date'}</span>
              </label>
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'विवरण / काम' : 'Operation / Task'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'hi' ? 'बीम ढलाई, खुदाई कार्य आदि...' : 'Beam casting, excavation work...'}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Total Preview */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {language === 'hi' ? 'कुल मशीनरी खर्च:' : 'Total Log Cost:'}
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              ₹{totalCost.toLocaleString('en-IN')}
            </span>
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
