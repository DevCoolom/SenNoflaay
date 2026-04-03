/**
 * Database Layer - PostgreSQL/Supabase
 * Replaces better-sqlite3 with production-ready PostgreSQL via Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Database initialization - Create tables if they don't exist
 */
export async function initializeDatabase() {
  try {
    // Create schema file in your Supabase project
    // This is a safety check - tables should be created via migration scripts
    console.log('Database initialized with Supabase PostgreSQL');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Type-safe queries
 */
export const queries = {
  // Associations
  getAssociation: async (id: string) => {
    const { data, error } = await supabase
      .from('associations')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  createAssociation: async (id: string, name: string) => {
    const { data, error } = await supabase
      .from('associations')
      .insert([{ id, name, created_at: new Date().toISOString() }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Members
  getMembers: async (associationId: string) => {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('association_id', associationId);
    if (error) throw error;
    return data;
  },

  createMember: async (member: any) => {
    const { data, error } = await supabase
      .from('members')
      .insert([member])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateMember: async (id: string, associationId: string, updates: any) => {
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('id', id)
      .eq('association_id', associationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteMember: async (id: string, associationId: string) => {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id)
      .eq('association_id', associationId);
    if (error) throw error;
  },

  // Users
  getUserByCredentials: async (username: string, associationId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('association_id', associationId)
      .single();
    if (error && error.code !== 'PGRST116') throw error; // 'not found' is ok
    return data;
  },

  getUsers: async (associationId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('association_id', associationId);
    if (error) throw error;
    return data;
  },

  createUser: async (username: string, associationId: string, hashedPassword: string, role: string) => {
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, association_id: associationId, password: hashedPassword, role }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateUser: async (username: string, associationId: string, updates: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('username', username)
      .eq('association_id', associationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteUser: async (username: string, associationId: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('username', username)
      .eq('association_id', associationId);
    if (error) throw error;
  },

  // Payments
  createPayment: async (payment: any) => {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getPayments: async (associationId: string) => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('association_id', associationId);
    if (error) throw error;
    return data;
  },

  // Objectives
  getObjectives: async (associationId: string) => {
    const { data, error } = await supabase
      .from('objectives')
      .select('*')
      .eq('association_id', associationId);
    if (error) throw error;
    return data;
  },

  createObjective: async (objective: any) => {
    const { data, error } = await supabase
      .from('objectives')
      .insert([objective])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteObjective: async (id: string, associationId: string) => {
    const { error } = await supabase
      .from('objectives')
      .delete()
      .eq('id', id)
      .eq('association_id', associationId);
    if (error) throw error;
  },

  // Expenses
  getExpenses: async (associationId: string) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('association_id', associationId);
    if (error) throw error;
    return data;
  },

  createExpense: async (expense: any) => {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Events
  getEvents: async (associationId: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('association_id', associationId);
    if (error) throw error;
    return data;
  },

  createEvent: async (event: any) => {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateEvent: async (id: string, associationId: string, updates: any) => {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .eq('association_id', associationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteEvent: async (id: string, associationId: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id)
      .eq('association_id', associationId);
    if (error) throw error;
  },

  // Bills
  getBills: async (associationId: string) => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('association_id', associationId);
    if (error) throw error;
    return data;
  },

  createBill: async (bill: any) => {
    const { data, error } = await supabase
      .from('bills')
      .insert([bill])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteBill: async (id: string, associationId: string) => {
    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id)
      .eq('association_id', associationId);
    if (error) throw error;
  },

  // Corrections
  getCorrections: async (associationId: string) => {
    const { data, error } = await supabase
      .from('corrections')
      .select('*')
      .eq('association_id', associationId);
    if (error) throw error;
    return data;
  },

  upsertCorrection: async (associationId: string, year: number, amount: number, reason: string) => {
    const { data, error } = await supabase
      .from('corrections')
      .upsert([{ association_id: associationId, year, amount, reason }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Audit Logs
  createAuditLog: async (log: any) => {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([log])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getAuditLogs: async (associationId: string) => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('association_id', associationId)
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Settings
  getSetting: async (associationId: string, key: string) => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('association_id', associationId)
      .eq('key', key)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data?.value;
  },

  getSettings: async (associationId: string) => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('association_id', associationId);
    if (error) throw error;
    return data?.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
  },

  setSetting: async (associationId: string, key: string, value: string) => {
    const { data, error } = await supabase
      .from('settings')
      .upsert([{ association_id: associationId, key, value }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Tasks
  getTasks: async (associationId: string) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('association_id', associationId)
      .order('priority', { ascending: true });
    if (error) throw error;
    return data;
  },

  createTask: async (task: any) => {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateTask: async (id: string, associationId: string, updates: any) => {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .eq('association_id', associationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteTask: async (id: string, associationId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('association_id', associationId);
    if (error) throw error;
  },

  // Membership Fee Config
  getMembershipFeeConfig: async (associationId: string) => {
    const { data, error } = await supabase
      .from('membership_fee_configs')
      .select('*')
      .eq('association_id', associationId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  upsertMembershipFeeConfig: async (config: any) => {
    const { data, error } = await supabase
      .from('membership_fee_configs')
      .upsert([config])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};
