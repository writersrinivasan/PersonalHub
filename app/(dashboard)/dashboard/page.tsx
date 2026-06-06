'use client';

import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import StatCard from '@/components/StatCard';
import PageTransition from '@/components/PageTransition';
import { formatCurrency, formatDate, today, daysAhead } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';

ChartJS.register(...registerables);

export default function DashboardPage() {
  const { tasks, personalExpenses, professionalExpenses, revenue, clientBookings } = useApp();
  const { open } = useModal();

  const todayStr = today();
  const weekAhead = daysAhead(7);
  const tasksDueToday = tasks.filter((t) => t.dueDate === todayStr && t.status !== 'done').length;
  const tasksDueWeek = tasks.filter((t) => t.dueDate >= todayStr && t.dueDate <= weekAhead && t.status !== 'done').length;
  const monthRevenue = revenue.filter((r) => r.date.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, r) => s + r.amount, 0);
  const totalExpenses = [...personalExpenses, ...professionalExpenses].reduce((s, e) => s + e.amount, 0);
  const netPnL = revenue.reduce((s, r) => s + r.amount, 0) - totalExpenses;

  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toISOString().slice(0, 7);
  });

  const barData = {
    labels: last6Months.map((m) => new Date(m + '-01').toLocaleString('en-IN', { month: 'short' })),
    datasets: [
      { label: 'Revenue', data: last6Months.map((m) => revenue.filter((r) => r.date.startsWith(m)).reduce((s, r) => s + r.amount, 0)), backgroundColor: '#6366f1', borderRadius: 6 },
      { label: 'Expenses', data: last6Months.map((m) => [...personalExpenses, ...professionalExpenses].filter((e) => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0)), backgroundColor: '#f43f5e', borderRadius: 6 },
    ],
  };

  const statusCount = { todo: 0, 'in-progress': 0, done: 0 };
  tasks.forEach((t) => statusCount[t.status]++);
  const donutData = {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [{ data: [statusCount.todo, statusCount['in-progress'], statusCount.done], backgroundColor: ['#e5e7eb', '#fbbf24', '#6366f1'], borderWidth: 0 }],
  };

  const upcomingTasks = tasks.filter((t) => t.status !== 'done' && t.dueDate >= todayStr).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5);
  const upcomingBookings = clientBookings.filter((b) => b.date >= todayStr && b.status !== 'cancelled').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);

  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Due Today', value: tasksDueToday, sub: 'tasks', iconBg: '#ede9fe', iconColor: '#7c3aed', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2', delay: 0 },
            { label: 'This Week', value: tasksDueWeek, sub: 'upcoming tasks', iconBg: '#e0e7ff', iconColor: '#4f46e5', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', delay: 0.07 },
            { label: 'Monthly Revenue', value: formatCurrency(monthRevenue), sub: 'this month', iconBg: '#d1fae5', iconColor: '#059669', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', delay: 0.14 },
            { label: 'Net P&L', value: formatCurrency(netPnL), sub: netPnL >= 0 ? 'profit' : 'loss', iconBg: netPnL >= 0 ? '#d1fae5' : '#fee2e2', iconColor: netPnL >= 0 ? '#059669' : '#dc2626', d: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', delay: 0.21 },
          ].map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} iconBg={s.iconBg} iconColor={s.iconColor} delay={s.delay}
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.d} />} />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 card">
            <div className="card-header"><span className="section-title">Revenue vs Expenses</span></div>
            <div className="card-body" style={{ height: 220 }}>
              <Bar data={barData} options={chartOpts} />
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="section-title">Task Status</span></div>
            <div className="card-body flex items-center justify-center" style={{ height: 220 }}>
              <div style={{ width: 160, height: 160 }}>
                <Doughnut data={donutData} options={{ ...chartOpts, cutout: '65%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <div className="card-header">
              <span className="section-title">Upcoming Tasks</span>
              <button className="btn btn-sm btn-secondary" onClick={() => open('task')}>+ Add</button>
            </div>
            <div className="card-body p-0">
              {upcomingTasks.length === 0
                ? <div className="empty-state"><p>No upcoming tasks</p></div>
                : upcomingTasks.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => open('task', t as Record<string, unknown>)}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.priority === 'high' ? 'bg-red-400' : t.priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{t.title}</div>
                      <div className="text-xs text-gray-400">{formatDate(t.dueDate)}</div>
                    </div>
                    <span className={`badge badge-${t.type}`}>{t.type}</span>
                  </motion.div>
                ))}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="section-title">Client Sessions</span>
              <button className="btn btn-sm btn-secondary" onClick={() => open('booking')}>+ Add</button>
            </div>
            <div className="card-body p-0">
              {upcomingBookings.length === 0
                ? <div className="empty-state"><p>No upcoming bookings</p></div>
                : upcomingBookings.map((b, i) => (
                  <motion.div key={b.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer"
                    onClick={() => open('booking', b as Record<string, unknown>)}>
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {b.clientName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{b.clientName}</div>
                      <div className="text-xs text-gray-400">{formatDate(b.date)} · {b.time}</div>
                    </div>
                    <span className={`badge badge-${b.status}`}>{b.status}</span>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
