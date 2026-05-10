import React, { useState } from 'react';
import {
  Heart,
  Target,
  TrendingUp,
  Users,
  Plus,
  Pencil,
  Trash2,
  Calendar as CalendarIcon,
  Link as LinkIcon,
  FileText
} from 'lucide-react';
import { exportReceiptPDF } from '../lib/export';
import { Campaign, Donation } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

interface FundraisingProps {
  campaigns: Campaign[];
  donations: Donation[];
  onAddCampaign: () => void;
  onEditCampaign: (campaign: Campaign) => void;
  onDeleteCampaign: (id: string) => void;
  associationId: string | null;
  settings?: Record<string, string>;
}

const Fundraising: React.FC<FundraisingProps> = ({
  campaigns,
  donations,
  onAddCampaign,
  onEditCampaign,
  onDeleteCampaign,
  associationId,
  settings = {} as Record<string, string>,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'donations'>('campaigns');
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const [selectedDonor, setSelectedDonor] = useState('');
  const [donorReceiptYear, setDonorReceiptYear] = useState(currentYear);
  const [donorReceiptMonth, setDonorReceiptMonth] = useState(currentMonth);
  const [donorReceiptMonthYear, setDonorReceiptMonthYear] = useState(currentYear);

  const totalRaised = campaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
  const totalGoal = campaigns.reduce((sum, c) => sum + c.goalAmount, 0);
  const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;

  const copyDonationLink = (campaignId: string) => {
    const url = `${window.location.origin}/donate/${associationId}?campaign=${campaignId}`;
    navigator.clipboard.writeText(url);
    alert(t('linkCopied'));
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-6">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Raised</p>
            <p className="text-3xl font-serif font-bold text-slate-900">{formatCurrency(totalRaised)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-6">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <Target className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Goal</p>
            <p className="text-3xl font-serif font-bold text-slate-900">{formatCurrency(totalGoal)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow flex items-center gap-6">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Active Campaigns</p>
            <p className="text-3xl font-serif font-bold text-slate-900">{activeCampaignsCount}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-50 gap-4">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
              onClick={() => setActiveTab('campaigns')}
              className={cn(
                "px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === 'campaigns' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={cn(
                "px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === 'donations' ? "bg-white text-brand-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Donations
            </button>
          </div>

          {activeTab === 'campaigns' && (
            <button
              onClick={onAddCampaign}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'campaigns' ? (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {campaigns.length > 0 ? campaigns.map(campaign => {
              const progress = Math.min(100, Math.round(((campaign.currentAmount || 0) / campaign.goalAmount) * 100));
              return (
                <motion.div 
                  layout
                  key={campaign.id}
                  className="border border-slate-100 rounded-3xl p-6 hover:shadow-md transition-shadow group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 flex gap-2">
                    <button 
                      onClick={() => copyDonationLink(campaign.id)}
                      className="p-2 bg-white text-slate-400 hover:text-brand-600 rounded-full shadow-sm border border-slate-100 transition-colors"
                      title="Copy Public Donation Link"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onEditCampaign(campaign)}
                      className="p-2 bg-white text-slate-400 hover:text-amber-600 rounded-full shadow-sm border border-slate-100 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDeleteCampaign(campaign.id)}
                      className="p-2 bg-white text-slate-400 hover:text-red-600 rounded-full shadow-sm border border-slate-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      campaign.status === 'active' ? "bg-emerald-50 text-emerald-700" :
                      campaign.status === 'completed' ? "bg-slate-100 text-slate-600" :
                      "bg-amber-50 text-amber-700"
                    )}>
                      {campaign.status}
                    </span>
                    <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {campaign.endDate || 'No end date'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2 pr-24">
                    {campaign.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                    {campaign.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-brand-600">{formatCurrency(campaign.currentAmount || 0)}</span>
                      <span className="text-slate-400">of {formatCurrency(campaign.goalAmount)}</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-brand-500 rounded-full"
                      />
                    </div>
                    <div className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {progress}% Funded
                    </div>
                  </div>
                </motion.div>
              );
            }) : (
              <div className="col-span-full py-20 text-center text-slate-500 italic">
                No fundraising campaigns found. Create one to start accepting donations!
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Donor</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaign</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {donations.length > 0 ? donations.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(donation => {
                  const campaign = campaigns.find(c => c.id === donation.campaignId);
                  return (
                    <tr key={donation.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {new Date(donation.date).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-slate-900">
                          {donation.isAnonymous ? 'Anonymous Donor' : donation.donorName}
                        </p>
                        {!donation.isAnonymous && donation.donorEmail && (
                          <p className="text-xs text-slate-500">{donation.donorEmail}</p>
                        )}
                      </td>
                      <td className="px-8 py-4 text-sm text-slate-600 font-medium">
                        {campaign?.title || 'Unknown Campaign'}
                      </td>
                      <td className="px-8 py-4 text-right font-serif font-bold text-emerald-600">
                        {formatCurrency(donation.amount)}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-500 italic">
                      No donations received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Donor Tax Receipts */}
      {activeTab === 'donations' && (() => {
        const uniqueDonors = Array.from(new Set(donations.filter(d => !d.isAnonymous).map(d => d.donorName))).sort();
        const donorDonations = selectedDonor ? donations.filter(d => d.donorName === selectedDonor) : [];
        const donorYears = (Array.from(new Set(donorDonations.map(d => new Date(d.date).getFullYear()))) as number[]).sort((a, b) => b - a);
        const donorYearOptions = donorYears.length > 0 ? donorYears : [currentYear];
        const donorEmail = donorDonations.find(d => d.donorEmail)?.donorEmail;

        const buildDonorRows = (year: number, month?: number) =>
          donorDonations
            .filter(d => {
              const dt = new Date(d.date);
              return dt.getFullYear() === year && (month === undefined || dt.getMonth() === month);
            })
            .map(d => ({
              date: new Date(d.date).toLocaleDateString(),
              description: campaigns.find(c => c.id === d.campaignId)?.title || 'Donation',
              amount: d.amount,
            }));

        return (
          <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30 flex items-center gap-3">
              <div className="p-2 bg-brand-50 rounded-xl">
                <FileText className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-slate-900">Donor Tax Receipts</h3>
                <p className="text-xs text-slate-400 mt-0.5">Generate receipts for individual donors for tax declaration</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              {uniqueDonors.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-4">No named donors available.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Donor</label>
                    <select
                      value={selectedDonor}
                      onChange={e => {
                        setSelectedDonor(e.target.value);
                        const years = (Array.from(new Set(donations.filter(d => d.donorName === e.target.value).map(d => new Date(d.date).getFullYear()))) as number[]).sort((a, b) => b - a);
                        if (years.length > 0) { setDonorReceiptYear(years[0]); setDonorReceiptMonthYear(years[0]); }
                      }}
                      className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-slate-100 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                    >
                      <option value="">— Select a donor —</option>
                      {uniqueDonors.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                  </div>

                  {selectedDonor && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      {/* Annual */}
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Annual Receipt</p>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year</label>
                          <select
                            value={donorReceiptYear}
                            onChange={e => setDonorReceiptYear(Number(e.target.value))}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                          >
                            {donorYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                          </select>
                        </div>
                        <button
                          onClick={() => exportReceiptPDF({
                            recipientName: selectedDonor,
                            recipientEmail: donorEmail,
                            receiptType: 'donation',
                            period: { type: 'year', year: donorReceiptYear },
                            rows: buildDonorRows(donorReceiptYear),
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
                              value={donorReceiptMonth}
                              onChange={e => setDonorReceiptMonth(Number(e.target.value))}
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
                              value={donorReceiptMonthYear}
                              onChange={e => setDonorReceiptMonthYear(Number(e.target.value))}
                              className="w-full px-3 py-2.5 rounded-xl border border-slate-100 bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                            >
                              {donorYearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={() => exportReceiptPDF({
                            recipientName: selectedDonor,
                            recipientEmail: donorEmail,
                            receiptType: 'donation',
                            period: { type: 'month', year: donorReceiptMonthYear, month: donorReceiptMonth },
                            rows: buildDonorRows(donorReceiptMonthYear, donorReceiptMonth),
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
                  )}
                </>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Fundraising;
