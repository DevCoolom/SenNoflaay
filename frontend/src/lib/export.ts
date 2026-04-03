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
