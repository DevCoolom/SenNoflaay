import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar, FileText, Wallet, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppNotification } from '../types';
import { cn } from '../lib/utils';
import { useLanguage } from '../lib/LanguageContext';

interface NotificationBellProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onNavigate?: (link: string) => void;
}

const getIconForType = (type: string) => {
  switch (type) {
    case 'event': return <Calendar className="w-4 h-4 text-brand-500" />;
    case 'payment': return <Wallet className="w-4 h-4 text-emerald-500" />;
    case 'task': return <FileText className="w-4 h-4 text-amber-500" />;
    default: return <AlertCircle className="w-4 h-4 text-slate-500" />;
  }
};

const getBgForType = (type: string) => {
  switch (type) {
    case 'event': return 'bg-brand-50';
    case 'payment': return 'bg-emerald-50';
    case 'task': return 'bg-amber-50';
    default: return 'bg-slate-50';
  }
};

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications, onMarkRead, onNavigate }) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.isRead) {
      onMarkRead(notification.id);
    }
    if (notification.link && onNavigate) {
      onNavigate(notification.link);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden card-shadow"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">{t('notificationsTitle')}</h3>
              {unreadCount > 0 && (
                <span className="bg-brand-50 text-brand-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} {t('notificationsNew')}
                </span>
              )}
            </div>

            <div className="max-h-[28rem] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "flex gap-3 p-4 border-b border-slate-50 transition-colors cursor-pointer hover:bg-slate-50",
                      !notification.isRead ? "bg-brand-50/20" : ""
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", getBgForType(notification.type))}>
                      {getIconForType(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-bold text-slate-900", !notification.isRead && "text-brand-900")}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-brand-500 rounded-full mt-1 shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">{t('allCaughtUp')}</p>
                  <p className="text-xs text-slate-500 mt-1">{t('noNotificationsText')}</p>
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-2 border-t border-slate-50 bg-slate-50/50">
                <button 
                  onClick={() => {
                    notifications.filter(n => !n.isRead).forEach(n => onMarkRead(n.id));
                  }}
                  className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {t('markAllAsRead')}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
