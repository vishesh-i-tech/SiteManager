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
  UserPlus,
  X,
  Loader2,
  CheckCircle2,
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

  // Google OAuth Dialog State
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleStep, setGoogleStep] = useState<'chooser' | 'custom'>('chooser');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<{ name: string; email: string } | null>(null);

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

  // Filter out any hardcoded/demo contractor IDs so only real accounts saved on this device appear
  const userSavedAccounts = existingAccounts.filter(
    (acc) =>
      !['contractor-1', 'contractor-2', 'contractor-3', 'contractor-demo'].includes(acc.id) &&
      !acc.name.toLowerCase().includes('rameshwar') &&
      !acc.name.toLowerCase().includes('vikram') &&
      !acc.name.toLowerCase().includes('rajesh patel') &&
      !['9876543210', '9876543211', '9876543212'].includes(acc.phone)
  );

  const handleQuickAccountSelect = (acc: ContractorAccount) => {
    localStorage.setItem('sitesaathi_active_user_id', acc.id);
    setTrade(acc.trade);
    setLanguage(acc.language);
    onAuthenticated(acc, false);
  };

  const handleOpenGoogleDialog = () => {
    setCustomGoogleName('');
    setCustomGoogleEmail('');
    setGoogleStep('chooser');
    setIsGoogleLoading(false);
    setIsGoogleModalOpen(true);
  };

  const handleSelectGoogleAccount = async (accountName: string, accountEmail: string) => {
    setSelectedGoogleAccount({ name: accountName, email: accountEmail });
    setIsGoogleLoading(true);

    setTimeout(async () => {
      try {
        const cleanName = accountName.trim();
        const existing = await db.account.toArray();
        let matched = existing.find(
          (a) =>
            a.name.toLowerCase() === cleanName.toLowerCase() ||
            (a.email && a.email.toLowerCase() === accountEmail.toLowerCase())
        );

        if (!matched) {
          matched = {
            id: `contractor-google-${Date.now()}`,
            name: cleanName,
            email: accountEmail,
            phone: '98' + Math.floor(10000000 + Math.random() * 90000000).toString(),
            trade: 'construction',
            language,
            themeMode: 'light',
            tutorialCompleted: false,
            createdAt: new Date().toISOString(),
          };
          await db.account.put(matched);
        }

        localStorage.setItem('sitesaathi_active_user_id', matched.id);
        setIsGoogleLoading(false);
        setIsGoogleModalOpen(false);
        setGoogleStep('chooser');
        onAuthenticated(matched, false);
      } catch (err) {
        console.error('Google login failed', err);
        setIsGoogleLoading(false);
      }
    }, 850);
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
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder=""
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
                        ? 'पिन रीसेट के लिए कृपया अपना पंजीकृत 10 अंकों का मोबाइल नंबर दर्ज करें।'
                        : 'Please enter your registered 10-digit mobile phone number.'
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

              {/* Social Login Button: Google */}
              <div>
                <button
                  type="button"
                  onClick={handleOpenGoogleDialog}
                  className="w-full py-2.5 px-3 rounded-2xl border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
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
                  {language === 'hi' ? 'सुरक्षा पिन / पासवर्ड बनाएं' : 'Create Password'}
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=""
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
                  placeholder=""
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
                onClick={handleOpenGoogleDialog}
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

      {/* ============================================================== */}
      {/* AUTHENTIC GOOGLE SIGN-IN OAUTH DIALOG                          */}
      {/* ============================================================== */}
      {isGoogleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-sm overflow-hidden animate-scale-up">
            
            {/* Header with Google Logo & Close Button */}
            <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-sm font-bold text-slate-800 font-heading">
                  {language === 'hi' ? 'Google से साइन इन करें' : 'Sign in with Google'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isGoogleLoading) {
                    setIsGoogleModalOpen(false);
                    setGoogleStep('chooser');
                  }
                }}
                disabled={isGoogleLoading}
                className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 pt-3">
              {isGoogleLoading ? (
                /* Authenticating Loading State */
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="relative flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-3 border-blue-100 border-t-blue-600 animate-spin" />
                    <svg className="w-5 h-5 absolute" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      {language === 'hi' ? 'Google खाते से जुड़ रहे हैं...' : 'Signing in to SiteSaathi...'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {language === 'hi'
                        ? `${selectedGoogleAccount?.name} का खाता प्रमाणित किया जा रहा है`
                        : `Verifying Google credentials for ${selectedGoogleAccount?.name}`}
                    </p>
                  </div>
                </div>
              ) : googleStep === 'chooser' ? (
                /* Google Account Selection */
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === 'hi' ? 'जारी रखने के लिए खाता चुनें' : 'Choose an account'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'hi'
                        ? 'SiteSaathi में आगे बढ़ने के लिए'
                        : 'to continue to SiteSaathi'}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    {/* Primary Account: Vishesh Sharma */}
                    <button
                      type="button"
                      onClick={() => handleSelectGoogleAccount('Vishesh Sharma', 'vishesh.contractor@gmail.com')}
                      className="w-full p-2.5 rounded-2xl hover:bg-slate-50 border border-slate-200/80 hover:border-blue-400 flex items-center gap-3 text-left transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
                        V
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-slate-800 truncate">
                          Vishesh Sharma
                        </span>
                        <span className="block text-[11px] text-slate-500 truncate">
                          vishesh.contractor@gmail.com
                        </span>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    </button>

                    {/* Secondary Account: SiteSaathi Contractor */}
                    <button
                      type="button"
                      onClick={() => handleSelectGoogleAccount('SiteSaathi Contractor', 'contractor.sitesaathi@gmail.com')}
                      className="w-full p-2.5 rounded-2xl hover:bg-slate-50 border border-slate-200/80 hover:border-emerald-400 flex items-center gap-3 text-left transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-2xs">
                        S
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-xs font-bold text-slate-800 truncate">
                          SiteSaathi Contractor
                        </span>
                        <span className="block text-[11px] text-slate-500 truncate">
                          contractor.sitesaathi@gmail.com
                        </span>
                      </div>
                    </button>

                    {/* Option: Use another account */}
                    <button
                      type="button"
                      onClick={() => setGoogleStep('custom')}
                      className="w-full p-2.5 rounded-2xl hover:bg-slate-50 border border-dashed border-slate-200 hover:border-slate-400 flex items-center gap-3 text-left transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                        <UserPlus className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        {language === 'hi' ? 'किसी अन्य Google खाते का उपयोग करें' : 'Use another Google account'}
                      </span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center leading-relaxed pt-1">
                    {language === 'hi'
                      ? 'आगे बढ़ने पर, Google आपके नाम, ईमेल और प्रोफ़ाइल को SiteSaathi के साथ साझा करेगा।'
                      : 'To continue, Google will share your name and email with SiteSaathi in accordance with their privacy policy.'}
                  </p>
                </div>
              ) : (
                /* Custom Google Account Input */
                <div className="space-y-3.5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === 'hi' ? 'अपना Google खाता दर्ज करें' : 'Enter your Google Account'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'hi' ? 'नाम और Gmail पता दर्ज करें' : 'Enter your name and Gmail address'}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {language === 'hi' ? 'आपका पूरा नाम' : 'Full Name'}
                      </span>
                      <input
                        type="text"
                        value={customGoogleName}
                        onChange={(e) => setCustomGoogleName(e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        {language === 'hi' ? 'Gmail / ईमेल पता' : 'Gmail Address'}
                      </span>
                      <input
                        type="email"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        placeholder=""
                        className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setGoogleStep('chooser')}
                      className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      {language === 'hi' ? 'वापस' : 'Back'}
                    </button>
                    <button
                      type="button"
                      disabled={!customGoogleName.trim() || !customGoogleEmail.trim()}
                      onClick={() => handleSelectGoogleAccount(customGoogleName, customGoogleEmail)}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white disabled:opacity-50 transition-colors shadow-2xs"
                    >
                      {language === 'hi' ? 'साइन इन करें' : 'Sign in'}
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
