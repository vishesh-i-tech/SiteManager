import React, { useState, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site } from '../../types';
import { db } from '../../core/db/database';
import { getTodayFormatted, toIsoDate } from '../../utils/dateUtils';
import {
  Building2,
  MapPin,
  IndianRupee,
  Calendar,
  Layers,
  FileText,
  X,
  CheckCircle2,
  Mic,
  Phone,
  Clock,
  BookUser,
  Search,
} from 'lucide-react';

interface AddSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceModal: () => void;
  onSiteCreated: (siteId: string) => void;
}

export const AddSiteModal: React.FC<AddSiteModalProps> = ({
  isOpen,
  onClose,
  onOpenVoiceModal,
  onSiteCreated,
}) => {
  const { t, language, tradeConfig } = useTheme();

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [siteType, setSiteType] = useState<Site['siteType']>('Residential');
  const [customCategory, setCustomCategory] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [budget, setBudget] = useState<string>(''); // Blank by default, no '0'
  const [startDate, setStartDate] = useState(getTodayFormatted());
  const [expectedEndDate, setExpectedEndDate] = useState(''); // Blank by default as requested
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In-app Contact Picker Dialog state (for browsers without native Contact Picker API)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [savedClientContacts, setSavedClientContacts] = useState<{ name: string; phone: string }[]>([]);

  // Function to completely reset all form fields to a fresh state
  const resetForm = () => {
    setName('');
    setLocation('');
    setSiteType('Residential');
    setCustomCategory('');
    setClientName('');
    setClientPhone('');
    setBudget('');
    setStartDate(getTodayFormatted());
    setExpectedEndDate('');
    setNotes('');
    setIsContactModalOpen(false);
    setContactSearchQuery('');
  };

  // Whenever modal opens, reset all fields so no previous site's data remains
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  // Load existing client contacts from indexedDB sites
  const loadSavedContacts = async () => {
    try {
      const allSites = await db.sites.toArray();
      const map = new Map<string, string>();
      allSites.forEach((s) => {
        if (s.clientPhone && s.clientPhone.trim()) {
          const ph = s.clientPhone.trim();
          if (!map.has(ph)) {
            map.set(ph, s.clientName?.trim() || 'Client');
          }
        }
      });
      setSavedClientContacts(Array.from(map.entries()).map(([phone, name]) => ({ phone, name })));
    } catch (err) {
      console.error('Failed to load client contacts:', err);
    }
  };

  // Device Contact Picker Integration
  const handlePickContact = async () => {
    // 1. First attempt to use native Web Contact Picker API (Chrome / Android)
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: false };
        const contacts = await (navigator as any).contacts.select(props, opts);
        if (contacts && contacts.length > 0) {
          const c = contacts[0];
          const rawTel = c.tel?.[0] || '';
          const cleanTel = rawTel.replace(/[\s-]/g, '');
          const cName = c.name?.[0] || '';
          if (cleanTel) setClientPhone(cleanTel);
          if (cName && !clientName.trim()) setClientName(cName);
          return;
        }
      } catch (err) {
        console.log('Native contact picker dismissed or unsupported:', err);
      }
    }

    // 2. Fallback: Open internal search modal with saved client contacts
    await loadSavedContacts();
    setContactSearchQuery('');
    setIsContactModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const finalType = siteType === 'Other' && customCategory.trim() ? (customCategory.trim() as any) : siteType;
      const activeContractorId = localStorage.getItem('sitesaathi_active_user_id');
      if (!activeContractorId) {
        throw new Error('NO_ACTIVE_CONTRACTOR: Please sign in before creating a site.');
      }
      const nowIso = new Date().toISOString();

      const newSite: Site = {
        id: `site-${Date.now()}`,
        contractorId: activeContractorId,
        name: name.trim(),
        location: location.trim() || 'Main Site Area',
        siteType: finalType,
        clientName: clientName.trim() || undefined,
        clientPhone: clientPhone.trim() || undefined,
        estimatedBudget: Number(budget) || 0,
        workStatus: 'ongoing',
        paymentStatus: 'unpaid',
        startDate: toIsoDate(startDate),
        expectedEndDate: expectedEndDate.trim() ? toIsoDate(expectedEndDate.trim()) : undefined,
        notes: notes.trim() || undefined,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      await db.sites.put(newSite);
      resetForm();
      onSiteCreated(newSite.id);
      onClose();
    } catch (err) {
      console.error('Failed to create site', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
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
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {t('addSite')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'नई साइट या प्रोजेक्ट का विवरण दर्ज करें' : 'Create a new project contract workspace'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                handleClose();
                onOpenVoiceModal();
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 flex items-center gap-1 hover:bg-orange-100 transition-colors"
              title="Speak instead of typing"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? 'बोलकर भरें' : 'Voice-Fill'}</span>
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
              placeholder={language === 'hi' ? 'साइट का नाम दर्ज करें' : 'Site name'}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'hi' ? 'लोकेशन *' : 'Location *'}</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={language === 'hi' ? 'शहर, सेक्टर या क्षेत्र' : 'Location or area'}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            />
          </div>

          {/* Client / Contract Awarder Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>{language === 'hi' ? 'क्लाइंट का नाम' : 'Client Name'}</span>
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder={language === 'hi' ? 'उदा. पीडब्ल्यूडी, शर्मा जी, बिल्डर' : 'e.g. PWD, Mr. Sharma, Apex Builders'}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            {/* Client Phone with Device Contacts Picker Integration */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'hi' ? 'क्लाइंट फ़ोन नंबर' : 'Client Phone'}</span>
                </span>
                <button
                  type="button"
                  onClick={handlePickContact}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer"
                  title={language === 'hi' ? 'कॉन्टैक्ट से चुनें' : 'Pick from Contacts'}
                >
                  <BookUser className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'कॉन्टैक्ट से चुनें' : 'Contacts'}</span>
                </button>
              </label>
              <div className="relative flex items-center">
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder={language === 'hi' ? 'फ़ोन नंबर दर्ज करें' : 'Phone number'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white pr-9"
                />
                <button
                  type="button"
                  onClick={handlePickContact}
                  className="absolute right-2 p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title={language === 'hi' ? 'कॉन्टैक्ट से चुनें' : 'Pick from Contacts'}
                >
                  <BookUser className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Site Type & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-500" />
                <span>{language === 'hi' ? 'प्रकार (Type)' : 'Project Category'}</span>
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
                  placeholder={language === 'hi' ? 'कस्टम प्रकार दर्ज करें (वेयरहाउस, सोलर आदि)' : 'Enter custom category (Warehouse, Solar)'}
                  className="mt-2 w-full px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50/50 dark:bg-blue-950/20 border border-blue-300 dark:border-blue-800 focus:outline-none dark:text-white"
                />
              )}
            </div>

            {/* Budget: Blank by default, no 0 stuck */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-green-500" />
                <span>{language === 'hi' ? 'कुल बजट (₹) *' : 'Contract Budget (₹) *'}</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder={language === 'hi' ? 'बजट राशि दर्ज करें' : 'Enter budget amount'}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Dates - Manual Text Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>{language === 'hi' ? 'काम शुरू होने की तारीख' : 'Start Date'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">DD-MM-YYYY</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>

            {/* Target Completion: Blank initially */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  <span>{language === 'hi' ? 'अपेक्षित पूर्णता तारीख' : 'Target Completion'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">DD-MM-YYYY</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={expectedEndDate}
                onChange={(e) => setExpectedEndDate(e.target.value)}
                placeholder="DD-MM-YYYY"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>{language === 'hi' ? 'साइट टिप्पणी' : 'Site Notes'}</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={language === 'hi' ? 'क्लाइंट से तय दर या शर्तें...' : 'Agreement notes or terms...'}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
            ></textarea>
          </div>

          {/* Audit Timestamp Notice */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>{language === 'hi' ? 'प्रविष्टि तारीख:' : 'Entry Date:'}</span>
              <strong className="text-slate-700 dark:text-slate-200 font-semibold">{getTodayFormatted()}</strong>
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {language === 'hi' ? 'समय अपने आप दर्ज होगा' : 'Auto-timestamped'}
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
              <span>{isSubmitting ? 'Creating...' : t('confirm')}</span>
            </button>
          </div>
        </form>

        {/* Contact Picker / Search Dialog */}
        {isContactModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-sm overflow-hidden flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookUser className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                    {language === 'hi' ? 'क्लाइंट कॉन्टैक्ट चुनें' : 'Select Client Contact'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="text"
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    placeholder={language === 'hi' ? 'नाम या नंबर से खोजें...' : 'Search by name or number...'}
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
                    autoFocus
                  />
                </div>
              </div>

              {/* Contacts List */}
              <div className="p-3 overflow-y-auto flex-1 space-y-2">
                {savedClientContacts
                  .filter((c) =>
                    c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                    c.phone.includes(contactSearchQuery)
                  )
                  .map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setClientPhone(c.phone);
                        if (!clientName.trim() && c.name) setClientName(c.name);
                        setIsContactModalOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 flex items-center justify-between text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{c.phone}</div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-lg">
                        {language === 'hi' ? 'चुनें' : 'Select'}
                      </span>
                    </button>
                  ))}

                {savedClientContacts.filter((c) =>
                  c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
                  c.phone.includes(contactSearchQuery)
                ).length === 0 && (
                  <div className="py-6 text-center text-xs text-slate-400">
                    {contactSearchQuery ? (
                      <div className="space-y-2">
                        <p>{language === 'hi' ? 'कोई कॉन्टैक्ट नहीं मिला' : 'No contacts found'}</p>
                        <button
                          type="button"
                          onClick={() => {
                            if (/^\d+$/.test(contactSearchQuery.trim())) {
                              setClientPhone(contactSearchQuery.trim());
                            } else {
                              setClientName(contactSearchQuery.trim());
                            }
                            setIsContactModalOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold"
                        >
                          {language === 'hi' ? `"${contactSearchQuery}" का उपयोग करें` : `Use "${contactSearchQuery}"`}
                        </button>
                      </div>
                    ) : (
                      <p>{language === 'hi' ? 'अभी कोई पूर्व संपर्क सेव नहीं है' : 'No previous client contacts saved yet'}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Close Button */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="w-full py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {language === 'hi' ? 'बंद करें' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
