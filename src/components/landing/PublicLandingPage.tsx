import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import { TradeCategory } from '../../types';
import { TRADE_CONFIGS } from '../../core/theme/tradeConfigs';
import {
  HardHat,
  Wrench,
  Zap,
  Mic,
  Camera,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  FileSpreadsheet,
  ArrowRight,
  Code2,
  Globe,
  Smartphone,
  Cpu,
  Database,
  Flame,
} from 'lucide-react';


interface PublicLandingPageProps {
  onEnterApp: () => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({ onEnterApp }) => {
  const { trade, setTrade, language, setLanguage, t, tradeConfig } = useTheme();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white font-body">
      
      {/* Landing Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white font-heading">
                SiteSaathi
              </span>
              <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30">
                Portfolio Showcase
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>{language === 'hi' ? 'EN' : 'हिंदी'}</span>
            </button>

            <button
              onClick={onEnterApp}
              className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-lg flex items-center gap-1.5 transition-all btn-tactile glow-theme"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <span>{language === 'hi' ? 'लाइव ऐप खोलें' : 'Launch Live App'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none"
          style={{ backgroundColor: tradeConfig.primaryColor }}
        ></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Built for Non-Tech-Savvy Contractors & Site Engineers</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white font-heading max-w-4xl mx-auto leading-[1.1]">
            Multi-Trade Site Management,{' '}
            <span
              className="bg-clip-text text-transparent bg-gradient-to-r"
              style={{
                backgroundImage: `linear-gradient(to right, ${tradeConfig.primaryColor}, #FBBF24)`,
              }}
            >
              Re-imagined.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage construction sites, tools, labour attendance, materials, machinery, and pending dues with 
            <strong className="text-slate-200"> voice-to-form auto-fill</strong> and <strong className="text-slate-200">photo OCR muster roll digitizer</strong>.
          </p>

          {/* Interactive Trade Theming Switcher */}
          <div className="pt-4 max-w-md mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              ⚡ Test Dynamic Trade Token Re-Theming:
            </span>
            <div className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-1 shadow-2xl">
              {(['construction', 'plumbing', 'electrical'] as TradeCategory[]).map((cat) => {
                const config = TRADE_CONFIGS[cat];
                const isSelected = trade === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setTrade(cat)}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat === 'construction' && <HardHat className="w-3.5 h-3.5 text-orange-500" />}
                    {cat === 'plumbing' && <Wrench className="w-3.5 h-3.5 text-sky-500" />}
                    {cat === 'electrical' && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                    <span className="capitalize">{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="px-8 py-4 rounded-2xl text-sm font-black text-white shadow-2xl flex items-center gap-2 transition-all btn-tactile glow-theme"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <span>Explore Live App Prototype</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Differentiator Highlights Grid */}
      <section className="py-16 bg-slate-900/60 border-y border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white font-heading">
              Four Critical Architectural Differentiators
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Engineered specifically around real-world Indian contractor pain points.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Feature 1: Voice to Form */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow"
                style={{ backgroundColor: tradeConfig.primaryColor }}
              >
                <Mic className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white font-heading">
                1. Bilingual Voice-to-Form Auto-Fill (Hindi / English)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Site managers speak naturally in Hindi or English (e.g. <em>"साइट का नाम शर्मा विला, बजट 8 लाख"</em>). Speech is parsed via NLU rule engines directly into structured site records with editable confirmation.
              </p>
            </div>

            {/* Feature 2: Photo OCR */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow">
                <Camera className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white font-heading">
                2. Handwritten Labour Register Photo OCR
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Take a photograph of a paper diary muster sheet. Tesseract OCR pre-processes the image, extracts worker rows, roles, and wages into an interactive split review table with 1-tap edits.
              </p>
            </div>

            {/* Feature 3: Persistent Completed Site Dues */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white font-heading">
                3. Persistent Dues Tracker (Independent Status Model)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                A site can be physically "Completed" while bills remain unpaid for months. SiteSaathi decouples Work Status from Payment Status, ensuring supplier udhaar and rental bills never disappear after job completion.
              </p>
            </div>

            {/* Feature 4: Local-First & 100% Offline */}
            <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white font-heading">
                4. Local-First Offline Resilience (Dexie.js IndexedDB)
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Job sites often have zero mobile network. All data, tool tracking, and labour muster rolls operate 100% offline in IndexedDB with automated PDF export for accountants.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Tech Stack Summary */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-white font-heading">
            Architecture & Tech Stack
          </h2>
          <p className="text-xs text-slate-400">
            Portfolio-grade clean React + TypeScript + PWA codebase
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="font-extrabold text-sm text-white block">React 19 + TypeScript</span>
            <span className="text-[11px] text-slate-400">Vite Bundler</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="font-extrabold text-sm text-white block">IndexedDB (Dexie.js)</span>
            <span className="text-[11px] text-slate-400">Offline Local-First DB</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="font-extrabold text-sm text-white block">Tesseract.js OCR</span>
            <span className="text-[11px] text-slate-400">Client-Side Canvas OCR</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="font-extrabold text-sm text-white block">Web Speech API</span>
            <span className="text-[11px] text-slate-400">Hindi/English Voice Parsing</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>SiteSaathi — Multi-Contractor Site Management Web Application</p>
        <p className="mt-1">Portfolio & Resume Showcase Project</p>
      </footer>

    </div>
  );
};
