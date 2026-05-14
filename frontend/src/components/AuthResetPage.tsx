import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/insforge';
import { Shield, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

type Mode = 'request' | 'set-new-password' | 'sent' | 'success' | 'error';

export default function AuthResetPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('code')) {
      supabase.auth.exchangeCodeForSession(window.location.search).then(({ error }) => {
        if (error) {
          setMode('error');
          setError(error.message);
        } else {
          setMode('set-new-password');
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setMode('set-new-password');
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    setMode('sent');
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) { setError(error.message); return; }
    setMode('success');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white p-10 rounded-[2rem] card-shadow w-full max-w-sm border border-slate-100"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand-600 p-3 rounded-xl mb-3 shadow-xl shadow-brand-100">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 text-center">
            {mode === 'set-new-password' || mode === 'success' ? 'Set New Password' : 'Reset Password'}
          </h2>
          <div className="h-1 w-10 bg-brand-600 rounded-full mt-2" />
        </div>

        {mode === 'request' && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <p className="text-xs text-slate-500 text-center">
              Enter your email and we'll send you a reset link.
            </p>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="email"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-slate-700 font-medium text-sm"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 font-bold text-center uppercase tracking-wider">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-brand-100 active:scale-[0.98] text-xs uppercase tracking-[0.2em] mt-1 disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => navigate(-1)} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:underline">
                Back to Login
              </button>
            </div>
          </form>
        )}

        {mode === 'sent' && (
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-brand-600" />
            </div>
            <p className="text-sm text-slate-500 mb-2">Check your inbox at</p>
            <p className="text-sm font-bold text-brand-600 mb-4">{email}</p>
            <p className="text-xs text-slate-400">Click the link in the email to set a new password. The link expires in 1 hour.</p>
            <button type="button" onClick={() => navigate('/login')} className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:underline">
              Back to Login
            </button>
          </div>
        )}

        {mode === 'set-new-password' && (
          <form onSubmit={handleSetNewPassword} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="password"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-slate-700 font-medium text-sm"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-slate-700 font-medium text-sm"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 font-bold text-center uppercase tracking-wider">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-brand-100 active:scale-[0.98] text-xs uppercase tracking-[0.2em] mt-1 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Set New Password'}
            </button>
          </form>
        )}

        {mode === 'success' && (
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-lg font-serif font-bold text-slate-900 mb-2">Password Updated</h3>
            <p className="text-sm text-slate-500 mb-6">Your password has been changed. Sign in with your new password.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
            >
              Go to Login
            </button>
          </div>
        )}

        {mode === 'error' && (
          <div className="text-center py-2">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-sm text-slate-500 mb-6">{error || 'The reset link is invalid or has expired.'}</p>
            <button
              onClick={() => { setError(''); setMode('request'); }}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
            >
              Request a New Link
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
