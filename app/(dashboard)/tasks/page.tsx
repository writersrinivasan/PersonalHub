'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import PageTransition from '@/components/PageTransition';
import Badge from '@/components/Badge';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Task } from '@/lib/types';

const COLS: { key: Task['status']; label: string; color: string }[] = [
  { key: 'todo', label: 'To Do', color: '#6b7280' },
  { key: 'in-progress', label: 'In Progress', color: '#f59e0b' },
  { key: 'done', label: 'Done', color: '#10b981' },
];

export default function TasksPage() {
  const { tasks, setTasks } = useApp();
  const { open } = useModal();
  const [filter, setFilter] = useState<'all' | 'personal' | 'professional'>('all');

  const visible = filter === 'all' ? tasks : tasks.filter((t) => t.type === filter);

  function deleteTask(id: string) {
    if (confirm('Delete this task?')) setTasks(tasks.filter((t) => t.id !== id));
  }

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="filter-tabs" style={{ margin: 0 }}>
            {(['all', 'personal', 'professional'] as const).map((f) => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => open('task')}>+ Add Task</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {COLS.map((col) => {
            const colTasks = visible.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="kanban-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-sm font-bold text-gray-700">{col.label}</span>
                  <span className="ml-auto text-xs font-semibold text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">{colTasks.length}</span>
                </div>
                {colTasks.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`task-card ${t.type}`}
                    onClick={() => open('task', t as Record<string, unknown>)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-800 leading-snug">{t.title}</p>
                      <button className="btn-icon flex-shrink-0" onClick={(e) => { e.stopPropagation(); deleteTask(t.id); }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge value={t.priority} />
                      <Badge value={t.type} />
                      {t.dueDate && <span className="text-xs text-gray-400">{formatDate(t.dueDate)}</span>}
                    </div>
                    {t.category && <div className="text-xs text-gray-400 mt-1.5">#{t.category}</div>}
                  </motion.div>
                ))}
                <button
                  className="w-full mt-2 p-2 rounded-lg border-2 border-dashed border-gray-200 text-xs text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                  onClick={() => open('task', { status: col.key })}
                >
                  + Add
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
