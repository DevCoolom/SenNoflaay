import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Wallet, 
  Calendar, 
  Receipt, 
  CheckCircle2, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  Activity
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';
import { Member, Event, Bill, Expense, Objective, Task, AuditLog } from '../types';

interface DashboardProps {
  members: Member[];
  objectives: Objective[];
  expenses: Expense[];
  events: Event[];
  bills: Bill[];
  tasks: Task[];
  auditLogs: AuditLog[];
  associationId: string | null;
  setActiveTab: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  members, 
  objectives, 
  expenses, 
  events, 
  bills, 
  tasks, 
  auditLogs,
  associationId,
  setActiveTab 
}) => {
  const { t } = useLanguage();

  // Calculations
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const isThisMonth = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  };

  const isLastMonth = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
  };

  const totalMembers = members.length;
  const newMembersThisMonth = members.filter(m => isThisMonth(m.joinedDate)).length;

  const allPayments = members.flatMap(m => m.payments || []);
  const totalIncome = allPayments.reduce((acc, p) => acc + p.amount, 0);
  const incomeThisMonth = allPayments.filter(p => isThisMonth(p.date)).reduce((acc, p) => acc + p.amount, 0);
  const incomeLastMonth = allPayments.filter(p => isLastMonth(p.date)).reduce((acc, p) => acc + p.amount, 0);

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0) + bills.reduce((acc, b) => acc + b.amount, 0);
  const expensesThisMonth = expenses.filter(e => isThisMonth(e.date)).reduce((acc, e) => acc + e.amount, 0) + 
                           bills.filter(b => isThisMonth(b.date)).reduce((acc, b) => acc + b.amount, 0);
  const expensesLastMonth = expenses.filter(e => isLastMonth(e.date)).reduce((acc, e) => acc + e.amount, 0) + 
                           bills.filter(b => isLastMonth(b.date)).reduce((acc, b) => acc + b.amount, 0);

  const netBalance = totalIncome - totalExpenses;
  const netThisMonth = incomeThisMonth - expensesThisMonth;

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const diff = ((current - previous) / previous) * 100;
    return `${diff > 0 ? '+' : ''}${Math.round(diff)}%`;
  };

  const upcomingEvents = events.filter(e => e.date && !isNaN(new Date(e.date).getTime()) && new Date(e.date) >= new Date()).length;
  const pendingBills = bills.length;
  const activeTasks = tasks.filter(t => t.status !== 'completed').length;

  const stats = [
    { 
      label: t('totalMembers'), 
      value: totalMembers, 
      icon: Users, 
      color: 'bg-blue-500', 
      tab: 'members',
      trend: `+${newMembersThisMonth} ${t('thisMonth') || 'this month'}`,
      trendColor: 'text-blue-600 bg-blue-50'
    },
    { 
      label: t('totalIncome'), 
      value: formatCurrency(totalIncome), 
      icon: TrendingUp, 
      color: 'bg-emerald-500', 
      tab: 'finance',
      trend: `${calculateTrend(incomeThisMonth, incomeLastMonth)} ${t('vsLastMonth') || 'vs last month'}`,
      trendColor: incomeThisMonth >= incomeLastMonth ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
    },
    { 
      label: t('totalExpenses'), 
      value: formatCurrency(totalExpenses), 
      icon: ArrowDownRight, 
      color: 'bg-rose-500', 
      tab: 'finance',
      trend: `${calculateTrend(expensesThisMonth, expensesLastMonth)} ${t('vsLastMonth') || 'vs last month'}`,
      trendColor: expensesThisMonth <= expensesLastMonth ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
    },
    { 
      label: t('netBalance'), 
      value: formatCurrency(netBalance), 
      icon: Wallet, 
      color: 'bg-brand-600', 
      tab: 'finance',
      trend: netThisMonth >= 0 ? (t('surplus') || 'Surplus') : (t('deficit') || 'Deficit'),
      trendColor: netThisMonth >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'
    },
  ];

  const quickActions = [
    { label: t('newMember'), icon: Users, tab: 'members' },
    { label: t('recordExpense'), icon: ArrowDownRight, tab: 'finance' },
    { label: t('newEvent'), icon: Calendar, tab: 'events' },
    { label: t('addBill'), icon: Receipt, tab: 'bills' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-serif font-bold text-slate-900 shrink-0">{t('dashboard')}</h2>
          <div className="bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 min-w-0">
            <span className="hidden sm:block text-xs font-bold text-brand-600 uppercase tracking-widest shrink-0">Association ID:</span>
            <code className="text-xs font-mono font-bold text-brand-900 bg-white px-2 py-0.5 rounded border border-brand-100 truncate">{associationId || 'N/A'}</code>
          </div>
        </div>
        <p className="text-slate-500 text-sm">{t('comprehensiveOverview')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.button
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => setActiveTab(stat.tab)}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group relative overflow-hidden"
          >
            <div className={stat.color + " w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg shadow-brand-100 group-hover:scale-110 transition-transform"}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            <div className="mt-4 flex items-center gap-1.5">
              <span className={cn("text-xs font-bold px-2 py-1 rounded-full", stat.trendColor)}>
                {stat.trend}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Overview Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Objectives Progress */}
          <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-serif font-bold text-slate-900">{t('progressTowardsObjectives')}</h3>
              <button 
                onClick={() => setActiveTab('finance')}
                className="text-xs font-bold text-brand-600 uppercase tracking-widest hover:underline"
              >
                {t('viewDetails')}
              </button>
            </div>
            <div className="space-y-6">
              {objectives.slice(0, 3).map((obj) => {
                const raised = members.reduce((acc, m) => 
                  acc + (m.payments?.filter(p => p.objectiveId === obj.id).reduce((pAcc, p) => pAcc + p.amount, 0) || 0), 0
                );
                const progress = Math.min(Math.round((raised / obj.target) * 100), 100);
                return (
                  <div key={obj.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="font-bold text-slate-900">{obj.name}</p>
                        <p className="text-xs text-slate-400">{formatCurrency(raised)} / {formatCurrency(obj.target)}</p>
                      </div>
                      <span className="text-sm font-bold text-brand-600">{progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-brand-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
              {objectives.length === 0 && (
                <p className="text-center text-slate-400 py-8 italic">{t('noFinancialData')}</p>
              )}
            </div>
          </section>

          {/* Upcoming Events & Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-xl">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-900">{t('events')}</h3>
                </div>
                <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2 py-1 rounded-full">
                  {upcomingEvents} {t('upcomingPastEvents').split('&')[0]}
                </span>
              </div>
              <div className="space-y-4">
                {events.slice(0, 3).map(event => (
                  <div key={event.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setActiveTab('events')}>
                    <div className="bg-slate-100 w-12 h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold text-slate-500">
                      <span className="text-sm">{new Date(event.date).getDate()}</span>
                      <span className="uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{event.name}</p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider">{event.place}</p>
                    </div>
                  </div>
                ))}
                {events.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">{t('noEventsFound')}</p>}
              </div>
            </section>

            <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-serif font-bold text-slate-900">{t('tasks')}</h3>
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-full">
                  {activeTasks} {t('todo')}
                </span>
              </div>
              <div className="space-y-4">
                {tasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setActiveTab('tasks')}>
                    <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-emerald-500' : task.status === 'in-progress' ? 'bg-amber-500' : 'bg-slate-300'}`} />
                    <p className="text-sm font-medium text-slate-700 truncate">{task.title}</p>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">{t('noTasksFound')}</p>}
              </div>
            </section>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <section className="bg-brand-900 p-8 rounded-[3rem] text-white shadow-xl shadow-brand-100">
            <h3 className="text-lg font-serif font-bold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map(action => (
                <button
                  key={action.label}
                  onClick={() => setActiveTab(action.tab)}
                  className="flex flex-col items-center justify-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-[2rem] transition-all group"
                >
                  <action.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-widest text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-slate-100 p-2 rounded-xl">
                <Activity className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="font-serif font-bold text-slate-900">{t('auditLogs')}</h3>
            </div>
            <div className="space-y-6">
              {auditLogs.slice(0, 5).map((log, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== auditLogs.slice(0, 5).length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-0 w-px bg-slate-100" />
                  )}
                  <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 z-10">
                    <Clock className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900">{log.action}</p>
                    <p className="text-xs text-slate-400 truncate">{log.details}</p>
                    <p className="text-xs text-slate-300 mt-1 uppercase font-bold tracking-tighter">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && <p className="text-xs text-slate-400 italic text-center py-4">{t('noLogsFound')}</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
