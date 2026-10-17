import React, { useState, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site } from '../../types';
import { db } from '../../core/db/database';
import {
  Building2,
  MapPin,
  IndianRupee,
  Calendar,
  Layers,
  FileText,
  X,
  CheckCircle2,
  Phone,
} from 'lucide-react';

interface EditSiteModalProps {
  site: Site | null;
  isOpen: boolean;
  onClose: () => void;
  onSiteUpdated: () => void;
}

export const EditSiteModal: React.FC<EditSiteModalProps> = ({
  site,
  isOpen,
  onClose,
  onSiteUpdated,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [siteType, setSiteType] = useState<Site['siteType']>('Residential');
  const [customCategory, setCustomCategory] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [budget, setBudget] = useState<number>(500000);
  const [workStatus, setWorkStatus] = useState<Site['workStatus']>('ongoing');
  const [paymentStatus, setPaymentStatus] = useState<Site['paymentStatus']>('unpaid');
  const [startDate, setStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (site) {
      setName(site.name);
      setLocation(site.location);
      setClientName(site.clientName || '');
      setClientPhone(site.clientPhone || '');
      const standardTypes = ['Residential', 'Commercial', 'Building', 'Apartment', 'Road', 'Bridge', 'Renovation', 'Industrial'];
      if (standardTypes.includes(site.siteType)) {
        setSiteType(site.siteType);
        setCustomCategory('');
      } else {
        setSiteType('Other');
        setCustomCategory(site.siteType);
      }
      setBudget(site.estimatedBudget);
      setWorkStatus(site.workStatus);
      setPaymentStatus(site.paymentStatus);
      setStartDate(site.startDate || '');
      setExpectedEndDate(site.expectedEndDate || '');
      setNotes(site.notes || '');
    }
  }, [site]);

  if (!isOpen || !site) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const finalType = siteType === 'Other' && customCategory.trim() ? (customCategory.trim() as any) : siteType;
      await db.sites.update(site.id, {
        name: name.trim(),
        location: location.trim() || 'Site Area',
        siteType: finalType,
        clientName: clientName.trim() || undefined,
        clientPhone: clientPhone.trim() || undefined,
        estimatedBudget: Number(budget) || 0,
        workStatus,
        paymentStatus,
        startDate,
        expectedEndDate: expectedEndDate || undefined,
        notes: notes.trim() || undefined,
      });

      onSiteUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update site', err);
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
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {language === 'hi' ? 'साइट विवरण बदलें (Edit Site)' : 'Edit Site Details'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {site.name}
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
          {/* Site Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              {language === 'hi' ? 'साइट का नाम *' : 'Site Name *'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'hi' ? 'लोकेशन / पता *' : 'Location *'}</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Client / Contract Awarder Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'hi' ? 'ठेका देने वाले का नाम / क्लाइंट' : 'Client / Awarder Name'}</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={language === 'hi' ? 'उदा. पीडब्ल्यूडी, शर्मा जी, बिल्डर' : 'e.g. PWD, Mr. Sharma, Apex Builders'}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? 'क्लाइंट फ़ोन नंबर' : 'Client Phone'}</span>
              </label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder={language === 'hi' ? 'फ़ोन नंबर' : 'e.g. 9829012345'}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Site Type & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>{language === 'hi' ? 'प्रकार (Type)' : 'Category'}</span>
              </label>
              <select
                value={siteType}
                onChange={(e) => setSiteType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              >
                {language === 'hi' ? (
                  <>
                    <option value="Residential">आवासीय (मकान / कोठी)</option>
                    <option value="Commercial">व्यावसायिक (दुकान / कॉम्प्लेक्स)</option>
                    <option value="Building">बहुमंजिला भवन / टावर</option>
                    <option value="Apartment">अपार्टमेंट / फ्लैट्स</option>
                    <option value="Road">सड़क / हाईवे</option>
                    <option value="Bridge">पुल / नहर</option>
                    <option value="Renovation">मरम्मत व नवीनीकरण</option>
                    <option value="Industrial">औद्योगिक शेड / फैक्ट्री</option>
                    <option value="Other">+ अन्य (कस्टम प्रकार दर्ज करें)</option>
                  </>
                ) : (
                  <>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Building">Building / Tower</option>
                    <option value="Apartment">Apartment / Flats</option>
                    <option value="Road">Road / Highway</option>
                    <option value="Bridge">Bridge / Canal</option>
                    <option value="Renovation">Renovation / Repair</option>
                    <option value="Industrial">Industrial / Factory</option>
                    <option value="Other">+ Add Custom Category / Other</option>
                  </>
                )}
              </select>

              {siteType === 'Other' && (
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder={language === 'hi' ? 'कस्टम प्रकार दर्ज करें' : 'Enter custom category'}
                  className="mt-2 w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50/50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-800 focus:outline-none dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-green-500" />
                <span>{language === 'hi' ? 'कुल बजट (₹) *' : 'Total Budget (₹) *'}</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Work Status & Payment Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'काम की स्थिति' : 'Work Status'}
              </label>
              <select
                value={workStatus}
                onChange={(e) => setWorkStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              >
                {language === 'hi' ? (
                  <>
                    <option value="planning">योजना / टेंडर</option>
                    <option value="ongoing">चालू काम</option>
                    <option value="completed">काम पूर्ण</option>
                    <option value="on_hold">रुका हुआ</option>
                  </>
                ) : (
                  <>
                    <option value="planning">Planning</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'भुगतान स्थिति' : 'Payment Status'}
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              >
                {language === 'hi' ? (
                  <>
                    <option value="unpaid">पूरा बकाया</option>
                    <option value="partially_paid">आंशिक भुगतान</option>
                    <option value="paid">पूर्ण चुकता</option>
                  </>
                ) : (
                  <>
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Fully Paid</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? 'शुरू होने की तारीख' : 'Start Date'}</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'hi' ? 'पूर्णता तारीख' : 'Target Completion'}</span>
              </label>
              <input
                type="date"
                value={expectedEndDate}
                onChange={(e) => setExpectedEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'hi' ? 'टिप्पणी' : 'Notes'}</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            ></textarea>
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
