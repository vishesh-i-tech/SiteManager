import React, { useState } from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { TradeCategory, Language, ContractorAccount } from '../../types';
import { TRADE_CONFIGS, ALL_TRADE_KEYS } from '../../core/theme/tradeConfigs';
import { db } from '../../core/db/database';
import {
  HardHat,
  Wrench,
  Zap,
  Globe,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  User,
  Phone,
  Building,
  Mail,
  LogIn,
  UserPlus,
  ChevronRight,
  ShieldCheck,
  Paintbrush,
  Hammer,
  Shield,
  Layers,
  Grid,
  Wind,
  Truck,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onAuthenticated: (account: ContractorAccount, isNewAccount: boolean) => void;
  existingAccounts: ContractorAccount[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onAuthenticated,
  existingAccounts,
}) => {
  const { trade, setTrade, language, setLanguage, t, tradeConfig } = useTheme();

  const userSavedAccounts = existingAccounts.filter(
    (acc) => !['contractor-1', 'contractor-2', 'contractor-3', 'contractor-demo'].includes(acc.id)
  );

  // Mode: 'register' | 'login'
  const [mode, setMode] = useState<'register' | 'login'>(
    userSavedAccounts.length > 0 ? 'login' : 'register'
  );

  // Register steps: 'language' | 'trade' | 'profile'
  const [regStep, setRegStep] = useState<'language' | 'trade' | 'profile'>('language');

  // Register form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login state
  const [loginPhone, setLoginPhone] = useState('');

  if (!isOpen) return null;

  const handleTradeSelect = (selectedTrade: TradeCategory) => {
    setTrade(selectedTrade);
    setRegStep('profile');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMsg(language === 'hi' ? 'कृपया नाम और मोबाइल नंबर भरें' : 'Please enter both name and mobile number');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg(language === 'hi' ? 'मोबाइल नंबर ठीक 10 अंकों का होना चाहिए' : 'Mobile number must be exactly 10 digits');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const newAccount: ContractorAccount = {
        id: `contractor-${Date.now()}`,
        name: name.trim(),
        phone: cleanPhone,
        companyName: companyName.trim() || undefined,
        email: email.trim() || undefined,
        trade,
        language,
        themeMode: 'light',
        tutorialCompleted: false,
        createdAt: new Date().toISOString(),
      };

      // Save to Dexie (completely fresh and empty of fake data!)
      await db.account.put(newAccount);
      localStorage.setItem('sitesaathi_active_user_id', newAccount.id);

      onAuthenticated(newAccount, true);
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMsg('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) return;

    setErrorMsg('');
    const matched = existingAccounts.find(
      (a) => a.phone.replace(/\D/g, '') === loginPhone.replace(/\D/g, '')
    );

    if (matched) {
      if (!matched.password && !matched.pinLock) {
        setErrorMsg(
          language === 'hi'
            ? 'यह खाता गैर-एन्क्रिप्टेड बैकअप से पुनर्स्थापित है और इसमें सुरक्षा क्रेडेंशियल नहीं हैं। कृपया एन्क्रिप्टेड बैकअप का उपयोग करें।'
            : 'This account lacks security credentials. Please restore from a passphrase-protected encrypted backup.'
        );
        return;
      }
      setTrade(matched.trade);
      setLanguage(matched.language);
      localStorage.setItem('sitesaathi_active_user_id', matched.id);
      onAuthenticated(matched, false);
    } else {
      setErrorMsg(
        language === 'hi'
          ? 'यह नंबर नहीं मिला। कृपया नया खाता बनाएं या नंबर जांचें।'
          : 'No account found with this phone number. Please register.'
      );
    }
  };

  const handleSelectExisting = (acc: ContractorAccount) => {
    if (!acc.password && !acc.pinLock) {
      setErrorMsg(
        language === 'hi'
          ? 'यह खाता गैर-एन्क्रिप्टेड बैकअप से पुनर्स्थापित है और इसमें सुरक्षा क्रेडेंशियल नहीं हैं।'
          : 'This account lacks credentials and cannot authenticate.'
      );
      return;
    }
    setTrade(acc.trade);
    setLanguage(acc.language);
    localStorage.setItem('sitesaathi_active_user_id', acc.id);
    onAuthenticated(acc, false);
  };

  const handleRecruiterQuickDemo = async () => {
    setIsSubmitting(true);
    try {
      await db.seedDemoData('contractor-demo');
      const demoAccount = await db.account.get('contractor-demo');
      if (demoAccount) {
        setTrade(demoAccount.trade);
        setLanguage(demoAccount.language);
        localStorage.setItem('sitesaathi_active_user_id', demoAccount.id);
        onAuthenticated(demoAccount, false);
      }
    } catch (err) {
      console.error('Recruiter demo error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" />

      {/* Interactive Sharp Dialog Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] animate-fade-in">
        
        {/* Modal Top Branding */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-slate-900 dark:text-white font-heading">
                SiteSaathi
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi' ? 'ठेकेदार लॉगिन व रजिस्ट्रेशन' : 'Contractor Sign In & Registration'}
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => {
                setMode('register');
                setRegStep('language');
                setErrorMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {language === 'hi' ? 'साइन अप' : 'Sign Up'}
            </button>
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {language === 'hi' ? 'साइन इन' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-5">
          
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs font-bold text-red-700 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {/* REGISTER FLOW */}
          {mode === 'register' && (
            <div>
              {/* Step 1: Language */}
              {regStep === 'language' && (
                <div className="space-y-5 text-center">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                      Select App Language / भाषा चुनें
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Choose your preferred interface language.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('hi');
                        setRegStep('trade');
                      }}
                      className="p-5 rounded-2xl border-2 border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 text-left btn-tactile"
                    >
                      <span className="text-2xl block mb-2 font-bold text-orange-600">हिंदी</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        हिंदी (सरल ठेकेदारी भाषा)
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        बोलकर फॉर्म भरें व आसान हाजिरी
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setLanguage('en');
                        setRegStep('trade');
                      }}
                      className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-800/40 text-left btn-tactile"
                    >
                      <span className="text-2xl block mb-2 font-bold text-blue-600">English</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        English (Clean & Direct)
                      </span>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        Standard site & contractor terminology
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Trade Selection */}
              {regStep === 'trade' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                      {t('selectCategoryTitle')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('selectCategorySubtitle')}
                    </p>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                    {ALL_TRADE_KEYS.map((cat) => {
                      const config = TRADE_CONFIGS[cat] || TRADE_CONFIGS.construction;
                      const getModalTradeIcon = (tradeId: TradeCategory) => {
                        switch (tradeId) {
                          case 'construction': return <HardHat className="w-5 h-5" />;
                          case 'plumbing': return <Wrench className="w-5 h-5" />;
                          case 'electrical': return <Zap className="w-5 h-5" />;
                          case 'painting': return <Paintbrush className="w-5 h-5" />;
                          case 'carpentry': return <Hammer className="w-5 h-5" />;
                          case 'fabrication': return <Shield className="w-5 h-5" />;
                          case 'flooring': return <Layers className="w-5 h-5" />;
                          case 'ceiling': return <Grid className="w-5 h-5" />;
                          case 'hvac': return <Wind className="w-5 h-5" />;
                          case 'interior': return <Sparkles className="w-5 h-5" />;
                          case 'infra': return <Truck className="w-5 h-5" />;
                          default: return <HardHat className="w-5 h-5" />;
                        }
                      };

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleTradeSelect(cat)}
                          className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-slate-800 text-left flex items-center justify-between group transition-all btn-tactile"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                              style={{ backgroundColor: config.primaryColor }}
                            >
                              {getModalTradeIcon(cat)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                                {language === 'hi' ? config.nameHi : config.nameEn}
                              </span>
                              <span className="text-xs text-slate-500 block truncate">
                                {language === 'hi' ? config.subtitleHi : config.subtitleEn}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Contractor Profile */}
              {regStep === 'profile' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="text-center">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                      {language === 'hi' ? 'ठेकेदार का विवरण भरें' : 'Create Contractor Profile'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'hi' ? 'आपका डेटा केवल आपके फोन में सुरक्षित रहेगा' : 'Local-first offline private storage'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-orange-500" />
                        <span>{t('yourName')} *</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-blue-500" />
                        <span>{t('yourPhone')} (10 digits) *</span>
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-purple-500" />
                        <span>{t('companyName')}</span>
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span>{language === 'hi' ? 'ईमेल / जीमेल' : 'Email / Gmail'}</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder=""
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || !phone.trim()}
                    className="w-full py-3 px-4 rounded-xl text-xs font-black text-white shadow-lg flex items-center justify-center gap-2 transition-all btn-tactile glow-theme disabled:opacity-50"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'hi' ? 'खाता बनाएं और शुरू करें' : 'Create Fresh Account & Start'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* LOGIN FLOW */}
          {mode === 'login' && (
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                  {language === 'hi' ? 'ठेकेदार लॉगिन' : 'Contractor Login'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'hi' ? 'अपना मोबाइल नंबर दर्ज करें या सहेजे गए खाते चुनें' : 'Enter mobile phone number or select saved profile'}
                </p>
              </div>

              {/* User-saved accounts list if any */}
              {userSavedAccounts.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    {language === 'hi' ? 'सहेजे गए खाते (Saved Profiles):' : 'Saved Accounts:'}
                  </span>
                  <div className="space-y-1.5">
                    {userSavedAccounts.map((acc) => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => handleSelectExisting(acc)}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-500 text-left flex items-center justify-between transition-all"
                      >
                        <div>
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white block">
                            {acc.name} {acc.companyName ? `(${acc.companyName})` : ''}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            📱 {acc.phone} • {acc.trade.toUpperCase()}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Login by phone number form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>{language === 'hi' ? 'पंजीकृत मोबाइल नंबर' : 'Registered Mobile Number'}</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder=""
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl text-xs font-black text-white shadow-md flex items-center justify-center gap-2 btn-tactile glow-theme"
                  style={{ backgroundColor: tradeConfig.primaryColor }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'hi' ? 'लॉगिन करें' : 'Log In'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Recruiter / Reviewer Quick Demo Launcher */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleRecruiterQuickDemo}
              disabled={isSubmitting}
              className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>
                {language === 'hi'
                  ? '⚡ रीक्रूटर / परीक्षक डेमो (नमूना डेटा लोड करें)'
                  : '⚡ Recruiter / Reviewer Demo (Explore with Sample Data)'}
              </span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
