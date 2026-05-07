import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { insforge } from '../lib/insforge';
import { hashPassword } from '../lib/crypto';

export default function ResetPasswordPage() {
  const { slug, token } = useParams<{ slug: string; token: string }>();
  const navigate = useNavigate();

  const [resetRecord, setResetRecord] = useState<any>(null);
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'success'>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkToken() {
      const { data, error } = await insforge.database
        .from('password_resets')
        .select('*')
        .eq('token', token)
        .eq('association_id', slug)
        .eq('used', false)
        .maybeSingle();

      if (error || !data) { setStatus('invalid'); return; }

      const isExpired = new Date(data.expires_at) < new Date();
      if (isExpired) { setStatus('invalid'); return; }

      setResetRecord(data);
      setStatus('valid');
    }
    checkToken();
  }, [token, slug]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }

    setSubmitting(true);
    try {
      const hashedPassword = await hashPassword(password);

      const { error: updateError } = await insforge.database
        .from('users')
        .update({ password: hashedPassword })
        .eq('association_id', slug)
        .eq('username', resetRecord.username);

      if (updateError) throw updateError;

      await insforge.database
        .from('password_resets')
        .update({ used: true })
        .eq('token', token);

      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white p-10 rounded-[2rem] card-shadow w-full max-w-sm border border-slate-100"
      >
        {status === 'loading' && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-500">Validating reset link...</p>
          </div>
        )}

        {status === 'invalid' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Link Invalid or Expired</h2>
            <p className="text-sm text-slate-500 mb-6">This reset link has already been used or has expired. Generate a new one from the login page.</p>
            <button
              onClick={() => navigate(`/app/${slug}/reset`)}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all mb-3"
            >
              Request New Link
            </button>
            <button
              onClick={() => navigate(`/app/${slug}`)}
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-brand-600 transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <h2 className="text-xl font-serif font-bold text-slate-900 mb-2">Password Updated!</h2>
            <p className="text-sm text-slate-500 mb-6">Your password has been changed. You can now sign in with your new password.</p>
            <button
              onClick={() => navigate(`/app/${slug}`)}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'valid' && (
          <>
            <div className="flex flex-col items-center mb-6">
              <div className="bg-brand-600 p-3 rounded-xl mb-3 shadow-xl shadow-brand-100">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900">Set New Password</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                {resetRecord?.username} · {slug}
              </p>
            </div>

            <form onSubmit={handleReset} className="space-y-3">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                  <input
                    type="password"
                    required
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-slate-700 font-medium text-sm"
                    placeholder="New password"
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
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-bold text-center uppercase tracking-wider">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-brand-100 active:scale-[0.98] text-xs uppercase tracking-[0.2em] mt-1 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate(`/app/${slug}`)}
                  className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hover:text-brand-600 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
