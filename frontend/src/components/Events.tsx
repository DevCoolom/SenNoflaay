import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  User as UserIcon, 
  Clock, 
  Plus, 
  Pencil, 
  Trash2,
  ChevronRight,
  List,
  ChevronLeft,
  Download,
  Book as BookIcon,
  Users
} from 'lucide-react';
import { Event } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../lib/LanguageContext';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  eachDayOfInterval,
  parseISO
} from 'date-fns';
import ical from 'ical-generator';

interface EventsProps {
  events: Event[];
  onAddEvent: () => void;
  onImportEvent: () => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (id: string) => void;
  onViewEvent: (event: Event) => void;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

const Events: React.FC<EventsProps> = ({ events, onAddEvent, onImportEvent, onEditEvent, onDeleteEvent, onViewEvent, canAdd, canEdit, canDelete }) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateB - dateA;
  });

  const handleExportICal = () => {
    const calendar = ical({ name: 'Association Events' });
    events.forEach(event => {
      if (!event.date) return;
      const startTime = new Date(`${event.date}T${event.time || '12:00'}`);
      const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later
      calendar.createEvent({
        start: startTime,
        end: endTime,
        summary: event.name,
        description: event.description || '',
        location: event.place || '',
        organizer: event.player ? { name: event.player, email: 'no-reply@example.com' } : undefined
      });
    });
    
    const blob = new Blob([calendar.toString()], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'events.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="bg-white rounded-3xl border border-slate-100 card-shadow overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h4 className="text-xl font-serif font-bold text-slate-900 w-40 text-center">
              {format(currentDate, 'MMMM yyyy')}
            </h4>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="text-xs font-bold uppercase tracking-widest text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
        
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
          {weekDays.map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-[120px]">
          {days.map((day, idx) => {
            const dayEvents = events.filter(e => e.date === format(day, 'yyyy-MM-dd'));
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={day.toString()} 
                className={`border-b border-r border-slate-100 p-2 overflow-hidden hover:bg-slate-50 transition-colors ${!isCurrentMonth ? 'bg-slate-50/50' : ''}`}
              >
                <div className={`text-right mb-2`}>
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${isToday ? 'bg-brand-600 text-white' : !isCurrentMonth ? 'text-slate-300' : 'text-slate-700'}`}>
                    {format(day, 'd')}
                  </span>
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[80px] pr-1 custom-scrollbar">
                  {dayEvents.map(e => (
                    <div 
                      key={e.id}
                      onClick={() => onViewEvent(e)}
                      className="text-[10px] px-2 py-1 bg-brand-50 text-brand-700 rounded border border-brand-100 truncate cursor-pointer hover:bg-brand-100 transition-colors mb-1"
                      title={e.name}
                    >
                      {e.time} {e.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderList = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => {
            return (
              <motion.div
                layout
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
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
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 card-shadow">
        <h3 className="text-2xl font-serif font-bold text-slate-900 flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-brand-600" />
          {t('upcomingPastEvents')}
        </h3>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                viewMode === 'calendar' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Calendar</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                viewMode === 'list' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={handleExportICal}
            className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-100 transition-all"
            title="Export iCal"
          >
            <Download className="w-4 h-4" />
          </button>

          {canAdd && (
            <div className="flex gap-2">
              <button
                onClick={onImportEvent}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest border border-slate-100 transition-all"
                title="Import"
              >
                Import
              </button>
              <button
                onClick={onAddEvent}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-brand-100 transition-all active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                {t('newEvent')}
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {viewMode === 'calendar' ? renderCalendar() : renderList()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Events;
