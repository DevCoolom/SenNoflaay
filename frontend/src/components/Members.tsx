import React, { useState } from 'react';
import {
  Search,
  Plus,
  Eye,
  DollarSign,
  Pencil,
  Trash2,
  Phone,
  User as UserIcon,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Member, MembershipFeeConfig, Objective } from '../types';
import { formatCurrency, getInitials } from '../lib/utils';
import { exportReceiptPDF } from '../lib/export';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

interface MembersProps {
  members: Member[];
  membershipFeeConfig: MembershipFeeConfig | null;
  onAddMember: () => void;
  onImportMember: () => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onViewDetails: (member: Member) => void;
  onAddPayment: (member: Member) => void;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  settings?: Record<string, string>;
  objectives?: Objective[];
}

const Members: React.FC<MembersProps> = ({
  members,
  membershipFeeConfig,
  onAddMember,
  onImportMember,
  onEditMember,
  onDeleteMember,
  onViewDetails,
  onAddPayment,
  canAdd,
  canEdit,
  canDelete,
  settings = {} as Record<string, string>,
  objectives = [] as Objective[],
}) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [receiptYear, setReceiptYear] = useState(new Date().getFullYear());
  const [receiptMonth, setReceiptMonth] = useState(new Date().getMonth());
  const [receiptMonthYear, setReceiptMonthYear] = useState(new Date().getFullYear());

  React.useEffect(() => {
    if (selectedMember) {
      const years = (Array.from(new Set(selectedMember.payments.map(p => new Date(p.date).getFullYear()))) as number[]).sort((a, b) => b - a);
      if (years.length > 0) {
        setReceiptYear(years[0]);
        setReceiptMonthYear(years[0]);
      }
    }
  }, [selectedMember?.id]);

  const getMemberTargetFee = (member: Member) => {
    if (!membershipFeeConfig) return member.fee;
    
    let baseFee = 0;
    if (!membershipFeeConfig.useCategories) {
      baseFee = membershipFeeConfig.amountAll;
    } else if (member.isMinor) {
      baseFee = membershipFeeConfig.amountMinor;
    } else if (member.gender === 'female') {
      baseFee = membershipFeeConfig.amountFemale;
    } else {
      baseFee = membershipFeeConfig.amountMale;
    }

    return membershipFeeConfig.period === 'monthly' ? baseFee * 12 : baseFee;
  };

  const getMemberStatus = (member: Member) => {
    const currentYear = new Date().getFullYear();
    const paid = member.payments
      .filter(p => new Date(p.date).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.amount, 0);
    const target = getMemberTargetFee(member);
    if (target <= 0) return 'paid';
    if (paid >= target) return 'paid';
    if (paid > 0) return 'partiallyPaid';
    return 'outstanding';
  };

  const filteredMembers = members.filter(m => 
    (m.firstName.toLowerCase().includes(search.toLowerCase()) || 
     m.lastName.toLowerCase().includes(search.toLowerCase()) || 
     m.tel.includes(search)) &&
    (statusFilter === 'all' || getMemberStatus(m) === statusFilter)
  );

  const currentYear = new Date().getFullYear();
  const totalCollected = members.reduce((sum, m) => 
    sum + m.payments
      .filter(p => new Date(p.date).getFullYear() === currentYear)
      .reduce((pSum, p) => pSum + p.amount, 0), 0
  );

  const totalOutstanding = members.reduce((sum, m) => {
    const paid = m.payments
      .filter(p => new Date(p.date).getFullYear() === currentYear)
      .reduce((pSum, p) => pSum + p.amount, 0);
    const target = getMemberTargetFee(m);
    return sum + Math.max(0, target - paid);
  }, 0);

  if (selectedMember) {
    const paymentYears = (Array.from(new Set(selectedMember.payments.map(p => new Date(p.date).getFullYear()))) as number[]).sort((a, b) => b - a);
    const yearOptions = paymentYears.length > 0 ? paymentYears : [currentYear];

    const buildReceiptRows = (year: number, month?: number) =>
      selectedMember.payments
        .filter(p => {
          const d = new Date(p.date);
          return d.getFullYear() === year && (month === undefined || d.getMonth() === month);
        })
        .map(p => ({
          date: new Date(p.date).toLocaleDateString(),
          description: objectives.find(o => o.id === p.objectiveId)?.name || p.objectiveId,
          amount: p.amount,
          method: p.method,
        }));

    const memberPayments = [...selectedMember.payments].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
    const memberTotal = memberPayments
      .filter(p => new Date(p.date).getFullYear() === currentYear)
      .reduce((sum, p) => sum + p.amount, 0);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedMember(null)}
            className="flex items-center gap-2 text-slate-400 hover:text-brand-600 transition-all group"
          >
            <div className="p-2 rounded-xl bg-white border border-slate-100 shadow-sm group-hover:shadow-md transition-all">
              <Plus className="w-4 h-4 rotate-45" />
            </div>
            <span className="font-bold text-xs uppercase tracking-widest">{t('back')}</span>
          </button>
          <div className="flex gap-2">
            {canAdd && (
              <button
                onClick={() => onAddPayment(selectedMember)}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 transition-all"
              >
                <Plus className="w-4 h-4" />
                {t('addPayment')}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Member Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow transition-colors">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-serif font-bold text-4xl border-4 border-white shadow-inner">
                  {getInitials(`${selectedMember.firstName} ${selectedMember.lastName}`)}
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900">{selectedMember.firstName} {selectedMember.lastName}</h2>
                  <p className="text-slate-400 font-medium text-sm flex items-center justify-center gap-2">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedMember.tel}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                {(selectedMember.linkedMemberId || selectedMember.linkedPersonName) && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('linkedPerson') || 'Linked Person'}</p>
                    {selectedMember.linkedMemberId ? (
                      (() => {
                        const linked = members.find(m => m.id === selectedMember.linkedMemberId);
                        return linked ? (
                          <button 
                            onClick={() => setSelectedMember(linked)}
                            className="flex items-center gap-2 text-brand-600 font-bold hover:underline text-sm"
                          >
                            <UserIcon className="w-4 h-4" />
                            {linked.firstName} {linked.lastName}
                          </button>
                        ) : null;
                      })()
                    ) : (
                      <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-slate-300" />
                        {selectedMember.linkedPersonName}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-10 space-y-4">
                <div className="p-5 rounded-2xl bg-brand-50/50 border border-brand-100/50">
                  <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">{t('totalContribution')}</p>
                  <p className="text-3xl font-serif font-bold text-brand-700">{formatCurrency(memberTotal)}</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('target')}</p>
                  <p className="text-xl font-serif font-bold text-slate-900">{formatCurrency(getMemberTargetFee(selectedMember))}</p>
                  <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-600" 
                      style={{ width: `${Math.min(100, (memberTotal / Math.max(1, getMemberTargetFee(selectedMember))) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-100/50">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">{t('outstanding')}</p>
                  <p className="text-xl font-serif font-bold text-amber-700">{formatCurrency(Math.max(0, getMemberTargetFee(selectedMember) - memberTotal))}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden transition-colors">
              <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30">
                <h3 className="font-serif font-bold text-xl text-slate-900">{t('paymentHistory')}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-50">
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('date')}</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('objective')}</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('amount')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {memberPayments.length > 0 ? (
                      memberPayments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-brand-50/30 transition-colors group">
                          <td className="px-8 py-5 text-sm font-medium text-slate-500">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-sm font-bold text-slate-900">{payment.objectiveId}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="font-serif font-bold text-lg text-slate-900">{formatCurrency(payment.amount)}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-8 py-16 text-center text-slate-400 font-medium italic">
                          {t('noPaymentsFound')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Tax Receipt Downloads */}
        <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
            <div className="p-2 bg-brand-50 rounded-xl">
              <FileText className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-slate-900">Tax Receipts</h3>
              <p className="text-xs text-slate-400 mt-0.5">Download contribution receipts for tax declaration</p>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Annual */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Annual Receipt</p>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year</label>
                <select
                  value={receiptYear}
                  onChange={e => setReceiptYear(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                >
                  {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <button
                onClick={() => exportReceiptPDF({
                  recipientName: `${selectedMember.firstName} ${selectedMember.lastName}`,
                  recipientCity: selectedMember.city,
                  receiptType: 'membership',
                  period: { type: 'year', year: receiptYear },
                  rows: buildReceiptRows(receiptYear),
                  associationName: settings.app_name || 'Association',
                  associationAddress: settings.association_address,
                  associationEmail: settings.association_email,
                  associationTaxId: settings.association_tax_id,
                })}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-100 active:scale-[0.98]"
              >
                <FileText className="w-4 h-4" />
                Download Annual Receipt
              </button>
            </div>

            {/* Monthly */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Monthly Receipt</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Month</label>
                  <select
                    value={receiptMonth}
                    onChange={e => setReceiptMonth(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                  >
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year</label>
                  <select
                    value={receiptMonthYear}
                    onChange={e => setReceiptMonthYear(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                  >
                    {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <button
                onClick={() => exportReceiptPDF({
                  recipientName: `${selectedMember.firstName} ${selectedMember.lastName}`,
                  recipientCity: selectedMember.city,
                  receiptType: 'membership',
                  period: { type: 'month', year: receiptMonthYear, month: receiptMonth },
                  rows: buildReceiptRows(receiptMonthYear, receiptMonth),
                  associationName: settings.app_name || 'Association',
                  associationAddress: settings.association_address,
                  associationEmail: settings.association_email,
                  associationTaxId: settings.association_tax_id,
                })}
                className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-100 active:scale-[0.98]"
              >
                <FileText className="w-4 h-4" />
                Download Monthly Receipt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow border-t-4 border-t-brand-600">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('totalMembers')}</p>
          <p className="text-4xl font-serif font-bold text-slate-900">{members.length}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow border-t-4 border-t-emerald-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('totalCollected')}</p>
          <p className="text-4xl font-serif font-bold text-slate-900">{formatCurrency(totalCollected)}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow border-t-4 border-t-amber-500">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('outstandingFees')}</p>
          <p className="text-4xl font-serif font-bold text-slate-900">{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:max-w-xs group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
            <input
              type="text"
              placeholder={t('searchMembers')}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
          >
            <option value="all">{t('all')}</option>
            <option value="paid">{t('paid')}</option>
            <option value="partiallyPaid">{t('partiallyPaid')}</option>
            <option value="outstanding">{t('outstanding')}</option>
          </select>
        </div>
        {canAdd && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onImportMember}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest border border-slate-100 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t('import') || 'Import'}
            </button>
            <button
              onClick={onAddMember}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 transition-all"
            >
              <Plus className="w-4 h-4" />
              {t('newMember')}
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('member')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('contact')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('city')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('status')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-brand-50/30 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-serif font-bold text-lg border-2 border-white shadow-sm">
                          {getInitials(`${member.firstName} ${member.lastName}`)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors flex items-center gap-2">
                            {member.firstName} {member.lastName}
                            {(member.linkedMemberId || member.linkedPersonName) && (
                              <UserIcon className="w-3 h-3 text-brand-400" title="Has linked person" />
                            )}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('target')}: {formatCurrency(getMemberTargetFee(member))}</p>
                            {member.gender && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold uppercase tracking-tighter">
                                {t(member.gender)}
                              </span>
                            )}
                            {member.isMinor && (
                              <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-bold uppercase tracking-tighter">
                                {t('minor')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Phone className="w-3.5 h-3.5" />
                        <span className="text-sm">{member.tel}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm text-slate-600">{member.city || '-'}</span>
                    </td>
                    <td className="px-8 py-5">
                      {(() => {
                        const status = getMemberStatus(member);
                        const colors = {
                          paid: 'bg-emerald-100 text-emerald-700',
                          partiallyPaid: 'bg-amber-100 text-amber-700',
                          outstanding: 'bg-red-100 text-red-700'
                        };
                        const labels = { paid: 'Paid', partiallyPaid: 'Partial', outstanding: 'Outstanding' };
                        return (
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${colors[status]}`}>
                            {labels[status]}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="p-2.5 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                          title={t('viewHistory')}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {canAdd && (
                          <button
                            onClick={() => onAddPayment(member)}
                            className="p-2.5 text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                            title={t('addPayment')}
                          >
                            <DollarSign className="w-5 h-5" />
                          </button>
                        )}
                        {canEdit && (
                          <button
                            onClick={() => onEditMember(member)}
                            className="p-2.5 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                            title={t('edit')}
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => onDeleteMember(member.id)}
                            className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title={t('delete')}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    {t('noMembersFound')}
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

export default Members;
