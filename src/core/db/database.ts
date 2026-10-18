import Dexie, { type EntityTable } from 'dexie';
import type {
  ContractorAccount,
  Site,
  ToolRecord,
  LabourRecord,
  LabourEntry,
  MaterialRecord,
  MachineryRecord,
  ExpenseDue,
  Vendor,
  Reminder,
  SmartInsight,
  ClientPayment,
} from '../../types/index.ts';
import {
  SEED_ACCOUNT,
  SEED_ACCOUNTS,
  SEED_SITES,
  SEED_TOOLS,
  SEED_LABOUR_RECORDS,
  SEED_LABOUR_ENTRIES,
  SEED_MATERIALS,
  SEED_MACHINERY,
  SEED_DUES,
  SEED_VENDORS,
  SEED_REMINDERS,
  SEED_CLIENT_PAYMENTS,
} from './seedData.ts';
import {
  encryptBackupJson,
  decryptBackupJson,
  isEncryptedBackup,
  hashCredential,
} from '../../utils/cryptoUtils.ts';

export interface BackupExportOptions {
  passphrase?: string;
  contractorId: string;
}

export interface BackupImportOptions {
  passphrase?: string;
  activeContractorId: string;
}

export class SiteSaathiDatabase extends Dexie {
  account!: EntityTable<ContractorAccount, 'id'>;
  sites!: EntityTable<Site, 'id'>;
  tools!: EntityTable<ToolRecord, 'id'>;
  labourRecords!: EntityTable<LabourRecord, 'id'>;
  labourEntries!: EntityTable<LabourEntry, 'id'>;
  materials!: EntityTable<MaterialRecord, 'id'>;
  machinery!: EntityTable<MachineryRecord, 'id'>;
  dues!: EntityTable<ExpenseDue, 'id'>;
  vendors!: EntityTable<Vendor, 'id'>;
  reminders!: EntityTable<Reminder, 'id'>;
  clientPayments!: EntityTable<ClientPayment, 'id'>;

  constructor() {
    super('SiteSaathiDB');
    this.version(2).stores({
      account: 'id, trade, phone',
      sites: 'id, contractorId, workStatus, paymentStatus, startDate',
      tools: 'id, siteId, status, expectedReturnDate',
      labourRecords: 'id, siteId, date',
      labourEntries: 'id, recordId, workerName',
      materials: 'id, siteId, vendorId, purchaseDate, paymentStatus',
      machinery: 'id, siteId, logDate',
      dues: 'id, siteId, vendorId, status, dueDate',
      vendors: 'id, contractorId, name',
      reminders: 'id, type, siteId, dueDate, isDismissed',
    });
    this.version(3).stores({
      clientPayments: 'id, siteId, paymentDate, paymentMode',
    });
  }

  // Purge pre-seeded demo records and orphan records so user has a 100% clean slate
  async cleanupOrphanRecords() {
    try {
      const allSites = await this.sites.toArray();
      const siteIds = new Set(allSites.map((s) => s.id));

      // If no sites exist, wipe any leftover demo/orphan tools, materials, machinery, dues, labour
      if (siteIds.size === 0) {
        await this.tools.clear();
        await this.materials.clear();
        await this.machinery.clear();
        await this.dues.clear();
        await this.labourRecords.clear();
        await this.labourEntries.clear();
        await this.clientPayments.clear();
        return;
      }

      // If sites exist, remove any orphan records whose siteId was deleted
      const tools = await this.tools.toArray();
      const orphanToolIds = tools.filter((t) => !siteIds.has(t.siteId)).map((t) => t.id);
      if (orphanToolIds.length > 0) {
        await this.tools.bulkDelete(orphanToolIds);
      }

      const materials = await this.materials.toArray();
      const orphanMaterialIds = materials.filter((m) => !siteIds.has(m.siteId)).map((m) => m.id);
      if (orphanMaterialIds.length > 0) {
        await this.materials.bulkDelete(orphanMaterialIds);
      }

      const dues = await this.dues.toArray();
      const orphanDueIds = dues.filter((d) => !siteIds.has(d.siteId)).map((d) => d.id);
      if (orphanDueIds.length > 0) {
        await this.dues.bulkDelete(orphanDueIds);
      }

      const machinery = await this.machinery.toArray();
      const orphanMachineryIds = machinery.filter((m) => !siteIds.has(m.siteId)).map((m) => m.id);
      if (orphanMachineryIds.length > 0) {
        await this.machinery.bulkDelete(orphanMachineryIds);
      }

      const clientPayments = await this.clientPayments.toArray();
      const orphanPaymentIds = clientPayments.filter((p) => !siteIds.has(p.siteId)).map((p) => p.id);
      if (orphanPaymentIds.length > 0) {
        await this.clientPayments.bulkDelete(orphanPaymentIds);
      }
    } catch (e) {
      console.warn('Failed to clean orphan records', e);
    }
  }

  // Purge pre-seeded demo accounts by explicit demo IDs so legitimate user-registered accounts are never deleted
  async purgeDemoAccounts() {
    try {
      const all = await this.account.toArray();
      const demoAccountIds = new Set(['contractor-1', 'contractor-2', 'contractor-3', 'contractor-demo']);
      const demoIds = all
        .filter((a) => demoAccountIds.has(a.id))
        .map((a) => a.id);
      if (demoIds.length > 0) {
        await this.account.bulkDelete(demoIds);
      }
    } catch (e) {
      console.warn('Failed to purge demo accounts', e);
    }
  }

  async ensureDefaultAccounts() {
    // Purge any pre-seeded demo accounts from old sessions
    await this.purgeDemoAccounts();
    // Automatically purge old demo records & orphans so the user starts with 100% clean data
    await this.cleanupOrphanRecords();
  }

  // Explicit opt-in sample data seeder for recruiters/reviewers
  async seedDemoData(contractorId = 'contractor-1') {
    await this.transaction(
      'rw',
      [
        this.account,
        this.sites,
        this.tools,
        this.labourRecords,
        this.labourEntries,
        this.materials,
        this.machinery,
        this.dues,
        this.vendors,
        this.reminders,
        this.clientPayments,
      ],
      async () => {
        // Clear previous and load clean sample data
        await this.clearAllData();

        await this.account.bulkPut(SEED_ACCOUNTS);
        const customSites = SEED_SITES.map((s) => ({ ...s, contractorId }));
        const customVendors = SEED_VENDORS.map((v) => ({ ...v, contractorId }));

        await this.sites.bulkPut(customSites);
        await this.tools.bulkPut(SEED_TOOLS);
        await this.labourRecords.bulkPut(SEED_LABOUR_RECORDS);
        await this.labourEntries.bulkPut(SEED_LABOUR_ENTRIES);
        await this.materials.bulkPut(SEED_MATERIALS);
        await this.machinery.bulkPut(SEED_MACHINERY);
        await this.dues.bulkPut(SEED_DUES);
        await this.vendors.bulkPut(customVendors);
        await this.reminders.bulkPut(SEED_REMINDERS);
        await this.clientPayments.bulkPut(SEED_CLIENT_PAYMENTS);
      }
    );
  }

  // Wipe all tables clean (brand-new state)
  async clearAllData() {
    await this.transaction(
      'rw',
      [
        this.account,
        this.sites,
        this.tools,
        this.labourRecords,
        this.labourEntries,
        this.materials,
        this.machinery,
        this.dues,
        this.vendors,
        this.reminders,
        this.clientPayments,
      ],
      async () => {
        await this.account.clear();
        await this.sites.clear();
        await this.tools.clear();
        await this.labourRecords.clear();
        await this.labourEntries.clear();
        await this.materials.clear();
        await this.machinery.clear();
        await this.dues.clear();
        await this.vendors.clear();
        await this.reminders.clear();
        await this.clientPayments.clear();
      }
    );
  }

  // Cascade delete a site and all its child associations
  async deleteSite(siteId: string) {
    await this.transaction(
      'rw',
      [
        this.sites,
        this.tools,
        this.labourRecords,
        this.labourEntries,
        this.materials,
        this.machinery,
        this.dues,
        this.reminders,
        this.clientPayments,
      ],
      async () => {
        // Get labour records for this site to delete entries
        const labourRecs = await this.labourRecords.where('siteId').equals(siteId).toArray();
        for (const lr of labourRecs) {
          await this.labourEntries.where('recordId').equals(lr.id).delete();
        }

        await this.labourRecords.where('siteId').equals(siteId).delete();
        await this.tools.where('siteId').equals(siteId).delete();
        await this.materials.where('siteId').equals(siteId).delete();
        await this.machinery.where('siteId').equals(siteId).delete();
        await this.dues.where('siteId').equals(siteId).delete();
        await this.reminders.where('siteId').equals(siteId).delete();
        await this.clientPayments.where('siteId').equals(siteId).delete();
        await this.sites.delete(siteId);
      }
    );
  }

  // Record Client / Contract Payment Received & sync Site paymentStatus
  async recordClientPayment(payment: ClientPayment) {
    await this.clientPayments.put(payment);
    const site = await this.sites.get(payment.siteId);
    if (site && site.estimatedBudget > 0) {
      const allPayments = await this.clientPayments.where('siteId').equals(payment.siteId).toArray();
      const total = allPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
      let newStatus: Site['paymentStatus'] = 'unpaid';
      if (total >= site.estimatedBudget) {
        newStatus = 'paid';
      } else if (total > 0) {
        newStatus = 'partially_paid';
      }
      await this.sites.update(payment.siteId, { paymentStatus: newStatus });
    }
  }

  // Delete a client payment record & re-sync Site paymentStatus
  async deleteClientPayment(paymentId: string, siteId: string) {
    await this.clientPayments.delete(paymentId);
    const site = await this.sites.get(siteId);
    if (site && site.estimatedBudget > 0) {
      const allPayments = await this.clientPayments.where('siteId').equals(siteId).toArray();
      const total = allPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
      let newStatus: Site['paymentStatus'] = 'unpaid';
      if (total >= site.estimatedBudget) {
        newStatus = 'paid';
      } else if (total > 0) {
        newStatus = 'partially_paid';
      }
      await this.sites.update(siteId, { paymentStatus: newStatus });
    }
  }

  // Delete individual records
  async deleteTool(toolId: string) {
    await this.tools.delete(toolId);
  }

  async deleteMaterial(materialId: string) {
    await this.materials.delete(materialId);
  }

  async deleteMachinery(machineryId: string) {
    await this.machinery.delete(machineryId);
  }

  async deleteLabourRecord(recordId: string) {
    await this.transaction('rw', [this.labourRecords, this.labourEntries], async () => {
      await this.labourEntries.where('recordId').equals(recordId).delete();
      await this.labourRecords.delete(recordId);
    });
  }

  async deleteDue(dueId: string) {
    await this.dues.delete(dueId);
  }

  // Calculate finance metrics for a single site
  async getSiteFinanceSummary(siteId: string) {
    const site = await this.sites.get(siteId);
    if (!site) return null;

    const materials = await this.materials.where('siteId').equals(siteId).toArray();
    const materialCost = materials.reduce((acc, m) => acc + (m.totalCost || 0), 0);
    const materialPaid = materials.reduce((acc, m) => acc + (m.paidAmount || 0), 0);

    const machinery = await this.machinery.where('siteId').equals(siteId).toArray();
    const machineryCost = machinery.reduce((acc, m) => acc + (m.totalCost || 0), 0);

    const tools = await this.tools.where('siteId').equals(siteId).toArray();
    const toolsCost = tools.reduce(
      (acc, t) =>
        acc +
        (t.sourceType === 'purchased_for_site'
          ? t.purchasePrice || t.rentOrRepairCost || 0
          : t.purchasePrice || 0),
      0
    );

    const labourRecords = await this.labourRecords.where('siteId').equals(siteId).toArray();
    const labourCost = labourRecords.reduce((acc, l) => acc + (l.totalDailyWage || 0), 0);
    const labourPaid = labourRecords.reduce((acc, l) => acc + (l.totalPaid || 0), 0);

    const totalExpense = materialCost + machineryCost + toolsCost + labourCost;
    const estimatedProfit = (site.estimatedBudget || 0) - totalExpense;
    const profitMarginPercent = site.estimatedBudget > 0 ? (estimatedProfit / site.estimatedBudget) * 100 : 0;

    const dues = await this.dues.where('siteId').equals(siteId).toArray();
    const unpaidDues = dues.filter((d) => d.status !== 'paid').reduce((acc, d) => acc + (d.amountDue - (d.amountPaid || 0)), 0);

    const clientPayments = await this.clientPayments.where('siteId').equals(siteId).toArray();
    const totalClientReceived = clientPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const clientBalanceDue = Math.max(0, (site.estimatedBudget || 0) - totalClientReceived);
    const clientPaymentProgress = site.estimatedBudget > 0 ? Math.min(100, Math.round((totalClientReceived / site.estimatedBudget) * 100)) : 0;

    return {
      site,
      materialCost,
      materialPaid,
      machineryCost,
      toolsCost,
      labourCost,
      labourPaid,
      totalExpense,
      estimatedProfit,
      profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
      unpaidDues,
      totalClientReceived,
      clientBalanceDue,
      clientPaymentProgress,
      clientPaymentsCount: clientPayments.length,
    };
  }

  // Generate automated rule-based Smart Insights
  async generateSmartInsights(contractorId?: string): Promise<SmartInsight[]> {
    const insights: SmartInsight[] = [];
    const allSites = contractorId
      ? await this.sites.where('contractorId').equals(contractorId).toArray()
      : await this.sites.toArray();

    if (allSites.length === 0) return insights;

    const siteIds = new Set(allSites.map((s) => s.id));
    const allTools = (await this.tools.toArray()).filter((t) => siteIds.has(t.siteId));
    const allDues = (await this.dues.toArray()).filter((d) => siteIds.has(d.siteId));

    // 1. Tool Overdue Insights
    const overdueTools = allTools.filter(
      (t) => (t.status === 'overdue' || (t.actualReturnDate === null && new Date(t.expectedReturnDate) < new Date())) && !t.actualReturnDate
    );
    if (overdueTools.length > 0) {
      const toolNames = overdueTools.slice(0, 2).map((t) => `${t.name} (${t.quantity})`).join(', ');
      insights.push({
        id: 'ins-tools-overdue',
        category: 'tool_overdue',
        title: `${overdueTools.length} Tools Overdue`,
        description: `${toolNames}${overdueTools.length > 2 ? ` +${overdueTools.length - 2} more` : ''}`,
        badge: 'Return Alert',
        actionText: 'Manage Tools in Sites',
        actionRoute: 'sites',
      });
    }

    // 2. Pending Dues on Completed Sites (Crucial Contractor Requirement)
    const completedSiteIds = new Set(allSites.filter((s) => s.workStatus === 'completed').map((s) => s.id));
    const completedSiteDues = allDues.filter((d) => completedSiteIds.has(d.siteId) && d.status !== 'paid');
    if (completedSiteDues.length > 0) {
      const totalDueAmount = completedSiteDues.reduce((acc, d) => acc + (d.amountDue - (d.amountPaid || 0)), 0);
      insights.push({
        id: 'ins-completed-dues',
        category: 'budget_alert',
        title: `₹${totalDueAmount.toLocaleString('en-IN')} Completed Site Dues`,
        description: `${completedSiteDues.length} pending bills from finished sites`,
        badge: 'Dues Alert',
        actionText: 'View Pending Dues',
        actionRoute: 'dues',
      });
    }

    // 3. Profit Margin & Highest Expense Site
    let highestExpense = 0;
    let highestSiteName = '';
    for (const site of allSites) {
      const summary = await this.getSiteFinanceSummary(site.id);
      if (summary && summary.totalExpense > highestExpense) {
        highestExpense = summary.totalExpense;
        highestSiteName = site.name;
      }
    }
    if (highestSiteName && highestExpense > 0) {
      insights.push({
        id: 'ins-expense-leader',
        category: 'profit_summary',
        title: `Top Expense Site: ${highestSiteName}`,
        description: `Logged expenditure: ₹${highestExpense.toLocaleString('en-IN')}`,
        badge: 'Cost Alert',
        actionText: 'View Sites',
        actionRoute: 'sites',
      });
    }

    return insights;
  }

  // Full Database Backup Export (JSON)
  // Scoped strictly to the specified contractorId to guarantee multi-tenant data isolation.
  // Includes only the target contractor's account, sites, and genuine site/contractor-related records.
  async exportBackupJson(
    passphraseOrOptions?: string | BackupExportOptions,
    explicitContractorId?: string
  ): Promise<string> {
    let passphrase: string | undefined;
    let contractorId: string | undefined;

    if (typeof passphraseOrOptions === 'object' && passphraseOrOptions !== null) {
      passphrase = passphraseOrOptions.passphrase;
      contractorId = passphraseOrOptions.contractorId;
    } else {
      passphrase = passphraseOrOptions;
      contractorId = explicitContractorId;
    }

    if (!contractorId || typeof contractorId !== 'string' || contractorId.trim().length === 0) {
      throw new Error(
        'CONTRACTOR_ID_REQUIRED: An explicit, validated contractorId is required to export contractor-scoped backup data.'
      );
    }

    const validContractorId = contractorId.trim();
    const rawAccount = await this.account.get(validContractorId);
    if (!rawAccount) {
      throw new Error(`CONTRACTOR_NOT_FOUND: No contractor account found with ID "${validContractorId}".`);
    }

    const sanitizedAccount = { ...rawAccount };
    // Strip credentials from unencrypted backup
    if (!passphrase || passphrase.trim().length === 0) {
      delete sanitizedAccount.password;
      delete sanitizedAccount.pinLock;
    }

    const allAccounts = await this.account.toArray();
    const isSingleAccountMode = allAccounts.length <= 1;

    // Scoped sites: must match contractorId (or legacy site with no contractorId in single-account mode)
    const allSites = await this.sites.toArray();
    const contractorSites = allSites.filter(
      (s) => s.contractorId === validContractorId || (!s.contractorId && isSingleAccountMode)
    );
    const contractorSiteIds = new Set(contractorSites.map((s) => s.id));

    // Scoped vendors: must match contractorId (or legacy vendor with no contractorId in single-account mode)
    const allVendors = await this.vendors.toArray();
    const contractorVendors = allVendors.filter(
      (v) => v.contractorId === validContractorId || (!v.contractorId && isSingleAccountMode)
    );

    // Site-scoped related entities: strictly linked to contractor's sites
    const allTools = await this.tools.toArray();
    const contractorTools = allTools.filter((t) => t.siteId && contractorSiteIds.has(t.siteId));

    const allLabourRecords = await this.labourRecords.toArray();
    const contractorLabourRecords = allLabourRecords.filter((lr) => lr.siteId && contractorSiteIds.has(lr.siteId));
    const contractorLabourRecordIds = new Set(contractorLabourRecords.map((lr) => lr.id));

    // Labour entries: 2-hop linkage through contractor's labour records
    const allLabourEntries = await this.labourEntries.toArray();
    const contractorLabourEntries = allLabourEntries.filter(
      (le) => le.recordId && contractorLabourRecordIds.has(le.recordId)
    );

    const allMaterials = await this.materials.toArray();
    const contractorMaterials = allMaterials.filter((m) => m.siteId && contractorSiteIds.has(m.siteId));

    const allMachinery = await this.machinery.toArray();
    const contractorMachinery = allMachinery.filter((m) => m.siteId && contractorSiteIds.has(m.siteId));

    const allDues = await this.dues.toArray();
    const contractorDues = allDues.filter((d) => d.siteId && contractorSiteIds.has(d.siteId));

    const allReminders = await this.reminders.toArray();
    const contractorReminders = allReminders.filter((r) => r.siteId && contractorSiteIds.has(r.siteId));

    const allClientPayments = await this.clientPayments.toArray();
    const contractorClientPayments = allClientPayments.filter((p) => p.siteId && contractorSiteIds.has(p.siteId));

    const backup = {
      app: 'SiteSaathi',
      version: 2,
      exportedAt: new Date().toISOString(),
      contractorId: validContractorId,
      account: [sanitizedAccount],
      sites: contractorSites.map((s) => ({ ...s, contractorId: validContractorId })),
      tools: contractorTools,
      labourRecords: contractorLabourRecords,
      labourEntries: contractorLabourEntries,
      materials: contractorMaterials,
      machinery: contractorMachinery,
      dues: contractorDues,
      vendors: contractorVendors.map((v) => ({ ...v, contractorId: validContractorId })),
      reminders: contractorReminders,
      clientPayments: contractorClientPayments,
    };

    const plainJson = JSON.stringify(backup, null, 2);
    if (passphrase && passphrase.trim().length >= 4) {
      return await encryptBackupJson(plainJson, passphrase.trim());
    }
    return plainJson;
  }

  // Full Database Backup Import (JSON)
  // Supports both standard JSON and AES-GCM encrypted backup files with passphrase validation.
  // Strictly enforces active contractor ownership, validates legacy payloads, detects cross-contractor collisions,
  // and sanitizes vendor references before any database write transaction.
  async importBackupJson(
    jsonString: string,
    passphraseOrOptions?: string | BackupImportOptions,
    explicitActiveContractorId?: string
  ): Promise<boolean> {
    let passphrase: string | undefined;
    let activeContractorId: string | undefined;

    if (typeof passphraseOrOptions === 'object' && passphraseOrOptions !== null) {
      passphrase = passphraseOrOptions.passphrase;
      activeContractorId = passphraseOrOptions.activeContractorId;
    } else if (typeof explicitActiveContractorId === 'string') {
      passphrase = passphraseOrOptions;
      activeContractorId = explicitActiveContractorId;
    } else if (typeof passphraseOrOptions === 'string') {
      let isEnc = false;
      try {
        const p = JSON.parse(jsonString);
        isEnc = isEncryptedBackup(p);
      } catch {
        // Not valid JSON yet, might be raw ciphertext string
      }
      if (isEnc) {
        passphrase = passphraseOrOptions;
        activeContractorId = undefined;
      } else {
        activeContractorId = passphraseOrOptions;
      }
    }

    if (!activeContractorId || typeof activeContractorId !== 'string' || activeContractorId.trim().length === 0) {
      throw new Error(
        'CONTRACTOR_ID_REQUIRED: An explicit, active authenticated contractorId is required to validate and restore backup data.'
      );
    }

    const targetContractorId = activeContractorId.trim();
    let resolvedJson = jsonString;

    try {
      const parsed = JSON.parse(jsonString);
      if (isEncryptedBackup(parsed)) {
        if (!passphrase || passphrase.trim().length === 0) {
          throw new Error('ENCRYPTED_BACKUP_NEEDS_PASSPHRASE');
        }
        resolvedJson = await decryptBackupJson(jsonString, passphrase.trim());
      }
    } catch (err: any) {
      if (
        err.message === 'ENCRYPTED_BACKUP_NEEDS_PASSPHRASE' ||
        err.message?.includes('passphrase') ||
        err.message?.includes('corrupted') ||
        err.message?.includes('MAC')
      ) {
        throw err;
      }
      // If not JSON or not encrypted, let standard parser handle it below
    }

    let data: any;
    try {
      data = JSON.parse(resolvedJson);
    } catch {
      throw new Error('INVALID_BACKUP_JSON: Decrypted backup payload is not valid JSON.');
    }

    if (!data || typeof data !== 'object') {
      throw new Error('INVALID_BACKUP_FORMAT: Backup payload must be a JSON object.');
    }

    if (!Array.isArray(data.account) || !Array.isArray(data.sites)) {
      throw new Error('INVALID_BACKUP_SCHEMA: Backup file format is invalid (missing account or sites array).');
    }

    // Step 1: Account Ownership Verification (ZERO writes if mismatch)
    const matchingAccount = data.account.find((acc: any) => acc && acc.id === targetContractorId);
    if (!matchingAccount) {
      const backupOwnerDetails = data.account
        .map((a: any) => (a?.name ? `${a.name} (${a.id})` : a?.id || 'unknown'))
        .filter(Boolean)
        .join(', ');
      throw new Error(
        `RESTORE_ACCOUNT_MISMATCH: Backup belongs to contractor "${backupOwnerDetails || 'unknown'}". ` +
        `It cannot be restored into the active session of contractor ID "${targetContractorId}".`
      );
    }

    if (data.contractorId && data.contractorId !== targetContractorId) {
      throw new Error(
        `RESTORE_ACCOUNT_MISMATCH: Top-level backup contractorId "${data.contractorId}" ` +
        `does not match active contractor ID "${targetContractorId}".`
      );
    }

    // Step 2: Backup Format & Ownership Verification (SEC-2B-002)
    const isVersion2 = data.version === 2 || Boolean(data.contractorId);

    if (isVersion2) {
      // Version 2 strictly requires explicit, matching contractor ownership on every site and vendor
      for (const s of data.sites) {
        if (!s || typeof s !== 'object') continue;
        if (!s.contractorId || typeof s.contractorId !== 'string') {
          throw new Error(
            `RESTORE_AMBIGUOUS_OWNERSHIP: Version 2 backup contains site "${s.id || 'unknown'}" with missing contractorId.`
          );
        }
        if (s.contractorId !== targetContractorId) {
          throw new Error(
            `RESTORE_ACCOUNT_MISMATCH: Backup contains site "${s.id}" belonging to contractor "${s.contractorId}", ` +
            `which does not match active contractor ID "${targetContractorId}".`
          );
        }
      }

      if (Array.isArray(data.vendors)) {
        for (const v of data.vendors) {
          if (!v || typeof v !== 'object') continue;
          if (!v.contractorId || typeof v.contractorId !== 'string') {
            throw new Error(
              `RESTORE_AMBIGUOUS_OWNERSHIP: Version 2 backup contains vendor "${v.id || 'unknown'}" with missing contractorId.`
            );
          }
          if (v.contractorId !== targetContractorId) {
            throw new Error(
              `RESTORE_ACCOUNT_MISMATCH: Backup contains vendor "${v.id}" belonging to contractor "${v.contractorId}", ` +
              `which does not match active contractor ID "${targetContractorId}".`
            );
          }
        }
      }
    } else {
      // Legacy V1 backup handling: permit normalization ONLY if safely provable
      const isSafeV1Legacy =
        !data.contractorId &&
        data.version !== 2 &&
        Array.isArray(data.account) &&
        data.account.length === 1 &&
        data.account[0]?.id === targetContractorId;

      if (!isSafeV1Legacy) {
        throw new Error(
          'RESTORE_AMBIGUOUS_OWNERSHIP: Legacy backup ownership cannot be safely verified from payload metadata.'
        );
      }

      // Ensure no conflicting ownership tags exist in legacy payload
      for (const s of data.sites) {
        if (s && s.contractorId && s.contractorId !== targetContractorId) {
          throw new Error(
            `RESTORE_ACCOUNT_MISMATCH: Legacy backup contains site "${s.id}" with conflicting contractorId "${s.contractorId}".`
          );
        }
      }
      if (Array.isArray(data.vendors)) {
        for (const v of data.vendors) {
          if (v && v.contractorId && v.contractorId !== targetContractorId) {
            throw new Error(
              `RESTORE_ACCOUNT_MISMATCH: Legacy backup contains vendor "${v.id}" with conflicting contractorId "${v.contractorId}".`
            );
          }
        }
      }
    }

    // Verify child records do not have conflicting foreign contractorId tags
    const verifyNoConflictingContractorTag = (records: any[] | undefined, label: string) => {
      if (!Array.isArray(records)) return;
      for (const r of records) {
        if (r && r.contractorId && r.contractorId !== targetContractorId) {
          throw new Error(
            `RESTORE_ACCOUNT_MISMATCH: ${label} record "${r.id || 'unknown'}" has conflicting contractorId "${r.contractorId}".`
          );
        }
      }
    };

    verifyNoConflictingContractorTag(data.tools, 'Tool');
    verifyNoConflictingContractorTag(data.labourRecords, 'Labour record');
    verifyNoConflictingContractorTag(data.labourEntries, 'Labour entry');
    verifyNoConflictingContractorTag(data.materials, 'Material');
    verifyNoConflictingContractorTag(data.machinery, 'Machinery');
    verifyNoConflictingContractorTag(data.dues, 'Expense due');
    verifyNoConflictingContractorTag(data.reminders, 'Reminder');
    verifyNoConflictingContractorTag(data.clientPayments, 'Client payment');

    // Step 3: Prepare Scoped Records to Import
    const accountsToImport = [matchingAccount];
    for (const acc of accountsToImport) {
      if (acc.password && !acc.password.startsWith('pbkdf2:v1:')) {
        acc.password = await hashCredential(acc.password);
      }
      if (acc.pinLock && !acc.pinLock.startsWith('pbkdf2:v1:')) {
        acc.pinLock = await hashCredential(acc.pinLock);
      }
    }

    const sitesToImport = (data.sites as Site[])
      .filter((s) => s && (s.contractorId === targetContractorId || !s.contractorId))
      .map((s) => ({
        ...s,
        contractorId: targetContractorId,
      }));
    const validSiteIds = new Set(sitesToImport.map((s) => s.id));

    const vendorsToImport = Array.isArray(data.vendors)
      ? (data.vendors as Vendor[])
          .filter((v) => v && (v.contractorId === targetContractorId || !v.contractorId))
          .map((v) => ({
            ...v,
            contractorId: targetContractorId,
          }))
      : [];

    const toolsToImport = Array.isArray(data.tools)
      ? (data.tools as ToolRecord[]).filter((t) => t && t.siteId && validSiteIds.has(t.siteId))
      : [];

    const labourRecordsToImport = Array.isArray(data.labourRecords)
      ? (data.labourRecords as LabourRecord[]).filter((lr) => lr && lr.siteId && validSiteIds.has(lr.siteId))
      : [];
    const validLabourRecordIds = new Set(labourRecordsToImport.map((lr) => lr.id));

    const labourEntriesToImport = Array.isArray(data.labourEntries)
      ? (data.labourEntries as LabourEntry[]).filter(
          (le) => le && le.recordId && validLabourRecordIds.has(le.recordId)
        )
      : [];

    const materialsToImport = Array.isArray(data.materials)
      ? (data.materials as MaterialRecord[]).filter((m) => m && m.siteId && validSiteIds.has(m.siteId))
      : [];

    const machineryToImport = Array.isArray(data.machinery)
      ? (data.machinery as MachineryRecord[]).filter((m) => m && m.siteId && validSiteIds.has(m.siteId))
      : [];

    const duesToImport = Array.isArray(data.dues)
      ? (data.dues as ExpenseDue[]).filter((d) => d && d.siteId && validSiteIds.has(d.siteId))
      : [];

    const remindersToImport = Array.isArray(data.reminders)
      ? (data.reminders as Reminder[]).filter((r) => r && r.siteId && validSiteIds.has(r.siteId))
      : [];

    const clientPaymentsToImport = Array.isArray(data.clientPayments)
      ? (data.clientPayments as ClientPayment[]).filter((p) => p && p.siteId && validSiteIds.has(p.siteId))
      : [];

    // Step 4: Validate and Sanitize Vendor References (SEC-2B-004)
    // Gather all valid vendor IDs for the active contractor (imported + existing local)
    const existingVendors = await this.vendors.toArray();
    const existingContractorVendors = existingVendors.filter((v) => v.contractorId === targetContractorId);
    const validVendorIds = new Set([
      ...vendorsToImport.map((v) => v.id),
      ...existingContractorVendors.map((v) => v.id),
    ]);

    for (const m of materialsToImport) {
      if (m.vendorId && !validVendorIds.has(m.vendorId)) {
        // Strip foreign or invalid vendor reference so foreign vendor IDs cannot persist
        delete m.vendorId;
      }
    }

    for (const d of duesToImport) {
      if (d.vendorId && !validVendorIds.has(d.vendorId)) {
        // Strip foreign or invalid vendor reference so foreign vendor IDs cannot persist
        delete d.vendorId;
      }
    }

    // Step 5: Pre-Transaction Cross-Contractor Primary-Key Collision Detection (SEC-2B-003)
    const existingSites = await this.sites.toArray();
    const existingSitesMap = new Map(existingSites.map((s) => [s.id, s]));
    const existingVendorsMap = new Map(existingVendors.map((v) => [v.id, v]));

    for (const s of sitesToImport) {
      const existing = existingSitesMap.get(s.id);
      if (existing && existing.contractorId && existing.contractorId !== targetContractorId) {
        throw new Error(
          `RESTORE_COLLISION_DETECTED: Site "${s.id}" collides with an existing site belonging to another contractor.`
        );
      }
    }

    for (const v of vendorsToImport) {
      const existing = existingVendorsMap.get(v.id);
      if (existing && existing.contractorId && existing.contractorId !== targetContractorId) {
        throw new Error(
          `RESTORE_COLLISION_DETECTED: Vendor "${v.id}" collides with an existing vendor belonging to another contractor.`
        );
      }
    }

    const existingTools = await this.tools.toArray();
    const existingToolsMap = new Map(existingTools.map((t) => [t.id, t]));
    for (const t of toolsToImport) {
      const existing = existingToolsMap.get(t.id);
      if (existing) {
        const parentSite = existingSitesMap.get(existing.siteId);
        if (parentSite && parentSite.contractorId && parentSite.contractorId !== targetContractorId) {
          throw new Error(
            `RESTORE_COLLISION_DETECTED: Tool "${t.id}" collides with an existing tool belonging to another contractor.`
          );
        }
      }
    }

    const existingLabourRecords = await this.labourRecords.toArray();
    const existingLabourRecordsMap = new Map(existingLabourRecords.map((lr) => [lr.id, lr]));
    for (const lr of labourRecordsToImport) {
      const existing = existingLabourRecordsMap.get(lr.id);
      if (existing) {
        const parentSite = existingSitesMap.get(existing.siteId);
        if (parentSite && parentSite.contractorId && parentSite.contractorId !== targetContractorId) {
          throw new Error(
            `RESTORE_COLLISION_DETECTED: Labour record "${lr.id}" collides with an existing labour record belonging to another contractor.`
          );
        }
      }
    }

    const existingLabourEntries = await this.labourEntries.toArray();
    const existingLabourEntriesMap = new Map(existingLabourEntries.map((le) => [le.id, le]));
    for (const le of labourEntriesToImport) {
      const existing = existingLabourEntriesMap.get(le.id);
      if (existing) {
        const parentLr = existingLabourRecordsMap.get(existing.recordId);
        const parentSite = parentLr ? existingSitesMap.get(parentLr.siteId) : undefined;
        if (parentSite && parentSite.contractorId && parentSite.contractorId !== targetContractorId) {
          throw new Error(
            `RESTORE_COLLISION_DETECTED: Labour entry "${le.id}" collides with an existing labour entry belonging to another contractor.`
          );
        }
      }
    }

    const existingMaterials = await this.materials.toArray();
    const existingMaterialsMap = new Map(existingMaterials.map((m) => [m.id, m]));
    for (const m of materialsToImport) {
      const existing = existingMaterialsMap.get(m.id);
      if (existing) {
        const parentSite = existingSitesMap.get(existing.siteId);
        if (parentSite && parentSite.contractorId && parentSite.contractorId !== targetContractorId) {
          throw new Error(
            `RESTORE_COLLISION_DETECTED: Material "${m.id}" collides with an existing material belonging to another contractor.`
          );
        }
      }
    }

    const existingMachinery = await this.machinery.toArray();
    const existingMachineryMap = new Map(existingMachinery.map((m) => [m.id, m]));
    for (const m of machineryToImport) {
      const existing = existingMachineryMap.get(m.id);
      if (existing) {
        const parentSite = existingSitesMap.get(existing.siteId);
        if (parentSite && parentSite.contractorId && parentSite.contractorId !== targetContractorId) {
          throw new Error(
            `RESTORE_COLLISION_DETECTED: Machinery "${m.id}" collides with an existing machinery record belonging to another contractor.`
          );
        }
      }
    }

    const existingDues = await this.dues.toArray();
    const existingDuesMap = new Map(existingDues.map((d) => [d.id, d]));
    for (const d of duesToImport) {
      const existing = existingDuesMap.get(d.id);
      if (existing) {
        const parentSite = existingSitesMap.get(existing.siteId);
        if (parentSite && parentSite.contractorId && parentSite.contractorId !== targetContractorId) {
          throw new Error(
            `RESTORE_COLLISION_DETECTED: Expense due "${d.id}" collides with an existing expense due belonging to another contractor.`
          );
        }
      }
    }

    const existingReminders = await this.reminders.toArray();
    const existingRemindersMap = new Map(existingReminders.map((r) => [r.id, r]));
    for (const r of remindersToImport) {
      const existing = existingRemindersMap.get(r.id);
      if (existing) {
        const parentSite = existingSitesMap.get(existing.siteId);
        if (parentSite && parentSite.contractorId && parentSite.contractorId !== targetContractorId) {
          throw new Error(
            `RESTORE_COLLISION_DETECTED: Reminder "${r.id}" collides with an existing reminder belonging to another contractor.`
          );
        }
      }
    }

    const existingClientPayments = await this.clientPayments.toArray();
    const existingClientPaymentsMap = new Map(existingClientPayments.map((p) => [p.id, p]));
    for (const p of clientPaymentsToImport) {
      const existing = existingClientPaymentsMap.get(p.id);
      if (existing) {
        const parentSite = existingSitesMap.get(existing.siteId);
        if (parentSite && parentSite.contractorId && parentSite.contractorId !== targetContractorId) {
          throw new Error(
            `RESTORE_COLLISION_DETECTED: Client payment "${p.id}" collides with an existing client payment belonging to another contractor.`
          );
        }
      }
    }

    // Step 6: Atomic Database Transaction
    await this.transaction(
      'rw',
      [
        this.account,
        this.sites,
        this.tools,
        this.labourRecords,
        this.labourEntries,
        this.materials,
        this.machinery,
        this.dues,
        this.vendors,
        this.reminders,
        this.clientPayments,
      ],
      async () => {
        if (accountsToImport.length) await this.account.bulkPut(accountsToImport);
        if (sitesToImport.length) await this.sites.bulkPut(sitesToImport);
        if (toolsToImport.length) await this.tools.bulkPut(toolsToImport);
        if (labourRecordsToImport.length) await this.labourRecords.bulkPut(labourRecordsToImport);
        if (labourEntriesToImport.length) await this.labourEntries.bulkPut(labourEntriesToImport);
        if (materialsToImport.length) await this.materials.bulkPut(materialsToImport);
        if (machineryToImport.length) await this.machinery.bulkPut(machineryToImport);
        if (duesToImport.length) await this.dues.bulkPut(duesToImport);
        if (vendorsToImport.length) await this.vendors.bulkPut(vendorsToImport);
        if (remindersToImport.length) await this.reminders.bulkPut(remindersToImport);
        if (clientPaymentsToImport.length) await this.clientPayments.bulkPut(clientPaymentsToImport);
      }
    );

    return true;
  }
}

export const db = new SiteSaathiDatabase();
