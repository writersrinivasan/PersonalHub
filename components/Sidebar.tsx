'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { motion } from 'framer-motion';

const NAV = [
  {
    section: 'Overview',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    ],
  },
  {
    section: 'Scheduling',
    items: [
      { href: '/schedule', label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { href: '/tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
      { href: '/client-bookings', label: 'Client Bookings', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    ],
  },
  {
    section: 'Finances',
    items: [
      { href: '/personal-expenses', label: 'Personal Expenses', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
      { href: '/professional-expenses', label: 'Business Expenses', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
      { href: '/revenue', label: 'Revenue', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
      { href: '/pnl', label: 'P&L Calculator', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { href: '/bank-statement', label: 'Bank Statement', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    ],
  },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.25 } } };

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();
  const name = user?.firstName || user?.username || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Srinivasan';

  return (
    <aside className="sidebar w-64 flex-shrink-0 flex flex-col">
      <div className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-400 rounded-xl flex items-center justify-center font-bold text-white text-lg">P</div>
          <div>
            <div className="text-white font-bold text-base leading-tight">PersonalHub</div>
            <div className="text-indigo-300 text-xs">Life Dashboard</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {NAV.map((group) => (
          <motion.div key={group.section} variants={container} initial="hidden" animate="show">
            <div className="nav-section-label">{group.section}</div>
            {group.items.map((navItem) => {
              const active = pathname === navItem.href || pathname.startsWith(navItem.href + '/');
              return (
                <motion.div key={navItem.href} variants={item}>
                  <Link href={navItem.href} className={`nav-item ${active ? 'active' : ''}`}>
                    <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={navItem.icon} />
                    </svg>
                    {navItem.label}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-indigo-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-full flex items-center justify-center font-semibold text-white text-sm flex-shrink-0">
            {name[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-white text-sm font-medium truncate">{name}</div>
            <div className="text-indigo-300 text-xs">Personal Account</div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <svg style={{ width: '0.9rem', height: '0.9rem', color: '#a5b4fc' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
