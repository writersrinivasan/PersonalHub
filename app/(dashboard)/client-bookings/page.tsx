'use client';

import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import PageTransition from '@/components/PageTransition';
import Badge from '@/components/Badge';
import { formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { ClientBooking } from '@/lib/types';

export default function ClientBookingsPage() {
  const { clientBookings, setClientBookings } = useApp();
  const { open } = useModal();
  const [filter, setFilter] = useState<'all' | ClientBooking['status']>('all');

  const visible = filter === 'all' ? clientBookings : clientBookings.filter((b) => b.status === filter);

  const updateStatus = (id: string, status: ClientBooking['status']) => {
    setClientBookings(clientBookings.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  const del = (id: string) => {
    if (confirm('Delete this booking?')) setClientBookings(clientBookings.filter((b) => b.id !== id));
  };

  return (
    <PageTransition>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="filter-tabs" style={{ margin: 0 }}>
            {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((f) => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${clientBookings.filter((b) => b.status === f).length})`}
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => open('booking')}>+ Add Booking</button>
        </div>

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
                    <div className="font-semibold text-gray-800">{b.clientName}</div>
                    <div className="text-xs text-gray-400">{b.email}</div>
                  </div>
                  <div className="text-sm text-gray-600">{b.service}</div>
                  <div className="text-sm text-gray-500">{formatDate(b.date)} · {b.time} · {b.duration}min</div>
                  <Badge value={b.status} />
                  <div className="flex items-center gap-1">
                    {b.status === 'pending' && <button className="btn btn-sm btn-success" onClick={() => updateStatus(b.id, 'confirmed')}>Confirm</button>}
                    {b.status === 'confirmed' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(b.id, 'completed')}>Complete</button>}
                    <button className="btn-icon" onClick={() => open('booking', b as Record<string, unknown>)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button className="btn-icon" onClick={() => del(b.id)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
