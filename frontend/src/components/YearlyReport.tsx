import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  Scale, 
  ArrowUpDown,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Settings2
} from 'lucide-react';
import { Member, Expense, Correction, Bill } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { exportToExcel } from '../lib/export';
import { useLanguage } from '../lib/LanguageContext';

interface YearlyReportProps {
  members: Member[];
  expenses: Expense[];
  bills: Bill[];
  corrections: Correction[];
}

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

const YearlyReport: React.FC<YearlyReportProps> = ({ members, expenses, bills, corrections }) => {
  const { t, language } = useLanguage();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    
    members.forEach(m => {
      m.payments.forEach(p => {
        years.add(new Date(p.date).getFullYear());
      });
    });
    
    expenses.forEach(e => {
      years.add(new Date(e.date).getFullYear());
    });
    
    bills.forEach(b => {
      years.add(new Date(b.date).getFullYear());
    });
    
    corrections.forEach(c => {
      years.add(c.year);
    });
    
    return Array.from(years).sort((a, b) => b - a);
  }, [members, expenses, corrections]);

  const yearlyData = useMemo(() => {
    const income = members.reduce((sum, m) => 
      sum + m.payments
        .filter(p => new Date(p.date).getFullYear() === selectedYear)
        .reduce((pSum, p) => pSum + p.amount, 0), 0
    );
    
    const yearlyExpenses = expenses
      .filter(e => new Date(e.date).getFullYear() === selectedYear)
      .reduce((sum, e) => sum + e.amount, 0) + 
      bills
      .filter(b => new Date(b.date).getFullYear() === selectedYear)
      .reduce((sum, b) => sum + b.amount, 0);
      
    const yearlyAdjustments = corrections
      .filter(c => c.year === selectedYear)
      .reduce((sum, c) => sum + c.amount, 0);
      
    const netBalance = income - yearlyExpenses + yearlyAdjustments;
    
    return { income, expenses: yearlyExpenses, adjustments: yearlyAdjustments, netBalance };
  }, [selectedYear, members, expenses, corrections]);

  const monthlyStats = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      name: new Intl.DateTimeFormat(language, { month: 'short' }).format(new Date(2000, i, 1)),
      income: 0,
      expenses: 0
    }));

    members.forEach(m => {
      m.payments.forEach(p => {
        const date = new Date(p.date);
        if (date.getFullYear() === selectedYear) {
          months[date.getMonth()].income += p.amount;
        }
      });
    });

    expenses.forEach(e => {
      const date = new Date(e.date);
      if (date.getFullYear() === selectedYear) {
        months[date.getMonth()].expenses += e.amount;
      }
    });

    bills.forEach(b => {
      const date = new Date(b.date);
      if (date.getFullYear() === selectedYear) {
        months[date.getMonth()].expenses += b.amount;
      }
    });

    return months;
  }, [selectedYear, members, expenses]);

  const transactions = useMemo(() => {
    const list = [
      ...members.flatMap(m => m.payments
        .filter(p => new Date(p.date).getFullYear() === selectedYear)
        .map(p => ({
          id: p.id,
          date: p.date,
          type: 'income' as const,
          desc: `Payment from ${m.firstName} ${m.lastName}`,
          amount: p.amount
        }))),
      ...expenses
        .filter(e => new Date(e.date).getFullYear() === selectedYear)
        .map(e => ({
          id: e.id,
          date: e.date,
          type: 'expense' as const,
          desc: e.desc,
          amount: e.amount
        })),
      ...bills
        .filter(b => new Date(b.date).getFullYear() === selectedYear)
        .map(b => ({
          id: b.id,
          date: b.date,
          type: 'expense' as const,
          desc: `${t('bill')}: ${b.title}`,
          amount: b.amount
        })),
      ...corrections
        .filter(c => c.year === selectedYear)
        .map((c, idx) => ({
          id: `corr-${idx}`,
          date: `${selectedYear}-01-01`, // Adjustments are yearly
          type: 'adjustment' as const,
          desc: `Adjustment: ${c.reason}`,
          amount: c.amount
        }))
    ];

    return list.sort((a, b) => {
      if (sortField === 'date') {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });
  }, [selectedYear, members, expenses, corrections, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    const exportData = transactions.map(trans => ({
      [t('date')]: trans.date,
      [t('type')]: t(trans.type),
      [t('description')]: trans.desc,
      [t('amount')]: trans.amount
    }));
    exportToExcel(exportData, `Yearly_Report_${selectedYear}`, 'Financials');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-brand-50 rounded-3xl">
            <CalendarIcon className="w-8 h-8 text-brand-600" />
          </div>
          <div>
            <h2 className="text-3xl font-serif font-bold text-slate-900">{t('yearlyFinancialReport')}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('year')}:</span>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="text-sm font-bold text-brand-600 bg-transparent border-none focus:ring-0 cursor-pointer hover:text-brand-700 transition-colors"
              >
                {availableYears.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleExport}
          className="flex items-center gap-3 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-100 active:scale-[0.98]"
        >
          <FileSpreadsheet className="w-5 h-5" />
          {t('exportExcel')}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalIncome')}</p>
          </div>
          <p className="text-3xl font-serif font-bold text-slate-900">{formatCurrency(yearlyData.income)}</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-50 rounded-xl">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalExpenses')}</p>
          </div>
          <p className="text-3xl font-serif font-bold text-slate-900">{formatCurrency(yearlyData.expenses)}</p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <Settings2 className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('adjustments')}</p>
          </div>
          <p className={cn(
            "text-3xl font-serif font-bold",
            yearlyData.adjustments >= 0 ? "text-slate-900" : "text-red-600"
          )}>
            {formatCurrency(yearlyData.adjustments)}
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-brand-50 rounded-xl">
              <Scale className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('netBalance')}</p>
          </div>
          <p className={cn(
            "text-3xl font-serif font-bold",
            yearlyData.netBalance >= 0 ? "text-brand-600" : "text-red-600"
          )}>
            {formatCurrency(yearlyData.netBalance)}
          </p>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 card-shadow">
        <h3 className="text-2xl font-serif font-bold text-slate-900 mb-10">{t('incomeVsExpenses')}</h3>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyStats} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                tickFormatter={(value) => `€${value}`}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '20px', 
                  border: 'none', 
                  boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                  padding: '16px'
                }}
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Legend 
                verticalAlign="top" 
                align="right" 
                iconType="circle"
                wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}
              />
              <Bar 
                name={t('income')} 
                dataKey="income" 
                fill="#10b981" 
                radius={[8, 8, 0, 0]} 
                barSize={40}
              />
              <Bar 
                name={t('expense')} 
                dataKey="expenses" 
                fill="#ef4444" 
                radius={[8, 8, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 card-shadow overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h3 className="text-2xl font-serif font-bold text-slate-900">{t('yearlyBreakdown')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th 
                  className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest cursor-pointer hover:text-brand-600 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    {t('date')}
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('type')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('description')}</th>
                <th 
                  className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right cursor-pointer hover:text-brand-600 transition-colors"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end gap-2">
                    {t('amount')}
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map((trans, idx) => (
                <tr key={trans.id || idx} className="hover:bg-brand-50/30 transition-colors group">
                  <td className="px-8 py-5 whitespace-nowrap text-xs text-slate-400 font-medium">{trans.date}</td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      trans.type === 'income' ? "bg-emerald-50 text-emerald-700" : 
                      trans.type === 'expense' ? "bg-red-50 text-red-700" : 
                      "bg-amber-50 text-amber-700"
                    )}>
                      {t(trans.type)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-lg font-serif font-bold text-slate-900">{trans.desc}</td>
                  <td className={cn(
                    "px-8 py-5 text-right font-serif font-bold text-lg",
                    trans.type === 'income' ? "text-emerald-600" : "text-red-600"
                  )}>
                    {trans.type === 'income' ? '+' : '-'} {formatCurrency(trans.amount)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    {t('noFinancialData')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default YearlyReport;
