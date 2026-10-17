# SiteSaathi (साइट साथी) — Comprehensive Test Plan

> **Document Version:** 1.0.0  
> **Status:** Active QA Blueprint  
> **Author:** QA Engineering & Software Architecture Team  
> **Last Updated:** October 2026  
> **Test Target:** Web Application (Vite/React) & Android Capacitor Packaging  

---

## 1. Test Scope & Objectives

The primary objective of this test plan is to establish a rigorous, risk-based verification protocol for SiteSaathi across all functional modules, hardware interfaces, security surfaces, and storage persistence layers.

### In Scope
- Account registration, authentication, and session persistence.
- Complete CRUD operations across Sites, Labour, Tools, Materials, Machinery, Dues, and Client Payments.
- Data integrity, relational consistency, atomic cascade deletions, and orphan cleanup.
- Financial calculation engines (Project Margin, Outflow Sums, Client Balance Due, Dues Ledger).
- Hardware and Web API integrations (Web Speech API, Tesseract OCR with Canvas preprocessing, Web Contacts API).
- Client-side document generation (jsPDF tabular statements, individual receipts, CSV muster rolls).
- Offline resilience, page reload survival, JSON backup export, and corrupted backup restoration handling.
- App lock security, PIN protection, biometric simulation, and anti-delete safeguards.
- Responsive layout across screen viewports (320px mobile to desktop) and bilingual Hindi/English localization.
- Capacitor Android APK build and device compatibility.

### Out of Scope
- Multi-device automated cloud synchronization (application is strictly offline-first).
- Native iOS packaging (current build target is Web and Android).
- Server-side load and distributed stress testing (no backend server exists).

---

## 2. Priority & Severity Classification

| Priority Level | Criteria & Turnaround Expectation |
| :--- | :--- |
| **P0 (Critical)** | Core contractor workflows that prevent daily logging, cause data corruption/loss, or crash the app. |
| **P1 (High)** | Major functional bugs, calculation inaccuracies in finances/wages, or security bypasses. |
| **P2 (Medium)** | UI inconsistencies, non-blocking localization misses, or performance sluggishness. |
| **P3 (Low)** | Cosmetic visual defects, minor spacing flaws, or edge-case input anomalies. |

| Severity Level | Operational Impact |
| :--- | :--- |
| **Blocker** | Entire application halts, cannot create accounts or sites, data is permanently erased. |
| **Critical** | Major feature unavailable (e.g. PDF generation throws unhandled exception; cascade delete fails). |
| **Major** | Feature works partially or requires workaround (e.g. OCR falls back to default template). |
| **Minor** | Annoyance or cosmetic defect with no functional data loss. |

---

## 3. Test Environment Specifications

- **Web Browser Matrix:**
  - Google Chrome (Desktop / Android) — Version 120+ (Primary Web Speech & Canvas support)
  - Mozilla Firefox / Apple Safari — Compatibility & fallback testing
- **Mobile Android Device Matrix:**
  - Physical Android Smartphone (Android 11, 13, or 14)
  - Android Emulator (Pixel 6, API Level 33/34)
- **Node & Build Environment:**
  - Node.js v18+ / v20+
  - Vite v8.2.2 bundler
  - Capacitor CLI v8.5.3 + Android Gradle Plugin

---

## 4. Test Suite Inventory with Stable Test IDs

### 4.1 Authentication & Profile Management (`AUTH`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `AUTH-001` | **P0** | New Contractor Registration | App launched in pristine state (no active session). | 1. Click "Sign Up".<br>2. Select "General Construction".<br>3. Enter Name: "Ramesh Sharma", Phone: "9876543210", PIN: "1234", Confirm PIN: "1234".<br>4. Click "Register". | Account is created in IndexedDB `account` table; user is logged in; tutorial modal opens. |
| `AUTH-002` | **P1** | Phone Number Length Validation | On Register screen. | 1. Enter phone "98765" (5 digits).<br>2. Fill other fields and submit. | Registration blocked; localized error: "Mobile phone number must be exactly 10 digits". |
| `AUTH-003` | **P1** | Duplicate Phone Registration | Account with phone "9876543210" already exists. | 1. Attempt to register another account with phone "9876543210". | Blocked; error: "An account with this phone number already exists". |
| `AUTH-004` | **P1** | PIN Mismatch Validation | On Register screen. | 1. Enter PIN: "1234", Confirm PIN: "4321".<br>2. Submit. | Blocked; error: "Passwords do not match". |
| `AUTH-005` | **P0** | Returning Contractor Login | Account exists with phone "9876543210" and PIN "1234". | 1. Navigate to Sign In view.<br>2. Enter phone "9876543210" and PIN "1234".<br>3. Submit. | Successfully authenticated; redirected to Dashboard. |
| `AUTH-006` | **P1** | Incorrect PIN Login Attempt | Valid phone entered. | 1. Enter incorrect PIN "9999".<br>2. Submit. | Login fails; error: "Incorrect PIN / password". |
| `AUTH-007` | **P1** | Forgot PIN Reset Flow | Valid account exists for phone "9876543210". | 1. Click "Forgot PIN?".<br>2. Enter phone "9876543210".<br>3. Enter new PIN "5678" and confirm.<br>4. Click Reset. | PIN successfully updated in IndexedDB; user can log in with "5678". *(Note: Audit security risk)* |
| `AUTH-008` | **P0** | Session Persistence across Browser Reload | User logged in. | 1. Refresh browser tab (`F5` / `Ctrl+R`). | User remains logged in; active account ID read from `localStorage`. |
| `AUTH-009` | **P1** | Contractor Logout | User logged in. | 1. Open Settings modal.<br>2. Click "Log Out". | Session cleared from `localStorage`; returned to AuthScreen. |

---

### 4.2 Site & Project Lifecycle (`SITE`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `SITE-001` | **P0** | Create New Site (Manual Form) | User logged in. | 1. Click "+ Add Site".<br>2. Enter Name: "Apex Heights", Location: "Sector 62", Type: "Commercial", Budget: 1500000, Start Date: Today.<br>3. Save. | Site created; appears in SiteList; budget shows ₹15,00,000. |
| `SITE-002` | **P1** | Zero-Default Field Suppression | Open Add Site modal. | 1. Inspect Budget and Target Completion Date fields upon modal open. | Fields must be completely blank (no pre-filled `0` or arbitrary dates). |
| `SITE-003` | **P0** | Site Details Drilldown Modal | At least one site exists. | 1. Click site card on SiteList or Dashboard. | SiteDetailsModal opens showing Overview, Tools, Labour, Materials, Machinery, Dues, and Payments tabs. |
| `SITE-004` | **P1** | Edit Site Details | Existing site selected. | 1. Open Edit Site modal.<br>2. Change Status from "Ongoing" to "Completed".<br>3. Save. | Site updates; status badge updates to "Completed". |
| `SITE-005` | **P0** | Cascade Site Deletion | Site exists with child tools, materials, dues, labour, and payments. | 1. Click "Delete Site".<br>2. Confirm in modal. | Site is removed; all related child records across 8 database tables are atomically deleted. |
| `SITE-006` | **P1** | Site Status Filtering | Sites exist in Planning, Ongoing, and Completed states. | 1. Click "Ongoing" filter pill.<br>2. Click "Completed" filter pill. | List filters accurately to matching sites only. |
| `SITE-007` | **P2** | Global Site Search | Multiple sites exist. | 1. Enter site name in Header search bar on Dashboard. | Real-time filtering shows only matching sites. |

---

### 4.3 Daily Labour Attendance & Wage Calculations (`LAB`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `LAB-001` | **P0** | Manual Daily Muster Roll Creation | At least one site exists. | 1. Navigate to Labour tab.<br>2. Click "+ Daily Muster".<br>3. Add Worker: "Ramu", Role: "Mason", Status: "Full Day", Wage: 900, Paid: 500.<br>4. Save. | Record saved; aggregate displays 1 worker, Daily Wage: ₹900, Paid: ₹500, Balance Due: ₹400. |
| `LAB-002` | **P1** | Half-Day Wage Calculation | In Add Labour modal. | 1. Select attendance status "Half Day". | Default daily wage halves (e.g., ₹900 -> ₹450); balance due adjusts correctly. |
| `LAB-003` | **P1** | Absent Worker Wage Handling | In Add Labour modal. | 1. Select attendance status "Absent". | Daily wage expectation set to ₹0; paid amount defaults to ₹0. |
| `LAB-004` | **P1** | Multi-Worker Roll Aggregation | In Add Labour modal. | 1. Add 3 workers with different roles and wages.<br>2. Submit muster roll. | `totalWorkers`, `totalDailyWage`, and `totalPaid` correctly sum all entries. |
| `LAB-005` | **P1** | Delete Daily Labour Record | Labour record exists. | 1. Click Delete on muster card.<br>2. Confirm. | Labour record and linked `labourEntries` deleted from IndexedDB. |

---

### 4.4 Handwritten Register Photo OCR (`OCR`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `OCR-001` | **P0** | Photo Upload & Canvas Preprocessing | Valid image file of handwritten muster roll. | 1. Open Photo OCR modal.<br>2. Upload image.<br>3. Inspect canvas preprocessing. | Image converts to high-contrast grayscale bitmap; progress indicator displays OCR recognition. |
| `OCR-002` | **P1** | Text Parsing & Role/Wage Extraction | OCR engine finishes recognition. | 1. Inspect extracted review table. | Lines parsed into Worker Name, Role, Attendance (P/H/A), and Wage amount. |
| `OCR-003` | **P1** | Manual Draft Correction | OCR entries populated in review table. | 1. Edit a misrecognized name or wage.<br>2. Add a new row manually.<br>3. Click "Save to Register". | Corrected entries committed to IndexedDB under the selected site. |
| `OCR-004` | **P2** | Illegible Image Fallback | Completely blank or blurry image uploaded. | 1. Upload unreadable photo. | OCR catches low confidence; provides 3 editable fallback template rows while preserving raw text. |

---

### 4.5 Smart Voice-to-Form Auto-Fill (`VOICE`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `VOICE-001` | **P0** | Hindi Voice Recognition | Browser supports Web Speech API; mic allowed. | 1. Open Voice modal.<br>2. Speak: *"साइट का नाम शर्मा विला, लोकेशन गोमती नगर, बजट आठ लाख"*. | NLU extracts Name: "शर्मा विला", Location: "गोमती नगर", Budget: 800000. |
| `VOICE-002` | **P1** | English Voice Recognition | Speech modal open. | 1. Speak: *"Site name Green Park, location Ring Road, budget 25 lakh, commercial"*. | NLU extracts Name: "Green Park", Location: "Ring Road", Budget: 2500000, Type: "Commercial". |
| `VOICE-003` | **P1** | Preview Modal Form Modification | Voice transcription completed. | 1. Change extracted budget from ₹8,00,000 to ₹10,00,000 in preview modal.<br>2. Click Save. | Site created with updated budget ₹10,00,000. |
| `VOICE-004` | **P2** | Unsupported Browser Handling | Browser with no Web Speech API (or mic denied). | 1. Trigger voice modal. | Graceful warning: "Voice recognition not supported / microphone permission denied"; manual entry available. |

---

### 4.6 Materials & Stock Log (`MAT`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `MAT-001` | **P0** | Log Material Purchase | Site exists. | 1. Open Add Material modal.<br>2. Item: "Ultratech Cement", Qty: 100, Unit: "bags", Rate: 380.<br>3. Status: "Paid", Paid: 38000.<br>4. Save. | Total cost calculated as ₹38,000; logged under site; added to site expense. |
| `MAT-002` | **P1** | Specialized Units Support | In Add Material modal. | 1. Test unit dropdown options: `plates (4x4)`, `brass`, `truck`, `meters`, `kg`. | All specialized construction units selectable and saved accurately. |
| `MAT-003` | **P1** | Partial Payment Material Logging | Site exists. | 1. Item: "TMT Steel 12mm", Total: 50000, Paid: 20000, Status: "Partial". | Paid amount logged as ₹20,000; unpaid ₹30,000 balance reflected in site dues. |

---

### 4.7 Machinery & Fuel Management (`MACH`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `MACH-001` | **P0** | Log Machinery Rental & Fuel | Site exists. | 1. Open Add Machinery modal.<br>2. Type: "JCB Excavator", Rental: 5 hours @ ₹1,200/hr (₹6,000), Fuel: 20L @ ₹95/L (₹1,900).<br>3. Save. | Total cost calculated as ₹7,900; logged under site; added to site expense. |
| `MACH-002` | **P1** | Self-Owned Machinery Zero-Rental | Site exists. | 1. Check "Self-Owned Machinery" toggle.<br>2. Log fuel only: 15L @ ₹90 = ₹1,350. | Rental cost disabled / set to ₹0; total cost reflects fuel expense only. |

---

### 4.8 Tools & Scaffolding Tracker (`TOOL`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `TOOL-001` | **P0** | Dispatch Tools to Site | Site exists. | 1. Open Add Tool modal.<br>2. Name: "Shuttering Plates", Qty: 50, Date Sent: Today, Return: 7 days later.<br>3. Save. | Tool record created with status `on_site`. |
| `TOOL-002` | **P1** | Overdue Tool Return Detection | Tool dispatched with past expected return date. | 1. Log tool with expected return date in past.<br>2. Inspect dashboard and smart insights. | Status flags as `overdue`; return alert badge appears on dashboard. |
| `TOOL-003` | **P1** | Mark Tool Returned Workflow | Overdue tool exists. | 1. In Site Details -> Tools tab, click "Mark Returned". | Status changes to `returned`; actual return date logged; alert dismissed. |

---

### 4.9 Persistent Dues & Client Payments (`DUE` & `PAY`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `DUE-001` | **P0** | Log Vendor Payable Due | Site exists. | 1. Open Add Due modal.<br>2. Title: "Sand Supplier Payment", Amount: 25000, Due Date: Next week.<br>3. Save. | Due recorded with status `pending`. |
| `DUE-002` | **P0** | Persistent Dues on Completed Site | Site work status is "Completed"; dues remain unpaid. | 1. Mark site workStatus as "Completed".<br>2. Inspect Smart Insights and Dues ledger. | Completed site dues remain prominently flagged; not hidden by work completion. |
| `PAY-001` | **P0** | Record Client Payment Received | Site has budget ₹10,00,000. | 1. In Site Details, click "+ Record Payment".<br>2. Amount: 400000, Mode: "UPI / Online", Ref: "UPI12345".<br>3. Save. | Payment logged; site paymentStatus changes to `partially_paid`; progress bar shows 40%. |
| `PAY-002` | **P1** | Full Contract Settlement | Site has budget ₹10,00,000; ₹4,00,000 paid. | 1. Record second payment of ₹6,00,000. | Site paymentStatus automatically updates to `paid`; balance due reaches ₹0. |

---

### 4.10 Client-Side Reports & Exports (`REP`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `REP-001` | **P0** | Generate Project Statement PDF | Site with materials, tools, dues, and payments exists. | 1. In Site Details, click "PDF Report". | Browser downloads/opens formatted PDF statement containing financial tables. |
| `REP-002` | **P1** | Generate Individual Payment Receipt PDF | Client payment recorded. | 1. In Client Payments tab, click Receipt icon on payment row. | Generates official Client Receipt PDF with contractor header and balance due. |
| `REP-003` | **P1** | Export Labour Muster Roll CSV | Labour records exist. | 1. In Labour tab, click "Export CSV". | CSV file downloads with UTF-8 encoding containing worker names, attendance, and wages. |

---

### 4.11 Backup, Restore & Data Migration (`DATA`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `DATA-001` | **P0** | Full JSON Backup Export | Database contains accounts, sites, tools, and finances. | 1. Open Settings -> Backup.<br>2. Click "Export Backup". | JSON file `SiteSaathi_Backup_YYYY-MM-DD.json` downloads containing all 11 tables. |
| `DATA-002` | **P0** | Valid JSON Backup Restore | Valid backup JSON file available. | 1. Clear database.<br>2. In Settings, select backup file to import. | Database restored in atomic transaction; app reloads with 100% original data. |
| `DATA-003` | **P1** | Corrupted / Malformed Backup Handling | Invalid or truncated JSON file. | 1. Attempt to import invalid text file as backup. | Import caught with error: "Invalid backup JSON file"; database remains untouched. |
| `DATA-004` | **P1** | Clean Orphan Records on Launch | Ghost tool/material records exist with non-existent `siteId`. | 1. Launch application. | `db.cleanupOrphanRecords()` sweeps and deletes orphaned records automatically. |

---

### 4.12 Security & Access Controls (`SEC`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `SEC-001` | **P0** | App PIN Lock Trigger | PIN lock enabled in Settings (`isPinLockEnabled: true`). | 1. Close tab or trigger lock.<br>2. Re-open application. | AppLockScreen blocks access until correct 4-digit PIN is entered. |
| `SEC-002` | **P1** | Biometric Auto-Unlock Bypass Audit | `isBiometricEnabled: true`. | 1. Inspect `AppLockScreen.tsx` trigger logic. | Verify finding: Browser simulated biometric bypasses lock immediately without native challenge. |
| `SEC-003` | **P1** | Anti-Delete Safeguard | Anti-delete enabled in Settings. | 1. Attempt to clear all data in Settings. | PIN prompt appears; wipe blocked unless correct security PIN is provided. |
| `SEC-004` | **P1** | Plaintext Password Storage Inspection | Account registered. | 1. Inspect IndexedDB `account` table in browser DevTools. | Document finding: `password` and `pinLock` stored as unhashed plaintext strings. |

---

### 4.13 Android Packaging & Native Device (`ANDROID`)

| Test ID | Priority | Description | Preconditions | Test Steps | Expected Result |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `ANDROID-001` | **P0** | Production Web Build | Codebase clean. | 1. Run `npm run build`. | Exits with code 0; `dist/` contains index.html, JS, and CSS bundles. |
| `ANDROID-002` | **P0** | Capacitor Android Sync | Web build generated. | 1. Run `npm run cap:sync`. | Web assets copied to `android/app/src/main/assets/public`; plugins synced. |
| `ANDROID-003` | **P1** | Debug APK Compilation | Android SDK & Java configured. | 1. Run `npm run apk:build`. | Gradle compiles `app-debug.apk` successfully. |
| `ANDROID-004` | **P1** | Camera & Mic Permissions in WebView | APK installed on physical Android phone. | 1. Trigger Photo OCR camera.<br>2. Trigger Voice Assistant. | System permission dialogs request Camera and Microphone access. |

---

## 5. Test Entry & Exit Criteria

### Entry Criteria
- Source code compiles with 0 TypeScript errors (`tsc -b`).
- Production bundle builds successfully with Vite (`vite build`).
- Linter reports 0 breaking errors (`oxlint`).

### Exit Criteria for Release
- 100% of P0 (Critical) test cases must achieve PASS status.
- Zero open Blockers or Critical severity defects.
- All identified security vulnerabilities (plaintext credentials, unauthenticated PIN reset) documented with risk mitigations.
- Data backup export and restore verified without data corruption.
