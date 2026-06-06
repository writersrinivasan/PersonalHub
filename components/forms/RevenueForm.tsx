'use client';

import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import { uid, today } from '@/lib/utils';
import type { Revenue } from '@/lib/types';

const SOURCES = ['Freelance', 'Retainer', 'Consulting', 'Digital Products', 'Investments', 'Salary', 'Rental', 'Other'];

export default function RevenueForm({ data }: { data: Record<string, unknown> }) {
  const { revenue, setRevenue } = useApp();
  const { close } = useModal();
  const existing = data as Partial<Revenue>;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const entry: Revenue = {
      id: existing.id || uid(),
      title: f.get('title') as string,
      amount: parseFloat(f.get('amount') as string),
      source: f.get('source') as string,
      date: f.get('date') as string,
      recurring: (f.get('recurring') as string) === 'on',
      notes: f.get('notes') as string,
    };
    if (existing.id) setRevenue(revenue.map((r) => (r.id === existing.id ? entry : r)));
    else setRevenue([...revenue, entry]);
    close();
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{existing.id ? 'Edit Revenue' : 'Add Revenue'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input name="title" className="form-input" defaultValue={existing.title} required placeholder="e.g. Acme Corp retainer" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Amount (₹) *</label>
            <input name="amount" type="number" step="0.01" min="0" className="form-input" defaultValue={existing.amount} required />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input name="date" type="date" className="form-input" defaultValue={existing.date || today()} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Source</label>
          <select name="source" className="form-select" defaultValue={existing.source || 'Freelance'}>
            {SOURCES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <div className="form-check">
            <input type="checkbox" name="recurring" id="recurring" defaultChecked={existing.recurring ?? false} />
            <label htmlFor="recurring" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Recurring income</label>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea name="notes" className="form-textarea" defaultValue={existing.notes} placeholder="Any details..." />
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
          <button type="submit" className="btn btn-primary">Add Revenue</button>
        </div>
      </form>
    </div>
  );
}
