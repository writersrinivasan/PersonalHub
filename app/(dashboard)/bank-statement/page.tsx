'use client';

import { useState, useRef, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import PageTransition from '@/components/PageTransition';
import { formatCurrency, formatDate, uid } from '@/lib/utils';
import { parseBankCsv, parseBankPdf } from '@/lib/parsers';
import { AUTO_CATEGORIES } from '@/lib/categories';
import type { BankRow, Expense, Revenue } from '@/lib/types';
import { motion } from 'framer-motion';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

const CAT_COLORS: Record<string, string> = {
  Food: '#f59e0b', Transport: '#3b82f6', Utilities: '#14b8a6',
  Shopping: '#ec4899', Health: '#10b981', Entertainment: '#8b5cf6',
  Finance: '#ef4444', Education: '#6366f1', Other: '#9ca3af',
};

function upiMerchant(desc: string): string {
  if (/^UPI\//i.test(desc)) return desc.replace(/^UPI\//i, '').split('/')[0].trim();
  const m = desc.match(/^(?:RTGS|NEFT|IMPS)\s+\S+\s+(.*)/i);
  if (m) return m[1].slice(0, 24).trim();
  return desc.slice(0, 24).trim();
}

type Insight = { type: 'warning' | 'tip' | 'info'; icon: string; title: string; desc: string };

function buildInsights(rows: BankRow[]): Insight[] {
  const debits = rows.filter(r => r.type === 'debit');
  const credits = rows.filter(r => r.type === 'credit');
  const totalSpend = debits.reduce((s, r) => s + r.amount, 0);
  const totalIn = credits.reduce((s, r) => s + r.amount, 0);
  const out: Insight[] = [];

  // Net outflow warning
  if (totalSpend > totalIn && totalIn > 0) {
    out.push({ type: 'warning', icon: '📉', title: 'Spent more than received', desc: `Net outflow of ${formatCurrency(totalSpend - totalIn)}. Review large debits to improve cash balance.` });
  }

  // Top category
  const catMap: Record<string, number> = {};
  debits.forEach(r => { catMap[r.category] = (catMap[r.category] || 0) + r.amount; });
  const topEntries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);
  if (topEntries[0] && totalSpend > 0) {
    const [topCat, topAmt] = topEntries[0];
    const pct = Math.round((topAmt / totalSpend) * 100);
    if (pct >= 20) {
      out.push({
        type: 'warning', icon: '⚠️',
        title: `${topCat} dominates at ${pct}% of spend`,
        desc: `${formatCurrency(topAmt)} on ${topCat.toLowerCase()}. ${topCat === 'Finance' ? 'Check if credit card balances are cleared in full to avoid interest.' : `Explore ways to reduce ${topCat.toLowerCase()} costs.`}`,
      });
    }
  }

  // Credit card payments
  const ccKeywords = ['hdfc bank credi', 'rbl bank credit', 'american expres', 'sbi card', 'icici bank credi', 'axis bank credi'];
  const ccRows = debits.filter(r => ccKeywords.some(k => r.description.toLowerCase().includes(k)));
  const ccTotal = ccRows.reduce((s, r) => s + r.amount, 0);
  if (ccTotal > 0) {
    out.push({ type: 'tip', icon: '💳', title: `${formatCurrency(ccTotal)} paid to credit cards`, desc: `${ccRows.length} payment${ccRows.length > 1 ? 's' : ''} detected. Upload your card statements too for a complete picture.` });
  }

  // Recurring merchants (4+ times)
  const mCount: Record<string, { n: number; total: number }> = {};
  debits.forEach(r => {
    const m = upiMerchant(r.description);
    if (!mCount[m]) mCount[m] = { n: 0, total: 0 };
    mCount[m].n++; mCount[m].total += r.amount;
  });
  Object.entries(mCount)
    .filter(([, v]) => v.n >= 4)
    .sort((a, b) => b[1].n - a[1].n)
    .slice(0, 2)
    .forEach(([name, v]) => {
      out.push({ type: 'info', icon: '🔄', title: `"${name}" — ${v.n}× this period`, desc: `Total ${formatCurrency(v.total)} across ${v.n} payments. Is this a necessary recurring expense?` });
    });

  // Biggest single debit
  const biggestDebit = [...debits].sort((a, b) => b.amount - a.amount)[0];
  if (biggestDebit && biggestDebit.amount >= 5000 && totalSpend > 0) {
    const pct = Math.round((biggestDebit.amount / totalSpend) * 100);
    out.push({ type: 'info', icon: '💰', title: `Biggest spend: ${formatCurrency(biggestDebit.amount)} (${pct}%)`, desc: `${upiMerchant(biggestDebit.description)} on ${formatDate(biggestDebit.date)}.` });
  }

  // Savings rate tip
  if (totalIn > 0 && totalSpend < totalIn) {
    const rate = Math.round(((totalIn - totalSpend) / totalIn) * 100);
    if (rate < 20) {
      out.push({ type: 'tip', icon: '🏦', title: `Savings rate: ${rate}% — aim for 20%+`, desc: `Saved ${formatCurrency(totalIn - totalSpend)} of ${formatCurrency(totalIn)} received. Small cuts in top categories can significantly boost this.` });
    }
  }

  return out;
}

export default function BankStatementPage() {
  const { setPersonalExpenses, setProfessionalExpenses, setRevenue, personalExpenses, professionalExpenses, revenue } = useApp();
  const [rows, setRows] = useState<BankRow[]>([]);
  const [filter, setFilter] = useState<'all' | 'debit' | 'credit'>('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'overview' | 'transactions'>('overview');

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
      setView('overview');
    } else {
      const text = await file.text();
      const result = parseBankCsv(text);
      if (!Array.isArray(result)) { setError(result.error); return; }
      setRows(result);
      setView('overview');
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
    setRows(rows.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  function importSelected() {
    const toImport = rows.filter(r => r.selected && r.importAs !== 'skip');
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

    const remaining = rows.filter(r => !r.selected || r.importAs === 'skip');
    setRows(remaining.length > 0 ? remaining : []);
    alert(`Imported ${toImport.length} transactions.${remaining.length > 0 ? ` ${remaining.length} remaining.` : ''}`);
  }

  const totalDebit = useMemo(() => rows.filter(r => r.type === 'debit').reduce((s, r) => s + r.amount, 0), [rows]);
  const totalCredit = useMemo(() => rows.filter(r => r.type === 'credit').reduce((s, r) => s + r.amount, 0), [rows]);
  const netFlow = totalCredit - totalDebit;

  const categoryStats = useMemo(() => {
    const map: Record<string, { debit: number; credit: number; count: number }> = {};
    for (const r of rows) {
      if (!map[r.category]) map[r.category] = { debit: 0, credit: 0, count: 0 };
      if (r.type === 'debit') map[r.category].debit += r.amount;
      else map[r.category].credit += r.amount;
      map[r.category].count++;
    }
    return Object.entries(map).map(([cat, v]) => ({ cat, ...v })).sort((a, b) => b.debit - a.debit);
  }, [rows]);

  const insights = useMemo(() => buildInsights(rows), [rows]);

  const debitCats = categoryStats.filter(c => c.debit > 0);
  const doughnutData = {
    labels: debitCats.map(c => c.cat),
    datasets: [{
      data: debitCats.map(c => c.debit),
      backgroundColor: debitCats.map(c => CAT_COLORS[c.cat] ?? '#9ca3af'),
      borderWidth: 3, borderColor: '#fff', hoverOffset: 8,
    }],
  };

  const csvRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  // ── Upload view ──────────────────────────────────────────────────────────────
  if (rows.length === 0) {
    return (
      <PageTransition>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div
              className="upload-zone"
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
              onDragLeave={(e) => e.currentTarget.classList.remove('dragover')}
              onDrop={(e) => { e.currentTarget.classList.remove('dragover'); handleDrop(e); }}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="#6366f1" style={{ width: '2.75rem', height: '2.75rem', marginBottom: '0.25rem' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="text-gray-700 font-semibold">Drop your bank statement here</div>
              {loading
                ? <div className="text-indigo-500 text-sm font-medium mt-1">⏳ Extracting transactions from PDF…</div>
                : <div className="text-gray-400 text-xs mt-1">CSV · PDF · TXT &nbsp;|&nbsp; HDFC · ICICI · SBI · Axis · Kotak</div>
              }
            </div>

            <div className="grid grid-cols-2 gap-3">
              <motion.label whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-green-700">Upload CSV</div>
                  <div className="text-xs text-green-500 mt-0.5">.csv · .txt</div>
                  <div className="text-xs text-gray-400 mt-1">Most reliable format</div>
                </div>
                <input ref={csvRef} type="file" accept=".csv,.txt" style={{ display: 'none' }}
                  onChange={(e) => { if (e.target.files?.[0]) { handleFile(e.target.files[0]); e.target.value = ''; } }} />
              </motion.label>

              <motion.label whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-red-200 bg-red-50 hover:border-red-400 hover:bg-red-100 transition-all cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-red-600">Upload PDF</div>
                  <div className="text-xs text-red-400 mt-0.5">.pdf</div>
                  <div className="text-xs text-gray-400 mt-1">Text-based PDFs only</div>
                </div>
                <input ref={pdfRef} type="file" accept=".pdf" style={{ display: 'none' }}
                  onChange={(e) => { if (e.target.files?.[0]) { handleFile(e.target.files[0]); e.target.value = ''; } }} />
              </motion.label>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                ⚠ {error}
              </motion.div>
            )}
          </div>

          <div className="space-y-4">
            <div className="card">
              <div className="card-header"><span className="section-title">How to download your statement</span></div>
              <div className="card-body p-0">
                {[
                  ['HDFC', 'NetBanking → Accounts → Request → Download Statement → CSV'],
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
                  {['Transactions are parsed & auto-categorised', 'Category-wise breakdown with spending insights', 'Review & edit each category before importing', 'Imported entries appear instantly in Finance sections'].map((s, i) => (
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

  // ── Results view ─────────────────────────────────────────────────────────────
  const selected = rows.filter(r => r.selected);
  const visible = filter === 'all' ? rows : rows.filter(r => r.type === filter);

  return (
    <PageTransition>
      <div className="space-y-4">

        {/* Header bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="btn btn-secondary btn-sm" onClick={() => setRows([])}>← Upload Another</button>
            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
              {(['overview', 'transactions'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === v ? 'bg-white shadow text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                  {v === 'overview' ? '📊 Overview' : '📋 Transactions'}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-400">{rows.length} transactions · {selected.length} selected</span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={importSelected} disabled={selected.length === 0}>
            Import {selected.length} Selected
          </button>
        </div>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
        {view === 'overview' && (
          <div className="space-y-4">

            {/* Summary cards */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total Spent', value: formatCurrency(totalDebit), color: '#ef4444', bg: '#fee2e2' },
                { label: 'Total Received', value: formatCurrency(totalCredit), color: '#10b981', bg: '#d1fae5' },
                { label: 'Net Flow', value: (netFlow >= 0 ? '+' : '−') + formatCurrency(Math.abs(netFlow)), color: netFlow >= 0 ? '#10b981' : '#ef4444', bg: netFlow >= 0 ? '#d1fae5' : '#fee2e2' },
                { label: 'Transactions', value: String(rows.length), color: '#6366f1', bg: '#e0e7ff' },
              ].map((s, i) => (
                <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
                  <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Doughnut + Insights */}
            <div className="grid grid-cols-5 gap-4">

              {/* Spending doughnut */}
              <div className="col-span-2 card">
                <div className="card-header"><span className="section-title">Spending by Category</span></div>
                <div className="card-body">
                  {debitCats.length > 0 ? (
                    <>
                      <div style={{ height: 190 }} className="relative">
                        <Doughnut data={doughnutData} options={{
                          responsive: true, maintainAspectRatio: false, cutout: '66%',
                          plugins: {
                            legend: { display: false },
                            tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${formatCurrency(ctx.raw as number)} (${Math.round((ctx.raw as number / totalDebit) * 100)}%)` } },
                          },
                        }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <p className="text-xs text-gray-400 font-medium">Total Spent</p>
                          <p className="text-sm font-bold text-gray-800">{formatCurrency(totalDebit)}</p>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {debitCats.map(c => (
                          <div key={c.cat} className="flex items-center gap-1.5 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[c.cat] ?? '#9ca3af' }} />
                            <span className="text-xs text-gray-600 truncate">{c.cat}</span>
                            <span className="text-xs font-bold text-gray-700 ml-auto">{Math.round((c.debit / totalDebit) * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400 py-10 text-sm">No debit transactions</div>
                  )}
                </div>
              </div>

              {/* Smart insights */}
              <div className="col-span-3 card">
                <div className="card-header">
                  <span className="section-title">Spending Insights</span>
                  <span className="text-xs text-gray-400">{insights.length} observation{insights.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="card-body space-y-2 overflow-y-auto" style={{ maxHeight: 330 }}>
                  {insights.length === 0 ? (
                    <div className="text-center text-gray-400 py-10 text-sm">✅ No spending concerns detected</div>
                  ) : insights.map((ins, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className={`flex gap-3 p-3 rounded-xl border ${ins.type === 'warning' ? 'bg-red-50 border-red-200' : ins.type === 'tip' ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
                      <span className="text-lg leading-none flex-shrink-0 mt-0.5">{ins.icon}</span>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold leading-snug ${ins.type === 'warning' ? 'text-red-700' : ins.type === 'tip' ? 'text-blue-700' : 'text-amber-700'}`}>{ins.title}</p>
                        <p className={`text-xs mt-0.5 leading-relaxed ${ins.type === 'warning' ? 'text-red-600' : ins.type === 'tip' ? 'text-blue-600' : 'text-amber-600'}`}>{ins.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category breakdown table */}
            <div className="card">
              <div className="card-header"><span className="section-title">Category Breakdown</span></div>
              <div className="card-body p-0">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Spent</th>
                      <th style={{ width: '28%' }}>Share of spend</th>
                      <th>Received</th>
                      <th>Transactions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryStats.map((c, i) => {
                      const pct = totalDebit > 0 ? (c.debit / totalDebit) * 100 : 0;
                      const color = CAT_COLORS[c.cat] ?? '#9ca3af';
                      return (
                        <motion.tr key={c.cat} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                              <span className="text-sm font-medium text-gray-800">{c.cat}</span>
                            </div>
                          </td>
                          <td className={`text-sm font-bold ${c.debit > 0 ? 'text-red-500' : 'text-gray-300'}`}>
                            {c.debit > 0 ? formatCurrency(c.debit) : '—'}
                          </td>
                          <td>
                            {c.debit > 0 ? (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                  <motion.div className="h-1.5 rounded-full" style={{ background: color }}
                                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.2 + i * 0.03, duration: 0.5 }} />
                                </div>
                                <span className="text-xs text-gray-500 w-7 text-right">{pct.toFixed(0)}%</span>
                              </div>
                            ) : <span className="text-gray-300 text-xs">—</span>}
                          </td>
                          <td className={`text-sm font-medium ${c.credit > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                            {c.credit > 0 ? formatCurrency(c.credit) : '—'}
                          </td>
                          <td className="text-sm text-gray-500">{c.count}</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TRANSACTIONS TAB ─────────────────────────────────────────────── */}
        {view === 'transactions' && (
          <div className="space-y-3">
            <div className="filter-tabs">
              {(['all', 'debit', 'credit'] as const).map(f => (
                <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                  {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? rows.length : rows.filter(r => r.type === f).length})
                </button>
              ))}
              <label className="flex items-center gap-2 ml-4 text-sm text-gray-600 cursor-pointer">
                <input type="checkbox"
                  checked={rows.every(r => r.selected)}
                  onChange={e => setRows(rows.map(r => ({ ...r, selected: e.target.checked })))} />
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
                    <motion.tr key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(i * 0.015, 0.4) }}>
                      <td><input type="checkbox" checked={r.selected} onChange={e => updateRow(r.id, { selected: e.target.checked })} /></td>
                      <td className="text-sm">{formatDate(r.date)}</td>
                      <td className="text-sm max-w-xs truncate" title={r.description}>{r.description}</td>
                      <td className={`text-sm font-bold ${r.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(r.amount)}</td>
                      <td><span className={`badge badge-${r.type === 'credit' ? 'confirmed' : 'pending'}`}>{r.type}</span></td>
                      <td>
                        <select className="form-select" style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          value={r.category} onChange={e => updateRow(r.id, { category: e.target.value })}>
                          {allCats.map(c => <option key={c}>{c}</option>)}
                          <option>Other</option>
                        </select>
                      </td>
                      <td>
                        <select className="form-select" style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                          value={r.importAs} onChange={e => updateRow(r.id, { importAs: e.target.value as BankRow['importAs'] })}>
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
        )}

      </div>
    </PageTransition>
  );
}
