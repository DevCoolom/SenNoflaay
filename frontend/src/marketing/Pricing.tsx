import React from 'react';
import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import MarketingLayout from './MarketingLayout';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => {
  const tiers = [
    {
      name: 'Starter',
      price: '$0',
      desc: 'Everything you need to get started with a small club.',
      features: [
        'Up to 50 members',
        'Basic member management',
        'Single association',
        'Manual bookkeeping',
        'Standard email support'
      ],
      notIncluded: [
        'Advanced accounting',
        'Member portal',
        'Custom branding',
        'Fundraising tools'
      ]
    },
    {
      name: 'Professional',
      price: '$29',
      desc: 'The sweet spot for growing associations and non-profits.',
      popular: true,
      features: [
        'Unlimited members',
        'Full financial suite',
        'Custom member portal',
        'Task management',
        'Fundraising & Events',
        'Priority email support'
      ],
      notIncluded: [
        'Dedicated account manager',
        'SSO integration',
        'White-label portal'
      ]
    },
    {
      name: 'Enterprise',
      price: '$99',
      desc: 'For large organizations needing scale and custom controls.',
      features: [
        'Everything in Professional',
        'SSO & SAML integration',
        'White-label member portal',
        'API access',
        'Audit & Compliance logs',
        'Dedicated support manager',
        'Onboarding assistance'
      ],
      notIncluded: []
    }
  ];

  return (
    <MarketingLayout>
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              Simple, transparent <br />
              <span className="text-brand-600 italic serif-display">pricing for all.</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
              No hidden fees. No complicated contracts. Just the tools you 
              need to grow your community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className={`relative p-10 rounded-[3rem] border ${
                  tier.popular 
                    ? 'border-brand-600 bg-white shadow-2xl shadow-brand-100 ring-4 ring-brand-50' 
                    : 'border-slate-100 bg-white'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-xl">
                    Most Popular
                  </div>
                )}
                
                <div className="mb-10">
                  <h3 className="text-xl font-serif font-bold text-slate-900 mb-2">{tier.name}</h3>
                  <p className="text-slate-400 text-xs">{tier.desc}</p>
                </div>

                <div className="mb-10 flex items-baseline gap-1">
                  <span className="text-6xl font-bold text-slate-900">{tier.price}</span>
                  <span className="text-slate-400 font-medium">/month</span>
                </div>

                <div className="space-y-6 mb-12">
                  {tier.features.map(feat => (
                    <div key={feat} className="flex items-center gap-4 text-sm font-medium text-slate-700">
                      <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-brand-600" />
                      </div>
                      {feat}
                    </div>
                  ))}
                  {tier.notIncluded.map(feat => (
                    <div key={feat} className="flex items-center gap-4 text-sm font-medium text-slate-300">
                      <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                        <X className="w-3 h-3 text-slate-300" />
                      </div>
                      {feat}
                    </div>
                  ))}
                </div>

                <Link
                  to="/login?register=true"
                  className={`block w-full py-5 rounded-2xl font-bold text-xs uppercase tracking-widest text-center transition-all ${
                    tier.popular
                      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-xl shadow-brand-100'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Get Started
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Pricing FAQ teaser */}
          <div className="mt-20 text-center">
            <h3 className="text-2xl font-serif font-bold text-slate-900 mb-8">Frequently asked questions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left max-w-4xl mx-auto">
              <div>
                <h4 className="font-bold text-slate-900 mb-4">Can I change plans later?</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-4">Do you offer discounts for non-profits?</h4>
                <p className="text-slate-500 text-sm leading-relaxed">Our Starter plan is free forever for small organizations. For larger non-profits, please contact our support team for specialized pricing.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Pricing;
