import React from 'react';
import { motion } from 'motion/react';
import { Play, Calendar, Users, Shield } from 'lucide-react';
import MarketingLayout from './MarketingLayout';

const Demo: React.FC = () => {
  return (
    <MarketingLayout>
      <section className="pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20 items-center">
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-8 leading-tight">
                Experience the <br />
                <span className="text-brand-600 italic serif-display">future of management.</span>
              </h1>
              <p className="text-slate-500 text-xl leading-relaxed mb-12">
                See how SenNoflaay can transform your association. Request a 
                personalized walkthrough or start your 14-day free trial.
              </p>
              
              <div className="space-y-8">
                <DemoFeature 
                  icon={<Calendar className="w-6 h-6" />}
                  title="15-Minute Personal Tour"
                  desc="A dedicated expert will show you exactly how SenNoflaay fits your specific needs."
                />
                <DemoFeature 
                  icon={<Users className="w-6 h-6" />}
                  title="Interactive Demo Environment"
                  desc="Get access to a pre-populated sandbox to explore every feature at your own pace."
                />
                <DemoFeature 
                  icon={<Shield className="w-6 h-6" />}
                  title="Q&A Session"
                  desc="Get all your technical, security, and pricing questions answered in real-time."
                />
              </div>
            </motion.div>
          </div>

          <div className="flex-1 w-full max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-brand-100 border border-slate-100"
            >
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8">Request a Demo</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">First Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-500 outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Name</label>
                    <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-500 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Email</label>
                  <input type="email" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Association Name</label>
                  <input type="text" className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-500 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Approx. Members</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-brand-500 outline-none transition-all appearance-none">
                    <option>1-50 members</option>
                    <option>51-200 members</option>
                    <option>201-500 members</option>
                    <option>500+ members</option>
                  </select>
                </div>
                <button className="w-full bg-brand-600 text-white py-5 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all active:scale-95">
                  Send Demo Request
                </button>
              </form>
              <p className="mt-8 text-center text-xs text-slate-400">
                Prefer to dive right in? <span className="text-brand-600 font-bold cursor-pointer hover:underline">Start a free trial</span> instead.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

const DemoFeature = ({ icon, title, desc }: any) => (
  <div className="flex gap-6">
    <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 flex-shrink-0 shadow-sm shadow-brand-50">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Demo;
