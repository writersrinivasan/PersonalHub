export interface Task {
  id: string;
  title: string;
  type: 'personal' | 'professional';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'done';
  category: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  description?: string;
  syncedToGCal?: boolean;
  recurrence?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  taxDeductible?: boolean;
  type: 'personal' | 'professional';
}

export interface Revenue {
  id: string;
  title: string;
  amount: number;
  source: string;
  date: string;
  recurring: boolean;
  notes?: string;
  syncedToGCal?: boolean;
}

export interface ClientBooking {
  id: string;
  clientName: string;
  email: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  syncedToGCal?: boolean;
  fee?: number;
  recurrence?: 'none' | 'weekly' | 'biweekly' | 'monthly';
}

export interface BankRow {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  importAs: 'personal-expense' | 'professional-expense' | 'revenue' | 'skip';
  selected: boolean;
  balance?: number;
}

export interface GCalEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay?: boolean;
  color?: string;
}

export type ModalType =
  | 'task'
  | 'expense'
  | 'booking'
  | 'revenue'
  | 'quickadd'
  | 'gcal-setup'
  | null;

export type ExpenseType = 'personal' | 'professional';
