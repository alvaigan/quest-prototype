// User types
export interface Manager {
  id: string;
  name: string;
  email: string;
  role: 'manager';
}

// Employee types
export interface Employee {
  id: string;
  name: string;
  nickname: string;
  archetype: string[];
  specialAbilities: string[];
  personalities: string[];
  weaknesses: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  assignedEmployeeIds: string[];
  status: 'To Do' | 'In Progress' | 'Done' | 'Blocked';
  attachedMoMIds: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Manager ID
}

// Meeting Minutes types
export interface MoM {
  id: string;
  title: string;
  date: Date;
  attendees: string[];
  content: string; // Rich text HTML
  location?: string; // Optional meeting location
  duration?: string; // Optional meeting duration
  toFollowUp?: string; // Optional follow-up items
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Manager ID
}

// Quest types
export interface Quest {
  id: string;
  title: string;
  description: string;
  assignedPICId: string; // Manager ID
  status: 'New' | 'Ready' | 'On Progress' | 'Done';
  attachedMoMId?: string; // Optional MoM ID
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Manager ID
}

// Attendance types
export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: Date;
  checkInTime: Date;
  checkOutTime: Date;
  totalHours: number;
}

export interface AttendanceStatistics {
  employeeId: string;
  employeeName: string;
  totalHours: number;
  daysPresent: number;
  averageDailyHours: number;
}

// Dropdown options
export const ARCHETYPE_OPTIONS = [
  'Developer',
  'Designer',
  'QA',
  'Analyst',
  'Support',
  'Product Manager',
  'DevOps'
];

export const SPECIAL_ABILITIES_OPTIONS = [
  'Problem Solving',
  'Communication',
  'Leadership',
  'Technical Expertise',
  'Project Management',
  'Mentoring',
  'Innovation'
];

export const PERSONALITIES_OPTIONS = [
  'Analytical',
  'Creative',
  'Detail-Oriented',
  'Team Player',
  'Independent',
  'Adaptable',
  'Proactive'
];

export const WEAKNESSES_OPTIONS = [
  'Procrastination',
  'Lack of Focus',
  'Poor Time Management',
  'Perfectionism',
  'Difficulty with Deadlines',
  'Communication Issues',
  'Micromanagement'
];

export const TASK_STATUS_OPTIONS = [
  'To Do',
  'In Progress',
  'Done',
  'Blocked'
] as const;

export const QUEST_STATUS_OPTIONS = [
  'New',
  'Ready',
  'On Progress',
  'Done'
] as const; 