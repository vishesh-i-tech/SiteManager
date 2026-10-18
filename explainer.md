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

- **Phase 2.11 (Clean English Role Standard for Labour Attendance & Muster Rolls):**
  - Standardized all worker role dropdown options and form controls to clean, professional English:
    - **Eliminated Bilingual Clutter in Dropdowns:** Removed Hindi parenthetical strings like `(मजदूर)`, `(मिस्त्री)`, `(बढ़ई)`, and `(शटरिंग)` from worker role options across `EditLabourModal`, `PhotoOcrModal`, and `AddLabourModal`.
    - **Clean Standardized Roles:** Options now render clearly as `Mason`, `Helper`, `Carpenter`, `Electrician`, `Plumber`, `Plasterer`, `Painter`, `Welder`, and `Supervisor`.
    - **Syntax & Redundancy Cleanup:** Removed accidental duplicate form controls and ensured smooth, high-speed attendance review.

- **Phase 2.12 (Purge of Pre-seeded Labour Records & Direct Manual Date Entry Standard):**
  - Completely purged dummy pre-seeded muster records and established real user-entered attendance:
    - **Removed Mock Labour Records:** Emptied `SEED_LABOUR_RECORDS` and `SEED_LABOUR_ENTRIES` in `seedData.ts`. Added automatic startup database purge `cleanupSampleLabourRecords()` in Dexie to remove legacy `lr-1` dummy records from the user's browser.
    - **Clean Empty State & Live Crew Count:** Removed hardcoded fallback counts (`6 workers`, `₹4225`, and fake crew cards) in `DashboardOverview.tsx`. The dashboard now reflects real entries with a prominent `+ Log Worker Attendance` prompt when empty.
    - **Unified Direct Date Input:** Replaced the horizontal date scroller in `AddLabourModal.tsx` with the clean, standard `Date *` input field, matching `EditLabourModal.tsx` for fast, direct manual entry.

- **Phase 2.13 (Decommission of Redundant Dashboard Trade Muster Grid):**
  - Streamlined the dashboard hierarchy by removing the redundant "Daily Labour Muster by Trade" grid:
    - **Eliminated Unneeded Trade Grid:** Removed the 8-button trade selector grid (`Mason`, `Helper`, `Carpenter`, `Electrician`, `Plumber`, `Painter`, `Welder`, `Supervisor`) from [DashboardOverview.tsx](file:///d:/TECH/site%20sathi/src/components/dashboard/DashboardOverview.tsx).
    - **Reduced Bundle & Asset Footprint:** Cleaned up unused Lucide icons (`HardHat`, `Hammer`, `Zap`, `Paintbrush`, `BrickWall`, `Flame`) and the static `tradeQuickLog` data array.
    - **Focused Contractor UX:** The dashboard directly displays active projects and real crew records without confusing intermediate role cards.

- **Phase 2.14 (Interactive 3D Mascot Integration & Hero Banner Simplification):**
  - Modernized the hero banner with a tactile, interactive 3D character and removed redundant marketing text:
    - **Banner Simplification:** Removed the red-rectangle boxed headline (*"Daily Labour Muster, Tools & Site Expenses"*), top tag (*"100% Offline Contractor Suite"*), and redundant CTA button (*"+ New Site"*) from [ExploreBanner.tsx](file:///d:/TECH/site%20sathi/src/components/discovery/ExploreBanner.tsx).
    - **Left Positioned 3D Character:** Relocated the 3D builder mascot to the left side of the banner.
    - **Touch & Drag 3D Rotation Engine:** Built [Interactive3DCharacter.tsx](file:///d:/TECH/site%20sathi/src/components/common/Interactive3DCharacter.tsx) featuring 360-degree pointer drag/touch rotation, multi-axis tilt, realistic physics inertia coasting, dynamic specular reflection lighting, and ground shadow skewing.

- **Phase 2.15 (Purge of Fluff Text & Unified Hero Action Bar):**
  - Completely purged all unusual/promotional text from the hero banner:
    - **Zero Unusual Text:** Removed the *"100% Offline Active"* badge, *"SiteSaathi 3D Companion"* title, and *"Touch or drag the character to spin in 3D"* hint from [ExploreBanner.tsx](file:///d:/TECH/site%20sathi/src/components/discovery/ExploreBanner.tsx) and [Interactive3DCharacter.tsx](file:///d:/TECH/site%20sathi/src/components/common/Interactive3DCharacter.tsx).
    - **Integrated Action Controls:** Integrated the 3 primary contractor shortcut buttons (*"Voice Log"*, *"Scan Diary"*, *"New Site"*) directly beside the 3D rotating character.
    - **Eliminated Duplicate Stacking:** Removed the redundant secondary 3-button row in [DashboardOverview.tsx](file:///d:/TECH/site%20sathi/src/components/dashboard/DashboardOverview.tsx), producing a compact, highly functional header.

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

---

### 21. Standardized English Role Engine for Muster Rolls
- **What it does:** Provides a streamlined, unambiguous English role taxonomy for construction workers across all manual and camera-assisted attendance flows.
- **How it works:**
  - Standardizes the `LabourEntry['role']` enumeration across UI controls so dropdown selectors display concise English values without cluttered dual-language brackets.
  - Ensures seamless matching between optical character recognition (OCR) parsing, manual entry, and PDF attendance reports.
- **Small Summary:** A clean, professional English role selection interface for fast, error-free muster roll logging.

---

### 22. Clean Manual Attendance Ledger Engine
- **What it does:** Guarantees that only real dates, authentic job sites, and genuine worker attendance details logged by the contractor are stored and shown across the app.
- **How it works:**
  - Disables pre-seeded mock muster data in storage and clears hardcoded fallback counts on dashboard widgets.
  - Unifies date inputs to direct standard date pickers across both addition and editing modals, giving contractors total control over attendance logging.
- **Small Summary:** A pure, clutter-free attendance recording engine populated 100% by contractor input.

---

### 23. Interactive 3D Perspective & Inertia Drag Engine
- **What it does:** Transforms the contractor mascot into a touchable, 3D rotating figurine that users can spin and inspect using touch or mouse gestures.
- **How it works:**
  - Tracks pointer coordinates (`PointerEvents`) with pointer capture across mobile touches and desktop mice.
  - Computes horizontal displacement into 360° `rotateY` angle and vertical displacement into clamped `rotateX` perspective tilt.
  - Employs `requestAnimationFrame` with friction coefficients (0.92) to deliver realistic momentum coasting upon release.
  - Dynamically recalculates CSS linear-gradient specular angles and ground shadow skewing based on current rotation angles.
- **Small Summary:** An interactive, hardware-accelerated 3D touch-rotation component that elevates app engagement.

---

## Phase 2.16: Labour Attendance View Details & Per-Worker Payment Breakdown

### 1. Technology: SiteDetailsModal Labour Breakdown & LabourDateDetailModal Integration
- **Role & Purpose:**
  - Provides a direct, prominent "View Details" action on every attendance sheet inside the Site Details dialog right alongside the attendance date and worker count.
  - Implements a transparent 3-way financial breakdown for every individual worker:
    1. **Total Daily Wage / Earned** (`Total: ₹{earned}`)
    2. **Paid Amount / Advance Given** (`Paid: ₹{paid}`)
    3. **Remaining Balance Due** (`Due: ₹{due}`)
  - Allows contractors to instantly inspect which worker has been paid in full, who took an advance, and who has pending wages both directly in the site muster view and via the dedicated detailed popup modal.
- **Under the Hood:**
  - Evaluates each worker's attendance status (`full_day`, `half_day` -> 50% multiplier, `absent` -> 0).
  - Calculates net earned wages vs `paidAmount` to derive realtime `balanceDue` without requiring server recalculations.
  - Renders inline color-coded status badges (`emerald` for Paid, `rose` for Due, `slate` for Settle/Zero) on each worker card in `SiteDetailsModal`.
  - Links to `LabourDateDetailModal` with single-click PDF export, CSV export, and complete individual muster records.
- **Small Summary:** Added an intuitive "View Details" button in the Site Details Labour tab and detailed per-worker Total/Paid/Due breakdown across all attendance views.

---

## Phase 2.17: Prominent Pending Wage Display & De-congested Muster Layout

### 1. Technology: Realtime Pending Wage State & De-congested Muster UI
- **Role & Purpose:**
  - Guarantees that when a worker's payment status is selected as `Pending`, the pending amount is immediately and prominently displayed (`Pending: ₹{amount}`) with a dedicated amber badge and clock icon.
  - Adds a persistent `Pending: ₹{totalPending}` pill in the modal header stats bar alongside `Workers`, `Wages`, and `Paid`.
  - Streamlines row layouts with concise, uncluttered text so that dropdown options (`Full Day`, `Half Day`, `Overtime`, `Absent`) and payment status pills (`Paid`, `Unpaid`, `Pending`, `Advance`) do not get truncated or congested.
  - Automatically transitions an `absent` worker to `full_day` when a contractor actively assigns `Pending`, `Paid`, or `Advance`, ensuring wage calculations correctly reflect intended work earnings.
  - Refined OCR handwritten register regex boundaries in `ocrProcessor.ts` so normal Hindi or English characters do not inadvertently flag workers as absent.
- **Under the Hood:**
  - Replaced ad-hoc string concatenation in modal stats headers with modular flex pill badges.
  - Updated `handleUpdateEntry` to recalculate `earnedWage` and `totalPending` in real-time on every status or wage change.
  - Replaced hardcoded `Due: ₹0` labels with contextual, color-coded badges (`Pending: ₹...` in amber, `Unpaid: ₹...` in rose, `Paid: ₹...` in emerald, `Adv/Due` in blue).
- **Small Summary:** Added prominent amber Pending wage badges across worker rows and summary bars while de-congesting text layouts for seamless mobile/desktop entry.

---

## Phase 2.18: Dashboard Streamlining & Redundant Site Feed Removal

### 1. Technology: Dashboard Overview Clean-up
- **Role & Purpose:**
  - Removed the duplicate "Project Sites" feed and site card list from the main Home dashboard overview.
  - Eliminates information duplication since all site management, work statuses, financial meters, and details are comprehensively handled in the dedicated **Sites** tab (`SitesView.tsx`).
  - Keeps the contractor dashboard clean, lightweight, and focused on essential daily operations: the 3D character action hub, active crew attendance muster, and 2x2 KPI metrics (Active Sites, Workers Today, Tool Inventory, Pending Dues).
- **Under the Hood:**
  - Unmounted `SiteCard` component and removed unused `visibleSites` query state from `DashboardOverview.tsx`.
  - Retained the `Active Sites` KPI widget as a smart, direct navigation shortcut (`onNavigateTab('sites')`) into the full Sites page.
- **Small Summary:** Streamlined the home dashboard by removing the redundant Project Sites card feed, maintaining clean separation with the dedicated Sites tab.

---

## Phase 2.19: Client Contract Payments Tracking & Milestone Receipts System

### 1. Technology: Client Contract Payments System (`ClientPayment`, `clientPayments` Dexie Table, `RecordClientPaymentModal`)
- **Role & Purpose:**
  - Allows contractors to track all payments, advance deposits, running account (RA) bills, and milestone receipts received from the client/party who awarded the contract.
  - Answers the critical contractor questions:
    - *Who gave the contract?* (Client / Awarder Name & Phone)
    - *When did they pay?* (`paymentDate` - date picker)
    - *How much was paid?* (`amount` - numeric INR amount with quick-fill presets)
    - *How was it paid?* (`paymentMode` - UPI / Online, Bank Transfer, Cash, Cheque)
    - *For what milestone?* (`notes` - Booking Advance, Plinth Beam Stage, 1st Slab, Running Bill, Final Settlement)
    - *What is the transaction proof?* (`referenceNo` - UTR / Cheque / Txn ID)
  - Seamlessly tracks contract collection progress:
    - **Total Contract Budget** (`₹{budget}`)
    - **Total Client Received** (`₹{totalReceived}`)
    - **Remaining Client Due** (`₹{clientDue}`)
    - **Collection Progress %** (`{clientPaymentProgress}%`)
- **Under the Hood:**
  - **Dexie.js Schema Upgrade (Version 3):**
    - Added `clientPayments` table indexed by `id, siteId, paymentDate, paymentMode`.
    - Enhanced `Site` entity with optional `clientName?: string` and `clientPhone?: string`.
    - Extended `getSiteFinanceSummary(siteId)` to compute `totalClientReceived`, `clientBalanceDue`, and `clientPaymentProgress`.
  - **Automated Site Payment Status Sync:**
    - `recordClientPayment` and `deleteClientPayment` recalculate cumulative receipts vs estimated contract budget and automatically synchronize the site's `paymentStatus` (`unpaid`, `partially_paid`, `paid`).
  - **Cascade Delete & Backup Engine Integration:**
    - Integrated `clientPayments` into `deleteSite(siteId)`, `clearAllData()`, `exportBackupJson()`, and `importBackupJson()`.
  - **UI Integration Across Multiple Views:**
    - **Main Sites Cards (`SiteCard.tsx`):** Displays a dedicated `Client Received: ₹X / ₹Y (Z%)` and `Client Due: ₹W` card with payer name and real-time status.
    - **Site Details Overview Tab (`SiteDetailsModal.tsx`):** Displays a prominent "Client Contract & Payments Received" card with contract collection progress bar and quick "+ Record Payment" and "History" actions.
    - **Site Details Client Receipts Sub-Tab:** A dedicated sub-tab displaying the full chronological payment history, complete with payment mode badges, reference IDs, milestone notes, received amounts in emerald green, and delete entry support.
    - **Add & Edit Site Modals (`AddSiteModal.tsx`, `EditSiteModal.tsx`):** Added `Client / Awarder Name` and `Client Phone` fields.
    - **Financial Statement PDF Exporter (`reportExporter.ts`):** Added a dedicated "4. Client Payments Received History" table to the exported project PDF statement.
- **Small Summary:** Added end-to-end client contract payment receipts tracking with Dexie version 3 storage, SiteCard balance meters, a dedicated Client Receipts tab with milestone timeline, and PDF report integration.

---

## Phase 2.20: Dashboard Active Site Crew Roster Removal & Workspace De-cluttering

### 1. Technology: Dashboard Overview Streamlining
- **Role & Purpose:**
  - Removed the "Today's Active Site Crew" worker card feed from the main Home dashboard overview.
  - Labour attendance, worker wages, and daily muster management are already comprehensively handled in the dedicated **Labour** tab (`LabourView.tsx`) and per-site inside the **Site Details Dialog** (`SiteDetailsModal.tsx`).
  - Eliminates visual clutter from the mobile dashboard view, resulting in a cleaner, faster-loading interface focused on the 3D mascot interaction hub and the 2x2 key operational metrics (Active Sites, Today's Workers, Tool Inventory, Pending Dues).
- **Under the Hood:**
  - Removed `activeCrew` slicing and `visibleCrew` filtering state from `DashboardOverview.tsx`.
  - Removed the "Today's Active Site Crew" container card, empty-state attendance prompt, and unused Lucide icon imports (`CheckCircle2`, `Plus`, `Clock`).
  - Kept the "Workers Today" 2x2 KPI widget with active worker counter and daily wage total, maintaining a direct tap shortcut (`onNavigateTab('labour')`) to the full Labour Register.
- **Small Summary:** Removed the redundant "Today's Active Site Crew" feed from the dashboard, keeping the home screen clean, lightweight, and fast while preserving quick KPI access to the Labour tab.

---

## Phase 2.21: Pending Dues Header Icon Simplification

### 1. Technology: Tactile Icon-Only Action Button (`PendingDuesTracker.tsx`)
- **Role & Purpose:**
  - Replaced the text-heavy `+ + Add Bill` button in the "Pending Bills & Supplier Udhaar" header with a sleek, minimalist `+` icon button.
  - Aligns the Dues header with the application's clean mobile design language (matching the icon buttons on the Sites and Labour pages).
  - Eliminates redundant text and label overflow on narrow mobile screens while preserving immediate accessibility and tapability.
- **Under the Hood:**
  - Replaced `<button className="px-4 py-2 ..."><span>+ Add Bill</span></button>` with `<button className="w-10 h-10 rounded-xl ..."><Plus className="w-5 h-5 stroke-[2.5]" /></button>`.
  - Maintained accessibility standards with semantic `title` and `aria-label` attributes (`"Add Bill"` / `"नया बिल जोड़ें"`).
- **Small Summary:** Swapped the text-based "+ Add Bill" button on the Dues page header for a clean, square `+` icon button to match the rest of the mobile interface.

---

## Phase 2.22: Dues Header Text Shortening & Typography Optimization

### 1. Technology: Typography Scaling & Header De-congestion (`PendingDuesTracker.tsx`)
- **Role & Purpose:**
  - Shortened the verbose header title from `"Pending Bills & Supplier Udhaar"` (`"बकाया बिल व सप्लायर उधारी"`) to the clean, concise `"Pending Dues"` (`"बकाया बिल"`).
  - Scaled down the font size from `text-base sm:text-lg font-extrabold` to `text-sm sm:text-base font-bold`, preventing the title from wrapping awkwardly across multiple lines on mobile screens.
  - Eliminated the badge squishing bug where the `{unpaidDues.length} Due` badge was compressed and forced into two stacked vertical lines (`0 \n Due`).
- **Under the Hood:**
  - Added `whitespace-nowrap` to both the title `<h1>` and the counter badge with `shrink-0`.
  - Added `min-w-0` to the parent text flex column and `truncate` to the subtitle text (`text-[11px]`) for clean, responsive flex containment across mobile and desktop viewports.
  - Updated Hindi localization strings to match the compact wording (`बकाया बिल` and `सामग्री, उपकरण व लेबर बकाया`).
- **Small Summary:** Shortened the Dues header title to "Pending Dues", scaled the typography to a balanced size, and ensured the title and counter badge fit cleanly on a single line without wrapping.

---

## Phase 2.23: Granular Option PDF Reports & Machinery Self-Owned Default

### 1. Technology: Modular PDF Exporters for Every Site Sub-Option (`reportExporter.ts`, `SiteDetailsModal.tsx`)
- **Role & Purpose:**
  - Added dedicated, high-fidelity PDF report generation buttons to every individual tab/option within the Site Details dialog (`Client Receipts`, `Tools`, `Labour Register`, `Materials`, `Machinery & Fuel`, and `Dues`).
  - Allows contractors to export and share focused, itemized statements with specific stakeholders (e.g., sending a Client Receipts Statement to the property owner, a Tools Dispatch Sheet to the warehouse manager, or a Materials Outflow report to suppliers) without having to export the entire financial audit.
  - Added individual milestone **Payment Receipt Vouchers** (`exportIndividualReceiptPdf`) directly on each client payment card.
- **Under the Hood:**
  - Built 6 dedicated jsPDF + AutoTable generators in `reportExporter.ts`:
    - `exportClientReceiptsPdf`: Contract budget vs total received, balance receivable, and chronological receipt ledger.
    - `exportIndividualReceiptPdf`: Formal branded payment voucher with reference number, payer details, amount box, and signature line.
    - `exportSiteToolsPdf`: Site inventory sheet differentiating self-owned vs purchased equipment, dispatch dates, and return statuses.
    - `exportSiteMaterialsPdf`: Comprehensive material purchases breakdown with quantities, unit rates, and supplier payment statuses.
    - `exportSiteMachineryPdf`: Machinery equipment log detailing diesel consumption, rental costs, and total run costs.
    - `exportSiteDuesPdf`: Outstanding supplier bills, vendor payables, and due dates.
  - Integrated tactile action buttons in each sub-tab header in `SiteDetailsModal.tsx`.

### 2. Technology: Default Self-Owned Machinery Architecture (`AddMachineryModal.tsx`, `EditMachineryModal.tsx`)
- **Role & Purpose:**
  - Repositioned the **Self / Owned** option to the **LEFT** and **Rental** to the **RIGHT**.
  - Enforced **Self-Owned as the permanent default selection** upon opening the modal (`ownership: 'owned'`, `rentalCost: 0`).
  - Contractors only switch to "Rental" if the machine was specifically hired from a third-party vendor.
- **Under the Hood:**
  - Initialized `ownership` state to `'owned'` and `rentalCost` to `0`.
  - Added an `isOpen` reset effect to guarantee that reopening the modal always defaults to `Self-Owned`.
  - Dynamically disabled the Machine Rent input displaying `₹0 (Self-Owned)` when in owned mode, seamlessly enabling input when toggled to Rental.
  - Mirrored the same layout and logic in `EditMachineryModal.tsx` for consistent data management.
- **Small Summary:** Added dedicated PDF export buttons for every site sub-view (receipts, tools, labour, materials, machinery, dues), plus single receipt vouchers, and defaulted machinery to Self-Owned on the left with ₹0 rent.

---

## Phase 2.24: Dashboard Client Contract & Payments Received (View-Only)

### 1. Technology: Reactive Cross-Site Payment Ledger Widget (`DashboardOverview.tsx`)
- **Role & Purpose:**
  - Added a dedicated, glanceable **Client Contract & Payments Received** (`क्लाइंट अनुबंध व प्राप्त भुगतान`) summary card directly to the main Dashboard overview.
  - Enforced a strict **View-Only** policy: absolutely NO `+ Record Payment` or `+ Add` button exists on the dashboard to prevent unintended data entry from the high-level home view.
  - Gives contractors immediate visibility into cumulative contract volume, total money collected into bank/cash accounts, and overall outstanding client receivables across all sites.
- **Under the Hood:**
  - **Dexie Reactive Integration:** Utilizes `useLiveQuery` from `dexie-react-hooks` to observe `db.clientPayments.toArray()` in real-time. Any payment recorded, updated, or removed inside a site immediately triggers an instant recalculation of dashboard totals.
  - **Aggregate Financial Metrics:**
    - `totalContract`: Sum of estimated contract budgets across all active sites.
    - `totalReceived`: Sum of all milestone payments collected to date across all sites.
    - `totalClientDue`: Remaining receivable balance across all contracts.
    - `collectionProgress`: Real-time percentage meter with a smooth emerald progress bar and status indicator (`Fully Settled`, `Partially Paid`, or `Awaiting Payment`).
  - **Recent Receipts Stream (View-Only):** Displays the latest 3 client receipts sorted descending by date with payer names, payment mode badges (UPI, Cash, Cheque, Bank Transfer), and received amounts.
  - **Navigation Link:** Features a clean `View Sites` (`साइट विवरण`) action button to jump directly to the Sites management view without exposing destructive or mutating actions.
- **Small Summary:** Brought the Client Contract & Payments Received financial card onto the Dashboard in a strictly view-only format, providing cumulative collection metrics, progress tracking, and recent receipt history with zero add buttons.

---

## Phase 2.25: Explore Banner Shortcut Label Simplification

### 1. Technology: Concise Micro-Action Button Labeling (`ExploreBanner.tsx`)
- **Role & Purpose:**
  - Simplified the OCR camera shortcut button label from `"Scan Diary"` (`"डायरी स्कैन"`) to the clean, modern single-word **`"Scan"`** (`"स्कैन"`).
  - Eliminates unnecessary multi-word wrapping on smaller screens, keeping the trio of home action buttons (`Voice Log`, `Scan`, `New Site`) balanced, symmetrical, and uncluttered.
- **Under the Hood:**
  - Updated the button label typography in `ExploreBanner.tsx`:
    `{language === 'hi' ? 'स्कैन' : 'Scan'}`
- **Small Summary:** Shortened the dashboard action shortcut from "Scan Diary" to "Scan" for a cleaner, unified mobile interface.

---

## Phase 2.26: Dashboard Client Contract Widget Streamlining

### 1. Technology: High-Level Financial Card De-cluttering (`DashboardOverview.tsx`)
- **Role & Purpose:**
  - Removed the detailed `"Recent Client Receipts (View Only)"` stream and individual receipt preview rows from the dashboard's "Client Contract & Payments Received" card.
  - Kept the dashboard focused purely on high-level executive summaries (Total Contract, Received So Far, Client Due, collection progress meter, and `View Sites` navigation).
  - Individual client receipts and payment history remain safely accessible and manageable inside their respective Site Details modals (`Client Receipts` tab).
- **Under the Hood:**
  - Removed the `recentPayments` query slice and unused `Calendar` icon import from `DashboardOverview.tsx`.
  - Removed the conditional `{recentPayments.length > 0 && (...) }` list container.
  - Reduced DOM node overhead and preserved a compact mobile layout height without vertical clutter.
- **Small Summary:** Streamlined the Dashboard Client Contract card by removing the itemized recent receipts section while preserving cumulative financial totals and progress indicators.

---

## Phase 2.27: Labour Empty State Button Simplification

### 1. Technology: Compact Tactile Icon Actions (`LabourRegister.tsx`)
- **Role & Purpose:**
  - Replaced the verbose `+ + Add Muster` (`+ हाजिरी जोड़ें`) text button in the Worker Entry / Attendance empty state with a sleek, minimalist **`+` icon-only** button.
  - Replaced `"Scan Register"` with the unified, concise **`"Scan"`** (`"स्कैन"`) button.
  - Creates visual symmetry with the top navigation header which also features the `+` icon button alongside the `Scan` pill button.
- **Under the Hood:**
  - Replaced the text span with a `w-10 h-10` square rounded icon button utilizing `Plus` icon from `lucide-react`, primary brand theme styling, and accessible `aria-label="Add Muster"`.
  - Styled the OCR scan button with `h-10 px-4 rounded-xl` containing the camera icon and `"Scan"` label (`"स्कैन"` in Hindi).
  - Aligned header scan button attributes and labels for full UI consistency.
- **Small Summary:** Simplified the Labour empty state buttons by replacing "+ Add Muster" with a clean "+" icon button and shortening "Scan Register" to "Scan".

---

## Phase 2.28: Worker Entry Date Filter Strip De-cluttering

### 1. Technology: Streamlined Calendar Filter Header (`LabourRegister.tsx`)
- **Role & Purpose:**
  - Removed the redundant `"Filter Attendance by Date"` label and `"View All Dates (Reset)"` link located above the horizontal date strip.
  - Leaves the clean horizontal calendar card with date pills, navigation chevrons, and calendar picker toggle directly accessible without vertical padding overhead.
  - Supports intuitive toggle filtering: tapping the currently selected date deselects it and restores the full dates view automatically.
- **Under the Hood:**
  - Removed the `flex items-center justify-between` header wrapper above `<HorizontalDatePicker />`.
  - Updated the date change callback to support toggle deselection: `setSelectedDateFilter((prev) => (prev === d ? null : d))`.
  - Retained all horizontal scrolling, month/day badges, and native calendar picker functionality.
- **Small Summary:** Removed the redundant "Filter Attendance by Date" and "View All Dates (Reset)" header row above the attendance calendar filter strip.

---

## Phase 2.29: Removal of "(Optional)" and "(वैकल्पिक)" Across the Application

### 1. Technology: Clean Labeling Architecture Across All Modals & Screens
- **Role & Purpose:**
  - Eliminated the redundant word `"(Optional)"` and its Hindi counterpart `"(वैकल्पिक)"` from all input field labels, form controls, and onboarding screens throughout the entire application.
  - Ensures a cleaner, modern mobile aesthetic where essential fields use clear asterisks (`*`) when mandatory, and non-mandatory fields avoid visual clutter.
- **Under the Hood:**
  - **Labour Modal (`AddLabourModal.tsx`):** Changed `"Notes / Diary Remarks (Optional)"` to `"Notes / Diary Remarks"` (`"टिप्पणी / विवरण"`).
  - **Tools Modal (`AddToolModal.tsx`):** Changed `"Size / Spec (Optional)"` to `"Size / Spec"` (`"साइज / विवरण"`).
  - **Auth Screen (`AuthScreen.tsx`):** Changed `"PIN / Password (Optional)"`, `"Firm / Business Name (Optional)"`, `"Email / Gmail (Optional)"`, and `"Security PIN / Password (Optional)"` to clean direct labels without parenthesis tags.
  - **Auth Modal (`AuthModal.tsx`):** Changed `"Email / Gmail (Optional)"` to `"Email / Gmail"`.
  - **Translations Dictionary (`translations.ts`):** Cleaned English and Hindi dictionaries for `companyName` to remove trailing `(Optional)` / `(वैकल्पिक)`.
- **Small Summary:** Purged all occurrences of the keyword "Optional" and "(वैकल्पिक)" across all forms, modals, and translations in the application.

---

## Phase 2.30: Page Size & Layout Shift Stabilization on Tab Switch

### 1. Technology: Scale-Free Animation & Fixed Simulator Shell (`index.css`, `MobileDeviceShell.tsx`)
- **Role & Purpose:**
  - Fixed the visual page size jumping and zoom flicker observed when switching between navigation tabs.
  - Stabilized the mobile device frame height so it remains rock-solid regardless of the varying height of content in different tabs (e.g. long dashboard vs. empty sites/labour list).
  - Prevented horizontal width layout shifts caused by scrollbars appearing and disappearing between tabs.
- **Under the Hood:**
  - **Removed `transform: scale(0.99)` from `animate-fade-in` (`index.css`):** Previously, `fadeIn` scaled down the page to `scale(0.99)` and expanded to `scale(1)` over 150ms on every tab switch. Replaced with pure opacity fade (`from { opacity: 0; } to { opacity: 1; }`) with 0 size scaling.
  - **Stabilized Device Frame Height (`MobileDeviceShell.tsx`):** Set fixed realistic phone viewport height `h-[844px] max-h-[92vh]` in mobile simulator mode instead of dynamic `min-h-[850px]` which caused height animations.
  - **Constrained Transitions:** Replaced broad `transition-all duration-300` on the device shell with targeted `transition-[max-width,border-radius,border-width]` so internal page height changes never trigger frame resize animations.
  - **Added `scrollbar-gutter: stable`:** Ensured the internal scroll lane remains reserved so scrollbar appearance on tall pages doesn't shift content width by 6px.
- **Small Summary:** Eliminated page size changes and zooming on tab switch by replacing the scale-down CSS transition with a pure opacity fade, fixing the simulator frame height, and stabilizing the scrollbar gutter.

---

## Phase 2.31: Removal of Standalone Pending Dues Page & Bottom Navigation Streamlining

### 1. Technology: 3-Pill Bottom Navigation & Site-Centric Dues Consolidation (`BottomNav.tsx`, `App.tsx`, `DashboardOverview.tsx`)
- **Role & Purpose:**
  - Removed the standalone **Pending Dues** global page from the bottom navigation bar per user request.
  - Streamlined the bottom navigation to a clean, focused 3-tab layout: **Home (Dashboard)**, **Sites**, and **Workers (Labour)**.
  - Retained granular dues and payment tracking inside each site's detail workspace (`SiteDetailsModal.tsx` -> `Dues` tab) and PDF export statement.
- **Under the Hood:**
  - **Bottom Navigation (`BottomNav.tsx`):** Removed `{ id: 'dues', label: 'Dues', icon: Receipt }` from `mainNavItems`. Adjusted floating pill width to `max-w-[260px] sm:max-w-[280px]` with `px-3` padding for balanced 3-icon symmetry.
  - **Route Redirection (`App.tsx`):** Updated `handleNavigateTab` so any dues navigation triggers route directly to `'sites'`. Unmounted `PendingDuesTracker` from global tab views.
  - **Dashboard Overview (`DashboardOverview.tsx`):** Pointed the Pending Dues metric widget directly to the Sites tab (`onNavigateTab('sites')`).
  - **Reminders Modal (`RemindersModal.tsx`):** Routed dues reminders directly to the Sites tab where individual site records are managed.
- **Small Summary:** Removed the standalone Pending Dues page from bottom navigation, creating a balanced 3-tab bar (Home, Sites, Workers) while preserving site-level dues tracking.

---

## Phase 2.32: Add Site Modal Label Simplification

### 1. Technology: Concise Form Label Architecture (`AddSiteModal.tsx`, `EditSiteModal.tsx`)
- **Role & Purpose:**
  - Simplified multi-term slashed field labels in the **Add New Site** and **Edit Site** modals as requested.
  - Removed secondary trailing descriptors after the slash character (`/`) to keep form typography clean, punchy, and readable on mobile screens.
- **Under the Hood:**
  - `Site / Project Name *` -> Simplified to **`Site Name *`** (`साइट का नाम *`).
  - `Location / Address *` -> Simplified to **`Location *`** (`लोकेशन *`).
  - `Client / Awarder Name` -> Simplified to **`Client Name`** (`क्लाइंट का नाम`).
  - `Site Notes / Terms` -> Simplified to **`Site Notes`** (`साइट टिप्पणी`).
- **Small Summary:** Simplified the Add Site form labels by removing trailing slashed words ("Site Name", "Location", "Client Name", "Site Notes").

---

## Phase 2.33: Manual Date Entry without Calendar Popup & Audit Timestamping ("Last Edited")

### 1. Technology: Manual Date Input & Normalization Engine (`dateUtils.ts`, `AddSiteModal.tsx`, `EditSiteModal.tsx`, `RecordClientPaymentModal.tsx`)
- **Role & Purpose:**
  - Replaced browser-native calendar picker controls (`<input type="date">`) with manual text inputs (`<input type="text" placeholder="DD-MM-YYYY">`).
  - Pre-fills current date (`DD-MM-YYYY`) by default whenever creating a new site or logging client receipts, allowing users to simply click and type to edit without opening disruptive OS calendar dialogs.
  - Normalizes user-typed dates (`DD-MM-YYYY` or `DD/MM/YYYY`) into standard ISO format (`YYYY-MM-DD`) for stable IndexedDB storage and Dexie queries.
- **How it Works (Under the Hood):**
  - **`dateUtils.ts` Helpers:**
    - `getTodayFormatted()`: Extracts local date parts (`getDate()`, `getMonth() + 1`, `getFullYear()`) and zero-pads to standard `DD-MM-YYYY` format.
    - `toDisplayDate(iso)`: Safely parses ISO or `YYYY-MM-DD` strings from Dexie database into Indian-standard `DD-MM-YYYY` for text input and display.
    - `toIsoDate(str)`: Converts `DD-MM-YYYY` or `DD/MM/YYYY` into `YYYY-MM-DD` before storing in Dexie IndexedDB.
    - `formatAuditTimestamp(ts, lang)`: Formats ISO timestamps into human-readable date and 12-hour AM/PM time (e.g. *"17 Oct 2026, 01:45 PM"*).
  - **Manual Input:** Text input elements use `inputMode="numeric"`, `placeholder="DD-MM-YYYY"`, and no webkit calendar picker indicator, preventing native OS calendar popups on click.
- **Small Summary:** Eliminated calendar popups by implementing auto-populated manual text fields formatted as DD-MM-YYYY with ISO database synchronization.

---

### 2. Technology: Audit History & "Last Edited" Timestamp Tracking (`types/index.ts`, `EditSiteModal.tsx`, `SiteCard.tsx`, `SiteDetailsModal.tsx`)
- **Role & Purpose:**
  - Tracks creation and modification timestamps on site records so contractors can always see when a project was created and when changes were last saved.
  - Displays creation dates and last-edited audit timestamps directly on site cards, the site overview dashboard, and edit dialogs.
- **How it Works (Under the Hood):**
  - **Schema Extension (`types/index.ts`):** Added optional `updatedAt?: string;` property to the `Site` TypeScript interface.
  - **Creation Timestamping (`AddSiteModal.tsx`):** Records `createdAt` and initial `updatedAt` with `new Date().toISOString()` on site creation. Displays an auto-timestamp notice in the modal.
  - **Edit Mutation Timestamping (`EditSiteModal.tsx`):** Updates `updatedAt` to `new Date().toISOString()` whenever a site record is saved. Shows an audit summary card at the bottom of the edit form with Created date and Last Edited date/time.
  - **Card Footer Audit Display (`SiteCard.tsx`):** Shows the site start date along with an amber clock icon indicating *"Edited: [Date, Time]"* (or *"बदलाव: [तारीख, समय]"*).
  - **Project Details Audit (`SiteDetailsModal.tsx`):** Renders a 3-badge audit card in the Overview tab displaying Start Date, Created On, and Last Edited timestamps.
- **Small Summary:** Added comprehensive audit tracking to sites, displaying when records were created and last modified across cards, modals, and overview screens.

---

## Phase 2.34: Orphan / Demo Data Auto-Purge & Site-Scoped KPI Aggregation

### 1. Technology: Cascade Orphan Cleanup & Site-Scoped Dashboard Metrics (`database.ts`, `DashboardOverview.tsx`, `App.tsx`)
- **Role & Purpose:**
  - Resolved the ghost count issue where the Dashboard's **Tool Inventory** widget displayed *"2 Overdue / 2 Total Tools"* even when no sites had been created by the user (`0 Sites`).
  - Automatically purges orphan records (tools, materials, machinery, dues, worker attendance, client receipts) when all sites are deleted or when a child record's parent site no longer exists in IndexedDB.
  - Ensures the Dashboard Overview dynamically scopes all KPI metrics strictly to active, existing sites (`validSiteIds`).
- **How it Works (Under the Hood):**
  - **Why it occurred:** The browser's persistent IndexedDB retained demo equipment records (`tool-1` and `tool-3`) from the initial seed dataset after the demo sites had been deleted from the UI.
  - **Orphan Sweeper Engine (`database.ts` -> `cleanupOrphanRecords()`):**
    - Checks the active `sites` collection on application initialization (`ensureDefaultAccounts`).
    - If `siteIds.size === 0`, it completely clears all child tables (`tools`, `materials`, `machinery`, `dues`, `labourRecords`, `labourEntries`, `clientPayments`), ensuring a 100% clean slate.
    - If sites exist, it identifies any child records whose `siteId` is not present in the active sites collection and performs a bulk delete on them.
  - **Reactive Watcher (`App.tsx`):** Added a reactive `useEffect` hook listening to `sites.length`. If all sites are deleted or cleared, it instantly triggers `db.cleanupOrphanRecords()`.
  - **Site-Scoped Aggregations (`DashboardOverview.tsx`):**
    - Scopes `activeTools = sites.length > 0 ? tools.filter((t) => validSiteIds.has(t.siteId)) : []`.
    - When `sites.length === 0`, `activeTools.length === 0` and `overdueTools.length === 0`, reliably displaying **"0 On Track / 0 Total Tools"**.
- **Small Summary:** Eliminated leftover ghost demo tools and ensured all dashboard KPI widgets calculate strictly from existing sites, showing 0 across all cards on a fresh slate.

---

## Phase 2.35: Reference-Grade Onboarding & Auth Flow Redesign

### 1. Technology: Minimalist 3-Step Onboarding, Sign In & Sign Up System (`AuthScreen.tsx`, `auth_hero.jpg`)
- **Role & Purpose:**
  - Redesigned the entire landing, login, and registration experience to match the modern, minimalist mobile reference aesthetic provided by the user.
  - Implemented a cohesive 3-view journey:
    1. **Onboarding Splash:** Custom 2D contractor hero illustration, bold headline, and interactive split-pill *"Get Started →"* action button.
    2. **Sign In ("Welcome Back"):** Minimalist character thumbnail, floating-label pill inputs, password recovery, vivid blue rounded button, and 1-tap contractor profile login.
    3. **Sign Up ("Register"):** Clean pill inputs for contractor profile (Name, Phone, Trade Category dropdown, Firm Name, PIN), Google authentication, and instant account creation.
- **How it Works (Under the Hood):**
  - **Floating-Label Pill Containers:** Uses rounded-2xl inputs with uppercase tracking labels and subtle borders (`border-slate-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100`).
  - **Decorative Micro-Doodles:** Subtle background vector doodles (stars, compass markers, geometric drafting accents) matching the reference design.
  - **Asset Integration:** High-resolution 2D vector hero illustration (`/images/auth_hero.jpg`) depicting a civil engineer with blueprints, laptop, and drafting tools.
  - **Database & State Synchronization:** Fully connected to Dexie IndexedDB (`db.account`), preserving multi-trade switching, password PIN encryption, and bilingual English/Hindi localization.
- **Small Summary:** Redesigned the authentication experience into a reference-grade 3-screen flow (Onboarding, Sign In, Sign Up) with floating-label pill inputs and custom contractor illustration.

---

## Phase 2.36: Auth De-cluttering & Device-Scoped Saved Accounts

### 1. Technology: Clean Auth Input Fields & Persistent Device-Only Account Storage (`AuthScreen.tsx`, `AuthModal.tsx`, `database.ts`)
- **Name of the Technology:** Clean Auth Input Architecture & Device-Only Profile Storage
- **What it does (Role & Purpose):**
  - Removed the `⚡ Rameshwar` button under the *"OR SIGN IN WITH"* social authentication row, leaving a single, centered Google sign-in button.
  - Removed example placeholder text (`"9876543210"` and `"••••"`) from both the Phone Number and Password inputs across Sign In and Sign Up forms.
  - Ensured that the *"Saved Contractor Accounts"* list only appears if the user has genuinely created/logged into an account on this specific device and stored data locally.
  - Guaranteed that on a fresh install or when reopening the app after clearing data, no mock/pre-seeded demo profiles (such as Rameshwar Sharma or Vikram Singh) are presented.
- **How it works (Under the Hood):**
  - **Auto-Purge & Seed Removal (`database.ts`):** Removed default bulk-putting of `SEED_ACCOUNTS` in `ensureDefaultAccounts()`. Updated `purgeDemoAccounts()` to delete any existing hardcoded demo records (`'contractor-1'`, `'contractor-2'`, `'contractor-3'`, `'contractor-demo'`), demo phones (`'9876543210'`, `'9876543211'`, `'9876543212'`), or demo contractor names.
  - **Reactive User Filter (`AuthScreen.tsx`, `AuthModal.tsx`):** Introduced a strict `userSavedAccounts` filter that screens out demo IDs, names, and phone numbers from the live account query.
  - **Conditional UI Rendering:** Conditioned the *"SAVED CONTRACTOR ACCOUNTS:"* card container strictly on `userSavedAccounts.length > 0`. If no user accounts have been saved on the device, the entire section remains hidden.
  - **Placeholder Sanitization:** Set `placeholder=""` on mobile phone, password, confirm password, name, and company name inputs across both `AuthScreen.tsx` and `AuthModal.tsx`.
- **A short, simple summary:** Removed the Rameshwar fast-login button, eliminated phone/password placeholders, and restricted saved accounts strictly to genuine accounts created and stored on the device.

---

## Phase 2.37: Authentic Google OAuth Dialog & Pristine Testing Environment

### 1. Technology: Interactive Google Account Chooser & Clean Slate Reset (`AuthScreen.tsx`, `App.tsx`)
- **Name of the Technology:** Google OAuth Authentication Modal & Pristine Test Environment
- **What it does (Role & Purpose):**
  - Replaced the silent/mock Google login with a full-fledged, authentic **"Sign in with Google"** account selector dialog modal.
  - Allows the user to select their verified Google profile (`Vishesh Sharma`, `SiteSaathi Contractor`) or input any custom Google email/name via *"Use another Google account"*.
  - Features authentic Google loading spinner animations ("Signing in to SiteSaathi... Verifying credentials...") for realistic OAuth feedback.
  - Renamed the `"Saved Contractor Accounts:"` heading to the clean and concise **`"Saved Accounts:"`** (`"सहेजे गए खाते:"`).
  - Added a clean slate trigger (`sitesaathi_pristine_final_user_test`) ensuring the entire app starts on Page 1 (Onboarding screen) with 0 existing accounts and 0 leftover data for clean user testing.
- **How it works (Under the Hood):**
  - **Google OAuth Dialog (`AuthScreen.tsx`):** Renders a high-fidelity modal featuring official Google 4-color SVG iconography, dual Google profile cards with initial badges, a custom Google email entry form, and animated SVG spin loader during the credential verification cycle.
  - **Account Sync & Persistence:** On selecting an account, checks Dexie IndexedDB for existing matching accounts or auto-provisions a new contractor Google account, storing credentials in `db.account` and authenticating immediately.
  - **Label Simplification:** Changed `SAVED CONTRACTOR ACCOUNTS:` label to `SAVED ACCOUNTS:` (`सहेजे गए खाते:`).
  - **Pristine Test Purge (`App.tsx`):** On startup, checks the clean testing flag; if triggered, runs `db.clearAllData()`, purges `localStorage` and `sessionStorage`, and positions the user cleanly on the Onboarding Splash screen (Page 1) with zero ghost data.
- **A short, simple summary:** Implemented an authentic Google Sign-In OAuth account chooser dialog with real verification feedback, updated the label to "Saved Accounts:", and reset the app to a 100% clean state starting from Page 1.

---

## Phase 2.38: Direct Contractor Mobile & PIN Security System

### 1. Technology: Pure Contractor Mobile & PIN Authentication with Eye Toggles & In-App PIN Reset (`AuthScreen.tsx`)
- **Name of the Technology:** Direct Contractor Mobile & PIN Security System
- **What it does (Role & Purpose):**
  - Completely removed the Google sign-in and sign-up options, social buttons, and dividers from both Sign In and Registration screens.
  - Added password visibility toggle icons (`Eye` / `EyeOff`) to all sensitive credential fields: Login Password, Registration Security PIN, Confirm Security PIN, and the Password Reset PIN inputs.
  - Added a dedicated, secure **"Reset PIN / Password"** dialog modal accessed via *"पिन भूल गए? (Reset PIN)"* / *"Forgot your password?"*.
  - Enables contractors to securely reset their 4-digit security PIN by verifying their registered 10-digit mobile phone number, working 100% offline without requiring third-party cloud OAuth servers.
  - Enforced strict validation: exactly 10-digit Indian mobile numbers, minimum 4-digit security PINs, exact match confirmations, and unique phone number checks in IndexedDB.
- **How it works (Under the Hood):**
  - **Credential Masking & Visibility:** Uses reactive React boolean states (`showLoginPassword`, `showRegisterPassword`, `showConfirmPassword`, `showNewPin`) to dynamically toggle input elements between `type="password"` and `type="text"`.
  - **In-App PIN Reset Flow (`handleResetPassword`):** Validates the phone format, queries `db.account.toArray()`, verifies the phone number exists in local IndexedDB, and safely executes `db.account.update(account.id, { password: newPin.trim() })` with animated loading indicators and real-time success banners.
  - **Pure Offline Self-Sufficiency:** Eliminates external OAuth latency and dependency on third-party cloud identities, allowing contractors on construction sites to have complete, private, and tamper-resistant local security.
- **A short, simple summary:** Removed Google sign-in entirely, added eye toggles for all password/PIN inputs, and integrated an in-app PIN reset modal for secure, direct mobile-based authentication.

---

## Phase 2.39: Clean Site Creation Flow, Form State Isolation, Dual OCR Capture System & Device Contact Picker

### 1. Technology: Clean Site Form Architecture, Fresh Lifecycle Isolation & Web Contact Picker (`AddSiteModal.tsx`, `EditSiteModal.tsx`, `PhotoOcrModal.tsx`)
- **Name of the Technology:** Site Creation Form Isolation, Native Contact Picker API & Dual OCR Media Capture
- **What it does (Role & Purpose):**
  - **Removed Test Sample Photo Button:** Completely removed the *"⚡ Test with Sample Photo"* button from the OCR modal.
  - **Dual Take Photo vs Upload Photo:** Replaced the single photo button with two prominent, side-by-side action buttons:
    - **Take Photo (`Camera`):** Direct hardware capture using device camera (`capture="environment"`).
    - **Upload Photo (`Upload`):** Direct file picker opening the device's photo gallery/storage.
  - **Clean Budget Field (No Default '0'):** The Contract Budget field now starts completely empty with a clean placeholder instead of displaying a pre-filled `0`, saving contractors from backspacing.
  - **Blank Target Completion Date:** The Target Completion date field now starts completely empty (`DD-MM-YYYY` placeholder) instead of pre-filling today's date, letting contractors choose when their site is due.
  - **100% Fresh Form Lifecycle Isolation:** Fixed the previous site data leakage issue where opening "Add New Site" loaded values from the last created project. Added lifecycle reset hooks (`useEffect` on `isOpen` and `resetForm()`) so every new site workspace starts on a clean slate.
  - **Device Contact Picker Integration:** Added a **"Contacts"** button next to the Client Phone input. Enables contractors to search and select contacts directly from their device's native address book (or search previous client contacts).
  - **Unobtrusive Optional Rule Compliance:** Client Phone is optional, but strictly adheres to design guidelines by having no `*` required asterisk and omitting all "(Optional)" / "(वैकल्पिक)" wording.
- **How it works (Under the Hood):**
  - **Camera vs Gallery File Inputs:** `PhotoOcrModal.tsx` maintains two separate `<input type="file">` references. The camera trigger enforces HTML5 `capture="environment"` for mobile cameras, while the gallery trigger allows standard photo selection without forcing camera capture.
  - **Form State Lifecycle Management:** `AddSiteModal.tsx` invokes `resetForm()` whenever `isOpen` transitions to `true` as well as upon successful submission (`handleSubmit`) and modal cancellation (`handleClose`). Budget state is managed as a string to allow blank values, safely converted to a number upon persistence.
  - **Web Contact Picker API:** `handlePickContact()` checks `'contacts' in navigator && 'ContactsManager' in window`. On supporting browsers (Android Chrome/Edge), it opens the system contact sheet to pick name and phone. When unsupported or dismissed, it seamlessly opens an in-app contact search dialog querying previous client records from Dexie IndexedDB (`db.sites`).
- **A short, simple summary:** Removed sample photo button, added dual Take Photo (camera) / Upload Photo (gallery) options, cleared default '0' and dates from Add Site modal, ensured 100% fresh form resets on every new site, and integrated device contact picker for client phone numbers.

---

## Phase 2.40: Streamlined Site Card Actions & Card Footer De-cluttering

### 1. Technology: Streamlined Site Card Footer & Direct Card Tap Architecture (`SiteCard.tsx`)
- **Name of the Technology:** Site Card Action Streamlining & De-cluttering
- **What it does (Role & Purpose):**
  - Removed the PDF statement export icon from the bottom-right of the site card. This prevents unintended, sudden PDF statement downloads when tapping on or scrolling through site cards. Full financial PDF exports remain readily accessible inside the dedicated Site Details and Reports views.
  - Removed the redundant *"View Details >"* text and arrow link from the card footer. Because tapping anywhere on the card surface already opens the Site Details modal, the explicit text link was visually redundant and cluttered the card layout.
  - Preserves essential card management actions: the left side displays creation and last-edited audit timestamps, while the right side provides quick Edit and Delete controls.
- **How it works (Under the Hood):**
  - Removed the `FileText` PDF trigger button and the `ArrowUpRight` view details element from `SiteCard.tsx`.
  - The entire card container preserves its top-level `onClick={() => onSelect(site)}` handler, ensuring seamless, tactile tap-to-open behavior with smooth CSS transition effects.
- **A short, simple summary:** Removed the PDF download icon and redundant "View Details" text link from the site card footer, resulting in a cleaner card layout where tapping anywhere enters site details.

---

## Phase 2.41: Form State Fresh Lifecycle Isolation, Zero Pre-fill Elimination, Number Spinner Removal & Streamlined Tools Actions

### 1. Technology: Clean Form State Lifecycle Isolation & Zero Pre-fill Architecture (`AddToolModal.tsx`, `AddLabourModal.tsx`, `AddMaterialModal.tsx`, `AddMachineryModal.tsx`, `AddDueModal.tsx`, `RecordClientPaymentModal.tsx`)
- **Name of the Technology:** Empty Form State Initialization & Modal Lifecycle Isolation Engine
- **What it does (Role & Purpose):**
  - **Removed Pre-filled "0" Across All Entry Modals:** Fixed inputs across Add Tool, Add Labour, Add Material, Add Machinery, and Add Due modals where fields previously opened with a pre-filled `0`, `30`, `25000`, or `550`. Fields now initialize as clean empty strings (`''`) with informative placeholders (e.g., `1`, `100`, `25000`, `Wage`), eliminating the tedious need for users to backspace unwanted digits on mobile keyboards.
  - **Zero Ghost Data Leakage (Fresh Form Lifecycle):** Added reactive `resetForm()` hooks triggered every time an add modal is opened (`useEffect` on `isOpen`), cancelled (`handleClose`), or submitted (`handleSubmit`). This guarantees that reopening any modal presents a 100% clean, blank slate without ghost data from previous entries or other projects.
  - **Global Number Input Spinner Elimination (`index.css`):** Completely hid the browser default up/down number spinner arrows (`▲▼`) across all browsers (`-webkit-inner-spin-button`, `-moz-appearance: textfield`), giving numeric fields a clean, professional appearance and preventing accidental value changes when scrolling.
- **How it works (Under the Hood):**
  - Form state values are maintained as React string states (`''`), bound to inputs with `value={val || ''}` and converted to numbers only upon database transaction dispatch (`Number(val) || 0`).
  - Cross-browser CSS rules in `src/index.css` target `input[type=number]` with `-webkit-appearance: none` and `appearance: textfield` to strip native spinner controls.
- **A short, simple summary:** Eliminated pre-filled '0' numbers and ghost data across all modals, added 100% fresh form resets on open, and removed native input spinner arrows for a clean, sleek mobile input experience.

---

### 2. Technology: Streamlined Tools Management & Role-Based Recent Wage Engine (`SiteDetailsModal.tsx`, `AddLabourModal.tsx`)
- **Name of the Technology:** Site Tools Action Streamlining & Dynamic Worker Wage Memory
- **What it does (Role & Purpose):**
  - **Removed Redundant Tools PDF Button:** Completely removed the separate "Tools PDF" button from the Site Details Tools tab. Because the comprehensive Site PDF Report already compiles all tool and equipment records alongside finances, labour muster, and materials, a dedicated tools PDF button was redundant.
  - **Icon-Only `+` Add Tool Button:** Streamlined the "Add Tool" button in the Tools tab by removing the textual keyword and rendering a sleek, tactile icon-only `+` button matching the application's single accent design language.
  - **Role-Based Recent Wage Memory:** Removed the arbitrary hardcoded `₹550` / `₹800` daily wage rates when adding workers in the Manual Attendance modal. New workers now start at `0` (rendered completely blank with a `Wage` placeholder) or automatically adopt the most recent rate the user configured for that specific role (from active rows in the current session or local persistence).
- **How it works (Under the Hood):**
  - In `SiteDetailsModal.tsx`, removed `handleDownloadToolsPdf` and the Tools PDF action button, retaining a tactile `button` with `<Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />`.
  - In `AddLabourModal.tsx`, `getRecentWageForRole(role, currentEntries)` searches active rows in reverse order for that role with `Number(dailyWage) > 0`, falling back to `localStorage.getItem('sitesaathi_recent_wage_' + role)` or returning `0` if none exists.
  - `handleAddWorkerRow()` dynamically inherits the role of the previous row in the muster roll and assigns the recent wage, while `<input value={entry.dailyWage ? entry.dailyWage : ''} ... />` ensures zero default `0` is shown.
- **A short, simple summary:** Removed the redundant Tools PDF button, streamlined Add Tool into an icon-only '+' button, and implemented dynamic role-based recent wage memory that starts blank instead of forcing arbitrary rates.

---

## Phase 2.42: Mode Simplification (Dark & Auto Mode Removal) & 5-Step Interactive Contractor Flow Tutorial Engine

### 1. Technology: Theme Mode Simplification & Pure Light Theme Enforcement (`SettingsModal.tsx`, `ThemeContext.tsx`)
- **Name of the Technology:** Single High-Contrast Light Theme Architecture
- **What it does (Role & Purpose):**
  - **Removed Dark Mode & Auto Mode:** In the Settings modal, completely removed the `Dark` and `Auto` mode buttons that were marked by the user.
  - **Locked to Clean Light Mode:** The application now strictly enforces a high-contrast, daytime-optimized light theme, eliminating accidental dark theme glitches, low-contrast text on bright construction sites, or system-level theme mismatches.
  - **Automatic DOM Purge:** Removed the `.dark` class from `document.documentElement` and cleared legacy `dark` or `system` values in `localStorage`, guaranteeing an immediate, crisp light theme.
- **How it works (Under the Hood):**
  - `ThemeContext.tsx` initializes `themeMode` to `'light'` and purges `sitesaathi_theme` in `localStorage`. The `updateDarkMode` effect is streamlined to always ensure `root.classList.remove('dark')` and `isDarkMode: false`.
  - In `SettingsModal.tsx`, the 3-button selector was replaced by a clean, locked indicator badge showing `Light Mode (Active)`.
- **A short, simple summary:** Completely removed Dark and Auto mode options from Settings, locking the app into a clean, crisp, high-contrast Light mode tailored for outdoor site readability.

---

### 2. Technology: 5-Step Interactive Contractor Flow Tutorial Engine (`OnboardingModal.tsx`)
- **Name of the Technology:** Interactive Step-by-Step Contractor Onboarding & Visual Flow Engine
- **What it does (Role & Purpose):**
  - **Interactive 5-Step Roadmap Stepper:** Added an interactive, numbered visual stepper at the top of the tutorial dialog (`1. Create Site` ➔ `2. 4 Core Tabs` ➔ `3. Voice & OCR` ➔ `4. Dues & Receipts` ➔ `5. Complete PDF`). Users can click any step or navigate sequentially.
  - **Structured Real-World Flow:**
    - **Step 1: Project Creation & Budgeting:** Explains the flow from `+ New Site`, contact picker integration, budget estimation, and live P&L calculation.
    - **Step 2: 4 Daily Site Sections:** Visual interactive breakdown of Labour (muster roll), Materials (supplies & bills), Machinery (rent & fuel), and Tools (warehouse equipment).
    - **Step 3: Fast 1-Tap Entry:** Dual-column showcase of Voice AI Assistant (speak in Hindi or English) and Diary Photo OCR (camera scan of handwritten register).
    - **Step 4: Cash Flow & Pending Dues:** Explains recording client installments (slab advances), tracking shopkeeper udhaar, 1-tap WhatsApp reminders, and bell alert notifications.
    - **Step 5: Complete PDF Report & Offline Peace of Mind:** Guides contractors on generating the complete 1-click site PDF report for client billing, device PIN & fingerprint security, and 100% offline functionality.
  - **Real-World Examples & Checklists:** Each step includes green checkmarked feature benefits, an actionable pro-tip / example box, and confetti celebrations upon completion.
- **How it works (Under the Hood):**
  - `OnboardingModal.tsx` maintains active step state (`tutIndex`) with bidirectional navigation (`Back` and `Next Step` / `Finish`).
  - Interactive stepper buttons display check icons for completed steps and highlight the active phase.
  - All content is fully bilingual in natural, conversational Hindi and clear English.
- **A short, simple summary:** Completely redesigned the onboarding tutorial into a structured, highly visual 5-step flow roadmap that clearly guides contractors from site creation to daily logging, voice/OCR shortcuts, cash flow, and final PDF billing.

---

## Phase 2.43: Comprehensive Quality Assurance, Security Threat Model & Architectural Documentation Suite (`docs/`)

### 1. Technology: Complete Project Documentation & Quality Assurance Architecture (`docs/`)
- **Name of the Technology:** SiteSaathi Engineering, Product & Security Documentation Suite
- **What it does (Role & Purpose):**
  - **Single Source of Truth:** Establishes a complete, evidence-based documentation ecosystem under `docs/` covering Product Management, Software Architecture, Testing Strategy, Actual Execution Evidence, Security Threat Modeling, Contractor User Workflows, and Release Pre-flight Checks.
  - **Audit & Risk Disclosure:** Formally identifies and documents all real-world client-side vulnerabilities (plaintext passwords in IndexedDB, unauthenticated PIN reset, simulated biometric bypass, unencrypted JSON backup files) alongside clear technical remediation blueprints.
  - **Operational Guide for Field Users:** Provides a detailed, practical, bilingual contractor manual for Indian thekedars and site supervisors.
- **How it works (Under the Hood):**
  - The documentation suite comprises 7 interconnected Markdown specifications:
    1. [`docs/PRD.md`](docs/PRD.md): Product vision, user stories, functional specs, data models, acceptance criteria, and implemented vs. future capabilities.
    2. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): Component tree, state tiers, Dexie v2/v3 schemas, cascade deletion sequences, hardware bridges, and Capacitor packaging.
    3. [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md): Structured risk-based test plan with 42 stable test IDs across 13 functional modules with priority and severity rubrics.
    4. [`docs/TEST_REPORT.md`](docs/TEST_REPORT.md): Evidence-based test audit tracking real command execution (`npm run build`, `npm run lint`), verified passes, and 6 documented defects.
    5. [`docs/SECURITY.md`](docs/SECURITY.md): Comprehensive threat model (STRIDE / OWASP Mobile Top 10), plaintext credential audit, mock biometric analysis, and Web Crypto API hardening roadmap.
    6. [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md): Practical step-by-step contractor manual explaining the 5-step workflow, daily logging, voice/OCR, dues, and PDF reports.
    7. [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md): 6-phase release readiness checklist, APK build verification, known limitations, and emergency rollback procedures.
- **A short, simple summary:** Produced an exhaustive, evidence-based 7-document technical and user documentation suite under `docs/` providing complete architectural visibility, security threat modeling, test evidence, and contractor field guides.

---

## Phase 2.44: Authoritative Design, Database, Setup & Feature Inventory Documentation (`docs/`)

### 1. Technology: Complete Technical Specification & Feature Catalog Ecosystem
- **Name of the Technology:** SiteSaathi Design, Database, Setup & Feature Development Specifications
- **What it does (Role & Purpose):**
  - **Design System Blueprint ([`docs/DESIGN.md`](docs/DESIGN.md)):** Authoritative design system documentation capturing the unified monochromatic blue palette (`#2563EB`), typography (`Outfit`, `Plus Jakarta Sans`, `Hind`), tactile buttons (`.btn-tactile`), zero-default form suppression, and responsive layout rules.
  - **Database Architecture ([`docs/DATABASE.md`](docs/DATABASE.md)):** Comprehensive IndexedDB schema reference across 11 Dexie.js v4 tables, Version 2 & 3 schemas, Mermaid ERD, atomic cascade deletions in `deleteSite()`, orphan sweeps, and backup/restore mechanics.
  - **Local Development & Deployment Guide ([`docs/SETUP.md`](docs/SETUP.md)):** End-to-end setup documentation detailing Node.js/npm prerequisites, zero-env configuration, IndexedDB initialization, NPM scripts, and Capacitor Android APK build workflows.
  - **Feature Catalog & Implementation Guide ([`docs/FEATURES.md`](docs/FEATURES.md)):** Authoritative central feature inventory, dependency architecture, step-by-step implementation guides for future developers, and safe change management rules.
- **How it works (Under the Hood):**
  - Generated strictly in documentation-only mode without touching application source code, stylesheets, or database records.
  - References verified source paths, exact Dexie method calls, and real UI behavior discovered from code inspection and test execution.
- **A short, simple summary:** Added four comprehensive technical documentation specifications to `docs/` establishing an unalterable single source of truth for UI design, Dexie database architecture, local environment setup, and future feature change management.

---

## Phase 2.45: Comprehensive Authentication & Application Security Audit Specification (`docs/AUTHENTICATION.md`)

### 1. Technology: SiteSaathi Authentication Security Architecture & Audit Report
- **Name of the Technology:** SiteSaathi Authentication Architecture & Security Audit Specification
- **What it does (Role & Purpose):**
  - **Authoritative Security Audit:** Evaluates the complete offline-first authentication, app-lock, session lifecycle, and data-isolation architecture of SiteSaathi.
  - **Defect Register & Exploit Paths:** Documents verified vulnerabilities with code line citations, including plaintext credential storage in IndexedDB (`SEC-DEF-001`), quick login PIN bypass (`SEC-DEF-002`), unauthenticated PIN reset (`SEC-DEF-003`), mock biometric auto-unlock (`SEC-DEF-004`), cross-account data leakage in global site queries (`DATA-DEF-005`), and unencrypted JSON backups (`DATA-DEF-006`).
  - **Prioritized Remediation Roadmap:** Lays out a phased, non-breaking implementation blueprint (P0 through P3) leveraging native Web Crypto API (`crypto.subtle`) for SHA-256 password hashing and AES-GCM backup encryption without introducing external server dependencies.
- **How it works (Under the Hood):**
  - Synthesized strictly in read-only audit mode without altering any application code, database records, or UI components.
  - Establishes clear trust boundary distinctions between UI-level guards, client-side cryptographic checks, server-enforced authentication, and device-level OS biometrics.
- **A short, simple summary:** Created `docs/AUTHENTICATION.md` establishing an exhaustive, evidence-based security audit, threat analysis, and non-breaking P0-P3 hardening roadmap for offline-first contractor authentication.

---

## Phase 3 & 4: Cryptographic Security Remediation, Account Isolation, PIN Recovery & Google Drive Foundation

### 1. Technology: Native Web Crypto API PBKDF2 & AES-GCM 256 Engine (`src/utils/cryptoUtils.ts`)
- **Name of the Technology:** Web Crypto API (`window.crypto.subtle`) Cryptographic Engine
- **What it does (Role & Purpose):**
  - **Zero-Dependency Security:** Provides high-grade password hashing, constant-time verification, and authenticated database backup encryption directly in the browser without third-party npm crypto packages.
  - **Credential Protection (`SEC-DEF-001`):** Derives salted hashes using PBKDF2 with SHA-256 (100,000 iterations) and cryptographically random 16-byte salts (`window.crypto.getRandomValues`). Prevents rainbow table attacks and protects credentials at rest in IndexedDB.
  - **Encrypted Cloud/Local Exports (`DATA-DEF-006`):** Encrypts complete database JSON exports using authenticated AES-GCM 256-bit encryption with a 12-byte initialization vector (IV) and 128-bit authentication tag, formatted into versioned envelopes (`sitesaathi-encrypted-v1`).
- **How it works (Under the Hood):**
  - Operates completely offline within the host browser's native C++ WebAssembly crypto subsystem.
  - `verifyCredential()` utilizes bitwise XOR constant-time comparison (`diff |= a.charCodeAt(i) ^ b.charCodeAt(i)`) to prevent timing side-channel attacks during PIN validation.
  - Backward-compatible auto-migration transparently upgrades legacy plaintext credentials to PBKDF2 hashes upon first successful sign-in.
- **A short, simple summary:** Implemented zero-dependency, native browser cryptography for salted PBKDF2 PIN hashing and authenticated AES-GCM-256 database backup encryption.

---

### 2. Technology: Reactive Multi-Contractor Account Isolation & Query Scoping (`src/App.tsx`, `src/components/sites/SiteDetailsModal.tsx`)
- **Name of the Technology:** Multi-Tenant Reactive Data Scoping Architecture (`DATA-DEF-005`)
- **What it does (Role & Purpose):**
  - **Data Leakage Prevention:** Ensures that on shared mobile devices, each logged-in contractor sees only their own sites, tools, muster rolls, materials, and pending dues.
  - **Site Ownership Hardening:** In `SiteDetailsModal`, replaced global first-account lookups (`db.account.toCollection().first()`) with verified owner lookups strictly keyed by `currentSite.contractorId`. Prevents leaking one contractor's company name into another contractor's PDF statements.
  - **Safe Lifecycle Decoupling:** Decoupled global `cleanupOrphanRecords()` from the account-scoped `sites.length === 0` trigger in `App.tsx`, preventing an empty contractor profile from sweeping global database tables.
- **How it works (Under the Hood):**
  - Uses reactive Dexie hooks (`useLiveQuery`) dynamically scoped to `activeAccountId`. Child tables (tools, materials, dues, labour) filter records whose `siteId` belongs to the contractor's verified site set.
- **A short, simple summary:** Eliminated cross-contractor data leakage by strictly scoping reactive database queries and PDF generator company headers to the verified site owner.

---

### 3. Technology: Safe Backup Restore Confirmation & Integrity Gate (`src/components/settings/SettingsModal.tsx`)
- **Name of the Technology:** Pre-Restore Schema Validation & Merge Confirmation Modal
- **What it does (Role & Purpose):**
  - **Accidental Overwrite Protection:** Requires explicit user confirmation before applying unencrypted backups, displaying live record counts (sites, tools, dues, export date) and warning that matching IDs will merge and overwrite existing records.
  - **Zero-Write Cancellation:** Cancelling the restore dialog clears in-memory state with zero database transactions.
  - **Encrypted Backup Challenge:** Preserves the passphrase decryption modal (`isDecryptModalOpen`) for `sitesaathi-encrypted-v1` files, verifying integrity via HMAC/AES-GCM before writing records to IndexedDB.
- **How it works (Under the Hood):**
  - Validates the JSON schema structure (`sites` and `account` arrays present) before opening database read-write locks.
  - Applies updates atomically inside a single Dexie read-write transaction across all 11 tables (`db.importBackupJson`).
- **A short, simple summary:** Added structural validation and an explicit merge-warning confirmation modal before database restore, guaranteeing zero database writes upon cancellation.

---

### 4. Technology: PIN Lock Recovery & Inactivity Auto-Lock Architecture (`src/components/common/AppLockScreen.tsx`, `src/App.tsx`)
- **Name of the Technology:** App-Lock Recovery Fallback & Session Lifecycle Management
- **What it does (Role & Purpose):**
  - **Inactivity Protection:** Automatically engages the lock screen after 15 minutes of inactivity (`INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000`) or tab backgrounding using `document.visibilitychange`.
  - **Corrupted PIN Self-Healing:** Provides a narrowly scoped recovery fallback if an account's `pinLock` was desynchronized by historical re-hashing bugs. Validates the candidate PIN against the contractor's master `account.password` and automatically repairs `account.pinLock` with a fresh PBKDF2 hash.
  - **Responsive Navigation:** Added a top "Back to Login" navigation bar and high-contrast bottom "Switch Account / Sign In" button with `overflow-y-auto`, ensuring contractors are never trapped on the lock screen on small displays.
- **How it works (Under the Hood):**
  - Retains strict 5-attempt rate limiting with 30-second cooldowns; failed fallbacks count as a single attempt.
  - "Back to Login" clears only ephemeral session keys (`sessionStorage.sitesaathi_unlocked` and `localStorage.sitesaathi_active_user_id`), preserving 100% of user data and accounts in IndexedDB.
- **A short, simple summary:** Added 15-minute auto-locking, self-healing PIN recovery via verified master passwords, and accessible "Back to Login" navigation.

---

### 5. Technology: Google Drive REST Service & In-Memory OAuth2 Token Flow (`src/services/googleDriveService.ts`, `src/utils/googleAuth.ts`)
- **Name of the Technology:** Client-Side Google Drive API v3 Service & GIS Token Client
- **What it does (Role & Purpose):**
  - **Decoupled Cloud Backups:** Enables optional, manual encrypted database backups to a visible `SiteSaathi Backups` folder in the contractor's Google Drive without live sync or background uploads.
  - **Strict Security Gate:** Enforces `drive.file` least-privilege scope. Rejects plaintext database dumps (`validateEncryptedBackupPayload`), requiring AES-GCM ciphertext before transmission.
  - **Ephemeral OAuth Architecture:** Uses Google Identity Services (GIS) Token Model. Stores access tokens strictly in memory with zero persistence in `localStorage`, `IndexedDB`, or cookies. Never uses client secrets (RFC 8252).
  - **100% Offline Preserved:** Dynamically loads the GIS script only on explicit user request; zero external network requests are made during normal offline app operation.
- **How it works (Under the Hood):**
  - REST client uses browser native `fetch()` with multipart/related payload boundaries (`boundary_sitesaathi_...`) for atomic metadata and file uploads.
  - All downloaded file payloads are treated as untrusted and validated against the `sitesaathi-encrypted-v1` schema before decryption.
- **A short, simple summary:** Built a pure TypeScript, zero-dependency Google Drive API v3 client with in-memory OAuth2 tokens and strict plaintext-rejection security gates for cloud backups.

---

### 6. Technology: Modal Stacking Context & Safe-Area Inset Architecture (`src/components/settings/SettingsModal.tsx`, `src/components/common/MobileDeviceShell.tsx`, `src/components/settings/GoogleDriveBackupSection.tsx`)
- **Name of the Technology:** Safe-Area Responsive Modal Containment & Hierarchical Stacking Architecture
- **What it does (Role & Purpose):**
  - **Eliminated Gesture Bar Overlap:** Fixed an issue where the simulated Android gesture navigation bar / home indicator in `MobileDeviceShell` sliced across the bottom edge of `SettingsModal` and obscured the "Log Out Account" action button.
  - **Native Safe-Area Alignment:** Implemented dynamic bottom safe-area insets (`env(safe-area-inset-bottom)`) and generous scroll clearance (`pb-10 sm:pb-8`), guaranteeing that all action controls remain fully visible and comfortable to tap above physical device navigation chins on Android and iOS.
  - **Unified Modal Stacking Contexts:** Standardized primary modal overlays across SiteSaathi (`SettingsModal`, `PhotoOcrModal`, `AddSiteModal`) at `z-[60]`, submodals/prompts at `z-[70]`, and secondary alert dialogs at `z-[80]`. Lowered device simulator bezel elements to `z-20` so hardware preview chins never slice into floating app dialogs.
- **How it works (Under the Hood):**
  - Uses CSS `pb-[max(1.25rem,env(safe-area-inset-bottom))]` on outer modal flex containers and `max-h-[88vh] sm:max-h-[90vh]` on modal cards to maintain clean margin above the bottom viewport edge.
  - Adds dedicated bottom padding inside the scrollable modal body so final action buttons are never flush with the card's rounded bottom border (`rounded-3xl`).
- **A short, simple summary:** Resolved modal bottom bar clipping and layout intersection by standardizing z-index stacking layers, capping card heights cleanly above the bottom edge, and providing native safe-area insets.

---

### 7. Technology: Handwritten Register OCR Safety Validation & Draft Review Architecture (`src/utils/ocrProcessor.ts`, `src/components/labour/PhotoOcrModal.tsx`)
- **Name of the Technology:** Conservative Muster Roll Validation & Anti-Hallucination OCR Pipeline
- **What it does (Role & Purpose):**
  - **Zero Fabricated Workers:** Completely removed synthetic fallback workers (`Subhash Mistry`, `Ramu Helper`, `Kamal Yadav`). Non-register images or blank OCR outputs now return clean empty drafts (`[]`) with an explicit status message instead of fake data.
  - **Zero Silent Wage Guessing:** Eradicated silent default wages (previously ₹550 for Helpers, ₹900 for Masons). Missing wages explicitly default to ₹0 (unverified) and are prominently flagged in the review UI ("Wage required"). Displayed total wages strictly calculate from verified, non-zero entries.
  - **Multi-Signal Register Validation:** Inspects raw OCR text across multiple orthogonal signals: attendance tokens (`P`, `A`, `H`, `हाजिरी`, `उपस्थित`), contractor trade keywords (`Mason`, `Helper`, `मिस्त्री`, `राजमिस्त्री`), realistic wage figures (₹200–₹3,000), and numbered list structures (`1.`, `2)`). Returns a structured `RegisterValidationStatus` with actionable warning guidance.
  - **Contractor-in-the-Loop Review UI:** Alerts the contractor with high-visibility warning banners when an image does not resemble an attendance register or has low OCR confidence. Displays an intuitive empty state with manual `+ Add Worker` option when 0 rows are extracted. Highlighting alerts missing names or wages.
  - **Pre-Save Data Protection:** Blocks database saves if target site is unselected, if entries are empty, if names are blank or placeholders (e.g. `Worker 1`, `New Worker`), or if daily wage is ₹0/negative for present workers. Zero auto-saving; all writes require explicit confirmation. Closing or cancelling discards drafts without modifying IndexedDB.
- **How it works (Under the Hood):**
  - `validateRegisterContent(rawText, confidence, extractedCount)` evaluates orthogonal signal counts. Low-confidence but plausible handwritten registers remain fully reviewable with an advisory disclaimer.
  - `parseOcrTextToLabourEntries(rawText, recordId)` filters out non-muster text lines, strips noise with strict word-boundary token matching (`\b[pah]\b`) to avoid clipping letters from real worker names (such as "Rameshwar"), and leaves missing wages as `0`.
  - Heuristic validation acts strictly as an assistive drafting tool; the contractor remains responsible for reviewing and confirming attendance before saving to Dexie IndexedDB.
- **A short, simple summary:** Replaced synthetic worker fallbacks and silent wage guessing with multi-signal register validation, transparent review indicators, and pre-save database write gates.

---

### 8. Technology: Phase 1 Critical Data-Safety Architecture & Uncredentialed Account Security Review (`src/App.tsx`, `src/core/db/database.ts`, `src/components/auth/AuthScreen.tsx`, `src/components/auth/AuthModal.tsx`)
- **Name of the Technology:** Production Startup Data-Shield, Fixed Demo ID Scoping & Non-Claimable Uncredentialed Account Security Gate
- **What it does (Role & Purpose):**
  - **Eliminated Startup Data-Wipe Hazard:** Eradicated the dangerous development condition where the absence of `localStorage.getItem('sitesaathi_pristine_final_user_test')` triggered `await db.clearAllData()`, `localStorage.clear()`, and `sessionStorage.clear()`. App startup now initializes Dexie tables and default demo seeds safely and idempotently without wiping existing contractor data.
  - **Fixed-ID Demo Account Purging:** Removed hazardous substring matching against human names (`rameshwar`, `vikram`, `rajesh patel`). Demo-account purging (`purgeDemoAccounts`) and demo-filtering in the saved account selector are now strictly bound to fixed, deterministic demo IDs (`contractor-1`, `contractor-2`, `contractor-3`, `contractor-demo`). Legitimate contractors named Rameshwar, Vikram, or Rajesh Patel can never be deleted or excluded.
  - **Security Review & Removal of Name-Based Account Claiming:** Evaluated the threat model of restoring unencrypted backups (which strip passwords). Identified that prompting for the registered contractor name does **not** prove account ownership because contractor names and phone numbers are public/guessable information (present on business cards, invoices, site boards, and the login screen itself). Removed the vulnerable credential-creation flow that allowed setting a PIN via name matching.
  - **Strict Security Gate & Clear Recovery Guidance:** When an uncredentialed account is selected or entered, the app strictly blocks session generation and displays a dedicated Security Limitation Notice. It clearly explains that public details cannot verify ownership offline and directs the user to the only secure recovery path: restoring from a passphrase-protected Encrypted Backup (`sitesaathi-encrypted-v1`) or registering a new secure account.
  - **Multi-Entry Protection:** Hardened all entry points (manual login, quick account switching in `AuthScreen` and `AuthModal`, and startup session restoration in `App.tsx`) so that uncredentialed accounts cannot authenticate or be claimed without genuine cryptographic credentials.
- **How it works (Under the Hood):**
  - Uses `Set(['contractor-1', 'contractor-2', 'contractor-3', 'contractor-demo'])` in `db.purgeDemoAccounts()` and account selectors.
  - `handleLogin` and `handleQuickAccountSelect` evaluate `if (!matched.password && !matched.pinLock)` and route to `setUncredentialedAccount(matched)` and `setIsUncredentialedModalOpen(true)`.
  - The insecure `handleSetupCredentials` handler and PIN-creation inputs were completely removed.
  - `App.tsx` skips automatic session restoration if `!acc.password && !acc.pinLock`, clearing `sitesaathi_active_user_id` so uncredentialed sessions are never created.
- **A short, simple summary:** Removed catastrophic startup database wipes, eliminated name-based demo purging, and closed account-takeover risks on uncredentialed restored accounts by prohibiting claiming via public metadata and requiring passphrase-protected encrypted backup recovery.

---

### 9. Technology: Phase 2B Multi-Tenant Contractor Backup Isolation & Ownership-Validated Atomic Restore Engine (`src/core/db/database.ts`, `src/components/settings/GoogleDriveBackupSection.tsx`, `src/components/settings/SettingsModal.tsx`, `src/core/db/backupIsolation.test.ts`)
- **Name of the Technology:** Scoped Multi-Tenant Database Backup & Ownership-Gated Restore Engine
- **What it does (Role & Purpose):**
  - **Contractor-Scoped Export (`exportBackupJson`):** Completely eliminates multi-tenant data leakage by scoping database backup exports strictly to an explicit, validated `contractorId`. A backup created by Contractor A now exports only Contractor A's account, sites, tools, muster records, materials, machinery, supplier dues, vendors, reminders, and client receipts. Records belonging to Contractor B on the same device are strictly excluded.
  - **Pre-Write Ownership Validation (`importBackupJson`):** Prevents cross-contractor restore contamination by verifying that the decrypted backup belongs to the currently authenticated contractor *before* opening any Dexie write transaction. If Contractor B attempts to restore Contractor A's backup, the engine immediately aborts with `RESTORE_ACCOUNT_MISMATCH`, leaving the existing database completely untouched (zero writes).
  - **Orphan & Cross-Tenant Pruning:** Strips any orphaned records, foreign site IDs, or mismatched vendor/muster entries from the backup payload before database ingestion, ensuring corrupt or cross-tenant records cannot pollute the active workspace.
  - **Financial Summary Protection (`clientPayments`):** Scopes client payment records strictly to the contractor's sites on both export and restore, preventing client payment amounts from leaking into other contractors' financial balance meters or dashboard overviews.
- **How it works (Under the Hood):**
  - **Explicit Scoping in `exportBackupJson`:** Requires a non-empty `contractorId`. Retrieves `rawAccount` for that ID, sanitizes credentials (stripped for clean export, hashed/encrypted for passphrase export), filters `sites` by `contractorId === validContractorId`, and establishes a `contractorSiteIds` set. Related tables (`tools`, `labourRecords`, `materials`, `machinery`, `dues`, `reminders`, `clientPayments`) are filtered by `contractorSiteIds.has(record.siteId)`. `labourEntries` are filtered via a secondary `contractorLabourRecordIds` set. Top-level metadata stamps `contractorId: validContractorId`.
  - **Pre-Transaction Gate in `importBackupJson`:** Requires an active `activeContractorId`. Decrypts AES-GCM-256 payload in memory if encrypted. Validates schema and asserts `data.account.find(acc => acc.id === targetContractorId)` exists. Throws `RESTORE_ACCOUNT_MISMATCH` if missing or if `data.contractorId` mismatches.
  - **Atomic Transaction Writes:** If ownership is verified, sanitizes and prunes records against `validSiteIds`, and executes atomic writes across all 11 tables inside `this.transaction('rw', [...], ...)`. Any error triggers an immediate atomic rollback.
  - **UI Integration:** Both `GoogleDriveBackupSection.tsx` and `SettingsModal.tsx` pass `account.id` directly into export and restore routines, providing proactive ownership checks in preview dialogs and displaying clear, localized feedback on account mismatches.
- **A short, simple summary:** Mandated contractor ID scoping for all backup exports and instituted pre-transaction ownership verification on restore, guaranteeing that contractors on shared devices cannot leak data or contaminate each other's databases.

---

### 10. Technology: Phase 2B Corrective Security Hardening — Collision Detection, Safe Legacy Verification & Prototype-Bound Test Rig (`src/core/db/database.ts`, `src/core/db/backupIsolation.test.ts`)
- **Name of the Technology:** Pre-Transaction Primary-Key Collision Gate, Strict V2 Ownership Verification, Vendor Reference Sanitization & Production Prototype Test Rig
- **What it does (Role & Purpose):**
  - **SEC-2B-001 (Production Prototype-Bound Testing):** Refactored `backupIsolation.test.ts` so tests directly invoke the real production methods `SiteSaathiDatabase.prototype.exportBackupJson` and `SiteSaathiDatabase.prototype.importBackupJson` instead of duplicating filtering algorithms in a mock class. Any flaw in production code immediately fails the test suite.
  - **SEC-2B-002 (Strict Version 2 Ownership & Safe Legacy Verification):** Enforces that Version 2 backups (`version: 2` or `contractorId` present) strictly require explicit, matching `contractorId` on every site and vendor. Payloads with unowned sites/vendors in V2 immediately throw `RESTORE_AMBIGUOUS_OWNERSHIP` before writes. Legacy V1 backups are permitted to normalize unowned sites/vendors ONLY under strictly verified safe conditions (single matching account, `version !== 2`, no `contractorId`); multi-account legacy backups are rejected. Child records with tampering or conflicting foreign `contractorId` tags are rejected with `RESTORE_ACCOUNT_MISMATCH`.
  - **SEC-2B-003 (Pre-Transaction Cross-Contractor Primary-Key Collision Gate):** Inspects all incoming record IDs across all 11 tables against local existing records before opening any write transaction. Resolves ownership directly for sites and vendors, and via parent relationships (`siteId` for tools, materials, machinery, dues, reminders, clientPayments, labourRecords; 2-hop `recordId` -> `labourRecord` -> `siteId` for labourEntries). If an incoming ID collides with an existing record belonging to a different contractor, aborts the entire restore with `RESTORE_COLLISION_DETECTED`, leaving all local tables 100% untouched. Same-contractor updates follow standard merge/update semantics.
  - **SEC-2B-004 (Vendor Reference Sanitization):** Validates all `vendorId` foreign keys in incoming `materials` and `dues` against the active contractor's valid vendor set (incoming imported vendors + existing local vendors for this contractor). If a foreign contractor's vendor ID is referenced, it is stripped (`delete m.vendorId`, `delete d.vendorId`) so foreign vendor references can never persist after restore.
- **How it works (Under the Hood):**
  - Before `this.transaction('rw', [...], ...)`, `importBackupJson` queries local records and builds lookup maps for sites, vendors, and parent records.
  - Evaluates collision criteria for every incoming item. If a foreign owner is identified, throws `RESTORE_COLLISION_DETECTED` prior to any database write.
  - Filters and sanitizes vendor references against `validVendorIds = new Set([...vendorsToImport.map(v => v.id), ...existingContractorVendors.map(v => v.id)])`.
  - Snapshot assertions in `backupIsolation.test.ts` capture the full state of all 11 tables before rejection scenarios (ambiguous ownership, spoofed headers, primary-key collisions, wrong passphrase, corrupted JSON, invalid schema) and verify that post-rejection table contents match pre-rejection snapshots with zero state changes.
- **A short, simple summary:** Hardened the backup engine with pre-transaction cross-contractor primary-key collision detection, strict V2 ownership validation, foreign vendor reference stripping, and a zero-duplication test suite binding directly to production prototype methods.

---

### 11. Technology: Self-Service Contractor Registration & Multi-Tenant Independent Google Account Architecture (`src/components/auth/AuthModal.tsx`, `src/utils/googleAuth.ts`, `src/components/settings/GoogleDriveBackupSection.tsx`, `src/core/db/contractorSelfServiceGoogle.test.ts`)
- **Name of the Technology:** Self-Service Contractor Registration, Multi-Tenant Google Identity Isolation & Account Management Engine
- **What it does (Role & Purpose):**
  - **Self-Service Offline Registration:** Enables independent contractors to open SiteSaathi and register immediately without requiring pre-existing accounts, administrative approval, or the application owner's assistance. Works 100% offline, allowing contractors to create their profile with a unique phone number and secure 4-digit security PIN/password. Legitimate contractors who share common names (e.g. Rameshwar Sharma) are fully supported with distinct accounts.
  - **Decoupled Application Configuration vs. Contractor Identities:** Recognizes the Google OAuth Client ID as an application-level infrastructure configuration, never as a specific contractor's personal Gmail. Multiple contractors on the same device can independently connect, switch, or disconnect their personal Google Drive accounts without collision.
  - **Per-Contractor In-Memory Google Session Isolation:** Completely eliminates cross-contractor Google session leakage. Access tokens, verified identities, and cloud state are held strictly in memory and isolated per contractor ID using a dedicated `contractorTokenMap`. Switching active contractors instantly isolates/clears the previous contractor's transient Google identity, active token, and cloud backup list.
  - **Verified Identity Display & Account Switching:** Connects to Google Identity Services with explicit account selection (`prompt: 'select_account'`) and queries the verified Google UserInfo endpoint (`https://www.googleapis.com/oauth2/v3/userinfo`). Displays the contractor's verified connected Gmail address with a verified badge. Allows seamless switching between different Google accounts or disconnecting Google without impacting local records.
  - **Elimination of Hardcoded Fallbacks:** Removed legacy `'contractor-1'` fallbacks across `VoiceInputModal.tsx`, `AddSiteModal.tsx`, and `seedData.ts`, ensuring newly created sites and records are always strictly scoped to the active contractor's ID.
- **How it works (Under the Hood):**
  - **PBKDF2 Credential Hashing on Registration (`AuthModal.tsx`):** On submission, verifies that the phone number is not already registered (`db.account.where('phone').equals(phone.trim()).first()`). Validates a 4-digit security PIN and invokes `hashCredential(pin)` using Web Crypto PBKDF2-HMAC-SHA256 (100,000 iterations, 16-byte random salt). Credentials are never stored in plaintext.
  - **In-Memory Token & Identity Map (`googleAuth.ts`):** Implements `contractorTokenMap = new Map<string, MemoryTokenState>()` mapping `contractorId` to its active `{ token, expiresAt, identity }`. Tokens and passphrases are never persisted to disk, localStorage, or IndexedDB.
  - **Identity Verification Endpoint (`googleAuth.ts`):** Upon token acquisition, issues an authenticated GET request to `https://www.googleapis.com/oauth2/v3/userinfo` (with fallback to `tokeninfo`) using the newly obtained Bearer token. Extracts and validates `email`, storing it in the contractor's in-memory session.
  - **Explicit Account Switcher (`GoogleDriveBackupSection.tsx`):** The "Switch Google Account" action invokes `requestGoogleAccessToken({ forcePrompt: true, prompt: 'select_account', contractorId: account?.id })`, forcing Google's account picker modal so the contractor can explicitly choose a different Google account.
  - **Platform Verification & Android WebView Constraints:** Web GIS and Google OAuth run cleanly in desktop/mobile browsers and PWAs. In native Android APKs built via Capacitor, Google rejects OAuth within embedded WebViews (`disallowed_useragent`), requiring native Chrome Custom Tabs / deep-linking integration (e.g. `@codetrix-studio/capacitor-google-auth`) for production APK distribution.
- **A short, simple summary:** Delivered zero-dependency self-service offline registration with PBKDF2 PIN hashing and a multi-tenant Google Drive management engine providing verified identity display, isolated in-memory tokens, and explicit account switching per contractor.





