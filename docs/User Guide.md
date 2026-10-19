# SiteSaathi (साइट साथी) — Contractor & Supervisor User Guide

> **Document Version:** 1.0.0  
> **Target Audience:** Civil Contractors, Trade Thekedars, Site Supervisors & Engineers  
> **Supported Languages:** English & Hindi (हिंदी)  
> **Application Type:** 100% Offline Progressive Web App & Android App  

---

## 🌟 Welcome to SiteSaathi (साइट साथी में आपका स्वागत है)

**SiteSaathi** is your complete digital site diary and contractor assistant. It replaces traditional paper notebooks (*Khatta* / *Dairy*), lost bills, and wage disputes with a fast, offline-first mobile app tailored for Indian job sites.

Whether you run **General Civil Construction**, **Plumbing & Sanitary**, or **Electrical & Wiring** contracts, SiteSaathi helps you log daily worker attendance (*Haziri*), track shuttering plates and machinery, monitor supplier credit (*Udhaar*), record client payments, and generate professional PDF statements directly on your phone.

---

## 📱 Quick 5-Step Contractor Workflow

```mermaid
graph LR
    Step1[1. Select Trade & Create Account] --> Step2[2. Add Site via Voice or Form]
    Step2 --> Step3[3. Log Daily Muster, Materials & Tools]
    Step3 --> Step4[4. Record Client Payments & Track Udhaar]
    Step4 --> Step5[5. Export PDF Statement & Share on WhatsApp]
```

---

## 1. Getting Started & Account Setup

### 1.1 First-Time Onboarding
1. Open the **SiteSaathi** application on your mobile browser or Android phone.
2. Select your preferred language: **Hindi (हिंदी)** or **English**.
3. Choose your primary trade category:
   - 🏗️ **General Construction** (Orange theme: Masonry, shuttering, concrete, JCB)
   - 🔧 **Plumbing & Sanitary** (Aqua theme: PVC pipes, drainage, valves, core cutters)
   - ⚡ **Electrical & Wiring** (Amber theme: Conduits, cables, switchboards, pullers)
   - *(8 additional trades also available: Painting, Carpentry, Fabrication, Flooring, Ceiling, HVAC, Interior, Infrastructure)*.
4. Click **"Get Started"** to launch the interactive 5-step tutorial.

### 1.2 Creating Your Account (Sign Up)
1. On the welcome screen, click **"Sign Up"**.
2. Enter your **Full Name** (*e.g., Rajesh Kumar*).
3. Enter your **10-Digit Mobile Number** (*e.g., 9876543210*).
4. Enter your **Company / Firm Name** (*e.g., Kumar Construction & Interiors*).
5. Set a **4-Digit Security PIN / Password** and confirm it.
6. Click **"Create Account"**. Your profile is saved locally and you are immediately logged into your workspace.

### 1.3 Returning Login
- Enter your registered **10-digit mobile number** and your **4-digit PIN**.
- Alternatively, tap your account card under **"Saved Accounts"** to quickly access your site workspace.
- **Forgot PIN?** Click *"Forgot PIN?"*, enter your registered 10-digit mobile number, and enter a new 4-digit PIN to update your security lock.

---

## 2. Managing Sites & Projects

### 2.1 Adding a New Site (Manual Form)
1. In the bottom navigation bar, tap **"Sites"** (or tap **"+ Add Site"** on the Dashboard).
2. Enter the **Site Name** (*e.g., Sharma Villa, Metro Plaza Phase 2*).
3. Enter the **Site Location** (*e.g., Sector 62, Noida, Ring Road*).
4. Select the **Site Type** (*Residential, Commercial, Road, Bridge, Renovation, Apartment, etc.*).
5. Enter the **Contract Budget** in Rupees (*e.g., ₹15,00,000*). All fields start completely blank so you enter only your project's numbers.
6. Enter the **Client Name** and **Client Phone Number** (Optional: tap the contact icon to pick directly from your phone contacts).
7. Select the **Start Date** and optional **Target Completion Date**.
8. Click **"Save Site"**.

### 2.2 Adding a Site via Smart Voice Assistant (बोलकर साइट बनाएं)
1. Tap the **Microphone (आवाज)** button in the top header or on the Add Site modal.
2. Select your speaking language: **Hindi (हिंदी)** or **English**.
3. Tap the green microphone circle and speak naturally:
   - *Hindi Example:* **"साइट का नाम शर्मा विला, लोकेशन गोमती नगर, बजट आठ लाख, रेजिडेंशियल"**
   - *English Example:* **"Site name Green Park, location Ring Road, budget 25 lakh, commercial"**
4. Tap Stop. SiteSaathi's AI extracts the site name, location, budget, and project type.
5. Review the extracted fields in the editable preview modal, make any desired edits, and click **"Save Site"**.

### 2.3 Understanding Site Statuses
SiteSaathi keeps physical work progress separate from your financial payments:
- **Work Status (काम की स्थिति):**
  - `Planning` (तैयारी) — Project contract agreed, site mobilization underway.
  - `Ongoing` (चालू) — Active civil, electrical, or plumbing work in progress.
  - `On Hold` (रुका हुआ) — Work paused due to approvals, weather, or client delays.
  - `Completed` (पूर्ण) — Physical construction work finished.
- **Payment Status (भुगतान की स्थिति):**
  - `Unpaid` (बाकी) — No payments received yet from client.
  - `Partially Paid` (आंशिक) — Client has paid some milestone advances.
  - `Paid` (पूर्ण भुगतान) — Full contract budget received.

> 💡 **Important Contractor Advantage:** When you mark a site's work as **Completed**, any unpaid client balances or unsettled supplier bills remain visible in your **Pending Dues** tracker until settled!

---

## 3. Daily Site Diary & Logging (दैनिक साइट डायरी)

Tap any site card to open the **Site Details Drilldown Modal**, which provides tabs for all project records:

```
[Overview & P&L] | [Client Payments] | [Tools] | [Labour] | [Materials] | [Machinery] | [Pending Dues]
```

### 3.1 Daily Labour Attendance & Wages (मजदूर हाजिरी और मजदूरी)

#### A. Manual Daily Muster Entry
1. In the Site Details modal, tap the **"Labour"** tab (or the bottom **"Workers"** tab).
2. Tap **"+ Daily Muster"**.
3. Select the date of work.
4. For each worker on site:
   - Enter **Worker Name** (*e.g., Subhash Mistry, Ramu Helper*).
   - Select **Trade Role** (*Mason / मिस्त्री, Helper / मजदूर, Electrician, Plumber, Carpenter, Painter, Supervisor*).
   - Select **Attendance**: `Full Day` (पूरा दिन), `Half Day` (आधा दिन - 0.5x wage), or `Absent` (अनुपस्थित).
   - Enter their **Daily Wage Rate** (*e.g., ₹900 for Mason, ₹550 for Helper*).
   - Enter **Amount Paid Today** (*e.g., ₹500 advance or ₹0*).
   - The app automatically calculates **Balance Due** (*e.g., ₹400 remaining*).
5. Tap **"Save Labour Register"**.

#### B. Photo OCR Attendance Scanning (कागजी हाजिरी का फोटो खींचें)
1. Tap **"Scan Photo (OCR)"**.
2. Tap **"Take Photo"** to open your mobile camera or **"Upload Photo"** to select an existing photo of your physical notebook.
3. The app automatically enhances the image contrast on your phone canvas.
4. Tesseract OCR scans the lines and detects worker names, trade roles, attendance marks (`P`, `H`, `A`), and daily wage figures.
5. In the split-screen review table, verify the names and rates, make any quick adjustments, and tap **"Save to Register"**.

---

### 3.2 Material Purchases & Deliveries (सामग्री और माल)
1. In the Site Details modal, tap the **"Materials"** tab.
2. Tap **"+ Add Material"**.
3. Enter the **Item Name** (*e.g., Ultratech Cement, 12mm TMT Steel, Sand / Bajri*).
4. Enter the **Quantity** and select specialized units:
   - `bags` (बोरी)
   - `plates (4x4)` (शटरिंग प्लेट्स)
   - `truck` (ट्रक / डम्पर)
   - `brass` (ब्रास)
   - `meters` (मीटर)
   - `kg` (किलो)
5. Enter the **Unit Price** (*Rate per unit*). The app calculates **Total Cost**.
6. Select **Payment Status**: `Paid`, `Partial`, or `Pending`.
7. Enter the **Amount Paid Today**. Any unpaid amount automatically creates an entry in your site dues.
8. Click **"Save Material"**.

---

### 3.3 Tools, Shuttering & Scaffolding Tracker (औजार और शटरिंग)
1. In the Site Details modal, tap the **"Tools"** tab.
2. Tap **"+ Add Tool"**.
3. Enter tool name and quantity (*e.g., Shuttering Plates: 60, Concrete Vibrator: 2*).
4. Select tool ownership:
   - `Self-Owned` (Contractor's own tools dispatched from godown).
   - `Purchased / Rented for Site` (Rental charges logged).
5. Set the **Dispatch Date** and **Expected Return Date**.
6. Save.
7. **Overdue Alerts:** If equipment remains on site past the expected return date, SiteSaathi highlights the item in red and generates a **Return Alert** on your dashboard so you avoid rental fines.
8. When tools return to your warehouse, tap **"Mark Returned"**.

---

### 3.4 Machinery & Diesel Fuel Log (मशीनरी और डीजल)
1. In the Site Details modal, tap the **"Machinery"** tab.
2. Tap **"+ Add Machinery"**.
3. Select Machine Type (*JCB Excavator, Concrete Mixer, Tractor, Crane, Generator, etc.*).
4. Enter **Rental Hours or Days** and **Rental Cost** (or check *Self-Owned* if you own the machine).
5. Enter **Diesel Fuel Litres** and **Fuel Cost**.
6. The app computes the combined machinery expenditure and links it to your site's total outflow.

---

## 4. Financial Settlement & Client Payments

### 4.1 Recording Client Payments Received (ग्राहक भुगतान)
1. In the Site Details modal, tap the **"Client Payments"** tab.
2. Tap **"+ Record Payment"**.
3. Enter the **Amount Received** (*e.g., ₹2,50,000*).
4. Select the **Payment Date** and **Payment Mode**:
   - `UPI / Online` (GPay, PhonePe, Paytm)
   - `Cash` (नकद)
   - `Bank Transfer` (NEFT / RTGS / IMPS)
   - `Cheque` (चेक)
5. Enter optional **Payer Name**, **Reference / UTR Number**, and notes.
6. Click **"Save Payment"**.
7. **Instant Result:** Your site's payment progress bar advances, the total received increases, and the outstanding client balance updates automatically.

### 4.2 Tracking Pending Dues (उधार और बकाया लेन-देन)
1. In the Site Details modal, tap the **"Pending Dues"** tab.
2. View all unpaid supplier credit, pending worker wages, and equipment rental bills.
3. When you pay a vendor:
   - Click the **Edit** icon on the due card.
   - Enter the payment amount and update status to `Paid` or `Partial`.
   - Save.

---

## 5. Reports & Document Sharing (पीडीएफ रिपोर्ट)

SiteSaathi generates clean, official PDF documents directly inside your phone's browser without sending your data to any external server:

1. **Project Financial Statement (PDF):**
   - Tap **"PDF Report"** on the site card or details modal.
   - Generates a complete project statement containing:
     - Contractor Firm Header & Site Overview
     - Contract Budget vs. Total Outflow vs. Estimated Profit Margin
     - Itemized Material Breakdown Table
     - Tools & Equipment Deployment Table
     - Pending Vendor Payables Table
     - Client Payment History Table
2. **Individual Client Payment Receipt (PDF):**
   - In Site Details -> Client Payments, tap the **Receipt icon** next to any transaction.
   - Generates an official payment receipt with receipt number, mode, date, received amount, and remaining contract balance due.
3. **Labour Muster Roll Export (CSV):**
   - In the Workers / Labour view, tap **"Export CSV"** to download an Excel-compatible spreadsheet of worker attendance and daily wages.

> 📲 **Sharing on WhatsApp:** Once the PDF downloads to your phone, tap your browser's share icon or open your phone's **Files / Downloads** folder to send the PDF directly to your client or accountant via WhatsApp.

---

## 6. App Security, Settings & Data Backup

Open the **Settings** modal by tapping the gear icon in the top header:

### 6.1 Profile & Firm Name
- Update your contractor name, mobile number, company letterhead name, and email. Changes automatically reflect on all newly generated PDF statements.

### 6.2 App Lock & Security PIN
- Toggle **"Enable PIN Lock"** to protect the app with a 4-digit security code whenever you close the app or switch windows.
- Set your 4-digit PIN and click **"Save PIN"**.

### 6.3 Anti-Delete Protection (एंटी-डिलीट सुरक्षा)
- Turn on **"Anti-Delete Protection"** in Settings.
- When active, no one can wipe your database or clear all projects without entering your master security PIN first.

### 6.4 Backing Up Your Data (फोन बदलते समय बैकअप लें)
Because SiteSaathi stores all data on your device, **regular backups protect your business records**:
1. Open **Settings** -> scroll down to **"Data Backup & Restore"**.
2. Tap **"Export Backup"**.
3. A JSON backup file named `SiteSaathi_Backup_YYYY-MM-DD.json` will immediately download to your phone's Downloads folder.
4. **Save this file to your Google Drive, email, or a secure WhatsApp chat.**

### 6.5 Restoring Your Data on a New Phone
1. Install or open SiteSaathi on your new phone.
2. Open **Settings** -> tap **"Import Backup"**.
3. Select your saved `SiteSaathi_Backup_*.json` file.
4. The app restores all your contractor accounts, sites, worker records, bills, and payments in one second, then refreshes your screen.

---

## 7. Troubleshooting & FAQ

| Problem | Likely Cause | Solution |
| :--- | :--- | :--- |
| **Microphone not listening during Voice Input** | Browser microphone permission was blocked or denied. | In your browser address bar, tap the lock/settings icon -> **Site Settings** -> set **Microphone** to **Allow**. |
| **Photo OCR shows blurry / unreadable text** | Paper muster sheet was captured at an angle or under dim lighting. | Flatten the notebook page on a table, ensure good overhead lighting, and hold the phone parallel to the paper. |
| **Old sample demo accounts appearing** | Demo data loaded during testing. | Open Settings -> click **"Clear All Data"** to initialize a clean slate, then register your real account. |
| **PDF download does not trigger on Android** | Mobile browser download permissions blocked. | Check phone settings -> Apps -> Browser -> Permissions -> allow Storage/Downloads access. |
| **App locked and forgot PIN** | Forgotten 4-digit security code. | Log out to the welcome screen -> click **"Sign In"** -> click **"Forgot PIN?"** -> enter your 10-digit phone number and set a new PIN. |
