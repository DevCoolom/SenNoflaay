import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  PieChart, 
  Calendar, 
  MessageSquare, 
  Globe, 
  Heart, 
  BarChart3, 
  ShieldCheck, 
  CheckSquare,
  ArrowRight
} from 'lucide-react';
import MarketingLayout from './MarketingLayout';
import eventsCalendarImg from '../assets/images/events-calendar.png';

const Features: React.FC = () => {
  const features = [
    {
      id: 'members',
      icon: <Users className="w-12 h-12" />,
      title: 'Member Management',
      description: 'The heartbeat of your association. Manage every member detail with ease, from application to alumni status.',
      points: [
        'Custom member profiles and fields',
        'Automated renewal reminders',
        'Digital membership cards',
        'Group and family memberships'
      ],
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2532&auto=format&fit=crop'
    },
    {
      id: 'accounting',
      icon: <PieChart className="w-12 h-12" />,
      title: 'Advanced Accounting',
      description: 'Built for treasurers, not just accountants. Track every cent with precision and transparency.',
      points: [
        'Automated dues collection',
        'Expense tracking with receipt uploads',
        'Bank reconciliation',
        'Audit-ready financial logs'
      ],
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=2511&auto=format&fit=crop'
    },
    {
      id: 'events',
      icon: <Calendar className="w-12 h-12" />,
      title: 'Events & Calendar',
      description: 'Host memorable gatherings without the logistical headache. Manage everything in one shared calendar.',
      points: [
        'Online event registration',
        'Ticket sales and QR check-in',
        'Venue and resource management',
        'Automated calendar sync'
      ],
      image: eventsCalendarImg
    },
    {
      id: 'portal',
      icon: <Globe className="w-12 h-12" />,
      title: 'Member Portal',
      description: 'Empower your members with a private, branded dashboard to manage their own involvement.',
      points: [
        'Self-service profile updates',
        'Online dues and fee payments',
        'Private member directory',
        'Exclusive content and resources'
      ],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop'
    },
    {
      id: 'tasks',
      icon: <CheckSquare className="w-12 h-12" />,
      title: 'Tasks & Workflow',
      description: 'Never let a deadline slip. Organize projects and volunteer tasks with intuitive Kanban boards.',
      points: [
        'Role-based task assignment',
        'Progress tracking and deadlines',
        'Automated task reminders',
        'Volunteer coordination tools'
      ],
      image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?q=80&w=2544&auto=format&fit=crop'
    }
  ];

  return (
    <MarketingLayout>
      {/* Header */}
      <section className="pt-32 pb-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              Powerful tools for <br />
              <span className="text-brand-600 italic serif-display">modern associations.</span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed">
              Every feature is built with the unique needs of clubs, non-profits, 
              and professional organizations in mind.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature Sections */}
      {features.map((feature, index) => (
        <section key={feature.id} className={`py-12 px-6 ${index % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'}`}>
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className={`flex-1 ${index % 2 !== 0 ? 'lg:order-2' : ''}`}>
              <div className="w-20 h-20 bg-brand-600 rounded-[2rem] flex items-center justify-center text-white mb-10 shadow-xl shadow-brand-100">
                {feature.icon}
              </div>
              <h2 className="text-3xl font-serif font-bold text-slate-900 mb-8">{feature.title}</h2>
              <p className="text-slate-500 text-base mb-10 leading-relaxed">{feature.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                {feature.points.map((point, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="w-3 h-3 text-brand-600" />
                    </div>
                    <span className="text-slate-700 font-medium text-sm">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`flex-1 ${index % 2 !== 0 ? 'lg:order-1' : ''}`}>
              <motion.div
                initial={{ opacity: 0, x: index % 2 === 0 ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="relative"
              >
                <img 
                  src={feature.image} 
                  alt={feature.title} 
                  className="rounded-[3rem] shadow-2xl border border-slate-100"
                />
                <div className={`absolute -bottom-10 ${index % 2 === 0 ? '-left-10' : '-right-10'} w-40 h-40 bg-brand-600/10 rounded-full blur-3xl -z-10`} />
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* Grid Features (Additional ones) */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">And so much more.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <SmallFeatureCard 
              icon={<MessageSquare className="w-6 h-6" />}
              title="Communication"
              desc="Built-in email and notification tools to keep everyone informed."
            />
            <SmallFeatureCard 
              icon={<Heart className="w-6 h-6" />}
              title="Fundraising"
              desc="Manage campaigns and track donations with zero friction."
            />
            <SmallFeatureCard 
              icon={<BarChart3 className="w-6 h-6" />}
              title="Reports"
              desc="Beautiful, actionable data visualizations for your board."
            />
            <SmallFeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Security"
              desc="Enterprise-grade protection for your most sensitive data."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-6 bg-brand-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-10">See these tools in action.</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="bg-white text-brand-600 px-10 py-5 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-brand-50 transition-all">
              Request a Personal Demo
            </button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

const SmallFeatureCard = ({ icon, title, desc }: any) => (
  <div className="flex flex-col items-start gap-6">
    <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
      {icon}
    </div>
    <div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Features;
