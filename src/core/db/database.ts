import Dexie, { type EntityTable } from 'dexie';
import {
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
} from '../../types';
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
} from './seedData';

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
  }

  // Purge pre-seeded sample labour entries so only user's real muster data is shown
  async cleanupSampleLabourRecords() {
    try {
      await this.labourRecords.where('id').equals('lr-1').delete();
      await this.labourEntries.where('recordId').equals('lr-1').delete();
    } catch (e) {
      console.warn('Failed to clean sample labour records', e);
    }
  }

  async ensureDefaultAccounts() {
    const count = await this.account.count();
    if (count === 0) {
      await this.account.bulkPut(SEED_ACCOUNTS);
    }
    // Automatically purge old demo records so the user starts with clean manual labour entry
    await this.cleanupSampleLabourRecords();
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
        await this.sites.delete(siteId);
      }
    );
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
  async exportBackupJson(): Promise<string> {
    const backup = {
      app: 'SiteSaathi',
      version: 2,
      exportedAt: new Date().toISOString(),
      account: await this.account.toArray(),
      sites: await this.sites.toArray(),
      tools: await this.tools.toArray(),
      labourRecords: await this.labourRecords.toArray(),
      labourEntries: await this.labourEntries.toArray(),
      materials: await this.materials.toArray(),
      machinery: await this.machinery.toArray(),
      dues: await this.dues.toArray(),
      vendors: await this.vendors.toArray(),
      reminders: await this.reminders.toArray(),
    };
    return JSON.stringify(backup, null, 2);
  }

  // Full Database Backup Import (JSON)
  async importBackupJson(jsonString: string): Promise<boolean> {
    const data = JSON.parse(jsonString);
    if (!data.sites || !data.account) {
      throw new Error('Invalid backup file format');
    }

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
      ],
      async () => {
        if (data.account?.length) await this.account.bulkPut(data.account);
        if (data.sites?.length) await this.sites.bulkPut(data.sites);
        if (data.tools?.length) await this.tools.bulkPut(data.tools);
        if (data.labourRecords?.length) await this.labourRecords.bulkPut(data.labourRecords);
        if (data.labourEntries?.length) await this.labourEntries.bulkPut(data.labourEntries);
        if (data.materials?.length) await this.materials.bulkPut(data.materials);
        if (data.machinery?.length) await this.machinery.bulkPut(data.machinery);
        if (data.dues?.length) await this.dues.bulkPut(data.dues);
        if (data.vendors?.length) await this.vendors.bulkPut(data.vendors);
        if (data.reminders?.length) await this.reminders.bulkPut(data.reminders);
      }
    );

    return true;
  }
}

export const db = new SiteSaathiDatabase();
