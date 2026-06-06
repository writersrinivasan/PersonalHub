'use client';

import { useApp } from '@/context/AppContext';
import PageTransition from '@/components/PageTransition';
import { formatCurrency } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

export default function PnLPage() {
  const { personalExpenses, professionalExpenses, revenue } = useApp();

  const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
  const totalPersonal = personalExpenses.reduce((s, e) => s + e.amount, 0);
  const totalProfessional = professionalExpenses.reduce((s, e) => s + e.amount, 0);
  const totalExpenses = totalPersonal + totalProfessional;
  const taxDeductible = professionalExpenses.filter((e) => e.taxDeductible).reduce((s, e) => s + e.amount, 0);
  const netPnL = totalRevenue - totalExpenses;
  const margin = totalRevenue > 0 ? ((netPnL / totalRevenue) * 100).toFixed(1) : '0';

  const revenueBySource: Record<string, number> = {};
  revenue.forEach((r) => { revenueBySource[r.source] = (revenueBySource[r.source] || 0) + r.amount; });

  const barData = {
    labels: ['Revenue', 'Personal Exp', 'Business Exp', 'Net P&L'],
    datasets: [{
      data: [totalRevenue, -totalPersonal, -totalProfessional, netPnL],
      backgroundColor: [
        netPnL >= 0 ? '#6366f1' : '#f43f5e',
        '#f43f5e', '#f59e0b',
        netPnL >= 0 ? '#10b981' : '#dc2626',
      ],
      borderRadius: 8,
    }],
  };

  const Row = ({ label, value, bold, positive }: { label: string; value: string; bold?: boolean; positive?: boolean }) => (
    <motion.div className={`pnl-row ${bold ? 'pnl-total' : ''}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
      <span className={`text-sm ${bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{label}</span>
      <span className={`font-bold ${positive === true ? 'pnl-positive' : positive === false ? 'pnl-negative' : ''}`}>{value}</span>
    </motion.div>
  );

  return (
    <PageTransition>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="card">
            <div className="card-header"><span className="section-title">Income Statement</span></div>
            <div className="card-body">
              <Row label="Gross Revenue" value={formatCurrency(totalRevenue)} positive={true} />
              {Object.entries(revenueBySource).map(([src, amt]) => (
                <Row key={src} label={`  › ${src}`} value={formatCurrency(amt)} />
              ))}
              <div className="mt-3">
                <Row label="Personal Expenses" value={`− ${formatCurrency(totalPersonal)}`} positive={false} />
                <Row label="Business Expenses" value={`− ${formatCurrency(totalProfessional)}`} positive={false} />
                <Row label="  › Tax Deductible" value={formatCurrency(taxDeductible)} positive={true} />
              </div>
              <Row label="Total Expenses" value={formatCurrency(totalExpenses)} positive={false} bold />
              <Row label="Net Profit / Loss" value={formatCurrency(netPnL)} positive={netPnL >= 0} bold />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Revenue', value: formatCurrency(totalRevenue), color: '#6366f1', bg: '#e0e7ff' },
              { label: 'Total Expenses', value: formatCurrency(totalExpenses), color: '#f43f5e', bg: '#fee2e2' },
              { label: 'Net P&L', value: formatCurrency(netPnL), color: netPnL >= 0 ? '#10b981' : '#dc2626', bg: netPnL >= 0 ? '#d1fae5' : '#fee2e2' },
              { label: 'Profit Margin', value: `${margin}%`, color: '#8b5cf6', bg: '#ede9fe' },
            ].map((s, i) => (
              <motion.div key={s.label} className="stat-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
                <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="section-title">Financial Overview</span></div>
          <div className="card-body" style={{ height: 300 }}>
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#f3f4f6' } } } }} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
