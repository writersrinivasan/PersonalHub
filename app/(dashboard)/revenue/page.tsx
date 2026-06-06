'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import PageTransition from '@/components/PageTransition';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

const SRC_COLORS: Record<string, string> = { Freelance: '#6366f1', Retainer: '#10b981', Consulting: '#3b82f6', 'Digital Products': '#f59e0b', Investments: '#14b8a6', Salary: '#8b5cf6', Rental: '#ec4899', Other: '#9ca3af' };

export default function RevenuePage() {
  const { revenue, setRevenue } = useApp();
  const { open } = useModal();
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all' ? revenue : revenue.filter((r) => r.source === filter);
  const total = revenue.reduce((s, r) => s + r.amount, 0);
  const sources = [...new Set(revenue.map((r) => r.source))];

  const barData = {
    labels: sources,
    datasets: [{ label: 'Revenue', data: sources.map((s) => revenue.filter((r) => r.source === s).reduce((sum, r) => sum + r.amount, 0)), backgroundColor: sources.map((s) => SRC_COLORS[s] || '#6366f1'), borderRadius: 6 }],
  };

  const del = (id: string) => { if (confirm('Delete?')) setRevenue(revenue.filter((r) => r.id !== id)); };

  return (
    <PageTransition>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="filter-tabs" style={{ margin: 0 }}>
              <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All ({revenue.length})</button>
              {sources.map((s) => <button key={s} className={`filter-tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>)}
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => open('revenue')}>+ Add Revenue</button>
          </div>
          <div className="card">
            <div className="card-body p-0">
              {visible.length === 0
                ? <div className="empty-state"><p>No revenue entries yet</p></div>
                : visible.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: (SRC_COLORS[r.source] || '#6366f1') + '22', color: SRC_COLORS[r.source] || '#6366f1' }}>
                      ₹
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{r.title}</div>
                      <div className="text-xs text-gray-400 flex gap-2">
                        <span>{formatDate(r.date)}</span>
                        {r.recurring && <span className="text-indigo-500 font-medium">↻ Recurring</span>}
                      </div>
                    </div>
                    <span className="badge" style={{ background: (SRC_COLORS[r.source] || '#6366f1') + '22', color: SRC_COLORS[r.source] || '#6366f1' }}>{r.source}</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(r.amount)}</span>
                    <button className="btn-icon" onClick={() => open('revenue', r as Record<string, unknown>)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button className="btn-icon" onClick={() => del(r.id)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card">
            <div className="card-header"><span className="section-title">Total Revenue</span></div>
            <div className="card-body text-center">
              <p className="text-3xl font-bold text-green-600">{formatCurrency(total)}</p>
              <p className="text-sm text-gray-400 mt-1">{revenue.length} entries</p>
            </div>
          </div>
          {sources.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="section-title">By Source</span></div>
              <div className="card-body" style={{ height: 200 }}>
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f3f4f6' } } } }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
