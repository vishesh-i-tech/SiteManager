import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { TradeCategory, ContractorAccount } from '../../types';
import { TRADE_CONFIGS, ALL_TRADE_KEYS } from '../../core/theme/tradeConfigs';
import { db } from '../../core/db/database';
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

    if (password && confirmPassword && password !== confirmPassword) {
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

      const newAccount: ContractorAccount = {
        id: `contractor-${Date.now()}`,
        name: name.trim(),
        phone: cleanPhone,
        password: password.trim() || undefined,
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
      if (matched.password && loginPassword && matched.password !== loginPassword.trim()) {
        setErrorMsg(
          language === 'hi' ? 'गलत पिन / पासवर्ड दर्ज किया गया।' : 'Incorrect PIN / password.'
        );
        return;
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

  const handleQuickAccountSelect = (acc: ContractorAccount) => {
    localStorage.setItem('sitesaathi_active_user_id', acc.id);
    setTrade(acc.trade);
    setLanguage(acc.language);
    onAuthenticated(acc, false);
  };

  const handleGoogleMockLogin = async () => {
    // If accounts exist, use the first one, otherwise create a mock contractor
    if (existingAccounts.length > 0) {
      handleQuickAccountSelect(existingAccounts[0]);
    } else {
      const googleMockAccount: ContractorAccount = {
        id: `contractor-google-${Date.now()}`,
        name: 'VISHESH (Google User)',
        phone: '9876543210',
        companyName: 'Vishesh Construction Co.',
        trade: 'construction',
        language,
        themeMode: 'light',
        tutorialCompleted: false,
        createdAt: new Date().toISOString(),
      };
      await db.account.put(googleMockAccount);
      localStorage.setItem('sitesaathi_active_user_id', googleMockAccount.id);
      onAuthenticated(googleMockAccount, true);
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
                  placeholder="9876543210"
                  className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5"
                />
              </div>

              {/* Password / PIN Field */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hi' ? 'सुरक्षा पिन / पासवर्ड' : 'Enter Password'}
                </span>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5"
                />
              </div>

              {/* Sign in Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 active:scale-[0.99] transition-all mt-1"
              >
                {language === 'hi' ? 'साइन इन करें' : 'Sign in'}
              </button>

              {/* Forgot password link */}
              <div className="text-center pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(
                      language === 'hi'
                        ? 'सुझाव: नीचे दिए गए डेमो प्रोफाइल पर टैप करके 1 क्लिक में सीधे लॉगिन करें।'
                        : 'Tip: Tap any profile below under "Or sign in with" to log in instantly.'
                    );
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-slate-600"
                >
                  {language === 'hi' ? 'पिन भूल गए?' : 'Forgot your password?'}
                </button>
              </div>

              {/* Divider: Or sign in with */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  {language === 'hi' ? 'या इससे साइन इन करें' : 'Or sign in with'}
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Social Login Buttons: Google + Fast Profile Switcher */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleGoogleMockLogin}
                  className="py-2.5 px-3 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                >
                  {/* Google SVG */}
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (existingAccounts.length > 0) {
                      handleQuickAccountSelect(existingAccounts[0]);
                    }
                  }}
                  className="py-2.5 px-3 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                >
                  <span className="text-blue-600">⚡</span>
                  <span className="truncate">
                    {existingAccounts[0]?.name ? existingAccounts[0].name.split(' ')[0] : 'Demo User'}
                  </span>
                </button>
              </div>

              {/* Existing Accounts Pill Cards List */}
              {existingAccounts.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    {language === 'hi' ? 'सहेजे गए ठेकेदार खाते:' : 'Saved Contractor Accounts:'}
                  </span>
                  <div className="space-y-1 max-h-32 overflow-y-auto no-scrollbar">
                    {existingAccounts.map((acc) => {
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
                  placeholder="Rameshwar Sharma"
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
                  placeholder="9876543210"
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
                  placeholder={language === 'hi' ? 'उदा. शर्मा बिल्डर्स' : 'e.g. Apex Builders'}
                  className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5"
                />
              </div>

              {/* Password / PIN */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hi' ? 'सुरक्षा पिन / पासवर्ड बनाएं' : 'Create Password'}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5"
                />
              </div>

              {/* Re-enter Password */}
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {language === 'hi' ? 'पुनः पासवर्ड / पिन दर्ज करें' : 'Re-enter Password'}
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••"
                  className="w-full text-sm font-semibold text-slate-800 placeholder-slate-300 focus:outline-none bg-transparent pt-0.5"
                />
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

              {/* Divider */}
              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                  {language === 'hi' ? 'या साइन अप करें' : 'Or sign up with'}
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {/* Quick Google sign-up */}
              <button
                type="button"
                onClick={handleGoogleMockLogin}
                className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>

            </form>

          </div>
        )}

      </div>

    </div>
  );
};
