import { uid, today, daysAgo, daysAhead } from './utils';
import type { Task, Expense, Revenue, ClientBooking } from './types';

export function buildSampleData() {
  const tasks: Task[] = [
    { id: uid(), title: 'Review Q2 client proposals', type: 'professional', priority: 'high', status: 'todo', category: 'Consulting', dueDate: daysAhead(2), startTime: '10:00', endTime: '11:00', description: 'Go through 3 proposals and shortlist' },
    { id: uid(), title: 'Prepare invoice for Acme Corp', type: 'professional', priority: 'high', status: 'in-progress', category: 'Finance', dueDate: today(), description: 'Monthly retainer + extras' },
    { id: uid(), title: 'Gym session', type: 'personal', priority: 'medium', status: 'todo', category: 'Health', dueDate: today(), startTime: '07:00', endTime: '08:00' },
    { id: uid(), title: 'Update portfolio website', type: 'professional', priority: 'medium', status: 'in-progress', category: 'Marketing', dueDate: daysAhead(5) },
    { id: uid(), title: 'Book flight for Mumbai trip', type: 'personal', priority: 'low', status: 'todo', category: 'Travel', dueDate: daysAhead(7) },
    { id: uid(), title: 'Submit tax documents', type: 'professional', priority: 'high', status: 'done', category: 'Finance', dueDate: daysAgo(2) },
    { id: uid(), title: 'Call with design client', type: 'professional', priority: 'medium', status: 'done', category: 'Consulting', dueDate: daysAgo(1), startTime: '14:00', endTime: '15:00' },
  ];

  const personalExpenses: Expense[] = [
    { id: uid(), title: 'Swiggy dinner', amount: 450, category: 'Food', date: today(), paymentMethod: 'UPI', type: 'personal' },
    { id: uid(), title: 'Jio recharge', amount: 239, category: 'Utilities', date: daysAgo(3), paymentMethod: 'UPI', type: 'personal' },
    { id: uid(), title: 'Uber rides', amount: 680, category: 'Transport', date: daysAgo(5), paymentMethod: 'UPI', type: 'personal' },
    { id: uid(), title: 'Amazon grocery', amount: 1200, category: 'Shopping', date: daysAgo(7), paymentMethod: 'Card', type: 'personal' },
    { id: uid(), title: 'Movie tickets PVR', amount: 600, category: 'Entertainment', date: daysAgo(10), paymentMethod: 'Card', type: 'personal' },
    { id: uid(), title: 'Apollo pharmacy', amount: 320, category: 'Health', date: daysAgo(12), paymentMethod: 'Cash', type: 'personal' },
    { id: uid(), title: 'Netflix subscription', amount: 649, category: 'Entertainment', date: daysAgo(15), paymentMethod: 'Card', type: 'personal' },
  ];

  const professionalExpenses: Expense[] = [
    { id: uid(), title: 'Adobe Creative Cloud', amount: 4230, category: 'Software', date: daysAgo(2), paymentMethod: 'Card', taxDeductible: true, type: 'professional' },
    { id: uid(), title: 'Figma Pro', amount: 1200, category: 'Software', date: daysAgo(5), paymentMethod: 'Card', taxDeductible: true, type: 'professional' },
    { id: uid(), title: 'Client meeting lunch', amount: 850, category: 'Food', date: daysAgo(8), paymentMethod: 'Cash', taxDeductible: true, type: 'professional' },
    { id: uid(), title: 'Laptop stand + keyboard', amount: 3500, category: 'Equipment', date: daysAgo(20), paymentMethod: 'Card', taxDeductible: true, type: 'professional' },
    { id: uid(), title: 'Co-working space', amount: 5000, category: 'Office', date: daysAgo(30), paymentMethod: 'Bank Transfer', taxDeductible: true, type: 'professional' },
  ];

  const revenue: Revenue[] = [
    { id: uid(), title: 'Acme Corp — Monthly Retainer', amount: 85000, source: 'Retainer', date: daysAgo(1), recurring: true },
    { id: uid(), title: 'Website redesign — TechStart', amount: 45000, source: 'Freelance', date: daysAgo(5), recurring: false },
    { id: uid(), title: 'UI/UX Consultation — 3 sessions', amount: 18000, source: 'Consulting', date: daysAgo(10), recurring: false },
    { id: uid(), title: 'Figma template sale — Gumroad', amount: 12500, source: 'Digital Products', date: daysAgo(15), recurring: false },
    { id: uid(), title: 'Brand identity project', amount: 35000, source: 'Freelance', date: daysAgo(20), recurring: false },
  ];

  const clientBookings: ClientBooking[] = [
    { id: uid(), clientName: 'Priya Sharma', email: 'priya@example.com', service: 'UI/UX Consultation', date: daysAhead(1), time: '10:00', duration: 60, status: 'confirmed' },
    { id: uid(), clientName: 'Rahul Verma', email: 'rahul@techstart.io', service: 'Website Review', date: daysAhead(3), time: '14:30', duration: 90, status: 'pending' },
    { id: uid(), clientName: 'Sunita Patel', email: 'sunita@acme.com', service: 'Brand Strategy', date: daysAhead(5), time: '11:00', duration: 120, status: 'confirmed' },
    { id: uid(), clientName: 'Arjun Singh', email: 'arjun@example.com', service: 'Mobile App Design', date: daysAgo(3), time: '15:00', duration: 60, status: 'completed' },
  ];

  return { tasks, personalExpenses, professionalExpenses, revenue, clientBookings };
}
