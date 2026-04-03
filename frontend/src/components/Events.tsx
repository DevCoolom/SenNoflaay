import React from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  User as UserIcon, 
  Clock, 
  Plus, 
  Pencil, 
  Trash2,
  ChevronRight
} from 'lucide-react';
import { Event } from '../types';
import { motion } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { Book as BookIcon, Users } from 'lucide-react';

interface EventsProps {
  events: Event[];
  onAddEvent: () => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onViewEvent: (event: Event) => void;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const Events: React.FC<EventsProps> = ({ events, onAddEvent, onEditEvent, onDeleteEvent, onViewEvent, canAdd, canEdit, canDelete }) => {
  const { t } = useLanguage();
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
        <h3 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-brand-600" />
          {t('upcomingPastEvents')}
        </h3>
        {canAdd && (
          <button
            onClick={onAddEvent}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 transition-all active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            {t('newEvent')}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => {
            return (
              <motion.div
                layout
                key={event.id}
                className="bg-white rounded-[2rem] border border-slate-100 card-shadow overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-3xl font-serif font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                        {event.name}
                      </h4>
                      <div className="flex items-center gap-2 text-brand-600 font-bold text-sm uppercase tracking-widest">
                        <UserIcon className="w-4 h-4" />
                        {event.player}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {canEdit && (
                        <button
                          onClick={() => onEditEvent(event)}
                          className="p-2.5 text-slate-300 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDeleteEvent(event.id)}
                          className="p-2.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-50">
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('date')} & {t('time')}</p>
                      <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                        <CalendarIcon className="w-4 h-4 text-slate-300" />
                        {event.date}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                        <Clock className="w-4 h-4 text-slate-300" />
                        {event.time}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('location')}</p>
                      <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
                        <MapPin className="w-4 h-4 text-slate-300" />
                        {event.place}
                      </div>
                    </div>
                  </div>

                  {event.participants !== undefined && event.participants > 0 && (
                    <div className="flex flex-wrap gap-4 py-3 bg-brand-50/30 px-5 rounded-2xl">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand-700">
                        <Users className="w-4 h-4" />
                        <span>{event.participants} {t('participants')}</span>
                      </div>
                    </div>
                  )}

                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-3 font-medium">
                    {event.description || t('noDescription')}
                  </p>

                  <div className="pt-2">
                    <button 
                      onClick={() => onViewEvent(event)}
                      className="text-brand-700 text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      {t('viewDetails')}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <CalendarIcon className="w-16 h-16 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-400 font-medium italic">{t('noEventsFound')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
