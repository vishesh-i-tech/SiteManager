# SiteSaathi — Multi-Contractor Site Management Web App Walkthrough

SiteSaathi is a full-stack, mobile-responsive, offline-resilient Progressive Web App (PWA) designed for contractors (General Construction, Plumbing, Electrical, and extensible future trades) to manage job sites, tools, labour attendance, materials, machinery, and finances.

---

## 🌟 Key Highlights & Architectural Differentiators

### 1. Token-Driven Trade Theming System
- **3 Full Trade Palettes**:
  - **General Construction**: `#F97316` Safety Orange & Slate Charcoal (`#1E293B`)
  - **Plumbing & Sanitary**: `#0284C7` Cyan / Cool Aqua (`#06B6D4`) & Teal
  - **Electrical & Wiring**: `#D97706` Electric Amber & Deep Navy (`#0F172A`)
- **Light / Dark / System-default** modes togglable independently from trade themes.
- Category-aware widgets, icons, quick-add templates, and badges adapt in real-time.

### 2. Bilingual Hindi (हिंदी) & English Internationalization
- Real-time reactive i18n store providing seamless toggle between Hindi and English across all buttons, forms, voice prompts, and notifications.
- High-contrast, big-touch targets tailored for non-tech-savvy site managers.

### 3. Smart Voice-to-Form Auto-Fill
- Speech-to-text recognition (Web Speech API) with Hindi and English keyword parsing (`"साइट का नाम"`, `"बजट"`, `"लोकेशन"`).
- Fallback guided quick-prompts and structured field extraction preview modal before database commit.

### 4. Handwritten Labour Register Photo OCR
- Client-side OCR (`Tesseract.js` + HTML5 Canvas contrast preprocessing) converts photographs of handwritten muster rolls into structured worker attendance rows (Name, Role, Full/Half Day, Daily Wage).
- Split-screen draft editor allowing 1-tap manual corrections and original photo preservation.

### 5. Decoupled Status Model & Persistent Pending Dues Tracker
- Sites independently track `workStatus` (*Planning / Ongoing / Completed / On Hold*) and `paymentStatus` (*Unpaid / Partially Paid / Paid*).
- Dedicated **Pending Dues Tracker** flags unsettled vendor and tool bills even after a site's physical work is marked "Completed".

### 6. Local-First Offline Resilience & PDF Export
- **IndexedDB via Dexie.js** provides 100% offline data logging on remote sites.
- Automated client-side PDF project statements and CSV muster sheet export using `jspdf` and `jspdf-autotable`.

---

## 🎬 Verification & Testing Summary

The end-to-end user flows were validated via automated test builds (`npm run build`) and interactive browser agent sessions:

| Feature / Flow | Test Scenario | Result |
| :--- | :--- | :---: |
| **Onboarding & Tutorial** | Language selection, Trade card pick, Sample contractor data seeding, 4-step tutorial | ✅ Passed |
| **Trade Token Theming** | Dynamic switching between Construction, Plumbing, and Electrical | ✅ Passed |
| **Bilingual Toggle** | Seamless switch between Hindi (हिंदी) and English | ✅ Passed |
| **Voice-to-Form** | Speech transcription, field extraction preview, instant site creation | ✅ Passed |
| **Photo OCR Register** | Muster photo canvas preprocessing, text recognition, draft wage table | ✅ Passed |
| **Site Management & P&L** | Budget vs Outflow (Materials + Labour + Tools + Machinery), Margin calculation | ✅ Passed |
| **Tools Tracker** | Overdue return alerts, rental calculation, "Mark Returned" workflow | ✅ Passed |
| **Materials & Stock** | Quantity / plate sizes / units, supplier linking, automatic dues creation | ✅ Passed |
| **Machinery & Fuel** | JCB/Mixer hours, diesel fuel litres & cost calculations | ✅ Passed |
| **Persistent Dues Tracker** | Highlighting unpaid vendor & rental bills on Completed sites | ✅ Passed |
| **Smart Insights Engine** | Automated rule-based advice on highest expense sites and overdue tools | ✅ Passed |
| **PDF & CSV Export** | Client-side statement generation with contractor header and tables | ✅ Passed |
| **Public Showcase Landing**| Interactive portfolio demo page, trade switcher preview, tech stack summary | ✅ Passed |

---

## 📁 Source Code Organization

```
d:/TECH/site sathi/
├── src/
│   ├── components/
│   │   ├── common/         # Header, BottomNav, NavigationTabs, VoiceInputModal, QuickAddModal, RemindersModal
│   │   ├── dashboard/      # Category-aware widgets & KPI overview
│   │   ├── sites/          # SiteCard, SiteList, SiteDetailsModal, AddSiteModal
│   │   ├── labour/         # LabourRegister, PhotoOcrModal
│   │   ├── tools/          # ToolTracker, AddToolModal
│   │   ├── materials/      # MaterialLog, AddMaterialModal
│   │   ├── machinery/      # MachineryLog, AddMachineryModal
│   │   ├── dues/           # PendingDuesTracker, AddDueModal
│   │   ├── insights/       # SmartInsightsCard
│   │   ├── reports/        # ReportsExporter
│   │   ├── onboarding/     # OnboardingModal & Interactive Tutorial
│   │   └── landing/        # PublicLandingPage for GitHub/Portfolio
│   ├── core/
│   │   ├── db/             # Dexie.js database schema & starter seed data
│   │   ├── i18n/           # Bilingual Hindi/English dictionaries
│   │   └── theme/          # ThemeContext, trade palettes, and CSS tokens
│   ├── utils/
│   │   ├── speechRecognition.ts # Web Speech API parser
│   │   ├── ocrProcessor.ts      # Tesseract.js canvas OCR engine
│   │   ├── audioRecorder.ts     # Voice notes MediaRecorder utility
│   │   └── reportExporter.ts    # jsPDF & CSV export engine
│   ├── types/index.ts      # TypeScript models
│   ├── index.css           # CSS Variables Token Architecture
│   └── App.tsx             # Main orchestrated application
└── package.json
```
