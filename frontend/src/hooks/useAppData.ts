import { useState, useEffect, useCallback } from 'react';
import { Member, Objective, Expense, Event, Correction, Bill, User, AuditLog, Payment, Task, MembershipFeeConfig } from '../types';

export const useAppData = (associationId: string | null) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [tasks, setTasks] = useState<Task[]>([]);
  const [membershipFeeConfig, setMembershipFeeConfig] = useState<MembershipFeeConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!associationId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/data?associationId=${associationId}`);
      if (!response.ok) {
        const text = await response.text();
        console.error('Failed to fetch data, response:', text);
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', text);
        throw new Error('Failed to parse JSON');
      }

      setMembers(data.members || []);
      setObjectives(data.objectives || []);
      setExpenses(data.expenses || []);
      setEvents(data.events || []);
      setCorrections(data.corrections || []);
      setBills(data.bills || []);
      setUsers(data.users || []);
      setAuditLogs(data.auditLogs || []);
      setSettings(data.settings || {});
      setTasks(data.tasks || []);
      setMembershipFeeConfig(data.membershipFeeConfig || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [associationId]);

  const logAction = useCallback(async (user: string, action: string, details: string) => {
    if (!associationId) return;
    try {
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          associationId,
          userName: user,
          action,
          details,
          timestamp: new Date().toISOString()
        })
      });
      fetchData();
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }, [associationId]);

  // Helper functions for mutations
  const addMember = async (member: Omit<Member, 'id' | 'payments' | 'associationId'>) => {
    if (!associationId) return;
    const newMember = { ...member, id: crypto.randomUUID(), associationId };
    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMember)
    });
    fetchData();
    return newMember;
  };

  const updateMember = async (id: string, member: Partial<Member>) => {
    if (!associationId) return;
    await fetch(`/api/members/${id}?associationId=${associationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(member)
    });
    fetchData();
  };

  const deleteMember = async (id: string) => {
    if (!associationId) return;
    await fetch(`/api/members/${id}?associationId=${associationId}`, { method: 'DELETE' });
    fetchData();
  };

  const addPayment = async (memberId: string, payment: Omit<Payment, 'id' | 'associationId'>) => {
    if (!associationId) return;
    const newPayment = { ...payment, id: crypto.randomUUID(), memberId, associationId };
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPayment)
    });
    fetchData();
    return newPayment;
  };

  const addObjective = async (objective: Omit<Objective, 'id' | 'associationId'>) => {
    if (!associationId) return;
    const newObjective = { ...objective, id: crypto.randomUUID(), associationId };
    await fetch('/api/objectives', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newObjective)
    });
    fetchData();
    return newObjective;
  };

  const deleteObjective = async (id: string) => {
    if (!associationId) return;
    await fetch(`/api/objectives/${id}?associationId=${associationId}`, { method: 'DELETE' });
    fetchData();
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'associationId'>) => {
    if (!associationId) return;
    const newExpense = { ...expense, id: crypto.randomUUID(), associationId };
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExpense)
    });
    fetchData();
    return newExpense;
  };

  const addEvent = async (event: Omit<Event, 'id' | 'associationId'>) => {
    if (!associationId) return;
    const newEvent = { ...event, id: crypto.randomUUID(), associationId };
    await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent)
    });
    fetchData();
    return newEvent;
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    if (!associationId) return;
    await fetch(`/api/events/${id}?associationId=${associationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    fetchData();
  };

  const deleteEvent = async (id: string) => {
    if (!associationId) return;
    await fetch(`/api/events/${id}?associationId=${associationId}`, { method: 'DELETE' });
    fetchData();
  };

  const addBill = async (bill: Omit<Bill, 'id' | 'associationId'>) => {
    if (!associationId) return;
    const newBill = { ...bill, id: crypto.randomUUID(), associationId };
    await fetch('/api/bills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBill)
    });
    fetchData();
    return newBill;
  };

  const deleteBill = async (id: string) => {
    if (!associationId) return;
    await fetch(`/api/bills/${id}?associationId=${associationId}`, { method: 'DELETE' });
    fetchData();
  };

  const upsertCorrection = async (correction: Omit<Correction, 'associationId'>) => {
    if (!associationId) return;
    const newCorrection = { ...correction, associationId };
    await fetch('/api/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCorrection)
    });
    fetchData();
    return newCorrection;
  };

  const addUser = async (user: Omit<User, 'associationId'>) => {
    if (!associationId) return;
    const newUser = { ...user, associationId };
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });
    fetchData();
    return newUser;
  };

  const updateUser = async (username: string, user: Partial<User>) => {
    if (!associationId) return;
    await fetch(`/api/users/${username}?associationId=${associationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    fetchData();
  };

  const deleteUser = async (username: string) => {
    if (!associationId) return;
    await fetch(`/api/users/${username}?associationId=${associationId}`, { method: 'DELETE' });
    fetchData();
  };

  const updateSetting = async (key: string, value: string) => {
    if (!associationId) return;
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ associationId, key, value })
    });
    fetchData();
  };

  const updateMembershipFeeConfig = async (config: Omit<MembershipFeeConfig, 'associationId'>) => {
    if (!associationId) return;
    await fetch('/api/membership-fee-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...config, associationId })
    });
    fetchData();
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'priority' | 'associationId'>) => {
    if (!associationId) return;
    const newTask = { 
      ...task, 
      id: crypto.randomUUID(), 
      associationId,
      createdAt: new Date().toISOString(),
      priority: tasks.length
    };
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTask)
    });
    fetchData();
    return newTask;
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    if (!associationId) return;
    await fetch(`/api/tasks/${id}?associationId=${associationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task)
    });
    fetchData();
  };

  const deleteTask = async (id: string) => {
    if (!associationId) return;
    await fetch(`/api/tasks/${id}?associationId=${associationId}`, { method: 'DELETE' });
    fetchData();
  };

  const reorderTasks = async (newTasks: Task[]) => {
    if (!associationId) return;
    setTasks(newTasks); // Optimistic update
    const payload = newTasks.map((t, idx) => ({ id: t.id, priority: idx }));
    await fetch('/api/tasks/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ associationId, tasks: payload })
    });
    fetchData();
  };

  return {
    members,
    objectives,
    expenses,
    events,
    corrections,
    bills,
    users,
    auditLogs,
    settings,
    tasks,
    loading,
    logAction,
    addMember,
    updateMember,
    deleteMember,
    addPayment,
    addObjective,
    deleteObjective,
    addExpense,
    addEvent,
    updateEvent,
    deleteEvent,
    addBill,
    deleteBill,
    upsertCorrection,
    addUser,
    updateUser,
    deleteUser,
    updateSetting,
    updateMembershipFeeConfig,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    membershipFeeConfig
  };
};
