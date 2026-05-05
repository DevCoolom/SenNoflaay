import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Users, 
  PieChart, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  User as UserIcon,
  ChevronRight,
  Star,
  Zap,
  Globe
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext';

interface LandingPageProps {
  onLogin: (e: React.FormEvent) => Promise<void>;
  onRegister: (e: React.FormEvent) => Promise<void>;
  loginError: string;
  isRegistering: boolean;
  setIsRegistering: (val: boolean) => void;
  loginData: any;
  setLoginData: (val: any) => void;
  regData: any;
  setRegData: (val: any) => void;
  appName: string;
}

const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  onRegister,
  loginError,
  isRegistering,
  setIsRegistering,
  loginData,
  setLoginData,
  regData,
  setRegData,
  appName
}) => {
  const { t } = useLanguage();
  const [view, setView] = useState<'landing' | 'login' | 'register'>('landing');

  const plans = [
    {
      name: t('planStarterName'),
      price: '$0',
      description: t('planStarterDesc'),
      features: ['Up to 50 members', 'Basic financial tracking', 'Event management', 'Email support'],
      cta: t('planStarterCta'),
      popular: false
    },
    {
      name: t('planProfessionalName'),
      price: '$29',
      description: t('planProfessionalDesc'),
      features: ['Unlimited members', 'Advanced financial reports', 'PDF bill management', 'Fundraising campaigns', 'Priority support'],
      cta: t('planProfessionalCta'),
      popular: true
    },
    {
      name: t('planEnterpriseName'),
      price: '$99',
      description: t('planEnterpriseDesc'),
      features: ['Everything in Professional', 'Custom integrations', 'Advanced analytics', 'Dedicated support', 'SLA guarantee'],
      cta: t('planEnterpriseCta'),
      popular: false
    }
  ];

  const handleDemo = () => {
    setLoginData({ username: 'demo', password: 'demo' });
    // In a real app, this would trigger a specific demo login
    // For now, we'll just set the data and the user can click sign in
    // or we can auto-trigger if we want.
    setView('login');
  };

  if (view === 'login' || view === 'register') {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center p-6 font-sans relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-100/30 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/20 rounded-full blur-[120px]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 md:p-14 rounded-[3rem] card-shadow w-full max-w-xl border border-slate-100 relative z-10"
        >
          <button
            onClick={() => setView('landing')}
            className="absolute top-8 left-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors flex items-center gap-2"
          >
            {t('backToHome')}
          </button>

          <div className="flex flex-col items-center mb-10">
            <div className="bg-brand-600 p-5 rounded-[1.5rem] mb-6 shadow-xl shadow-brand-100">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-4xl font-serif font-bold text-slate-900 text-center leading-tight mb-2">
              {view === 'register' ? t('joinTheCommunity') : appName}
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              {view === 'register' ? t('createAssocAccount') : t('welcomeBackDashboard')}
            </p>
          </div>

          {view === 'login' ? (
            <form onSubmit={onLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('username')}</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-slate-700 font-medium"
                    placeholder={t('enterYourUsername')}
                    value={loginData.username}
                    onChange={e => setLoginData({ ...loginData, username: e.target.value })}
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
                    className="w-full pl-12 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-slate-700 font-medium"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                  />
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-red-500 font-bold text-center uppercase tracking-wider">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-5 rounded-2xl transition-all shadow-xl shadow-brand-100 active:scale-[0.98] text-xs uppercase tracking-[0.2em]"
              >
                {t('signIn')}
              </button>

              <div className="text-center pt-4">
                <p className="text-xs text-slate-400 font-medium">
                  {t('dontHaveAccount')}{' '}
                  <button
                    type="button"
                    onClick={() => setView('register')}
                    className="text-brand-600 font-bold hover:underline"
                  >
                    {t('registerNow')}
                  </button>
                </p>
              </div>
            </form>
          ) : (
            <form onSubmit={onRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('assocId')}</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                    placeholder={t('assocIdPlaceholder')}
                    value={regData.id}
                    onChange={e => setRegData({ ...regData, id: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('assocName')}</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                    placeholder={t('fullName')}
                    value={regData.name}
                    onChange={e => setRegData({ ...regData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('adminUsername')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                  placeholder={t('adminUsernamePlaceholder')}
                  value={regData.adminUsername}
                  onChange={e => setRegData({ ...regData, adminUsername: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('adminPassword')}</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white outline-none transition-all text-sm"
                  placeholder="••••••••"
                  value={regData.adminPassword}
                  onChange={e => setRegData({ ...regData, adminPassword: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-100 active:scale-[0.98] text-xs uppercase tracking-widest mt-2"
              >
                {t('createAssociation')}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-brand-600 transition-colors"
                >
                  {t('alreadyHaveAccount')}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">{appName}</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">{t('navFeatures')}</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">{t('navPricing')}</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors">{t('navAbout')}</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('login')}
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors px-4"
            >
              {t('navLogin')}
            </button>
            <button
              onClick={() => setView('register')}
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md shadow-brand-100"
            >
              {t('navSignUp')}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-6xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-8">
                {t('heroTitle')}
              </h1>
              <p className="max-w-xl text-slate-500 text-lg md:text-xl mb-10 leading-relaxed">
                {t('heroSubtitle')}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 mb-12">
                <button
                  onClick={() => setView('register')}
                  className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-lg font-bold text-sm transition-all shadow-lg shadow-brand-100 flex items-center justify-center gap-2"
                >
                  {t('createClub')}
                </button>
                <button
                  onClick={handleDemo}
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center"
                >
                  {t('viewDemo')}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-slate-400">
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-brand-500" />
                  {t('featureMultiTenant')}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-brand-500" />
                  {t('featureRBAC')}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-brand-500" />
                  {t('featureBillPDF')}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative z-10 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8 border-b border-slate-50 pb-4">
                  <div className="flex gap-8">
                    <span className="text-sm font-medium text-slate-400">Login</span>
                    <span className="text-sm font-medium text-slate-900 border-b-2 border-brand-500 pb-4 -mb-4.5">Sign Up</span>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-slate-900">Welcome Back</h3>
                  <p className="text-sm text-slate-400">Enter your credentials to access your club dashboard.</p>
                  <div className="space-y-4">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input disabled className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm" placeholder="Email address" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input disabled className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm" placeholder="Password" />
                    </div>
                    <button disabled className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold text-sm">Sign In</button>
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-100/50 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">{t('featuresTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50/50 p-10 rounded-2xl border border-slate-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center mb-8">
                <Shield className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{t('feature1Title')}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t('feature1Desc')}</p>
            </div>

            <div className="bg-slate-50/50 p-10 rounded-2xl border border-slate-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center mb-8">
                <PieChart className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{t('feature2Title')}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t('feature2Desc')}</p>
            </div>

            <div className="bg-slate-50/50 p-10 rounded-2xl border border-slate-100 hover:shadow-xl transition-all">
              <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center mb-8">
                <Calendar className="w-6 h-6 text-brand-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{t('feature3Title')}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{t('feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">{t('pricingTitle')}</h2>
            <p className="text-slate-500">{t('pricingSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div 
                key={i}
                className={`p-10 rounded-2xl border-2 flex flex-col relative ${
                  plan.popular ? 'border-brand-500 shadow-2xl scale-105 z-10' : 'border-slate-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-600 text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    {t('mostPopular')}
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm">{plan.description}</p>
                </div>
                
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-400 text-sm">{t('perMonth')}</span>
                  </div>
                </div>
                
                <div className="space-y-4 mb-10 flex-grow">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-brand-500" />
                      {feature}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setView('register')}
                  className={`w-full py-3 rounded-lg font-bold text-sm transition-all ${
                    plan.popular 
                      ? 'bg-brand-600 hover:bg-brand-700 text-white' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-xs text-slate-400">{t('freeTrial')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-brand-600 p-2 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-serif font-bold tracking-tight">{appName}</span>
              </div>
              <p className="text-slate-400 max-w-xs leading-relaxed">
                {t('footerTagline')}
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-6">{t('footerPlatform')}</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-slate-400 hover:text-brand-600 transition-colors">{t('navFeatures')}</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-brand-600 transition-colors">{t('navPricing')}</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-brand-600 transition-colors">{t('footerSecurity')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-6">{t('footerCompany')}</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-sm text-slate-400 hover:text-brand-600 transition-colors">{t('footerAboutUs')}</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-brand-600 transition-colors">{t('footerContactUs')}</a></li>
                <li><a href="#" className="text-sm text-slate-400 hover:text-brand-600 transition-colors">{t('footerPrivacy')}</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-10 border-t border-slate-50">
            <p className="text-xs text-slate-400">© 2026 {appName}. {t('footerCopyright')}</p>
            <div className="flex items-center gap-6 mt-6 md:mt-0">
              <Globe className="w-4 h-4 text-slate-300" />
              <span className="text-xs text-slate-400">English (US)</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
