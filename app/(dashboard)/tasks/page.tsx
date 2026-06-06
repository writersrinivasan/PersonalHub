'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import PageTransition from '@/components/PageTransition';
import Badge from '@/components/Badge';
import { formatDate, uid } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '@/lib/types';

const COLS: { key: Task['status']; label: string; color: string }[] = [
  { key: 'todo',        label: 'To Do',       color: '#6b7280' },
  { key: 'in-progress', label: 'In Progress',  color: '#f59e0b' },
  { key: 'done',        label: 'Done',         color: '#10b981' },
];

const todayStr = () => new Date().toISOString().split('T')[0];

export default function TasksPage() {
  const { tasks, setTasks } = useApp();
  const { open } = useModal();
  const [filter, setFilter]       = useState<'all' | 'personal' | 'professional'>('all');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver]   = useState<Task['status'] | null>(null);
  const [toast, setToast]         = useState('');

  const today = todayStr();
  const isOverdue = (t: Task) => !!(t.dueDate && t.dueDate < today && t.status !== 'done');

  const visible = filter === 'all' ? tasks : tasks.filter(t => t.type === filter);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3800);
  }

  // Central handler for any status change (drag or manual)
  function handleStatusChange(id: string, newStatus: Task['status']) {
    const task = tasks.find(t => t.id === id);
    if (!task || task.status === newStatus) return;

    const updated = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);

    // When a recurring task is marked done, auto-create the next occurrence
    if (newStatus === 'done' && task.recurrence && task.recurrence !== 'none' && task.dueDate) {
      const next = new Date(task.dueDate);
      if      (task.recurrence === 'daily')   next.setDate(next.getDate() + 1);
      else if (task.recurrence === 'weekly')  next.setDate(next.getDate() + 7);
      else if (task.recurrence === 'monthly') next.setMonth(next.getMonth() + 1);

      const nextTask: Task = {
        ...task,
        id: uid(),
        status: 'todo',
        dueDate: next.toISOString().split('T')[0],
        syncedToGCal: false,
      };
      setTasks([...updated, nextTask]);
      showToast(`↻ Next ${task.recurrence} task created — "${task.title}" · due ${formatDate(nextTask.dueDate)}`);
    } else {
      setTasks(updated);
    }
  }

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('taskId', id);
    setDraggingId(id);
  }

  function onDrop(e: React.DragEvent, targetStatus: Task['status']) {
    e.preventDefault();
    const id = e.dataTransfer.getData('taskId');
    handleStatusChange(id, targetStatus);
    setDraggingId(null);
    setDragOver(null);
  }

  function deleteTask(id: string) {
    if (confirm('Delete this task?')) setTasks(tasks.filter(t => t.id !== id));
  }

  return (
    <PageTransition>
      <div className="space-y-4">

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="fixed top-4 right-4 z-50 bg-indigo-600 text-white text-sm px-4 py-3 rounded-xl shadow-xl max-w-sm leading-snug"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="filter-tabs" style={{ margin: 0 }}>
            {(['all', 'personal', 'professional'] as const).map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Drag cards to move between columns</span>
            <button className="btn btn-primary btn-sm" onClick={() => open('task')}>+ Add Task</button>
          </div>
        </div>

        {/* Kanban board */}
        <div className="grid grid-cols-3 gap-4">
          {COLS.map(col => {
            const colTasks    = visible.filter(t => t.status === col.key);
            const overdueCount = colTasks.filter(t => isOverdue(t)).length;
            const isTarget    = dragOver === col.key;

            return (
              <div
                key={col.key}
                className={`kanban-col transition-all duration-150 ${isTarget ? 'ring-2 ring-indigo-400 bg-indigo-50/60' : ''}`}
                onDragOver={e  => { e.preventDefault(); setDragOver(col.key); }}
                onDragLeave={e => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); }}
                onDrop={e      => onDrop(e, col.key)}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-sm font-bold text-gray-700">{col.label}</span>
                  <span className="ml-1 text-xs font-semibold text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">{colTasks.length}</span>
                  {overdueCount > 0 && (
                    <span className="text-xs text-red-500 font-semibold bg-red-50 border border-red-100 px-1.5 py-0.5 rounded-full">
                      {overdueCount} overdue
                    </span>
                  )}
                </div>

                {/* Drop hint when dragging over empty column */}
                {isTarget && colTasks.length === 0 && (
                  <div className="border-2 border-dashed border-indigo-300 rounded-xl h-16 flex items-center justify-center text-xs text-indigo-400 mb-2">
                    Drop here
                  </div>
                )}

                {/* Task cards */}
                {colTasks.map((t, i) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: draggingId === t.id ? 0.35 : 1, y: 0 }}
                    transition={{ delay: draggingId ? 0 : i * 0.04 }}
                    className={`task-card ${t.type}`}
                    draggable
                    onDragStart={e  => onDragStart(e, t.id)}
                    onDragEnd={()   => { setDraggingId(null); setDragOver(null); }}
                    style={{ cursor: 'grab' }}
                    onClick={() => open('task', t as Record<string, unknown>)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-gray-800 leading-snug">{t.title}</p>
                      <button
                        className="btn-icon flex-shrink-0"
                        onClick={e => { e.stopPropagation(); deleteTask(t.id); }}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge value={t.priority} />
                      <Badge value={t.type} />
                      {isOverdue(t) && (
                        <span className="text-xs bg-red-100 text-red-600 rounded px-1.5 py-0.5 font-bold">Overdue</span>
                      )}
                      {t.recurrence && t.recurrence !== 'none' && (
                        <span className="text-xs text-indigo-400 font-medium">↻ {t.recurrence}</span>
                      )}
                    </div>

                    {t.dueDate && (
                      <div className={`text-xs mt-1.5 font-medium ${isOverdue(t) ? 'text-red-400' : 'text-gray-400'}`}>
                        {isOverdue(t) ? '⚠ ' : ''}{formatDate(t.dueDate)}
                      </div>
                    )}
                    {t.category && <div className="text-xs text-gray-400 mt-0.5">#{t.category}</div>}
                  </motion.div>
                ))}

                {/* Quick-add button */}
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

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-gray-400 pt-1">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-purple-200 inline-block" /> Professional</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-blue-100 inline-block" /> Personal</span>
          <span className="flex items-center gap-1"><span className="text-red-500 font-bold">Overdue</span> — past due date</span>
          <span className="flex items-center gap-1"><span className="text-indigo-400">↻ weekly / monthly</span> — auto-restarts when done</span>
        </div>

      </div>
    </PageTransition>
  );
}
