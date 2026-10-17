import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Site, ExpenseDue, ToolRecord, LabourRecord, MaterialRecord, ClientPayment } from '../types';

export const exportSiteReportPdf = (
  site: Site,
  finance: any,
  tools: ToolRecord[],
  materials: MaterialRecord[],
  dues: ExpenseDue[],
  clientPayments: ClientPayment[] = [],
  companyName: string = 'SiteSaathi Contractor'
) => {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('SiteSaathi — Project Financial Statement', 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${companyName} | Generated on: ${new Date().toLocaleDateString('en-IN')}`, 14, 25);

  // Site Overview Card
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Site: ${site.name}`, 14, 44);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Location: ${site.location}`, 14, 52);
  doc.text(`Status: Work: ${site.workStatus.toUpperCase()} | Payment: ${site.paymentStatus.toUpperCase()}`, 14, 58);
  doc.text(`Start Date: ${site.startDate} ${site.expectedEndDate ? `| Target End: ${site.expectedEndDate}` : ''}`, 14, 64);

  // Financial Summary Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 70, 182, 36, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Contract Budget', 20, 79);
  doc.text('Total Outflow', 68, 79);
  doc.text('Est. Margin (Profit)', 116, 79);
  doc.text('Pending Site Dues', 160, 79);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${(site.estimatedBudget || 0).toLocaleString('en-IN')}`, 20, 89);
  doc.setTextColor(220, 38, 38);
  doc.text(`Rs. ${(finance?.totalExpense || 0).toLocaleString('en-IN')}`, 68, 89);
  doc.setTextColor(22, 163, 74);
  doc.text(`Rs. ${(finance?.estimatedProfit || 0).toLocaleString('en-IN')}`, 116, 89);
  doc.setTextColor(217, 119, 6);
  doc.text(`Rs. ${(finance?.unpaidDues || 0).toLocaleString('en-IN')}`, 160, 89);

  // Materials Table
  let currentY = 114;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Material Outflow Breakdown', 14, currentY);

  const materialRows = materials.map((m) => [
    m.purchaseDate,
    m.itemName,
    `${m.quantity} ${m.unit}`,
    `Rs. ${m.unitPrice}`,
    `Rs. ${m.totalCost.toLocaleString('en-IN')}`,
    m.paymentStatus.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Date', 'Material Name', 'Qty / Size', 'Rate', 'Total Cost', 'Status']],
    body: materialRows.length > 0 ? materialRows : [['-', 'No materials logged yet', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22] },
    styles: { fontSize: 8 },
  });

  // Tools Table
  currentY = (doc as any).lastAutoTable.finalY + 12;
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Equipment & Scaffolding Tracker', 14, currentY);

  const toolRows = tools.map((t) => [
    t.name,
    t.quantity.toString(),
    t.dateSent,
    t.expectedReturnDate,
    t.status.toUpperCase(),
    t.sourceType === 'purchased_for_site'
      ? `Purchased (Rs. ${(t.purchasePrice || t.rentOrRepairCost || 0).toLocaleString('en-IN')})`
      : 'Self-Owned (Rs. 0)',
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Equipment Name', 'Qty', 'Date Sent', 'Expected Return', 'Status', 'Ownership / Cost']],
    body: toolRows.length > 0 ? toolRows : [['-', 'No tools deployed', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 8 },
  });

  // Pending Dues Table
  currentY = (doc as any).lastAutoTable.finalY + 12;
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Pending Dues & Vendor Payables', 14, currentY);

  const dueRows = dues.map((d) => [
    d.title,
    d.category.toUpperCase(),
    `Rs. ${d.amountDue.toLocaleString('en-IN')}`,
    `Rs. ${(d.amountPaid || 0).toLocaleString('en-IN')}`,
    `Rs. ${(d.amountDue - (d.amountPaid || 0)).toLocaleString('en-IN')}`,
    d.dueDate,
    d.status.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Title / Item', 'Category', 'Total Bill', 'Paid', 'Balance Due', 'Due Date', 'Status']],
    body: dueRows.length > 0 ? dueRows : [['-', 'No pending dues', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38] },
    styles: { fontSize: 8 },
  });

  // Client Payments Table
  currentY = (doc as any).lastAutoTable.finalY + 12;
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Client Payments Received History', 14, currentY);

  const clientPaymentRows = clientPayments.map((p) => [
    p.paymentDate,
    p.notes || 'Milestone Receipt',
    p.payerName || (site.clientName || '-'),
    p.paymentMode,
    p.referenceNo || '-',
    `Rs. ${p.amount.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Date', 'Milestone / Notes', 'Payer / Client', 'Mode', 'Ref No', 'Amount Received']],
    body: clientPaymentRows.length > 0 ? clientPaymentRows : [['-', 'No client payments recorded', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
    styles: { fontSize: 8 },
  });

  // Save the PDF
  doc.save(`SiteSaathi_Report_${site.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};

// Export Daily Attendance PDF for a single date
export const exportDailyAttendancePdf = (
  record: LabourRecord,
  siteName: string,
  companyName: string = 'SiteSaathi Contractor'
) => {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Daily Labour Attendance Register', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${companyName} | Site: ${siteName} | Date: ${record.date}`, 14, 24);

  // Summary Metrics Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 36, 182, 24, 3, 3, 'FD');

  const totalWorkers = record.totalWorkers || (record.entries?.length || 0);
  const totalWages = record.totalDailyWage || 0;
  const totalPaid = record.totalPaid || 0;
  const balanceDue = totalWages - totalPaid;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Workers Present', 20, 44);
  doc.text('Total Daily Wages', 75, 44);
  doc.text('Amount Paid', 125, 44);
  doc.text('Balance Due', 165, 44);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalWorkers} Workers`, 20, 53);
  doc.text(`Rs. ${totalWages.toLocaleString('en-IN')}`, 75, 53);
  doc.setTextColor(22, 163, 74);
  doc.text(`Rs. ${totalPaid.toLocaleString('en-IN')}`, 125, 53);
  doc.setTextColor(balanceDue > 0 ? 220 : 100, balanceDue > 0 ? 38 : 116, balanceDue > 0 ? 38 : 139);
  doc.text(`Rs. ${balanceDue.toLocaleString('en-IN')}`, 165, 53);

  // Workers Attendance Table
  const tableRows = (record.entries || []).map((e, index) => [
    index + 1,
    e.workerName,
    e.role,
    e.attendanceStatus === 'half_day' ? 'Half Day (0.5)' : e.attendanceStatus === 'absent' ? 'Absent (0.0)' : 'Full Day (1.0)',
    `Rs. ${e.dailyWage}`,
    `Rs. ${e.paidAmount !== undefined ? e.paidAmount : e.dailyWage}`,
    `Rs. ${e.balanceDue || 0}`,
  ]);

  autoTable(doc, {
    startY: 66,
    head: [['#', 'Worker Name', 'Role / Trade', 'Attendance', 'Daily Wage', 'Paid', 'Balance']],
    body: tableRows.length > 0 ? tableRows : [['-', 'No individual entries logged', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 8 },
    foot: [
      [
        'Total',
        `${totalWorkers} Workers`,
        '',
        '',
        `Rs. ${totalWages.toLocaleString('en-IN')}`,
        `Rs. ${totalPaid.toLocaleString('en-IN')}`,
        `Rs. ${balanceDue.toLocaleString('en-IN')}`,
      ],
    ],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
  });

  doc.save(`Daily_Attendance_${siteName.replace(/[^a-zA-Z0-9]/g, '_')}_${record.date}.pdf`);
};

// Export Site Total Attendance Summary Sheet (Date & Worker Quantity ONLY, NO worker names)
export const exportSiteTotalAttendancePdf = (
  site: Site,
  records: LabourRecord[],
  companyName: string = 'SiteSaathi Contractor'
) => {
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Site Total Attendance Summary Sheet', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${companyName} | Site: ${site.name} | Location: ${site.location}`, 14, 25);

  // Summary Metrics Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 38, 182, 24, 3, 3, 'FD');

  const totalDays = records.length;
  const totalWorkerQuantity = records.reduce((acc, r) => acc + (r.totalWorkers || (r.entries?.length || 0)), 0);
  const totalSiteWages = records.reduce((acc, r) => acc + (r.totalDailyWage || 0), 0);
  const totalSitePaid = records.reduce((acc, r) => acc + (r.totalPaid || 0), 0);
  const totalSiteBalance = totalSiteWages - totalSitePaid;

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Days Logged', 20, 46);
  doc.text('Total Worker Quantity', 65, 46);
  doc.text('Total Wages', 120, 46);
  doc.text('Total Balance Due', 160, 46);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalDays} Days`, 20, 55);
  doc.text(`${totalWorkerQuantity} Man-days`, 65, 55);
  doc.text(`Rs. ${totalSiteWages.toLocaleString('en-IN')}`, 120, 55);
  doc.setTextColor(totalSiteBalance > 0 ? 220 : 22, totalSiteBalance > 0 ? 38 : 163, totalSiteBalance > 0 ? 38 : 74);
  doc.text(`Rs. ${totalSiteBalance.toLocaleString('en-IN')}`, 160, 55);

  // Sorted records by date
  const sortedRecords = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Table with Date and Worker Quantity (NO worker names)
  const summaryRows = sortedRecords.map((r, index) => [
    index + 1,
    r.date,
    `${r.totalWorkers || (r.entries?.length || 0)} Workers`,
    `Rs. ${(r.totalDailyWage || 0).toLocaleString('en-IN')}`,
    `Rs. ${(r.totalPaid || 0).toLocaleString('en-IN')}`,
    `Rs. ${((r.totalDailyWage || 0) - (r.totalPaid || 0)).toLocaleString('en-IN')}`,
    r.rawPhotoUrl ? 'OCR Scanned' : 'Manual Entry',
  ]);

  autoTable(doc, {
    startY: 68,
    head: [['#', 'Date (Date Logged)', 'Worker Quantity', 'Daily Wages', 'Amount Paid', 'Balance Due', 'Entry Type']],
    body: summaryRows.length > 0 ? summaryRows : [['-', 'No attendance records logged', '-', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] },
    styles: { fontSize: 8 },
    foot: [
      [
        'Total',
        `${totalDays} Days`,
        `${totalWorkerQuantity} Workers`,
        `Rs. ${totalSiteWages.toLocaleString('en-IN')}`,
        `Rs. ${totalSitePaid.toLocaleString('en-IN')}`,
        `Rs. ${totalSiteBalance.toLocaleString('en-IN')}`,
        '',
      ],
    ],
    footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42], fontStyle: 'bold' },
  });

  doc.save(`Site_Attendance_Summary_${site.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};

export const exportLabourRegisterCsv = (record: LabourRecord, siteName: string) => {
  const headers = ['Date', 'Site', 'Worker Name', 'Role', 'Attendance', 'Daily Wage', 'Paid Amount', 'Balance Due'];
  const rows = (record.entries || []).map((e) => [
    record.date,
    `"${siteName}"`,
    `"${e.workerName}"`,
    e.role,
    e.attendanceStatus,
    e.dailyWage,
    e.paidAmount,
    e.balanceDue,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Labour_Register_${siteName}_${record.date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
