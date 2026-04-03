import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Scale,
  ChevronRight,
  Printer
} from 'lucide-react';
import { Member, Expense, Event, Objective, Bill } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { exportMonthlyReportPDF, exportToExcel, exportFundraisingReportPDF } from '../lib/export';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

interface MonthlyReportProps {
  members: Member[];
  expenses: Expense[];
  bills: Bill[];
  events: Event[];
  objectives: Objective[];
}

const MonthlyReport: React.FC<MonthlyReportProps> = ({ members, expenses, bills, events, objectives }) => {
  const { t } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const reportData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    const monthlyEvents = events.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month - 1;
    });

    const collections: any[] = [];
    members.forEach(m => {
      m.payments.forEach(p => {
        const d = new Date(p.date);
        if (d.getFullYear() === year && d.getMonth() === month - 1) {
          collections.push({
            date: p.date,
            member: `${m.firstName} ${m.lastName}`,
            objective: objectives.find(o => o.id === p.objectiveId)?.name || 'Unknown',
            amount: p.amount,
            method: p.method,
            objectiveId: p.objectiveId
          });
        }
      });
    });

    const monthlyExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month - 1;
    });

    const monthlyBills = bills.filter(b => {
      const d = new Date(b.date);
      return d.getFullYear() === year && d.getMonth() === month - 1;
    });

    const totalIncome = collections.reduce((sum, c) => sum + c.amount, 0);
    const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0) + monthlyBills.reduce((sum, b) => sum + b.amount, 0);

    // Fundraising specific summary
    const fundraisingSummary = objectives.map(obj => {
      const objIncome = collections.filter(c => c.objectiveId === obj.id).reduce((sum, c) => sum + c.amount, 0);
      const objExpenses = monthlyExpenses.filter(e => e.objectiveId === obj.id).reduce((sum, e) => sum + e.amount, 0);
      // Note: Bills are currently not linked to objectives, so they don't affect fundraising summary
      return {
        ...obj,
        income: objIncome,
        expenses: objExpenses,
        net: objIncome - objExpenses
      };
    }).filter(f => f.income > 0 || f.expenses > 0);

    return {
      events: monthlyEvents,
      collections,
      expenses: [...monthlyExpenses, ...monthlyBills.map(b => ({ ...b, desc: `${t('bill')}: ${b.title}` }))],
      income: totalIncome,
      totalExpenses,
      net: totalIncome - totalExpenses,
      fundraisingSummary
    };
  }, [selectedMonth, members, expenses, bills, events, objectives, t]);

  const handleExportPDF = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });
    exportMonthlyReportPDF(
      monthName,
      year,
      reportData.events,
      reportData.collections,
      { income: reportData.income, expenses: reportData.totalExpenses, net: reportData.net }
    );
  };

  const handleExportExcel = () => {
    const data = reportData.collections.map(c => ({
      Date: c.date,
      Member: c.member,
      Objective: c.objective,
      Amount: c.amount,
      Method: c.method
    }));
    exportToExcel(data, `Monthly_Report_${selectedMonth}`, 'Collections');
  };

  const handleExportFundraisingPDF = (fund: any) => {
    // Get all contributors for this objective (not just this month)
    const contributors = members.flatMap(m => {
      const objPayments = m.payments.filter(p => p.objectiveId === fund.id);
      if (objPayments.length === 0) return [];
      
      const totalPaid = m.payments.reduce((sum, p) => sum + p.amount, 0);
      let status = 'unpaid';
      if (totalPaid >= m.fee && m.fee > 0) status = 'paid';
      else if (totalPaid > 0) status = 'partial';

      return objPayments.map(p => ({
        member: `${m.firstName} ${m.lastName}`,
        memberFee: m.fee,
        amount: p.amount,
        date: p.date,
        status: status
      }));
    });

    const totalRaised = [
      ...members.flatMap(m => m.payments.filter(p => p.objectiveId === fund.id).map(p => p.amount)),
      ...expenses.filter(e => e.objectiveId === fund.id).map(e => -e.amount)
    ].reduce((sum, val) => sum + val, 0);

    exportFundraisingReportPDF(fund.name, fund.target, totalRaised, contributors);
  };

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{t('selectMonth')}:</label>
          <input
            type="month"
            className="px-6 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none w-full font-bold text-slate-700 transition-all"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {t('excel')}
          </button>
          <button
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-brand-100"
          >
            <Printer className="w-4 h-4" />
            {t('pdfReport')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('monthlyIncome')}</p>
          <p className="text-3xl font-serif font-bold text-emerald-600">{formatCurrency(reportData.income)}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('monthlyExpenses')}</p>
          <p className="text-3xl font-serif font-bold text-red-600">{formatCurrency(reportData.totalExpenses)}</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('monthlyNet')}</p>
          <p className={cn(
            "text-3xl font-serif font-bold",
            reportData.net >= 0 ? "text-brand-600" : "text-red-600"
          )}>
            {formatCurrency(reportData.net)}
          </p>
        </div>
      </div>

      {/* Fundraising Summary */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
          <TrendingUp className="w-4 h-4 text-brand-600" />
          {t('fundraisingPerformance')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportData.fundraisingSummary.length > 0 ? (
            reportData.fundraisingSummary.map((fund) => (
              <div key={fund.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow flex justify-between items-center group">
                <div>
                  <h4 className="text-xl font-serif font-bold text-slate-900">{fund.name}</h4>
                  <div className="flex gap-4 mt-2">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">+{formatCurrency(fund.income)}</span>
                    <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">-{formatCurrency(fund.expenses)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleExportFundraisingPDF(fund)}
                  className="p-3 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all"
                  title={t('exportFundraisingReport')}
                >
                  <Download className="w-6 h-6" />
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-100 text-slate-400 font-medium italic">
              {t('noFundraisingActivity')}
            </div>
          )}
        </div>
      </section>

      {/* Collections Table */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
          <FileText className="w-4 h-4 text-brand-600" />
          {t('collectionsThisMonth')}
        </h3>
        <div className="bg-white rounded-[2rem] border border-slate-100 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30 border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('date')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('member')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('objective')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('method')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reportData.collections.length > 0 ? (
                  reportData.collections.map((c, i) => (
                    <tr key={i} className="hover:bg-brand-50/30 transition-colors group">
                      <td className="px-8 py-5 text-xs text-slate-400 font-medium">{c.date}</td>
                      <td className="px-8 py-5 text-lg font-serif font-bold text-slate-900">{c.member}</td>
                      <td className="px-8 py-5 text-sm text-slate-500 font-medium">{c.objective}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                          {c.method}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-lg font-serif font-bold text-emerald-600 text-right">{formatCurrency(c.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      {t('noCollectionsFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MonthlyReport;
