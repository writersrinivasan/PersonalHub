'use client';

import { useModal } from '@/context/ModalContext';
import { motion } from 'framer-motion';

const OPTIONS = [
  { type: 'task' as const, label: 'Task', sub: 'Add a personal or professional task', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: '#6366f1', bg: '#e0e7ff' },
  { type: 'expense' as const, label: 'Personal Expense', sub: 'Log personal spending', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', color: '#ef4444', bg: '#fee2e2', data: { expenseType: 'personal' } },
  { type: 'expense' as const, label: 'Business Expense', sub: 'Log a business cost', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: '#f59e0b', bg: '#fef3c7', data: { expenseType: 'professional' } },
  { type: 'revenue' as const, label: 'Revenue', sub: 'Record income received', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: '#10b981', bg: '#d1fae5' },
  { type: 'booking' as const, label: 'Client Booking', sub: 'Schedule a client session', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: '#8b5cf6', bg: '#ede9fe' },
];

export default function QuickAdd() {
  const { open } = useModal();
  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Add</h2>
      <div className="space-y-2">
        {OPTIONS.map((opt, i) => (
          <motion.button
            key={`${opt.type}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => open(opt.type, opt.data ?? {})}
            className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all text-left"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: opt.bg }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={opt.color}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={opt.icon} />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-800 text-sm">{opt.label}</div>
              <div className="text-xs text-gray-500">{opt.sub}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
