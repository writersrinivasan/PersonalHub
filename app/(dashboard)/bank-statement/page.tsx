'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import PageTransition from '@/components/PageTransition';
import { formatCurrency, formatDate, uid } from '@/lib/utils';
import { parseBankCsv, parseBankPdf } from '@/lib/parsers';
import { guessCategory, normalizeDate, AUTO_CATEGORIES } from '@/lib/categories';
import type { BankRow, Expense, Revenue } from '@/lib/types';
import { motion } from 'framer-motion';

export default function BankStatementPage() {
  const { setPersonalExpenses, setProfessionalExpenses, setRevenue, personalExpenses, professionalExpenses, revenue } = useApp();
  const [rows, setRows] = useState<BankRow[]>([]);
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const allCats = Object.keys(AUTO_CATEGORIES);

  async function handleFile(file: File) {
    setError('');
    if (file.name.match(/\.pdf$/i)) {
      setLoading(true);
      const buf = await file.arrayBuffer();
      const result = await parseBankPdf(buf);
      setLoading(false);
      if (!Array.isArray(result)) { setError(result.error); return; }
      setRows(result);
    } else {
      const text = await file.text();
      const result = parseBankCsv(text);
      if (!Array.isArray(result)) { setError(result.error); return; }
      setRows(result);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.match(/\.(csv|txt|pdf)$/i)) { setError('Please upload a CSV or PDF file.'); return; }
    handleFile(file);
  }

  function updateRow(id: string, patch: Partial<BankRow>) {
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function importSelected() {
    const toImport = rows.filter((r) => r.selected && r.importAs !== 'skip');
    const newPersonal: Expense[] = [];
    const newProfessional: Expense[] = [];
    const newRevenue: Revenue[] = [];

    for (const r of toImport) {
      if (r.importAs === 'personal-expense') {
        newPersonal.push({ id: uid(), title: r.description, amount: r.amount, category: r.category, date: r.date, paymentMethod: 'Bank Transfer', type: 'personal' });
      } else if (r.importAs === 'professional-expense') {
        newProfessional.push({ id: uid(), title: r.description, amount: r.amount, category: r.category, date: r.date, paymentMethod: 'Bank Transfer', taxDeductible: false, type: 'professional' });
      } else if (r.importAs === 'revenue') {
        newRevenue.push({ id: uid(), title: r.description, amount: r.amount, source: 'Bank Import', date: r.date, recurring: false });
      }
    }

    if (newPersonal.length) setPersonalExpenses([...personalExpenses, ...newPersonal]);
    if (newProfessional.length) setProfessionalExpenses([...professionalExpenses, ...newProfessional]);
    if (newRevenue.length) setRevenue([...revenue, ...newRevenue]);

    const remaining = rows.filter((r) => !r.selected || r.importAs === 'skip');
    setRows(remaining);
    if (remaining.length === 0) setRows([]);
    alert(`Imported ${toImport.length} transactions.${remaining.length > 0 ? ` ${remaining.length} remaining.` : ''}`);
  }

  if (rows.length === 0) {
    return (
      <PageTransition>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div
              className="upload-zone"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
              onDrop={(e) => { e.currentTarget.classList.remove('dragover'); handleDrop(e); }}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="#6366f1" style={{ width: '3rem', height: '3rem', marginBottom: '0.5rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-gray-700 font-semibold text-base">Drop your bank statement here</div>
              <div className="text-gray-400 text-sm mt-1">{loading ? '⏳ Extracting from PDF…' : 'CSV or PDF supported'}</div>
              <div className="text-xs text-gray-400 mt-1 mb-4">HDFC · ICICI · SBI · Axis · Kotak · IndusInd</div>
              <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                Browse File
                <input ref={inputRef} type="file" accept=".csv,.txt,.pdf" style={{ display: 'none' }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </label>
            </div>
            {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">⚠ {error}</div>}
          </div>

          <div className="space-y-4">
            <div className="card">
              <div className="card-header"><span className="section-title">How to download your statement</span></div>
              <div className="card-body p-0">
                {[['HDFC', 'NetBanking → Accounts → Request → Download Statement → CSV'],
                  ['ICICI', 'iMobile / NetBanking → Accounts → Statement → Download CSV'],
                  ['SBI', 'YONO or NetBanking → Account Statement → Excel/CSV format'],
                  ['Axis', 'NetBanking → Accounts → Statement of Account → CSV'],
                  ['Kotak', 'NetBanking → Accounts → Account Statement → Download CSV'],
                ].map(([bank, steps]) => (
                  <div key={bank} className="flex gap-3 px-5 py-3 border-b border-gray-50 last:border-0">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{bank[0]}</div>
                    <div><div className="text-sm font-semibold text-gray-800">{bank}</div><div className="text-xs text-gray-500 mt-0.5">{steps}</div></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="section-title">What happens after upload</span></div>
              <div className="card-body">
                <div className="space-y-3 text-sm text-gray-600">
                  {['Transactions are parsed & auto-categorised', 'Review & edit each category before importing', 'Choose Personal Expense, Business Expense, or Revenue', 'Imported entries appear instantly in Finance sections'].map((s, i) => (
                    <div key={i} className="flex gap-2"><span className="text-indigo-500 font-bold">{i + 1}</span>{s}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const visible = filter === 'all' ? rows : rows.filter((r) => r.type === filter);
  const selected = rows.filter((r) => r.selected);

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800">{rows.length} transactions parsed</h2>
            <p className="text-sm text-gray-500">{selected.length} selected for import</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => setRows([])}>← Upload Another</button>
            <button className="btn btn-primary btn-sm" onClick={importSelected} disabled={selected.length === 0}>
              Import {selected.length} Selected
            </button>
          </div>
        </div>

        <div className="filter-tabs">
          {(['all', 'debit', 'credit'] as const).map((f) => (
            <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? rows.length : rows.filter((r) => r.type === f).length})
            </button>
          ))}
          <label className="flex items-center gap-2 ml-4 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox"
              checked={rows.every((r) => r.selected)}
              onChange={(e) => setRows(rows.map((r) => ({ ...r, selected: e.target.checked })))}
            />
            Select all
          </label>
        </div>

        <div className="card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                <th>Date</th><th>Description</th><th>Amount</th><th>Type</th><th>Category</th><th>Import As</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r, i) => (
                <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.02, 0.4) }}>
                  <td><input type="checkbox" checked={r.selected} onChange={(e) => updateRow(r.id, { selected: e.target.checked })} /></td>
                  <td className="text-sm">{formatDate(r.date)}</td>
                  <td className="text-sm max-w-xs truncate" title={r.description}>{r.description}</td>
                  <td className={`text-sm font-bold ${r.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(r.amount)}</td>
                  <td><span className={`badge badge-${r.type === 'credit' ? 'confirmed' : 'pending'}`}>{r.type}</span></td>
                  <td>
                    <select className="form-select" style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }} value={r.category} onChange={(e) => updateRow(r.id, { category: e.target.value })}>
                      {allCats.map((c) => <option key={c}>{c}</option>)}
                      <option>Other</option>
                    </select>
                  </td>
                  <td>
                    <select className="form-select" style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }} value={r.importAs} onChange={(e) => updateRow(r.id, { importAs: e.target.value as BankRow['importAs'] })}>
                      <option value="personal-expense">Personal Expense</option>
                      <option value="professional-expense">Business Expense</option>
                      <option value="revenue">Revenue</option>
                      <option value="skip">Skip</option>
                    </select>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
