import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { TradeCategory, Language, ContractorAccount } from '../../types';
import { TRADE_CONFIGS, ALL_TRADE_KEYS } from '../../core/theme/tradeConfigs';
import { db } from '../../core/db/database';
import { SiteSaathiLogo } from '../common/SiteSaathiLogo';
import {
  HardHat,
  Wrench,
  Zap,
  Globe,
  User,
  Phone,
  Building,
  Lock,
  LogIn,
  UserPlus,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Paintbrush,
  Hammer,
  Shield,
  Layers,
  Grid,
  Wind,
  Sparkles,
  Truck,
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

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>(
    existingAccounts.length > 0 ? 'login' : 'register'
  );

  // Register state
  const [selectedTrade, setSelectedTrade] = useState<TradeCategory>('construction');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया अपना नाम और मोबाइल नंबर दर्ज करें' : 'Please enter your name and phone number');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const cleanPhone = phone.trim().replace(/\D/g, '');
      const existing = await db.account.where('phone').equals(cleanPhone).first();
      if (existing) {
        setErrorMsg(
          language === 'hi'
            ? 'इस नंबर से खाता पहले से मौजूद है। कृपया लॉगिन करें।'
            : 'An account with this phone number already exists. Please log in.'
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
      setErrorMsg(language === 'hi' ? 'खाता बनाने में त्रुटि हुई। पुनः प्रयास करें।' : 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) return;

    setErrorMsg('');
    const cleanPhone = loginPhone.trim().replace(/\D/g, '');
    const allAccounts = await db.account.toArray();
    const matched = allAccounts.find((a) => a.phone.replace(/\D/g, '') === cleanPhone);

    if (matched) {
      if (matched.password && loginPassword && matched.password !== loginPassword.trim()) {
        setErrorMsg(language === 'hi' ? 'गलत पिन / पासवर्ड दर्ज किया गया।' : 'Incorrect PIN / password.');
        return;
      }
      localStorage.setItem('sitesaathi_active_user_id', matched.id);
      setTrade(matched.trade);
      setLanguage(matched.language);
      onAuthenticated(matched, false);
    } else {
      setErrorMsg(
        language === 'hi'
          ? 'यह नंबर नहीं मिला। कृपया नया खाता बनाएं या नंबर जांचें।'
          : 'No account found with this phone number. Please register.'
      );
    }
  };

  const handleQuickAccountSelect = (acc: ContractorAccount) => {
    localStorage.setItem('sitesaathi_active_user_id', acc.id);
    setTrade(acc.trade);
    setLanguage(acc.language);
    onAuthenticated(acc, false);
  };

  const getTradeIcon = (cat: TradeCategory) => {
    switch (cat) {
      case 'construction':
        return <HardHat className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'plumbing':
        return <Wrench className="w-5 h-5 text-sky-600 dark:text-sky-400" />;
      case 'electrical':
        return <Zap className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
      case 'painting':
        return <Paintbrush className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
      case 'carpentry':
        return <Hammer className="w-5 h-5 text-amber-700 dark:text-amber-500" />;
      case 'fabrication':
        return <Shield className="w-5 h-5 text-slate-600 dark:text-slate-400" />;
      case 'flooring':
        return <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />;
      case 'ceiling':
        return <Grid className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
      case 'hvac':
        return <Wind className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
      case 'interior':
        return <Sparkles className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
      case 'infra':
        return <Truck className="w-5 h-5 text-slate-700 dark:text-slate-300" />;
      default:
        return <HardHat className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Top Bar with Language Toggle */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <SiteSaathiLogo size="sm" />
          <span className="font-bold text-base text-slate-900 dark:text-white">SiteSaathi</span>
        </div>

        <button
          onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>{language === 'hi' ? 'English' : 'हिंदी'}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          
          {/* Card Header & Tab Switcher */}
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="text-center mb-5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-heading">
                {mode === 'login'
                  ? language === 'hi' ? 'ठेकेदार लॉगिन' : 'Contractor Sign In'
                  : language === 'hi' ? 'नया ठेकेदार खाता बनाएं' : 'Create Contractor Account'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {mode === 'login'
                  ? language === 'hi' ? 'अपने काम और साइट्स का हिसाब देखने के लिए लॉगिन करें' : 'Sign in to access your sites, muster roll, and dues ledger'
                  : language === 'hi' ? 'अपना काम चुनें और 100% ऑफलाइन रिकॉर्ड रखें' : 'Select your trade and start managing job sites'}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'साइन इन' : 'Sign In'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'साइन अप' : 'Sign Up'}</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{language === 'hi' ? 'मोबाइल नंबर' : 'Mobile Phone Number'}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{language === 'hi' ? 'सुरक्षा पिन / पासवर्ड (वैकल्पिक)' : 'PIN / Password (Optional)'}</span>
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••"
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'hi' ? 'लॉगिन करें' : 'Sign In'}</span>
                </button>

                {/* Quick 1-Click Demo Profiles */}
                {existingAccounts.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                      {language === 'hi' ? 'या सहेजे गए खाते से सीधे लॉगिन करें:' : 'Or login directly as:'}
                    </span>
                    <div className="space-y-1.5">
                      {existingAccounts.map((acc) => {
                        const tradeConf = TRADE_CONFIGS[acc.trade] || TRADE_CONFIGS.construction;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => handleQuickAccountSelect(acc)}
                            className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-left flex items-center justify-between transition-colors group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center">
                                {getTradeIcon(acc.trade)}
                              </div>
                              <div>
                                <span className="font-semibold text-xs text-slate-900 dark:text-white block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                  {acc.name}
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {language === 'hi' ? tradeConf.nameHi : tradeConf.nameEn} • {acc.phone}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </form>
            )}

            {/* REGISTER FORM */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} className="space-y-4">
                
                {/* Step 1: Profession / Trade Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {language === 'hi' ? '1. अपना मुख्य काम (ट्रेड) चुनें *' : '1. Select Your Trade / Profession *'}
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    {language === 'hi'
                      ? 'लॉगिन करने के बाद ऐप केवल आपके इसी काम के अनुसार खुलेगा।'
                      : 'Your account will be configured exclusively for this trade inside the app.'}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                    {ALL_TRADE_KEYS.map((cat) => {
                      const conf = TRADE_CONFIGS[cat] || TRADE_CONFIGS.construction;
                      const isSelected = selectedTrade === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedTrade(cat)}
                          className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between hover:-translate-y-0.5 active:scale-95 ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-600 shadow-sm'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 shadow-xs flex items-center justify-center">
                              {getTradeIcon(cat)}
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-xs text-slate-900 dark:text-white block line-clamp-1">
                              {language === 'hi' ? conf.nameHi.split(' ')[0] : conf.nameEn}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 line-clamp-1">
                              {language === 'hi' ? conf.subtitleHi : conf.subtitleEn}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Personal Profile Details */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {language === 'hi' ? '2. व्यक्तिगत विवरण' : '2. Personal Details'}
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'hi' ? 'ठेकेदार / कारीगर का नाम *' : 'Contractor / Master Name *'}
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={language === 'hi' ? 'रमेश शर्मा' : 'Rameshwar Sharma'}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Phone Number *'}
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'hi' ? 'दुकान / फर्म का नाम (वैकल्पिक)' : 'Firm / Business Name (Optional)'}
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder={language === 'hi' ? 'शर्मा कंस्ट्रक्शन एंड सप्लायर्स' : 'Sharma Construction & Suppliers'}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                      {language === 'hi' ? 'लॉगिन पिन / पासवर्ड (वैकल्पिक)' : 'Security PIN / Password (Optional)'}
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="1234"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim() || !phone.trim()}
                  className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {language === 'hi' ? 'खाता बनाएं और डैशबोर्ड खोलें' : 'Create Account & Enter Dashboard'}
                  </span>
                </button>
              </form>
            )}

          </div>
        </div>

        {/* Footer info */}
        <p className="mt-4 text-center text-xs text-slate-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>
            {language === 'hi' ? '100% सुरक्षित • आपका डेटा आपके फोन में सुरक्षित है' : '100% Private • Local-First Offline Database'}
          </span>
        </p>
      </div>
    </div>
  );
};
