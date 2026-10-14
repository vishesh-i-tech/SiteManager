import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Site, ExpenseDue, ToolRecord, LabourRecord, MaterialRecord } from '../types';

export const exportSiteReportPdf = (
  site: Site,
  finance: any,
  tools: ToolRecord[],
  materials: MaterialRecord[],
  dues: ExpenseDue[],
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
    `Rs. ${t.rentOrRepairCost.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Equipment Name', 'Qty', 'Date Sent', 'Expected Return', 'Status', 'Rent/Cost']],
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

  // Save the PDF
  doc.save(`SiteSaathi_Report_${site.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
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
