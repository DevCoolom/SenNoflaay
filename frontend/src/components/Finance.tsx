import React, { useState } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Scale,
  Trash2,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar as CalendarIcon,
  Tag,
  Paperclip
} from 'lucide-react';
import { Objective, Expense, Member, Bill, MembershipFeeConfig } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

interface FinanceProps {
  objectives: Objective[];
  expenses: Expense[];
  members: Member[];
  bills: Bill[];
  membershipFeeConfig: MembershipFeeConfig | null;
  onAddObjective: () => void;
  onDeleteObjective: (id: string) => void;
  onViewObjective: (objective: Objective) => void;
  onAddExpense: () => void;
  onImportExpense: () => void;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const Finance: React.FC<FinanceProps> = ({
  objectives,
  expenses,
  members,
  bills,
  membershipFeeConfig,
  onAddObjective,
  onDeleteObjective,
  onViewObjective,
  onAddExpense,
  onImportExpense,
  canAdd,
  canEdit,
  canDelete
}) => {
  const { t } = useLanguage();
  const totalIncome = members.reduce((sum, m) => 
    sum + m.payments.reduce((pSum, p) => pSum + p.amount, 0), 0
  );
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) + bills.reduce((sum, b) => sum + b.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Ledger items (Income + Expenses + Bills)
  const ledger = [
    ...members.flatMap(m => m.payments.map(p => ({
      id: p.id,
      date: p.date,
      type: 'income' as const,
      desc: `Payment from ${m.firstName} ${m.lastName}`,
      objId: p.objectiveId,
      amount: p.amount,
      category: undefined
    }))),
    ...expenses.map(e => ({
      id: e.id,
      date: e.date,
      type: 'expense' as const,
      desc: e.desc,
      objId: e.objectiveId,
      amount: e.amount,
      category: e.category,
      receiptUrl: e.receiptUrl,
      receiptName: e.receiptName
    })),
    ...bills.map(b => ({
      id: b.id,
      date: b.date,
      type: 'expense' as const,
      desc: `${t('bill')}: ${b.title}`,
      objId: 'default', // Bills are generally not linked to objectives in current schema
      amount: b.amount,
      category: b.category
    }))
  ].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null);

  if (selectedObjective) {
    const objPayments = members.flatMap(m => m.payments.filter(p => p.objectiveId === selectedObjective.id));
    const objExpenses = expenses.filter(e => e.objectiveId === selectedObjective.id);
    const totalRaised = objPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalSpent = objExpenses.reduce((sum, e) => sum + e.amount, 0);

    return (
      <div className="space-y-6">
        <button onClick={() => setSelectedObjective(null)} className="flex items-center gap-2 text-slate-400 hover:text-brand-600">
          {t('back')}
        </button>
        <h2 className="text-3xl font-serif font-bold text-slate-900">{selectedObjective.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase">{t('target')}</p>
            <p className="text-2xl font-bold">{formatCurrency(selectedObjective.target)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase">{t('raised')}</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalRaised)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase">{t('expense')}</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSpent)}</p>
          </div>
        </div>
        {/* Contributors Table */}
        <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50">
            <h3 className="font-serif font-bold text-xl text-slate-900">Contributors</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('member')}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {objPayments.map(p => {
                const member = members.find(m => m.payments.includes(p));
                return (
                  <tr key={p.id}>
                    <td className="px-8 py-4">{member?.firstName} {member?.lastName}</td>
                    <td className="px-8 py-4 text-right">{formatCurrency(p.amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-emerald-50 rounded-2xl">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalIncome')}</p>
          </div>
          <p className="text-4xl font-serif font-bold text-slate-900">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-red-50 rounded-2xl">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalExpenses')}</p>
          </div>
          <p className="text-4xl font-serif font-bold text-slate-900">{formatCurrency(totalExpenses)}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-brand-50 rounded-2xl">
              <Scale className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('netBalance')}</p>
          </div>
          <p className={cn(
            "text-4xl font-serif font-bold",
            netBalance >= 0 ? "text-brand-600" : "text-red-600"
          )}>
            {formatCurrency(netBalance)}
          </p>
        </div>
      </div>

      {/* Objectives */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-serif font-bold text-slate-900">{t('objectivesGoals')}</h3>
          {canAdd && (
            <button
              onClick={onAddObjective}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t('newObjective')}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {objectives.map((obj) => {
            const raised = [
              ...members.flatMap(m => m.payments.filter(p => p.objectiveId === obj.id).map(p => p.amount)),
              ...expenses.filter(e => e.objectiveId === obj.id).map(e => -e.amount)
            ].reduce((sum, val) => sum + val, 0);
            
            const progress = Math.min(100, Math.max(0, (raised / obj.target) * 100));

            return (
              <motion.div 
                key={obj.id} 
                whileHover={{ y: -4 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow relative overflow-hidden group cursor-default"
                style={{ borderTopColor: obj.color, borderTopWidth: '4px' }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="text-xl font-serif font-bold text-slate-900 group-hover:text-brand-700 transition-colors">{obj.name}</h4>
                    <p className="text-xs font-medium text-slate-400 mt-1 line-clamp-1">{obj.description}</p>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setSelectedObjective(obj)}
                      className="p-2 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {obj.id !== 'default' && canDelete && (
                      <button 
                        onClick={() => onDeleteObjective(obj.id)}
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('raised')}</p>
                      <p className="text-xl font-serif font-bold text-brand-700">{formatCurrency(raised)}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('target')}</p>
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(obj.target)}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "circOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: obj.color }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Ledger */}
      <section className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-serif font-bold text-slate-900">{t('transactionHistory')}</h3>
          {canAdd && (
            <div className="flex gap-2">
              <button
                onClick={onImportExpense}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border border-slate-100"
              >
                <Tag className="w-4 h-4" />
                {t('import') || 'Import'}
              </button>
              <button
                onClick={onAddExpense}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border border-red-100"
              >
                <TrendingDown className="w-4 h-4" />
                {t('recordExpense')}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/30 border-b border-slate-50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('date')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('type')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('description')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('category')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('objective')}</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ledger.map((item) => {
                  const objName = objectives.find(o => o.id === item.objId)?.name || t('general');
                  return (
                    <tr key={item.id} className="hover:bg-brand-50/30 transition-colors group">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-slate-400 font-medium">
                          <CalendarIcon className="w-4 h-4" />
                          <span className="text-sm">{item.date}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                          item.type === 'income' 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-red-50 text-red-700"
                        )}>
                          {item.type === 'income' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          {item.type === 'income' ? t('income') : t('expense')}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm text-slate-900 font-bold">{item.desc}</p>
                        {item.type === 'expense' && 'receiptUrl' in item && item.receiptUrl && (
                          <a 
                            href={item.receiptUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[150px]">{item.receiptName || 'View Receipt'}</span>
                          </a>
                        )}
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm text-slate-600">
                          {item.category ? (t(item.category.toLowerCase().replace(/\s+/g, '')) || item.category) : '-'}
                        </p>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-slate-400 font-medium">
                          <Tag className="w-3.5 h-3.5" />
                          <span className="text-xs">{objName}</span>
                        </div>
                      </td>
                      <td className={cn(
                        "px-8 py-5 text-right font-serif font-bold text-lg",
                        item.type === 'income' ? "text-brand-700" : "text-red-700"
                      )}>
                        {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Finance;
