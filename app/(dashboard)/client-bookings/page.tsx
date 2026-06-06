'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import PageTransition from '@/components/PageTransition';
import Badge from '@/components/Badge';
import { formatDate, formatCurrency, uid } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { ClientBooking, Revenue } from '@/lib/types';

export default function ClientBookingsPage() {
  const { clientBookings, setClientBookings, revenue, setRevenue } = useApp();
  const { open } = useModal();
  const [filter, setFilter] = useState<'all' | ClientBooking['status']>('all');
  const [toast, setToast]   = useState('');
  const [autoMsg, setAutoMsg] = useState('');
  const hasAutoRun = useRef(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTime  = new Date().toTimeString().slice(0, 5);

  // Auto-complete past confirmed bookings (once per day, after localStorage hydrates)
  useEffect(() => {
    if (clientBookings.length === 0 || hasAutoRun.current) return;
    hasAutoRun.current = true;

    const lastRun = localStorage.getItem('booking_auto_complete');
    if (lastRun === todayStr) return;
    localStorage.setItem('booking_auto_complete', todayStr);

    let count = 0;
    const autoRevenue: Revenue[] = [];

    const updated = clientBookings.map(b => {
      if (b.status !== 'confirmed') return b;
      const isPast = b.date < todayStr || (b.date === todayStr && b.time <= nowTime);
      if (!isPast) return b;
      count++;
      if (b.fee && b.fee > 0) {
        autoRevenue.push({
          id: uid(),
          title: `${b.service} — ${b.clientName}`,
          amount: b.fee,
          source: 'Client Booking',
          date: b.date,
          recurring: false,
        });
      }
      return { ...b, status: 'completed' as const };
    });

    if (count > 0) {
      setClientBookings(updated);
      if (autoRevenue.length > 0) setRevenue(prev => [...prev, ...autoRevenue]);
      const revenueTotal = autoRevenue.reduce((s, r) => s + r.amount, 0);
      setAutoMsg(
        `✓ ${count} past session${count > 1 ? 's' : ''} auto-completed` +
        (revenueTotal > 0 ? ` · ${formatCurrency(revenueTotal)} revenue added` : '')
      );
    }
  }, [clientBookings]); // eslint-disable-line react-hooks/exhaustive-deps

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  }

  // Complete a booking: auto-add revenue, schedule next recurring session
  function completeBooking(b: ClientBooking) {
    const msgs: string[] = [];

    let updatedBookings = clientBookings.map(cb =>
      cb.id === b.id ? { ...cb, status: 'completed' as const } : cb
    );

    // Auto-create revenue if fee is set
    if (b.fee && b.fee > 0) {
      const rev: Revenue = {
        id: uid(),
        title: `${b.service} — ${b.clientName}`,
        amount: b.fee,
        source: 'Client Booking',
        date: b.date,
        recurring: false,
      };
      setRevenue([...revenue, rev]);
      msgs.push(`💰 ${formatCurrency(b.fee)} revenue added`);
    }

    // Auto-schedule next session for recurring bookings
    if (b.recurrence && b.recurrence !== 'none') {
      const next = new Date(b.date);
      if      (b.recurrence === 'weekly')   next.setDate(next.getDate() + 7);
      else if (b.recurrence === 'biweekly') next.setDate(next.getDate() + 14);
      else if (b.recurrence === 'monthly')  next.setMonth(next.getMonth() + 1);

      const nextBooking: ClientBooking = {
        ...b,
        id: uid(),
        status: 'confirmed',
        date: next.toISOString().split('T')[0],
        syncedToGCal: false,
      };
      updatedBookings = [...updatedBookings, nextBooking];
      msgs.push(`↻ Next ${b.recurrence} session on ${formatDate(nextBooking.date)}`);
    }

    setClientBookings(updatedBookings);
    if (msgs.length > 0) showToast(msgs.join(' · '));
  }

  function confirmBooking(id: string) {
    setClientBookings(clientBookings.map(b => b.id === id ? { ...b, status: 'confirmed' } : b));
  }

  function del(id: string) {
    if (confirm('Delete this booking?')) setClientBookings(clientBookings.filter(b => b.id !== id));
  }

  // Derived lists
  const todayBookings    = clientBookings.filter(b => b.date === todayStr && b.status !== 'cancelled');
  const upcomingSessions = clientBookings
    .filter(b => b.date > todayStr && (b.status === 'confirmed' || b.status === 'pending'))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 4);
  const visible = filter === 'all' ? clientBookings : clientBookings.filter(b => b.status === filter);

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

        {/* Auto-complete notification */}
        <AnimatePresence>
          {autoMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center justify-between px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700"
            >
              <span>{autoMsg}</span>
              <button onClick={() => setAutoMsg('')} className="text-green-500 hover:text-green-700 ml-3 flex-shrink-0 text-base leading-none">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today's sessions */}
        {todayBookings.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card border-l-4 border-indigo-500">
            <div className="card-header">
              <span className="section-title">Today&apos;s Sessions</span>
              <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                {todayBookings.length} session{todayBookings.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="card-body">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {todayBookings.map(b => (
                  <motion.div
                    key={b.id} whileHover={{ y: -2 }}
                    className="flex-shrink-0 p-3 rounded-xl bg-indigo-50 border border-indigo-100 hover:border-indigo-300 transition-colors cursor-pointer min-w-[155px]"
                    onClick={() => open('booking', b as Record<string, unknown>)}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm mb-2">
                      {b.clientName[0]}
                    </div>
                    <div className="text-sm font-bold text-indigo-900 truncate">{b.clientName}</div>
                    <div className="text-xs text-indigo-600 mt-0.5">{b.time} · {b.duration}min</div>
                    <div className="text-xs text-indigo-500 truncate mt-0.5">{b.service}</div>
                    {b.fee && b.fee > 0 && (
                      <div className="text-xs font-bold text-green-600 mt-1">{formatCurrency(b.fee)}</div>
                    )}
                    <div className="mt-1.5"><Badge value={b.status} /></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Upcoming sessions */}
        {upcomingSessions.length > 0 && (
          <div className="card">
            <div className="card-header"><span className="section-title">Upcoming Sessions</span></div>
            <div className="card-body p-0">
              {upcomingSessions.map((b, i) => {
                const daysAway = Math.ceil(
                  (new Date(b.date).getTime() - new Date(todayStr).getTime()) / 86_400_000
                );
                return (
                  <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 px-5 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {b.clientName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-800">{b.clientName}</div>
                      <div className="text-xs text-gray-400">{b.service} · {b.time} · {b.duration}min</div>
                    </div>
                    {b.fee && b.fee > 0 && (
                      <span className="text-sm font-bold text-green-600">{formatCurrency(b.fee)}</span>
                    )}
                    {b.recurrence && b.recurrence !== 'none' && (
                      <span className="text-xs text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded">↻ {b.recurrence}</span>
                    )}
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-indigo-600">
                        {daysAway === 1 ? 'Tomorrow' : `In ${daysAway} days`}
                      </div>
                      <div className="text-xs text-gray-400">{formatDate(b.date)}</div>
                    </div>
                    <Badge value={b.status} />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter tabs + Add */}
        <div className="flex items-center justify-between">
          <div className="filter-tabs" style={{ margin: 0 }}>
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && ` (${clientBookings.filter(b => b.status === f).length})`}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => open('booking')}>+ Add Booking</button>
        </div>

        {/* Bookings list */}
        <div className="card">
          <div className="card-body p-0">
            {visible.length === 0
              ? <div className="empty-state"><p>No bookings found</p></div>
              : visible.map((b, i) => (
                <motion.div key={b.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {b.clientName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-800">{b.clientName}</span>
                      {b.recurrence && b.recurrence !== 'none' && (
                        <span className="text-xs text-purple-500 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded">
                          ↻ {b.recurrence}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400">{b.email}</div>
                  </div>
                  <div className="text-sm text-gray-600 hidden sm:block">{b.service}</div>
                  <div className="text-sm text-gray-500 flex-shrink-0">
                    {formatDate(b.date)} · {b.time} · {b.duration}min
                  </div>
                  {b.fee && b.fee > 0 && (
                    <div className="text-sm font-bold text-green-600 flex-shrink-0">{formatCurrency(b.fee)}</div>
                  )}
                  <Badge value={b.status} />
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {b.status === 'pending' && (
                      <button className="btn btn-sm btn-success" onClick={() => confirmBooking(b.id)}>Confirm</button>
                    )}
                    {b.status === 'confirmed' && (
                      <button className="btn btn-sm btn-primary" onClick={() => completeBooking(b)}>
                        Complete{b.fee && b.fee > 0 ? ' + Log Revenue' : ''}
                      </button>
                    )}
                    <button className="btn-icon" onClick={() => open('booking', b as Record<string, unknown>)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="btn-icon" onClick={() => del(b.id)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </motion.div>
              ))
            }
          </div>
        </div>

      </div>
    </PageTransition>
  );
}
