'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { buildSampleData } from '@/lib/sampleData';
import type { Task, Expense, Revenue, ClientBooking } from '@/lib/types';

interface AppCtx {
  tasks: Task[];
  setTasks: (v: Task[] | ((p: Task[]) => Task[])) => void;
  personalExpenses: Expense[];
  setPersonalExpenses: (v: Expense[] | ((p: Expense[]) => Expense[])) => void;
  professionalExpenses: Expense[];
  setProfessionalExpenses: (v: Expense[] | ((p: Expense[]) => Expense[])) => void;
  revenue: Revenue[];
  setRevenue: (v: Revenue[] | ((p: Revenue[]) => Revenue[])) => void;
  clientBookings: ClientBooking[];
  setClientBookings: (v: ClientBooking[] | ((p: ClientBooking[]) => ClientBooking[])) => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [personalExpenses, setPersonalExpenses] = useLocalStorage<Expense[]>('personal_expenses', []);
  const [professionalExpenses, setProfessionalExpenses] = useLocalStorage<Expense[]>('professional_expenses', []);
  const [revenue, setRevenue] = useLocalStorage<Revenue[]>('revenue', []);
  const [clientBookings, setClientBookings] = useLocalStorage<ClientBooking[]>('client_bookings', []);

  // Seed sample data once
  useEffect(() => {
    if (localStorage.getItem('ph_initialized')) return;
    const sample = buildSampleData();
    setTasks(sample.tasks);
    setPersonalExpenses(sample.personalExpenses);
    setProfessionalExpenses(sample.professionalExpenses);
    setRevenue(sample.revenue);
    setClientBookings(sample.clientBookings);
    localStorage.setItem('ph_initialized', '1');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Ctx.Provider value={{
      tasks, setTasks,
      personalExpenses, setPersonalExpenses,
      professionalExpenses, setProfessionalExpenses,
      revenue, setRevenue,
      clientBookings, setClientBookings,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
