import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Eye, FileLock2, Server, Cloud } from 'lucide-react';
import MarketingLayout from './MarketingLayout';

const Security: React.FC = () => {
  return (
    <MarketingLayout>
      <section className="pt-48 pb-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 mx-auto mb-10 shadow-xl shadow-brand-50">
              <Shield className="w-10 h-10" />
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              Trust and security <br />
              <span className="text-brand-600 italic serif-display">without compromise.</span>
            </h1>
            <p className="text-slate-500 text-xl leading-relaxed">
              We treat your association's data with the same care and protection 
              as a financial institution. Your security is our top priority.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <SecurityFeature 
              icon={<Lock className="w-10 h-10" />}
              title="Data Encryption"
              desc="All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Your member information and financial records are never stored in plain text."
            />
            <SecurityFeature 
              icon={<Eye className="w-10 h-10" />}
              title="Privacy by Design"
              desc="We follow strict GDPR and CCPA guidelines. We never sell your data, and we provide tools for you to easily manage data access and deletion requests."
            />
            <SecurityFeature 
              icon={<Server className="w-10 h-10" />}
              title="Infrastructure"
              desc="Our platform runs on enterprise-grade cloud providers with 99.9% uptime guarantees and physical security that meets industry standards."
            />
            <SecurityFeature 
              icon={<Cloud className="w-10 h-10" />}
              title="Regular Backups"
              desc="Your data is backed up every hour across multiple geographic regions to ensure that even in the case of a major disaster, your records are safe."
            />
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/20 rounded-full blur-[80px]" />
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-10">Role-Based Access Control (RBAC)</h2>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed">
              You have complete control over who sees what. Define granular permissions for 
              Superadmins, Admins, Treasurers, and Controllers to ensure that users only 
              access the data they need to do their jobs.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm font-bold text-brand-400 uppercase tracking-widest">
                <FileLock2 className="w-5 h-5" />
                Audit Logs for every action
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-brand-400 uppercase tracking-widest">
                <FileLock2 className="w-5 h-5" />
                Multi-factor authentication (MFA)
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-brand-400 uppercase tracking-widest">
                <FileLock2 className="w-5 h-5" />
                Session monitoring and management
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

const SecurityFeature = ({ icon, title, desc }: any) => (
  <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
    <div className="text-brand-600 mb-8">{icon}</div>
    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

export default Security;
