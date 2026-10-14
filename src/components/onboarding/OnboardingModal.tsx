import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import {
  Layers,
  Sparkles,
  Camera,
  Clock,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  PlusCircle,
  Mic,
  DollarSign,
  Sun,
  Globe,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const { trade, language, t, tradeConfig } = useTheme();
  const [tutIndex, setTutIndex] = useState(0);

  if (!isOpen) return null;

  const handleFinish = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    onComplete();
  };

  const tutorialSteps = [
    {
      title: language === 'hi' ? '1. नई साइट जोड़ें और बजट ट्रैक करें' : '1. Create Work Sites & Track Budget',
      subtitle: language === 'hi' ? 'हर साइट का अलग खाता और हिसाब' : 'Isolated site-by-site finances and progress',
      icon: Layers,
      highlight: language === 'hi' ? 'साइट पर क्लिक कर टूल्स, मटेरियल, मशीनरी व लेबर देखें' : 'Click site card to drill down into tools, labour, materials & diesel logs',
      points: [
        language === 'hi' ? '"+ नई साइट" बटन दबाकर नाम, बजट और प्रकार दर्ज करें' : 'Click "+ Add Site" to set estimated budget and deadline',
        language === 'hi' ? 'साइट का वास्तविक खर्च और लाभ/हानि अपने आप कैलकुलेट होगी' : 'Actual expenses & profit margin calculate automatically in real-time',
      ],
      badge: 'Site Management',
      accentColor: '#f97316',
    },
    {
      title: language === 'hi' ? '2. बोलकर फॉर्म भरें (Voice Auto-Fill)' : '2. Voice-to-Form Auto-Fill',
      subtitle: language === 'hi' ? 'टाइपिंग की झंझट खत्म — हिंदी या इंग्लिश में बोलें' : 'No complex typing — speak naturally in Hindi or English',
      icon: Sparkles,
      highlight: language === 'hi' ? '"200 बोरी सीमेंट 350 रुपये में शर्मा साइट पर दर्ज करो"' : '"Add 50 bags of cement for 400 rs at Green Valley site"',
      points: [
        language === 'hi' ? 'ऊपर दाईं ओर नारंगी माइक बटन पर क्लिक करें' : 'Tap the glowing mic button in the top header or quick actions',
        language === 'hi' ? 'स्मार्ट AI अपने आप साइट, मात्रा और राशि पहचान कर भर देगा' : 'Auto-extracts site name, item, quantity and price instantly',
      ],
      badge: 'Voice AI',
      accentColor: '#0ea5e9',
    },
    {
      title: language === 'hi' ? '3. लेबर हाजिरी रजिस्टर की फोटो OCR' : '3. Photo OCR for Labour Register',
      subtitle: language === 'hi' ? 'कागज की डायरी या रजिस्टर की फोटो से हाजिरी' : 'Scan handwritten muster rolls into digital records',
      icon: Camera,
      highlight: language === 'hi' ? 'कागज की हाजिरी 5 सेकंड में डिजिटल मस्टर रोल बन जाएगी' : 'Instant OCR digitization of daily worker wage registers',
      points: [
        language === 'hi' ? 'लेबर सेक्शन में "फोटो OCR स्कैन" पर जाएं' : 'Open Labour tab and tap "Photo OCR / Scan Register"',
        language === 'hi' ? 'फोटो अपलोड करें या तुरंत कैमरा चालू करके स्कैन करें' : 'Upload diary photo or capture with camera for instant row extraction',
      ],
      badge: 'Camera OCR',
      accentColor: '#8b5cf6',
    },
    {
      title: language === 'hi' ? '4. बची हुई उधारी व रिमाइंडर (Pending Dues)' : '4. Pending Dues & Overdue Reminders',
      subtitle: language === 'hi' ? 'साइट पूरी होने के बाद भी उधारी कभी नहीं भूलेंगे' : 'Persistent ledger for pending client/vendor payments',
      icon: Clock,
      highlight: language === 'hi' ? 'घंटी के निशान में तारीख अनुसार बकाया के अलर्ट मिलेंगे' : 'Automatic reminder badge triggers when dues cross promise dates',
      points: [
        language === 'hi' ? 'क्लाइंट और वेंडर का बकाया अलग-अलग ट्रैक करें' : 'Track pending receivables from clients and payables to material vendors',
        language === 'hi' ? 'पेमेंट मिलने पर 1-क्लिक में मार्क करें और व्हाट्सएप पर रसीद भेजें' : '1-click mark as paid and share instant WhatsApp reminders',
      ],
      badge: 'Dues Ledger',
      accentColor: '#ef4444',
    },
    {
      title: language === 'hi' ? '5. काम के अनुसार थीम व डार्क मोड' : '5. Trade Theming, Language & Dark Mode',
      subtitle: language === 'hi' ? 'कंस्ट्रक्शन, प्लंबिंग, इलेक्ट्रिकल और आसान भाषा' : 'Custom palettes & quick-add templates tailored to your trade',
      icon: Palette,
      highlight: language === 'hi' ? 'हेडर से कभी भी भाषा (हिंदी/English) और रंग बदलें' : 'Switch themes, dark mode and language anytime from top bar or settings',
      points: [
        language === 'hi' ? 'कंस्ट्रक्शन (नारंगी), प्लंबिंग (नीला), इलेक्ट्रिकल (पीला)' : 'Construction (Orange), Plumbing (Sky Blue), Electrical (Amber)',
        language === 'hi' ? 'सेटिंग्स से कभी भी इस ट्यूटोरियल को दोबारा देखा जा सकता है' : 'Replay this guide anytime via Settings gear icon',
      ],
      badge: 'Personalization',
      accentColor: '#10b981',
    },
  ];

  const currentStep = tutorialSteps[tutIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={handleFinish} />

      {/* Interactive Sharp Dialog Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Header with Progress */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              {currentStep.badge}
            </span>
            <span className="text-xs font-bold text-slate-500">
              {language === 'hi' ? `कदम ${tutIndex + 1} / 5` : `Step ${tutIndex + 1} of 5`}
            </span>
          </div>

          <button
            onClick={handleFinish}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Skip Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
              {currentStep.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Interactive Visual Feature Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-900 border border-slate-200 dark:border-slate-700/80 text-center space-y-4 shadow-sm">
            <div
              className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform transform hover:scale-105"
              style={{ backgroundColor: currentStep.accentColor }}
            >
              <StepIcon className="w-8 h-8" />
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
              💡 {currentStep.highlight}
            </div>

            <div className="space-y-2 text-left pt-2">
              {currentStep.points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {tutorialSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setTutIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  tutIndex === i
                    ? 'w-6 bg-slate-900 dark:bg-white'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                title={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {tutIndex > 0 && (
              <button
                type="button"
                onClick={() => setTutIndex(tutIndex - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पिछला' : 'Back'}</span>
              </button>
            )}

            {tutIndex < tutorialSteps.length - 1 ? (
              <button
                type="button"
                onClick={() => setTutIndex(tutIndex + 1)}
                className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-md flex items-center gap-1.5 btn-tactile"
                style={{ backgroundColor: tradeConfig.primaryColor }}
              >
                <span>{language === 'hi' ? 'अगला कदम' : 'Next'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2 rounded-xl text-xs font-black text-white shadow-lg flex items-center gap-1.5 btn-tactile glow-theme"
                style={{ backgroundColor: tradeConfig.primaryColor }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'hi' ? 'समझ गए, शुरू करें!' : 'Get Started!'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
