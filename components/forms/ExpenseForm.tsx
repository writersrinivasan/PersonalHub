'use client';

import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import { uid, today } from '@/lib/utils';
import type { Expense } from '@/lib/types';

const PERSONAL_CATS = ['Food', 'Transport', 'Utilities', 'Shopping', 'Health', 'Entertainment', 'Education', 'Finance', 'Other'];
const PROFESSIONAL_CATS = ['Software', 'Equipment', 'Office', 'Marketing', 'Travel', 'Food', 'Outsourcing', 'Finance', 'Other'];
const PAYMENT_METHODS = ['UPI', 'Card', 'Cash', 'Bank Transfer', 'Wallet', 'Cheque'];

export default function ExpenseForm({ data }: { data: Record<string, unknown> }) {
  const { personalExpenses, setPersonalExpenses, professionalExpenses, setProfessionalExpenses } = useApp();
  const { close } = useModal();
  const existing = data as Partial<Expense>;
  const expType = (existing.type || data.expenseType || 'personal') as Expense['type'];
  const cats = expType === 'professional' ? PROFESSIONAL_CATS : PERSONAL_CATS;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const expense: Expense = {
      id: existing.id || uid(),
      title: f.get('title') as string,
      amount: parseFloat(f.get('amount') as string),
      category: f.get('category') as string,
      date: f.get('date') as string,
      paymentMethod: f.get('paymentMethod') as string,
      notes: f.get('notes') as string,
      taxDeductible: (f.get('taxDeductible') as string) === 'on',
      type: expType,
    };
    if (expType === 'professional') {
      if (existing.id) setProfessionalExpenses(professionalExpenses.map((e) => (e.id === existing.id ? expense : e)));
      else setProfessionalExpenses([...professionalExpenses, expense]);
    } else {
      if (existing.id) setPersonalExpenses(personalExpenses.map((e) => (e.id === existing.id ? expense : e)));
      else setPersonalExpenses([...personalExpenses, expense]);
    }
    close();
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        {existing.id ? 'Edit Expense' : `Add ${expType === 'professional' ? 'Business' : 'Personal'} Expense`}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Description *</label>
          <input name="title" className="form-input" defaultValue={existing.title} required placeholder="What did you spend on?" />
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
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Category</label>
            <select name="category" className="form-select" defaultValue={existing.category || cats[0]}>
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <select name="paymentMethod" className="form-select" defaultValue={existing.paymentMethod || 'UPI'}>
              {PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        {expType === 'professional' && (
          <div className="form-group">
            <div className="form-check">
              <input type="checkbox" name="taxDeductible" id="taxDed" defaultChecked={existing.taxDeductible ?? true} />
              <label htmlFor="taxDed" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>Tax deductible</label>
            </div>
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea name="notes" className="form-textarea" defaultValue={existing.notes} placeholder="Any details..." />
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
          <button type="submit" className="btn btn-primary">Add Expense</button>
        </div>
      </form>
    </div>
  );
}
