import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, ToolRecord, MaterialRecord, LabourRecord, MachineryRecord, ExpenseDue, ClientPayment } from '../../types';
import { db } from '../../core/db/database';
import { toDisplayDate, formatAuditTimestamp } from '../../utils/dateUtils';
import {
  exportSiteReportPdf,
  exportClientReceiptsPdf,
  exportIndividualReceiptPdf,
  exportSiteToolsPdf,
  exportSiteTotalAttendancePdf,
  exportSiteMaterialsPdf,
  exportSiteMachineryPdf,
  exportSiteDuesPdf,
} from '../../utils/reportExporter';
import {
  Building2,
  MapPin,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Wrench,
  Package,
  Users,
  Truck,
  Receipt,
  X,
  Plus,
  Edit2,
  Trash2,
  Warehouse,
  ShoppingBag,
  Eye,
  HandCoins,
  CreditCard,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { LabourDateDetailModal } from '../labour/LabourDateDetailModal';
import { RecordClientPaymentModal } from './RecordClientPaymentModal';

interface SiteDetailsModalProps {
  site: Site | null;
  onClose: () => void;
  onOpenAddTool: (siteId: string) => void;
  onOpenAddMaterial: (siteId: string) => void;
  onOpenAddLabour: (siteId: string) => void;
  onOpenAddMachinery: (siteId: string) => void;
  onOpenAddDue: (siteId: string) => void;
  onEditSite?: (site: Site) => void;
  onDeleteSite?: (site: Site) => void;
  onEditTool?: (tool: ToolRecord) => void;
  onDeleteTool?: (tool: ToolRecord) => void;
  onEditMaterial?: (material: MaterialRecord) => void;
  onDeleteMaterial?: (material: MaterialRecord) => void;
  onEditMachinery?: (machinery: MachineryRecord) => void;
  onDeleteMachinery?: (machinery: MachineryRecord) => void;
  onEditDue?: (due: ExpenseDue) => void;
  onDeleteDue?: (due: ExpenseDue) => void;
  onEditLabour?: (labour: LabourRecord) => void;
  onDeleteLabour?: (labour: LabourRecord) => void;
}

export const SiteDetailsModal: React.FC<SiteDetailsModalProps> = ({
  site,
  onClose,
  onOpenAddTool,
  onOpenAddMaterial,
  onOpenAddLabour,
  onOpenAddMachinery,
  onOpenAddDue,
  onEditSite,
  onDeleteSite,
  onEditTool,
  onDeleteTool,
  onEditMaterial,
  onDeleteMaterial,
  onEditMachinery,
  onDeleteMachinery,
  onEditDue,
  onDeleteDue,
  onEditLabour,
  onDeleteLabour,
}) => {
  const { t, language, tradeConfig } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'client_payments' | 'tools' | 'labour' | 'materials' | 'machinery' | 'dues'>('overview');
  const [selectedRecordForDetail, setSelectedRecordForDetail] = useState<LabourRecord | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  const account = useLiveQuery(() => db.account.toCollection().first());

  const siteId = site?.id;

  // Single shared source of truth via reactive Dexie live queries
  const liveSite = useLiveQuery(
    () => (siteId ? db.sites.get(siteId) : undefined),
    [siteId]
  );
  const currentSite = liveSite ?? site;

  const finance = useLiveQuery(
    () => (siteId ? db.getSiteFinanceSummary(siteId) : null),
    [siteId]
  );

  const clientPayments = useLiveQuery(
    () => (siteId ? db.clientPayments.where('siteId').equals(siteId).toArray() : []),
    [siteId]
  ) || [];

  const sortedClientPayments = [...clientPayments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  const tools = useLiveQuery(
    () => (siteId ? db.tools.where('siteId').equals(siteId).toArray() : []),
    [siteId]
  ) || [];

  const materials = useLiveQuery(
    () => (siteId ? db.materials.where('siteId').equals(siteId).toArray() : []),
    [siteId]
  ) || [];

  const labourRecords = useLiveQuery(
    () => (siteId ? db.labourRecords.where('siteId').equals(siteId).toArray() : []),
    [siteId]
  ) || [];

  const machinery = useLiveQuery(
    () => (siteId ? db.machinery.where('siteId').equals(siteId).toArray() : []),
    [siteId]
  ) || [];

  const dues = useLiveQuery(
    () => (siteId ? db.dues.where('siteId').equals(siteId).toArray() : []),
    [siteId]
  ) || [];

  if (!currentSite) return null;

  const handleDeleteClientPayment = async (paymentId: string) => {
    if (window.confirm(language === 'hi' ? 'क्या आप इस पेमेंट रसीद को हटाना चाहते हैं?' : 'Are you sure you want to delete this payment record?')) {
      await db.deleteClientPayment(paymentId, currentSite.id);
    }
  };

  const handleUpdateWorkStatus = async (status: Site['workStatus']) => {
    await db.sites.update(currentSite.id, {
      workStatus: status,
      completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
    });
  };

  const handleUpdatePaymentStatus = async (status: Site['paymentStatus']) => {
    await db.sites.update(currentSite.id, { paymentStatus: status });
  };

  const handleReturnTool = async (toolId: string) => {
    await db.tools.update(toolId, {
      actualReturnDate: new Date().toISOString().split('T')[0],
      status: 'returned',
    });
  };

  const handleSettleDue = async (dueId: string, amount: number) => {
    await db.dues.update(dueId, {
      amountPaid: amount,
      status: 'paid',
    });
  };

  const handleDownloadPdf = () => {
    exportSiteReportPdf(currentSite, finance, tools, materials, dues, sortedClientPayments, account?.companyName);
  };

  const handleDownloadClientReceiptsPdf = () => {
    exportClientReceiptsPdf(currentSite, sortedClientPayments, finance, account?.companyName);
  };

  const handleDownloadToolsPdf = () => {
    exportSiteToolsPdf(currentSite, tools, account?.companyName);
  };

  const handleDownloadLabourPdf = () => {
    exportSiteTotalAttendancePdf(currentSite, labourRecords, account?.companyName);
  };

  const handleDownloadMaterialsPdf = () => {
    exportSiteMaterialsPdf(currentSite, materials, finance, account?.companyName);
  };

  const handleDownloadMachineryPdf = () => {
    exportSiteMachineryPdf(currentSite, machinery, finance, account?.companyName);
  };

  const handleDownloadDuesPdf = () => {
    exportSiteDuesPdf(currentSite, dues, finance, account?.companyName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Separate Backdrop Layer */}
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* Interactive Sharp Dialog Container */}
      <div className="relative z-10 bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[94vh] animate-fade-in">
        
        {/* Header Banner */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {currentSite.siteType}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {currentSite.location}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-heading">
              {currentSite.name}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {onEditSite && (
              <button
                onClick={() => onEditSite(currentSite)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                title="Edit Site Details"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {onDeleteSite && (
              <button
                onClick={() => onDeleteSite(currentSite)}
                className="p-2 rounded-xl text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 hover:bg-red-100"
                title="Delete Site"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleDownloadPdf}
              className="px-3 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 btn-tactile"
              style={{ backgroundColor: tradeConfig.primaryColor }}
              title="Download Project PDF Statement"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('exportPdf')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dual Independent Status Bar */}
        <div className="px-5 py-3 bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Work Status Toggle */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {language === 'hi' ? 'काम की स्थिति:' : 'Work Status:'}
            </span>
            <select
              value={currentSite.workStatus}
              onChange={(e) => handleUpdateWorkStatus(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg font-bold text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="planning">{language === 'hi' ? 'योजनागत' : 'Planning'}</option>
              <option value="ongoing">{language === 'hi' ? 'चालू काम' : 'Ongoing'}</option>
              <option value="completed">{language === 'hi' ? 'पूर्ण काम' : 'Completed'}</option>
              <option value="on_hold">{language === 'hi' ? 'रुका हुआ' : 'On Hold'}</option>
            </select>
          </div>

          {/* Payment Status Toggle (Independent!) */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600 dark:text-slate-400">
              {language === 'hi' ? 'भुगतान स्थिति:' : 'Client Payment:'}
            </span>
            <select
              value={currentSite.paymentStatus}
              onChange={(e) => handleUpdatePaymentStatus(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg font-bold text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              <option value="unpaid">{language === 'hi' ? 'पूरा बकाया' : 'Unpaid'}</option>
              <option value="partially_paid">{language === 'hi' ? 'आंशिक भुगतान' : 'Partially Paid'}</option>
              <option value="paid">{language === 'hi' ? 'पूर्ण चुकता' : 'Fully Paid'}</option>
            </select>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="px-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar py-2 bg-white dark:bg-slate-900">
          {[
            { id: 'overview', label: language === 'hi' ? 'ओवरव्यू व बचत' : 'Overview & P&L', icon: IndianRupee },
            { id: 'client_payments', label: `${language === 'hi' ? 'क्लाइंट पेमेंट' : 'Client Receipts'} (${clientPayments.length})`, icon: HandCoins },
            { id: 'tools', label: `${t('navTools')} (${tools.length})`, icon: Wrench },
            { id: 'labour', label: `${t('navLabour')} (${labourRecords.length})`, icon: Users },
            { id: 'materials', label: `${t('navMaterials')} (${materials.length})`, icon: Package },
            { id: 'machinery', label: `${t('navMachinery')} (${machinery.length})`, icon: Truck },
            { id: 'dues', label: `${t('navDues')} (${dues.length})`, icon: Receipt },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap btn-tactile ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          
          {/* OVERVIEW SUB-TAB */}
          {activeSubTab === 'overview' && (
            <div className="space-y-5">
              
              {/* Financial Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                    {t('totalBudget')}
                  </span>
                  <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 block">
                    ₹{(currentSite.estimatedBudget || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400 block">
                    {t('totalExpenses')}
                  </span>
                  <span className="text-base sm:text-lg font-black text-red-700 dark:text-red-300 mt-1 block">
                    ₹{(finance?.totalExpense || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
                    {t('netProfit')}
                  </span>
                  <span className="text-base sm:text-lg font-black text-emerald-700 dark:text-emerald-300 mt-1 block">
                    ₹{(finance?.estimatedProfit || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600">
                    ({finance?.profitMarginPercent || 0}% margin)
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">
                    {t('pendingDuesTotal')}
                  </span>
                  <span className="text-base sm:text-lg font-black text-amber-800 dark:text-amber-300 mt-1 block">
                    ₹{(finance?.unpaidDues || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Client Contract & Payment Progress Section */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <HandCoins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>{language === 'hi' ? 'क्लाइंट अनुबंध व प्राप्त भुगतान' : 'Client Contract & Payments Received'}</span>
                    </span>
                    {(currentSite.clientName || currentSite.clientPhone) && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        {currentSite.clientName && <span className="font-semibold">{currentSite.clientName}</span>}
                        {currentSite.clientPhone && (
                          <span className="text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {currentSite.clientPhone}
                          </span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsRecordPaymentOpen(true)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs flex items-center gap-1 btn-tactile"
                      style={{ backgroundColor: tradeConfig.primaryColor }}
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{language === 'hi' ? 'पेमेंट दर्ज करें' : 'Record Payment'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('client_payments')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 flex items-center gap-1"
                    >
                      <span>{language === 'hi' ? 'विवरण' : 'History'} ({clientPayments.length})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contract Financial Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 text-[10px] block">
                      {language === 'hi' ? 'कुल अनुबंध बजट' : 'Total Contract'}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₹{(currentSite.estimatedBudget || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 text-[10px] block">
                      {language === 'hi' ? 'क्लाइंट से प्राप्त' : 'Received So Far'}
                    </span>
                    <span className="font-black text-emerald-700 dark:text-emerald-400">
                      ₹{(finance?.totalClientReceived || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 text-[10px] block">
                      {language === 'hi' ? 'बाकी लेना' : 'Client Due'}
                    </span>
                    <span className={`font-black ${(finance?.clientBalanceDue || 0) > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-600'}`}>
                      ₹{(finance?.clientBalanceDue ?? currentSite.estimatedBudget).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    <span>
                      {finance?.clientPaymentProgress || 0}% {language === 'hi' ? 'भुगतान प्राप्त' : 'collected'}
                    </span>
                    <span>
                      {currentSite.paymentStatus === 'paid' ? 'Fully Settled' : currentSite.paymentStatus === 'partially_paid' ? 'Partially Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all bg-emerald-500"
                      style={{ width: `${finance?.clientPaymentProgress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Expense Breakdown Categories */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  {t('siteBudgetVsExpense')}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Materials Logged</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{(finance?.materialCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Labour Wages</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{(finance?.labourCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Tool Rent</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{(finance?.toolsCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Machinery & Fuel</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹{(finance?.machineryCost || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {currentSite.notes && (
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-300">
                  <span className="font-bold block mb-0.5">📝 Notes / Instructions:</span>
                  <p>{currentSite.notes}</p>
                </div>
              )}

              {/* Audit Timestamps Card */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {language === 'hi' ? 'शुरू होने की तारीख' : 'Start Date'}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {toDisplayDate(currentSite.startDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-500" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {language === 'hi' ? 'साइट बनाई गई' : 'Created On'}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {formatAuditTimestamp(currentSite.createdAt, language) || toDisplayDate(currentSite.startDate)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">
                      {language === 'hi' ? 'अंतिम संपादन (Last Edited)' : 'Last Edited'}
                    </span>
                    <span className="font-bold text-amber-700 dark:text-amber-300">
                      {formatAuditTimestamp(currentSite.updatedAt || currentSite.createdAt, language) || 'Recently'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CLIENT PAYMENTS SUB-TAB */}
          {activeSubTab === 'client_payments' && (
            <div className="space-y-4">
              {/* Header Banner & Stats */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                      {language === 'hi'
                        ? `क्लाइंट से मिली कुल पेमेंट (${clientPayments.length})`
                        : `Client Payments Received (${clientPayments.length})`}
                    </span>
                    {currentSite.clientName && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        • {currentSite.clientName}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <div>
                      <span className="text-slate-500 text-[10px] block">
                        {language === 'hi' ? 'कुल अनुबंध' : 'Total Contract'}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₹{(currentSite.estimatedBudget || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">
                        {language === 'hi' ? 'प्राप्त राशि' : 'Total Received'}
                      </span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400">
                        ₹{(finance?.totalClientReceived || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">
                        {language === 'hi' ? 'बाकी लेना' : 'Balance Receivable'}
                      </span>
                      <span className={`font-black ${(finance?.clientBalanceDue || 0) > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-600'}`}>
                        ₹{(finance?.clientBalanceDue ?? currentSite.estimatedBudget).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadClientReceiptsPdf}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-50 dark:hover:bg-slate-700/60 shadow-xs flex items-center gap-1.5 btn-tactile"
                    title={language === 'hi' ? 'क्लाइंट पेमेंट रसीद PDF डाउनलोड करें' : 'Download Client Receipts Statement PDF'}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'hi' ? 'रसीद PDF' : 'Receipts PDF'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRecordPaymentOpen(true)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1.5 btn-tactile"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>{language === 'hi' ? 'पेमेंट दर्ज करें' : 'Record Client Payment'}</span>
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">
                    {language === 'hi' ? 'अनुबंध भुगतान स्थिति' : 'Contract Collection Progress'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {finance?.clientPaymentProgress || 0}% ({language === 'hi' ? 'प्राप्त' : 'Collected'})
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-emerald-500"
                    style={{ width: `${finance?.clientPaymentProgress || 0}%` }}
                  />
                </div>
              </div>

              {/* Payment Records Timeline */}
              {sortedClientPayments.length > 0 ? (
                <div className="space-y-2.5">
                  {sortedClientPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {payment.notes || (language === 'hi' ? 'क्लाइंट भुगतान' : 'Milestone Payment')}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {payment.paymentMode}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                          {payment.payerName && (
                            <span>
                              {language === 'hi' ? 'द्वारा:' : 'From:'} <span className="font-semibold text-slate-700 dark:text-slate-200">{payment.payerName}</span>
                            </span>
                          )}
                          {payment.referenceNo && (
                            <span className="text-slate-400">
                              Ref: {payment.referenceNo}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700/60">
                        <div className="text-left sm:text-right">
                          <span className="font-black text-base text-emerald-600 dark:text-emerald-400 block">
                            + ₹{payment.amount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {language === 'hi' ? 'जमा हुआ' : 'Received in Account'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => exportIndividualReceiptPdf(currentSite, payment, account?.companyName)}
                            className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title={language === 'hi' ? 'रसीद वाउचर PDF डाउनलोड करें' : 'Download Receipt Voucher PDF'}
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClientPayment(payment.id)}
                            className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Delete Payment Entry"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-50/70 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 p-6 space-y-3">
                  <HandCoins className="w-12 h-12 mx-auto text-slate-400" />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                      {language === 'hi' ? 'इस साइट के लिए कोई क्लाइंट पेमेंट दर्ज नहीं है' : 'No client payments recorded yet'}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      {language === 'hi'
                        ? 'साइट के ठेकेदार या क्लाइंट से मिले एडवांस, माइलस्टोन या रनिंग बिल की पेमेंट को दर्ज करें।'
                        : 'Record advance deposits, milestone payments, or running bill receipts from the client who awarded this contract.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsRecordPaymentOpen(true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm inline-flex items-center gap-1.5 btn-tactile"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>{language === 'hi' ? 'पहली पेमेंट दर्ज करें' : 'Record First Payment'}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TOOLS SUB-TAB */}
          {/* TOOLS SUB-TAB */}
          {activeSubTab === 'tools' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {language === 'hi'
                      ? `इस साइट पर ${tools.length} औजार दर्ज हैं`
                      : `${tools.length} Tools Tracked on this Site`}
                  </span>
                  <p className="text-[11px] text-slate-500">
                    {language === 'hi'
                      ? 'गोदाम से भेजे गए या साइट के लिए खरीदे गए उपकरण'
                      : 'Self-owned warehouse equipment and tools purchased for this site'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenAddTool(currentSite.id)}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl text-white shadow-md flex items-center justify-center transition-all btn-tactile glow-theme hover:scale-105 active:scale-95 cursor-pointer"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                    title={language === 'hi' ? 'औजार जोड़ें' : 'Add Tool'}
                    aria-label={language === 'hi' ? 'औजार जोड़ें' : 'Add Tool'}
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  </button>
                </div>
              </div>

              {tools.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
                      {language === 'hi' ? 'इस साइट पर अभी कोई औजार दर्ज नहीं है' : 'No tools logged for this site yet'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      {language === 'hi'
                        ? 'गोदाम से भेजा गया औजार या इस साइट के लिए खरीदा गया टूल जोड़ने के लिए नीचे दिए बटन पर टैप करें।'
                        : 'Log self-owned equipment dispatched from godown or new tools purchased for ongoing site work.'}
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenAddTool(currentSite.id)}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-md inline-flex items-center gap-1.5 transition-all btn-tactile"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'hi' ? 'पहला औजार जोड़ें' : 'Add First Tool'}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {tools.map((tool) => {
                    const isPurchased = tool.sourceType === 'purchased_for_site';
                    const price = tool.purchasePrice || (isPurchased ? tool.rentOrRepairCost : 0) || 0;
                    const isOverdue =
                      (tool.status === 'overdue' || (!tool.actualReturnDate && new Date(tool.expectedReturnDate) < new Date())) &&
                      !tool.actualReturnDate;

                    return (
                      <div
                        key={tool.id}
                        className={`p-4 rounded-2xl bg-white dark:bg-slate-800 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                          isOverdue
                            ? 'border-red-300 dark:border-red-900/80 bg-red-50/20 dark:bg-red-950/20'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 dark:text-white text-sm font-heading">
                              {tool.name}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                              {tool.quantity} {tool.size ? `• ${tool.size}` : (language === 'hi' ? 'नग' : 'qty')}
                            </span>

                            {/* Source Type Badge */}
                            {isPurchased ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                                <ShoppingBag className="w-3 h-3" />
                                {language === 'hi' ? `खरीद: ₹${price}` : `Bought: ₹${price}`}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                <Warehouse className="w-3 h-3" />
                                {language === 'hi' ? 'खुद का औजार' : 'Self-Owned'}
                              </span>
                            )}

                            {/* Overdue Badge */}
                            {isOverdue && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 animate-pulse">
                                {language === 'hi' ? 'वापसी में देरी' : 'Overdue!'}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                            <span>
                              {isPurchased ? (language === 'hi' ? 'खरीद तारीख: ' : 'Purchased: ') : (language === 'hi' ? 'भेजा: ' : 'Sent: ')}
                              <strong className="text-slate-700 dark:text-slate-300">{tool.dateSent}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              {language === 'hi' ? 'गोदाम वापसी तारीख: ' : 'Expected Return: '}
                              <strong className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                                {tool.expectedReturnDate}
                              </strong>
                            </span>
                          </div>

                          {tool.notes && (
                            <p className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">
                              "{tool.notes}"
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {onEditTool && (
                            <button
                              onClick={() => onEditTool(tool)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              title={language === 'hi' ? 'औजार बदलें' : 'Edit Tool'}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {onDeleteTool && (
                            <button
                              onClick={() => onDeleteTool(tool)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                              title={language === 'hi' ? 'हटाएं' : 'Delete Tool'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {tool.actualReturnDate ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 text-[11px] bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {language === 'hi' ? `गोदाम में वापस (${tool.actualReturnDate})` : `Returned (${tool.actualReturnDate})`}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleReturnTool(tool.id)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm btn-tactile"
                            >
                              {language === 'hi' ? 'गोदाम वापसी दर्ज करें' : 'Mark Returned'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* LABOUR SUB-TAB */}
          {activeSubTab === 'labour' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {labourRecords.length} Attendance Sheets
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadLabourPdf}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs flex items-center gap-1.5 btn-tactile"
                    title={language === 'hi' ? 'साइट हाजिरी समरी PDF डाउनलोड करें' : 'Download Site Labour Muster PDF'}
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{language === 'hi' ? 'हाजिरी PDF' : 'Labour PDF'}</span>
                  </button>

                  <button
                    onClick={() => onOpenAddLabour(currentSite.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1 btn-tactile"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log Attendance</span>
                  </button>
                </div>
              </div>

              {labourRecords.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Users className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {language === 'hi' ? 'इस साइट पर कोई हाजिरी दर्ज नहीं है' : 'No labour attendance logged for this site yet'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {labourRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                          Date: {rec.date} ({rec.totalWorkers} Workers)
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedRecordForDetail(rec)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                          title="View Details & Payment Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">
                            Total: ₹{rec.totalDailyWage.toLocaleString('en-IN')}
                          </span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Paid: ₹{(rec.totalPaid || 0).toLocaleString('en-IN')}
                          </span>
                          {Math.max(0, (rec.totalDailyWage || 0) - (rec.totalPaid || 0)) > 0 && (
                            <span className="font-semibold text-rose-600 dark:text-rose-400">
                              Due: ₹{(Math.max(0, (rec.totalDailyWage || 0) - (rec.totalPaid || 0))).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        {onEditLabour && (
                          <button
                            onClick={() => onEditLabour(rec)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                            title="Edit Labour Sheet"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteLabour && (
                          <button
                            onClick={() => onDeleteLabour(rec)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Delete Labour Sheet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {(rec.entries || []).map((e) => {
                        const earned = e.attendanceStatus === 'half_day'
                          ? Math.round((e.dailyWage || 0) * 0.5)
                          : e.attendanceStatus === 'absent'
                          ? 0
                          : (e.dailyWage || 0);
                        const paid = e.paidAmount !== undefined ? e.paidAmount : (e.attendanceStatus === 'absent' ? 0 : earned);
                        const due = e.balanceDue !== undefined ? e.balanceDue : Math.max(0, earned - paid);

                        return (
                          <div
                            key={e.id}
                            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block truncate text-xs">
                                {e.workerName}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <span>{e.role}</span>
                                <span>•</span>
                                <span className={`font-semibold ${
                                  e.attendanceStatus === 'absent'
                                    ? 'text-red-500'
                                    : e.attendanceStatus === 'half_day'
                                    ? 'text-amber-500'
                                    : 'text-green-500'
                                }`}>
                                  {e.attendanceStatus === 'absent'
                                    ? 'Absent'
                                    : e.attendanceStatus === 'half_day'
                                    ? 'Half Day'
                                    : 'Full Day'}
                                </span>
                              </div>
                            </div>

                            <div className="text-right shrink-0 space-y-0.5">
                              <div className="text-xs font-black text-slate-900 dark:text-white">
                                Total: ₹{earned}
                              </div>
                              <div className="flex items-center gap-1 text-[10px]">
                                <span className="px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                  Paid: ₹{paid}
                                </span>
                                <span className={`px-1.5 py-0.5 rounded font-bold ${
                                  due > 0
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                                }`}>
                                  Due: ₹{due}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          )}

          {/* MATERIALS SUB-TAB */}
          {activeSubTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {materials.length} Material Entries
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadMaterialsPdf}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs flex items-center gap-1.5 btn-tactile"
                    title={language === 'hi' ? 'सामग्री खर्च PDF डाउनलोड करें' : 'Download Materials Statement PDF'}
                  >
                    <FileText className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    <span>{language === 'hi' ? 'सामग्री PDF' : 'Materials PDF'}</span>
                  </button>

                  <button
                    onClick={() => onOpenAddMaterial(currentSite.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1 btn-tactile"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Material</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                        {mat.itemName}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Qty: {mat.quantity} {mat.unit} @ ₹{mat.unitPrice} | Date: {mat.purchaseDate}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-black text-sm text-slate-900 dark:text-white block">
                          ₹{mat.totalCost.toLocaleString('en-IN')}
                        </span>
                        <span className={`text-[10px] font-bold ${mat.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
                          {mat.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                      {onEditMaterial && (
                        <button
                          onClick={() => onEditMaterial(mat)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteMaterial && (
                        <button
                          onClick={() => onDeleteMaterial(mat)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MACHINERY SUB-TAB */}
          {activeSubTab === 'machinery' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {machinery.length} Machinery Logs
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadMachineryPdf}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs flex items-center gap-1.5 btn-tactile"
                    title={language === 'hi' ? 'मशीनरी व डीजल PDF डाउनलोड करें' : 'Download Machinery & Fuel PDF'}
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>{language === 'hi' ? 'मशीनरी PDF' : 'Machinery PDF'}</span>
                  </button>

                  <button
                    onClick={() => onOpenAddMachinery(currentSite.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1 btn-tactile"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Machinery</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {machinery.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                        {m.machineType}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Fuel: {m.fuelLitres || 0}L (₹{m.fuelCost || 0}) | Rent: ₹{m.rentalCost || 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-black text-sm text-slate-900 dark:text-white">
                        ₹{m.totalCost.toLocaleString('en-IN')}
                      </span>
                      {onEditMachinery && (
                        <button
                          onClick={() => onEditMachinery(m)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteMachinery && (
                        <button
                          onClick={() => onDeleteMachinery(m)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DUES SUB-TAB */}
          {activeSubTab === 'dues' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {dues.length} Payables & Dues
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadDuesPdf}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs flex items-center gap-1.5 btn-tactile"
                    title={language === 'hi' ? 'बकाया बिल PDF डाउनलोड करें' : 'Download Pending Dues PDF'}
                  >
                    <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                    <span>{language === 'hi' ? 'बकाया PDF' : 'Dues PDF'}</span>
                  </button>

                  <button
                    onClick={() => onOpenAddDue(currentSite.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1 btn-tactile"
                    style={{ backgroundColor: tradeConfig.primaryColor }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Due</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {dues.map((due) => (
                  <div
                    key={due.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block">
                        {due.title}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Due Date: {due.dueDate} | Category: {due.category.toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="font-black text-sm text-red-600 block">
                          ₹{(due.amountDue - (due.amountPaid || 0)).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Total: ₹{due.amountDue}
                        </span>
                      </div>

                      {due.status !== 'paid' && (
                        <button
                          onClick={() => handleSettleDue(due.id, due.amountDue)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-green-600 text-white hover:bg-green-700"
                        >
                          Settle
                        </button>
                      )}

                      {onEditDue && (
                        <button
                          onClick={() => onEditDue(due)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDeleteDue && (
                        <button
                          onClick={() => onDeleteDue(due)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Labour Date Detail Modal for individual worker payment breakdown */}
      <LabourDateDetailModal
        isOpen={!!selectedRecordForDetail}
        onClose={() => setSelectedRecordForDetail(null)}
        record={selectedRecordForDetail}
        siteName={currentSite.name}
        companyName={account?.companyName}
        onEditLabour={onEditLabour}
        onDeleteLabour={onDeleteLabour}
      />

      {/* Record Client Payment Modal */}
      <RecordClientPaymentModal
        site={currentSite}
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        onPaymentRecorded={() => {
          setIsRecordPaymentOpen(false);
        }}
        clientBalanceDue={finance?.clientBalanceDue ?? currentSite.estimatedBudget}
      />
    </div>
  );
};
