import React, { useState, useEffect } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { TradeCategory, ContractorAccount } from '../../types';
import { TRADE_CONFIGS, ALL_TRADE_KEYS } from '../../core/theme/tradeConfigs';
import { db } from '../../core/db/database';
import { hashCredential, verifyCredential } from '../../utils/cryptoUtils';
import {
  HardHat,
  Wrench,
  Zap,
  Globe,
  ArrowRight,
  AlertCircle,
  Paintbrush,
  Hammer,
  Shield,
  Layers,
  Grid,
  Wind,
  Sparkles,
  Truck,
  ArrowLeft,
  ChevronDown,
  X,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: (account: ContractorAccount, isNewAccount: boolean) => void;
  existingAccounts: ContractorAccount[];
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthenticated,
  existingAccounts,
}) => {
  const { setTrade, language, setLanguage } = useTheme();

  // Three view states matching the reference design:
  // 'onboarding' (hero screen), 'register' (Sign Up), 'login' (Welcome Back)
  const [view, setView] = useState<'onboarding' | 'login' | 'register'>('onboarding');

  // Register form state
  const [selectedTrade, setSelectedTrade] = useState<TradeCategory>('construction');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register password toggles
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot PIN / Password Reset Modal
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [resetError, setResetError] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Rate Limiting (Defense in Depth)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [lockoutTimer]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया अपना नाम और मोबाइल नंबर दर्ज करें'
          : 'Please enter your full name and mobile number'
      );
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg(
        language === 'hi'
          ? 'मोबाइल नंबर ठीक 10 अंकों का होना चाहिए'
          : 'Mobile phone number must be exactly 10 digits'
      );
      return;
    }

    if (!password.trim()) {
      setErrorMsg(
        language === 'hi'
          ? 'कृपया 4 अंकों का सुरक्षा पिन / पासवर्ड दर्ज करें'
          : 'Please enter a 4-digit security PIN / password'
      );
      return;
    }

    if (password.trim().length < 4) {
      setErrorMsg(
        language === 'hi'
          ? 'सुरक्षा पिन कम से कम 4 अंकों का होना चाहिए'
          : 'Security PIN must be at least 4 digits'
      );
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setErrorMsg(
        language === 'hi'
          ? 'दोनों पासवर्ड / पिन मेल नहीं खा रहे हैं'
          : 'Passwords do not match. Please re-enter.'
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const existing = await db.account.where('phone').equals(cleanPhone).first();
      if (existing) {
        setErrorMsg(
          language === 'hi'
            ? 'इस नंबर से खाता पहले से मौजूद है। कृपया साइन इन करें।'
            : 'An account with this phone number already exists. Please sign in.'
        );
        setIsSubmitting(false);
        return;
      }

      // SEC-DEF-001: Hash credentials using PBKDF2 with unique salt
      const hashedPin = await hashCredential(password.trim());

      const newAccount: ContractorAccount = {
        id: `contractor-${Date.now()}`,
        name: name.trim(),
        phone: cleanPhone,
        password: hashedPin,
        pinLock: hashedPin,
        isPinLockEnabled: true,
        companyName: companyName.trim() || undefined,
        trade: selectedTrade,
        language,
        themeMode: 'light',
        tutorialCompleted: false,
        createdAt: new Date().toISOString(),
      };

      await db.account.put(newAccount);
      localStorage.setItem('sitesaathi_active_user_id', newAccount.id);
      setTrade(selectedTrade);
      onAuthenticated(newAccount, true);
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMsg(
        language === 'hi'
          ? 'खाता बनाने में त्रुटि हुई। पुनः प्रयास करें।'
          : 'Failed to create account. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;

    if (!loginPhone.trim()) {
      setErrorMsg(
        language === 'hi' ? 'कृपया अपना मोबाइल नंबर दर्ज करें' : 'Please enter your phone number'
      );
      return;
    }

    setErrorMsg('');
    const cleanPhone = loginPhone.trim().replace(/\D/g, '');
    const allAccounts = await db.account.toArray();
    const matched = allAccounts.find((a) => a.phone.replace(/\D/g, '') === cleanPhone);

    if (matched) {
      if (matched.password || matched.pinLock) {
        const targetCred = matched.password || matched.pinLock || '';
        const verifyRes = await verifyCredential(loginPassword.trim(), targetCred);

        if (!verifyRes.isValid) {
          const nextFailed = failedAttempts + 1;
          setFailedAttempts(nextFailed);
          if (nextFailed >= 5) {
            setLockoutTimer(30);
            setErrorMsg(
              language === 'hi'
                ? '5 बार गलत पिन! सुरक्षा कारणों से 30 सेकंड के लिए प्रतीक्षा करें।'
                : '5 incorrect attempts! Please wait 30 seconds before retrying.'
            );
          } else {
            setErrorMsg(
              language === 'hi'
                ? `गलत पिन / पासवर्ड दर्ज किया गया। (${5 - nextFailed} प्रयास शेष)`
                : `Incorrect PIN / password. (${5 - nextFailed} attempts remaining)`
            );
          }
          return;
        }

        // Successful verification! Reset failed counter
        setFailedAttempts(0);

        // SEC-DEF-001: Seamless backward-compatible migration for legacy plaintext accounts
        if (verifyRes.isLegacy) {
          const upgradedHash = await hashCredential(loginPassword.trim());
          await db.account.update(matched.id, {
            password: upgradedHash,
            pinLock: matched.pinLock ? upgradedHash : upgradedHash,
          });
          matched.password = upgradedHash;
          matched.pinLock = upgradedHash;
        }
      }

      localStorage.setItem('sitesaathi_active_user_id', matched.id);
      setTrade(matched.trade);
      setLanguage(matched.language);
      onAuthenticated(matched, false);
    } else {
      setErrorMsg(
        language === 'hi'
          ? 'यह नंबर नहीं मिला। कृपया साइन अप करें या नंबर जांचें।'
          : 'No account found with this phone number. Please sign up.'
      );
    }
  };

  // Filter out any hardcoded/demo contractor IDs so only real accounts saved on this device appear
  const userSavedAccounts = existingAccounts.filter(
    (acc) =>
      !['contractor-1', 'contractor-2', 'contractor-3', 'contractor-demo'].includes(acc.id) &&
      !acc.name.toLowerCase().includes('rameshwar') &&
      !acc.name.toLowerCase().includes('vikram') &&
      !acc.name.toLowerCase().includes('rajesh patel') &&
      !['9876543210', '9876543211', '9876543212'].includes(acc.phone)
  );

  // SEC-DEF-002 FIX: Selecting account pre-fills phone and transitions to secure PIN challenge view
  const handleQuickAccountSelect = (acc: ContractorAccount) => {
    setLoginPhone(acc.phone.replace(/\D/g, ''));
    setLoginPassword('');
    setErrorMsg('');
    setView('login');
  };

  // SEC-DEF-003 FIX: Requires verifying current PIN before allowing credentials to change
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    const clean = resetPhone.trim().replace(/\D/g, '');
    if (clean.length !== 10) {
      setResetError(
        language === 'hi'
          ? 'कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें'
          : 'Please enter a valid 10-digit mobile phone number'
      );
      return;
    }

    if (!currentPin.trim()) {
      setResetError(
        language === 'hi'
          ? 'सुरक्षा कारणों से वर्तमान सुरक्षा पिन दर्ज करना अनिवार्य है'
          : 'Current Security PIN is required to authorize credential update'
      );
      return;
    }

    if (!newPin || newPin.length < 4) {
      setResetError(
        language === 'hi'
          ? 'नया पिन कम से कम 4 अंकों का होना चाहिए'
          : 'New PIN must be at least 4 characters'
      );
      return;
    }

    if (newPin !== confirmNewPin) {
      setResetError(
        language === 'hi'
          ? 'दोनों नए पिन मेल नहीं खा रहे हैं'
          : 'New PINs do not match'
      );
      return;
    }

    setIsResetting(true);
    try {
      const all = await db.account.toArray();
      const account = all.find((a) => a.phone.replace(/\D/g, '') === clean);
      if (!account) {
        setResetError(
          language === 'hi'
            ? 'इस मोबाइल नंबर से कोई पंजीकृत खाता नहीं मिला'
            : 'No registered account found with this mobile number'
        );
        setIsResetting(false);
        return;
      }

      // Verify current PIN against account
      const targetCred = account.password || account.pinLock || '';
      const verifyRes = await verifyCredential(currentPin.trim(), targetCred);
      if (!verifyRes.isValid) {
        setResetError(
          language === 'hi'
            ? 'वर्तमान सुरक्षा पिन अमान्य है। ऑफ़लाइन सुरक्षा नीति के अनुसार अनधिकृत रीसेट वर्जित है।'
            : 'Current PIN is invalid. Offline security policy strictly prohibits unauthorized PIN overwrite.'
        );
        setIsResetting(false);
        return;
      }

      // Hash new PIN with PBKDF2
      const hashedNewPin = await hashCredential(newPin.trim());
      await db.account.update(account.id, {
        password: hashedNewPin,
        pinLock: hashedNewPin,
      });

      setResetSuccess(
        language === 'hi'
          ? 'पिन सफलतापूर्वक बदल दिया गया है! अब आप साइन इन कर सकते हैं।'
          : 'PIN updated successfully! You can now sign in.'
      );
      setTimeout(() => {
        setIsForgotModalOpen(false);
        setLoginPhone(clean);
        setLoginPassword(newPin.trim());
        setResetPhone('');
        setCurrentPin('');
        setNewPin('');
        setConfirmNewPin('');
        setResetSuccess('');
        setResetError('');
        setIsResetting(false);
      }, 1000);
    } catch (err) {
      setResetError(
        language === 'hi'
          ? 'पिन रीसेट करने में त्रुटि हुई।'
          : 'Failed to reset PIN. Please try again.'
      );
      setIsResetting(false);
    }
  };

  const getTradeIcon = (cat: TradeCategory) => {
    switch (cat) {
      case 'construction':
        return <HardHat className="w-4 h-4 text-blue-600" />;
      case 'plumbing':
        return <Wrench className="w-4 h-4 text-sky-600" />;
      case 'electrical':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'painting':
        return <Paintbrush className="w-4 h-4 text-purple-600" />;
      case 'carpentry':
        return <Hammer className="w-4 h-4 text-amber-700" />;
      case 'fabrication':
        return <Shield className="w-4 h-4 text-slate-600" />;
      case 'flooring':
        return <Layers className="w-4 h-4 text-teal-600" />;
      case 'ceiling':
        return <Grid className="w-4 h-4 text-indigo-600" />;
      case 'hvac':
        return <Wind className="w-4 h-4 text-cyan-600" />;
      case 'interior':
        return <Sparkles className="w-4 h-4 text-rose-600" />;
      case 'infra':
        return <Truck className="w-4 h-4 text-slate-700" />;
      default:
        return <HardHat className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-full w-full bg-white text-slate-900 flex flex-col justify-between p-6 sm:p-8 font-sans relative overflow-x-hidden select-none">
      
      {/* Background Decorative Subtle Doodles matching reference image */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden">
        {/* Top-right sparkle */}
        <div className="absolute top-8 right-6 text-slate-300 text-lg">✦</div>
        {/* Top-left small cross */}
        <div className="absolute top-16 left-6 text-slate-200 text-xs">✕</div>
        {/* Floating geometric circle */}
        <div className="absolute top-44 -right-4 w-16 h-16 rounded-full border border-dashed border-slate-200" />
        {/* Floating triangle doodle */}
        <div className="absolute top-36 left-4 w-5 h-5 border-l-2 border-b-2 border-slate-200 -rotate-45" />
        {/* Bottom sparkle */}
        <div className="absolute bottom-12 left-8 text-slate-300 text-base">✧</div>
        <div className="absolute bottom-28 right-8 text-slate-200 text-xs">✕</div>
      </div>

      {/* TOP BAR: Brand + Language Switcher */}
      <div className="w-full flex items-center justify-between z-10 pt-1 pb-4">
        {view !== 'onboarding' ? (
          <button
            type="button"
            onClick={() => {
              setErrorMsg('');
              setView('onboarding');
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Back to start"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-9" />
        )}

        {/* Center Brand Name & Sparkle */}
        <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setView('onboarding')}>
          <span className="text-blue-600 text-sm font-black">✦</span>
          <span className="font-extrabold text-base tracking-tight text-slate-900 font-heading">
            SiteSaathi
          </span>
        </div>

        {/* Language Switch Pill */}
        <button
          type="button"
          onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
          className="px-2.5 py-1 rounded-full text-xs font-bold text-slate-600 bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/80 flex items-center gap-1 transition-all"
        >
          <Globe className="w-3 h-3 text-blue-600" />
          <span>{language === 'hi' ? 'English' : 'हिंदी'}</span>
        </button>
      </div>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full mx-auto z-10 py-2">
        
        {/* ============================================================== */}
        {/* 1. ONBOARDING SCREEN (Exact match with Screen 1 of reference) */}
        {/* ============================================================== */}
        {view === 'onboarding' && (
          <div className="flex-1 flex flex-col justify-between animate-fade-in space-y-6">
            
            {/* Center Illustration Hero */}
            <div className="flex-1 flex items-center justify-center py-4">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                <img
                  src="/images/auth_hero.jpg"
                  alt="SiteSaathi Contractor Management"
                  className="w-full h-full object-contain rounded-3xl mix-blend-multiply transition-transform hover:scale-102"
                />
              </div>
            </div>

            {/* Headline & Description */}
            <div className="space-y-3 text-left">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug font-heading">
                {language === 'hi' ? 'साइट और लेबर का पूरा हिसाब।' : 'Discover and improve your sites.'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                {language === 'hi'
                  ? 'ठेकेदारी का खर्च, दैनिक लेबर हाजिरी, औजारों का रिकॉर्ड और क्लाइंट बिलिंग — सब कुछ 100% बिना इंटरनेट।'
                  : 'Start, track, and manage your contractor projects with ease. Daily labour muster rolls, tool registers, and client billing statements.'}
              </p>
            </div>

            {/* Bottom Split Pill Action: "Get Started" + Circle Arrow Button */}
            <div className="pt-4 space-y-3">
              <div
                onClick={() => setView('login')}
                className="w-full pl-6 pr-2 py-2 rounded-full border border-slate-200 bg-white hover:border-slate-300 shadow-xs flex items-center justify-between cursor-pointer group active:scale-[0.99] transition-all"
              >
                <span className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
                  {language === 'hi' ? 'शुरू करें' : 'Get Started'}
                </span>
                <div className="w-11 h-11 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/30 transition-all group-hover:translate-x-0.5">
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </div>
              </div>

              {/* Quick direct sign up switch */}
              <div className="text-center">
                <span className="text-xs text-slate-500 font-medium">
                  {language === 'hi' ? 'नया खाता बनाना है? ' : "New contractor? "}
                  <button
                    type="button"
                    onClick={() => setView('register')}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    {language === 'hi' ? 'साइन अप करें' : 'Sign up'}
                  </button>
                </span>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* 2. SIGN IN SCREEN (Exact match with Screen 3: "Welcome Back") */}
        {/* ============================================================== */}
        {view === 'login' && (
          <div className="flex-1 flex flex-col justify-center animate-fade-in space-y-5">
            
            {/* Top Miniature Illustration */}
            <div className="flex justify-center -mt-2">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-blue-50/50 p-1 flex items-center justify-center border border-blue-100/80">
                <img
                  src="/images/auth_hero.jpg"
                  alt="Contractor Avatar"
                  className="w-full h-full object-cover rounded-xl mix-blend-multiply"
                />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-heading">
                {language === 'hi' ? 'स्वागत है!' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'खाता नहीं है? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setView('register');
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  {language === 'hi' ? 'साइन अप करें' : 'Sign up'}
                </button>
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleLogin} className="space-y-3.5">
              {/* Phone Field */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hi' ? 'मोबाइल नंबर' : 'Phone Number'}
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder=""
                  className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5"
                />
              </div>

              {/* Password / PIN Field */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hi' ? 'सुरक्षा पिन / पासवर्ड' : 'Enter Password'}
                </span>
                <div className="relative flex items-center">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder=""
                    className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute right-0 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sign in Button */}
              <button
                type="submit"
                disabled={lockoutTimer > 0}
                className={`w-full py-3.5 rounded-full text-sm font-bold text-white transition-all mt-1 ${
                  lockoutTimer > 0
                    ? 'bg-slate-400 cursor-not-allowed opacity-80'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 active:scale-[0.99]'
                }`}
              >
                {lockoutTimer > 0
                  ? language === 'hi'
                    ? `कृपया प्रतीक्षा करें (${lockoutTimer}s)`
                    : `Please wait (${lockoutTimer}s)`
                  : language === 'hi'
                  ? 'साइन इन करें'
                  : 'Sign in'}
              </button>

              {/* Forgot password link */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setResetError('');
                    setResetSuccess('');
                    setResetPhone(loginPhone || '');
                    setNewPin('');
                    setConfirmNewPin('');
                    setIsForgotModalOpen(true);
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                >
                  {language === 'hi' ? 'पिन भूल गए? (Reset PIN)' : 'Forgot your password?'}
                </button>
              </div>

              {/* User-saved Accounts Pill Cards List (Only appears if user previously registered/logged in on this device) */}
              {userSavedAccounts.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'hi' ? 'सहेजे गए खाते:' : 'Saved Accounts:'}
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto no-scrollbar">
                    {userSavedAccounts.map((acc) => {
                      const tradeConf = TRADE_CONFIGS[acc.trade] || TRADE_CONFIGS.construction;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => handleQuickAccountSelect(acc)}
                          className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center shadow-2xs">
                              {getTradeIcon(acc.trade)}
                            </div>
                            <span className="text-xs font-bold text-slate-800">{acc.name}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400">
                            {language === 'hi' ? tradeConf.nameHi.split(' ')[0] : tradeConf.nameEn}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </form>

          </div>
        )}

        {/* ============================================================== */}
        {/* 3. SIGN UP SCREEN (Exact match with Screen 2: "Sign Up")      */}
        {/* ============================================================== */}
        {view === 'register' && (
          <div className="flex-1 flex flex-col justify-center animate-fade-in space-y-4">
            
            {/* Title & Subtitle */}
            <div className="text-left space-y-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight font-heading">
                {language === 'hi' ? 'साइन अप' : 'Sign Up'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'hi' ? 'पहले से खाता है? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg('');
                    setView('login');
                  }}
                  className="text-blue-600 font-bold hover:underline"
                >
                  {language === 'hi' ? 'साइन इन' : 'Sign in'}
                </button>
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-3">
              
              {/* Full Name */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hi' ? 'ठेकेदार का नाम *' : 'Full Name *'}
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder=""
                  className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5"
                />
              </div>

              {/* Mobile Phone Number */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hi' ? 'मोबाइल नंबर (10 अंक) *' : 'Mobile Phone Number *'}
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder=""
                  className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5"
                />
              </div>

              {/* Trade / Profession Selector */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all relative">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hi' ? 'मुख्य कार्य (ट्रेड) *' : 'Trade Category *'}
                </span>
                <div className="flex items-center justify-between pt-0.5">
                  <select
                    value={selectedTrade}
                    onChange={(e) => setSelectedTrade(e.target.value as TradeCategory)}
                    className="w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-none appearance-none cursor-pointer pr-6"
                  >
                    {ALL_TRADE_KEYS.map((cat) => {
                      const conf = TRADE_CONFIGS[cat] || TRADE_CONFIGS.construction;
                      return (
                        <option key={cat} value={cat}>
                          {language === 'hi' ? conf.nameHi : conf.nameEn}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none absolute right-4 top-5" />
                </div>
              </div>

              {/* Business Name */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hi' ? 'दुकान / फर्म का नाम' : 'Business Name'}
                </span>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder=""
                  className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5"
                />
              </div>

              {/* Password / PIN */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hi' ? 'सुरक्षा पिन / पासवर्ड बनाएं (4+ अंक) *' : 'Create Password (4+ digits) *'}
                </span>
                <div className="relative flex items-center">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    className="absolute right-0 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Re-enter Password */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hi' ? 'पुनः पासवर्ड / पिन दर्ज करें *' : 'Re-enter Password *'}
                </span>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder=""
                    className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5 pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-0 text-slate-400 hover:text-slate-600 p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all mt-1"
              >
                {isSubmitting
                  ? (language === 'hi' ? 'खाता बन रहा है...' : 'Registering...')
                  : (language === 'hi' ? 'पंजीकरण करें (Register)' : 'Register')}
              </button>

            </form>

          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* SECURE PIN / PASSWORD RESET DIALOG                              */}
      {/* ============================================================== */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-sm overflow-hidden animate-scale-up">
            
            {/* Header */}
            <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 font-heading">
                  {language === 'hi' ? 'पिन / पासवर्ड रीसेट करें' : 'Reset PIN / Password'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isResetting) {
                    setIsForgotModalOpen(false);
                    setResetError('');
                    setResetSuccess('');
                  }
                }}
                disabled={isResetting}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 pt-4">
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                {language === 'hi'
                  ? 'ऑफ़लाइन सुरक्षा नीति: अनधिकृत बदलाव रोकने के लिए अपने मोबाइल नंबर के साथ वर्तमान सुरक्षा पिन दर्ज करें।'
                  : 'Offline Security Policy: To prevent unauthorized credential changes, enter your mobile number and verify your current PIN.'}
              </p>

              {resetError && (
                <div className="mb-3.5 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="mb-3.5 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-3">
                {/* Registered Phone */}
                <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {language === 'hi' ? 'पंजीकृत मोबाइल नंबर' : 'Registered Mobile Number'}
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder=""
                    className="w-full text-xs font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5"
                  />
                </div>

                {/* Current PIN Field */}
                <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {language === 'hi' ? 'वर्तमान सुरक्षा पिन (सत्यापन)' : 'Current Security PIN (Required)'}
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type={showCurrentPin ? 'text' : 'password'}
                      required
                      value={currentPin}
                      onChange={(e) => setCurrentPin(e.target.value)}
                      placeholder=""
                      className="w-full text-xs font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPin((prev) => !prev)}
                      className="absolute right-0 text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Toggle current PIN visibility"
                    >
                      {showCurrentPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New PIN */}
                <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {language === 'hi' ? 'नया सुरक्षा पिन (कम से कम 4 अंक)' : 'New Security PIN (min 4 digits)'}
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder=""
                      className="w-full text-xs font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5 pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPin((prev) => !prev)}
                      className="absolute right-0 text-slate-400 hover:text-slate-600 p-1"
                      aria-label="Toggle new PIN visibility"
                    >
                      {showNewPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New PIN */}
                <div className="rounded-2xl border border-slate-200 bg-white px-3.5 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {language === 'hi' ? 'नए पिन की पुष्टि करें' : 'Confirm New PIN'}
                  </span>
                  <input
                    type={showNewPin ? 'text' : 'password'}
                    required
                    value={confirmNewPin}
                    onChange={(e) => setConfirmNewPin(e.target.value)}
                    placeholder=""
                    className="w-full text-xs font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    disabled={isResetting}
                    className="flex-1 py-2.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="flex-1 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-1.5"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{language === 'hi' ? 'अपडेट हो रहा है...' : 'Resetting...'}</span>
                      </>
                    ) : (
                      <span>{language === 'hi' ? 'पिन बदलें' : 'Update PIN'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
