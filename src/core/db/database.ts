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
  ClientPayment,
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
  SEED_CLIENT_PAYMENTS,
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

  // Purge pre-seeded demo accounts so only real user-registered accounts exist
  async purgeDemoAccounts() {
    try {
      const all = await this.account.toArray();
      const demoIds = all
        .filter(
          (a) =>
            ['contractor-1', 'contractor-2', 'contractor-3', 'contractor-demo'].includes(a.id) ||
            a.name.toLowerCase().includes('rameshwar') ||
            a.name.toLowerCase().includes('vikram') ||
            a.name.toLowerCase().includes('rajesh patel') ||
            ['9876543210', '9876543211', '9876543212'].includes(a.phone)
        )
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
      clientPayments: await this.clientPayments.toArray(),
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
        this.clientPayments,
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
        if (data.clientPayments?.length) await this.clientPayments.bulkPut(data.clientPayments);
      }
    );

    return true;
  }
}

export const db = new SiteSaathiDatabase();
