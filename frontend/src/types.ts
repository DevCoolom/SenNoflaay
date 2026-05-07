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
  name?: string;
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
  receiptUrl?: string;
  receiptName?: string;
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
  bookId?: string;
  participants?: number;
  ticketPrice?: number;
  maxTickets?: number;
  registrationOpen?: boolean;
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
  description?: string;
  fileUrl?: string;
  fileName?: string;
}

export interface User {
  username: string;
  associationId: string;
  password?: string;
  role: 'superadmin' | 'admin' | 'treasury' | 'controller' | 'member';
  memberId?: string; // links to Member.id for member-role users
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

export interface Campaign {
  id: string;
  associationId: string;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  imageUrl?: string;
  createdAt: string;
}

export interface Donation {
  id: string;
  associationId: string;
  campaignId: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  message?: string;
  date: string;
  isAnonymous: boolean;
}

export interface Ticket {
  id: string;
  associationId: string;
  eventId: string;
  attendeeName: string;
  attendeeEmail?: string;
  ticketType: string;
  price: number;
  qrCode: string; // encoded ticket ID for scanning
  checkedIn: boolean;
  checkedInAt?: string;
  purchasedAt: string;
}

export interface AppNotification {
  id: string;
  associationId: string;
  targetRole?: string;
  targetUserId?: string;
  title: string;
  message: string;
  type: 'reminder' | 'event' | 'payment' | 'task' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Invite {
  id: string;
  token: string;
  associationId: string;
  role: User['role'];
  memberId?: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface PasswordReset {
  id: string;
  token: string;
  associationId: string;
  username: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}
