'use client';

import { usePathname } from 'next/navigation';
import { useModal } from '@/context/ModalContext';
import { useEffect, useState } from 'react';

const PAGE_META: Record<string, [string, string]> = {
  '/dashboard': ['Dashboard', 'Welcome back! Here\'s your overview.'],
  '/schedule': ['Calendar', 'Your schedule at a glance'],
  '/tasks': ['Tasks', 'Manage personal & professional tasks'],
  '/client-bookings': ['Client Bookings', 'Manage your client calendar'],
  '/personal-expenses': ['Personal Expenses', 'Track your personal spending'],
  '/professional-expenses': ['Business Expenses', 'Track business & tax-deductible expenses'],
  '/revenue': ['Revenue', 'Track income from all sources'],
  '/pnl': ['P&L Calculator', 'Profit & loss overview'],
  '/bank-statement': ['Bank Statement', 'Upload & import transactions from your bank'],
};

export default function Header() {
  const pathname = usePathname();
  const { open } = useModal();
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setDateStr(new Date().toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    }));
  }, []);

  const [title, subtitle] = PAGE_META[pathname] ?? ['', ''];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
      <div>
        <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{dateStr}</span>
        <button
          onClick={() => open('quickadd')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Quick Add
        </button>
      </div>
    </header>
  );
}
