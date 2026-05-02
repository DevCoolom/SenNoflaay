import React, { useState } from 'react';
import { 
  User as UserIcon, 
  CreditCard, 
  Users, 
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Save,
  CheckCircle2,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { Member, Event, Objective, User } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface MemberPortalProps {
  user: User;
  member: Member | null;
  members: Member[];
  events: Event[];
  objectives: Objective[];
  onUpdateProfile: (data: Partial<Member>) => Promise<void>;
  onLogout: () => void;
}

const MemberPortal: React.FC<MemberPortalProps> = ({ 
  user, 
  member, 
  members, 
  events, 
  objectives, 
  onUpdateProfile,
  onLogout 
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'payments' | 'directory' | 'events'>('profile');
  
  // Profile edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: member?.firstName || '',
    lastName: member?.lastName || '',
    tel: member?.tel || '',
    city: member?.city || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await onUpdateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!member) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 card-shadow text-center max-w-md w-full">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Account Not Linked</h2>
          <p className="text-slate-500 mb-8">
            Your user account ({user.username}) is not yet linked to a member profile. Please contact your association administrator to link your account.
          </p>
          <button 
            onClick={onLogout}
            className="w-full bg-slate-900 text-white font-bold py-3 px-6 rounded-2xl hover:bg-slate-800 transition-colors"
          >
            {t('logout') || 'Log Out'}
          </button>
        </div>
      </div>
    );
  }

  const upcomingEvents = events
    .filter(e => !e.date || new Date(e.date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime());

  const totalPaid = member.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = member.fee - totalPaid;

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
        <div className="h-32 bg-brand-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 bg-white rounded-full p-2">
              <div className="w-full h-full bg-brand-50 rounded-full flex items-center justify-center">
                <span className="text-3xl font-serif font-bold text-brand-700">
                  {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                </span>
              </div>
            </div>
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50"
                >
                  {isSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('firstName')} & {t('lastName')}</p>
                  <p className="text-xl font-serif font-bold text-slate-900">{member.firstName} {member.lastName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('phoneNumber')}</p>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {member.tel || '-'}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('city')}</p>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {member.city || '-'}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('gender')}</p>
                  <p className="text-slate-700 font-medium capitalize">{t(member.gender)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Joined Date</p>
                  <div className="flex items-center gap-2 text-slate-700 font-medium">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    {member.joinedDate}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('firstName')}</label>
                <input 
                  type="text"
                  value={editData.firstName}
                  onChange={e => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('lastName')}</label>
                <input 
                  type="text"
                  value={editData.lastName}
                  onChange={e => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('phoneNumber')}</label>
                <input 
                  type="text"
                  value={editData.tel}
                  onChange={e => setEditData(prev => ({ ...prev, tel: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('city')}</label>
                <input 
                  type="text"
                  value={editData.city}
                  onChange={e => setEditData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('feeTarget')}</p>
          <p className="text-3xl font-serif font-bold text-slate-900">{formatCurrency(member.fee)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('totalContribution')}</p>
          <p className="text-3xl font-serif font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-brand-600 p-6 rounded-3xl card-shadow text-white">
          <p className="text-[10px] font-bold text-brand-200 uppercase tracking-widest mb-2">Remaining Balance</p>
          <p className="text-3xl font-serif font-bold">{formatCurrency(Math.max(0, balance))}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-serif font-bold text-xl text-slate-900">{t('paymentHistory')}</h3>
          <button className="bg-brand-50 text-brand-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-brand-100 transition-colors">
            Pay Dues
          </button>
        </div>
        {member.payments.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('date')}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('objectiveFund')}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('method')}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('amount')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {member.payments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{p.date}</td>
                  <td className="px-8 py-4 text-sm font-bold text-slate-900">{objectives.find(o => o.id === p.objectiveId)?.name || t('general')}</td>
                  <td className="px-8 py-4 text-sm text-slate-500">{p.method}</td>
                  <td className="px-8 py-4 text-right font-serif font-bold text-emerald-600">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-slate-500 italic">No payments recorded yet.</div>
        )}
      </div>
    </div>
  );

  const renderDirectory = () => (
    <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50">
        <h3 className="font-serif font-bold text-xl text-slate-900">Member Directory</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-serif font-bold">
              {m.firstName.charAt(0)}{m.lastName.charAt(0)}
            </div>
            <div>
              <p className="font-bold text-slate-900">{m.firstName} {m.lastName}</p>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <MapPin className="w-3 h-3" />
                {m.city || 'Unknown location'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {upcomingEvents.length > 0 ? (
        upcomingEvents.map((event) => (
          <div key={event.id} className="bg-white rounded-[2rem] border border-slate-100 card-shadow overflow-hidden group">
            <div className="p-8 space-y-6">
              <div>
                <h4 className="text-2xl font-serif font-bold text-slate-900 group-hover:text-brand-700 transition-colors mb-2">
                  {event.name}
                </h4>
                <div className="flex items-center gap-2 text-brand-600 font-bold text-sm uppercase tracking-widest">
                  <UserIcon className="w-4 h-4" />
                  {event.player}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-50">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('date')} & {t('time')}</p>
                  <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                    <CalendarIcon className="w-4 h-4 text-slate-300" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                    <Clock className="w-4 h-4 text-slate-300" />
                    {event.time}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('location')}</p>
                  <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                    <MapPin className="w-4 h-4 text-slate-300" />
                    {event.place}
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
                {event.description || t('noDescription')}
              </p>

              <button className="w-full bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold py-3 rounded-xl text-sm transition-colors flex justify-center items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Register / RSVP
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <CalendarIcon className="w-16 h-16 text-slate-100 mx-auto mb-4" />
          <p className="text-slate-400 font-medium italic">No upcoming events found.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl">
              S
            </div>
            <span className="font-serif font-bold text-xl tracking-tight text-slate-900">SenNoflaay</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{member.firstName} {member.lastName}</p>
              <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Member Portal</p>
            </div>
            <button 
              onClick={onLogout}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex gap-8 overflow-x-auto no-scrollbar">
            {[
              { id: 'profile', icon: UserIcon, label: 'My Profile' },
              { id: 'payments', icon: CreditCard, label: 'My Payments' },
              { id: 'directory', icon: Users, label: 'Directory' },
              { id: 'events', icon: CalendarIcon, label: 'Events' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 py-4 px-2 border-b-2 font-bold text-sm transition-all whitespace-nowrap",
                  activeTab === tab.id 
                    ? "border-brand-600 text-brand-600" 
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'payments' && renderPayments()}
            {activeTab === 'directory' && renderDirectory()}
            {activeTab === 'events' && renderEvents()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default MemberPortal;
