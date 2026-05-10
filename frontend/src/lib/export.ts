import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from './utils';

export const exportToExcel = (data: any[], fileName: string, sheetName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportMonthlyReportPDF = (
  monthName: string,
  year: number,
  events: any[],
  collections: any[],
  summary: { income: number; expenses: number; net: number }
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text(`Monthly Report - ${monthName} ${year}`, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);

  // Summary Section
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text('Financial Summary', 14, 40);
  
  autoTable(doc, {
    startY: 45,
    head: [['Description', 'Amount']],
    body: [
      ['Total Income', formatCurrency(summary.income)],
      ['Total Expenses', formatCurrency(summary.expenses)],
      ['Net Balance', formatCurrency(summary.net)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
  });

  // Events Section
  let finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.text('Events This Month', 14, finalY);
  
  if (events.length > 0) {
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Name', 'Speaker', 'Date', 'Location']],
      body: events.map(e => [e.name, e.player, e.date, e.place]),
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });
    finalY = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFontSize(10);
    doc.text('No events recorded this month.', 14, finalY + 10);
    finalY += 20;
  }

  // Collections Section
  doc.setFontSize(14);
  doc.text('Collections (Payments)', 14, finalY);
  
  if (collections.length > 0) {
    autoTable(doc, {
      startY: finalY + 5,
      head: [['Date', 'Member', 'Objective', 'Amount', 'Method']],
      body: collections.map(c => [c.date, c.member, c.objective, formatCurrency(c.amount), c.method]),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }, // Emerald-500
    });
  } else {
    doc.setFontSize(10);
    doc.text('No collections recorded this month.', 14, finalY + 10);
  }

  doc.save(`Monthly_Report_${monthName}_${year}.pdf`);
};

export const exportFundraisingReportPDF = (
  objectiveName: string,
  target: number,
  raised: number,
  contributors: any[]
) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(79, 70, 229);
  doc.text(`Fundraising Report: ${objectiveName}`, 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text(`Target: ${formatCurrency(target)}`, 14, 32);
  doc.text(`Total Raised: ${formatCurrency(raised)}`, 14, 40);
  doc.text(`Progress: ${Math.round((raised / target) * 100)}%`, 14, 48);

  autoTable(doc, {
    startY: 55,
    head: [['Member', 'Fee Target', 'Paid (This Obj)', 'Date', 'Status']],
    body: contributors.map(c => [
      c.member, 
      formatCurrency(c.memberFee), 
      formatCurrency(c.amount), 
      c.date, 
      c.status
    ]),
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
  });

  doc.save(`Fundraising_Report_${objectiveName.replace(/\s+/g, '_')}.pdf`);
};

export const exportReceiptPDF = (opts: {
  recipientName: string;
  recipientCity?: string;
  recipientEmail?: string;
  receiptType: 'membership' | 'donation';
  period: { type: 'year'; year: number } | { type: 'month'; year: number; month: number };
  rows: { date: string; description: string; amount: number; method?: string }[];
  associationName: string;
  associationAddress?: string;
  associationEmail?: string;
  associationTaxId?: string;
}) => {
  const {
    recipientName, recipientCity, recipientEmail,
    receiptType, period, rows,
    associationName, associationAddress, associationEmail, associationTaxId,
  } = opts;

  const doc = new jsPDF();
  const BRAND: [number, number, number] = [13, 148, 136];
  const SLATE: [number, number, number] = [100, 116, 139];
  const DARK: [number, number, number] = [15, 23, 42];
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const periodLabel = period.type === 'year'
    ? `Annual — ${period.year}`
    : `${MONTH_NAMES[period.month]} ${period.year}`;

  const titleText = receiptType === 'membership'
    ? 'MEMBERSHIP CONTRIBUTION RECEIPT'
    : 'DONATION RECEIPT';

  // Association header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND);
  doc.text(associationName, 14, 20);

  let y = 28;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SLATE);
  if (associationAddress) { doc.text(associationAddress, 14, y); y += 6; }
  if (associationEmail) { doc.text(`Email: ${associationEmail}`, 14, y); y += 6; }
  if (associationTaxId) { doc.text(`Tax / Reg. No.: ${associationTaxId}`, 14, y); y += 6; }

  doc.setDrawColor(...BRAND);
  doc.setLineWidth(0.5);
  doc.line(14, y + 3, 196, y + 3);
  y += 12;

  // Receipt title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text(titleText, 14, y);
  y += 10;

  // Metadata
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...SLATE);
  const receiptNo = `RCP-${Date.now().toString().slice(-8)}`;
  doc.text(`Receipt No.: ${receiptNo}`, 14, y);
  doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 110, y);
  y += 6;
  doc.text(`Period: ${periodLabel}`, 14, y);
  y += 12;

  // Recipient block
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Issued to:', 14, y);
  y += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(recipientName, 14, y);
  if (recipientCity) { y += 5; doc.text(recipientCity, 14, y); }
  if (recipientEmail) { y += 5; doc.text(recipientEmail, 14, y); }
  y += 10;

  // Payments table
  autoTable(doc, {
    startY: y,
    head: [['Date', 'Description', 'Method', 'Amount']],
    body: rows.length > 0
      ? rows.map(r => [r.date, r.description, r.method || '—', formatCurrency(r.amount)])
      : [['—', 'No contributions recorded for this period', '—', '—']],
    foot: rows.length > 0
      ? [['', '', 'TOTAL', formatCurrency(rows.reduce((s, r) => s + r.amount, 0))]]
      : undefined,
    theme: 'striped',
    headStyles: { fillColor: BRAND },
    footStyles: { fontStyle: 'bold', fillColor: [241, 245, 249] as [number, number, number] },
    columnStyles: { 3: { halign: 'right' } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 14;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...SLATE);
  doc.text('This document confirms the above contribution for tax declaration purposes.', 14, finalY);

  const safeName = recipientName.replace(/\s+/g, '_');
  const safePeriod = period.type === 'year'
    ? `${period.year}`
    : `${MONTH_NAMES[period.month]}_${period.year}`;
  doc.save(`Receipt_${safeName}_${safePeriod}.pdf`);
};
