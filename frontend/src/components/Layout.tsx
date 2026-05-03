import React, { useState } from 'react';
import { 
  Users, 
  Wallet, 
  Calendar, 
  FileText, 
  Settings, 
  BarChart3, 
  Receipt,
  LogOut,
  Globe,
  Key,
  Menu,
  X,
  ChevronDown,
  History,
  Sun,
  BookOpen,
  Heart,
  TrendingUp,
  CheckCircle2,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';
import { Language } from '../lib/translations';
import Logo from './Logo';
import NotificationBell from './NotificationBell';
import { AppNotification } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { username: string; role: string } | null;
  onLogout: () => void;
  settings?: Record<string, string>;
  notifications?: AppNotification[];
  onMarkNotificationRead?: (id: string) => void;
  onNavigate?: (link: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  settings,
  notifications = [],
  onMarkNotificationRead = () => {},
  onNavigate
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: t('dashboard') || 'Dashboard', icon: BarChart3 },
    { id: 'members', label: t('members') || 'Members', icon: Users },
    { id: 'finance', label: t('finance') || 'Finance', icon: Wallet },
    { id: 'fundraising', label: t('fundraising') || 'Fundraising', icon: Heart },
    { id: 'events', label: t('events') || 'Events', icon: Calendar },
    { id: 'bills', label: t('bills') || 'Bills', icon: Receipt },
    { id: 'reports', label: t('reports') || 'Reports', icon: BarChart3 },
    { id: 'tasks', label: t('tasks') || 'Tasks', icon: CheckCircle2 },
  ];

  if (user?.role === 'superadmin' || user?.role === 'admin' || user?.role === 'treasury') {
    tabs.push({ id: 'users', label: t('users') || 'Users', icon: Settings });
  }
  if (user?.role === 'superadmin') {
    tabs.push({ id: 'audit', label: t('audit') || 'Audit', icon: History });
  }

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf7] flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 sticky top-0 h-screen z-40">
        <div className="p-8 flex flex-col gap-4">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="h-12 w-auto object-contain self-start" />
          ) : (
            <Logo className="h-12" textColor="#0f172a" />
          )}
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all group",
                activeTab === tab.id
                  ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                  : "text-slate-500 hover:text-brand-700 hover:bg-brand-50/50"
              )}
            >
              <tab.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-white" : "text-slate-400")} />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all uppercase tracking-widest"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language}</span>
              </button>

              <AnimatePresence>
                {isLangMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLangMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full left-0 mb-2 w-32 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden card-shadow"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-xs font-medium transition-colors",
                            language === lang.code 
                              ? "bg-brand-50 text-brand-700" 
                              : "text-slate-600 hover:bg-brand-50/50"
                          )}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative">
              <NotificationBell 
                notifications={notifications}
                onMarkRead={onMarkNotificationRead}
                onNavigate={onNavigate}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-brand-50/30 rounded-2xl border border-brand-100/50">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-brand-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{user?.username}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{user?.role} • ID: {user?.associationId}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
              title={t('logout')}
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-5 w-auto object-contain" />
            ) : (
              <Logo className="h-5" textColor="#0f172a" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <NotificationBell 
              notifications={notifications}
              onMarkRead={onMarkNotificationRead}
              onNavigate={onNavigate}
            />
            <button 
              className="p-2 text-slate-400 hover:text-brand-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-50 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-8 space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                      activeTab === tab.id
                        ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                        : "text-slate-600 hover:bg-brand-50/50"
                    )}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
                <div className="pt-6 mt-6 border-t border-slate-100 flex justify-between items-center px-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-900">{user?.username}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{user?.role} • ID: {user?.associationId}</span>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="bg-white/50 border-t border-slate-100 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              &copy; {new Date().getFullYear()} {settings?.app_name || 'SenNoflaay'}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
