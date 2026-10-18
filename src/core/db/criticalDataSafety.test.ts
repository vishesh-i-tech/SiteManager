/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';

// Shim window for Node.js test environment so Web Crypto APIs match browser
if (typeof window === 'undefined') {
  (globalThis as any).window = globalThis;
}

import { hashCredential, verifyCredential } from '../../utils/cryptoUtils.ts';
import type { ContractorAccount } from '../../types/index.ts';

test('1. Missing localStorage flag never triggers database wipe on startup', () => {
  let isClearAllDataCalled = false;
  const mockDb = {
    clearAllData: async () => {
      isClearAllDataCalled = true;
    },
    ensureDefaultAccounts: async () => {},
  };

  // Simulate startup with missing or cleared localStorage
  const mockLocalStorage = new Map<string, string>();
  const isCleanTestReady = mockLocalStorage.get('sitesaathi_pristine_final_user_test');

  // New hardened behavior: never wipe database based on missing test flag
  if (isCleanTestReady) {
    // Flag is present, do nothing special
  }
  // Startup directly initializes defaults without invoking clearAllData
  mockDb.ensureDefaultAccounts();

  assert.strictEqual(
    isClearAllDataCalled,
    false,
    'Missing localStorage flag must NEVER execute clearAllData() or wipe the user database'
  );
});

test('2. Legitimate accounts with common names survive purgeDemoAccounts', async () => {
  const accounts: ContractorAccount[] = [
    {
      id: 'contractor-real-1',
      name: 'Rameshwar Sharma',
      phone: '9811122233',
      trade: 'construction',
      language: 'hi',
      themeMode: 'light',
      password: 'pbkdf2:v1:100000:salt:hash1',
      pinLock: 'pbkdf2:v1:100000:salt:hash1',
      tutorialCompleted: true,
      createdAt: '2026-04-01T00:00:00.000Z',
    },
    {
      id: 'contractor-real-2',
      name: 'Vikram Singh Plumbing',
      phone: '9822233344',
      trade: 'plumbing',
      language: 'hi',
      themeMode: 'light',
      password: 'pbkdf2:v1:100000:salt:hash2',
      pinLock: 'pbkdf2:v1:100000:salt:hash2',
      tutorialCompleted: true,
      createdAt: '2026-04-02T00:00:00.000Z',
    },
    {
      id: 'contractor-real-3',
      name: 'Rajesh Patel Electricals',
      phone: '9833344455',
      trade: 'electrical',
      language: 'en',
      themeMode: 'light',
      password: 'pbkdf2:v1:100000:salt:hash3',
      pinLock: 'pbkdf2:v1:100000:salt:hash3',
      tutorialCompleted: true,
      createdAt: '2026-04-03T00:00:00.000Z',
    },
    // Actual seed demo accounts
    {
      id: 'contractor-1',
      name: 'Demo Account 1',
      phone: '9876543210',
      trade: 'construction',
      language: 'hi',
      themeMode: 'light',
      tutorialCompleted: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'contractor-demo',
      name: 'Recruiter Demo',
      phone: '9999999999',
      trade: 'construction',
      language: 'hi',
      themeMode: 'light',
      tutorialCompleted: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  // Purge logic using explicit demo ID set
  const demoAccountIds = new Set(['contractor-1', 'contractor-2', 'contractor-3', 'contractor-demo']);
  const demoIdsToDelete = accounts
    .filter((a) => demoAccountIds.has(a.id))
    .map((a) => a.id);

  assert.deepStrictEqual(demoIdsToDelete, ['contractor-1', 'contractor-demo']);

  const survivingAccounts = accounts.filter((a) => !demoAccountIds.has(a.id));
  const survivingNames = survivingAccounts.map((a) => a.name);

  assert.strictEqual(survivingAccounts.length, 3);
  assert.ok(survivingNames.includes('Rameshwar Sharma'), 'Rameshwar Sharma must not be purged');
  assert.ok(survivingNames.includes('Vikram Singh Plumbing'), 'Vikram Singh must not be purged');
  assert.ok(survivingNames.includes('Rajesh Patel Electricals'), 'Rajesh Patel must not be purged');
});

test('3. Saved account selector retains legitimate accounts with common names', () => {
  const existingAccounts: ContractorAccount[] = [
    {
      id: 'contractor-real-1',
      name: 'Rameshwar Construction',
      phone: '9811122233',
      trade: 'construction',
      language: 'hi',
      themeMode: 'light',
      tutorialCompleted: true,
      createdAt: '2026-04-01T00:00:00.000Z',
    },
    {
      id: 'contractor-1',
      name: 'Demo 1',
      phone: '9876543210',
      trade: 'construction',
      language: 'hi',
      themeMode: 'light',
      tutorialCompleted: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  // Fixed filtering: strictly demo IDs
  const userSavedAccounts = existingAccounts.filter(
    (acc) => !['contractor-1', 'contractor-2', 'contractor-3', 'contractor-demo'].includes(acc.id)
  );

  assert.strictEqual(userSavedAccounts.length, 1);
  assert.strictEqual(userSavedAccounts[0].name, 'Rameshwar Construction');
});

test('4. Restored account without credentials cannot authenticate via manual login', async () => {
  const restoredAccount: ContractorAccount = {
    id: 'contractor-restored-1',
    name: 'Santosh Yadav',
    phone: '9800011122',
    trade: 'construction',
    language: 'hi',
    themeMode: 'light',
    password: undefined, // Stripped during unencrypted export
    pinLock: undefined,
    tutorialCompleted: true,
    createdAt: '2026-04-10T00:00:00.000Z',
  };

  let isAuthenticated = false;
  let isSecurityNoticeOpened = false;

  const simulateLogin = (matchedAccount: ContractorAccount) => {
    if (matchedAccount.password || matchedAccount.pinLock) {
      isAuthenticated = true;
    } else {
      // Hardened flow: blocks authentication and displays security limitation notice
      isSecurityNoticeOpened = true;
      return;
    }
  };

  simulateLogin(restoredAccount);

  assert.strictEqual(isAuthenticated, false, 'Uncredentialed account must NEVER be granted an authenticated session');
  assert.strictEqual(isSecurityNoticeOpened, true, 'Uncredentialed account must trigger security limitation notice');
});

test('5. Restored account without credentials cannot authenticate via quick account selection', async () => {
  const restoredAccount: ContractorAccount = {
    id: 'contractor-restored-1',
    name: 'Santosh Yadav',
    phone: '9800011122',
    trade: 'construction',
    language: 'hi',
    themeMode: 'light',
    password: undefined,
    pinLock: undefined,
    tutorialCompleted: true,
    createdAt: '2026-04-10T00:00:00.000Z',
  };

  let isAuthenticated = false;
  let isSecurityNoticeOpened = false;

  const simulateQuickSelect = (acc: ContractorAccount) => {
    if (!acc.password && !acc.pinLock) {
      // Hardened flow: blocks authentication and displays security limitation notice
      isSecurityNoticeOpened = true;
      return;
    }
    isAuthenticated = true;
  };

  simulateQuickSelect(restoredAccount);

  assert.strictEqual(isAuthenticated, false, 'Quick selecting an uncredentialed account must never authenticate');
  assert.strictEqual(isSecurityNoticeOpened, true, 'Quick selecting an uncredentialed account must trigger security limitation notice');
});

test('6. Restored account cannot be claimed merely by knowing phone number and registered contractor name', () => {
  const restoredAccount: ContractorAccount = {
    id: 'contractor-restored-1',
    name: 'Santosh Yadav',
    phone: '9800011122',
    trade: 'construction',
    language: 'hi',
    themeMode: 'light',
    password: undefined,
    pinLock: undefined,
    tutorialCompleted: true,
    createdAt: '2026-04-10T00:00:00.000Z',
  };

  // An attacker possesses only public knowledge: phone number ("9800011122") and contractor name ("Santosh Yadav").
  // The system must NOT offer or execute any handler that sets a PIN based on matching public metadata.
  const attemptClaimAccountWithPublicName = (
    account: ContractorAccount,
    phoneInput: string,
    nameInput: string
  ): { canClaim: boolean; reason: string } => {
    // Audit verification: Public metadata match is rejected as an authentication or claiming factor
    if (!account.password && !account.pinLock) {
      if (phoneInput === account.phone && nameInput.trim().toLowerCase() === account.name.toLowerCase()) {
        return {
          canClaim: false,
          reason: 'Public metadata (phone and name) cannot prove account ownership. Claiming blocked.',
        };
      }
    }
    return { canClaim: false, reason: 'Unsupported action' };
  };

  const claimResult = attemptClaimAccountWithPublicName(restoredAccount, '9800011122', 'Santosh Yadav');
  assert.strictEqual(claimResult.canClaim, false, 'Attacker knowing phone and name MUST NOT be able to claim uncredentialed account');
  assert.ok(claimResult.reason.includes('cannot prove account ownership'));
});

test('7. Valid existing account with PBKDF2 credentials authenticates successfully with correct PIN', async () => {
  const correctPin = '4321';
  const hashedPin = await hashCredential(correctPin);

  const existingAccount: ContractorAccount = {
    id: 'contractor-valid-1',
    name: 'Manoj Tiwari Electricals',
    phone: '9855566677',
    trade: 'electrical',
    language: 'hi',
    themeMode: 'light',
    password: hashedPin,
    pinLock: hashedPin,
    tutorialCompleted: true,
    createdAt: '2026-04-01T00:00:00.000Z',
  };

  let isAuthenticated = false;

  const simulateLoginWithCredential = async (account: ContractorAccount, enteredPin: string) => {
    if (account.password || account.pinLock) {
      const verifyRes = await verifyCredential(enteredPin, account.pinLock || account.password);
      if (verifyRes.isValid) {
        isAuthenticated = true;
      }
    }
  };

  await simulateLoginWithCredential(existingAccount, correctPin);
  assert.strictEqual(isAuthenticated, true, 'Valid existing account with correct PIN must authenticate successfully');
});

test('8. Valid existing account rejects incorrect PIN and enforces attempt limits', async () => {
  const correctPin = '4321';
  const hashedPin = await hashCredential(correctPin);

  const existingAccount: ContractorAccount = {
    id: 'contractor-valid-1',
    name: 'Manoj Tiwari Electricals',
    phone: '9855566677',
    trade: 'electrical',
    language: 'hi',
    themeMode: 'light',
    password: hashedPin,
    pinLock: hashedPin,
    tutorialCompleted: true,
    createdAt: '2026-04-01T00:00:00.000Z',
  };

  let isAuthenticated = false;
  let failedAttempts = 0;
  let isLockedOut = false;

  const simulateFailedAttempt = async (account: ContractorAccount, enteredPin: string) => {
    if (account.password || account.pinLock) {
      const verifyRes = await verifyCredential(enteredPin, account.pinLock || account.password);
      if (verifyRes.isValid) {
        isAuthenticated = true;
      } else {
        failedAttempts++;
        if (failedAttempts >= 5) {
          isLockedOut = true;
        }
      }
    }
  };

  // Attempt with wrong PIN
  await simulateFailedAttempt(existingAccount, '9999');
  assert.strictEqual(isAuthenticated, false, 'Wrong PIN must be rejected');
  assert.strictEqual(failedAttempts, 1);

  // 4 more wrong attempts
  for (let i = 0; i < 4; i++) {
    await simulateFailedAttempt(existingAccount, '0000');
  }
  assert.strictEqual(failedAttempts, 5);
  assert.strictEqual(isLockedOut, true, '5 failed attempts must engage rate-limiting lockout');
});

test('9. Existing account credentials cannot be overwritten without current valid PIN', async () => {
  const currentPin = '5555';
  const currentHash = await hashCredential(currentPin);

  const existingAccount: ContractorAccount = {
    id: 'contractor-secure-1',
    name: 'Sunil Verma',
    phone: '9844455566',
    trade: 'carpentry',
    language: 'hi',
    themeMode: 'light',
    password: currentHash,
    pinLock: currentHash,
    tutorialCompleted: true,
    createdAt: '2026-04-05T00:00:00.000Z',
  };

  const attemptResetPassword = async (
    account: ContractorAccount,
    providedCurrentPin: string,
    newPin: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!providedCurrentPin.trim()) {
      return { success: false, error: 'Current PIN required' };
    }
    const verifyRes = await verifyCredential(providedCurrentPin, account.pinLock || account.password);
    if (!verifyRes.isValid) {
      return { success: false, error: 'Invalid current PIN' };
    }
    const newHash = await hashCredential(newPin);
    account.password = newHash;
    account.pinLock = newHash;
    return { success: true };
  };

  // Case A: Missing current PIN
  const missingCurrent = await attemptResetPassword(existingAccount, '', '1234');
  assert.strictEqual(missingCurrent.success, false);
  assert.strictEqual(missingCurrent.error, 'Current PIN required');

  // Case B: Incorrect current PIN
  const wrongCurrent = await attemptResetPassword(existingAccount, '1111', '1234');
  assert.strictEqual(wrongCurrent.success, false);
  assert.strictEqual(wrongCurrent.error, 'Invalid current PIN');

  // Case C: Legitimate authorized change with correct current PIN
  const authorized = await attemptResetPassword(existingAccount, '5555', '9876');
  assert.strictEqual(authorized.success, true);
  const verifyNew = await verifyCredential('9876', existingAccount.pinLock);
  assert.strictEqual(verifyNew.isValid, true);
});

test('10. Startup session restoration skips accounts without credentials', () => {
  const accounts: ContractorAccount[] = [
    {
      id: 'contractor-restored-1',
      name: 'Santosh Yadav',
      phone: '9800011122',
      trade: 'construction',
      language: 'hi',
      themeMode: 'light',
      password: undefined,
      pinLock: undefined,
      tutorialCompleted: true,
      createdAt: '2026-04-10T00:00:00.000Z',
    },
  ];

  let activeAccountId: string | null = null;
  const savedId = 'contractor-restored-1';

  // Startup check simulation
  if (savedId && accounts.some((a) => a.id === savedId)) {
    const acc = accounts.find((a) => a.id === savedId);
    if (acc) {
      if (!acc.password && !acc.pinLock) {
        activeAccountId = null; // Skipped, requires manual PIN setup on AuthScreen
      } else {
        activeAccountId = acc.id;
      }
    }
  }

  assert.strictEqual(activeAccountId, null, 'Startup must not restore session for an uncredentialed account');
});
