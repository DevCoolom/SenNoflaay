import React, { useMemo, useState } from 'react';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown, 
  Scale,
  AlertCircle,
  Target,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Member, Expense, Correction, Objective, Event, Bill } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { exportToExcel } from '../lib/export';
import { useLanguage } from '../lib/LanguageContext';
import MonthlyReport from './MonthlyReport';
import YearlyReport from './YearlyReport';

interface ReportsProps {
  members: Member[];
  expenses: Expense[];
  bills: Bill[];
  corrections: Correction[];
  objectives: Objective[];
  events: Event[];
  onEditYear: (year: number) => void;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const Reports: React.FC<ReportsProps> = ({ members, expenses, bills, corrections, objectives, events, onEditYear, canAdd, canEdit, canDelete }) => {
  const { t } = useLanguage();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'monthly' | 'yearly'>('overview');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(expenses.map(e => e.category).filter(Boolean));
    return Array.from(cats);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (selectedCategory === 'all') return expenses;
    return expenses.filter(e => e.category === selectedCategory);
  }, [expenses, selectedCategory]);

  const yearStats = useMemo(() => {
    const stats: Record<number, { income: number; expense: number; adjustment: number }> = {};

    members.forEach(m => {
      m.payments.forEach(p => {
        const year = new Date(p.date).getFullYear();
        if (!stats[year]) stats[year] = { income: 0, expense: 0, adjustment: 0 };
        stats[year].income += p.amount;
      });
    });

    filteredExpenses.forEach(e => {
      const year = new Date(e.date).getFullYear();
      if (!stats[year]) stats[year] = { income: 0, expense: 0, adjustment: 0 };
      stats[year].expense += e.amount;
    });

    bills.forEach(b => {
      const year = new Date(b.date).getFullYear();
      if (!stats[year]) stats[year] = { income: 0, expense: 0, adjustment: 0 };
      stats[year].expense += b.amount;
    });

    corrections.forEach(c => {
      if (!stats[c.year]) stats[c.year] = { income: 0, expense: 0, adjustment: 0 };
      stats[c.year].adjustment += c.amount;
    });

    return Object.entries(stats)
      .map(([year, data]) => ({
        year: parseInt(year),
        ...data,
        net: data.income - data.expense + data.adjustment
      }))
      .sort((a, b) => b.year - a.year);
  }, [members, filteredExpenses, corrections, bills]);

  const objectiveProgress = useMemo(() => {
    return objectives.map(obj => {
      const totalIncome = members.reduce((sum, m) => {
        const objPayments = m.payments.filter(p => p.objectiveId === obj.id);
        return sum + objPayments.reduce((s, p) => s + p.amount, 0);
      }, 0);

      const totalExpenses = expenses
        .filter(e => e.objectiveId === obj.id)
        .reduce((sum, e) => sum + e.amount, 0);

      const current = totalIncome - totalExpenses;
      const percentage = obj.target > 0 ? Math.min(100, Math.max(0, (current / obj.target) * 100)) : 0;

      return {
        ...obj,
        current,
        percentage,
        totalIncome,
        totalExpenses
      };
    });
  }, [members, expenses, objectives]);

  const chartData = useMemo(() => {
    return [...yearStats].reverse().map(s => ({
      name: s.year.toString(),
      income: s.income,
      expense: s.expense,
      net: s.net
    }));
  }, [yearStats]);

  const objectiveChartData = useMemo(() => {
    return objectiveProgress.map(obj => ({
      name: obj.name,
      value: obj.current,
      color: obj.color
    })).filter(d => d.value > 0);
  }, [objectiveProgress]);

  const handleExportExcel = () => {
    const data = yearStats.map(s => ({
      Year: s.year,
      Income: s.income,
      Expenses: s.expense,
      Adjustments: s.adjustment,
      'Net Balance': s.net
    }));
    exportToExcel(data, 'Yearly_Financial_Report', 'Yearly Stats');
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
          <h4 className="text-[10px] font-bold text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-widest">
            <LineChartIcon className="w-4 h-4 text-brand-600" />
            {t('incomeVsExpenses')}
          </h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                <Bar dataKey="income" name={t('income')} fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar dataKey="expense" name={t('expense')} fill="#ef4444" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Objectives Distribution */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
          <h4 className="text-[10px] font-bold text-slate-400 mb-8 flex items-center gap-2 uppercase tracking-widest">
            <PieChartIcon className="w-4 h-4 text-brand-600" />
            {t('fundsDistribution')}
          </h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={objectiveChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {objectiveChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Objectives Progress */}
      <section className="space-y-6">
        <h4 className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
          <Target className="w-4 h-4 text-brand-600" />
          {t('progressTowardsObjectives')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {objectiveProgress.map((obj) => (
            <div key={obj.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-xl font-serif font-bold text-slate-900">{obj.name}</h5>
                  <p className="text-xs font-medium text-slate-400 line-clamp-1 mt-1">{obj.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-serif font-bold text-brand-600">{Math.round(obj.percentage)}%</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                    style={{ width: `${obj.percentage}%`, backgroundColor: obj.color }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-slate-600">{formatCurrency(obj.current)}</span>
                  <span className="text-slate-300">{t('target')}: {formatCurrency(obj.target)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-slate-300 uppercase font-bold tracking-widest mb-1">{t('totalIncome')}</p>
                  <p className="text-base font-bold text-emerald-600">+{formatCurrency(obj.totalIncome)}</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-300 uppercase font-bold tracking-widest mb-1">{t('totalExpenses')}</p>
                  <p className="text-base font-bold text-red-500">-{formatCurrency(obj.totalExpenses)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Yearly Table */}
      <section className="space-y-6">
        <h4 className="text-[10px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
          <Scale className="w-4 h-4 text-brand-600" />
          {t('yearlyBreakdown')}
        </h4>
        <div className="bg-white rounded-[2rem] border border-slate-100 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30 border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('year')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('income')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('expenses')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('adjustments')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('netBalance')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {yearStats.length > 0 ? (
                  yearStats.map((stat) => (
                    <tr key={stat.year} className="hover:bg-brand-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <span className="font-serif font-bold text-lg text-slate-900">{stat.year}</span>
                          {canEdit && (
                            <button
                              onClick={() => onEditYear(stat.year)}
                              className="p-2 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                              title={t('editAdjustment')}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-emerald-600 font-bold">{formatCurrency(stat.income)}</td>
                      <td className="px-8 py-5 text-sm text-red-600 font-bold">{formatCurrency(stat.expense)}</td>
                      <td className="px-8 py-5 text-sm text-amber-600 font-bold italic">
                        {stat.adjustment !== 0 ? formatCurrency(stat.adjustment) : '-'}
                      </td>
                      <td className={cn(
                        "px-8 py-5 text-right font-serif font-bold text-lg",
                        stat.net >= 0 ? "text-brand-600" : "text-red-600"
                      )}>
                        {formatCurrency(stat.net)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium">
                      <div className="flex flex-col items-center gap-4">
                        <AlertCircle className="w-12 h-12 text-slate-100" />
                        <p className="italic">{t('noFinancialData')}</p>
                      </div>
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

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Main Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 card-shadow">
          <div>
            <h3 className="text-3xl font-serif font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-brand-600" />
              {t('reports')}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t('comprehensiveOverview')}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {activeSubTab === 'overview' && (
              <>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-widest outline-none"
                >
                  <option value="all">{t('all')}</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <button
                  onClick={handleExportExcel}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {t('exportExcel')}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="flex p-1.5 bg-slate-100/50 rounded-[1.5rem] w-full max-w-md mx-auto sm:mx-0 border border-slate-100">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all",
              activeSubTab === 'overview' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Layers className="w-4 h-4" />
            {t('general')}
          </button>
          <button
            onClick={() => setActiveSubTab('monthly')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all",
              activeSubTab === 'monthly' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Calendar className="w-4 h-4" />
            {t('monthly')}
          </button>
          <button
            onClick={() => setActiveSubTab('yearly')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all",
              activeSubTab === 'yearly' ? "bg-white text-brand-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <TrendingUp className="w-4 h-4" />
            {t('year')}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeSubTab === 'overview' && renderOverview()}
        {activeSubTab === 'monthly' && (
          <MonthlyReport 
            members={members}
            expenses={expenses}
            bills={bills}
            events={events}
            objectives={objectives}
          />
        )}
        {activeSubTab === 'yearly' && (
          <YearlyReport 
            members={members}
            expenses={expenses}
            bills={bills}
            corrections={corrections}
          />
        )}
      </div>
    </div>
  );
};

const Pencil = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export default Reports;
