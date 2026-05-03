import React from 'react';
import { History, Search, Clock, User as UserIcon, Activity } from 'lucide-react';
import { AuditLog } from '../types';
import { useLanguage } from '../lib/LanguageContext';

interface AuditProps {
  logs: AuditLog[];
}

const Audit: React.FC<AuditProps> = ({ logs }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredLogs = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return logs || [];

    return (logs || []).filter((log) => {
      const user = (log.user || '').toString().toLowerCase();
      const action = (log.action || '').toString().toLowerCase();
      const details = (log.details || '').toString().toLowerCase();

      return (
        user.includes(normalizedSearch) ||
        action.includes(normalizedSearch) ||
        details.includes(normalizedSearch)
      );
    });
  }, [logs, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
        <h3 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
          <History className="w-6 h-6 text-brand-600" />
          {t('auditLogs')}
        </h3>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input
            type="text"
            placeholder={t('searchLogs')}
            className="w-full pl-11 pr-5 py-3 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none text-sm font-medium transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    {t('dateTime')}
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5" />
                    {t('user')}
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <div className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" />
                    {t('action')}
                  </div>
                </th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-50/30 transition-colors group">
                    <td className="px-8 py-5 text-xs text-slate-400 font-medium whitespace-nowrap">
                      {isNaN(new Date(log.timestamp).getTime()) ? (t('invalidDate') || 'Invalid Date') : new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-widest group-hover:bg-brand-50 group-hover:text-brand-700 transition-colors">
                        {log.user || (t('unknownUser') || 'Unknown User')}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-900">
                      {log.action}
                    </td>
                    <td className="px-8 py-5 text-sm text-slate-500 font-medium">
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    {t('noLogsFound')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Audit;
