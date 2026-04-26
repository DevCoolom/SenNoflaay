import React from 'react';
import { motion } from 'motion/react';
import { Book, LifeBuoy, MessageCircle, FileText, Search, ArrowRight } from 'lucide-react';
import MarketingLayout from './MarketingLayout';

const Support: React.FC = () => {
  return (
    <MarketingLayout>
      <section className="pt-48 pb-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              We're here to help <br />
              <span className="text-brand-600 italic serif-display">you succeed.</span>
            </h1>
            <p className="text-slate-500 text-xl leading-relaxed mb-12">
              Whether you're just getting started or scaling a large association, 
              our resources and support team are available 24/7.
            </p>
            
            {/* Search bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
              <input 
                type="text" 
                placeholder="Search documentation, guides, and more..." 
                className="w-full pl-16 pr-8 py-6 rounded-[2rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-lg shadow-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-32 px-6 bg-slate-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SupportCard 
              icon={<Book className="w-8 h-8" />}
              title="Documentation"
              desc="Step-by-step guides on every feature, from member imports to financial reporting."
              linkText="Browse Docs"
            />
            <SupportCard 
              icon={<LifeBuoy className="w-8 h-8" />}
              title="Direct Support"
              desc="Chat with our expert support team. Average response time is under 15 minutes."
              linkText="Open a Ticket"
            />
            <SupportCard 
              icon={<MessageCircle className="w-8 h-8" />}
              title="Community"
              desc="Join our forum of association leaders to share best practices and tips."
              linkText="Join Forum"
            />
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-16">Popular Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <GuideLink title="Getting Started with Member Portals" category="Basics" />
            <GuideLink title="Advanced Financial Auditing in SenNoflaay" category="Accounting" />
            <GuideLink title="Setting up Role-Based Permissions" category="Security" />
            <GuideLink title="Automating your Yearly Membership Renewals" category="Automation" />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto bg-brand-600 rounded-[3rem] p-16 text-center text-white shadow-2xl shadow-brand-100">
          <h2 className="text-3xl font-serif font-bold mb-6">Need a custom solution?</h2>
          <p className="text-brand-100 text-lg mb-10">Our enterprise team specializes in custom integrations and migrations.</p>
          <button className="bg-white text-brand-600 px-10 py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-brand-50 transition-all">
            Talk to an Expert
          </button>
        </div>
      </section>
    </MarketingLayout>
  );
};

const SupportCard = ({ icon, title, desc, linkText }: any) => (
  <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 flex flex-col items-start hover:shadow-xl transition-all">
    <div className="text-brand-600 mb-8">{icon}</div>
    <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">{title}</h3>
    <p className="text-slate-500 mb-8 leading-relaxed">{desc}</p>
    <button className="flex items-center gap-2 text-brand-600 font-bold uppercase tracking-widest text-xs hover:gap-4 transition-all">
      {linkText} <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

const GuideLink = ({ title, category }: any) => (
  <div className="group flex items-center justify-between p-8 rounded-2xl border border-slate-50 hover:border-brand-100 hover:bg-brand-50/30 cursor-pointer transition-all">
    <div>
      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-2 block">{category}</span>
      <h4 className="text-xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{title}</h4>
    </div>
    <div className="w-10 h-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all">
      <ArrowRight className="w-5 h-5" />
    </div>
  </div>
);

export default Support;
