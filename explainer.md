# Project Technology & Architecture Explainer (`explainer.md`)

This document tracks all technologies, libraries, and architectural modules used in **SiteManager (SiteSaathi)**. It explains what each technology does, how it works, and provides a quick summary. This file is continuously updated as new features and technologies are introduced across phases.

---

## 🛠️ Table of Core Technologies

| Technology / Module | Category | Primary Role |
| :--- | :--- | :--- |
| **React 19** | Frontend UI Framework | Component-based interactive user interface |
| **TypeScript** | Language & Type Safety | Static typing, interface contracts, bug prevention |
| **Vite** | Build Tool & Dev Server | Ultra-fast Hot Module Replacement (HMR) & bundling |
| **Tailwind CSS v4** | Styling & Design System | Utility-first responsive design & custom CSS variables |
| **Dexie.js (IndexedDB)** | Database & Storage | 100% offline-first persistent browser database |
| **Web Speech API** | Voice Recognition | Bilingual speech-to-text voice assistant |
| **Tesseract.js** | Optical Character Recognition | Extracts text from photos of paper diary muster rolls |
| **HTML5 Canvas** | Image Processing | Contrast & grayscale enhancement before OCR |
| **jsPDF & autotable** | Reporting Engine | Client-side generation of branded PDF statements |
| **Lucide React** | Icon System | Lightweight, accessible SVG icons |
| **MediaRecorder API** | Audio Utility | Voice note capture for site audio reminders |
| **Dynamic Trade Token Engine**| Architecture / Theming | Real-time theme switching (Civil, Plumbing, Electrical) |
| **Bilingual i18n Engine** | Localization | Instant reactive switching between Hindi and English |
| **JSON Database Backup Engine**| Storage & Migration | Full offline database export & restore for switching phones |
| **App Lock & Anti-Delete System** | Security & Protection | Device PIN, Biometric Fingerprint & Accidental Wipe Shield |

---

## 🔍 Detailed Technology Breakdown

---

### 1. React 19
- **What it does:** Powers the entire single-page web application (SPA). Breaks the UI down into modular, reusable components (modals, cards, navigation, forms).
- **How it works:** Uses a virtual DOM to detect state changes and only re-renders the specific DOM nodes that changed, ensuring smooth mobile performance.
- **Small Summary:** The UI engine that renders pages, handles state, and manages user interactions smoothly.

---

### 2. TypeScript
- **What it does:** Adds static types to JavaScript, defining clear models for Sites, Workers, Tools, Materials, Machinery, and Dues.
- **How it works:** Runs during development and build time (`tsc`), catching mismatches, typos, and undefined property errors before code reaches production.
- **Small Summary:** Keeps the codebase robust and bug-free by strictly enforcing data structures.

---

### 3. Vite
- **What it does:** Serves the frontend development environment and bundles the production app into optimized static files.
- **How it works:** Uses native browser ES modules during development for instant hot-reloading (HMR) without full-bundle rebuilding.
- **Small Summary:** The lightning-fast local development server and production bundler.

---

### 4. Dexie.js (IndexedDB)
- **What it does:** Provides a full offline database inside the user's browser for sites, daily labour muster rolls, equipment tracking, and vendor bills.
- **How it works:** Wraps the browser's complex low-level `IndexedDB` API with a clean Promise-based syntax and reactive hooks (`useLiveQuery`) so UI updates instantly when database records change.
- **Small Summary:** The offline database that ensures contractors can work with zero internet on remote sites.

---

### 5. Web Speech API
- **What it does:** Converts spoken words into text so contractors can create sites without typing on small mobile keyboards.
- **How it works:** Uses browser speech recognition (`webkitSpeechRecognition`), listens for Hindi and English keywords (e.g., *"साइट का नाम"*, *"बजट"*, *"लोकेशन"*), and extracts them into form fields with an editable preview.
- **Small Summary:** A hands-free voice assistant tailored for dusty job sites.

---

### 6. Tesseract.js (Client-Side OCR) & Offline Scanner Architecture
- **What it does:** Digitizes handwritten worker registers from photos taken of paper diaries or notebooks.
- **How it works (Internet vs. Offline):** 
  - **Does it need internet?** **NO**, the recognition engine runs **100% offline** on the user's smartphone.
  - When the app or APK is built/installed, the Tesseract language models and WebAssembly runtime are cached in persistent storage (`IndexedDB` / Service Worker cache).
  - During photo scanning, the image never leaves the user's phone. HTML5 Canvas preprocesses pixel contrast locally in memory, and the WebAssembly engine parses characters directly on the device's CPU/GPU.
- **Small Summary:** 100% offline document digitizer running completely in-phone without cloud servers.

---

### 7. HTML5 Canvas Preprocessing
- **What it does:** Cleans and sharpens photos of paper muster rolls before sending them to the OCR engine.
- **How it works:** Draws the captured image into an in-memory canvas element, converts pixels to grayscale, and applies high-contrast thresholding so faint handwriting stands out against paper backgrounds.
- **Small Summary:** Enhances image contrast to dramatically improve OCR accuracy.

---

### 8. jsPDF & jspdf-autotable
- **What it does:** Generates branded, multi-page PDF project statements and financial reports directly on the device.
- **How it works:** Programmatically constructs vector PDF documents using coordinate-based text, color fills, headers, and auto-paginated data tables without needing any server backend.
- **Small Summary:** Instant client-side PDF statement generation for clients and accountants.

---

### 9. Dynamic Trade Token Theming System
- **What it does:** Dynamically switches the application's appearance and terminology based on the contractor's trade (*Construction*, *Plumbing*, *Electrical*).
- **How it works:** Injects CSS variables (`--color-primary`, `--color-accent`) at the root DOM level. Components read these tokens, instantly switching color palettes and fast-entry templates without re-rendering the entire app.
- **Small Summary:** A trade-switcher that customizes the app for civil contractors, plumbers, and electricians.

---

### 10. Bilingual i18n Translation Store
- **What it does:** Allows one-tap switching between Hindi (हिंदी) and English across all buttons, notifications, and form placeholders.
- **How it works:** Uses a lightweight key-value dictionary and React context (`ThemeContext`). Changing the language updates the reactive state and swaps text instantly.
- **Small Summary:** Full bilingual support designed for Hindi-speaking site managers and thekedars.

---

### 11. MediaRecorder API (Audio Notes)
- **What it does:** Allows contractors to record quick voice notes and audio memos linked to specific sites or daily logs.
- **How it works:** Accesses the device microphone via `navigator.mediaDevices.getUserMedia`, captures audio chunks in WebM/Ogg format, and stores the audio blob locally in IndexedDB.
- **Small Summary:** Simple on-site voice memo recorder.

---

### 12. Machinery & Equipment Cost Modeling (Rental vs. Owned)
- **What it does:** Allows contractors to distinguish between rented heavy machinery (which accumulates daily/hourly rental fees plus fuel) and self-owned equipment (which only logs fuel and usage hours, setting machine rent to ₹0).
- **How it works:** Conditionally toggles rent calculations and form inputs in IndexedDB records based on the `ownership` flag (`rental` vs `owned`), preventing accidental inflation of project rental costs.
- **Small Summary:** Smart cost segregation for owned vs hired site equipment.

---

### 13. Mobile Device Shell Architecture (`MobileDeviceShell.tsx`)
- **What it does:** Provides a realistic mobile frame simulator previewing the app at realistic smartphone dimensions (390px viewport) during desktop testing.
- **How it works:** Encapsulates the application inside a responsive container with rounded device borders, safe-area padding (`pb-safe`, `safe-top`), and shadow elevation.
- **Small Summary:** In-browser realistic smartphone wrapper for responsive testing.

---

### 14. JSON Database Backup & Cross-Device Migration Engine (`database.ts`)
- **What it does:** Enables contractors to export their entire offline database into a single `.json` file and restore it on any new phone or device when switching phones.
- **How it works:** Uses transactional IndexedDB reading (`exportBackupJson()`) across all 10 tables (`account`, `sites`, `tools`, `labourRecords`, `labourEntries`, `materials`, `machinery`, `dues`, `vendors`, `reminders`). The resulting JSON payload is downloaded as a timestamped backup. On the new device, `importBackupJson(jsonString)` performs atomic bulk insertion inside an IndexedDB read-write transaction.
- **Small Summary:** Seamless 1-tap device-to-device data migration without cloud dependency.

---

### 15. Security PIN, Biometric Fingerprint & Anti-Delete System (`AppLockScreen.tsx`)
- **What it does:** Protects the contractor's data with a security PIN, optional device biometric/fingerprint authentication, and accidental deletion protection.
- **How it works:**
  - **PIN Lock:** Validates a 4-to-6 digit security PIN upon opening or resuming the app.
  - **Biometrics:** Queries `window.PublicKeyCredential` for native device fingerprint/face biometric availability. If supported, triggers hardware biometric verification; if the device lacks biometric hardware, gracefully falls back to PIN lock.
  - **Anti-Delete Protection:** Protects destructive actions (such as data wipe, resetting the app, or bulk record deletion) behind PIN verification, preventing workers or unauthorized personnel on site from accidentally wiping the app.
- **Small Summary:** Full device-level privacy lock and accidental data deletion prevention.

---

### 16. Self-Owned & Site-Purchased Tool Inventory Architecture (`ToolTracker.tsx`, `AddToolModal.tsx`, `EditToolModal.tsx`)
- **What it does:** Eliminates all unrealistic "rental" options from the tools and equipment module. Allows contractors to manage their owned tools dispatched from the godown/workshop to sites, record new tools purchased during ongoing site work with accurate purchase cost, and track tool return back to the godown.
- **How it works:**
  - **Tool Source Types:** Categorizes tools strictly into:
    1. `self_owned` (Contractor's own tool dispatched from godown/workshop, costing ₹0 in rent).
    2. `purchased_for_site` (Tools/equipment purchased during ongoing site work, logging actual purchase cost into site expenses).
  - **Site Financial Accuracy:** In `SiteSaathiDatabase.calculateSiteFinancials`, self-owned tools contribute ₹0 to site expense bloat, while site purchases are accurately accrued against the project budget.
  - **Dispatch & Return Workflow:** Tracks dispatch date, expected godown return date, and provides a 1-tap `Mark Returned to Godown` action that timestamps when the tool is safely returned to inventory.
  - **Trade-Adaptive Quick Tags:** Replaced rental templates with realistic trade-specific equipment tags (e.g., Shuttering Plates, Needle Vibrator, Demolition Hammer, Wall Chaser, Tile Cutter, Pipe Threader) for instant 1-tap entry.
- **Small Summary:** Practical tool inventory tracking reflecting real Indian contracting practices (warehouse dispatch + site purchases, zero false rental charges).

---

## 📝 Change Log & Phase History

- **Phase 0 (Baseline Setup):** Initial project baseline, Git repository setup, README badges, executive PDF document in `docx/`, and creation of this `explainer.md` file.
- **Phase 1 (20-Page Visual & Functional Fixes):**
  - Expanded trade professions from 3 to 11 dynamic trades (Painting, Carpentry, Fabrication, Flooring, Ceiling, HVAC, Interior, Infrastructure).
  - Streamlined Auth screen tabs to "Sign In" / "Sign Up".
  - Refactored Site cards into a single-column flex list to eliminate multi-column card overlap on mobile.
  - Linked Dashboard Active Sites widget directly to the Sites tab with automatic "Ongoing" filtering.
  - Stabilized bottom navigation by removing overlapping floating FAB button.
  - Added equipment ownership toggle (Rental vs Self-Owned) in machinery logs.
  - Removed "Size/Specs" field and cleaned "e.g." from all input placeholders across the app.
  - Compacted Pending Dues banner and simplified Smart Insights descriptions for high-visibility mobile glanceability.
- **Phase 2 (Settings, Security, Backup Export, Dashboard & Labour Redesign):**
  - Renamed "Settings & Preferences" to strictly **"Settings"** (`सेटिंग्स`) and cleaned headers (e.g. "Mode", "Active Trade", "Data Tools") eliminating all congested `/` and `&` text.
  - Added inline **Contractor Profile Editor** with real-time updates for Name, strict 10-digit Phone, Display/Firm Name (`companyName`), and Email/Gmail (`email`).
  - Enforced strict **10-digit mobile phone restriction** across Registration, Login, and Profile editing.
  - Added full **Data Backup & Device Transfer Engine** with 1-tap JSON export and JSON restore for phone switching.
  - Built **App Lock & Security Suite** featuring 4-digit PIN lock, device Fingerprint Biometric integration with automatic fallback, and **Anti-Delete Protection** restricting accidental app data wipes.
  - Cleaned Dashboard header by removing repeated "General Construction" badge and dynamically rendering contractor's custom Firm/Business name.
  - Removed Operational Alerts section from Dashboard (offline app design) and relocated Logout button into Settings modal.
  - Redesigned Labour Register into **Worker Entry** (`कारीगर हाजिरी`): removed long subtitle, simplified manual add to an icon-only `+` button, renamed photo OCR to **Scan** (`स्कैन करें`), and deleted the 3 summary KPI cards.
  - Clarified 100% offline OCR processing architecture without cloud/internet dependency.
- **Phase 2.2 (Dedicated Date Attendance Page & Dual PDF Generator):**
  - Eliminated all mobile horizontal text overlaps by replacing text buttons with clean, tactile icon buttons (edit pen icon, PDF download icon, trash icon).
  - Replaced the in-line cramped accordion with a dedicated **Date Attendance Detail Modal** (`LabourDateDetailModal.tsx`) providing an uncompressed single-column worker roster with zero text collisions.
  - Added **Daily Attendance PDF Generator** (`exportDailyAttendancePdf`): creates formatted day sheets listing all workers, trades, attendance statuses, wages, and payment balances.
  - Added **Site Total Attendance Summary PDF** (`exportSiteTotalAttendancePdf`): creates an executive muster statement for the entire site showing **Date and Worker Quantity (count)** without exposing individual worker names, perfect for clients and accountants.
### 17. Site-Centric Tool Management Architecture (`SiteDetailsModal.tsx`, `BottomNav.tsx`)
- **What it does:** Relocates tool tracking directly inside individual construction sites, removing the redundant standalone "Tools" page from the main bottom navigation.
- **How it works:**
  - **Site-Scoped Inventory:** Tools and equipment do not exist in the abstract; they are dispatched to or purchased for a specific site. Users open the desired site, navigate to its `Tools` tab, and immediately view, add, edit, or return tools assigned to that project.
  - **Spacious Bottom Navigation:** Bottom navigation is streamlined from 5 columns to 4 focused columns (`Dashboard`, `Sites`, `Labour`, `Pending Dues`). This prevents text clipping (such as "Labour Regi...") on narrow mobile screens and provides generous touch targets.
  - **Rich In-Site Tool View:** `SiteDetailsModal` features self-owned vs site-purchased badges, status pills (Active on Site, Return Overdue, Returned to Godown), 1-tap return actions, and an intuitive empty state encouraging tool logging.
- **Small Summary:** Simplified UX by making tool tracking site-scoped and cleaning up the bottom navigation bar.

---

## 📝 Change Log & Phase History

- **Phase 0 (Baseline Setup):** Initial project baseline, Git repository setup, README badges, executive PDF document in `docx/`, and creation of this `explainer.md` file.
- **Phase 1 (20-Page Visual & Functional Fixes):**
  - Expanded trade professions from 3 to 11 dynamic trades (Painting, Carpentry, Fabrication, Flooring, Ceiling, HVAC, Interior, Infrastructure).
  - Streamlined Auth screen tabs to "Sign In" / "Sign Up".
  - Refactored Site cards into a single-column flex list to eliminate multi-column card overlap on mobile.
  - Linked Dashboard Active Sites widget directly to the Sites tab with automatic "Ongoing" filtering.
  - Stabilized bottom navigation by removing overlapping floating FAB button.
  - Added equipment ownership toggle (Rental vs Self-Owned) in machinery logs.
  - Removed "Size/Specs" field and cleaned "e.g." from all input placeholders across the app.
  - Compacted Pending Dues banner and simplified Smart Insights descriptions for high-visibility mobile glanceability.
- **Phase 2 (Settings, Security, Backup Export, Dashboard & Labour Redesign):**
  - Renamed "Settings & Preferences" to strictly **"Settings"** (`सेटिंग्स`) and cleaned headers (e.g. "Mode", "Active Trade", "Data Tools") eliminating all congested `/` and `&` text.
  - Added inline **Contractor Profile Editor** with real-time updates for Name, strict 10-digit Phone, Display/Firm Name (`companyName`), and Email/Gmail (`email`).
  - Enforced strict **10-digit mobile phone restriction** across Registration, Login, and Profile editing.
  - Added full **Data Backup & Device Transfer Engine** with 1-tap JSON export and JSON restore for phone switching.
  - Built **App Lock & Security Suite** featuring 4-digit PIN lock, device Fingerprint Biometric integration with automatic fallback, and **Anti-Delete Protection** restricting accidental app data wipes.
  - Cleaned Dashboard header by removing repeated "General Construction" badge and dynamically rendering contractor's custom Firm/Business name.
  - Removed Operational Alerts section from Dashboard (offline app design) and relocated Logout button into Settings modal.
  - Redesigned Labour Register into **Worker Entry** (`कारीगर हाजिरी`): removed long subtitle, simplified manual add to an icon-only `+` button, renamed photo OCR to **Scan** (`स्कैन करें`), and deleted the 3 summary KPI cards.
  - Clarified 100% offline OCR processing architecture without cloud/internet dependency.
- **Phase 2.2 (Dedicated Date Attendance Page & Dual PDF Generator):**
  - Eliminated all mobile horizontal text overlaps by replacing text buttons with clean, tactile icon buttons (edit pen icon, PDF download icon, trash icon).
  - Replaced the in-line cramped accordion with a dedicated **Date Attendance Detail Modal** (`LabourDateDetailModal.tsx`) providing an uncompressed single-column worker roster with zero text collisions.
  - Added **Daily Attendance PDF Generator** (`exportDailyAttendancePdf`): creates formatted day sheets listing all workers, trades, attendance statuses, wages, and payment balances.
  - Added **Site Total Attendance Summary PDF** (`exportSiteTotalAttendancePdf`): creates an executive muster statement for the entire site showing **Date and Worker Quantity (count)** without exposing individual worker names, perfect for clients and accountants.
- **Phase 2.3 (Eliminated Tool Rentals, Added Self-Owned & Site-Purchased Tool Inventory):**
  - Removed all "Rent" / "Rental Cost" / "किराया" options, fields, and badges from the Tools module.
  - Introduced two primary tool sources in `AddToolModal` and `EditToolModal`:
    - **Self-Owned Tool Sent to Site** (`खुद का औजार साइट पर भेजा`): Logs own warehouse inventory dispatched to job site with ₹0 rent.
    - **New Tool Purchased for Site** (`साइट के लिए नया औजार खरीदा`): Logs equipment bought during ongoing work with purchase cost and vendor details.
  - Updated `ToolTracker` with real-time KPI ribbon (Active on Sites, Self-Owned Godown Tools, Site Purchases with total ₹, and Returned to Godown), source filter tabs, and 1-tap "Mark Returned to Godown" (`गोदाम वापसी दर्ज करें`) functionality.
  - Corrected site financial calculations so only actual tool purchase costs affect site budget, eliminating false rental expenses.
  - Replaced quick-add rental templates with 1-tap realistic equipment chips tailored to each trade.
- **Phase 2.4 (Site-Centric Tool Management & Streamlined Bottom Navigation):**
  - Removed the standalone "Tools" tab from `BottomNav.tsx` and `NavigationTabs.tsx`.
  - Converted the bottom navigation to a clean, uncrowded 4-tab bar (`Dashboard`, `Sites`, `Labour`, `Pending Dues`) with wider touch targets and no truncated labels.
  - Upgraded the in-site Tools tab in `SiteDetailsModal.tsx` to directly manage all self-owned dispatched tools and site-purchased tools with rich cards, return-to-godown actions, and empty states.
  - Re-routed tool-related dashboard widgets and reminders to open `Sites` directly.
- **Phase 2.5 (Pinterest Modern UI Transformation & Services Discovery Engine):**
  - Integrated the Pinterest 3-Screen UI design system adapted for SiteSaathi data:
    1. **Screen 1 (Explore & Dashboard Home):**
       - Personal greeting header with avatar, "Hello 👋 [Contractor]", notification bell counter, and integrated search input.
       - Modern `ExploreBanner` featuring an exclusive 3D builder character graphic, soft gradient styling, and quick-action booking CTA.
       - 8-squircle `ServicesGrid` (Plumber, Electrician, Carpenter, Painter, Mason, Welder, Roofer/Supervisor, More) with micro-bounce animations.
       - "Popular Near You" feed of verified worker cards with dual action buttons (`View Profile` and `Book Now`).
       - Sleek floating frosted-glass bottom navigation dock with active glowing circular pill.
    2. **Screen 2 (Most Popular Services / Directory Screen):**
       - Dedicated `PopularServicesDirectory` with back navigation, real-time keyword search, and horizontal category filter pills (`All`, `Plumbing`, `Electrical`, `Masonry`, `Carpentry`, `Painting`, `Cleaning`, `Welding`, `Supervisor`).
       - Filtered worker cards displaying daily wages, star ratings, review counts, and verified badges.
    3. **Screen 3 (Worker & Contractor Detailed Profile Sheet):**
       - Comprehensive profile modal (`WorkerProfileModal`) featuring hero portrait photo in work attire, bookmarking, location, rating, experience badge, "About Me" bio, key trade skills, recent site work gallery thumbnails, and sticky contact/hire buttons (`Message` and `Book Now`).
    4. **Direct Site Booking & Attendance Integration (`AssignWorkerModal`):**
       - Connects the discovery UI directly to active project sites in Dexie DB.
       - Contractors can pick an active site, specify shift type (Full Day / Half Day / Overtime), wage and advance, immediately recording the worker into the local offline muster roll with celebratory confetti animation.

- **Phase 2.6 (Tactile Horizontal Date & Time Slot Picker Integration):**
  - Implemented the Pinterest reference date and time selection UI system:
    - **Horizontal Card Date Picker (`HorizontalDatePicker.tsx`):**
      - Displays smooth horizontal scrolling date cards with Month (`MAY`), bold Day number (`12`), and Day of week (`MON`).
      - Warm peach / coral orange active card state (`#FFE5D8` background, `#E64A19` text, soft drop shadow).
      - Auto-scrolls selected date into center view with chevron navigation buttons and optional calendar modal jump.
    - **Time Slot & Crew Count Selector (`TimeSlotPicker.tsx`):**
      - Grid of tactile shift/time pills (`08:00 AM`, `09:00 AM`, `10:00 AM`, `11:00 AM`, `12:00 PM`, etc.) with active peach pill highlight.
      - "Number of Workers / Crew" pill selector (`01`, `02`, `03`, `+`).
    - **Integrated Across App Workflows:**
      - Upgraded `AssignWorkerModal.tsx` for direct worker assignment with date cards, time slots, worker quantity, phone input, and dark navy "Confirm" action button.
      - Integrated into `AddLabourModal.tsx` for visual 1-tap date selection during manual muster entry.
      - Integrated into `LabourRegister.tsx` for instant 1-tap muster record filtering by date.

- **Phase 2.7 (Contractor-Centric Payment & Site Ledger Streamlining):**
  - Refined the dashboard and payments section to strictly match real construction contractor data and operational needs:
    1. **Dashboard Alignment:**
       - Replaced consumer discount text with contractor-focused messaging: *"100% Offline Contractor Suite"* and *"Daily Labour Muster, Tools & Site Expenses"*.
       - Maintained the clean mascot graphic and integrated 3 primary shortcuts: `Voice Log` (बोलकर भरें), `Scan Diary` (डायरी स्कैन), and `+ New Site` (नई साइट).
       - Converted trade buttons into **Daily Labour Muster by Trade** (Mason, Helper, Carpenter, Electrician, Plumber, Painter, Welder, Supervisor) for 1-tap muster access.
       - Replaced consumer handyman cards with **Today's Active Site Crew** showing real workers from the database (Subhash Mistry, Kamal Yadav, Ramu Meena, Mohan Suthar), their daily wages (`₹950/day`, `₹550/day`), and assigned sites.
       - Prominently displays active project sites and the 4 core KPI widgets.
    2. **Payments & Dues Ledger (`PendingDuesTracker.tsx`):**
       - Eliminated consumer fintech gimmicks (fake credit card numbers, CVVs, and cloud hosting bills).
       - Implemented clean, contractor-focused financial tracking:
         - **Total Outstanding Udhaar:** Real vendor credit across ongoing jobs.
         - **Completed Sites Udhaar:** Urgent warning for unpaid bills on finished projects.
         - **Settled / Paid Bills:** Real-time tally of cleared supplier invoices.
       - Category filter tabs (`All`, `Material`, `Machinery`, `Tools`, `Labour`), search bar, and 1-tap **"Mark Settled"** (`चुकता करें`) action with celebratory confetti feedback.

- **Phase 2.8 (Full Purge of Consumer Marketplace Artifacts & Contractor Search Alignment):**
  - Completed strict alignment to civil/construction contractor domain logic:
    1. **Decommissioned Consumer Artifacts:** Completely removed consumer marketplace files (`PopularServicesDirectory`, `WorkerProfileModal`, `AssignWorkerModal`, `ServicesGrid`, `WorkerCard`, and `workersDirectory.ts`).
    2. **Direct Dashboard Search:** Search queries entered in the header now filter actual local project sites (`sites`) and active crew (`activeCrew`) in real-time right on the contractor's dashboard without navigating away.
- **Phase 2.9 (Minimalist Icon-Only Action Controls in Site Headers):**
  - Streamlined the Site management header:
    - Replaced the wordy `Voice-Fill` and `Add New Site` buttons with compact, tactile icon-only buttons (`Mic` and `+`).
    - Aligned buttons horizontally with the page title and subtitle for a cleaner mobile interface with zero text overflow.

- **Phase 2.10 (Daily Worker Payment Status: Paid, Unpaid, Pending & Advance):**
  - Integrated comprehensive daily worker payment and advance tracking into the Labour Attendance sheets:
    - **Payment Status Options for Each Worker:** Introduced 4 instant status options per worker: `Paid` (चुकता), `Unpaid` (बाकी), `Pending` (लंबित), and `Advance` (एडवांस).
    - **Advance Cash Tracking:** Selecting `Advance` opens an inline advance amount input (`Adv: ₹`) allowing contractors to record partial daily wages or food money (खुराकी) paid in cash.
    - **Dynamic Balance Due Calculations:** The system automatically computes and displays remaining dues per worker (`Due: ₹...`) and aggregates Total Wages, Paid/Advance, and Total Pending at the top of the muster sheet.
    - **Seamless Synchronization Across Modals:** Fully synchronized across `EditLabourModal`, `AddLabourModal`, and `LabourDateDetailModal` with persistence to IndexedDB (`labourEntries` and `labourRecords`).

---

### 18. Streamlined Contractor Payment & Udhaar Ledger Engine
- **What it does:** Provides a clear, practical financial ledger for construction contractors to track supplier udhaar, hardware store invoices, and equipment rental dues across active and completed sites.
- **How it works:**
  - Reads directly from IndexedDB (`dues` and `sites` tables) without consumer mock data.
  - Highlights urgent uncollected balances on finished projects so contractors never lose money.
  - Provides fast category filtering and instant 1-tap bill settlement.
- **Small Summary:** A clean, practical construction ledger tailored specifically to vendor bills, material credit, and contractor cashflow.

---

### 19. Contractor Domain Search & Live Roster Filtering
- **What it does:** Allows contractors to instantly search and filter their active construction sites, on-site craftsmen, and pending bills directly from the dashboard header without clutter or consumer marketplace redirects.
- **How it works:**
  - Performs non-blocking client-side search across Dexie-backed site objects (`name`, `location`) and daily labour muster records (`workerName`, `role`).
  - Seamlessly updates visible cards on the dashboard with zero latency and full offline compatibility.
- **Small Summary:** A fast, local search engine built specifically for a contractor's on-site records and active projects.

---

### 20. Daily Worker Payment & Advance Ledger Engine
- **What it does:** Tracks per-worker daily wage settlements, advance cash payments, and pending dues directly inside daily muster attendance sheets.
- **How it works:**
  - Extends `LabourEntry` with `paymentStatus` (`'paid' | 'unpaid' | 'pending' | 'advance'`), `paidAmount`, and `balanceDue`.
  - Automatically calculates shift earnings based on attendance status (`full_day`, `half_day`, `overtime`, `absent`).
  - Dynamically updates unpaid balances when advance payments are issued and rolls them into site financial totals.
- **Small Summary:** A field-tested daily wage payment and advance tracking system tailored to Indian construction labor management.




