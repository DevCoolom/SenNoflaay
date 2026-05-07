import React, { useState } from 'react';
import {
  Shield,
  UserPlus,
  Trash2,
  Pencil,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Link as LinkIcon,
  Copy,
  CheckCircle2,
  X
} from 'lucide-react';
import { User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { cn } from '../lib/utils';
import { insforge } from '../lib/insforge';

interface UsersProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (username: string) => void;
  currentUser: User | null;
}

function generateToken(): string {
  const array = new Uint8Array(24);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

const Users: React.FC<UsersProps> = ({ users, onAddUser, onEditUser, onDeleteUser, currentUser }) => {
  const { t } = useLanguage();
  const [inviteModal, setInviteModal] = useState(false);
  const [inviteRole, setInviteRole] = useState<User['role']>('controller');
  const [inviteLink, setInviteLink] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateInvite = async () => {
    setGenerating(true);
    try {
      const token = generateToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

      await insforge.database.from('invites').insert({
        token,
        association_id: currentUser?.associationId,
        role: inviteRole,
        expires_at: expiresAt,
        used: false,
      });

      const link = `${window.location.origin}/app/${currentUser?.associationId}/invite/${token}`;
      setInviteLink(link);
    } finally {
      setGenerating(false);
    }
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const closeInviteModal = () => {
    setInviteModal(false);
    setInviteLink('');
    setCopied(false);
    setInviteRole('controller');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
        <h3 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
          <Shield className="w-6 h-6 text-brand-600" />
          {t('manageSystemUsers')}
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setInviteModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
          >
            <LinkIcon className="w-4 h-4" />
            Invite Link
          </button>
          <button
            onClick={onAddUser}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            {t('newUser')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('username')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('role')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.username} className="hover:bg-brand-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                        <UserIcon className="w-5 h-5" />
                      </div>
                      <span className="font-serif font-bold text-lg text-slate-900">
                        {user.username}
                        {currentUser?.username === user.username && (
                          <span className="ml-3 text-[10px] bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full uppercase font-bold tracking-widest">{t('you')}</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      user.role === 'superadmin' ? "bg-purple-50 text-purple-700" :
                      user.role === 'admin' ? "bg-blue-50 text-blue-700" :
                      "bg-slate-50 text-slate-600"
                    )}>
                      {user.role === 'superadmin' ? <ShieldCheck className="w-3.5 h-3.5" /> :
                       user.role === 'admin' ? <ShieldAlert className="w-3.5 h-3.5" /> :
                       <Eye className="w-3.5 h-3.5" />}
                      {t(user.role as any)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-1">
                      {(currentUser?.role === 'superadmin' || (currentUser?.role === 'admin' && user.role !== 'superadmin')) && (
                        <button
                          onClick={() => onEditUser(user)}
                          className="p-2.5 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                          title={t('editUser')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {user.username !== currentUser?.username && (currentUser?.role === 'superadmin' || (currentUser?.role === 'admin' && user.role !== 'superadmin')) && (
                        <button
                          onClick={() => onDeleteUser(user.username)}
                          className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title={t('deleteUser')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Link Modal */}
      <AnimatePresence>
        {inviteModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-md card-shadow border border-slate-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-serif font-bold text-slate-900">Generate Invite Link</h3>
                <button onClick={closeInviteModal} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {!inviteLink ? (
                <div className="space-y-6">
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Generate a one-time invite link. The recipient opens it to create their own account with the selected role. Expires in 7 days.
                  </p>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Role for new user</label>
                    <select
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value as User['role'])}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium text-slate-700"
                    >
                      <option value="admin">Admin</option>
                      <option value="treasury">Treasury</option>
                      <option value="controller">Controller</option>
                      <option value="member">Member Portal</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerateInvite}
                    disabled={generating}
                    className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {generating ? 'Generating...' : 'Generate Invite Link'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">Invite link ready!</span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Share this link with the person you want to invite. They'll choose their own username and password. Role: <strong className="text-slate-700">{inviteRole}</strong>
                  </p>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-[10px] text-slate-500 break-all leading-relaxed font-mono">{inviteLink}</p>
                  </div>

                  <button
                    onClick={copyInviteLink}
                    className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>

                  <button
                    onClick={closeInviteModal}
                    className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

export default Users;
