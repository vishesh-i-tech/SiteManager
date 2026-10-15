import React, { useState, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import {
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  X,
  Volume2,
  Building,
  MapPin,
  IndianRupee,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { parseSiteVoiceTranscript, VoiceAssistantSession, isSpeechSupported } from '../../utils/speechRecognition';
import { db } from '../../core/db/database';
import { Site } from '../../types';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteCreated?: (newSiteId: string) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onSiteCreated,
}) => {
  const { t, language, tradeConfig } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [session, setSession] = useState<VoiceAssistantSession | null>(null);
  const [supportSpeech, setSupportSpeech] = useState(true);

  // Parsed Form State
  const [siteName, setSiteName] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState<number>(650000);
  const [siteType, setSiteType] = useState<Site['siteType']>('Residential');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSupportSpeech(isSpeechSupported());
  }, []);

  const handleStartListening = () => {
    if (!supportSpeech) return;

    const newSession = new VoiceAssistantSession(
      (text) => {
        setTranscript(text);
        const parsed = parseSiteVoiceTranscript(text);
        if (parsed.name && parsed.name !== 'New Construction Site') setSiteName(parsed.name);
        if (parsed.location && parsed.location !== 'Main Site Area') setLocation(parsed.location);
        if (parsed.budget && parsed.budget > 0) setBudget(parsed.budget);
        if (parsed.siteType) setSiteType(parsed.siteType);
      },
      (err) => {
        console.warn('Voice recognition error:', err);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      language === 'hi' ? 'hi-IN' : 'en-IN'
    );

    newSession.start();
    setSession(newSession);
    setIsListening(true);
  };

  const handleStopListening = () => {
    if (session) {
      session.stop();
      setIsListening(false);
    }
  };

  // Quick Guided Voice Preset injection (great for demonstrations & fallback)
  const applyPresetPhrase = (phrase: string) => {
    setTranscript(phrase);
    const parsed = parseSiteVoiceTranscript(phrase);
    setSiteName(parsed.name);
    setLocation(parsed.location);
    setBudget(parsed.budget);
    setSiteType(parsed.siteType);
  };

  const handleSaveSite = async () => {
    if (!siteName) return;
    setIsSaving(true);
    try {
      const newSite: Site = {
        id: `site-${Date.now()}`,
        contractorId: 'contractor-1',
        name: siteName,
        location: location || 'Site Location Area',
        siteType,
        estimatedBudget: Number(budget) || 500000,
        workStatus: 'ongoing',
        paymentStatus: 'unpaid',
        startDate: new Date().toISOString().split('T')[0],
        notes: `Created via Voice Auto-fill: "${transcript}"`,
        createdAt: new Date().toISOString(),
      };

      await db.sites.put(newSite);
      if (onSiteCreated) onSiteCreated(newSite.id);
      onClose();
    } catch (err) {
      console.error('Failed to save voice-created site', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Interactive Sharp Dialog Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
                {t('voiceModalTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'हिंदी या इंग्लिश में बोलें, फॉर्म खुद भर जाएगा' : 'Speak naturally to auto-fill site fields'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          
          {/* Microphone Central Action */}
          <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80">
            <div className="relative">
              {isListening && (
                <>
                  <div
                    className="absolute -inset-3 rounded-full animate-ping opacity-40"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                  ></div>
                  <div
                    className="absolute -inset-6 rounded-full animate-pulse opacity-20"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                  ></div>
                </>
              )}
              <button
                onClick={isListening ? handleStopListening : handleStartListening}
                className="relative w-20 h-20 rounded-full text-white shadow-xl flex items-center justify-center transition-transform hover:scale-105 btn-tactile glow-theme"
                style={{ backgroundColor: isListening ? '#EF4444' : tradeConfig.primaryColor }}
              >
                {isListening ? <MicOff className="w-9 h-9 animate-bounce" /> : <Mic className="w-9 h-9" />}
              </button>
            </div>

            <p className="mt-4 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              {isListening ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-red-600 dark:text-red-400">{t('micListening')}</span>
                </>
              ) : (
                <span>{t('micTapToStart')}</span>
              )}
            </p>
          </div>

          {/* Real-time recognized voice text bubble */}
          {transcript && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-1 font-bold text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                <Volume2 className="w-3.5 h-3.5" />
                <span>{t('voiceDetectedText')}</span>
              </div>
              <p className="italic">"{transcript}"</p>
            </div>
          )}

          {/* Extracted Fields Editable Form */}
          <div className="space-y-3 pt-1">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('voiceExtractedFields')}
            </h3>

            {/* Site Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-orange-500" />
                <span>{language === 'hi' ? 'साइट का नाम' : 'Site Name'}</span>
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder={language === 'hi' ? 'साइट का नाम' : 'Site name'}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
              />
            </div>

            {/* Location & Site Type Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>{language === 'hi' ? 'लोकेशन / पता' : 'Location'}</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={language === 'hi' ? 'लोकेशन या पता' : 'Location or area'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-500" />
                  <span>{language === 'hi' ? 'प्रकार (Type)' : 'Site Type'}</span>
                </label>
                <select
                  value={siteType}
                  onChange={(e) => setSiteType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
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
                      <option value="Other">+ अन्य (कस्टम प्रकार)</option>
                    </>
                  ) : (
                    <>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Building">Building / Tower</option>
                      <option value="Apartment">Apartment / Flats</option>
                      <option value="Road">Road / Highway</option>
                      <option value="Bridge">Bridge / Flyover</option>
                      <option value="Renovation">Renovation / Repair</option>
                      <option value="Industrial">Industrial / Factory</option>
                      <option value="Other">+ Add Custom Type / Other</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Estimated Budget */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-green-500" />
                <span>{language === 'hi' ? 'कुल बजट / ठेका रकम (₹)' : 'Total Budget (₹)'}</span>
              </label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {t('cancel')}
          </button>
          <button
            type="button"
            onClick={handleSaveSite}
            disabled={!siteName || isSaving}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center gap-2 transition-all btn-tactile disabled:opacity-50 glow-theme"
            style={{ backgroundColor: tradeConfig.primaryColor }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : t('confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
