import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTheme } from '../../core/theme/ThemeContext';
import { Site, ToolRecord, MaterialRecord, LabourRecord, MachineryRecord, ExpenseDue } from '../../types';
import { db } from '../../core/db/database';
import { exportSiteReportPdf } from '../../utils/reportExporter';
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
} from 'lucide-react';

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

  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'tools' | 'labour' | 'materials' | 'machinery' | 'dues'>('overview');

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
    exportSiteReportPdf(currentSite, finance, tools, materials, dues);
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
            </div>
          )}

          {/* TOOLS SUB-TAB */}
          {activeSubTab === 'tools' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {tools.length} Tools Tracked on this Site
                </span>
                <button
                  onClick={() => onOpenAddTool(currentSite.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1"
                  style={{ backgroundColor: tradeConfig.primaryColor }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addTool')}</span>
                </button>
              </div>

              <div className="space-y-2">
                {tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                          {tool.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {tool.quantity} {tool.size ? `(${tool.size})` : 'qty'}
                        </span>
                        {tool.status === 'overdue' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400">
                            Overdue!
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Sent: {tool.dateSent} | Return: {tool.expectedReturnDate} | {tool.sourceType === 'purchased_for_site' ? `Purchased: ₹${tool.purchasePrice || tool.rentOrRepairCost || 0}` : 'Self-Owned'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {onEditTool && (
                        <button
                          onClick={() => onEditTool(tool)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Edit Tool"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {onDeleteTool && (
                        <button
                          onClick={() => onDeleteTool(tool)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          title="Delete Tool"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {tool.actualReturnDate ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Returned {tool.actualReturnDate}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleReturnTool(tool.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                        >
                          {t('markReturned')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LABOUR SUB-TAB */}
          {activeSubTab === 'labour' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {labourRecords.length} Attendance Sheets
                </span>
                <button
                  onClick={() => onOpenAddLabour(currentSite.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1"
                  style={{ backgroundColor: tradeConfig.primaryColor }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Attendance</span>
                </button>
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
                    className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Date: {rec.date} ({rec.totalWorkers} Workers)
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 dark:text-white">
                          Total: ₹{rec.totalDailyWage.toLocaleString('en-IN')}
                        </span>
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
                      {(rec.entries || []).map((e) => (
                        <div
                          key={e.id}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">{e.workerName}</span>
                            <span className="text-[10px] text-slate-400">{e.role} • {e.attendanceStatus}</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white">₹{e.dailyWage}</span>
                        </div>
                      ))}
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {materials.length} Material Entries
                </span>
                <button
                  onClick={() => onOpenAddMaterial(currentSite.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1"
                  style={{ backgroundColor: tradeConfig.primaryColor }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Material</span>
                </button>
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {machinery.length} Machinery Logs
                </span>
                <button
                  onClick={() => onOpenAddMachinery(currentSite.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1"
                  style={{ backgroundColor: tradeConfig.primaryColor }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Machinery</span>
                </button>
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
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  {dues.length} Payables & Dues
                </span>
                <button
                  onClick={() => onOpenAddDue(currentSite.id)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-sm flex items-center gap-1"
                  style={{ backgroundColor: tradeConfig.primaryColor }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Due</span>
                </button>
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
    </div>
  );
};
