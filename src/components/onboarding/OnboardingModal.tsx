import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import {
  Building,
  Users,
  Package,
  Truck,
  Wrench,
  Mic,
  Camera,
  Clock,
  IndianRupee,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Bell,
  Check,
  Plus,
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
  const { language, tradeConfig } = useTheme();
  const [tutIndex, setTutIndex] = useState(0);

  if (!isOpen) return null;

  const handleFinish = () => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
    onComplete();
  };

  const tutorialSteps = [
    {
      stepNumber: 1,
      tag: language === 'hi' ? 'चरण 1 • शुरुआत' : 'Step 1 • Getting Started',
      navLabel: language === 'hi' ? 'साइट बनाएं' : 'Create Site',
      title: language === 'hi' ? '1. नई साइट बनाएं और बजट तय करें' : '1. Create Work Site & Set Budget',
      subtitle: language === 'hi' ? 'हर प्रोजेक्ट का अलग खाता, क्लाइंट डिटेल्स और ऑटोमैटिक मुनाफा/घाटा हिसाब' : 'Isolated project workspace, client contact details, and automatic profit tracking',
      icon: Building,
      accentColor: '#2563EB',
      flowVisual: [
        { label: language === 'hi' ? '+ नई साइट' : '+ New Site', icon: Plus },
        { label: language === 'hi' ? 'नाम व क्लाइंट' : 'Name & Client' },
        { label: language === 'hi' ? 'अनुमानित बजट' : 'Set Budget' },
        { label: language === 'hi' ? 'लाइव P&L' : 'Live P&L' },
      ],
      points: [
        language === 'hi'
          ? '"+ नई साइट" बटन दबाकर साइट का नाम, लोकेशन और क्लाइंट का फोन नंबर चुनें (डिवाइस कॉन्टैक्ट्स से डायरेक्ट सर्च करें)।'
          : 'Click "+ New Site" to enter project name, location, and client phone (search directly from your phone contacts).',
        language === 'hi'
          ? 'अनुमानित बजट (Estimated Budget) तय करें — साइट का कुल खर्च और मुनाफा ऐप अपने आप लाइव जोड़ेगा।'
          : 'Set estimated contract budget — total expenses and profit margin are calculated automatically in real time.',
        language === 'hi'
          ? 'एक साथ कई साइट्स (चल रही / पूरी हुई) अलग-अलग मैनेज करें; किसी भी साइट का डेटा दूसरी साइट में मिक्स नहीं होगा।'
          : 'Manage multiple ongoing or completed sites simultaneously with zero data overlap.',
      ],
      exampleBox: language === 'hi'
        ? '💡 उदाहरण: "RES Dam (Seoni)" • बजट: ₹5,00,000 • क्लाइंट: मोहन जी (9826...)'
        : '💡 Example: "RES Dam (Seoni)" • Budget: ₹5,00,000 • Client: Mohan Ji (9826...)',
    },
    {
      stepNumber: 2,
      tag: language === 'hi' ? 'चरण 2 • दैनिक काम' : 'Step 2 • Daily Logging',
      navLabel: language === 'hi' ? '4 मुख्य भाग' : '4 Core Tabs',
      title: language === 'hi' ? '2. साइट के 4 मुख्य भाग (लेबर, सामान, मशीनरी व औजार)' : '2. 4 Core Site Sections (Labour, Materials, Machinery & Tools)',
      subtitle: language === 'hi' ? 'साइट कार्ड पर टैप करके अंदर जाएं — 4 आसान टैब में हर पैसे का हिसाब रखें' : 'Tap any site card to drill down into 4 dedicated operational expense tabs',
      icon: Wrench,
      accentColor: '#0284C7',
      fourSections: [
        {
          name: language === 'hi' ? 'लेबर हाजिरी' : 'Labour Muster',
          desc: language === 'hi' ? 'दैनिक हाजिरी (फुल, हाफ, ओवरटाइम) व मजदूरी' : 'Daily muster roll, wages, advance & dues',
          icon: Users,
          color: 'text-blue-600 bg-blue-50 border-blue-200',
        },
        {
          name: language === 'hi' ? 'सामान / मटेरियल' : 'Materials',
          desc: language === 'hi' ? 'सीमेंट, रेत, सरिया, ईंटें व दुकानदार बिल' : 'Cement, sand, steel, pipes & vendor bills',
          icon: Package,
          color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        },
        {
          name: language === 'hi' ? 'मशीनरी व डीजल' : 'Machinery & Fuel',
          desc: language === 'hi' ? 'जेसीबी घंटे, मिक्सर किराया व डीजल का हिसाब' : 'JCB hours, mixer rent & diesel litres',
          icon: Truck,
          color: 'text-amber-600 bg-amber-50 border-amber-200',
        },
        {
          name: language === 'hi' ? 'औजार व उपकरण' : 'Tools & Equipment',
          desc: language === 'hi' ? 'गोदाम से भेजे गए औजार ताकि सामान न छूटे' : 'Track warehouse tools dispatched to site',
          icon: Wrench,
          color: 'text-purple-600 bg-purple-50 border-purple-200',
        },
      ],
      points: [
        language === 'hi'
          ? 'साइट कार्ड पर कहीं भी क्लिक करें — साइट की पूरी जन्मकुंडली और 4 टैब खुल जाएंगे।'
          : 'Click anywhere on the site card to access all 4 tracking tabs in one organized place.',
        language === 'hi'
          ? 'नया खर्च जोड़ने पर पहले से कोई बेकार "0" नहीं दिखेगा — फॉर्म 100% खाली और फ्रेश खुलेगा।'
          : 'Adding new entries starts with 100% clean, blank inputs without annoying pre-filled "0"s.',
      ],
      exampleBox: language === 'hi'
        ? '💡 प्रो-टिप: टूल्स टैब में सिर्फ "+" बटन दबाकर अपने गोदाम के औजार तुरंत साइट पर जोड़ें।'
        : '💡 Pro-Tip: Tap the "+" button in the Tools tab to quickly track warehouse equipment sent to site.',
    },
    {
      stepNumber: 3,
      tag: language === 'hi' ? 'चरण 3 • तेज एंट्री' : 'Step 3 • Fast Shortcuts',
      navLabel: language === 'hi' ? 'बोलकर / फोटो' : 'Voice & OCR',
      title: language === 'hi' ? '3. तेज एंट्री: बोलकर या डायरी की फोटो खींचकर' : '3. Fast 1-Tap Entry: Speak or Scan Diary Photos',
      subtitle: language === 'hi' ? 'धूल-मिट्टी भरी साइट पर टाइपिंग की जरूरत नहीं — हिंदी में बोलें या कागज की फोटो खींचें' : 'No cumbersome typing on dusty job sites — speak naturally or scan handwritten registers',
      icon: Sparkles,
      accentColor: '#8B5CF6',
      dualFeature: [
        {
          title: language === 'hi' ? '🎙️ वॉइस असिस्टेंट (बोलकर भरें)' : '🎙️ Voice AI Auto-Fill',
          text: language === 'hi'
            ? 'ऊपर हेडर में माइक बटन दबाएं और हिंदी या इंग्लिश में बोलें: "200 बोरी सीमेंट 350 रुपये में RES Dam साइट पर दर्ज करो"। AI फॉर्म अपने आप भर देगा!'
            : 'Tap the glowing mic button and speak naturally: "Add 100 bags of cement for 380 rs at RES Dam site". The AI instantly auto-fills the form!',
        },
        {
          title: language === 'hi' ? '📸 डायरी फोटो OCR स्कैनर' : '📸 Diary Photo OCR Scanner',
          text: language === 'hi'
            ? 'लेबर सेक्शन में अपनी कागज की डायरी या मस्टर रोल की फोटो खींचें — 5 सेकंड में मजदूरों के नाम और हाजिरी डिजिटल रजिस्टर बन जाएगी!'
            : 'Snap a photo of your paper muster roll diary — instant offline OCR digitizes worker names and attendance rows in seconds!',
        },
      ],
      points: [
        language === 'hi'
          ? 'दोनों सुविधाएं 100% ऑफलाइन काम करती हैं — गांव, देहात या बेसमेंट में बिना इंटरनेट के भी चलेगा।'
          : 'Both Voice and OCR work 100% offline right on your phone without requiring active internet.',
        language === 'hi'
          ? 'टाइपिंग का झंझट खत्म और समय की भारी बचत — काम खत्म होते ही तुरंत 1-टैप में हाजिरी दर्ज।'
          : 'Eliminates tedious typing and saves hours of manual paperwork at the end of the day.',
      ],
      exampleBox: language === 'hi'
        ? '💡 प्रो-टिप: मजदूर जोड़ते समय उसका पिछला तय रेट अपने आप आ जाएगा, दोबारा टाइप नहीं करना पड़ेगा।'
        : '💡 Pro-Tip: Adding workers automatically inherits the recent wage for that role so you don\'t retype it.',
    },
    {
      stepNumber: 4,
      tag: language === 'hi' ? 'चरण 4 • पेमेंट व उधारी' : 'Step 4 • Cash Flow',
      navLabel: language === 'hi' ? 'पेमेंट व उधारी' : 'Dues & Receipts',
      title: language === 'hi' ? '4. क्लाइंट पेमेंट व उधारी लेजर (Pending Dues)' : '4. Client Receipts & Pending Dues Ledger',
      subtitle: language === 'hi' ? 'क्लाइंट से मिली किस्तें दर्ज करें और दुकानदार की उधारी तारीख सहित याद रखें' : 'Record client stage advances and track vendor payables with automatic due alerts',
      icon: IndianRupee,
      accentColor: '#10B981',
      cashFlowDetails: [
        {
          label: language === 'hi' ? 'क्लाइंट पेमेंट रसीद' : 'Client Receipts',
          desc: language === 'hi' ? 'एडवांस, स्लैब ढलाई किस्त या रनिंग बिल दर्ज करें। बाकी लेना (Receivable) अपने आप दिखेगा।' : 'Log booking advance or slab payments. Balance receivable updates automatically.',
        },
        {
          label: language === 'hi' ? 'दुकानदार उधारी लेजर' : 'Vendor Udhaar Ledger',
          desc: language === 'hi' ? 'सामान उधारी, मशीन किराया या लेबर बाकी तारीख सहित ट्रैक करें। 1-क्लिक व्हाट्सएप रिमाइंडर।' : 'Track material shopkeeper udhaar & machine rent. 1-click WhatsApp reminders.',
        },
        {
          label: language === 'hi' ? 'घंटी रिमाइंडर अलर्ट' : 'Reminder Bell Alert',
          desc: language === 'hi' ? 'तारीख आने पर घंटी का निशान अलर्ट देगा ताकि साइट पूरी होने के बाद भी उधारी कभी न छूटे।' : 'Automatic bell icon alerts before due dates so no payments are forgotten.',
        },
      ],
      points: [
        language === 'hi'
          ? 'क्लाइंट से कितना पैसा आ गया और कितना बाकी है, इसका लाइव बैलेंस हर समय आपकी स्क्रीन पर दिखेगा।'
          : 'Live overview shows total contract value, amount received, and remaining client balance at a glance.',
        language === 'hi'
          ? 'उधारी चुकता होने पर तुरंत "Mark Paid" दबाएं — लेजर अपने आप अपडेट हो जाएगा।'
          : 'Once cleared, tap "Mark Paid" to instantly update the ledger without manual math.',
      ],
      exampleBox: language === 'hi'
        ? '💡 हिसाब उदाहरण: कुल अनुबंध ₹5,00,000 • प्राप्त राशि: ₹3,50,000 • बाकी लेना: ₹1,50,000'
        : '💡 Financial Example: Contract ₹5,00,000 • Received: ₹3,50,000 • Balance Receivable: ₹1,50,000',
    },
    {
      stepNumber: 5,
      tag: language === 'hi' ? 'चरण 5 • फाइनल रिपोर्ट' : 'Step 5 • Official PDF',
      navLabel: language === 'hi' ? 'PDF रिपोर्ट' : 'Complete PDF',
      title: language === 'hi' ? '5. कम्प्लीट PDF रिपोर्ट व 100% सुरक्षित ऑफलाइन' : '5. Complete Site PDF Report & 100% Offline Security',
      subtitle: language === 'hi' ? '1-क्लिक में ऑफिशियल PDF बिल रिपोर्ट निकालें और क्लाइंट को व्हाट्सएप पर भेजकर पेमेंट लें' : '1-click branded PDF statements for dispute-free client billing and 100% private offline storage',
      icon: FileText,
      accentColor: '#F59E0B',
      reportHighlights: [
        {
          title: language === 'hi' ? '📄 1-क्लिक कम्प्लीट साइट PDF रिपोर्ट' : '📄 1-Click Complete Site PDF Report',
          desc: language === 'hi'
            ? 'साइट डिटेल्स में "Download PDF Report" दबाएं — क्लाइंट हिसाब, लेबर हाजिरी, मटेरियल, मशीनरी और औजारों की पूरी डिटेल एक ही ऑफिशियल PDF में तैयार!'
            : 'Click "Download PDF Report" inside Site Details — exports a complete branded statement covering financials, workers, materials, machinery, and tools!',
        },
        {
          title: language === 'hi' ? '🔒 100% ऑफलाइन व एंटी-डिलीट सुरक्षा' : '🔒 100% Offline & Anti-Wipe Security',
          desc: language === 'hi'
            ? '4-अंकों का पिन लॉक, फिंगरप्रिंट लॉक और 1-क्लिक बैकअप डाउनलोड। आपका डेटा केवल आपके फोन में सुरक्षित है — किसी सर्वर पर नहीं जाता!'
            : '4-digit PIN lock, biometric fingerprint, and 1-click JSON backup. Your business data stays 100% private on your device!',
        },
      ],
      points: [
        language === 'hi'
          ? 'क्लाइंट को प्रोफेशनल PDF स्टेटमेंट शेयर करके तुरंत बिल पास कराएं और किसी भी बहस से बचें।'
          : 'Share official PDF reports directly with clients via WhatsApp for fast, dispute-free bill clearance.',
        language === 'hi'
          ? 'फोन बदलते समय सेटिंग्स से सिर्फ 1-क्लिक में "बैकअप डाउनलोड" करें और नए फोन में लोड करें।'
          : 'Easily switch phones anytime by downloading a full offline JSON backup with 1 tap.',
      ],
      exampleBox: language === 'hi'
        ? '🎉 अब आप पूरी तरह तैयार हैं! नीचे बटन दबाएं और अपनी पहली साइट बनाकर शुरू करें!'
        : '🎉 You are now ready! Tap below to create your first site and experience stress-free site management!',
    },
  ];

  const currentStep = tutorialSteps[tutIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={handleFinish} />

      {/* Main Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh] animate-fade-in">
        
        {/* Top Header with Visual Roadmap */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span
                className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-xs"
                style={{ backgroundColor: currentStep.accentColor }}
              >
                {currentStep.tag}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {language === 'hi' ? `कदम ${tutIndex + 1} / 5` : `Step ${tutIndex + 1} of 5`}
              </span>
            </div>

            <button
              onClick={handleFinish}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
              title={language === 'hi' ? 'ट्यूटोरियल बंद करें' : 'Skip Guide'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Interactive Stepper Navigation Bar */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {tutorialSteps.map((step, idx) => {
              const isPassed = idx < tutIndex;
              const isCurrent = idx === tutIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTutIndex(idx)}
                  className={`py-2 px-1 rounded-xl text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-sm scale-102 font-black'
                      : isPassed
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold'
                      : 'bg-white dark:bg-slate-800/80 text-slate-500 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {isPassed ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <span className="text-[11px] leading-none">{idx + 1}</span>
                    )}
                  </div>
                  <span className="text-[9px] sm:text-[10px] truncate max-w-full leading-tight">
                    {step.navLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Step Content Body */}
        <div className="p-5 sm:p-7 space-y-5 overflow-y-auto flex-1">
          {/* Step Title & Subtitle */}
          <div className="text-center space-y-1.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading leading-tight">
              {currentStep.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
              {currentStep.subtitle}
            </p>
          </div>

          {/* Step 1 Visual Flow Map */}
          {currentStep.flowVisual && (
            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
              {currentStep.flowVisual.map((item, idx) => (
                <React.Fragment key={idx}>
                  <div className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                    {item.icon && <item.icon className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{item.label}</span>
                  </div>
                  {idx < currentStep.flowVisual.length - 1 && (
                    <span className="text-blue-400 font-black">➔</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Step 2 4-Sections Visual Grid */}
          {currentStep.fourSections && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentStep.fourSections.map((sec, idx) => {
                const SecIcon = sec.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border flex items-start gap-3 transition-all ${sec.color}`}
                  >
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs shrink-0 mt-0.5">
                      <SecIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                        {sec.name}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-0.5">
                        {sec.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 3 Dual Voice & OCR Feature */}
          {currentStep.dualFeature && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentStep.dualFeature.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 space-y-1.5"
                >
                  <h4 className="font-extrabold text-xs text-purple-900 dark:text-purple-200">
                    {feat.title}
                  </h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                    {feat.text}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Step 4 Cash Flow Details */}
          {currentStep.cashFlowDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentStep.cashFlowDetails.map((cf, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-1"
                >
                  <h4 className="font-extrabold text-xs text-emerald-900 dark:text-emerald-200">
                    {cf.label}
                  </h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                    {cf.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Step 5 Complete PDF & Security Highlights */}
          {currentStep.reportHighlights && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentStep.reportHighlights.map((rh, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-1.5"
                >
                  <h4 className="font-extrabold text-xs text-amber-950 dark:text-amber-200">
                    {rh.title}
                  </h4>
                  <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                    {rh.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Key Checklist Points */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
            {currentStep.points.map((pt, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{pt}</span>
              </div>
            ))}
          </div>

          {/* Actionable Pro-Tip / Example Box */}
          <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs font-bold text-blue-900 dark:text-blue-200 leading-snug text-center">
            {currentStep.exampleBox}
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between gap-3">
          {/* Back Button */}
          <div>
            {tutIndex > 0 ? (
              <button
                type="button"
                onClick={() => setTutIndex(tutIndex - 1)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 btn-tactile cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'पिछला' : 'Back'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                {language === 'hi' ? 'छोड़ें' : 'Skip'}
              </button>
            )}
          </div>

          {/* Step Pill Indicators */}
          <div className="hidden sm:flex items-center gap-1.5">
            {tutorialSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setTutIndex(i)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  tutIndex === i
                    ? 'w-6 bg-blue-600'
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
                title={`Step ${i + 1}`}
              />
            ))}
          </div>

          {/* Next / Finish Button */}
          <div>
            {tutIndex < tutorialSteps.length - 1 ? (
              <button
                type="button"
                onClick={() => setTutIndex(tutIndex + 1)}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md flex items-center gap-1.5 btn-tactile glow-theme transition-all cursor-pointer"
                style={{ backgroundColor: tradeConfig.primaryColor }}
              >
                <span>{language === 'hi' ? 'अगला कदम' : 'Next Step'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-lg flex items-center gap-2 btn-tactile glow-theme transition-all cursor-pointer"
                style={{ backgroundColor: tradeConfig.primaryColor }}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'hi' ? 'समझ गए, साइट शुरू करें!' : 'Got it, Start Working!'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
