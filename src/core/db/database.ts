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

        const customAccount: ContractorAccount = {
          ...SEED_ACCOUNT,
          id: contractorId,
        };

        const customSites = SEED_SITES.map((s) => ({ ...s, contractorId }));
        const customVendors = SEED_VENDORS.map((v) => ({ ...v, contractorId }));

        await this.account.put(customAccount);
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
    const toolsCost = tools.reduce((acc, t) => acc + (t.rentOrRepairCost || 0), 0);

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
      const toolNames = overdueTools.slice(0, 2).map((t) => `${t.name} (${t.quantity} qty)`).join(', ');
      insights.push({
        id: 'ins-tools-overdue',
        category: 'tool_overdue',
        title: `${overdueTools.length} Tools Overdue for Return`,
        description: `${toolNames} ${overdueTools.length > 2 ? `and ${overdueTools.length - 2} more` : ''} have exceeded return dates, causing extra rental accumulation.`,
        badge: 'High Priority',
        actionText: 'Manage Tools',
        actionRoute: 'tools',
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
        title: `₹${totalDueAmount.toLocaleString('en-IN')} Unsettled on Completed Sites`,
        description: `You have ${completedSiteDues.length} pending vendor/tool bills from sites whose physical work is already completed.`,
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
        title: `Site with Highest Outflow: ${highestSiteName}`,
        description: `Total logged expenditure stands at ₹${highestExpense.toLocaleString('en-IN')}. Verify upcoming material invoices.`,
        badge: 'Cost Breakdown',
        actionText: 'View Sites',
        actionRoute: 'sites',
      });
    }

    return insights;
  }
}

export const db = new SiteSaathiDatabase();
