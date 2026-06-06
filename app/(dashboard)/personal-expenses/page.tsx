'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import PageTransition from '@/components/PageTransition';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

const CAT_COLORS: Record<string, string> = { Food: '#f59e0b', Transport: '#3b82f6', Utilities: '#8b5cf6', Shopping: '#ec4899', Health: '#10b981', Entertainment: '#6366f1', Education: '#0ea5e9', Finance: '#14b8a6', Other: '#9ca3af' };

export default function PersonalExpensesPage() {
  const { personalExpenses, setPersonalExpenses } = useApp();
  const { open } = useModal();
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all' ? personalExpenses : personalExpenses.filter((e) => e.category === filter);
  const total = personalExpenses.reduce((s, e) => s + e.amount, 0);
  const cats = [...new Set(personalExpenses.map((e) => e.category))];

  const donut = { labels: cats, datasets: [{ data: cats.map((c) => personalExpenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0)), backgroundColor: cats.map((c) => CAT_COLORS[c] || '#9ca3af'), borderWidth: 0 }] };

  const del = (id: string) => { if (confirm('Delete?')) setPersonalExpenses(personalExpenses.filter((e) => e.id !== id)); };

  return (
    <PageTransition>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="filter-tabs" style={{ margin: 0 }}>
              <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({personalExpenses.length})</button>
              {cats.map((c) => <button key={c} className={`filter-tab ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>{c}</button>)}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => open('expense', { expenseType: 'personal' })}>+ Add</button>
          </div>
          <div className="card">
            <div className="card-body p-0">
              {visible.length === 0
                ? <div className="empty-state"><p>No expenses yet</p></div>
                : visible.map((e, i) => (
                  <motion.div key={e.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: (CAT_COLORS[e.category] || '#9ca3af') + '22', color: CAT_COLORS[e.category] || '#9ca3af' }}>
                      {e.category[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{e.title}</div>
                      <div className="text-xs text-gray-400">{formatDate(e.date)} · {e.paymentMethod}</div>
                    </div>
                    <span className="badge" style={{ background: (CAT_COLORS[e.category] || '#9ca3af') + '22', color: CAT_COLORS[e.category] || '#9ca3af' }}>{e.category}</span>
                    <span className="text-sm font-bold text-gray-800">{formatCurrency(e.amount)}</span>
                    <button className="btn-icon" onClick={() => open('expense', { ...e, expenseType: 'personal' } as Record<string, unknown>)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button className="btn-icon" onClick={() => del(e.id)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="card-header"><span className="section-title">Total Spent</span></div>
            <div className="card-body text-center">
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</p>
              <p className="text-sm text-gray-400 mt-1">{personalExpenses.length} transactions</p>
            </div>
          </div>
          {cats.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="section-title">By Category</span></div>
              <div className="card-body flex justify-center" style={{ height: 200 }}>
                <Doughnut data={donut} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, cutout: '60%' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
