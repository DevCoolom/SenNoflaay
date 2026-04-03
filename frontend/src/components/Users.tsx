import React, { useState } from 'react';
import { 
  Shield, 
  UserPlus, 
  Trash2, 
  Pencil, 
  ShieldCheck, 
  ShieldAlert, 
  Eye 
} from 'lucide-react';
import { User } from '../types';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';

interface UsersProps {
  users: User[];
  onAddUser: () => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (username: string) => void;
  currentUser: User | null;
}

const Users: React.FC<UsersProps> = ({ users, onAddUser, onEditUser, onDeleteUser, currentUser }) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
        <h3 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
          <Shield className="w-6 h-6 text-brand-600" />
          {t('manageSystemUsers')}
        </h3>
        <button
          onClick={onAddUser}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          {t('newUser')}
        </button>
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
                      {/* Only superadmins can edit other superadmins. Admins can edit admins and viewers. */}
                      {(currentUser?.role === 'superadmin' || (currentUser?.role === 'admin' && user.role !== 'superadmin')) && (
                        <button
                          onClick={() => onEditUser(user)}
                          className="p-2.5 text-slate-300 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                          title={t('editUser')}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Cannot delete yourself. Only superadmins can delete anyone. Admins can delete admins and viewers. */}
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
    </div>
  );
};

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

import { cn } from '../lib/utils';

export default Users;
