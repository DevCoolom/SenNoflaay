import { useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types';
import { Member, Objective, Expense, Event, Correction, Bill, User, AuditLog, Payment, Task, MembershipFeeConfig, Campaign, Donation } from '../types';
import { insforge } from '../lib/insforge';
import { hashPassword } from '../lib/crypto';

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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [membershipFeeConfig, setMembershipFeeConfig] = useState<MembershipFeeConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    if (!associationId) return;
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        { data: membersData },
        { data: objectivesData },
        { data: expensesData },
        { data: eventsData },
        { data: correctionsData },
        { data: billsData },
        { data: usersData },
        { data: auditLogsData },
        { data: settingsData },
        { data: tasksData },
        { data: feeConfigData },
        { data: campaignsData },
        { data: donationsData },
        { data: notificationsData }
      ] = await Promise.all([
        insforge.database.from('members').select('*, payments(*)').eq('association_id', associationId),
        insforge.database.from('objectives').select('*').eq('association_id', associationId),
        insforge.database.from('expenses').select('*').eq('association_id', associationId),
        insforge.database.from('events').select('*').eq('association_id', associationId),
        insforge.database.from('corrections').select('*').eq('association_id', associationId),
        insforge.database.from('bills').select('*').eq('association_id', associationId),
        insforge.database.from('users').select('*').eq('association_id', associationId),
        insforge.database.from('audit_logs').select('*').eq('association_id', associationId).order('timestamp', { ascending: false }),
        insforge.database.from('settings').select('*').eq('association_id', associationId),
        insforge.database.from('tasks').select('*').eq('association_id', associationId).order('priority', { ascending: true }),
        insforge.database.from('membership_fee_configs').select('*').eq('association_id', associationId).maybeSingle(),
        insforge.database.from('campaigns').select('*').eq('association_id', associationId),
        insforge.database.from('donations').select('*').eq('association_id', associationId),
        insforge.database.from('notifications').select('*').eq('association_id', associationId).order('created_at', { ascending: false })
      ]);

      // Map data to camelCase as expected by the frontend
      setMembers(membersData?.map((m: any) => ({
        ...m,
        associationId: m.association_id,
        firstName: m.first_name,
        lastName: m.last_name,
        joinedDate: m.joined_date,
        tel: m.phone,
        city: m.city,
        gender: m.gender,
        isMinor: m.is_minor,
        linkedMemberId: m.linked_member_id,
        linkedPersonName: m.linked_person_name,
        name: `${m.first_name} ${m.last_name}`,
        payments: m.payments?.map((p: any) => ({
          ...p,
          associationId: p.association_id,
          objectiveId: p.objective_id,
          memberId: p.member_id
        })) || []
      })) || []);

      setObjectives(objectivesData?.map((o: any) => ({ ...o, associationId: o.association_id })) || []);
      setExpenses(expensesData?.map((e: any) => ({ ...e, associationId: e.association_id, objectiveId: e.objective_id, desc: e.description })) || []);
      setEvents(eventsData?.map((ev: any) => ({ ...ev, associationId: ev.association_id, bookId: ev.book_id, player: ev.speaker, place: ev.location })) || []);
      setBills(billsData?.map((b: any) => ({ ...b, associationId: b.association_id, fileUrl: b.file_url, fileName: b.file_name })) || []);
      setCorrections(correctionsData?.map((c: any) => ({ ...c, associationId: c.association_id })) || []);
      setUsers(usersData?.map((u: any) => ({ ...u, associationId: u.association_id, memberId: u.member_id })) || []);
      setAuditLogs(auditLogsData?.map((l: any) => ({ ...l, associationId: l.association_id, user: l.user_name })) || []);
      setSettings(settingsData?.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {}) || {});
      setTasks(tasksData?.map((t: any) => ({ ...t, associationId: t.association_id, createdAt: t.created_at })) || []);
      
      setCampaigns(campaignsData?.map((c: any) => ({
        ...c,
        associationId: c.association_id,
        goalAmount: c.goal_amount,
        currentAmount: c.current_amount,
        startDate: c.start_date,
        endDate: c.end_date,
        createdAt: c.created_at
      })) || []);

      setDonations(donationsData?.map((d: any) => ({
        ...d,
        associationId: d.association_id,
        campaignId: d.campaign_id,
        donorName: d.donor_name,
        donorEmail: d.donor_email,
        isAnonymous: d.is_anonymous
      })) || []);

      setNotifications(notificationsData?.map((n: any) => ({
        id: n.id,
        associationId: n.association_id,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.is_read,
        targetRole: n.target_role,
        targetUserId: n.target_user_id,
        link: n.link,
        createdAt: n.created_at
      })) || []);
      
      setMembershipFeeConfig(feeConfigData ? {
        associationId: feeConfigData.association_id,
        frequency: feeConfigData.frequency,
        period: feeConfigData.period,
        amountAll: feeConfigData.amount_all,
        amountMale: feeConfigData.amount_male,
        amountFemale: feeConfigData.amount_female,
        amountMinor: feeConfigData.amount_minor,
        useCategories: feeConfigData.use_categories
      } : null);

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
      await insforge.database.from('audit_logs').insert({
        association_id: associationId,
        user_name: user,
        action,
        details,
        timestamp: new Date().toISOString()
      });
      fetchData();
    } catch (error) {
      console.error('Error logging action:', error);
    }
  }, [associationId]);

  const addMember = async (member: Omit<Member, 'id' | 'payments' | 'associationId'>) => {
    if (!associationId) return;
    const id = crypto.randomUUID();
    const { error } = await insforge.database.from('members').insert({
      id,
      association_id: associationId,
      first_name: member.firstName,
      last_name: member.lastName,
      phone: member.tel,
      city: member.city,
      fee: member.fee,
      joined_date: member.joinedDate,
      gender: member.gender,
      is_minor: member.isMinor,
      linked_member_id: member.linkedMemberId,
      linked_person_name: member.linkedPersonName
    });
    if (error) throw error;
    fetchData();
    return { ...member, id, associationId };
  };

  const updateMember = async (id: string, member: Partial<Member>) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('members').update({
      first_name: member.firstName,
      last_name: member.lastName,
      phone: member.tel,
      city: member.city,
      fee: member.fee,
      joined_date: member.joinedDate,
      gender: member.gender,
      is_minor: member.isMinor,
      linked_member_id: member.linkedMemberId,
      linked_person_name: member.linkedPersonName
    }).eq('id', id).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const updateMemberProfile = async (id: string, member: Partial<Member>) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('members').update({
      first_name: member.firstName,
      last_name: member.lastName,
      phone: member.tel,
      city: member.city
    }).eq('id', id).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const deleteMember = async (id: string) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('members').delete().eq('id', id).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const addPayment = async (memberId: string, payment: Omit<Payment, 'id' | 'associationId'>) => {
    if (!associationId) return;
    const id = crypto.randomUUID();
    const { error } = await insforge.database.from('payments').insert({
      id,
      association_id: associationId,
      member_id: memberId,
      objective_id: payment.objectiveId,
      amount: payment.amount,
      date: payment.date,
      method: payment.method
    });
    if (error) throw error;
    fetchData();
    return { ...payment, id, associationId, memberId };
  };

  const addObjective = async (objective: Omit<Objective, 'id' | 'associationId'>) => {
    if (!associationId) return;
    const id = crypto.randomUUID();
    const { error } = await insforge.database.from('objectives').insert({
      id,
      association_id: associationId,
      name: objective.name,
      description: objective.description,
      target: objective.target,
      color: objective.color
    });
    if (error) throw error;
    fetchData();
    return { ...objective, id, associationId };
  };

  const deleteObjective = async (id: string) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('objectives').delete().eq('id', id).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const addExpense = async (expense: Omit<Expense, 'id' | 'associationId'>) => {
    if (!associationId) return;
    const id = crypto.randomUUID();
    const { error } = await insforge.database.from('expenses').insert({
      id,
      association_id: associationId,
      objective_id: expense.objectiveId,
      amount: expense.amount,
      date: expense.date,
      description: expense.desc,
      category: expense.category,
      receipt_url: expense.receiptUrl,
      receipt_name: expense.receiptName
    });
    if (error) throw error;
    fetchData();
    return { ...expense, id, associationId };
  };

  const addEvent = async (event: Omit<Event, 'id' | 'associationId'>) => {
    if (!associationId) return;
    const id = crypto.randomUUID();
    const { error } = await insforge.database.from('events').insert({
      id,
      association_id: associationId,
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.place,
      speaker: event.player,
      description: event.description,
      book_id: event.bookId,
      participants: event.participants
    });
    if (error) throw error;
    fetchData();
    return { ...event, id, associationId };
  };

  const updateEvent = async (id: string, event: Partial<Event>) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('events').update({
      name: event.name,
      date: event.date,
      time: event.time,
      location: event.place,
      speaker: event.player,
      description: event.description,
      book_id: event.bookId,
      participants: event.participants
    }).eq('id', id).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const deleteEvent = async (id: string) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('events').delete().eq('id', id).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const addBill = async (bill: Omit<Bill, 'id' | 'associationId'>) => {
    if (!associationId) return;
    const id = crypto.randomUUID();
    const { error } = await insforge.database.from('bills').insert({
      id,
      association_id: associationId,
      title: bill.title,
      amount: bill.amount,
      date: bill.date,
      category: bill.category,
      file_url: bill.fileUrl,
      file_name: bill.fileName,
      description: bill.description
    });
    if (error) throw error;
    fetchData();
    return { ...bill, id, associationId };
  };

  const deleteBill = async (id: string) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('bills').delete().eq('id', id).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const upsertCorrection = async (correction: Omit<Correction, 'associationId'>) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('corrections').upsert({
      association_id: associationId,
      year: correction.year,
      amount: correction.amount,
      reason: correction.reason
    });
    if (error) throw error;
    fetchData();
  };

  const addUser = async (user: Omit<User, 'associationId'>) => {
    if (!associationId) return;
    const hashedPw = await hashPassword(user.password);
    const { error } = await insforge.database.from('users').insert({
      username: user.username,
      association_id: associationId,
      password: hashedPw,
      role: user.role,
      member_id: user.memberId || null
    });
    if (error) throw error;
    fetchData();
  };

  const updateUser = async (username: string, user: Partial<User>) => {
    if (!associationId) return;
    const updateData: any = { role: user.role, member_id: user.memberId || null };
    if (user.password) {
      updateData.password = await hashPassword(user.password);
    }
    const { error } = await insforge.database.from('users').update(updateData)
      .eq('username', username).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const deleteUser = async (username: string) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('users').delete().eq('username', username).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const updateSetting = async (key: string, value: string) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('settings').upsert({
      association_id: associationId,
      key,
      value
    });
    if (error) throw error;
    fetchData();
  };

  const updateMembershipFeeConfig = async (config: Omit<MembershipFeeConfig, 'associationId'>) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('membership_fee_configs').upsert({
      association_id: associationId,
      frequency: config.frequency,
      period: config.period,
      amount_all: config.amountAll,
      amount_male: config.amountMale,
      amount_female: config.amountFemale,
      amount_minor: config.amountMinor,
      use_categories: config.useCategories
    });
    if (error) throw error;
    fetchData();
  };

  const addTask = async (task: Omit<Task, 'id' | 'createdAt' | 'priority' | 'associationId'>) => {
    if (!associationId) return;
    const id = crypto.randomUUID();
    const { error } = await insforge.database.from('tasks').insert({
      id,
      association_id: associationId,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: tasks.length,
      created_at: new Date().toISOString()
    });
    if (error) throw error;
    fetchData();
  };

  const updateTask = async (id: string, task: Partial<Task>) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('tasks').update({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority
    }).eq('id', id).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const deleteTask = async (id: string) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('tasks').delete().eq('id', id).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const reorderTasks = async (newTasks: Task[]) => {
    if (!associationId) return;
    setTasks(newTasks); // Optimistic update
    const updates = newTasks.map((t, idx) => ({
      id: t.id,
      association_id: associationId,
      priority: idx
    }));
    const { error } = await insforge.database.from('tasks').upsert(updates);
    if (error) throw error;
    fetchData();
  };

  const bulkAddMembers = async (newMembers: Omit<Member, 'id' | 'payments' | 'associationId'>[]) => {
    if (!associationId) return;
    const inserts = newMembers.map(m => ({
      id: crypto.randomUUID(),
      association_id: associationId,
      first_name: m.firstName,
      last_name: m.lastName,
      phone: m.tel,
      city: m.city,
      fee: m.fee,
      joined_date: m.joinedDate,
      gender: m.gender,
      is_minor: m.isMinor,
      linked_member_id: m.linkedMemberId,
      linked_person_name: m.linkedPersonName
    }));
    const { error } = await insforge.database.from('members').insert(inserts);
    if (error) throw error;
    fetchData();
  };

  const bulkAddExpenses = async (newExpenses: Omit<Expense, 'id' | 'associationId'>[]) => {
    if (!associationId) return;
    const inserts = newExpenses.map(e => ({
      id: crypto.randomUUID(),
      association_id: associationId,
      objective_id: e.objectiveId,
      amount: e.amount,
      date: e.date,
      description: e.desc,
      category: e.category
    }));
    const { error } = await insforge.database.from('expenses').insert(inserts);
    if (error) throw error;
    fetchData();
  };

  const bulkAddEvents = async (newEvents: Omit<Event, 'id' | 'associationId'>[]) => {
    if (!associationId) return;
    const inserts = newEvents.map(e => ({
      id: crypto.randomUUID(),
      association_id: associationId,
      name: e.name,
      date: e.date,
      time: e.time,
      location: e.place,
      speaker: e.player,
      description: e.description,
      book_id: e.bookId,
      participants: e.participants
    }));
    const { error } = await insforge.database.from('events').insert(inserts);
    if (error) throw error;
    fetchData();
  };

  const bulkAddBills = async (newBills: Omit<Bill, 'id' | 'associationId'>[]) => {
    if (!associationId) return;
    const inserts = newBills.map(b => ({
      id: crypto.randomUUID(),
      association_id: associationId,
      title: b.title,
      amount: b.amount,
      date: b.date,
      category: b.category,
      file_url: b.fileUrl,
      file_name: b.fileName,
      description: b.description
    }));
    const { error } = await insforge.database.from('bills').insert(inserts);
    if (error) throw error;
    fetchData();
  };

  const bulkAddTasks = async (newTasks: Omit<Task, 'id' | 'createdAt' | 'priority' | 'associationId'>[]) => {
    if (!associationId) return;
    const inserts = newTasks.map((t, idx) => ({
      id: crypto.randomUUID(),
      association_id: associationId,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: tasks.length + idx,
      created_at: new Date().toISOString()
    }));
    const { error } = await insforge.database.from('tasks').insert(inserts);
    if (error) throw error;
    fetchData();
  };

  const uploadFile = async (bucket: string, file: File, path: string) => {
    if (!associationId) return null;
    try {
      const { data, error } = await insforge.storage.from(bucket).upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = insforge.storage.from(bucket).getPublicUrl(path);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const addCampaign = async (campaign: Omit<Campaign, 'id' | 'associationId' | 'createdAt' | 'currentAmount'>) => {
    if (!associationId) return;
    const id = crypto.randomUUID();
    const { error } = await insforge.database.from('campaigns').insert({
      id,
      association_id: associationId,
      title: campaign.title,
      description: campaign.description,
      goal_amount: campaign.goalAmount,
      current_amount: 0,
      start_date: campaign.startDate,
      end_date: campaign.endDate,
      status: campaign.status,
      image_url: campaign.imageUrl
    });
    if (error) throw error;
    fetchData();
  };

  const updateCampaign = async (id: string, campaign: Partial<Campaign>) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('campaigns').update({
      title: campaign.title,
      description: campaign.description,
      goal_amount: campaign.goalAmount,
      start_date: campaign.startDate,
      end_date: campaign.endDate,
      status: campaign.status,
      image_url: campaign.imageUrl
    }).eq('id', id).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const deleteCampaign = async (id: string) => {
    if (!associationId) return;
    const { error } = await insforge.database.from('campaigns').delete().eq('id', id).eq('association_id', associationId);
    if (error) throw error;
    fetchData();
  };

  const addDonation = async (donation: Omit<Donation, 'id' | 'associationId' | 'date'>) => {
    if (!associationId) return;
    const id = crypto.randomUUID();
    const date = new Date().toISOString();
    
    // Insert donation
    const { error } = await insforge.database.from('donations').insert({
      id,
      association_id: associationId,
      campaign_id: donation.campaignId,
      amount: donation.amount,
      donor_name: donation.donorName,
      donor_email: donation.donorEmail,
      message: donation.message,
      is_anonymous: donation.isAnonymous,
      date
    });
    if (error) throw error;

    // Fetch current campaign to update current_amount
    const { data: cData } = await insforge.database.from('campaigns').select('current_amount').eq('id', donation.campaignId).single();
    if (cData) {
      await insforge.database.from('campaigns').update({
        current_amount: (cData.current_amount || 0) + donation.amount
      }).eq('id', donation.campaignId);
    }
    
    fetchData();
  };

  const markNotificationRead = async (id: string) => {
    if (!associationId) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    await insforge.database.from('notifications').update({ is_read: true }).eq('id', id).eq('association_id', associationId);
  };

  const addNotification = async (notification: Omit<AppNotification, 'id' | 'associationId' | 'createdAt' | 'isRead'>) => {
    if (!associationId) return;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    
    const { error } = await insforge.database.from('notifications').insert({
      id,
      association_id: associationId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      is_read: false,
      target_role: notification.targetRole,
      target_user_id: notification.targetUserId,
      link: notification.link,
      created_at: createdAt
    });
    if (!error) {
      fetchData();
    }
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
    bulkAddMembers,
    bulkAddExpenses,
    bulkAddEvents,
    bulkAddBills,
    bulkAddTasks,
    updateMember,
    updateMemberProfile,
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
    membershipFeeConfig,
    uploadFile,
    campaigns,
    donations,
    notifications,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    addDonation,
    markNotificationRead,
    addNotification
  };
};

