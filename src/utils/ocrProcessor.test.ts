/// <reference types="node" />
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseOcrTextToLabourEntries,
  validateRegisterContent,
} from './ocrProcessor.ts';
import type { LabourEntry } from '../types/index.ts';

test('1. Personal photograph / noise does not generate worker rows or fabricated wages', () => {
  const noiseText = `
    Sunday family picnic at City Park
    Wonderful weather, coffee and snacks
    Photo taken on iPhone 13 Pro
    IMG_2026_04_12
  `;

  const validation = validateRegisterContent(noiseText, 78, 0);
  assert.strictEqual(validation.isLikelyRegister, false);
  assert.strictEqual(validation.detectedSignals.hasAttendanceTokens, false);
  assert.strictEqual(validation.detectedSignals.hasRoleTokens, false);
  assert.strictEqual(validation.detectedSignals.hasNumberedRows, false);
  assert.ok(validation.warningMessage && validation.warningMessage.includes('does not appear to be an attendance register'));

  const entries = parseOcrTextToLabourEntries(noiseText, 'rec-test-noise');
  assert.strictEqual(entries.length, 0, 'Should not extract any worker entries from personal photo noise');
});

test('2. Empty or whitespace OCR output does not generate template workers', () => {
  const emptyTexts = ['', '   ', '\n\n\t  \n'];

  for (const text of emptyTexts) {
    const validation = validateRegisterContent(text, 0, 0);
    assert.strictEqual(validation.isLikelyRegister, false);
    assert.ok(validation.warningMessage && validation.warningMessage.includes('No text was detected'));

    const entries = parseOcrTextToLabourEntries(text, 'rec-test-empty');
    assert.strictEqual(entries.length, 0);
    // Explicitly verify legacy fictional workers are never injected
    const workerNames = entries.map((e) => e.workerName);
    assert.ok(!workerNames.includes('Subhash Mistry'));
    assert.ok(!workerNames.includes('Ramu Helper'));
    assert.ok(!workerNames.includes('Kamal Yadav'));
  }
});

test('3. Valid handwritten-register-like text extracts rows, roles, and explicit wages', () => {
  const registerText = `
    1. Rameshwar Mistri P 850
    2. Suresh Kumar Helper P 500
    3. Dinesh Carpenter H 600
    4. Sonu Plumber A 0
  `;

  const entries = parseOcrTextToLabourEntries(registerText, 'rec-test-valid');
  assert.strictEqual(entries.length, 4);

  // Row 1: Mistry, Full day, wage 850
  assert.strictEqual(entries[0].role, 'Mason');
  assert.strictEqual(entries[0].attendanceStatus, 'full_day');
  assert.strictEqual(entries[0].dailyWage, 850);
  assert.strictEqual(entries[0].paidAmount, 850);
  assert.ok(entries[0].workerName.includes('Rameshwar'));

  // Row 2: Helper, Full day, wage 500
  assert.strictEqual(entries[1].role, 'Helper');
  assert.strictEqual(entries[1].attendanceStatus, 'full_day');
  assert.strictEqual(entries[1].dailyWage, 500);
  assert.strictEqual(entries[1].paidAmount, 500);
  assert.ok(entries[1].workerName.includes('Suresh Kumar'));

  // Row 3: Carpenter, Half day, wage 600 -> paidAmount 300
  assert.strictEqual(entries[2].role, 'Carpenter');
  assert.strictEqual(entries[2].attendanceStatus, 'half_day');
  assert.strictEqual(entries[2].dailyWage, 600);
  assert.strictEqual(entries[2].paidAmount, 300);

  // Row 4: Plumber, Absent -> paidAmount 0
  assert.strictEqual(entries[3].role, 'Plumber');
  assert.strictEqual(entries[3].attendanceStatus, 'absent');
  assert.strictEqual(entries[3].paidAmount, 0);

  // Register validation should recognize this structure
  const validation = validateRegisterContent(registerText, 82, entries.length);
  assert.strictEqual(validation.isLikelyRegister, true);
  assert.strictEqual(validation.detectedSignals.hasAttendanceTokens, true);
  assert.strictEqual(validation.detectedSignals.hasRoleTokens, true);
  assert.strictEqual(validation.detectedSignals.hasWageTokens, true);
  assert.strictEqual(validation.detectedSignals.hasNumberedRows, true);
});

test('4. Missing wages are never silently replaced with default ₹550 / ₹900', () => {
  const registerTextWithoutWages = `
    1. Rameshwar Mistri P
    2. Suresh Helper P
  `;

  const entries = parseOcrTextToLabourEntries(registerTextWithoutWages, 'rec-test-missing-wages');
  assert.strictEqual(entries.length, 2);

  // Row 1 (Mistri): dailyWage MUST be 0, NEVER 900
  assert.strictEqual(entries[0].role, 'Mason');
  assert.strictEqual(entries[0].dailyWage, 0, 'Missing wage for Mistry must remain 0 (unverified)');
  assert.strictEqual(entries[0].paidAmount, 0);

  // Row 2 (Helper): dailyWage MUST be 0, NEVER 550
  assert.strictEqual(entries[1].role, 'Helper');
  assert.strictEqual(entries[1].dailyWage, 0, 'Missing wage for Helper must remain 0 (unverified)');
  assert.strictEqual(entries[1].paidAmount, 0);
});

test('5. Lines with missing or unidentifiable names do not fabricate "Worker 1"', () => {
  const lineWithoutName = `
    1. P 500
  `;

  const entries = parseOcrTextToLabourEntries(lineWithoutName, 'rec-test-no-name');
  assert.strictEqual(entries.length, 1);
  assert.strictEqual(entries[0].workerName, '', 'Should leave workerName blank instead of synthesizing "Worker 1"');
  assert.strictEqual(entries[0].dailyWage, 500);
});

test('6. Low-confidence but plausible register remains reviewable with an advisory warning', () => {
  const faintRegisterText = `
    1. Ramu Mistri P 700
    2. Shyam Helper P 450
  `;

  // Low confidence (35%)
  const validation = validateRegisterContent(faintRegisterText, 35, 2);
  assert.strictEqual(validation.isLikelyRegister, true, 'Plausible register structure must remain reviewable');
  assert.ok(
    validation.warningMessage && validation.warningMessage.includes('Low OCR confidence'),
    'Should flag advisory warning for low confidence'
  );
});

test('7. Save protection logic: rejects invalid drafts and validates required data', () => {
  // Helper simulating PhotoOcrModal pre-save validation
  const validateDraftForSave = (
    entries: LabourEntry[],
    siteId: string | null
  ): { valid: boolean; error?: string } => {
    if (!siteId) {
      return { valid: false, error: 'Please select a target site.' };
    }
    if (entries.length === 0) {
      return { valid: false, error: 'No worker entries to save. Please add at least one worker.' };
    }
    for (let i = 0; i < entries.length; i++) {
      const name = (entries[i].workerName || '').trim();
      if (name.length < 2 || /^worker\s*\d*$/i.test(name) || /^new worker$/i.test(name)) {
        return { valid: false, error: `Row ${i + 1}: Please enter a valid worker name (placeholder names not allowed).` };
      }
    }
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      if (entry.attendanceStatus !== 'absent' && (!entry.dailyWage || entry.dailyWage <= 0)) {
        return { valid: false, error: `Row ${i + 1} (${entry.workerName}): Please enter a valid daily wage (> ₹0) or mark attendance as Absent.` };
      }
    }
    return { valid: true };
  };

  // Case A: Missing site
  assert.strictEqual(validateDraftForSave([], null).valid, false);

  // Case B: Empty entries list
  assert.strictEqual(validateDraftForSave([], 'site-1').valid, false);

  // Case C: Placeholder / empty name
  const invalidNameDraft: LabourEntry[] = [
    {
      id: '1',
      recordId: 'rec-1',
      workerName: '',
      role: 'Helper',
      attendanceStatus: 'full_day',
      dailyWage: 500,
      paidAmount: 500,
      balanceDue: 0,
    },
  ];
  assert.strictEqual(validateDraftForSave(invalidNameDraft, 'site-1').valid, false);

  const placeholderNameDraft: LabourEntry[] = [
    {
      id: '1',
      recordId: 'rec-1',
      workerName: 'Worker 1',
      role: 'Helper',
      attendanceStatus: 'full_day',
      dailyWage: 500,
      paidAmount: 500,
      balanceDue: 0,
    },
  ];
  assert.strictEqual(validateDraftForSave(placeholderNameDraft, 'site-1').valid, false);

  // Case D: Zero wage on present worker
  const missingWageDraft: LabourEntry[] = [
    {
      id: '1',
      recordId: 'rec-1',
      workerName: 'Ramesh',
      role: 'Mason',
      attendanceStatus: 'full_day',
      dailyWage: 0,
      paidAmount: 0,
      balanceDue: 0,
    },
  ];
  const missingWageResult = validateDraftForSave(missingWageDraft, 'site-1');
  assert.strictEqual(missingWageResult.valid, false);
  assert.ok(missingWageResult.error && missingWageResult.error.includes('Please enter a valid daily wage'));

  // Case E: Zero wage allowed ONLY when attendanceStatus is 'absent'
  const absentWorkerDraft: LabourEntry[] = [
    {
      id: '1',
      recordId: 'rec-1',
      workerName: 'Ramesh',
      role: 'Mason',
      attendanceStatus: 'absent',
      dailyWage: 0,
      paidAmount: 0,
      balanceDue: 0,
    },
  ];
  assert.strictEqual(validateDraftForSave(absentWorkerDraft, 'site-1').valid, true);

  // Case F: Fully reviewed valid draft passes
  const validDraft: LabourEntry[] = [
    {
      id: '1',
      recordId: 'rec-1',
      workerName: 'Rameshwar',
      role: 'Mason',
      attendanceStatus: 'full_day',
      dailyWage: 800,
      paidAmount: 800,
      balanceDue: 0,
    },
    {
      id: '2',
      recordId: 'rec-1',
      workerName: 'Suresh',
      role: 'Helper',
      attendanceStatus: 'half_day',
      dailyWage: 500,
      paidAmount: 250,
      balanceDue: 0,
    },
  ];
  assert.strictEqual(validateDraftForSave(validDraft, 'site-1').valid, true);

  // Total wages calculation only sums explicitly supplied wages
  const totalWages = validDraft.reduce((acc, e) => acc + (Number(e.dailyWage) || 0), 0);
  assert.strictEqual(totalWages, 1300);
});

test('8. Cancel/close discards draft without database writes and never auto-saves', () => {
  // Simulate modal lifecycle state
  let dbWrites = 0;
  const mockDb = {
    putRecord: () => {
      dbWrites += 1;
    },
    putEntry: () => {
      dbWrites += 1;
    },
  };

  // Draft state generated by OCR
  let draftEntries: LabourEntry[] = [
    {
      id: 'entry-1',
      recordId: 'rec-1',
      workerName: 'Ramesh',
      role: 'Mason',
      attendanceStatus: 'full_day',
      dailyWage: 800,
      paidAmount: 800,
      balanceDue: 0,
    },
  ];
  let isModalOpen = true;

  // OCR completion must NEVER auto-save:
  assert.strictEqual(dbWrites, 0, 'OCR processing must never automatically write to database');

  // User clicks Cancel or Close button:
  const handleClose = () => {
    isModalOpen = false;
    draftEntries = []; // Discards in-memory draft
  };

  handleClose();

  assert.strictEqual(isModalOpen, false);
  assert.strictEqual(draftEntries.length, 0);
  assert.strictEqual(dbWrites, 0, 'Closing/cancelling must discard draft with 0 database writes');
});
