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


