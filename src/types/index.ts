export type TradeCategory =
  | 'construction'
  | 'plumbing'
  | 'electrical'
  | 'painting'
  | 'carpentry'
  | 'fabrication'
  | 'flooring'
  | 'ceiling'
  | 'hvac'
  | 'interior'
  | 'infra';
export type Language = 'hi' | 'en';
export type ThemeMode = 'light' | 'dark' | 'system';

export type SiteWorkStatus = 'planning' | 'ongoing' | 'completed' | 'on_hold';
export type SitePaymentStatus = 'unpaid' | 'partially_paid' | 'paid';

export interface ContractorAccount {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
  trade: TradeCategory;
  language: Language;
  themeMode: ThemeMode;
  companyName?: string;
  pinLock?: string;
  isPinLockEnabled?: boolean;
  isBiometricEnabled?: boolean;
  isAntiDeleteEnabled?: boolean;
  tutorialCompleted: boolean;
  createdAt: string;
}

export interface Site {
  id: string;
  contractorId: string;
  name: string;
  location: string;
  siteType: 'Building' | 'Residential' | 'Commercial' | 'Road' | 'Dam' | 'Bridge' | 'Renovation' | 'Industrial' | 'Apartment' | 'Other';
  estimatedBudget: number;
  workStatus: SiteWorkStatus;
  paymentStatus: SitePaymentStatus;
  startDate: string;
  expectedEndDate?: string;
  completedDate?: string;
  notes?: string;
  coverPhoto?: string;
  voiceNoteUrl?: string;
  createdAt: string;
}

export interface ToolRecord {
  id: string;
  siteId: string;
  name: string;
  quantity: number;
  size?: string;
  dateSent: string;
  expectedReturnDate: string;
  actualReturnDate?: string | null;
  rentOrRepairCost: number;
  status: 'on_site' | 'returned' | 'overdue';
  notes?: string;
  photoUrl?: string;
}

export interface LabourEntry {
  id: string;
  recordId: string;
  workerName: string;
  role: 'Mason' | 'Helper' | 'Electrician' | 'Plumber' | 'Plasterer' | 'Welder' | 'Carpenter' | 'Painter' | 'Supervisor';
  attendanceStatus: 'full_day' | 'half_day' | 'absent' | 'overtime';
  dailyWage: number;
  paidAmount: number;
  balanceDue: number;
}

export interface LabourRecord {
  id: string;
  siteId: string;
  date: string;
  rawPhotoUrl?: string;
  ocrRawText?: string;
  totalWorkers: number;
  totalDailyWage: number;
  totalPaid: number;
  notes?: string;
  voiceNoteUrl?: string;
  entries?: LabourEntry[];
}

export interface MaterialRecord {
  id: string;
  siteId: string;
  vendorId?: string;
  itemName: string;
  quantity: number;
  unit: string; // 'plates (4x4)' | 'bags' | 'meters' | 'kg' | 'brass' | 'truck' | 'pieces'
  unitPrice: number;
  totalCost: number;
  purchaseDate: string;
  paymentStatus: 'paid' | 'pending' | 'partial';
  paidAmount: number;
  receiptPhoto?: string;
  notes?: string;
}

export interface MachineryRecord {
  id: string;
  siteId: string;
  machineType: 'Concrete Mixer' | 'Tractor' | 'JCB Excavator' | 'Tower Crane' | 'Generator' | 'Breaker' | 'Pipe Threader' | 'Cable Puller' | 'Other';
  fuelLitres?: number;
  fuelCost?: number;
  rentalHoursOrDays?: number;
  rentalCost?: number;
  totalCost: number;
  logDate: string;
  notes?: string;
}

export interface ExpenseDue {
  id: string;
  siteId: string;
  vendorId?: string;
  title: string;
  category: 'material' | 'tool_rent' | 'machinery' | 'labour' | 'subcontract' | 'other';
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

export interface Vendor {
  id: string;
  contractorId: string;
  name: string;
  phone: string;
  tradeSpecialty: string;
  materialsSupplied?: string[];
  totalUdhaarBalance: number;
}

export interface Reminder {
  id: string;
  type: 'tool_overdue' | 'payment_due' | 'completed_site_due' | 'labour_wage';
  title: string;
  description: string;
  siteId: string;
  siteName: string;
  dueDate: string;
  amount?: number;
  isDismissed?: boolean;
}

export interface SmartInsight {
  id: string;
  category: 'budget_alert' | 'tool_overdue' | 'attendance_trend' | 'profit_summary';
  title: string;
  description: string;
  badge: string;
  actionText?: string;
  actionRoute?: string;
}

export interface TradeConfig {
  id: TradeCategory;
  nameEn: string;
  nameHi: string;
  subtitleEn: string;
  subtitleHi: string;
  primaryColor: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
  quickAddTemplates: {
    titleEn: string;
    titleHi: string;
    category: string;
    defaultCost?: number;
    unit?: string;
  }[];
  customWidgets: string[];
}
