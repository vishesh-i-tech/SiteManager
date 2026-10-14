import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, ThemeMode, TradeCategory } from '../../types';
import { TRADE_CONFIGS } from './tradeConfigs';
import { translations, TranslationKey } from '../i18n/translations';

interface ThemeContextType {
  trade: TradeCategory;
  setTrade: (trade: TradeCategory) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  tradeConfig: typeof TRADE_CONFIGS['construction'];
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trade, setTradeState] = useState<TradeCategory>(() => {
    return (localStorage.getItem('sitesaathi_trade') as TradeCategory) || 'construction';
  });

  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('sitesaathi_theme') as ThemeMode) || 'light';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('sitesaathi_lang') as Language) || 'hi';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const setTrade = (newTrade: TradeCategory) => {
    setTradeState(newTrade);
    localStorage.setItem('sitesaathi_trade', newTrade);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem('sitesaathi_theme', mode);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sitesaathi_lang', lang);
  };

  // Sync DOM with trade and dark mode
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-trade', trade);

    const updateDarkMode = () => {
      let isDark = false;
      if (themeMode === 'dark') {
        isDark = true;
      } else if (themeMode === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      setIsDarkMode(isDark);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    updateDarkMode();

    if (themeMode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateDarkMode();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [trade, themeMode]);

  const t = (key: TranslationKey): string => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || (key as string);
  };

  const tradeConfig = TRADE_CONFIGS[trade] || TRADE_CONFIGS.construction;

  return (
    <ThemeContext.Provider
      value={{
        trade,
        setTrade,
        themeMode,
        setThemeMode,
        language,
        setLanguage,
        t,
        tradeConfig,
        isDarkMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
