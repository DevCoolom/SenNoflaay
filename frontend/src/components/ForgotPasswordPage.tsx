import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Copy, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { insforge } from '../lib/insforge';

function generateToken(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function ForgotPasswordPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data: userRecord } = await insforge.database
        .from('users')
        .select('username')
        .eq('association_id', slug)
        .eq('username', username)
        .maybeSingle();

      if (!userRecord) {
        setError('No account found with that username.');
        setSubmitting(false);
        return;
      }

      const token = generateToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

      await insforge.database.from('password_resets').insert({
        token,
        association_id: slug,
        username,
        expires_at: expiresAt,
        used: false,
      });

      const link = `${window.location.origin}/app/${slug}/reset/${token}`;
      setResetLink(link);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <h2 className="text-2xl font-serif font-bold text-slate-900">Forgot Password</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            {slug} · Password Recovery
          </p>
        </div>

        {!resetLink ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              Enter your username. We'll generate a reset link you can use to set a new password.
            </p>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-brand-600 transition-colors" />
                <input
                  type="text"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-slate-700 font-medium text-sm"
                  placeholder="Your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 font-bold text-center uppercase tracking-wider">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all shadow-xl shadow-brand-100 active:scale-[0.98] text-xs uppercase tracking-[0.2em] disabled:opacity-50"
            >
              {submitting ? 'Generating...' : 'Generate Reset Link'}
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
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <p className="text-sm font-bold text-slate-900">Reset link generated!</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Copy this link and open it in your browser to set a new password. It expires in 24 hours.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-[10px] text-slate-500 break-all leading-relaxed font-mono">{resetLink}</p>
            </div>

            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-widest"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            <button
              onClick={() => window.location.href = resetLink}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-widest"
            >
              Open Link Now
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
          </div>
        )}
      </motion.div>
    </div>
  );
}
