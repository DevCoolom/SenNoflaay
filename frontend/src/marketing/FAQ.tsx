import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, Search } from 'lucide-react';
import MarketingLayout from './MarketingLayout';

const FAQ: React.FC = () => {
  const faqs = [
    {
      q: "What is an 'Association' in SenNoflaay?",
      a: "An association is your primary organization unit. It could be a sports club, a professional guild, a non-profit organization, or even a small hobbyist group. Each association has its own isolated database, settings, and users."
    },
    {
      q: "Is there a limit on the number of members?",
      a: "Our Starter plan supports up to 50 members. Both the Professional and Enterprise plans offer unlimited member accounts, allowing your organization to grow without worrying about hitting a ceiling."
    },
    {
      q: "How secure is my financial data?",
      a: "Extremely secure. All financial transactions are logged with an immutable audit trail. We use bank-grade encryption for all sensitive data and our infrastructure is monitored 24/7."
    },
    {
      q: "Can I import my existing data?",
      a: "Yes! We provide CSV import tools for member lists and financial history. Our Enterprise plan also includes assisted onboarding where our team helps you migrate your data from other platforms."
    },
    {
      q: "Do you offer a free trial?",
      a: "We offer a 14-day free trial of our Professional plan. Additionally, our Starter plan is free forever for organizations with fewer than 50 members."
    },
    {
      q: "Can members pay their dues online?",
      a: "Yes, the Member Portal allows members to view their outstanding fees and pay them securely via integrated payment gateways (available on Pro and Enterprise plans)."
    }
  ];

  return (
    <MarketingLayout>
      <section className="pt-48 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-24">
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              Common questions, <br />
              <span className="text-brand-600 italic serif-display">simple answers.</span>
            </h1>
            <p className="text-slate-500 text-xl leading-relaxed">
              Find answers to common questions about SenNoflaay. 
              Can't find what you're looking for? Reach out to our support team.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} q={faq.q} a={faq.a} />
            ))}
          </div>

          <div className="mt-32 p-12 bg-brand-50 rounded-[3rem] border border-brand-100 flex flex-col md:flex-row items-center justify-between gap-12">
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Still have questions?</h3>
              <p className="text-slate-500">We're here to help you get the most out of SenNoflaay.</p>
            </div>
            <button className="bg-brand-600 text-white px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

const FAQItem = ({ q, a }: { q: string, a: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`rounded-[2rem] border transition-all duration-300 ${
        isOpen ? 'border-brand-200 bg-white shadow-xl shadow-brand-50' : 'border-slate-100 bg-white hover:border-slate-200'
      }`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-8 flex items-center justify-between text-left"
      >
        <span className="text-lg font-bold text-slate-900">{q}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-brand-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
          {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 text-slate-500 leading-relaxed">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQ;
