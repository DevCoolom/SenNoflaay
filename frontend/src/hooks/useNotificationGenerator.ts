import { useEffect, useRef } from 'react';
import { Event, Task, Member, Payment, AppNotification } from '../types';

export function useNotificationGenerator(
  associationId: string | null,
  events: Event[],
  tasks: Task[],
  members: Member[],
  notifications: AppNotification[],
  addNotification: (n: Omit<AppNotification, 'id' | 'associationId' | 'createdAt' | 'isRead'>) => void
) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (!associationId || hasRun.current || events.length === 0 || members.length === 0) return;
    
    // Only run the scanner once per session to avoid spamming the database
    hasRun.current = true;

    const generateNotifications = async () => {
      const now = new Date();
      
      // 1. Scan for upcoming events (next 7 days)
      events.forEach(event => {
        const eventDate = new Date(`${event.date}T${event.time}`);
        const diffTime = eventDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 0 && diffDays <= 7) {
          const title = `Upcoming Event: ${event.name}`;
          const existing = notifications.find(n => n.title === title && n.type === 'event');
          
          if (!existing) {
            addNotification({
              title,
              message: `${event.name} is scheduled for ${event.date} at ${event.time} in ${event.place}.`,
              type: 'event',
              targetRole: 'all',
              link: 'events'
            });
          }
        }
      });

      // 2. Scan for overdue tasks
      tasks.forEach(task => {
        if (task.status !== 'completed') {
          const title = `Task Reminder: ${task.title}`;
          const existing = notifications.find(n => n.title === title && n.type === 'task');
          
          if (!existing) {
            addNotification({
              title,
              message: `Task "${task.title}" is currently marked as ${task.status}.`,
              type: 'task',
              targetRole: 'admin',
              link: 'tasks'
            });
          }
        }
      });

      // 3. Scan for past-due payments (simplified: just check if fee > 0 and no payments this year)
      const currentYear = now.getFullYear();
      members.forEach(member => {
        if (member.fee > 0) {
          const paymentsThisYear = member.payments.filter(p => new Date(p.date).getFullYear() === currentYear);
          const totalPaid = paymentsThisYear.reduce((sum, p) => sum + p.amount, 0);
          
          if (totalPaid < member.fee) {
            const title = `Payment Due: ${member.name}`;
            const existing = notifications.find(n => n.title === title && n.type === 'payment' && n.targetUserId === member.id);
            
            if (!existing) {
              addNotification({
                title,
                message: `${member.name} has pending membership fees for ${currentYear}.`,
                type: 'payment',
                targetRole: 'treasury',
                targetUserId: member.id,
                link: 'finance'
              });
            }
          }
        }
      });
    };

    // Delay slightly to let initial fetch settle
    const timeout = setTimeout(generateNotifications, 5000);
    return () => clearTimeout(timeout);
  }, [associationId, events, tasks, members, notifications, addNotification]);
}
