'use client';

import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import { uid } from '@/lib/utils';
import type { Task } from '@/lib/types';

export default function TaskForm({ data }: { data: Record<string, unknown> }) {
  const { tasks, setTasks } = useApp();
  const { close } = useModal();
  const existing = data as Partial<Task>;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const task: Task = {
      id: existing.id || uid(),
      title: f.get('title') as string,
      type: f.get('type') as Task['type'],
      priority: f.get('priority') as Task['priority'],
      status: f.get('status') as Task['status'],
      category: f.get('category') as string,
      dueDate: f.get('dueDate') as string,
      startTime: f.get('startTime') as string,
      endTime: f.get('endTime') as string,
      description: f.get('description') as string,
      syncedToGCal: existing.syncedToGCal ?? false,
      recurrence: (f.get('recurrence') as Task['recurrence']) || 'none',
    };
    if (existing.id) {
      setTasks(tasks.map((t) => (t.id === existing.id ? task : t)));
    } else {
      setTasks([...tasks, task]);
    }
    close();
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{existing.id ? 'Edit Task' : 'Add Task'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input name="title" className="form-input" defaultValue={existing.title} required placeholder="What needs to be done?" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Type</label>
            <select name="type" className="form-select" defaultValue={existing.type || 'personal'}>
              <option value="personal">Personal</option>
              <option value="professional">Professional</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priority</label>
            <select name="priority" className="form-select" defaultValue={existing.priority || 'medium'}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" className="form-select" defaultValue={existing.status || 'todo'}>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <input name="category" className="form-input" defaultValue={existing.category} placeholder="e.g. Finance" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input name="dueDate" type="date" className="form-input" defaultValue={existing.dueDate} />
          </div>
          <div className="form-group">
            <label className="form-label">Start Time</label>
            <input name="startTime" type="time" className="form-input" defaultValue={existing.startTime} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">End Time</label>
            <input name="endTime" type="time" className="form-input" defaultValue={existing.endTime} />
          </div>
          <div className="form-group">
            <label className="form-label">Recurrence</label>
            <select name="recurrence" className="form-select" defaultValue={existing.recurrence || 'none'}>
              <option value="none">No recurrence</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea name="description" className="form-textarea" defaultValue={existing.description} placeholder="Any details..." />
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
          <button type="submit" className="btn btn-primary">{existing.id ? 'Save Changes' : 'Add Task'}</button>
        </div>
      </form>
    </div>
  );
}
