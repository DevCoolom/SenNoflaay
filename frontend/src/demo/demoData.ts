import {
  Member, Objective, Expense, Event, Bill, Task,
  Campaign, Donation, MembershipFeeConfig, Correction, AuditLog, User
} from '../types';

const ASSOC = 'demo';

export const DEMO_USER: User = {
  username: 'Demo',
  associationId: ASSOC,
  role: 'superadmin',
};

export const DEMO_MEMBERS: Member[] = [
  {
    id: 'm1', associationId: ASSOC,
    firstName: 'Ahmed', lastName: 'Diallo', name: 'Ahmed Diallo',
    tel: '+49 170 1234567', city: 'Berlin', fee: 100, gender: 'male',
    isMinor: false, joinedDate: '2022-03-15',
    linkedMemberId: 'm2', linkedPersonName: 'Yassine Diallo',
    payments: [
      { id: 'p1', date: '2026-01-10', amount: 100, method: 'cash', objectiveId: 'obj-1' },
    ],
  },
  {
    id: 'm2', associationId: ASSOC,
    firstName: 'Yassine', lastName: 'Diallo', name: 'Yassine Diallo',
    tel: '', city: 'Berlin', fee: 50, gender: 'male',
    isMinor: true, joinedDate: '2022-03-15',
    linkedMemberId: 'm1', linkedPersonName: 'Ahmed Diallo',
    payments: [],
  },
  {
    id: 'm3', associationId: ASSOC,
    firstName: 'Sofia', lastName: 'Müller', name: 'Sofia Müller',
    tel: '+49 172 2345678', city: 'Hamburg', fee: 80, gender: 'female',
    isMinor: false, joinedDate: '2021-09-01',
    linkedMemberId: 'm4', linkedPersonName: 'Lena Müller',
    payments: [
      { id: 'p2', date: '2026-01-15', amount: 80, method: 'transfer', objectiveId: 'obj-1' },
    ],
  },
  {
    id: 'm4', associationId: ASSOC,
    firstName: 'Lena', lastName: 'Müller', name: 'Lena Müller',
    tel: '', city: 'Hamburg', fee: 50, gender: 'female',
    isMinor: true, joinedDate: '2021-09-01',
    linkedMemberId: 'm3', linkedPersonName: 'Sofia Müller',
    payments: [
      { id: 'p3', date: '2026-01-15', amount: 50, method: 'transfer', objectiveId: 'obj-1' },
    ],
  },
  {
    id: 'm5', associationId: ASSOC,
    firstName: 'Marco', lastName: 'Rossi', name: 'Marco Rossi',
    tel: '+49 151 3456789', city: 'Munich', fee: 100, gender: 'male',
    isMinor: false, joinedDate: '2023-02-20',
    linkedMemberId: 'm6', linkedPersonName: 'Giulia Rossi',
    payments: [
      { id: 'p4', date: '2026-02-01', amount: 60, method: 'cash', objectiveId: 'obj-1' },
    ],
  },
  {
    id: 'm6', associationId: ASSOC,
    firstName: 'Giulia', lastName: 'Rossi', name: 'Giulia Rossi',
    tel: '', city: 'Munich', fee: 50, gender: 'female',
    isMinor: true, joinedDate: '2023-02-20',
    linkedMemberId: 'm5', linkedPersonName: 'Marco Rossi',
    payments: [],
  },
  {
    id: 'm7', associationId: ASSOC,
    firstName: 'Fatou', lastName: 'Ndiaye', name: 'Fatou Ndiaye',
    tel: '+49 160 4567890', city: 'Frankfurt', fee: 80, gender: 'female',
    isMinor: false, joinedDate: '2020-11-05',
    linkedMemberId: 'm8', linkedPersonName: 'Amina Ndiaye',
    payments: [
      { id: 'p5', date: '2026-01-20', amount: 80, method: 'transfer', objectiveId: 'obj-1' },
    ],
  },
  {
    id: 'm8', associationId: ASSOC,
    firstName: 'Amina', lastName: 'Ndiaye', name: 'Amina Ndiaye',
    tel: '', city: 'Frankfurt', fee: 50, gender: 'female',
    isMinor: true, joinedDate: '2020-11-05',
    linkedMemberId: 'm7', linkedPersonName: 'Fatou Ndiaye',
    payments: [],
  },
  {
    id: 'm9', associationId: ASSOC,
    firstName: 'Jonas', lastName: 'Weber', name: 'Jonas Weber',
    tel: '+49 175 5678901', city: 'Cologne', fee: 100, gender: 'male',
    isMinor: false, joinedDate: '2024-01-10',
    payments: [],
  },
  {
    id: 'm10', associationId: ASSOC,
    firstName: 'Clara', lastName: 'Vogel', name: 'Clara Vogel',
    tel: '+49 162 6789012', city: 'Stuttgart', fee: 80, gender: 'female',
    isMinor: false, joinedDate: '2023-06-15',
    payments: [],
  },
];

export const DEMO_OBJECTIVES: Objective[] = [
  {
    id: 'obj-1', associationId: ASSOC,
    name: 'Annual Membership 2025', target: 2000,
    description: 'Collect annual membership fees from all members.',
    color: '#4F46E5',
  },
];

export const DEMO_EXPENSES: Expense[] = [
  {
    id: 'exp-1', associationId: ASSOC,
    desc: 'Office supplies', amount: 45, date: '2025-02-10',
    objectiveId: 'obj-1', category: 'Administration',
  },
  {
    id: 'exp-2', associationId: ASSOC,
    desc: 'Transport to away match', amount: 120, date: '2025-03-05',
    category: 'Sport',
  },
];

export const DEMO_EVENTS: Event[] = [
  {
    id: 'ev-1', associationId: ASSOC,
    name: 'Summer Tournament 2025',
    player: 'FC Bern', date: '2025-07-12', time: '10:00',
    place: 'Bern City Stadium',
    description: 'Annual summer tournament open to all members and guests.',
    participants: 48, ticketPrice: 5, maxTickets: 100, registrationOpen: true,
  },
  {
    id: 'ev-2', associationId: ASSOC,
    name: 'Annual General Meeting',
    player: 'All Members', date: '2025-03-20', time: '18:30',
    place: 'Club House, Room A',
    description: 'Review of the 2024 season and election of new board members.',
    participants: 10,
  },
  {
    id: 'ev-3', associationId: ASSOC,
    name: 'Fundraising Gala Night',
    player: 'FC Bern', date: '2025-09-05', time: '19:00',
    place: 'Grand Hotel Bern',
    description: 'Gala dinner to raise funds for new youth training equipment.',
    ticketPrice: 50, maxTickets: 80, registrationOpen: true,
  },
];

export const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1', associationId: ASSOC,
    title: 'New Training Equipment',
    description: 'Help us purchase new jerseys, balls, and training cones for the youth team.',
    goalAmount: 3000, currentAmount: 1800,
    startDate: '2025-01-01', endDate: '2025-06-30',
    status: 'active', createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'camp-2', associationId: ASSOC,
    title: 'Youth Development Program',
    description: 'Fund professional coaching sessions for players aged 8–14.',
    goalAmount: 5000, currentAmount: 1500,
    startDate: '2025-02-01', endDate: '2025-12-31',
    status: 'active', createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'camp-3', associationId: ASSOC,
    title: 'Club 10th Anniversary Celebration',
    description: 'Special event celebrating a decade of FC Bern.',
    goalAmount: 2000, currentAmount: 2000,
    startDate: '2024-09-01', endDate: '2024-12-31',
    status: 'completed', createdAt: '2024-09-01T00:00:00Z',
  },
];

export const DEMO_DONATIONS: Donation[] = [
  {
    id: 'don-1', associationId: ASSOC, campaignId: 'camp-1',
    donorName: 'Thomas Keller', amount: 200, date: '2025-01-15',
    isAnonymous: false, message: 'Happy to support the kids!',
  },
  {
    id: 'don-2', associationId: ASSOC, campaignId: 'camp-1',
    donorName: 'Anonymous', amount: 500, date: '2025-02-03',
    isAnonymous: true,
  },
  {
    id: 'don-3', associationId: ASSOC, campaignId: 'camp-2',
    donorName: 'Maria Schmidt', amount: 300, date: '2025-02-20',
    isAnonymous: false,
  },
];

export const DEMO_BILLS: Bill[] = [
  {
    id: 'bill-1', associationId: ASSOC,
    title: 'Annual Club Insurance',
    amount: 350, date: '2025-01-05',
    category: 'Insurance',
    description: 'Yearly liability insurance for all club activities.',
  },
];

export const DEMO_TASKS: Task[] = [
  {
    id: 'task-1', associationId: ASSOC,
    title: 'Prepare AGM presentation',
    description: 'Assigned to: Ahmed Diallo — Slides covering 2024 finances, attendance, and 2025 goals.',
    status: 'in-progress', priority: 1, createdAt: '2025-03-01T09:00:00Z',
  },
  {
    id: 'task-2', associationId: ASSOC,
    title: 'Send membership renewal notices',
    description: 'Assigned to: Ahmed Diallo — Email reminders to all members with unpaid 2025 fees.',
    status: 'todo', priority: 2, createdAt: '2025-03-10T10:00:00Z',
  },
];

export const DEMO_MEMBERSHIP_FEE_CONFIG: MembershipFeeConfig = {
  associationId: ASSOC,
  frequency: 'yearly',
  period: 'yearly',
  amountAll: 100,
  amountMale: 100,
  amountFemale: 80,
  amountMinor: 50,
  useCategories: true,
};

export const DEMO_CORRECTIONS: Correction[] = [];

export const DEMO_AUDIT_LOGS: AuditLog[] = [];
