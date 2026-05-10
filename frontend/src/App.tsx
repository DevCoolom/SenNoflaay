import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { insforge } from './lib/insforge';
import Layout from './components/Layout';
import Members from './components/Members';
import Finance from './components/Finance';
import Events from './components/Events';
import Bills from './components/Bills';
import Reports from './components/Reports';
import YearlyReport from './components/YearlyReport';
import MonthlyReport from './components/MonthlyReport';
import Users from './components/Users';
import Tasks from './components/Tasks';
import Audit from './components/Audit';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';
import { Modal, ConfirmModal, FormField, Input, Select, Textarea } from './components/Modals';
import { ImportModal } from './components/ImportModal';
import { useAppData } from './hooks/useAppData';
import { Member, User, Objective, Event, Bill, Expense } from './types';
import { formatCurrency } from './lib/utils';
import { Shield, Lock, User as UserIcon, Globe, Clock, MapPin, Calendar as CalendarIcon, Users as UsersIcon, Paperclip, UploadCloud } from 'lucide-react';
import { LanguageProvider, useLanguage } from './lib/LanguageContext';
import { hashPassword } from './lib/crypto';
import { Routes, Route, Navigate, useLocation, useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import MemberPortal from './components/MemberPortal';
import Fundraising from './components/Fundraising';
import DonationPage from './components/DonationPage';
import { useNotificationGenerator } from './hooks/useNotificationGenerator';

// Auth pages
import InvitePage from './components/InvitePage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';

// Marketing Pages
import Home from './marketing/Home';
import FeaturesPage from './marketing/Features';
import Pricing from './marketing/Pricing';
import Security from './marketing/Security';
import FAQ from './marketing/FAQ';
import DemoApp from './demo/DemoApp';
import Support from './marketing/Support';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <LanguageProvider>
      <ScrollToTop />
      <AppContent />
    </LanguageProvider>
  );
}

function AppContent() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  const {
    members,
    objectives,
    expenses,
    events,
    corrections,
    bills,
    users,
    auditLogs,
    settings,
    logAction,
    addMember,
    bulkAddMembers,
    updateMember,
    updateMemberProfile,
    deleteMember,
    addPayment,
    addObjective,
    deleteObjective,
    addExpense,
    bulkAddExpenses,
    addEvent,
    bulkAddEvents,
    updateEvent,
    deleteEvent,
    addBill,
    bulkAddBills,
    deleteBill,
    upsertCorrection,
    addUser,
    updateUser,
    deleteUser,
    updateSetting,
    membershipFeeConfig,
    updateMembershipFeeConfig,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    bulkAddTasks,
    loading,
    error: dataError,
    refetch,
    uploadFile,
    campaigns,
    donations,
    notifications,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    addDonation,
    markNotificationRead,
    addNotification
  } = useAppData(user?.associationId || null);

  useNotificationGenerator(
    user?.associationId || null,
    events,
    tasks,
    members,
    notifications,
    addNotification
  );

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginData, setLoginData] = useState({ associationId: '', username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [searchParams] = useSearchParams();
  const [isRegistering, setIsRegistering] = useState(searchParams.get('register') === 'true');
  const [regData, setRegData] = useState({ id: '', name: '', adminUsername: '', adminPassword: '' });

  useEffect(() => {
    if (searchParams.get('register') === 'true') setIsRegistering(true);
  }, [searchParams]);

  // Modal states
  const [modalType, setModalType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Confirmation states
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Auth logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const hashedPassword = await hashPassword(loginData.password);

      // Try hashed password first (new accounts)
      let { data, error } = await insforge.database.from('users')
        .select('*')
        .eq('association_id', loginData.associationId)
        .eq('username', loginData.username)
        .eq('password', hashedPassword)
        .maybeSingle();

      if (error) throw error;

      // Fallback: try plain-text password (legacy accounts) and auto-migrate
      if (!data) {
        const { data: legacyData, error: legacyError } = await insforge.database.from('users')
          .select('*')
          .eq('association_id', loginData.associationId)
          .eq('username', loginData.username)
          .eq('password', loginData.password)
          .maybeSingle();

        if (legacyError) throw legacyError;

        if (legacyData) {
          // Silently upgrade the stored password to hashed
          await insforge.database.from('users')
            .update({ password: hashedPassword })
            .eq('association_id', loginData.associationId)
            .eq('username', loginData.username);
          data = legacyData;
        }
      }

      if (data) {
        const userData = {
          username: data.username,
          role: data.role,
          associationId: data.association_id,
          memberId: data.member_id
        };
        setUser(userData);
        sessionStorage.setItem('pkst_user', JSON.stringify(userData));
      } else {
        setLoginError('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Connection error');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Basic validation for ID
    if (!/^[a-zA-Z0-9-]+$/.test(regData.id)) {
      setLoginError('Association ID can only contain letters, numbers, and hyphens');
      return;
    }

    try {
      const capitalizedUsername = regData.adminUsername.charAt(0).toUpperCase() + regData.adminUsername.slice(1);
      const hashedPassword = await hashPassword(regData.adminPassword);
      
      // Check if association already exists
      const { data: existingAssoc } = await insforge.database.from('associations')
        .select('id')
        .eq('id', regData.id)
        .maybeSingle();

      if (existingAssoc) {
        setLoginError('Association ID already exists. Please choose another one.');
        return;
      }

      const createdAt = new Date().toISOString();
      
      // Perform registration as a sequence of inserts (no transaction support in JS client for different tables, but usually fine for this)
      const { error: assocError } = await insforge.database.from('associations')
        .insert({ id: regData.id, name: regData.name, created_at: createdAt });

      if (assocError) throw assocError;

      const { error: userError } = await insforge.database.from('users')
        .insert({
          username: capitalizedUsername,
          association_id: regData.id,
          password: hashedPassword,
          role: 'superadmin'
        });

      if (userError) throw userError;

      await insforge.database.from('settings').insert([
        { association_id: regData.id, key: 'logo_url', value: '' },
        { association_id: regData.id, key: 'app_name', value: regData.name }
      ]);

      const userData: User = {
        username: capitalizedUsername,
        role: 'superadmin',
        associationId: regData.id,
      };
      setUser(userData);
      sessionStorage.setItem('pkst_user', JSON.stringify(userData));
      navigate(`/app/${regData.id}`);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      setLoginError(error.message || 'Registration failed');
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('pkst_user');
    if (stored) setUser(JSON.parse(stored));
    setSessionChecked(true);
  }, []);

  const handleLogout = (associationId?: string) => {
    const slug = associationId || user?.associationId;
    setUser(null);
    sessionStorage.removeItem('pkst_user');
    if (slug) navigate(`/app/${slug}`);
  };

  const loginView = (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 transition-colors duration-300 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white p-8 rounded-[2rem] card-shadow w-full max-w-sm border border-slate-100 transition-all relative overflow-hidden"
      >
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50/50 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50/50 rounded-full -ml-16 -mb-16 blur-3xl" />

        <div className="flex flex-col items-center mb-6 relative z-10">
          <div className="bg-brand-600 p-3 rounded-xl mb-3 shadow-xl shadow-brand-100">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 text-center leading-tight">
            {isRegistering ? 'Register Association' : 'Welcome Back'}
          </h2>
          <div className="h-1 w-10 bg-brand-600 rounded-full mt-2 mb-1.5" />
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            {isRegistering ? 'Create your platform account' : 'Access your association'}
          </p>
        </div>

        {!isRegistering ? (
          <form
            onSubmit={e => { e.preventDefault(); const slug = loginData.associationId.trim(); if (slug) navigate(`/app/${slug}`); }}
            className="space-y-3 relative z-10"
          >
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Enter your association ID to access your login page.
            </p>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Association ID</label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-slate-700 font-medium text-sm"
                  placeholder="e.g. my-assoc"
                  value={loginData.associationId}
                  onChange={e => setLoginData(prev => ({ ...prev, associationId: e.target.value }))}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-brand-100 active:scale-[0.98] text-xs uppercase tracking-[0.2em] mt-1"
            >
              Continue
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="text-[10px] text-brand-600 font-bold uppercase tracking-widest hover:underline"
              >
                Register your association
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assoc ID</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                  placeholder="e.g. my-assoc"
                  value={regData.id}
                  onChange={e => setRegData(prev => ({ ...prev, id: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assoc Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                  placeholder="Association Name"
                  value={regData.name}
                  onChange={e => setRegData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                placeholder="Admin Username"
                value={regData.adminUsername}
                onChange={e => setRegData(prev => ({ ...prev, adminUsername: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                placeholder="Admin Password"
                value={regData.adminPassword}
                onChange={e => setRegData(prev => ({ ...prev, adminPassword: e.target.value }))}
              />
            </div>

            {loginError && (
              <motion.p 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-500 font-bold text-center uppercase tracking-wider"
              >
                {loginError}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-brand-100 text-xs uppercase tracking-[0.2em] mt-4"
            >
              Create Association
            </button>

            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => setIsRegistering(false)}
                className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-50 text-center relative z-10">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
            Authorized access only.<br />Contact administrator for support.
          </p>
        </div>
      </motion.div>
    </div>
  );

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';
  const isTreasury = user?.role === 'treasury';
  const isController = user?.role === 'controller';

  const canManageUsers = isSuperAdmin;
  const canViewAudit = isSuperAdmin;
  const canAdd = isSuperAdmin || isAdmin || isTreasury;
  const canEdit = isSuperAdmin || isAdmin;
  const canDelete = isSuperAdmin || isAdmin;

  const currentMember = user?.memberId ? members.find(m => m.id === user.memberId) : null;

  const userNotifications = notifications.filter(n => 
    n.targetRole === 'all' || 
    n.targetRole === user?.role || 
    (user?.memberId && n.targetUserId === user.memberId)
  );

  const authenticatedView = user ? (
    user.role === 'member' ? (
      <MemberPortal 
        user={user}
        member={currentMember || null}
        members={members}
        events={events}
        objectives={objectives}
        onUpdateProfile={async (data) => {
          if (currentMember) {
            await updateMemberProfile(currentMember.id, data);
            logAction(user.username, 'Update Profile', `Updated member profile via portal`);
          }
        }}
        onLogout={handleLogout}
      />
    ) : (
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout}
        settings={settings}
        notifications={userNotifications}
        onMarkNotificationRead={markNotificationRead}
        onNavigate={(link) => {
          // Parse link and navigate
          // For simplicity we use activeTab and setSelectedItem if possible
          // Currently just sets the active tab
          setActiveTab(link);
        }}
      >
        {dataError && (
          <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
            <span className="flex-1">{dataError}</span>
            <button
              onClick={refetch}
              className="shrink-0 rounded bg-red-100 px-2 py-1 text-xs font-medium hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800"
            >
              Retry
            </button>
          </div>
        )}
        {activeTab === 'dashboard' && (
          <Dashboard
            members={members}
          objectives={objectives}
          expenses={expenses}
          events={events}
          bills={bills}
          tasks={tasks}
          auditLogs={auditLogs}
          associationId={user.associationId}
          setActiveTab={setActiveTab}
        />
      )}

      {activeTab === 'members' && (
        <Members
          members={members}
          membershipFeeConfig={membershipFeeConfig}
          settings={settings}
          objectives={objectives}
          canAdd={canAdd}
          canEdit={canEdit}
          canDelete={canDelete}
          onAddMember={() => { setSelectedItem(null); setModalType('member'); }}
          onImportMember={() => { setModalType('import-member'); }}
          onEditMember={(m) => { setSelectedItem(m); setModalType('member'); }}
          onViewDetails={(m) => { setSelectedItem(m); setModalType('member-details'); }}
          onAddPayment={(m) => { setSelectedItem(m); setModalType('payment'); }}
          onDeleteMember={(id) => {
            const member = members.find(m => m.id === id);
            setConfirmConfig({
              isOpen: true,
              title: t('confirmDeleteTitle'),
              message: `${t('confirmDeleteMessage')} (${member?.name})`,
              onConfirm: async () => {
                await deleteMember(id);
                logAction(user.username, 'Delete Member', `Deleted member: ${member?.name || id}`);
              }
            });
          }}
        />
      )}

      {activeTab === 'finance' && (
        <Finance 
          objectives={objectives}
          expenses={expenses}
          members={members}
          bills={bills}
          canAdd={canAdd}
          canEdit={canEdit}
          canDelete={canDelete}
          onAddObjective={() => { setSelectedItem(null); setModalType('objective'); }}
          onDeleteObjective={(id) => {
            const obj = objectives.find(o => o.id === id);
            setConfirmConfig({
              isOpen: true,
              title: t('confirmDeleteTitle'),
              message: `${t('confirmDeleteMessage')} (${obj?.name})`,
              onConfirm: async () => {
                await deleteObjective(id);
                logAction(user.username, 'Delete Objective', `Deleted objective: ${obj?.name || id}`);
              }
            });
          }}
          onViewObjective={(o) => { setSelectedItem(o); setModalType('objective-details'); }}
          onAddExpense={() => { setSelectedItem(null); setModalType('expense'); }}
          onImportExpense={() => { setModalType('import-expense'); }}
        />
      )}

      {activeTab === 'events' && (
        <Events 
          events={events}
          canAdd={canAdd}
          canEdit={canEdit}
          canDelete={canDelete}
          onAddEvent={() => { setSelectedItem(null); setModalType('event'); }}
          onImportEvent={() => { setModalType('import-event'); }}
          onEditEvent={(e) => { setSelectedItem(e); setModalType('event'); }}
          onViewEvent={(e) => { setSelectedItem(e); setModalType('event-details'); }}
          onDeleteEvent={(id) => {
            const event = events.find(e => e.id === id);
            setConfirmConfig({
              isOpen: true,
              title: t('confirmDeleteTitle'),
              message: `${t('confirmDeleteMessage')} (${event?.name})`,
              onConfirm: async () => {
                await deleteEvent(id);
                logAction(user.username, 'Delete Event', `Deleted event: ${event?.name || id}`);
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
              }
            });
          }}
        />
      )}

      {activeTab === 'bills' && (
        <Bills 
          bills={bills}
          canAdd={canAdd}
          canEdit={canEdit}
          canDelete={canDelete}
          onAddBill={async (b) => {
            await addBill(b);
            logAction(user.username, 'Add Bill', `Added bill: ${b.title} (${formatCurrency(b.amount)})`);
          }}
          onImportBill={() => { setModalType('import-bill'); }}
          onDeleteBill={(id) => {
            const bill = bills.find(b => b.id === id);
            setConfirmConfig({
              isOpen: true,
              title: t('confirmDeleteTitle'),
              message: `${t('confirmDeleteMessage')} (${bill?.title})`,
              onConfirm: async () => {
                await deleteBill(id);
                logAction(user.username, 'Delete Bill', `Deleted bill: ${bill?.title || id}`);
              }
            });
          }}
        />
      )}

      {activeTab === 'fundraising' && (
        <Fundraising
          campaigns={campaigns}
          donations={donations}
          associationId={user?.associationId || null}
          settings={settings}
          onAddCampaign={() => { setSelectedItem(null); setModalType('campaign'); }}
          onEditCampaign={(c) => { setSelectedItem(c); setModalType('campaign'); }}
          onDeleteCampaign={(id) => {
            const campaign = campaigns.find(c => c.id === id);
            setConfirmConfig({
              isOpen: true,
              title: t('confirmDeleteTitle'),
              message: `${t('confirmDeleteMessage')} (${campaign?.title})`,
              onConfirm: async () => {
                await deleteCampaign(id);
                logAction(user.username, 'Delete Campaign', `Deleted campaign: ${campaign?.title || id}`);
              }
            });
          }}
        />
      )}

      {activeTab === 'reports' && (
        <Reports 
          members={members}
          expenses={expenses}
          bills={bills}
          corrections={corrections}
          objectives={objectives}
          events={events}
          canAdd={canAdd}
          canEdit={canEdit}
          canDelete={canDelete}
          onEditYear={(year) => { setSelectedItem({ year }); setModalType('correction'); }}
        />
      )}

      {activeTab === 'tasks' && (
        <Tasks 
          tasks={tasks}
          canAdd={canAdd}
          canEdit={canEdit}
          canDelete={canDelete}
          onAddTask={() => { setSelectedItem(null); setModalType('task'); }}
          onImportTask={() => { setModalType('import-task'); }}
          onUpdateTask={(id, task) => { 
            if (Object.keys(task).length === 0) {
              setSelectedItem(tasks.find(t => t.id === id));
              setModalType('task');
            } else {
              updateTask(id, task);
            }
          }}
          onDeleteTask={(id) => {
            const task = tasks.find(t => t.id === id);
            setConfirmConfig({
              isOpen: true,
              title: t('confirmDeleteTitle'),
              message: `${t('confirmDeleteMessage')} (${task?.title})`,
              onConfirm: async () => {
                await deleteTask(id);
                logAction(user.username, 'Delete Task', `Deleted task: ${task?.title || id}`);
              }
            });
          }}
          onReorderTasks={reorderTasks}
        />
      )}

      {activeTab === 'users' && (
        <div className="space-y-12">
          {(isSuperAdmin || user.role === 'admin') && (
            <Users 
              users={users}
              currentUser={user}
              onAddUser={() => { setSelectedItem(null); setModalType('user'); }}
              onEditUser={(u) => { setSelectedItem(u); setModalType('user'); }}
              onDeleteUser={(username) => {
                setConfirmConfig({
                  isOpen: true,
                  title: t('confirmDeleteTitle'),
                  message: `${t('confirmDeleteMessage')} (${username})`,
                  onConfirm: async () => {
                    await deleteUser(username);
                    logAction(user.username, 'Delete User', `Deleted user: ${username}`);
                  }
                });
              }}
            />
          )}
          
          {(isSuperAdmin || user.role === 'admin' || user.role === 'treasury') && (
            <Settings 
              settings={settings}
              membershipFeeConfig={membershipFeeConfig}
              onUpdateSetting={async (key, value) => {
                await updateSetting(key, value);
                logAction(user.username, 'Update Setting', `Updated ${key}`);
              }}
              onUpdateFeeConfig={async (config) => {
                await updateMembershipFeeConfig(config);
                logAction(user.username, 'Update Fee Config', 'Updated membership fee configuration');
              }}
            />
          )}
        </div>
      )}

      {activeTab === 'audit' && canViewAudit && (
        <Audit logs={auditLogs} />
      )}

      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={t('confirm')}
        cancelLabel={t('cancel')}
      />

      {/* Modals */}
      <ImportModal 
        isOpen={!!modalType && modalType.toString().startsWith('import-')}
        type={modalType?.toString().replace('import-', '') as any}
        onClose={() => setModalType(null)}
        onImport={async (data) => {
          const type = modalType?.toString().replace('import-', '');
          if (type === 'member') await bulkAddMembers(data);
          else if (type === 'expense') await bulkAddExpenses(data);
          else if (type === 'event') await bulkAddEvents(data);
          else if (type === 'bill') await bulkAddBills(data);
          else if (type === 'task') await bulkAddTasks(data);
          logAction(user.username, 'Bulk Import', `Imported ${data.length} ${type}s from file`);
          setModalType(null);
        }}
      />

      <MemberModals 
        type={modalType} 
        item={selectedItem} 
        membershipFeeConfig={membershipFeeConfig}
        uploadFile={uploadFile}
        onClose={() => setModalType(null)}
        onSave={async (data) => {
          if (modalType === 'member') {
            const fullName = `${data.firstName} ${data.lastName}`;
            if (selectedItem) {
              await updateMember(selectedItem.id, data);
              logAction(user.username, 'Edit Member', `Edited member: ${fullName}`);
            } else {
              await addMember(data);
              logAction(user.username, 'Add Member', `Added member: ${fullName}`);
            }
          } else if (modalType === 'payment') {
            await addPayment(selectedItem.id, data);
            logAction(user.username, 'Add Payment', `Added payment of ${formatCurrency(data.amount)} for member: ${selectedItem.firstName} ${selectedItem.lastName}`);
          } else if (modalType === 'objective') {
            await addObjective(data);
            logAction(user.username, 'Add Objective', `Added objective: ${data.name}`);
          } else if (modalType === 'expense') {
            await addExpense(data);
            logAction(user.username, 'Add Expense', `Recorded expense: ${data.desc} (${formatCurrency(data.amount)})`);
          } else if (modalType === 'event') {
            if (selectedItem) {
              await updateEvent(selectedItem.id, data);
              logAction(user.username, 'Edit Event', `Edited event: ${data.name}`);
            } else {
              await addEvent(data);
              logAction(user.username, 'Add Event', `Added event: ${data.name}`);
            }
          } else if (modalType === 'user') {
            const capitalizedUsername = data.username.charAt(0).toUpperCase() + data.username.slice(1);
            const userData = { ...data, username: capitalizedUsername };
            if (selectedItem) {
              await updateUser(selectedItem.username, userData);
              logAction(user.username, 'Edit User', `Edited user: ${userData.username}`);
            } else {
              await addUser(userData);
              logAction(user.username, 'Add User', `Added user: ${userData.username}`);
            }
          } else if (modalType === 'correction') {
            await upsertCorrection({ ...data, year: selectedItem.year });
            logAction(user.username, 'Update Correction', `Updated financial correction for year ${selectedItem.year}`);
          } else if (modalType === 'task') {
            if (selectedItem) {
              await updateTask(selectedItem.id, data);
              logAction(user.username, 'Edit Task', `Edited task: ${data.title}`);
            } else {
              await addTask(data);
              logAction(user.username, 'Add Task', `Added task: ${data.title}`);
            }
          } else if (modalType === 'campaign') {
            if (selectedItem) {
              await updateCampaign(selectedItem.id, data);
              logAction(user.username, 'Edit Campaign', `Edited campaign: ${data.title}`);
            } else {
              await addCampaign(data);
              logAction(user.username, 'Add Campaign', `Added campaign: ${data.title}`);
            }
          }
          setModalType(null);
        }}
        objectives={objectives}
        members={members}
        expenses={expenses}
      />
    </Layout>
    )
  ) : null;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/security" element={<Security />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/demo" element={<DemoApp />} />
      <Route path="/support" element={<Support />} />

      <Route path="/login" element={user ? <Navigate to={`/app/${user.associationId}`} /> : loginView} />
      <Route path="/donate/:associationId" element={<DonationPage />} />

      {/* Slug-based app routes */}
      <Route path="/app/:slug/invite/:token" element={<InvitePage />} />
      <Route path="/app/:slug/reset/:token" element={<ResetPasswordPage />} />
      <Route path="/app/:slug/reset" element={<ForgotPasswordPage />} />
      <Route path="/app/:slug" element={
        <SlugRoute
          user={user}
          sessionChecked={sessionChecked}
          loginData={loginData}
          setLoginData={setLoginData}
          loginError={loginError}
          setLoginError={setLoginError}
          handleLogin={handleLogin}
          isRegistering={isRegistering}
          setIsRegistering={setIsRegistering}
          regData={regData}
          setRegData={setRegData}
          handleRegister={handleRegister}
          authenticatedContent={authenticatedView}
          settings={settings}
          t={t}
        />
      } />
      <Route path="/app" element={<Navigate to="/login" replace />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// Sub-component for all modals to keep App.tsx clean
const MemberModals = ({ type, item, onClose, onSave, objectives, members, expenses, membershipFeeConfig, uploadFile }: any) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<any>({});
  const [isUploading, setIsUploading] = useState(false);

  const onDropReceipt = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && uploadFile) {
      setIsUploading(true);
      const file = acceptedFiles[0];
      const path = `${Date.now()}_${file.name}`;
      const url = await uploadFile('receipts', file, path);
      if (url) {
        setFormData((prev: any) => ({ ...prev, receiptUrl: url, receiptName: file.name }));
      }
      setIsUploading(false);
    }
  };

  const { getRootProps: getReceiptRootProps, getInputProps: getReceiptInputProps, isDragActive: isReceiptDragActive } = useDropzone({
    accept: { 'image/*': [], 'application/pdf': [] },
    onDrop: onDropReceipt
  });

  const getTargetFee = (gender: string, isMinor: boolean) => {
    if (!membershipFeeConfig) return 0;
    
    let baseFee = 0;
    if (!membershipFeeConfig.useCategories) {
      baseFee = membershipFeeConfig.amountAll;
    } else if (isMinor) {
      baseFee = membershipFeeConfig.amountMinor;
    } else if (gender === 'female') {
      baseFee = membershipFeeConfig.amountFemale;
    } else {
      baseFee = membershipFeeConfig.amountMale;
    }

    return membershipFeeConfig.period === 'monthly' ? baseFee * 12 : baseFee;
  };

  useEffect(() => {
    if (type === 'payment' && item) {
      setFormData({
        objectiveId: objectives.length > 0 ? objectives[0].id : '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'Cash'
      });
    } else if (type === 'expense' && !item) {
      setFormData({
        desc: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        objectiveId: ''
      });
    } else if (type === 'event' && !item) {
      setFormData({
        name: '',
        player: '',
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        place: '',
        description: '',
        participants: 0
      });
    } else if (type === 'member' && !item) {
      const gender = 'male';
      const isMinor = false;
      setFormData({
        firstName: '',
        lastName: '',
        tel: '',
        fee: getTargetFee(gender, isMinor),
        gender,
        isMinor,
        joinedDate: new Date().toISOString().split('T')[0],
        linkedMemberId: '',
        linkedPersonName: ''
      });
    } else if (type === 'objective' && !item) {
      setFormData({
        name: '',
        target: '',
        color: '#4F46E5',
        description: ''
      });
    } else if (type === 'task' && !item) {
      setFormData({
        title: '',
        status: 'todo',
        description: ''
      });
    } else if (type === 'campaign' && !item) {
      setFormData({
        title: '',
        goalAmount: '',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: ''
      });
    } else if (type === 'user' && !item) {
      setFormData({
        username: '',
        password: '',
        role: 'controller'
      });
    } else if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
  }, [item, type, objectives]);

  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'member':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('firstName')} required>
                <Input 
                  value={formData.firstName || ''} 
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder={t('firstNamePlaceholder') || 'First Name'}
                />
              </FormField>
              <FormField label={t('lastName')} required>
                <Input 
                  value={formData.lastName || ''} 
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder={t('lastNamePlaceholder') || 'Last Name'}
                />
              </FormField>
            </div>
            <FormField label={t('phoneNumber')} required>
              <Input 
                value={formData.tel || ''} 
                onChange={e => setFormData({ ...formData, tel: e.target.value })}
                placeholder={t('phonePlaceholder')}
              />
            </FormField>
            <FormField label={t('city')}>
              <Input 
                value={formData.city || ''} 
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder={t('cityPlaceholder')}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('gender')} required>
                <Select 
                  value={formData.gender || 'male'}
                  onChange={e => {
                    const newGender = e.target.value;
                    setFormData({ 
                      ...formData, 
                      gender: newGender,
                      fee: getTargetFee(newGender, formData.isMinor || false)
                    });
                  }}
                >
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                </Select>
              </FormField>
              <div className="flex items-center gap-2 pt-8">
                <input 
                  type="checkbox"
                  id="isMinor"
                  checked={formData.isMinor || false}
                  onChange={e => {
                    const newIsMinor = e.target.checked;
                    setFormData({ 
                      ...formData, 
                      isMinor: newIsMinor,
                      fee: getTargetFee(formData.gender || 'male', newIsMinor)
                    });
                  }}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="isMinor" className="text-sm font-medium text-slate-700">{t('isMinor')}</label>
              </div>
            </div>
            <FormField label={t('cotisationTarget')} required>
              <Input 
                type="number"
                value={isNaN(formData.fee) ? '' : (formData.fee ?? '')} 
                onChange={e => setFormData({ ...formData, fee: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                placeholder={t('amountPlaceholder')}
              />
            </FormField>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Linked Person / Relationship</h4>
              <div className="space-y-4">
                <FormField label="Linked Member (Existing)">
                  <Select 
                    value={formData.linkedMemberId || ''}
                    onChange={e => setFormData({ ...formData, linkedMemberId: e.target.value })}
                  >
                    <option value="">None</option>
                    {members.filter((m: any) => m.id !== item?.id).map((m: any) => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Linked Person Name (External)">
                  <Input 
                    value={formData.linkedPersonName || ''} 
                    onChange={e => setFormData({ ...formData, linkedPersonName: e.target.value })}
                    placeholder="e.g. Guardian, Spouse name"
                  />
                </FormField>
              </div>
            </div>
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-6">
            <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 mb-6">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">{t('member')}</p>
              <p className="text-xl font-serif font-bold text-slate-900">{item?.firstName} {item?.lastName}</p>
            </div>
            <FormField label={t('objectiveFund')} required>
              <Select 
                value={formData.objectiveId || 'default'}
                onChange={e => setFormData({ ...formData, objectiveId: e.target.value })}
              >
                {objectives.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </FormField>
            <FormField label={t('amount')} required>
              <Input 
                type="number"
                value={isNaN(formData.amount) ? '' : (formData.amount ?? '')} 
                onChange={e => setFormData({ ...formData, amount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                placeholder={t('amountPlaceholder')}
              />
            </FormField>
            <FormField label={t('date')} required>
              <Input 
                type="date"
                value={formData.date || new Date().toISOString().split('T')[0]} 
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </FormField>
            <FormField label={t('method')} required>
              <Select 
                value={formData.method || 'Cash'}
                onChange={e => setFormData({ ...formData, method: e.target.value })}
              >
                <option value="Cash">{t('cash')}</option>
                <option value="Bank Transfer">{t('bankTransfer')}</option>
                <option value="Check">{t('check')}</option>
                <option value="Other">{t('other')}</option>
              </Select>
            </FormField>
          </div>
        );
      case 'objective':
        return (
          <div className="space-y-4">
            <FormField label={t('objectiveName')} required>
              <Input 
                value={formData.name || ''} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('objNamePlaceholder')}
              />
            </FormField>
            <FormField label={t('targetAmount')} required>
              <Input 
                type="number"
                value={isNaN(formData.target) ? '' : (formData.target ?? '')} 
                onChange={e => setFormData({ ...formData, target: e.target.value === '' ? '' : parseFloat(e.target.value) })}
              />
            </FormField>
            <FormField label={t('colorTheme')}>
              <Input 
                type="color"
                value={formData.color || '#4F46E5'} 
                onChange={e => setFormData({ ...formData, color: e.target.value })}
                className="h-12 p-1 cursor-pointer"
              />
            </FormField>
            <FormField label={t('description')}>
              <Textarea 
                value={formData.description || ''} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('descPlaceholder')}
              />
            </FormField>
          </div>
        );
      case 'expense':
        const expenseCategories = [
          { value: 'Rent', label: t('rent') },
          { value: 'Utilities', label: t('utilities') },
          { value: 'Transportation', label: t('transportation') },
          { value: 'Maintenance', label: t('maintenance') },
          { value: 'License', label: t('license') },
          { value: 'Event Expense', label: t('eventexpense') },
          { value: 'Other', label: t('other') }
        ];

        const isOtherCategory = formData.category && !expenseCategories.some(c => c.value === formData.category);
        const currentCategory = isOtherCategory ? 'Other' : (formData.category || '');

        return (
          <div className="space-y-4">
            <FormField label={t('description')} required>
              <Input 
                value={formData.desc || ''} 
                onChange={e => setFormData({ ...formData, desc: e.target.value })}
                placeholder={t('expDescPlaceholder')}
              />
            </FormField>
            <FormField label={t('amount')} required>
              <Input 
                type="number"
                value={isNaN(formData.amount) ? '' : (formData.amount ?? '')} 
                onChange={e => setFormData({ ...formData, amount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
              />
            </FormField>
            <FormField label={t('category')} required>
              <Select 
                value={currentCategory}
                onChange={e => {
                  const val = e.target.value;
                  if (val === 'Other') {
                    setFormData({ ...formData, category: '' });
                  } else {
                    setFormData({ ...formData, category: val });
                  }
                }}
              >
                <option value="" disabled>{t('selectCategory') || 'Select Category'}</option>
                {expenseCategories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </FormField>
            {(currentCategory === 'Other' || isOtherCategory) && (
              <FormField label={t('customCategory') || 'Custom Category'} required>
                <Input 
                  value={formData.category || ''} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  placeholder={t('categoryPlaceholder')}
                />
              </FormField>
            )}
            <FormField label={t('linkedObjective')}>
              <Select 
                value={formData.objectiveId || ''}
                onChange={e => setFormData({ ...formData, objectiveId: e.target.value })}
              >
                <option value="">{t('generalNoObjective')}</option>
                {objectives.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </FormField>
            <FormField label={t('date')} required>
              <Input 
                type="date"
                value={formData.date || new Date().toISOString().split('T')[0]} 
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </FormField>
            <FormField label="Receipt / Attachment">
              <div 
                {...getReceiptRootProps()} 
                className={`w-full p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${
                  isReceiptDragActive ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300 hover:bg-slate-50'
                }`}
              >
                <input {...getReceiptInputProps()} />
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                    <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Uploading...</span>
                  </div>
                ) : formData.receiptUrl ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-medium text-sm">
                    <Paperclip className="w-5 h-5" />
                    {formData.receiptName || 'Receipt uploaded'}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                    <UploadCloud className="w-8 h-8 text-slate-400" />
                    <span className="text-sm font-medium">Drop a file here, or click to select</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">PDF, JPG, PNG</span>
                  </div>
                )}
              </div>
            </FormField>
          </div>
        );
      case 'event':
        return (
          <div className="space-y-4">
            <FormField label={t('eventName')} required>
              <Input 
                value={formData.name || ''} 
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </FormField>
            <FormField label={t('speakerPlayer')} required>
              <Input 
                value={formData.player || ''} 
                onChange={e => setFormData({ ...formData, player: e.target.value })}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('date')} required>
                <Input 
                  type="date"
                  value={formData.date || ''} 
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </FormField>
              <FormField label={t('time')} required>
                <Input 
                  type="time"
                  value={formData.time || ''} 
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                />
              </FormField>
            </div>
            <FormField label={t('location')} required>
              <Input 
                value={formData.place || ''} 
                onChange={e => setFormData({ ...formData, place: e.target.value })}
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label={t('participants')}>
                <Input 
                  type="number"
                  value={isNaN(formData.participants) ? '' : (formData.participants ?? '')} 
                  onChange={e => setFormData({ ...formData, participants: e.target.value === '' ? '' : parseInt(e.target.value) })}
                />
              </FormField>
            </div>
            <FormField label={t('description')}>
              <Textarea 
                value={formData.description || ''} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </FormField>
          </div>
        );
      case 'task':
        return (
          <div className="space-y-4">
            <FormField label={t('taskTitle')} required>
              <Input 
                value={formData.title || ''} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('taskTitle')}
              />
            </FormField>
            <FormField label={t('taskStatus')} required>
              <Select 
                value={formData.status || 'todo'}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="todo">{t('todo')}</option>
                <option value="in-progress">{t('inProgress')}</option>
                <option value="completed">{t('completed')}</option>
              </Select>
            </FormField>
            <FormField label={t('taskDescription')}>
              <Textarea 
                value={formData.description || ''} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('taskDescription')}
              />
            </FormField>
          </div>
        );
      case 'campaign':
        return (
          <div className="space-y-4">
            <FormField label="Campaign Title" required>
              <Input 
                value={formData.title || ''} 
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Campaign Title"
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Goal Amount" required>
                <Input 
                  type="number"
                  value={isNaN(formData.goalAmount) ? '' : (formData.goalAmount ?? '')} 
                  onChange={e => setFormData({ ...formData, goalAmount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                />
              </FormField>
              <FormField label="Status" required>
                <Select 
                  value={formData.status || 'active'}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="paused">Paused</option>
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Start Date">
                <Input 
                  type="date"
                  value={formData.startDate || ''} 
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                />
              </FormField>
              <FormField label="End Date">
                <Input 
                  type="date"
                  value={formData.endDate || ''} 
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                />
              </FormField>
            </div>
            <FormField label="Description" required>
              <Textarea 
                value={formData.description || ''} 
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the campaign"
              />
            </FormField>
          </div>
        );
      case 'user':
        return (
          <div className="space-y-4">
            <FormField label={t('username')} required>
              <Input 
                value={formData.username || ''} 
                onChange={e => setFormData({ ...formData, username: e.target.value })}
                disabled={!!item}
                placeholder={t('usernamePlaceholder')}
              />
            </FormField>
            <FormField label={t('role')} required>
              <Select 
                value={formData.role || 'controller'}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="superadmin">{t('superadmin')}</option>
                <option value="admin">{t('admin')}</option>
                <option value="treasury">{t('treasury')}</option>
                <option value="controller">{t('controller')}</option>
                <option value="member">Member Portal Access</option>
              </Select>
            </FormField>
            {formData.role === 'member' && (
              <FormField label="Link Member Profile">
                <Select 
                  value={formData.memberId || ''}
                  onChange={e => setFormData({ ...formData, memberId: e.target.value })}
                >
                  <option value="">No linked profile</option>
                  {members.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </Select>
              </FormField>
            )}
            <FormField label={t('password')} required={!item}>
              <Input 
                type="password"
                value={formData.password || ''} 
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder={item ? "Leave blank to keep current" : t('password')}
              />
            </FormField>
          </div>
        );
      case 'correction':
        return (
          <div className="space-y-6">
            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 mb-6 text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">{t('year')}</p>
              <p className="text-4xl font-serif font-bold text-slate-900">{item?.year}</p>
            </div>
            <FormField label={t('correctionAmount')} required>
              <Input 
                type="number"
                value={isNaN(formData.amount) ? '' : (formData.amount ?? '')} 
                onChange={e => setFormData({ ...formData, amount: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                placeholder={t('amountPlaceholder')}
              />
              <p className="text-[10px] text-slate-400 mt-2 font-medium italic">
                {t('correctionHelp')}
              </p>
            </FormField>
            <FormField label={t('reason')} required>
              <Input 
                value={formData.reason || ''} 
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                placeholder={t('correctionReasonPlaceholder')}
              />
            </FormField>
          </div>
        );
      case 'event-details':
        return (
          <div className="space-y-8">
            <div className="bg-brand-50/50 p-8 rounded-[2rem] border border-brand-100 space-y-4">
              <div className="flex items-center gap-3 text-brand-600 font-bold text-sm uppercase tracking-widest">
                <UserIcon className="w-5 h-5" />
                {item?.player}
              </div>
              <h4 className="text-3xl font-serif font-bold text-slate-900">{item?.name}</h4>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('date')}</p>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <CalendarIcon className="w-5 h-5 text-slate-300" />
                  {item?.date}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('time')}</p>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <Clock className="w-5 h-5 text-slate-300" />
                  {item?.time}
                </div>
              </div>
              <div className="col-span-2 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('location')}</p>
                <div className="flex items-center gap-2 text-slate-700 font-bold">
                  <MapPin className="w-5 h-5 text-slate-300" />
                  {item?.place}
                </div>
              </div>
              {item?.participants > 0 && (
                <div className="col-span-2 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('participants')}</p>
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <UsersIcon className="w-5 h-5 text-slate-300" />
                    {item?.participants}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('description')}</p>
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-slate-600 leading-relaxed whitespace-pre-wrap">
                {item?.description || t('noDescription')}
              </div>
            </div>
          </div>
        );
      case 'member-details':
        const totalPaid = item?.payments.reduce((sum: number, p: any) => sum + p.amount, 0);
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-end bg-brand-50/50 p-8 rounded-[2rem] border border-brand-100">
              <div>
                <p className="text-[10px] text-brand-600 uppercase font-bold tracking-widest mb-1">{t('totalContribution')}</p>
                <p className="text-4xl font-serif font-bold text-brand-900">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">{t('feeTarget')}</p>
                <p className="text-xl font-serif font-bold text-slate-700">{formatCurrency(item?.fee)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('paymentHistory')}</h4>
              <div className="space-y-3">
                {item?.payments.length > 0 ? (
                  item.payments.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center p-5 bg-white border border-slate-100 rounded-2xl hover:border-brand-200 hover:bg-brand-50/30 transition-all group">
                      <div>
                        <p className="text-lg font-serif font-bold text-slate-900">{objectives.find((o: any) => o.id === p.objectiveId)?.name}</p>
                        <p className="text-xs text-slate-400 font-medium">{p.date} • {p.method}</p>
                      </div>
                      <p className="text-lg font-serif font-bold text-emerald-600">{formatCurrency(p.amount)}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-12 text-slate-400 font-medium italic">{t('noPayments')}</p>
                )}
              </div>
            </div>
          </div>
        );
      case 'objective-details':
        const raised = [
          ...members.flatMap((m: any) => m.payments.filter((p: any) => p.objectiveId === item.id).map((p: any) => p.amount)),
          ...expenses.filter((e: any) => e.objectiveId === item.id).map((e: any) => -e.amount)
        ].reduce((sum: number, val: number) => sum + val, 0);
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{t('target')}</p>
                <p className="text-xl font-bold text-slate-900">{formatCurrency(item?.target)}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <p className="text-xs text-emerald-600 uppercase font-bold tracking-wider mb-1">{t('raised')}</p>
                <p className="text-xl font-bold text-emerald-900">{formatCurrency(raised)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{t('recentContributions')}</h4>
              <div className="space-y-2">
                {members.flatMap((m: any) => m.payments.filter((p: any) => p.objectiveId === item.id).map((p: any) => ({ ...p, memberName: m.name })))
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{p.memberName}</p>
                        <p className="text-xs text-slate-500">{p.date}</p>
                      </div>
                      <p className="font-bold text-emerald-600">+{formatCurrency(p.amount)}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const isViewOnly = type.includes('details');

  const getModalTitle = () => {
    switch (type) {
      case 'member': return item ? t('editMember') : t('newMember');
      case 'payment': return t('addPayment');
      case 'objective': return t('newObjective');
      case 'expense': return t('recordExpense');
      case 'event': return item ? t('editEvent') : t('newEvent');
      case 'campaign': return item ? 'Edit Campaign' : 'New Campaign';
      case 'task': return item ? t('editTask') : t('newTask');
      case 'user': return item ? t('editUser') : t('newUser');
      case 'correction': return t('yearlyFinancialReport');
      case 'member-details': return t('viewHistory');
      case 'objective-details': return t('viewDetails');
      case 'event-details': return t('viewDetails');
      default: return type.replace('-', ' ').toUpperCase();
    }
  };

  return (
    <Modal 
      isOpen={!!type && !type.toString().startsWith('import-')} 
      onClose={onClose} 
      title={getModalTitle()}
      footer={!isViewOnly && (
        <>
          <button onClick={onClose} className="px-6 py-2 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            {t('cancel')}
          </button>
          <button 
            onClick={() => {
              const sanitizedData = { ...formData };
              if (sanitizedData.fee === '' || isNaN(sanitizedData.fee)) sanitizedData.fee = 0;
              if (sanitizedData.amount === '' || isNaN(sanitizedData.amount)) sanitizedData.amount = 0;
              if (sanitizedData.target === '' || isNaN(sanitizedData.target)) sanitizedData.target = 0;
              if (sanitizedData.participants === '' || isNaN(sanitizedData.participants)) sanitizedData.participants = 0;
              onSave(sanitizedData);
            }}
            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
          >
            {t('saveChanges')}
          </button>
        </>
      )}
    >
      {renderContent()}
    </Modal>
  );
};

// ─── Slug-aware route: /app/:slug ────────────────────────────────────────────
interface SlugRouteProps {
  user: User | null;
  sessionChecked: boolean;
  loginData: { associationId: string; username: string; password: string };
  setLoginData: (d: any) => void;
  loginError: string;
  setLoginError: (e: string) => void;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  isRegistering: boolean;
  setIsRegistering: (v: boolean) => void;
  regData: any;
  setRegData: (d: any) => void;
  handleRegister: (e: React.FormEvent) => Promise<void>;
  authenticatedContent: React.ReactNode;
  settings: Record<string, string>;
  t: (key: any) => string;
}

function SlugRoute({
  user,
  sessionChecked,
  loginData,
  setLoginData,
  loginError,
  setLoginError,
  handleLogin,
  isRegistering,
  setIsRegistering,
  regData,
  setRegData,
  handleRegister,
  authenticatedContent,
  settings,
  t,
}: SlugRouteProps) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (slug && loginData.associationId !== slug) {
      setLoginData((prev: any) => ({ ...prev, associationId: slug }));
    }
  }, [slug]);

  if (!sessionChecked) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user && user.associationId === slug) {
    return <>{authenticatedContent}</>;
  }

  if (user && user.associationId !== slug) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-[2rem] card-shadow w-full max-w-sm border border-slate-100 text-center">
          <Shield className="w-10 h-10 text-brand-600 mx-auto mb-4" />
          <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Wrong Association</h2>
          <p className="text-sm text-slate-500 mb-6">
            You are logged in to <strong>{user.associationId}</strong>. This page belongs to <strong>{slug}</strong>.
          </p>
          <button
            onClick={() => navigate(`/app/${user.associationId}`)}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
          >
            Go to my association
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 transition-colors duration-300 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white p-8 rounded-[2rem] card-shadow w-full max-w-sm border border-slate-100 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50/50 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50/50 rounded-full -ml-16 -mb-16 blur-3xl" />

        <div className="flex flex-col items-center mb-6 relative z-10">
          <div className="bg-brand-600 p-3 rounded-xl mb-3 shadow-xl shadow-brand-100">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 text-center leading-tight">
            {isRegistering ? 'Register Association' : (settings.app_name || slug || 'Association')}
          </h2>
          <div className="h-1 w-10 bg-brand-600 rounded-full mt-2 mb-1.5" />
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
            {isRegistering ? 'Create your platform account' : `Sign in · ${slug}`}
          </p>
        </div>

        {!isRegistering ? (
          <form onSubmit={handleLogin} className="space-y-3 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('username')}</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-slate-700 font-medium text-sm"
                  placeholder={t('username')}
                  value={loginData.username}
                  onChange={e => setLoginData((prev: any) => ({ ...prev, username: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('password')}</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-slate-700 font-medium text-sm"
                  placeholder={t('password')}
                  value={loginData.password}
                  onChange={e => setLoginData((prev: any) => ({ ...prev, password: e.target.value }))}
                />
              </div>
            </div>

            {loginError && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-500 font-bold text-center uppercase tracking-wider"
              >
                {loginError}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-brand-100 active:scale-[0.98] text-xs uppercase tracking-[0.2em] mt-1"
            >
              {t('signIn')}
            </button>

            <div className="flex flex-col items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => { setLoginError(''); navigate(`/app/${slug}/reset`); }}
                className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-brand-600 transition-colors"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => { setLoginError(''); setIsRegistering(true); }}
                className="text-[10px] text-brand-600 font-bold uppercase tracking-widest hover:underline"
              >
                Register your association
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assoc ID</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                  placeholder="e.g. my-assoc"
                  value={regData.id}
                  onChange={e => setRegData((prev: any) => ({ ...prev, id: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Assoc Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                  placeholder="Association Name"
                  value={regData.name}
                  onChange={e => setRegData((prev: any) => ({ ...prev, name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Username</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                placeholder="Admin Username"
                value={regData.adminUsername}
                onChange={e => setRegData((prev: any) => ({ ...prev, adminUsername: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                placeholder="Admin Password"
                value={regData.adminPassword}
                onChange={e => setRegData((prev: any) => ({ ...prev, adminPassword: e.target.value }))}
              />
            </div>

            {loginError && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs text-red-500 font-bold text-center uppercase tracking-wider"
              >
                {loginError}
              </motion.p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-brand-100 text-xs uppercase tracking-[0.2em] mt-4"
            >
              Create Association
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setLoginError(''); setIsRegistering(false); }}
                className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-50 text-center relative z-10">
          <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">
            Authorized access only.<br />Contact administrator for support.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
