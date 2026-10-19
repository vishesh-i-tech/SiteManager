# SiteSaathi (साइट साथी)

> **Multi-Trade Site Management & Daily Record Assistant for Contractors & Site Engineers**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Bundler-purple.svg)](https://vitejs.dev/)
[![Offline](https://img.shields.io/badge/Offline-100%25%20IndexedDB-green.svg)](https://dexie.org/)
[![Bilingual](https://img.shields.io/badge/Language-Hindi%20%7C%20English-orange.svg)](#)

SiteSaathi (साइट साथी) is a mobile-responsive, offline-resilient web application designed for contractors and site supervisors (**Thekedars**) across **General Construction, Plumbing, and Electrical** trades. It replaces traditional paper notebooks and lost slips with voice-assisted entry, photo diary scanning, tool rental tracking, and persistent vendor dues management.

---

## 🌟 Key Highlights & Features

1. **Bilingual Voice-to-Form Auto-Fill (Hindi / English)**
   - Speak in natural Hindi or English (*"साइट का नाम शर्मा विला, बजट 8 लाख"*).
   - Automatically populates structured site records with editable preview.

2. **Handwritten Labour Register Photo OCR**
   - Photograph traditional muster roll paper diaries.
   - Client-side OCR scans worker names, attendance (Full/Half Day), and wage balances into a digital review table.

3. **Multi-Trade Token Theming**
   - **General Construction**: Safety Orange theme, focused on masonry, shuttering plates, JCB, concrete mixers.
   - **Plumbing & Sanitary**: Aqua/Cyan theme, focused on pipes, drainage, valves, fittings, and core cutters.
   - **Electrical & Wiring**: Electric Amber theme, focused on conduits, wires, switchboards, and pullers.

4. **Persistent Dues Tracker (Independent Status Model)**
   - Decouples physical job progress (*Ongoing / Completed*) from financial settlement (*Unpaid / Paid*).
   - Finished sites keep unsettled supplier credit (**Udhaar**) and equipment rent visible until paid.

5. **Tool & Shuttering Tracker**
   - Tracks equipment dispatched to sites with expected return dates.
   - Alerts on overdue equipment before extra rental charges accumulate.

6. **100% Offline Resilience & PDF Export**
   - Operates fully offline in basements and remote sites using local client-side storage.
   - One-click export of professional PDF client statements and CSV muster rolls.

---

## 👥 Stakeholder Roles & Architecture

- **Contractor / Site Manager (Primary User):** Operates the app tailored to their specific trade.
- **Site Workers & Labour:** Masons, Helpers, Plumbers, Electricians, Carpenters, Welders, Painters, and Supervisors.
- **Vendors & Suppliers:** Raw material dealers, rental agencies, and machinery contractors (Udhaar balances).
- **Clients / Project Owners:** Contract budgets, milestone tracking, and billing.

For full architectural breakdown, refer to the documentation in [`docs/reports/SiteSaathi Project Documentation.pdf`](docs/reports/SiteSaathi%20Project%20Documentation.pdf).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation & Run

```bash
# Clone the repository
git clone https://github.com/vishesh-i-tech/SiteSaathi.git

# Navigate to project directory
cd SiteSaathi

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 📄 License
This project is private and maintained for site contractor management.
