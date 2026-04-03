export interface Association {
  id: string;
  name: string;
  logoUrl?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  associationId: string;
  firstName: string;
  lastName: string;
  tel: string;
  city?: string;
  fee: number;
  gender?: 'male' | 'female';
  isMinor?: boolean;
  joinedDate?: string;
  linkedMemberId?: string;
  linkedPersonName?: string;
  payments: Payment[];
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: string;
  objectiveId: string;
}

export interface Objective {
  id: string;
  associationId: string;
  name: string;
  target: number;
  description: string;
  color: string;
}

export interface Expense {
  id: string;
  associationId: string;
  desc: string;
  amount: number;
  date: string;
  objectiveId?: string;
  category: string;
}

export interface Event {
  id: string;
  associationId: string;
  name: string;
  player: string;
  date: string;
  time: string;
  place: string;
  description: string;
  participants?: number;
}

export interface Correction {
  associationId: string;
  year: number;
  amount: number;
  reason: string;
}

export interface Bill {
  id: string;
  associationId: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  fileUrl?: string;
  fileName?: string;
}

export interface User {
  username: string;
  associationId: string;
  role: 'superadmin' | 'admin' | 'treasury' | 'controller';
}

export interface AuditLog {
  id: string;
  associationId: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface Task {
  id: string;
  associationId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: number; // For drag-and-drop ordering
  createdAt: string;
}

export interface MembershipFeeConfig {
  associationId: string;
  frequency: 'yearly' | 'monthly';
  period: 'yearly' | 'monthly';
  amountAll: number;
  amountMale: number;
  amountFemale: number;
  amountMinor: number;
  useCategories: boolean;
}
