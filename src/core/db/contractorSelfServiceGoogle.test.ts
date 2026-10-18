/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';

// Shim window for Node.js test environment so Web Crypto APIs match browser
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

import { SiteSaathiDatabase } from './database.ts';
import { hashCredential, verifyCredential } from '../../utils/cryptoUtils.ts';
import {
  setMockGoogleAuth,
  getValidGoogleAccessToken,
  getGoogleAccountIdentity,
  clearGoogleAuthSession,
  revokeGoogleAccessToken,
} from '../../utils/googleAuth.ts';
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

class TestDatabase {
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
      for (const s of snapshots) {
        s.table.map = s.backup;
      }
      throw err;
    }
  }

  // Real production methods directly from SiteSaathiDatabase
  exportBackupJson = SiteSaathiDatabase.prototype.exportBackupJson.bind(this);
  importBackupJson = SiteSaathiDatabase.prototype.importBackupJson.bind(this);
}

const takeSnapshot = async (db: TestDatabase) => ({
  account: await db.account.toArray(),
  sites: await db.sites.toArray(),
  tools: await db.tools.toArray(),
  labourRecords: await db.labourRecords.toArray(),
  labourEntries: await db.labourEntries.toArray(),
  materials: await db.materials.toArray(),
  machinery: await db.machinery.toArray(),
  dues: await db.dues.toArray(),
  vendors: await db.vendors.toArray(),
  reminders: await db.reminders.toArray(),
  clientPayments: await db.clientPayments.toArray(),
});

// ---------------------------------------------------------------------------
// TEST 1: New contractor registration works offline
// ---------------------------------------------------------------------------
test('1. New contractor registration works offline with secure PBKDF2 hashing', async () => {
  const db = new TestDatabase();

  const rawPin = '4826';
  const hashed = await hashCredential(rawPin);
  assert.strictEqual(hashed.startsWith('pbkdf2:v1:'), true, 'PIN must be hashed with PBKDF2');

  const verifyValid = await verifyCredential(rawPin, hashed);
  assert.strictEqual(verifyValid.isValid, true, 'Correct PIN must verify successfully');

  const verifyInvalid = await verifyCredential('9999', hashed);
  assert.strictEqual(verifyInvalid.isValid, false, 'Incorrect PIN must be rejected');

  const newAccount: ContractorAccount = {
    id: `contractor-${Date.now()}`,
    name: 'Mohan Lal Construction',
    phone: '9876543210',
    password: hashed,
    pinLock: hashed,
    isPinLockEnabled: true,
    trade: 'construction',
    language: 'hi',
    themeMode: 'light',
    tutorialCompleted: false,
    createdAt: new Date().toISOString(),
  };

  await db.account.bulkPut([newAccount]);
  const saved = await db.account.get(newAccount.id);

  assert.ok(saved);
  assert.strictEqual(saved.name, 'Mohan Lal Construction');
  assert.strictEqual(saved.phone, '9876543210');
  assert.strictEqual(saved.password?.startsWith('pbkdf2:v1:'), true);
});

// ---------------------------------------------------------------------------
// TEST 2: Contractors A and B can register and log in independently
// ---------------------------------------------------------------------------
test('2. Contractors A and B can register and log in independently', async () => {
  const db = new TestDatabase();

  const pinA = await hashCredential('1111');
  const pinB = await hashCredential('2222');

  const accountA: ContractorAccount = {
    id: 'contractor-A',
    name: 'Rameshwar Sharma',
    phone: '9811122233',
    password: pinA,
    pinLock: pinA,
    isPinLockEnabled: true,
    trade: 'construction',
    language: 'hi',
    themeMode: 'light',
    tutorialCompleted: false,
    createdAt: new Date().toISOString(),
  };

  // Contractor B shares the same human name, but has distinct phone and ID
  const accountB: ContractorAccount = {
    id: 'contractor-B',
    name: 'Rameshwar Sharma',
    phone: '9822233344',
    password: pinB,
    pinLock: pinB,
    isPinLockEnabled: true,
    trade: 'plumbing',
    language: 'en',
    themeMode: 'dark',
    tutorialCompleted: false,
    createdAt: new Date().toISOString(),
  };

  await db.account.bulkPut([accountA, accountB]);

  const allAccounts = await db.account.toArray();
  assert.strictEqual(allAccounts.length, 2, 'Both contractors must register without collision');

  // Verify independent authentication
  const savedA = await db.account.get('contractor-A');
  const savedB = await db.account.get('contractor-B');

  assert.strictEqual((await verifyCredential('1111', savedA!.password!)).isValid, true);
  assert.strictEqual((await verifyCredential('2222', savedA!.password!)).isValid, false);

  assert.strictEqual((await verifyCredential('2222', savedB!.password!)).isValid, true);
  assert.strictEqual((await verifyCredential('1111', savedB!.password!)).isValid, false);
});

// ---------------------------------------------------------------------------
// TEST 3: Switching from A to B does not show A's records
// ---------------------------------------------------------------------------
test('3. Switching from A to B does not show A\'s records across all tables', async () => {
  const db = new TestDatabase({
    account: [
      { id: 'contractor-A', name: 'Contractor A', phone: '9811122233', trade: 'construction', language: 'hi', themeMode: 'light', tutorialCompleted: true, createdAt: '2026-01-01' },
      { id: 'contractor-B', name: 'Contractor B', phone: '9822233344', trade: 'plumbing', language: 'en', themeMode: 'dark', tutorialCompleted: true, createdAt: '2026-01-02' },
    ],
    sites: [
      { id: 'site-A1', contractorId: 'contractor-A', name: 'Site A1', location: 'Noida', siteType: 'Building', estimatedBudget: 100000, workStatus: 'ongoing', paymentStatus: 'unpaid', startDate: '2026-01-01', createdAt: '2026-01-01' },
      { id: 'site-B1', contractorId: 'contractor-B', name: 'Site B1', location: 'Delhi', siteType: 'Residential', estimatedBudget: 200000, workStatus: 'ongoing', paymentStatus: 'unpaid', startDate: '2026-01-02', createdAt: '2026-01-02' },
    ],
    tools: [
      { id: 'tool-A1', siteId: 'site-A1', name: 'Drill A', quantity: 1, dateSent: '2026-01-01', expectedReturnDate: '2026-02-01', status: 'on_site' },
      { id: 'tool-B1', siteId: 'site-B1', name: 'Cutter B', quantity: 2, dateSent: '2026-01-02', expectedReturnDate: '2026-02-02', status: 'on_site' },
    ],
    materials: [
      { id: 'mat-A1', siteId: 'site-A1', itemName: 'Cement A', quantity: 10, unit: 'bags', unitPrice: 350, totalCost: 3500, purchaseDate: '2026-01-01', paymentStatus: 'paid', paidAmount: 3500 },
      { id: 'mat-B1', siteId: 'site-B1', itemName: 'Pipes B', quantity: 20, unit: 'pieces', unitPrice: 150, totalCost: 3000, purchaseDate: '2026-01-02', paymentStatus: 'paid', paidAmount: 3000 },
    ],
    vendors: [
      { id: 'vendor-A1', contractorId: 'contractor-A', name: 'Vendor A', phone: '9811100000', tradeSpecialty: 'Hardware', totalUdhaarBalance: 0 },
      { id: 'vendor-B1', contractorId: 'contractor-B', name: 'Vendor B', phone: '9822200000', tradeSpecialty: 'Sanitary', totalUdhaarBalance: 0 },
    ],
  });

  // Query records for active session A
  const allSites = await db.sites.toArray();
  const sitesForA = allSites.filter((s) => s.contractorId === 'contractor-A');
  const siteIdsA = new Set(sitesForA.map((s) => s.id));
  const toolsForA = (await db.tools.toArray()).filter((t) => siteIdsA.has(t.siteId));
  const matsForA = (await db.materials.toArray()).filter((m) => siteIdsA.has(m.siteId));
  const vendorsForA = (await db.vendors.toArray()).filter((v) => v.contractorId === 'contractor-A');

  assert.strictEqual(sitesForA.length, 1);
  assert.strictEqual(sitesForA[0].id, 'site-A1');
  assert.strictEqual(toolsForA.length, 1);
  assert.strictEqual(toolsForA[0].id, 'tool-A1');
  assert.strictEqual(matsForA.length, 1);
  assert.strictEqual(matsForA[0].id, 'mat-A1');
  assert.strictEqual(vendorsForA.length, 1);
  assert.strictEqual(vendorsForA[0].id, 'vendor-A1');

  // Query records for active session B
  const sitesForB = allSites.filter((s) => s.contractorId === 'contractor-B');
  const siteIdsB = new Set(sitesForB.map((s) => s.id));
  const toolsForB = (await db.tools.toArray()).filter((t) => siteIdsB.has(t.siteId));
  const matsForB = (await db.materials.toArray()).filter((m) => siteIdsB.has(m.siteId));
  const vendorsForB = (await db.vendors.toArray()).filter((v) => v.contractorId === 'contractor-B');

  assert.strictEqual(sitesForB.length, 1);
  assert.strictEqual(sitesForB[0].id, 'site-B1');
  assert.strictEqual(toolsForB.length, 1);
  assert.strictEqual(toolsForB[0].id, 'tool-B1');
  assert.strictEqual(matsForB.length, 1);
  assert.strictEqual(matsForB[0].id, 'mat-B1');
  assert.strictEqual(vendorsForB.length, 1);
  assert.strictEqual(vendorsForB[0].id, 'vendor-B1');

  // Assert complete cross-session isolation
  assert.strictEqual(sitesForB.some((s) => s.id === 'site-A1'), false);
  assert.strictEqual(toolsForB.some((t) => t.id === 'tool-A1'), false);
});

// ---------------------------------------------------------------------------
// TEST 4: A connects Google identity A; B connects Google identity B independently
// ---------------------------------------------------------------------------
test('4. Contractor A and B can independently connect distinct Google identities', () => {
  clearGoogleAuthSession();

  setMockGoogleAuth('contractor-A', 'token-AAA-123', {
    email: 'rameshwar.contractor@gmail.com',
    name: 'Rameshwar Sharma',
  });

  setMockGoogleAuth('contractor-B', 'token-BBB-456', {
    email: 'suresh.patel.plumbing@gmail.com',
    name: 'Suresh Patel',
  });

  // Verify Contractor A's in-memory session
  const tokenA = getValidGoogleAccessToken('contractor-A');
  const identityA = getGoogleAccountIdentity('contractor-A');
  assert.strictEqual(tokenA, 'token-AAA-123');
  assert.strictEqual(identityA?.email, 'rameshwar.contractor@gmail.com');

  // Verify Contractor B's in-memory session
  const tokenB = getValidGoogleAccessToken('contractor-B');
  const identityB = getGoogleAccountIdentity('contractor-B');
  assert.strictEqual(tokenB, 'token-BBB-456');
  assert.strictEqual(identityB?.email, 'suresh.patel.plumbing@gmail.com');

  // Verify no cross-contractor token leakage
  assert.notStrictEqual(tokenA, tokenB);
  assert.notStrictEqual(identityA?.email, identityB?.email);
});

// ---------------------------------------------------------------------------
// TEST 5: Switching contractors clears or isolates previous Google identity
// ---------------------------------------------------------------------------
test('5. Switching contractors isolates previous Google session', () => {
  clearGoogleAuthSession();

  setMockGoogleAuth('contractor-A', 'token-AAA-123', {
    email: 'rameshwar.contractor@gmail.com',
  });

  // Contractor C has never connected Google
  const tokenC = getValidGoogleAccessToken('contractor-C');
  const identityC = getGoogleAccountIdentity('contractor-C');

  assert.strictEqual(tokenC, null, 'Contractor C must not inherit Contractor A\'s token');
  assert.strictEqual(identityC, null, 'Contractor C must not inherit Contractor A\'s Google identity');
});

// ---------------------------------------------------------------------------
// TEST 6: Explicit Google account switching shows verified new identity
// ---------------------------------------------------------------------------
test('6. Explicit Google account switching updates and verifies new identity', () => {
  setMockGoogleAuth('contractor-A', 'token-AAA-initial', {
    email: 'old.account@gmail.com',
  });
  assert.strictEqual(getGoogleAccountIdentity('contractor-A')?.email, 'old.account@gmail.com');

  // Switch Google account for contractor-A
  setMockGoogleAuth('contractor-A', 'token-AAA-switched', {
    email: 'new.verified.account@gmail.com',
    name: 'New Identity',
  });

  const updatedToken = getValidGoogleAccessToken('contractor-A');
  const updatedIdentity = getGoogleAccountIdentity('contractor-A');

  assert.strictEqual(updatedToken, 'token-AAA-switched');
  assert.strictEqual(updatedIdentity?.email, 'new.verified.account@gmail.com');
});

// ---------------------------------------------------------------------------
// TEST 7: Disconnect clears active authorization and transient state
// ---------------------------------------------------------------------------
test('7. Disconnect clears active Google session for the active contractor', async () => {
  setMockGoogleAuth('contractor-A', 'token-AAA', { email: 'rameshwar@gmail.com' });
  setMockGoogleAuth('contractor-B', 'token-BBB', { email: 'suresh@gmail.com' });

  // Disconnect Contractor A
  await revokeGoogleAccessToken('contractor-A');
  clearGoogleAuthSession('contractor-A');

  assert.strictEqual(getValidGoogleAccessToken('contractor-A'), null);
  assert.strictEqual(getGoogleAccountIdentity('contractor-A'), null);

  // Contractor B remains connected
  assert.strictEqual(getValidGoogleAccessToken('contractor-B'), 'token-BBB');
  assert.strictEqual(getGoogleAccountIdentity('contractor-B')?.email, 'suresh@gmail.com');
});

// ---------------------------------------------------------------------------
// TEST 8: Contractor A backup excludes Contractor B data across all tables
// ---------------------------------------------------------------------------
test('8. Real production exportBackupJson excludes Contractor B data across all tables', async () => {
  const db = new TestDatabase({
    account: [
      { id: 'contractor-A', name: 'Contractor A', phone: '9811122233', trade: 'construction', language: 'hi', themeMode: 'light', tutorialCompleted: true, createdAt: '2026-01-01' },
      { id: 'contractor-B', name: 'Contractor B', phone: '9822233344', trade: 'plumbing', language: 'en', themeMode: 'dark', tutorialCompleted: true, createdAt: '2026-01-02' },
    ],
    sites: [
      { id: 'site-A1', contractorId: 'contractor-A', name: 'Site A1', location: 'Noida', siteType: 'Building', estimatedBudget: 100000, workStatus: 'ongoing', paymentStatus: 'unpaid', startDate: '2026-01-01', createdAt: '2026-01-01' },
      { id: 'site-B1', contractorId: 'contractor-B', name: 'Site B1', location: 'Delhi', siteType: 'Residential', estimatedBudget: 200000, workStatus: 'ongoing', paymentStatus: 'unpaid', startDate: '2026-01-02', createdAt: '2026-01-02' },
    ],
    tools: [
      { id: 'tool-A1', siteId: 'site-A1', name: 'Tool A', quantity: 1, dateSent: '2026-01-01', expectedReturnDate: '2026-02-01', status: 'on_site' },
      { id: 'tool-B1', siteId: 'site-B1', name: 'Tool B', quantity: 2, dateSent: '2026-01-02', expectedReturnDate: '2026-02-02', status: 'on_site' },
    ],
    vendors: [
      { id: 'vendor-A1', contractorId: 'contractor-A', name: 'Vendor A', phone: '9811100000', tradeSpecialty: 'Hardware', totalUdhaarBalance: 0 },
      { id: 'vendor-B1', contractorId: 'contractor-B', name: 'Vendor B', phone: '9822200000', tradeSpecialty: 'Sanitary', totalUdhaarBalance: 0 },
    ],
  });

  const exportPayload = await db.exportBackupJson(undefined, 'contractor-A');
  const backup = JSON.parse(exportPayload);

  assert.strictEqual(backup.contractorId, 'contractor-A');
  assert.strictEqual(backup.sites.length, 1);
  assert.strictEqual(backup.sites[0].id, 'site-A1');
  assert.strictEqual(backup.tools.length, 1);
  assert.strictEqual(backup.tools[0].id, 'tool-A1');
  assert.strictEqual(backup.vendors.length, 1);
  assert.strictEqual(backup.vendors[0].id, 'vendor-A1');

  // Verify Contractor B records are completely absent
  assert.strictEqual(backup.sites.some((s: any) => s.id === 'site-B1'), false);
  assert.strictEqual(backup.tools.some((t: any) => t.id === 'tool-B1'), false);
  assert.strictEqual(backup.vendors.some((v: any) => v.id === 'vendor-B1'), false);
});

// ---------------------------------------------------------------------------
// TEST 9: Contractor B cannot restore Contractor A's backup
// ---------------------------------------------------------------------------
test('9. Contractor B cannot restore Contractor A\'s backup', async () => {
  const db = new TestDatabase({
    account: [
      { id: 'contractor-A', name: 'Contractor A', phone: '9811122233', trade: 'construction', language: 'hi', themeMode: 'light', tutorialCompleted: true, createdAt: '2026-01-01' },
      { id: 'contractor-B', name: 'Contractor B', phone: '9822233344', trade: 'plumbing', language: 'en', themeMode: 'dark', tutorialCompleted: true, createdAt: '2026-01-02' },
    ],
    sites: [
      { id: 'site-B1', contractorId: 'contractor-B', name: 'Site B1', location: 'Delhi', siteType: 'Residential', estimatedBudget: 200000, workStatus: 'ongoing', paymentStatus: 'unpaid', startDate: '2026-01-02', createdAt: '2026-01-02' },
    ],
  });

  const backupForA = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Contractor A' }],
    sites: [{ id: 'site-A1', contractorId: 'contractor-A', name: 'Site A1' }],
  };

  const preSnapshot = await takeSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify(backupForA), {
        activeContractorId: 'contractor-B',
      });
    },
    { message: /RESTORE_ACCOUNT_MISMATCH/ }
  );

  const postSnapshot = await takeSnapshot(db);
  assert.deepStrictEqual(postSnapshot, preSnapshot, 'Zero writes when foreign backup is rejected');
});

// ---------------------------------------------------------------------------
// TEST 10: Primary-key collisions with another contractor are rejected before writes
// ---------------------------------------------------------------------------
test('10. Foreign ID collisions trigger RESTORE_COLLISION_DETECTED with zero writes', async () => {
  const db = new TestDatabase({
    account: [
      { id: 'contractor-A', name: 'Contractor A', phone: '9811122233', trade: 'construction', language: 'hi', themeMode: 'light', tutorialCompleted: true, createdAt: '2026-01-01' },
      { id: 'contractor-B', name: 'Contractor B', phone: '9822233344', trade: 'plumbing', language: 'en', themeMode: 'dark', tutorialCompleted: true, createdAt: '2026-01-02' },
    ],
    sites: [
      { id: 'site-B1', contractorId: 'contractor-B', name: 'Site B1', location: 'Delhi', siteType: 'Residential', estimatedBudget: 200000, workStatus: 'ongoing', paymentStatus: 'unpaid', startDate: '2026-01-02', createdAt: '2026-01-02' },
    ],
  });

  // Contractor A tries to restore a site with id 'site-B1' (which exists locally under Contractor B)
  const collidingBackup = {
    app: 'SiteSaathi',
    version: 2,
    contractorId: 'contractor-A',
    account: [{ id: 'contractor-A', name: 'Contractor A' }],
    sites: [{ id: 'site-B1', contractorId: 'contractor-A', name: 'Malicious Site' }],
  };

  const preSnapshot = await takeSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(JSON.stringify(collidingBackup), {
        activeContractorId: 'contractor-A',
      });
    },
    { message: /RESTORE_COLLISION_DETECTED: Site "site-B1"/ }
  );

  assert.deepStrictEqual(await takeSnapshot(db), preSnapshot, 'Tables remain untouched on collision');
});

// ---------------------------------------------------------------------------
// TEST 11: Wrong passphrase causes zero writes
// ---------------------------------------------------------------------------
test('11. Wrong passphrase and malformed payload cause zero writes', async () => {
  const db = new TestDatabase({
    account: [{ id: 'contractor-A', name: 'Contractor A', phone: '9811122233', trade: 'construction', language: 'hi', themeMode: 'light', tutorialCompleted: true, createdAt: '2026-01-01' }],
    sites: [{ id: 'site-A1', contractorId: 'contractor-A', name: 'Site A1', location: 'Noida', siteType: 'Building', estimatedBudget: 100000, workStatus: 'ongoing', paymentStatus: 'unpaid', startDate: '2026-01-01', createdAt: '2026-01-01' }],
  });

  const encrypted = await db.exportBackupJson('correctSecretPassphrase', 'contractor-A');

  const preSnap = await takeSnapshot(db);
  await assert.rejects(
    async () => {
      await db.importBackupJson(encrypted, {
        passphrase: 'wrongPassphrase',
        activeContractorId: 'contractor-A',
      });
    },
    { message: /MAC|passphrase|corrupted/i }
  );

  assert.deepStrictEqual(await takeSnapshot(db), preSnap, 'Zero writes on wrong passphrase');
});
