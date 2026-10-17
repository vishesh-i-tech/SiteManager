import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './core/db/database';
import { useTheme } from './core/theme/ThemeContext';
import {
  Site,
  ToolRecord,
  MaterialRecord,
  MachineryRecord,
  LabourRecord,
  ExpenseDue,
  SmartInsight,
  ContractorAccount,
} from './types';
import { Header } from './components/common/Header';
import { BottomNav, ActiveTab } from './components/common/BottomNav';
import { NavigationTabs } from './components/common/NavigationTabs';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { SiteList } from './components/sites/SiteList';
import { SiteDetailsModal } from './components/sites/SiteDetailsModal';
import { AddSiteModal } from './components/sites/AddSiteModal';
import { EditSiteModal } from './components/sites/EditSiteModal';
import { AddToolModal } from './components/tools/AddToolModal';
import { EditToolModal } from './components/tools/EditToolModal';
import { LabourRegister } from './components/labour/LabourRegister';
import { AddLabourModal } from './components/labour/AddLabourModal';
import { PhotoOcrModal } from './components/labour/PhotoOcrModal';
import { EditLabourModal } from './components/labour/EditLabourModal';
import { MaterialLog } from './components/materials/MaterialLog';
import { AddMaterialModal } from './components/materials/AddMaterialModal';
import { EditMaterialModal } from './components/materials/EditMaterialModal';
import { MachineryLog } from './components/machinery/MachineryLog';
import { AddMachineryModal } from './components/machinery/AddMachineryModal';
import { EditMachineryModal } from './components/machinery/EditMachineryModal';
import { AddDueModal } from './components/dues/AddDueModal';
import { EditDueModal } from './components/dues/EditDueModal';
import { ReportsExporter } from './components/reports/ReportsExporter';
import { VoiceInputModal } from './components/common/VoiceInputModal';
import { QuickAddModal } from './components/common/QuickAddModal';
import { RemindersModal } from './components/common/RemindersModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { AppLockScreen } from './components/common/AppLockScreen';
import { AuthModal } from './components/auth/AuthModal';
import { AuthScreen } from './components/auth/AuthScreen';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { ConfirmDeleteModal } from './components/common/ConfirmDeleteModal';
import { ToastNotification, ToastMessage } from './components/common/ToastNotification';
import { MobileDeviceShell } from './components/common/MobileDeviceShell';
import { exportSiteReportPdf } from './utils/reportExporter';

export const App: React.FC = () => {
  const { trade, setTrade, language, setLanguage, t, tradeConfig } = useTheme();

  // Navigation and active tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Search state across active dashboard
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // User session state
  const [activeAccountId, setActiveAccountId] = useState<string | null>(() => {
    return localStorage.getItem('sitesaathi_active_user_id');
  });
  const [isAppLocked, setIsAppLocked] = useState(false);

  // Modal open states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
  const [isAddLabourModalOpen, setIsAddLabourModalOpen] = useState(false);
  const [isAddSiteModalOpen, setIsAddSiteModalOpen] = useState(false);
  const [isAddToolModalOpen, setIsAddToolModalOpen] = useState(false);
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [isAddMachineryModalOpen, setIsAddMachineryModalOpen] = useState(false);
  const [isAddDueModalOpen, setIsAddDueModalOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Selected site for drilldown modal
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [targetSiteIdForModal, setTargetSiteIdForModal] = useState<string | undefined>(undefined);

  // Edit item states
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [editingTool, setEditingTool] = useState<ToolRecord | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<MaterialRecord | null>(null);
  const [editingMachinery, setEditingMachinery] = useState<MachineryRecord | null>(null);
  const [editingDue, setEditingDue] = useState<ExpenseDue | null>(null);
  const [editingLabour, setEditingLabour] = useState<LabourRecord | null>(null);

  // Delete item state
  const [deletingItem, setDeletingItem] = useState<{
    type: 'site' | 'tool' | 'material' | 'machinery' | 'due' | 'labour';
    id: string;
    name: string;
  } | null>(null);

  // Active filter for sites tab
  const [siteWorkFilter, setSiteWorkFilter] = useState<'all' | 'ongoing' | 'completed' | 'planning'>('all');

  const handleNavigateTab = (tab: ActiveTab, filter?: 'all' | 'ongoing' | 'completed' | 'planning') => {
    if (tab === 'tools' || tab === 'dues') {
      setActiveTab('sites');
      return;
    }
    setActiveTab(tab);
    if (filter) {
      setSiteWorkFilter(filter);
    }
  };

  // Reactive IndexedDB queries via Dexie hooks
  const sites = useLiveQuery(() => db.sites.toArray(), []) || [];
  const tools = useLiveQuery(() => db.tools.toArray(), []) || [];
  const labourRecords = useLiveQuery(() => db.labourRecords.toArray(), []) || [];
  const materials = useLiveQuery(() => db.materials.toArray(), []) || [];
  const machinery = useLiveQuery(() => db.machinery.toArray(), []) || [];
  const dues = useLiveQuery(() => db.dues.toArray(), []) || [];
  const vendors = useLiveQuery(() => db.vendors.toArray(), []) || [];
  const reminders = useLiveQuery(() => db.reminders.toArray(), []) || [];
  const accounts = useLiveQuery(() => db.account.toArray(), []) || [];
  const currentAccount = accounts.find((a) => a.id === activeAccountId) || null;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      message,
    };
    setToasts((prev) => [...prev.slice(-3), newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Check auth session on startup
  useEffect(() => {
    const checkAuth = async () => {
      await db.ensureDefaultAccounts();
      const allAccounts = await db.account.toArray();
      const savedId = localStorage.getItem('sitesaathi_active_user_id');

      if (savedId && allAccounts.some((a) => a.id === savedId)) {
        const acc = allAccounts.find((a) => a.id === savedId);
        if (acc) {
          setActiveAccountId(acc.id);
          setTrade(acc.trade);
          setLanguage(acc.language);
        }
      } else {
        setActiveAccountId(null);
        localStorage.removeItem('sitesaathi_active_user_id');
      }

      const smartIns = await db.generateSmartInsights();
      setInsights(smartIns);
    };

    checkAuth();
  }, []);

  // Monitor PIN Lock state
  useEffect(() => {
    if (currentAccount?.isPinLockEnabled && currentAccount.pinLock && !sessionStorage.getItem('sitesaathi_unlocked')) {
      setIsAppLocked(true);
    }
  }, [currentAccount?.id, currentAccount?.isPinLockEnabled, currentAccount?.pinLock]);

  // Clean orphan/ghost data when no sites exist
  useEffect(() => {
    if (sites.length === 0) {
      db.cleanupOrphanRecords();
    }
  }, [sites.length]);

  const refreshInsights = async () => {
    const smartIns = await db.generateSmartInsights();
    setInsights(smartIns);
  };

  const handleAuthenticated = (account: ContractorAccount, isNewAccount: boolean) => {
    setActiveAccountId(account.id);
    localStorage.setItem('sitesaathi_active_user_id', account.id);
    sessionStorage.setItem('sitesaathi_unlocked', 'true');
    setIsAppLocked(false);
    setTrade(account.trade);
    setLanguage(account.language);
    setIsAuthModalOpen(false);

    showToast(`Welcome ${account.name}!`);
    if (isNewAccount) {
      setIsOnboardingModalOpen(true);
    }
    refreshInsights();
  };

  const handleLogOut = () => {
    localStorage.removeItem('sitesaathi_active_user_id');
    sessionStorage.removeItem('sitesaathi_unlocked');
    setActiveAccountId(null);
    setIsAppLocked(false);
    setIsSettingsModalOpen(false);
    showToast('Logged out successfully', 'info');
  };

  const handleLoadSampleData = async () => {
    await db.seedDemoData(activeAccountId || 'contractor-demo');
    refreshInsights();
    showToast('Sample reviewer data loaded successfully');
  };

  const handleClearAllData = async () => {
    await db.clearAllData();
    refreshInsights();
    if (selectedSite) setSelectedSite(null);
    showToast('All data cleared. Clean start initialized', 'info');
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;

    try {
      switch (deletingItem.type) {
        case 'site':
          await db.deleteSite(deletingItem.id);
          if (selectedSite?.id === deletingItem.id) {
            setSelectedSite(null);
          }
          break;
        case 'tool':
          await db.deleteTool(deletingItem.id);
          break;
        case 'material':
          await db.deleteMaterial(deletingItem.id);
          break;
        case 'machinery':
          await db.deleteMachinery(deletingItem.id);
          break;
        case 'due':
          await db.deleteDue(deletingItem.id);
          break;
        case 'labour':
          await db.deleteLabourRecord(deletingItem.id);
          break;
      }
      refreshInsights();
      showToast(`Deleted ${deletingItem.name}`);
    } catch (err) {
      console.error('Delete error:', err);
      showToast('Failed to delete item', 'error');
    } finally {
      setDeletingItem(null);
    }
  };

  const handleOpenReportFromSite = async (site: Site) => {
    const finance = await db.getSiteFinanceSummary(site.id);
    const sTools = tools.filter((t) => t.siteId === site.id);
    const sMaterials = materials.filter((m) => m.siteId === site.id);
    const sDues = dues.filter((d) => d.siteId === site.id);
    const sClientPayments = await db.clientPayments.where('siteId').equals(site.id).toArray();
    exportSiteReportPdf(site, finance, sTools, sMaterials, sDues, sClientPayments, currentAccount?.companyName);
    showToast(`Exported statement for ${site.name}`);
  };

  return (
    <MobileDeviceShell>
      {!currentAccount ? (
        <>
          <ToastNotification toasts={toasts} onDismiss={dismissToast} />
          <AuthScreen
            onAuthenticated={handleAuthenticated}
            existingAccounts={accounts}
          />
        </>
      ) : isAppLocked ? (
        <AppLockScreen
          account={currentAccount}
          onUnlock={() => {
            sessionStorage.setItem('sitesaathi_unlocked', 'true');
            setIsAppLocked(false);
          }}
          onLogOut={handleLogOut}
        />
      ) : (
        <div className="min-h-full bg-theme-base text-theme-main flex flex-col font-body transition-colors flex-1">
          
          {/* Toast Notifications */}
          <ToastNotification toasts={toasts} onDismiss={dismissToast} />

          {/* Header */}
          <Header
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenNotifications={() => setIsRemindersModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            unreadRemindersCount={reminders.filter((r) => !r.isDismissed).length}
            onOpenTutorial={() => setIsOnboardingModalOpen(true)}
            onResetData={handleLoadSampleData}
            contractorName={currentAccount?.name || 'Alex Carter'}
            onLogout={handleLogOut}
            searchQuery={globalSearchQuery}
            onSearchChange={(q) => setGlobalSearchQuery(q)}
            showSearchBar={activeTab === 'dashboard'}
          />

          {/* Main Container */}
          <main className="flex-1 w-full px-3.5 py-3 space-y-4 pb-20 animate-fade-in">

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            sites={sites}
            tools={tools}
            labourRecords={labourRecords}
            materials={materials}
            machinery={machinery}
            dues={dues}
            insights={insights}
            onSelectSite={(site) => setSelectedSite(site)}
            onOpenAddSite={() => setIsAddSiteModalOpen(true)}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenOcrModal={() => setIsOcrModalOpen(true)}
            onNavigateTab={handleNavigateTab}
            onOpenReport={handleOpenReportFromSite}
            contractorName={currentAccount?.name}
            companyName={currentAccount?.companyName}
            searchQuery={globalSearchQuery}
          />
        )}

        {activeTab === 'sites' && (
          <SiteList
            sites={sites}
            initialWorkFilter={siteWorkFilter}
            onSelectSite={(site) => setSelectedSite(site)}
            onOpenAddSite={() => setIsAddSiteModalOpen(true)}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenReport={handleOpenReportFromSite}
            onEditSite={(site) => setEditingSite(site)}
            onDeleteSite={(site) =>
              setDeletingItem({
                type: 'site',
                id: site.id,
                name: site.name,
              })
            }
          />
        )}

        {activeTab === 'labour' && (
          <LabourRegister
            labourRecords={labourRecords}
            sites={sites}
            companyName={currentAccount?.companyName}
            onOpenOcrModal={() => {
              setTargetSiteIdForModal(undefined);
              setIsOcrModalOpen(true);
            }}
            onOpenAddManual={() => {
              setTargetSiteIdForModal(undefined);
              setIsAddLabourModalOpen(true);
            }}
            onEditLabour={(record) => setEditingLabour(record)}
            onDeleteLabour={(record) =>
              setDeletingItem({
                type: 'labour',
                id: record.id,
                name: `${record.date} (${record.totalWorkers || (record.entries?.length || 0)} workers)`,
              })
            }
          />
        )}

        {activeTab === 'materials' && (
          <MaterialLog
            materials={materials}
            sites={sites}
            onOpenAddMaterial={() => {
              setTargetSiteIdForModal(undefined);
              setIsAddMaterialModalOpen(true);
            }}
            onEditMaterial={(mat) => setEditingMaterial(mat)}
            onDeleteMaterial={(mat) =>
              setDeletingItem({
                type: 'material',
                id: mat.id,
                name: mat.itemName,
              })
            }
          />
        )}

        {activeTab === 'machinery' && (
          <MachineryLog
            machinery={machinery}
            sites={sites}
            onOpenAddMachinery={() => {
              setTargetSiteIdForModal(undefined);
              setIsAddMachineryModalOpen(true);
            }}
            onEditMachinery={(mach) => setEditingMachinery(mach)}
            onDeleteMachinery={(mach) =>
              setDeletingItem({
                type: 'machinery',
                id: mach.id,
                name: mach.machineType,
              })
            }
          />
        )}



        {activeTab === 'reports' && (
          <ReportsExporter
            sites={sites}
            tools={tools}
            materials={materials}
            dues={dues}
          />
        )}

      </main>

      {/* Mobile Bottom Navigation & Floating Action Button */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickAdd={() => setIsQuickAddModalOpen(true)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onAuthenticated={handleAuthenticated}
        existingAccounts={accounts}
      />

      {/* Interactive 5-Step Tutorial */}
      <OnboardingModal
        isOpen={isOnboardingModalOpen}
        onComplete={() => {
          setIsOnboardingModalOpen(false);
          refreshInsights();
          showToast('Tutorial finished! Start by adding your first site');
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        account={currentAccount}
        onReplayTutorial={() => setIsOnboardingModalOpen(true)}
        onLoadSampleData={handleLoadSampleData}
        onClearAllData={handleClearAllData}
        onLogOut={handleLogOut}
      />

      {/* Voice Assistant AI Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSiteCreated={() => {
          refreshInsights();
          showToast('Site created via voice input!');
        }}
      />

      {/* Photo OCR Register Modal */}
      <PhotoOcrModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        sites={sites}
        defaultSiteId={targetSiteIdForModal}
        onRecordSaved={() => {
          refreshInsights();
          showToast('Labour register saved from Photo OCR');
        }}
      />

      {/* Manual Labour Attendance Modal */}
      <AddLabourModal
        isOpen={isAddLabourModalOpen}
        onClose={() => setIsAddLabourModalOpen(false)}
        sites={sites}
        defaultSiteId={targetSiteIdForModal}
        onLabourAdded={() => {
          refreshInsights();
          showToast('Daily labour muster & wages saved');
        }}
      />

      {/* Add Modals */}
      <AddSiteModal
        isOpen={isAddSiteModalOpen}
        onClose={() => setIsAddSiteModalOpen(false)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onSiteCreated={() => {
          refreshInsights();
          showToast('New site created successfully!');
        }}
      />

      <AddToolModal
        isOpen={isAddToolModalOpen}
        onClose={() => setIsAddToolModalOpen(false)}
        sites={sites}
        defaultSiteId={targetSiteIdForModal}
        onToolAdded={() => {
          refreshInsights();
          showToast('Tool dispatched & tracked');
        }}
      />

      <AddMaterialModal
        isOpen={isAddMaterialModalOpen}
        onClose={() => setIsAddMaterialModalOpen(false)}
        sites={sites}
        defaultSiteId={targetSiteIdForModal}
        onMaterialAdded={() => {
          refreshInsights();
          showToast('Material purchase logged');
        }}
      />

      <AddMachineryModal
        isOpen={isAddMachineryModalOpen}
        onClose={() => setIsAddMachineryModalOpen(false)}
        sites={sites}
        defaultSiteId={targetSiteIdForModal}
        onMachineryAdded={() => {
          refreshInsights();
          showToast('Machinery & fuel log saved');
        }}
      />

      <AddDueModal
        isOpen={isAddDueModalOpen}
        onClose={() => setIsAddDueModalOpen(false)}
        sites={sites}
        vendors={vendors}
        defaultSiteId={targetSiteIdForModal}
        onDueAdded={() => {
          refreshInsights();
          showToast('Pending due added to ledger');
        }}
      />

      {/* Edit Modals */}
      <EditSiteModal
        isOpen={!!editingSite}
        site={editingSite}
        onClose={() => setEditingSite(null)}
        onSiteUpdated={async () => {
          if (selectedSite && editingSite && selectedSite.id === editingSite.id) {
            const fresh = await db.sites.get(editingSite.id);
            if (fresh) setSelectedSite(fresh);
          }
          refreshInsights();
          showToast('Site updated successfully');
        }}
      />

      <EditToolModal
        isOpen={!!editingTool}
        tool={editingTool}
        sites={sites}
        onClose={() => setEditingTool(null)}
        onToolUpdated={() => {
          refreshInsights();
          showToast('Tool entry updated');
        }}
      />

      <EditMaterialModal
        isOpen={!!editingMaterial}
        material={editingMaterial}
        sites={sites}
        onClose={() => setEditingMaterial(null)}
        onMaterialUpdated={() => {
          refreshInsights();
          showToast('Material entry updated');
        }}
      />

      <EditMachineryModal
        isOpen={!!editingMachinery}
        machinery={editingMachinery}
        sites={sites}
        onClose={() => setEditingMachinery(null)}
        onMachineryUpdated={() => {
          refreshInsights();
          showToast('Machinery log updated');
        }}
      />

      <EditDueModal
        isOpen={!!editingDue}
        due={editingDue}
        sites={sites}
        onClose={() => setEditingDue(null)}
        onDueUpdated={() => {
          refreshInsights();
          showToast('Due record updated');
        }}
      />

      <EditLabourModal
        isOpen={!!editingLabour}
        record={editingLabour}
        sites={sites}
        onClose={() => setEditingLabour(null)}
        onLabourUpdated={() => {
          refreshInsights();
          showToast('Labour register updated');
        }}
      />

      {/* Quick Add Bottom Sheet Modal */}
      <QuickAddModal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        onOpenAddSite={() => setIsAddSiteModalOpen(true)}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenOcrModal={() => setIsOcrModalOpen(true)}
        onOpenAddLabour={() => {
          setTargetSiteIdForModal(undefined);
          setIsAddLabourModalOpen(true);
        }}
        onOpenAddTool={() => setIsAddToolModalOpen(true)}
        onOpenAddMaterial={() => setIsAddMaterialModalOpen(true)}
        onOpenAddMachinery={() => setIsAddMachineryModalOpen(true)}
        onOpenAddDue={() => setIsAddDueModalOpen(true)}
      />

      {/* Reminders Modal */}
      <RemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        reminders={reminders}
        onNavigateTab={setActiveTab}
        onRefresh={refreshInsights}
      />

      {/* Site Drilldown Modal */}
      <SiteDetailsModal
        site={selectedSite}
        onClose={() => setSelectedSite(null)}
        onOpenAddTool={(sId) => {
          setTargetSiteIdForModal(sId);
          setIsAddToolModalOpen(true);
        }}
        onOpenAddMaterial={(sId) => {
          setTargetSiteIdForModal(sId);
          setIsAddMaterialModalOpen(true);
        }}
        onOpenAddLabour={(sId) => {
          setTargetSiteIdForModal(sId);
          setIsAddLabourModalOpen(true);
        }}
        onOpenAddMachinery={(sId) => {
          setTargetSiteIdForModal(sId);
          setIsAddMachineryModalOpen(true);
        }}
        onOpenAddDue={(sId) => {
          setTargetSiteIdForModal(sId);
          setIsAddDueModalOpen(true);
        }}
        onEditSite={(site) => setEditingSite(site)}
        onDeleteSite={(site) =>
          setDeletingItem({
            type: 'site',
            id: site.id,
            name: site.name,
          })
        }
        onEditTool={(tool) => setEditingTool(tool)}
        onDeleteTool={(tool) =>
          setDeletingItem({
            type: 'tool',
            id: tool.id,
            name: tool.name,
          })
        }
        onEditMaterial={(mat) => setEditingMaterial(mat)}
        onDeleteMaterial={(mat) =>
          setDeletingItem({
            type: 'material',
            id: mat.id,
            name: mat.itemName,
          })
        }
        onEditMachinery={(mach) => setEditingMachinery(mach)}
        onDeleteMachinery={(mach) =>
          setDeletingItem({
            type: 'machinery',
            id: mach.id,
            name: mach.machineType,
          })
        }
        onEditDue={(due) => setEditingDue(due)}
        onDeleteDue={(due) =>
          setDeletingItem({
            type: 'due',
            id: due.id,
            name: `${due.title} (₹${due.amountDue.toLocaleString('en-IN')})`,
          })
        }
        onEditLabour={(labour) => setEditingLabour(labour)}
        onDeleteLabour={(labour) =>
          setDeletingItem({
            type: 'labour',
            id: labour.id,
            name: `${labour.date} (${labour.totalWorkers || (labour.entries?.length || 0)} workers)`,
          })
        }
      />

      {/* Safety Confirmation Modal for Deletions */}
      <ConfirmDeleteModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleConfirmDelete}
        title={
          language === 'hi'
            ? `${deletingItem?.name || 'आइटम'} को हटाने की पुष्टि`
            : `Delete ${deletingItem?.name || 'Item'}?`
        }
        message={
          deletingItem?.type === 'site'
            ? language === 'hi'
              ? `क्या आप वाकई साइट "${deletingItem.name}" को हटाना चाहते हैं? इससे जुड़े सभी टूल्स, लेबर रिकॉर्ड, मटेरियल और बकाया हिसाब भी हटा दिए जाएंगे।`
              : `Are you sure you want to delete "${deletingItem.name}"? All associated tools, materials, machinery logs, labour registers and dues will also be permanently removed.`
            : language === 'hi'
            ? `क्या आप वाकई "${deletingItem?.name}" को हटाना चाहते हैं? यह क्रिया वापस नहीं की जा सकती।`
            : `Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`
        }
      />

        </div>
      )}
    </MobileDeviceShell>
  );
};
