import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Globe, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from '../components/Logo';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

const MarketingLayout: React.FC<MarketingLayoutProps> = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Security', path: '/security' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Support', path: '/support' },
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf7] font-sans selection:bg-brand-100 selection:text-brand-900">
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <Logo className="h-16" textColor="#0f172a" />
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path} 
                className={`text-sm font-bold uppercase tracking-widest transition-colors ${
                  location.pathname === link.path ? 'text-brand-600' : 'text-slate-400 hover:text-brand-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/login"
              className="hidden sm:block text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors px-4"
            >
              Sign In
            </Link>
            <Link 
              to="/demo"
              className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-100 active:scale-95"
            >
              Start free trial
            </Link>
            <button 
              className="md:hidden text-slate-900"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-lg font-serif font-bold text-slate-900"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link 
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-serif font-bold text-slate-900 border-t pt-6"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <Logo className="h-24" textColor="#ffffff" />
              </div>
              <p className="text-slate-400 max-w-sm text-lg leading-relaxed mb-8">
                The all-in-one platform for modern association management. 
                Built to scale with your community.
              </p>
              <div className="flex gap-4">
                {/* Social icons placeholders */}
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 transition-colors cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-8">Product</h4>
              <ul className="space-y-4">
                <li><Link to="/features" className="text-slate-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/security" className="text-slate-400 hover:text-white transition-colors">Security</Link></li>
                <li><Link to="/demo" className="text-slate-400 hover:text-white transition-colors">Request Demo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-bold text-white uppercase tracking-[0.2em] mb-8">Resources</h4>
              <ul className="space-y-4">
                <li><Link to="/faq" className="text-slate-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/support" className="text-slate-400 hover:text-white transition-colors">Support & Docs</Link></li>
                <li><Link to="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-slate-800">
            <p className="text-sm text-slate-500">© 2026 SenNoflaay Inc. All rights reserved.</p>
            <div className="flex items-center gap-8 mt-8 md:mt-0">
              <span className="text-sm text-slate-500 hover:text-white cursor-pointer transition-colors">Twitter</span>
              <span className="text-sm text-slate-500 hover:text-white cursor-pointer transition-colors">LinkedIn</span>
              <span className="text-sm text-slate-500 hover:text-white cursor-pointer transition-colors">GitHub</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLayout;
