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
              Security built into <br />
              <span className="text-brand-600 italic serif-display">every layer.</span>
            </h1>
            <p className="text-slate-500 text-xl leading-relaxed">
              We take a layered approach to protecting your association's data — from 
              hashed passwords to strict role-based access and complete audit trails.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <SecurityFeature 
              icon={<Lock className="w-10 h-10" />}
              title="Password Hashing"
              desc="All passwords are hashed using SHA-256 with application-level salting before being stored. Passwords are never saved or transmitted in plain text."
            />
            <SecurityFeature 
              icon={<Eye className="w-10 h-10" />}
              title="Role-Based Access Control"
              desc="Four distinct permission levels — Superadmin, Admin, Treasurer, and Controller — ensure users only access the data relevant to their responsibilities."
            />
            <SecurityFeature 
              icon={<Server className="w-10 h-10" />}
              title="Comprehensive Audit Logging"
              desc="Every action in the system is logged with timestamps and user details, giving you full traceability and accountability for all changes."
            />
            <SecurityFeature 
              icon={<Cloud className="w-10 h-10" />}
              title="Secure Hosting"
              desc="Our platform runs on Insforge's managed infrastructure with TLS encryption for all data in transit between your browser and our servers."
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
              You have complete control over who sees what. Define permissions for 
              Superadmins, Admins, Treasurers, and Controllers to ensure that users only 
              access the data they need to do their jobs.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-sm font-bold text-brand-400 uppercase tracking-widest">
                <FileLock2 className="w-5 h-5" />
                Audit logs for every action
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-brand-400 uppercase tracking-widest">
                <FileLock2 className="w-5 h-5" />
                SHA-256 password hashing
              </div>
              <div className="flex items-center gap-4 text-sm font-bold text-brand-400 uppercase tracking-widest">
                <FileLock2 className="w-5 h-5" />
                Association-scoped data isolation
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
