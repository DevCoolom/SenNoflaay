import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Shield, 
  Users, 
  PieChart, 
  Calendar, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Globe,
  FileText,
  Activity,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MarketingLayout from './MarketingLayout';

const Home: React.FC = () => {
  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-50/50 rounded-full blur-[120px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-emerald-50/30 rounded-full blur-[100px] -ml-20 -mb-20" />

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 border border-brand-100 mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest">Version 2.0 Now Live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 leading-[0.95] tracking-tight mb-8">
              Run your Association <br />
              <span className="text-brand-600 italic serif-display">with one platform.</span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-slate-500 text-lg md:text-xl mb-12 leading-relaxed">
              Manage members, accounting, events, fundraising, tasks and your member portal in one secure system. 
              Built for communities that demand excellence.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
              <Link
                to="/login?register=true"
                className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white px-10 py-5 rounded-[2rem] font-bold text-sm uppercase tracking-widest transition-all shadow-2xl shadow-brand-200 active:scale-95 flex items-center justify-center gap-2 group"
              >
                Start free trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/demo" 
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-10 py-5 rounded-[2rem] font-bold text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center"
              >
                View demo
              </Link>
            </div>

            {/* Dashboard Preview Mockup */}
            <div className="relative max-w-6xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1 }}
                className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden"
              >
                <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-4 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                    <div className="w-3 h-3 rounded-full bg-slate-200" />
                  </div>
                  <div className="flex-1 bg-white rounded-lg py-1.5 text-center text-[10px] text-slate-400 font-medium">app.sennoflaay.com/dashboard</div>
                </div>
                <div className="p-4 md:p-8">
                  <img 
                    src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop" 
                    alt="SenNoflaay Dashboard" 
                    className="w-full h-auto rounded-2xl shadow-sm"
                  />
                </div>
              </motion.div>
              {/* Decorative elements around mockup */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-100/50 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-emerald-100/50 rounded-full blur-3xl -z-10" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">Designed for every part of your operation.</h2>
            <p className="text-slate-500 text-base max-w-2xl mx-auto">From member onboarding to financial auditing, we've got you covered with specialized tools.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users className="w-8 h-8" />}
              title="Member Management"
              description="Keep detailed profiles, track status, and manage renewals automatically."
              delay={0.1}
            />
            <FeatureCard 
              icon={<PieChart className="w-8 h-8" />}
              title="Financial Controls"
              description="Full double-entry accounting designed specifically for non-profits and clubs."
              delay={0.2}
            />
            <FeatureCard 
              icon={<Calendar className="w-8 h-8" />}
              title="Event Coordination"
              description="Plan events, sell tickets, and manage attendance in one calendar view."
              delay={0.3}
            />
            <FeatureCard 
              icon={<Globe className="w-8 h-8" />}
              title="Member Portal"
              description="Give members a private space to update info and pay dues online."
              delay={0.4}
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8" />}
              title="Task Automation"
              description="Automate repetitive tasks and reminders so you can focus on growth."
              delay={0.5}
            />
            <FeatureCard 
              icon={<Shield className="w-8 h-8" />}
              title="Role-Based Security"
              description="Password hashing, role-based access control, and full audit logging for accountability."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Workflow Preview */}
      <section className="py-12 px-6 bg-slate-900 text-white rounded-[4rem] mx-4 my-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 leading-tight">A workflow that flows with you.</h2>
            <div className="space-y-8">
              <WorkflowStep 
                num="01" 
                title="Centralize Data" 
                desc="Import your existing member list and financial history in minutes." 
              />
              <WorkflowStep 
                num="02" 
                title="Delegate Power" 
                desc="Assign roles to staff and volunteers with granular permissions." 
              />
              <WorkflowStep 
                num="03" 
                title="Engage Community" 
                desc="Launch events and portal access to bring your members closer." 
              />
            </div>
          </div>
          <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[2.5rem] p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <span className="text-lg font-bold">Financial Summary</span>
                <span className="text-brand-400 font-mono">Q2 2026</span>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">Total Revenue</div>
                  <div className="text-2xl font-bold">$42,850</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">New Members</div>
                  <div className="text-2xl font-bold">+124</div>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-brand-600/20 border border-brand-600/30">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-5 h-5 text-brand-400" />
                  <span className="font-bold">Automated Audit Log</span>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">New payment verified</span>
                      <span className="text-slate-500 text-[10px]">2m ago</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Reassurance */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-brand-50 rounded-[3rem] p-12 md:p-20 flex flex-col md:flex-row items-center gap-16 border border-brand-100">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-brand-100 flex items-center justify-center flex-shrink-0">
              <Lock className="w-12 h-12 text-brand-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-6">Your data, protected by design.</h2>
              <p className="text-slate-500 text-base mb-8 max-w-2xl">
                We hash all passwords before storage, enforce role-based access control across 
                four permission levels, and maintain a comprehensive audit log of every action.
              </p>
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-widest">
                  <CheckCircle className="w-5 h-5 text-brand-600" />
                  Hashed Passwords
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-widest">
                  <CheckCircle className="w-5 h-5 text-brand-600" />
                  Role-Based Access
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 uppercase tracking-widest">
                  <CheckCircle className="w-5 h-5 text-brand-600" />
                  Full Audit Logging
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-16">Simple plans for every size.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <PricingTeaserCard title="Starter" price="$0" feat="Up to 50 members" />
            <PricingTeaserCard title="Pro" price="$29" feat="Unlimited members" popular />
            <PricingTeaserCard title="Elite" price="$99" feat="Custom branding" />
          </div>
          <Link to="/pricing" className="text-brand-600 font-bold uppercase tracking-widest hover:underline">View full pricing details →</Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-brand-600 rounded-[4rem] p-16 md:p-24 shadow-2xl shadow-brand-100 text-white relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-500 to-brand-700 -z-10" />
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-8">Ready to transform your association?</h2>
            <p className="text-brand-100 text-lg mb-12 max-w-2xl mx-auto">Join hundreds of successful clubs managing their community with SenNoflaay.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/demo" className="w-full sm:w-auto bg-white text-brand-600 px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all hover:bg-brand-50 shadow-xl active:scale-95">
                Get Started Free
              </Link>
              <Link to="/support" className="w-full sm:w-auto border border-brand-400 text-white px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all hover:bg-brand-500 active:scale-95">
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </MarketingLayout>
  );
};

const FeatureCard = ({ icon, title, description, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:shadow-2xl hover:shadow-brand-50 transition-all group"
  >
    <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-brand-600 transition-all">
      <div className="text-brand-600 group-hover:text-white transition-colors">
        {icon}
      </div>
    </div>
    <h3 className="text-xl font-serif font-bold text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const WorkflowStep = ({ num, title, desc }: any) => (
  <div className="flex gap-6">
    <span className="text-brand-600 font-serif font-bold text-xl">{num}</span>
    <div>
      <h4 className="text-xl font-bold mb-2">{title}</h4>
      <p className="text-slate-400">{desc}</p>
    </div>
  </div>
);

const PricingTeaserCard = ({ title, price, feat, popular }: any) => (
  <div className={`p-10 rounded-[2.5rem] border ${popular ? 'border-brand-600 bg-brand-50/50 ring-4 ring-brand-50' : 'border-slate-100 bg-white'}`}>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{title}</div>
    <div className="text-4xl font-bold mb-4">{price}<span className="text-sm font-normal text-slate-400">/mo</span></div>
    <div className="text-sm text-slate-500">{feat}</div>
  </div>
);

export default Home;
