import React from 'react';
import { useTheme } from '../../core/theme/ThemeContext';
import {
  Building2,
  Wrench,
  Users,
  Package,
  Truck,
  Receipt,
  Mic,
  Camera,
  X,
  Plus,
  Sparkles,
} from 'lucide-react';

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddSite: () => void;
  onOpenVoiceModal: () => void;
  onOpenOcrModal: () => void;
  onOpenAddLabour: () => void;
  onOpenAddTool: () => void;
  onOpenAddMaterial: () => void;
  onOpenAddMachinery: () => void;
  onOpenAddDue: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onOpenAddSite,
  onOpenVoiceModal,
  onOpenOcrModal,
  onOpenAddLabour,
  onOpenAddTool,
  onOpenAddMaterial,
  onOpenAddMachinery,
  onOpenAddDue,
}) => {
  const { t, language, tradeConfig } = useTheme();

  if (!isOpen) return null;

  const quickActions = [
    {
      title: language === 'hi' ? 'हाथ से हाजिरी व मजदूरी' : 'Manual Daily Attendance',
      subtitle: language === 'hi' ? 'दैनिक मजदूर नाम व हाजिरी भरें' : 'Log worker muster & daily wages',
      icon: Users,
      color: '#059669',
      isSpecial: true,
      onClick: () => {
        onClose();
        onOpenAddLabour();
      },
    },
    {
      title: language === 'hi' ? 'हाजिरी रजिस्टर फोटो OCR' : 'Photo OCR Register',
      subtitle: language === 'hi' ? 'डायरी की फोटो से लेबर हाजिरी बनाएं' : 'Scan handwritten attendance muster',
      icon: Camera,
      color: '#8B5CF6',
      isSpecial: true,
      onClick: () => {
        onClose();
        onOpenOcrModal();
      },
    },
    {
      title: language === 'hi' ? 'बोलकर साइट जोड़ें' : 'Voice Auto-Fill Site',
      subtitle: language === 'hi' ? 'माइक दबाकर हिंदी/इंग्लिश में बोलें' : 'Speak to create new site without typing',
      icon: Mic,
      color: tradeConfig.primaryColor,
      isSpecial: true,
      onClick: () => {
        onClose();
        onOpenVoiceModal();
      },
    },
    {
      title: t('addSite'),
      subtitle: language === 'hi' ? 'हाथ से नया प्रोजेक्ट दर्ज करें' : 'Manual new project entry',
      icon: Building2,
      color: '#F97316',
      onClick: () => {
        onClose();
        onOpenAddSite();
      },
    },
    {
      title: t('addTool'),
      subtitle: language === 'hi' ? 'साइट पर भेजा गया औजार दर्ज करें' : 'Dispatch shuttering/machinery',
      icon: Wrench,
      color: '#0284C7',
      onClick: () => {
        onClose();
        onOpenAddTool();
      },
    },
    {
      title: language === 'hi' ? 'सामान / मटेरियल' : 'Material Purchase',
      subtitle: language === 'hi' ? 'सीमेंट, स्टील, पाइप, प्लेट्स आदि' : 'Log supplies & vendor invoices',
      icon: Package,
      color: '#10B981',
      onClick: () => {
        onClose();
        onOpenAddMaterial();
      },
    },
    {
      title: language === 'hi' ? 'डीजल व मशीनरी' : 'Machinery & Fuel',
      subtitle: language === 'hi' ? 'मिक्सर, जेसीबी, डीजल खर्च' : 'Heavy equipment hours & fuel',
      icon: Truck,
      color: '#6366F1',
      onClick: () => {
        onClose();
        onOpenAddMachinery();
      },
    },
    {
      title: language === 'hi' ? 'बकाया बिल / उधारी' : 'Record Pending Due',
      subtitle: language === 'hi' ? 'दुकानदार उधारी व रेंट बाकी' : 'Vendor udhaar & unpaid bills',
      icon: Receipt,
      color: '#EF4444',
      onClick: () => {
        onClose();
        onOpenAddDue();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Interactive Sharp Dialog Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-slide-in">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: tradeConfig.primaryColor }}
            >
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="font-extrabold text-base text-slate-900 dark:text-white font-heading">
              {t('quickAdd')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all btn-tactile ${
                  action.isSpecial
                    ? 'border-orange-300 dark:border-orange-800/80 bg-orange-50/30 dark:bg-orange-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-800/50'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: action.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-1">
                    <span>{action.title}</span>
                    {action.isSpecial && <Sparkles className="w-3 h-3 text-orange-500" />}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                    {action.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
