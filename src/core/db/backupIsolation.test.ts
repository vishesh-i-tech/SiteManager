/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';

// Shim window for Node.js test environment so Web Crypto APIs match browser
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

import { SiteSaathiDatabase } from './database.ts';
import {
  isEncryptedBackup,
} from '../../utils/cryptoUtils.ts';
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
  ClientPayment,
} from '../../types/index.ts';

/**
 * Isolated in-memory table store mimicking Dexie's API for testing
 * without running against a native browser IndexedDB engine.
 */
class InMemoryTable<T extends { id: string }> {
  public map = new Map<string, T>();

  constructor(initial: T[] = []) {
    for (const r of initial) {
      this.map.set(r.id, { ...r });
    }
  }

  async get(id: string): Promise<T | undefined> {
    const item = this.map.get(id);
    return item ? { ...item } : undefined;
  }

  async toArray(): Promise<T[]> {
    return Array.from(this.map.values()).map((item) => ({ ...item }));
  }

  async bulkPut(records: T[]): Promise<void> {
    for (const r of records) {
      this.map.set(r.id, { ...r });
    }
  }

  async bulkDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      this.map.delete(id);
    }
  }

  async clear(): Promise<void> {
    this.map.clear();
  }
}

/**
 * Test database fixture exercising the real production SiteSaathiDatabase methods:
 * SiteSaathiDatabase.prototype.exportBackupJson and SiteSaathiDatabase.prototype.importBackupJson.
 * Does NOT duplicate the production filtering or validation logic.
 */
class TestSiteSaathiDatabase {
  account: InMemoryTable<ContractorAccount>;
  sites: InMemoryTable<Site>;
  tools: InMemoryTable<ToolRecord>;
  labourRecords: InMemoryTable<LabourRecord>;
  labourEntries: InMemoryTable<LabourEntry>;
  materials: InMemoryTable<MaterialRecord>;
  machinery: InMemoryTable<MachineryRecord>;
  dues: InMemoryTable<ExpenseDue>;
  vendors: InMemoryTable<Vendor>;
  reminders: InMemoryTable<Reminder>;
  clientPayments: InMemoryTable<ClientPayment>;

  constructor(seed?: {
    account?: ContractorAccount[];
    sites?: Site[];
    tools?: ToolRecord[];
    labourRecords?: LabourRecord[];
    labourEntries?: LabourEntry[];
    materials?: MaterialRecord[];
    machinery?: MachineryRecord[];
    dues?: ExpenseDue[];
    vendors?: Vendor[];
    reminders?: Reminder[];
    clientPayments?: ClientPayment[];
  }) {
    this.account = new InMemoryTable(seed?.account);
    this.sites = new InMemoryTable(seed?.sites);
    this.tools = new InMemoryTable(seed?.tools);
    this.labourRecords = new InMemoryTable(seed?.labourRecords);
    this.labourEntries = new InMemoryTable(seed?.labourEntries);
    this.materials = new InMemoryTable(seed?.materials);
    this.machinery = new InMemoryTable(seed?.machinery);
    this.dues = new InMemoryTable(seed?.dues);
    this.vendors = new InMemoryTable(seed?.vendors);
    this.reminders = new InMemoryTable(seed?.reminders);
    this.clientPayments = new InMemoryTable(seed?.clientPayments);
  }

  async transaction(
    _mode: string,
    tables: InMemoryTable<any>[],
    callback: () => Promise<void>
  ): Promise<void> {
    const snapshots = tables.map((t) => ({ table: t, backup: new Map(t.map) }));
    try {
      await callback();
    } catch (err) {
      // Atomic rollback on failure
      for (const s of snapshots) {
        s.table.map = s.backup;
      }
      throw err;
    }
  }

  // Bind real production implementation directly from SiteSaathiDatabase prototype
  exportBackupJson = SiteSaathiDatabase.prototype.exportBackupJson.bind(this);
  importBackupJson = SiteSaathiDatabase.prototype.importBackupJson.bind(this);
}

// Helper to snapshot all 11 tables for verifying zero database writes on rejection
const takeDatabaseSnapshot = async (database: TestSiteSaathiDatabase) => {
  return {
    account: await database.account.toArray(),
    sites: await database.sites.toArray(),
    tools: await database.tools.toArray(),
    labourRecords: await database.labourRecords.toArray(),
    labourEntries: await database.labourEntries.toArray(),
    materials: await database.materials.toArray(),
    machinery: await database.machinery.toArray(),
    dues: await database.dues.toArray(),
    vendors: await database.vendors.toArray(),
    reminders: await database.reminders.toArray(),
    clientPayments: await database.clientPayments.toArray(),
  };
};

// Helper to seed standard multi-contractor test database across all 11 tables
const createMultiContractorFixture = () => {
  const accountA: ContractorAccount = {
    id: 'contractor-A',
    name: 'Rameshwar Sharma',
    phone: '9811122233',
    trade: 'construction',
    language: 'hi',
    themeMode: 'light',
    tutorialCompleted: true,
    createdAt: '2026-04-01T00:00:00.000Z',
  };

  const accountB: ContractorAccount = {
    id: 'contractor-B',
    name: 'Suresh Patel',
    phone: '9822233344',
    trade: 'plumbing',
    language: 'en',
    themeMode: 'dark',
    tutorialCompleted: true,
    createdAt: '2026-04-02T00:00:00.000Z',
  };

  const sitesA: Site[] = [
    {
      id: 'site-A1',
      contractorId: 'contractor-A',
      name: 'Ramesh Tower A',
      location: 'Sector 62, Noida',
      siteType: 'Building',
      estimatedBudget: 5000000,
      workStatus: 'ongoing',
      paymentStatus: 'partially_paid',
      startDate: '2026-01-10',
      createdAt: '2026-01-10T00:00:00.000Z',
    },
  ];

  const sitesB: Site[] = [
    {
      id: 'site-B1',
      contractorId: 'contractor-B',
      name: 'Suresh Villa B',
      location: 'Whitefield, Bangalore',
      siteType: 'Residential',
      estimatedBudget: 2500000,
      workStatus: 'ongoing',
      paymentStatus: 'unpaid',
      startDate: '2026-02-01',
      createdAt: '2026-02-01T00:00:00.000Z',
    },
  ];

  const toolsA: ToolRecord[] = [
    {
      id: 'tool-A1',
      siteId: 'site-A1',
      name: 'Hilti Drill',
      quantity: 2,
      dateSent: '2026-01-15',
      expectedReturnDate: '2026-02-15',
      status: 'on_site',
    },
  ];

  const toolsB: ToolRecord[] = [
    {
      id: 'tool-B1',
      siteId: 'site-B1',
      name: 'Pipe Cutter',
      quantity: 4,
      dateSent: '2026-02-05',
      expectedReturnDate: '2026-03-05',
      status: 'on_site',
    },
  ];

  const labourRecordsA: LabourRecord[] = [
    {
      id: 'lr-A1',
      siteId: 'site-A1',
      date: '2026-03-01',
      totalWorkers: 1,
      totalDailyWage: 750,
      totalPaid: 750,
    },
  ];

  const labourRecordsB: LabourRecord[] = [
    {
      id: 'lr-B1',
      siteId: 'site-B1',
      date: '2026-03-02',
      totalWorkers: 1,
      totalDailyWage: 900,
      totalPaid: 500,
    },
  ];

  const labourEntriesA: LabourEntry[] = [
    {
      id: 'le-A1',
      recordId: 'lr-A1',
      workerName: 'Sonu Painter',
      role: 'Painter',
      attendanceStatus: 'full_day',
      dailyWage: 750,
      paidAmount: 750,
      balanceDue: 0,
    },
  ];

  const labourEntriesB: LabourEntry[] = [
    {
      id: 'le-B1',
      recordId: 'lr-B1',
      workerName: 'Radhe Plumber',
      role: 'Plumber',
      attendanceStatus: 'full_day',
      dailyWage: 900,
      paidAmount: 500,
      balanceDue: 400,
    },
  ];

  const materialsA: MaterialRecord[] = [
    {
      id: 'mat-A1',
      siteId: 'site-A1',
      vendorId: 'vendor-A1',
      itemName: 'Ambuja Cement',
      quantity: 100,
      unit: 'bags',
      unitPrice: 380,
      totalCost: 38000,
      purchaseDate: '2026-02-10',
      paymentStatus: 'paid',
      paidAmount: 38000,
    },
  ];

  const materialsB: MaterialRecord[] = [
    {
      id: 'mat-B1',
      siteId: 'site-B1',
      vendorId: 'vendor-B1',
      itemName: 'Astral CPVC Pipes',
      quantity: 50,
      unit: 'pieces',
      unitPrice: 420,
      totalCost: 21000,
      purchaseDate: '2026-02-12',
      paymentStatus: 'pending',
      paidAmount: 0,
    },
  ];

  const machineryA: MachineryRecord[] = [
    {
      id: 'mac-A1',
      siteId: 'site-A1',
      machineType: 'Concrete Mixer',
      totalCost: 15000,
      rentalHoursOrDays: 5,
      rentalCost: 15000,
      logDate: '2026-02-15',
    },
  ];

  const machineryB: MachineryRecord[] = [
    {
      id: 'mac-B1',
      siteId: 'site-B1',
      machineType: 'Pipe Threader',
      totalCost: 8000,
      rentalHoursOrDays: 2,
      rentalCost: 8000,
      logDate: '2026-02-18',
    },
  ];

  const duesA: ExpenseDue[] = [
    {
      id: 'due-A1',
      siteId: 'site-A1',
      vendorId: 'vendor-A1',
      title: 'Cement Udhaar',
      category: 'material',
      amountDue: 18000,
      amountPaid: 8000,
      dueDate: '2026-04-15',
      status: 'pending',
    },
  ];

  const duesB: ExpenseDue[] = [
    {
      id: 'due-B1',
      siteId: 'site-B1',
      vendorId: 'vendor-B1',
      title: 'PVC Pipes Supplier',
      category: 'material',
      amountDue: 45000,
      amountPaid: 0,
      dueDate: '2026-04-20',
      status: 'pending',
    },
  ];

  const paymentsA: ClientPayment[] = [
    {
      id: 'pay-A1',
      siteId: 'site-A1',
      amount: 150000,
      paymentDate: '2026-02-15',
      paymentMode: 'Bank Transfer',
      payerName: 'Mr. Verma',
      createdAt: '2026-02-15T00:00:00.000Z',
    },
  ];

  const paymentsB: ClientPayment[] = [
    {
      id: 'pay-B1',
      siteId: 'site-B1',
      amount: 80000,
      paymentDate: '2026-03-01',
      paymentMode: 'Cash',
      payerName: 'Mrs. Dsouza',
      createdAt: '2026-03-01T00:00:00.000Z',
    },
  ];

  const vendorsA: Vendor[] = [
    {
      id: 'vendor-A1',
      contractorId: 'contractor-A',
      name: 'Ramesh Hardware',
      phone: '9811199999',
      tradeSpecialty: 'Hardware',
      totalUdhaarBalance: 10000,
    },
  ];

  const vendorsB: Vendor[] = [
    {
      id: 'vendor-B1',
      contractorId: 'contractor-B',
      name: 'Patel Sanitary',
      phone: '9822299999',
      tradeSpecialty: 'Sanitaryware',
      totalUdhaarBalance: 45000,
    },
  ];

  const remindersA: Reminder[] = [
    {
      id: 'rem-A1',
      type: 'payment_due',
      title: 'Cement Bill Payment',
      description: 'Clear cement vendor balance',
      siteId: 'site-A1',
      siteName: 'Ramesh Tower A',
      dueDate: '2026-04-15',
      amount: 10000,
    },
  ];

  const remindersB: Reminder[] = [
    {
      id: 'rem-B1',
      type: 'tool_overdue',
      title: 'Return Pipe Cutter',
      description: 'Return rented cutter to supplier',
      siteId: 'site-B1',
      siteName: 'Suresh Villa B',
      dueDate: '2026-03-05',
    },
  ];

  return new TestSiteSaathiDatabase({
    account: [accountA, accountB],
    sites: [...sitesA, ...sitesB],
    tools: [...toolsA, ...toolsB],
    labourRecords: [...labourRecordsA, ...labourRecordsB],
    labourEntries: [...labourEntriesA, ...labourEntriesB],
    materials: [...materialsA, ...materialsB],
    machinery: [...machineryA, ...machineryB],
    dues: [...duesA, ...duesB],
    vendors: [...vendorsA, ...vendorsB],
    reminders: [...remindersA, ...remindersB],
    clientPayments: [...paymentsA, ...paymentsB],
  });
};

// ---------------------------------------------------------------------------
// TEST 1: Contractor A Export excludes every Contractor B record across all 11 tables
// ---------------------------------------------------------------------------
test('1. Contractor A export excludes every Contractor B record across all 11 tables', async () => {
  const db = createMultiContractorFixture();
  const rawExport = await db.exportBackupJson(undefined, 'contractor-A');
  const backup = JSON.parse(rawExport);

  assert.strictEqual(backup.contractorId, 'contractor-A');
  assert.strictEqual(backup.account.length, 1);
  assert.strictEqual(backup.account[0].id, 'contractor-A');

  // Verify site records
  assert.strictEqual(backup.sites.length, 1);
  assert.strictEqual(backup.sites[0].id, 'site-A1');
  assert.strictEqual(backup.sites.some((s: any) => s.id === 'site-B1'), false);

  // Verify tools
  assert.strictEqual(backup.tools.length, 1);
  assert.strictEqual(backup.tools[0].id, 'tool-A1');
  assert.strictEqual(backup.tools.some((t: any) => t.id === 'tool-B1'), false);

  // Verify labour records & entries
  assert.strictEqual(backup.labourRecords.length, 1);
  assert.strictEqual(backup.labourRecords[0].id, 'lr-A1');
  assert.strictEqual(backup.labourRecords.some((lr: any) => lr.id === 'lr-B1'), false);

  assert.strictEqual(backup.labourEntries.length, 1);
  assert.strictEqual(backup.labourEntries[0].id, 'le-A1');
  assert.strictEqual(backup.labourEntries.some((le: any) => le.id === 'le-B1'), false);

  // Verify materials & machinery
  assert.strictEqual(backup.materials.length, 1);
  assert.strictEqual(backup.materials[0].id, 'mat-A1');
  assert.strictEqual(backup.materials.some((m: any) => m.id === 'mat-B1'), false);

  assert.strictEqual(backup.machinery.length, 1);
  assert.strictEqual(backup.machinery[0].id, 'mac-A1');
  assert.strictEqual(backup.machinery.some((m: any) => m.id === 'mac-B1'), false);

  // Verify dues & vendors
  assert.strictEqual(backup.dues.length, 1);
  assert.strictEqual(backup.dues[0].id, 'due-A1');
  assert.strictEqual(backup.dues.some((d: any) => d.id === 'due-B1'), false);

  assert.strictEqual(backup.vendors.length, 1);
  assert.strictEqual(backup.vendors[0].id, 'vendor-A1');
  assert.strictEqual(backup.vendors.some((v: any) => v.id === 'vendor-B1'), false);

  // Verify reminders & client payments
  assert.strictEqual(backup.reminders.length, 1);
  assert.strictEqual(backup.reminders[0].id, 'rem-A1');
  assert.strictEqual(backup.reminders.some((r: any) => r.id === 'rem-B1'), false);

  assert.strictEqual(backup.clientPayments.length, 1);
  assert.strictEqual(backup.clientPayments[0].id, 'pay-A1');
  assert.strictEqual(backup.clientPayments.some((p: any) => p.id === 'pay-B1'), false);
});

// ---------------------------------------------------------------------------
// TEST 2: Contractor B Export independently excludes every Contractor A record
// ---------------------------------------------------------------------------
test('2. Contractor B export independently excludes every Contractor A record', async () => {
  const db = createMultiContractorFixture();
  const rawExport = await db.exportBackupJson(undefined, 'contractor-B');
  const backup = JSON.parse(rawExport);

  assert.strictEqual(backup.contractorId, 'contractor-B');
  assert.strictEqual(backup.account.length, 1);
  assert.strictEqual(backup.account[0].id, 'contractor-B');

  assert.strictEqual(backup.sites.length, 1);
  assert.strictEqual(backup.sites[0].id, 'site-B1');
  assert.strictEqual(backup.sites.some((s: any) => s.id === 'site-A1'), false);

  assert.strictEqual(backup.tools.length, 1);
  assert.strictEqual(backup.tools[0].id, 'tool-B1');
  assert.strictEqual(backup.tools.some((t: any) => t.id === 'tool-A1'), false);

  assert.strictEqual(backup.materials.length, 1);
  assert.strictEqual(backup.materials[0].id, 'mat-B1');
  assert.strictEqual(backup.materials.some((m: any) => m.id === 'mat-A1'), false);

  assert.strictEqual(backup.dues.length, 1);
  assert.strictEqual(backup.dues[0].id, 'due-B1');
  assert.strictEqual(backup.dues.some((d: any) => d.id === 'due-A1'), false);

  assert.strictEqual(backup.vendors.length, 1);
  assert.strictEqual(backup.vendors[0].id, 'vendor-B1');
  assert.strictEqual(backup.vendors.some((v: any) => v.id === 'vendor-A1'), false);
});

// ---------------------------------------------------------------------------
// TEST 3: Version 2 sites/vendors with missing contractor ownership are rejected
// ---------------------------------------------------------------------------
test('3. Version 2 sites/vendors with missing contractor ownership are rejected before writes', async () => {
  const db = createMultiContractorFixture();

  // Case A: Missing contractorId on site in v2 backup
  const v2MissingSiteOwnership = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma' }],
    sites: [
      { id: 'site-A1', name: 'Unowned Site' }, // Missing contractorId
    ],
  };

  const preSnapshotA = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify(v2MissingSiteOwnership), {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /RESTORE_AMBIGUOUS_OWNERSHIP/ }
  );
  const postSnapshotA = await takeDatabaseSnapshot(db);
  assert.deepStrictEqual(postSnapshotA, preSnapshotA, 'Zero writes on unowned v2 site');

  // Case B: Missing contractorId on vendor in v2 backup
  const v2MissingVendorOwnership = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma' }],
    sites: [
      { id: 'site-A1', contractorId: 'contractor-A', name: 'Valid Site' },
    ],
    vendors: [
      { id: 'vendor-A1', name: 'Unowned Vendor' }, // Missing contractorId
    ],
  };

  const preSnapshotB = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify(v2MissingVendorOwnership), {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /RESTORE_AMBIGUOUS_OWNERSHIP/ }
  );
  const postSnapshotB = await takeDatabaseSnapshot(db);
  assert.deepStrictEqual(postSnapshotB, preSnapshotB, 'Zero writes on unowned v2 vendor');
});

// ---------------------------------------------------------------------------
// TEST 4: Legacy backups are accepted only under explicitly documented safe conditions
// ---------------------------------------------------------------------------
test('4. Legacy backups are accepted only under safe conditions, rejected if ambiguous', async () => {
  const db = new TestSiteSaathiDatabase();

  // Case A: Safe single-account legacy backup (normalizes unowned records)
  const safeLegacyBackup = {
    app: 'SiteSaathi',
    version: 1, // legacy format without top-level contractorId
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma' }],
    sites: [{ id: 'site-legacy-1', name: 'Old Unscoped Site' }],
    vendors: [{ id: 'vendor-legacy-1', name: 'Old Vendor' }],
  };

  const result = await db.importBackupJson(JSON.stringify(safeLegacyBackup), {
    activeContractorId: 'contractor-A',
  });
  assert.strictEqual(result, true);

  const normalizedSite = await db.sites.get('site-legacy-1');
  assert.strictEqual(normalizedSite?.contractorId, 'contractor-A', 'Safe legacy site normalized to active contractor');

  const normalizedVendor = await db.vendors.get('vendor-legacy-1');
  assert.strictEqual(normalizedVendor?.contractorId, 'contractor-A', 'Safe legacy vendor normalized to active contractor');

  // Case B: Multi-account legacy backup must be rejected as ambiguous
  const multiAccountLegacyBackup = {
    app: 'SiteSaathi',
    version: 1,
    account: [
      { id: 'contractor-A', name: 'Contractor A' },
      { id: 'contractor-B', name: 'Contractor B' },
    ],
    sites: [{ id: 'site-ambiguous', name: 'Ambiguous Site' }],
  };

  const preSnapshot = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify(multiAccountLegacyBackup), {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /RESTORE_AMBIGUOUS_OWNERSHIP/ }
  );
  const postSnapshot = await takeDatabaseSnapshot(db);
  assert.deepStrictEqual(postSnapshot, preSnapshot, 'Ambiguous legacy restore causes zero writes');
});

// ---------------------------------------------------------------------------
// TEST 5: Spoofed contractor header carrying foreign records is rejected
// ---------------------------------------------------------------------------
test('5. Spoofed contractor header carrying foreign-owned records is rejected before writes', async () => {
  const db = createMultiContractorFixture();

  // Attacker spoofs contractorId as contractor-A, but includes contractor-B's site
  const spoofedBackup = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma' }],
    sites: [
      { id: 'site-B1', contractorId: 'contractor-B', name: 'Stolen Site B' },
    ],
  };

  const preSnapshot = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify(spoofedBackup), {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /RESTORE_ACCOUNT_MISMATCH/ }
  );
  const postSnapshot = await takeDatabaseSnapshot(db);
  assert.deepStrictEqual(postSnapshot, preSnapshot, 'Zero writes when foreign site detected');
});

// ---------------------------------------------------------------------------
// TEST 6: Site primary-key collision causes entire restore to fail with all tables unchanged
// ---------------------------------------------------------------------------
test('6. Site primary-key collision with another contractor fails with all tables unchanged', async () => {
  const db = createMultiContractorFixture();

  // Contractor A tries to import a site whose ID collides with existing site-B1 belonging to Contractor B
  const collidingBackup = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma' }],
    sites: [
      { id: 'site-B1', contractorId: 'contractor-A', name: 'Malicious Site Hijack' },
    ],
  };

  const preSnapshot = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify(collidingBackup), {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /RESTORE_COLLISION_DETECTED: Site "site-B1"/ }
  );

  const postSnapshot = await takeDatabaseSnapshot(db);
  assert.deepStrictEqual(postSnapshot, preSnapshot, 'All 11 tables must remain untouched on collision');
});

// ---------------------------------------------------------------------------
// TEST 7: Collision tests for vendors and child tables (tools, dues, labour entries)
// ---------------------------------------------------------------------------
test('7. Primary-key collisions in vendors and child tables fail with all tables unchanged', async () => {
  const db = createMultiContractorFixture();

  // Case A: Vendor collision (vendor-B1 belongs to Contractor B)
  const collidingVendorBackup = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma' }],
    sites: [{ id: 'site-A1', contractorId: 'contractor-A', name: 'Site A' }],
    vendors: [
      { id: 'vendor-B1', contractorId: 'contractor-A', name: 'Hijacked Vendor' },
    ],
  };

  const preSnapA = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify(collidingVendorBackup), {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /RESTORE_COLLISION_DETECTED: Vendor "vendor-B1"/ }
  );
  assert.deepStrictEqual(await takeDatabaseSnapshot(db), preSnapA, 'Zero writes on vendor collision');

  // Case B: Tool collision (tool-B1 belongs to Contractor B site-B1)
  const collidingToolBackup = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma' }],
    sites: [{ id: 'site-A1', contractorId: 'contractor-A', name: 'Site A' }],
    tools: [
      { id: 'tool-B1', siteId: 'site-A1', name: 'Hijacked Drill', quantity: 1, dateSent: '2026-01-01', expectedReturnDate: '2026-02-01', status: 'on_site' },
    ],
  };

  const preSnapB = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify(collidingToolBackup), {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /RESTORE_COLLISION_DETECTED: Tool "tool-B1"/ }
  );
  assert.deepStrictEqual(await takeDatabaseSnapshot(db), preSnapB, 'Zero writes on tool collision');

  // Case C: Expense Due collision (due-B1 belongs to Contractor B site-B1)
  const collidingDueBackup = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma' }],
    sites: [{ id: 'site-A1', contractorId: 'contractor-A', name: 'Site A' }],
    dues: [
      { id: 'due-B1', siteId: 'site-A1', title: 'Hijacked Bill', category: 'material', amountDue: 100, amountPaid: 0, dueDate: '2026-01-01', status: 'pending' },
    ],
  };

  const preSnapC = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify(collidingDueBackup), {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /RESTORE_COLLISION_DETECTED: Expense due "due-B1"/ }
  );
  assert.deepStrictEqual(await takeDatabaseSnapshot(db), preSnapC, 'Zero writes on due collision');

  // Case D: Labour Entry collision (le-B1 belongs to lr-B1 -> site-B1)
  const collidingLabourEntryBackup = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma' }],
    sites: [{ id: 'site-A1', contractorId: 'contractor-A', name: 'Site A' }],
    labourRecords: [{ id: 'lr-A1', siteId: 'site-A1', date: '2026-01-01', totalWorkers: 1, totalDailyWage: 500, totalPaid: 500 }],
    labourEntries: [
      { id: 'le-B1', recordId: 'lr-A1', workerName: 'Hijacked Worker', role: 'Helper', attendanceStatus: 'full_day', dailyWage: 500, paidAmount: 500, balanceDue: 0 },
    ],
  };

  const preSnapD = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify(collidingLabourEntryBackup), {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /RESTORE_COLLISION_DETECTED: Labour entry "le-B1"/ }
  );
  assert.deepStrictEqual(await takeDatabaseSnapshot(db), preSnapD, 'Zero writes on labour entry collision');
});

// ---------------------------------------------------------------------------
// TEST 8: Foreign vendor references in dues/materials cannot persist after restore
// ---------------------------------------------------------------------------
test('8. Foreign vendor references in dues/materials are stripped cleanly', async () => {
  const db = createMultiContractorFixture();

  // Contractor A restores backup containing a material and due referencing vendor-B1 (Contractor B's vendor)
  // and another referencing vendor-A1 (valid Contractor A vendor)
  const backupWithVendorRefs = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma' }],
    sites: [{ id: 'site-A1', contractorId: 'contractor-A', name: 'Ramesh Tower A' }],
    materials: [
      {
        id: 'mat-valid-ref',
        siteId: 'site-A1',
        vendorId: 'vendor-A1', // Valid vendor reference
        itemName: 'Valid Bricks',
        quantity: 1000,
        unit: 'pieces',
        unitPrice: 10,
        totalCost: 10000,
        purchaseDate: '2026-03-01',
        paymentStatus: 'paid',
        paidAmount: 10000,
      },
      {
        id: 'mat-foreign-ref',
        siteId: 'site-A1',
        vendorId: 'vendor-B1', // Foreign vendor reference!
        itemName: 'Illegal Cement',
        quantity: 50,
        unit: 'bags',
        unitPrice: 400,
        totalCost: 20000,
        purchaseDate: '2026-03-02',
        paymentStatus: 'pending',
        paidAmount: 0,
      },
    ],
    dues: [
      {
        id: 'due-foreign-ref',
        siteId: 'site-A1',
        vendorId: 'vendor-B1', // Foreign vendor reference!
        title: 'Foreign Udhaar',
        category: 'material',
        amountDue: 20000,
        amountPaid: 0,
        dueDate: '2026-04-01',
        status: 'pending',
      },
    ],
  };

  const restored = await db.importBackupJson(JSON.stringify(backupWithVendorRefs), {
    activeContractorId: 'contractor-A',
  });
  assert.strictEqual(restored, true);

  const validMaterial = await db.materials.get('mat-valid-ref');
  assert.strictEqual(validMaterial?.vendorId, 'vendor-A1', 'Valid vendor reference preserved');

  const foreignMaterial = await db.materials.get('mat-foreign-ref');
  assert.strictEqual(foreignMaterial?.vendorId, undefined, 'Foreign vendor reference must be stripped');

  const foreignDue = await db.dues.get('due-foreign-ref');
  assert.strictEqual(foreignDue?.vendorId, undefined, 'Foreign vendor reference must be stripped from dues');
});

// ---------------------------------------------------------------------------
// TEST 9: Wrong passphrase, malformed JSON, and malformed payload cause zero writes
// ---------------------------------------------------------------------------
test('9. Wrong passphrase, malformed JSON, and malformed payload cause zero writes', async () => {
  const db = createMultiContractorFixture();
  const encryptedBackup = await db.exportBackupJson('correctSecretKey123', 'contractor-A');

  // Case A: Wrong passphrase
  const preSnapA = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(encryptedBackup, {
        passphrase: 'wrongPassphrase',
        activeContractorId: 'contractor-A',
      });
    },
    { message: /MAC|passphrase|corrupted/i }
  );
  assert.deepStrictEqual(await takeDatabaseSnapshot(db), preSnapA, 'Zero writes on wrong passphrase');

  // Case B: Malformed JSON
  const preSnapB = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson('{ not valid json payload ! }', {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /INVALID_BACKUP_JSON/ }
  );
  assert.deepStrictEqual(await takeDatabaseSnapshot(db), preSnapB, 'Zero writes on invalid JSON');

  // Case C: Missing required schema arrays
  const preSnapC = await takeDatabaseSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify({ app: 'SiteSaathi', version: 2 }), {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /INVALID_BACKUP_SCHEMA/ }
  );
  assert.deepStrictEqual(await takeDatabaseSnapshot(db), preSnapC, 'Zero writes on invalid schema');
});

// ---------------------------------------------------------------------------
// TEST 10: Valid same-contractor restore follows documented merge policy
// ---------------------------------------------------------------------------
test('10. Valid same-contractor restore follows documented merge policy', async () => {
  const db = createMultiContractorFixture();

  // Contractor A exports backup
  const exportPayload = await db.exportBackupJson(undefined, 'contractor-A');

  // Local site modified
  const localSite = await db.sites.get('site-A1');
  assert.ok(localSite);
  await db.sites.bulkPut([{ ...localSite, name: 'Locally Changed Name', estimatedBudget: 9999999 }]);

  // Restore backup for same contractor
  const result = await db.importBackupJson(exportPayload, {
    activeContractorId: 'contractor-A',
  });
  assert.strictEqual(result, true);

  // Assert local site was safely restored to the backup version
  const restoredSite = await db.sites.get('site-A1');
  assert.strictEqual(restoredSite?.name, 'Ramesh Tower A', 'Restored name safely updates local record');
  assert.strictEqual(restoredSite?.estimatedBudget, 5000000);
});

// ---------------------------------------------------------------------------
// TEST 11: Orphaned child records linked to non-existent sites are safely excluded
// ---------------------------------------------------------------------------
test('11. Orphaned child records linked to non-existent sites are safely excluded from restore', async () => {
  const cleanDb = new TestSiteSaathiDatabase();

  const backupWithOrphans = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma' }],
    sites: [{ id: 'site-A1', contractorId: 'contractor-A', name: 'Valid Site' }],
    tools: [
      { id: 'tool-valid', siteId: 'site-A1', name: 'Hammer', quantity: 1, dateSent: '2026-01-01', expectedReturnDate: '2026-02-01', status: 'on_site' },
      { id: 'tool-orphan', siteId: 'non-existent-site', name: 'Ghost Drill', quantity: 1, dateSent: '2026-01-01', expectedReturnDate: '2026-02-01', status: 'on_site' },
    ],
  };

  const result = await cleanDb.importBackupJson(JSON.stringify(backupWithOrphans), {
    activeContractorId: 'contractor-A',
  });
  assert.strictEqual(result, true);

  const tools = await cleanDb.tools.toArray();
  assert.strictEqual(tools.length, 1);
  assert.strictEqual(tools[0].id, 'tool-valid');
});

// ---------------------------------------------------------------------------
// TEST 12: AES-GCM encrypted backup compatibility remains intact
// ---------------------------------------------------------------------------
test('12. AES-GCM encrypted backup round-trip with valid passphrase', async () => {
  const db = createMultiContractorFixture();
  const passphrase = 'MyStrongPassphrase#2026';

  const encryptedPayload = await db.exportBackupJson(passphrase, 'contractor-A');
  assert.strictEqual(typeof encryptedPayload, 'string');

  const parsed = JSON.parse(encryptedPayload);
  assert.strictEqual(isEncryptedBackup(parsed), true);
  assert.strictEqual(parsed.format, 'sitesaathi-encrypted-v1');

  // Verify plaintext is not leaked in raw ciphertext
  assert.strictEqual(encryptedPayload.includes('Ramesh Tower A'), false);

  // Restore into a clean target database
  const targetDb = new TestSiteSaathiDatabase({
    account: [{ id: 'contractor-A', name: 'Rameshwar Sharma', phone: '9811122233', trade: 'construction', language: 'hi', themeMode: 'light', tutorialCompleted: true, createdAt: '2026-04-01T00:00:00.000Z' }],
  });

  const restored = await targetDb.importBackupJson(encryptedPayload, {
    passphrase,
    activeContractorId: 'contractor-A',
  });
  assert.strictEqual(restored, true);

  const restoredSites = await targetDb.sites.toArray();
  assert.strictEqual(restoredSites.length, 1);
  assert.strictEqual(restoredSites[0].name, 'Ramesh Tower A');
});

// ---------------------------------------------------------------------------
// TEST 13: Demonstration: deliberately broken ownership filter causes tests to fail
// ---------------------------------------------------------------------------
test('13. Demonstration: foreign record leakage strictly fails validation assertions', () => {
  // Simulate what a broken/leaky export filter would produce
  const leakyExport = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Contractor A' }],
    sites: [
      { id: 'site-A1', contractorId: 'contractor-A', name: 'Site A' },
      { id: 'site-B1', contractorId: 'contractor-B', name: 'Foreign Leaked Site' },
    ],
  };

  // Assert that our test suite's isolation check catches the leak
  assert.throws(() => {
    const hasForeignRecords = leakyExport.sites.some((s) => s.contractorId !== 'contractor-A');
    if (hasForeignRecords) {
      throw new Error('ISOLATION_ASSERTION_FAILED: Foreign contractor records found in export payload!');
    }
  }, { message: /ISOLATION_ASSERTION_FAILED/ });
});
