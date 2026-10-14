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

interface EditMachineryModalProps {
  machinery: MachineryRecord | null;
  isOpen: boolean;
  onClose: () => void;
  sites: Site[];
  onMachineryUpdated: () => void;
}

export const EditMachineryModal: React.FC<EditMachineryModalProps> = ({
  machinery,
  isOpen,
  onClose,
  sites,
  onMachineryUpdated,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [siteId, setSiteId] = useState('');
  const [machineType, setMachineType] = useState<MachineryRecord['machineType']>('Concrete Mixer');
  const [customMachine, setCustomMachine] = useState('');
  const [fuelLitres, setFuelLitres] = useState<number>(0);
  const [fuelCost, setFuelCost] = useState<number>(0);
  const [rentalHours, setRentalHours] = useState<number>(0);
  const [rentalCost, setRentalCost] = useState<number>(0);
  const [logDate, setLogDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (machinery) {
      setSiteId(machinery.siteId);
      const standardMachines = ['Concrete Mixer', 'JCB Excavator', 'Tractor', 'Generator', 'Tower Crane', 'Breaker', 'Pipe Threader', 'Cable Puller'];
      if (standardMachines.includes(machinery.machineType)) {
        setMachineType(machinery.machineType);
        setCustomMachine('');
      } else {
        setMachineType('Other');
        setCustomMachine(machinery.machineType);
      }
      setFuelLitres(machinery.fuelLitres || 0);
      setFuelCost(machinery.fuelCost || 0);
      setRentalHours(machinery.rentalHoursOrDays || 0);
      setRentalCost(machinery.rentalCost || 0);
      setLogDate(machinery.logDate);
      setNotes(machinery.notes || '');
    }
  }, [machinery]);

  if (!isOpen || !machinery) return null;

  const totalCost = (Number(fuelCost) || 0) + (Number(rentalCost) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteId) return;

    setIsSubmitting(true);
    try {
      const finalMachine = machineType === 'Other' && customMachine.trim() ? (customMachine.trim() as any) : machineType;
      await db.machinery.update(machinery.id, {
        siteId,
        machineType: finalMachine,
        fuelLitres: Number(fuelLitres) || 0,
        fuelCost: Number(fuelCost) || 0,
        rentalHoursOrDays: Number(rentalHours) || 0,
        rentalCost: Number(rentalCost) || 0,
        totalCost,
        logDate,
        notes: notes.trim() || undefined,
      });

      onMachineryUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update machinery', err);
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
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {language === 'hi' ? 'मशीनरी लॉग बदलें (Edit Machine Log)' : 'Edit Machinery Log'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {machinery.machineType}
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

          {/* Machine Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'मशीन प्रकार *' : 'Machinery Type *'}
            </label>
            <select
              value={machineType}
              onChange={(e) => setMachineType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            >
              <option value="Concrete Mixer">Concrete Mixer (कंक्रीट मिक्सर)</option>
              <option value="JCB Excavator">JCB Excavator (खुदाई मशीन)</option>
              <option value="Tractor">Tractor / Trolley (ट्रैक्टर ट्रॉली)</option>
              <option value="Generator">Diesel Generator (डीजल जनरेटर)</option>
              <option value="Tower Crane">Tower Crane (क्रेन)</option>
              <option value="Breaker">Breaker Hammer (ब्रेकर)</option>
              <option value="Pipe Threader">Pipe Threader / Cutter</option>
              <option value="Cable Puller">Cable Puller Winch</option>
              <option value="Other">Other Equipment (कस्टम मशीन)</option>
            </select>

            {machineType === 'Other' && (
              <input
                type="text"
                required
                value={customMachine}
                onChange={(e) => setCustomMachine(e.target.value)}
                placeholder={language === 'hi' ? 'मशीन का नाम दर्ज करें (उदा. रोलर, वाटर टैंकर)' : 'Specify equipment name (e.g. Road Roller, Water Tanker)'}
                className="mt-2 w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-orange-50/50 dark:bg-orange-950/20 border border-orange-300 dark:border-orange-800 focus:outline-none dark:text-white"
              />
            )}
          </div>

          {/* Fuel Litres & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'hi' ? 'डीजल (Litres)' : 'Fuel Litres'}</span>
              </label>
              <input
                type="number"
                value={fuelLitres}
                onChange={(e) => {
                  const litres = Number(e.target.value);
                  setFuelLitres(litres);
                  setFuelCost(litres * 90);
                }}
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
                onChange={(e) => setFuelCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Rental Hours & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'घंटे / दिन' : 'Usage Hours/Days'}
              </label>
              <input
                type="number"
                value={rentalHours}
                onChange={(e) => setRentalHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3.5 h-3.5 text-green-500" />
                <span>{language === 'hi' ? 'किराया (₹)' : 'Machine Rent (₹)'}</span>
              </label>
              <input
                type="number"
                value={rentalCost}
                onChange={(e) => setRentalCost(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? 'तारीख' : 'Date'}</span>
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
                {language === 'hi' ? 'काम / विवरण' : 'Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Total Cost Display */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              {language === 'hi' ? 'कुल खर्च:' : 'Total Cost:'}
            </span>
            <span className="text-base font-black text-slate-900 dark:text-white">
              ₹{totalCost.toLocaleString('en-IN')}
            </span>
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
