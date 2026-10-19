# SiteSaathi

> **A local-first, offline-ready site record and daily ledger assistant built for contractors and site supervisors.**

[![Web App](https://img.shields.io/badge/Web%20App-Live-2563EB.svg)](https://site-saathi.vercel.app)
[![Android](https://img.shields.io/badge/Android-APK%20v1.0-10B981.svg)](https://github.com/vishesh-i-tech/SiteSaathi/releases/latest)
[![Storage](https://img.shields.io/badge/Storage-100%25%20Offline%20IndexedDB-059669.svg)](https://dexie.org/)
[![Language](https://img.shields.io/badge/Language-English%20%7C%20Hindi-F59E0B.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-64748B.svg)](LICENSE)

SiteSaathi is an offline-first management assistant designed to help civil, plumbing, and electrical contractors and field supervisors keep construction sites organized. It replaces pocket paper diaries, lost delivery slips, and scattered messaging threads with a structured, mobile-friendly digital workflow that works entirely on your device—even in basements and remote plots with zero cellular data.

---

## 🔗 Quick Links

- 🌐 **Live Web Application:** [https://site-saathi.vercel.app](https://site-saathi.vercel.app)
- 📦 **GitHub Repository:** [https://github.com/vishesh-i-tech/SiteSaathi](https://github.com/vishesh-i-tech/SiteSaathi)
- 📱 **Latest Android Release:** [Download SiteSaathi v1.0 APK](https://github.com/vishesh-i-tech/SiteSaathi/releases/latest)
- 📖 **Documentation Suite:** [`docs/Architecture.md`](docs/Architecture.md) | [`docs/User Guide.md`](docs/User%20Guide.md) | [`docs/Setup.md`](docs/Setup.md)

---

## 🛠️ Why I Built SiteSaathi

If you spend time around active construction sites, one reality becomes clear very quickly: **critical business records are almost always scattered in fragile places.**

Daily worker attendance is marked in pocket paper diaries. Cement, sand, and steel deliveries arrive with paper slips that get lost in the wind or stained by water. Machinery hours and diesel expenses are scribbled on the backs of cardboard boxes. Tool dispatches—scaffolding pipes, shuttering plates, vibrators—are tracked by memory. And supplier credit is often calculated days or weeks later from memory and disputed receipts.

When it comes time for weekly wage payouts or monthly client billing, reconciliation turns into stressful guesswork:
- *Did a worker log a half-day or full-day on Tuesday?*
- *How much advance did the shuttering team take on Thursday?*
- *Are those 40 rented steel plates still lying at the sector site, accumulating extra daily rent?*
- *Why is a supplier demanding payment for materials on a job that was finished two months ago?*

Most project management software on the market is built for corporate teams working at desks with reliable broadband. They demand heavy form-filling, mandatory cloud accounts, complex Gantt charts, and constant connectivity. They completely fail in the reality of field operations—where hands are dusty, network signals drop out, and supervisors need large touch targets, clear bilingual prompts, and instant response times.

**SiteSaathi is my attempt to solve those practical field problems.** I built it as a dedicated, respectful digital assistant: local-first, fast, bilingual, and fully capable of operating without an active internet connection.

---

## 🏗️ What SiteSaathi Helps With

SiteSaathi brings the core operational and financial records of everyday contracting into one consistent, offline ledger:

1. **Managing Multiple Active Sites:** Maintain distinct project ledgers for different clients and locations, tracking estimated budgets against actual outflows.
2. **Daily Labour & Wage Management:** Log daily worker muster rolls with trade roles, track wage advances given on site, and compute remaining daily balances automatically.
3. **Digitizing Paper Registers via Photo OCR:** Take a quick photo of traditional handwritten paper muster rolls; the app uses client-side OCR to convert names, attendance, and wage figures into an editable review table.
4. **Voice-Assisted Entry:** Speak site details naturally in English or Hindi (*"Site name Sunrise Villa, location Riverside Road, budget 800000"*), and the app extracts key fields into forms automatically.
5. **Material Deliveries & Supplier Credit:** Record raw materials using construction-specific units (bags, plates, brass, truckloads, meters) and automatically log unpaid balances as vendor dues.
6. **Tool & Equipment Rentals:** Track dispatched machinery, shuttering plates, and tools with expected return dates, receiving visual alerts before extra rental fees pile up.
7. **Persistent Dues Tracking:** Physical work completion and financial settlement are decoupled. Even after a site is physically finished, unsettled vendor credit and equipment bills remain front and center until marked paid.
8. **Instant Client Statements & Receipts:** Generate clean, official PDF project statements, payment receipts, and CSV attendance sheets directly on the phone to share over WhatsApp.

---

## ✨ Features (Verified Implementation)

Every feature listed below is implemented in the codebase and verified through automated builds and testing:

### 📋 Project & Site Management
- **Decoupled Status Engine:** Sites maintain two independent statuses—**Physical Work Status** (*Planning, Ongoing, Completed, On Hold*) and **Financial Settlement Status** (*Unpaid, Partially Paid, Paid*). Completed sites never hide unsettled supplier debt.
- **Budget vs. Outflow Breakdown:** Real-time calculation of material expenses, labour wages, machinery rent, and tools against the agreed client contract budget.
- **Atomic Deletions:** Deleting a site safely removes all linked materials, worker entries, machinery logs, and dues in a single atomic database transaction.

### 👷 Labour & Muster Rolls
- **9 Specialized Trade Roles:** Mason, Helper, Plumber, Electrician, Carpenter, Welder, Painter, Site Supervisor, and Other.
- **Half-Day & Advance Calculation:** Automatically calculates net wage balances after deducting cash advances given on site.
- **Recent Wage Recall:** Remembers recent wage rates for recurring workers to speed up daily morning roll calls.
- **Client-Side Photo OCR:** Uses `Tesseract.js` and HTML5 Canvas contrast preprocessing to scan photographs of handwritten attendance diaries directly on the device.

### 📦 Materials & Inventory
- **Trade-Specific Units:** Support for `bags` (cement), `plates (4x4)` (shuttering), `truck / dumper` (sand/gravel), `brass` (aggregates), `meters` (pipes/conduits), `kg` (steel/rebar), and `litres` (diesel/paint).
- **Automatic Dues Generation:** Flagging an invoice as `Pending` or `Partial` automatically creates an actionable payable record under that vendor's ledger.

### 🚜 Tools, Machinery & Diesel Ledger
- **Rental vs. Self-Owned Equipment:** Track whether equipment is owned by the firm or rented from external vendors.
- **Return Alerts:** Highlights overdue rented scaffolding and tools in high-contrast red to avoid penalty fees.
- **Machinery Hours & Fuel:** Logs hourly equipment rental (JCB excavators, concrete mixers, tractors) alongside diesel fuel consumption in litres and total cost.

### 💰 Financial Settlement & Client Receipts
- **Milestone Payment Recording:** Log client payments with payment modes (UPI, Cash, Bank Transfer, Cheque) and reference/UTR numbers.
- **Single-Page Payment Receipts (PDF):** Instant client payment receipts with firm details, received amounts, and outstanding contract balances.
- **Comprehensive Project Statements (PDF):** Multi-page client statements with itemized material tables, machinery logs, and payment histories rendered client-side via `jsPDF`.

### 🔒 Security, Authentication & Theming
- **Local Phone & 4-Digit PIN Security:** Multi-contractor profile isolation on shared family or field phones.
- **Anti-Delete Protection:** Critical database wipes or site removals require the master PIN before executing.
- **Bilingual Interface:** Real-time toggle between English and Hindi, with clean typography optimized for readability across both languages.
- **Trade Themes:** Unified high-contrast palette with tailored quick-action cards for General Construction, Plumbing & Sanitary, and Electrical contractors.

---

## 📸 User Experience & Interface

> *Direct application UI screenshots are currently being prepared for the upcoming v1.1 gallery release. In the meantime, you can experience the live interactive application immediately on the web.*

To explore the interface, visit the **[Live Web Application](https://site-saathi.vercel.app)** on your mobile phone or desktop browser. You can test the bilingual toggle, create demo sites, test voice input, and export real sample PDF reports right away.

---

## ⚙️ How It Works

Understanding SiteSaathi's technical philosophy helps you make the most of it:

```
┌───────────────────────────────────────────────────────────┐
│                     User Device                           │
│                                                           │
│   ┌─────────────────────┐       ┌──────────────────────┐  │
│   │   Mobile Browser    │       │     Android App      │  │
│   │   (React 19 SPA)    │       │   (Capacitor APK)    │  │
│   └──────────┬──────────┘       └──────────┬───────────┘  │
│              │                             │              │
│              └──────────────┬──────────────┘              │
│                             ▼                             │
│               ┌───────────────────────────┐               │
│               │   Dexie.js v4 (IndexedDB) │  100% Local   │
│               │   11 Relational Tables    │  Zero Cloud   │
│               │   Instant Offline Queries │  Requirement  │
│               └─────────────┬─────────────┘               │
│                             │                             │
│             ┌───────────────┴───────────────┐             │
│             ▼                               ▼             │
│   ┌───────────────────┐           ┌───────────────────┐   │
│   │ Local JSON Backup │           │   Google Drive    │   │
│   │ (AES-GCM Encrypt) │           │ (Snapshot Backup) │   │
│   └───────────────────┘           └───────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

1. **Local-First, Not Cloud-Dependent:** Every click, attendance row, and invoice is written directly to your device's internal IndexedDB database using Dexie.js. There is no central server listening for your daily logs.
2. **Device and Browser Isolation:** Because data lives locally in client storage, records created in Chrome on Phone A do not automatically appear on Phone B.
3. **Manual Snapshot Backups:**
   - **Local Encrypted JSON:** You can export your full database at any time from **Settings -> Data Backup**. Backups can be exported as an unencrypted snapshot (credentials stripped) or encrypted with a passphrase using client-side Web Crypto AES-GCM.
   - **Google Drive Backup:** Connect your Google account to save backup snapshots directly to a private `SiteSaathi Backups` folder in your personal Google Drive. Google Drive uploads strictly require client-side AES-GCM passphrase encryption before transmission. *(Note: Google Drive OAuth is supported in standard web browsers; Google restricts embedded OAuth within native Android WebViews).*
4. **Web vs. Android APK:** The web application and Android APK share identical business logic and UI. The Android release packages the web build into a native Capacitor container with custom launcher icons, an Android splash screen, and standalone installation capabilities.

---

## 💻 Technology Stack

| Layer | Technologies Used | Purpose & Role |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19.2** + **TypeScript 6.0** | Type-safe declarative component architecture |
| **Build Tooling** | **Vite 8.2** + `@tailwindcss/vite` | Sub-second HMR and production bundle optimization |
| **Styling & Design** | **Tailwind CSS v4** + Custom Design Tokens | Mobile-first, outdoor high-contrast tactile UI |
| **Client Database** | **Dexie.js v4.4** + `dexie-react-hooks` | Reactive, relational IndexedDB offline storage |
| **Mobile Packaging** | **Capacitor 8.5** (Android Platform) | Native Android bridge, splash screen, and APK bundling |
| **Optical Character Recognition** | **Tesseract.js v7.0** + HTML5 Canvas | Client-side WASM OCR for handwritten muster roll scanning |
| **Document Generation** | **jsPDF v4.2** + `jspdf-autotable` | High-resolution multi-page PDF statements and receipts |
| **Speech Recognition** | **Web Speech API** (`webkitSpeechRecognition`) | Native voice-to-form speech recognition and field parsing |
| **Iconography & Effects** | **Lucide React** + `canvas-confetti` | Lightweight iconography and milestone completion feedback |
| **Code Quality** | **Oxlint** | High-speed static analysis and linting |

---

## 🚀 Try SiteSaathi

### 1. In Your Web Browser
No installation required. Open the link on any smartphone, tablet, or desktop:
👉 **[https://site-saathi.vercel.app](https://site-saathi.vercel.app)**

### 2. On Your Android Device
You can install SiteSaathi as a standalone Android app:

1. Download the latest release package:  
   📲 **[`SiteSaathi v1.0.apk`](https://github.com/vishesh-i-tech/SiteSaathi/releases/latest)** *(File size: ~6.70 MB)*
2. Open the downloaded file in your Android File Manager.
3. When prompted, permit "Install unknown apps" for your browser or file manager.
4. Tap **Install** to complete setup.

> ℹ️ **Notice for Upgrades from Debug Builds:** The v1.0 release is signed with SiteSaathi's permanent release certificate (`CN=SiteSaathi`). If you previously tested an early debug build, Android will require you to uninstall the debug build before installing the signed release build (`INSTALL_FAILED_UPDATE_INCOMPATIBLE`). Export your data via Settings first.

---

## 💻 Run Locally

### Prerequisites
- **Node.js:** v18.x or v20.x (LTS recommended)
- **npm:** v9.x or v10.x
- *(Optional for Android builds)*: Android Studio, JDK 21, and Android SDK 36

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/vishesh-i-tech/SiteSaathi.git

# Navigate to project folder
cd SiteSaathi

# Install dependencies
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Production Web Build
```bash
# Type-check and assemble production bundle in dist/
npm run build

# Run linter
npm run lint
```

### 4. Build Android Release APK (Optional)
```bash
# Sync web build to native Android directory
npx cap sync android

# Compile release APK
cd android
./gradlew.bat assembleRelease
```
The compiled signed APK will be output to:  
`android/app/build/outputs/apk/release/app-release.apk`

### 5. Environment Variables
SiteSaathi is completely usable out of the box with **zero mandatory environment variables**. For optional Google Drive integration in web browsers:
```bash
# Copy example configuration if needed
cp .env.example .env.local
```
Add your optional Google OAuth Client ID:
```env
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

---

## 📂 Project Structure

```
SiteSaathi/
├── src/
│   ├── assets/              # Static bundled images and emblems
│   ├── components/
│   │   ├── auth/            # Phone & PIN registration, quick switch
│   │   ├── common/          # Splash screen, app lock, responsive shell
│   │   ├── dashboard/       # Financial metrics, quick add, smart insights
│   │   ├── dues/            # Persistent vendor dues ledger
│   │   ├── labour/          # Daily muster rolls, wage recall, photo OCR
│   │   ├── machinery/       # Heavy machinery rent & diesel fuel logs
│   │   ├── materials/       # Construction unit deliveries & auto-dues
│   │   ├── onboarding/      # Step-by-step contractor setup guide
│   │   ├── settings/        # Firm profile, PIN, backup export/import
│   │   ├── sites/           # Site cards, 7-tab drilldown, cascade deletion
│   │   └── tools/           # Tool tracking & overdue return alerts
│   ├── core/
│   │   ├── db/              # Dexie.js v4 schema, migrations, seed data
│   │   ├── i18n/            # English and Hindi dictionary translations
│   │   └── theme/           # Trade tokens (Construction, Plumbing, Electrical)
│   ├── services/            # Google Drive API & Web Crypto integration
│   ├── types/               # TypeScript data models and interfaces
│   ├── utils/               # OCR canvas filters, speech recognition, PDF reports
│   ├── App.tsx              # Root application router & state orchestrator
│   ├── index.css            # Tailwind CSS v4 design tokens & base rules
│   └── main.tsx             # React DOM root entry point
├── public/                  # Favicons, vector brand emblems, and assets
├── android/                 # Native Capacitor Android project & Gradle build
├── docs/                    # Authoritative Engineering & User Documentation
│   ├── Architecture.md      # Technical architecture, schemas & data flow
│   ├── Authentication.md    # Security audit, PIN models & threat matrix
│   ├── Database.md          # Complete Dexie schema & entity relationships
│   ├── Design.md            # Design system, tactile tokens & layout rules
│   ├── Feature Walkthrough.md # Detailed feature walkthrough
│   ├── Features.md          # Master feature catalog & status matrix
│   ├── Product Requirements Document.md # PRD & functional specifications
│   ├── Release Checklist.md # 6-phase release gatekeeper checklist
│   ├── Security.md          # STRIDE threat model & hardening roadmap
│   ├── Setup.md             # Developer local environment & build manual
│   ├── Test Plan.md         # 42-case risk-based testing strategy
│   ├── Test Report.md       # Evidence-based test audit & verification log
│   ├── User Guide.md        # Bilingual contractor & supervisor manual
│   └── reports/             # Architectural PDFs and report generator scripts
├── releases/                # Verified APK distributions and release notes
│   ├── Release Notes.md     # v1.0 release verification & checksum log
│   └── SiteSaathi v1.0.apk  # Verified signed Android release binary (local)
├── capacitor.config.ts      # Native Capacitor bridge configuration
├── package.json             # NPM dependencies, scripts, and build tasks
├── tsconfig.json            # Base TypeScript configuration
└── vite.config.ts           # Vite bundler & Tailwind plugin configuration
```

---

## 🛡️ Data Storage, Privacy & Limitations

An honest project needs clear boundaries:

- **Data Ownership:** You own 100% of your data. Because SiteSaathi stores records in your browser's local IndexedDB, your site financials and worker wages are not transmitted to any third-party analytics or tracking servers.
- **Device-Bound Storage:** If you clear your browser cache, wipe website storage, or factory reset your phone without exporting a backup, **local data will be deleted**. We strongly recommend using the **Export Backup** feature weekly.
- **Voice Recognition Requirements:** Voice-to-form requires an active microphone and a browser supporting the Web Speech API (such as Google Chrome). Voice transcription typically relies on the browser's speech service and an active internet connection, unless the host device includes offline speech models.
- **Photo OCR Requirements:** Photo OCR runs client-side in WebAssembly via Tesseract.js. The initial scan requires an internet connection to download language model files, which are then cached on the device for subsequent runs. Recognition accuracy depends on lighting, image sharpness, and handwriting legibility; an interactive verification screen allows you to check and adjust parsed rows before saving.
- **Google Drive & Cloud Encryption:** Google Drive integration is an optional snapshot backup tool. To safeguard privacy, Google Drive uploads strictly mandate client-side AES-GCM passphrase encryption before upload; plaintext database files cannot be sent to Drive. In native Android WebViews, Google restricts embedded OAuth logins (`disallowed_useragent`), so Android APK users should use the local encrypted JSON export/import workflow.

---

## 🗺️ Roadmap & Contributions

### Planned Improvements
- [ ] Direct native camera & microphone permission handling in Android manifest.
- [ ] Secure PIN recovery challenge to replace unauthenticated phone-number resets.
- [ ] Native biometric fingerprint challenge integration via Capacitor.
- [ ] Multi-site aggregate profit/loss comparisons.

### Contributing
Feedback, bug reports, and suggestions are warmly welcome!
- If you find a bug or want to suggest a field workflow enhancement, please open an issue on the **[GitHub Issues page](https://github.com/vishesh-i-tech/SiteSaathi/issues)**.
- Pull requests are appreciated for bug fixes and documentation improvements.

---

## 🤝 Closing Note

SiteSaathi was built with a simple goal: **to give contractors and supervisors a clean, dependable tool that respects how construction work actually happens on the ground.**

No heavy corporate bloat, no subscription walls for basic site notes, and no failing because you walked into a basement without 4G. Just an honest, practical companion to help you finish the day with your numbers clear and your records in order.

If SiteSaathi helps your work, feel free to star the repository on GitHub!

---

*Maintained with care by [Vishesh](https://github.com/vishesh-i-tech)*
