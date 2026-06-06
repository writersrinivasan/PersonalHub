'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import PageTransition from '@/components/PageTransition';
import Script from 'next/script';
import { motion } from 'framer-motion';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface GCalEvent { id: string; title: string; start: string; }

declare global {
  interface Window {
    gapi: { client: { calendar: { events: { list: (p: object) => Promise<{ result: { items: Array<{id: string; summary: string; start: {date?: string; dateTime?: string}}> } }> } } }; load: (a: string, cb: () => void) => void; init: (p: object) => Promise<void>; };
    google: { accounts: { oauth2: { initTokenClient: (p: object) => { requestAccessToken: (p?: object) => void }; } } };
    gcalToken: string | null;
    gcalClientId: string | null;
  }
}

export default function SchedulePage() {
  const { tasks, clientBookings } = useApp();
  const { open } = useModal();
  const [date, setDate] = useState(new Date());
  const [gcalEvents, setGcalEvents] = useState<GCalEvent[]>([]);
  const [gcalConnected, setGcalConnected] = useState(false);
  const [gapiReady, setGapiReady] = useState(false);
  const [gisReady, setGisReady] = useState(false);

  const clientId = typeof window !== 'undefined' ? localStorage.getItem('gcal_client_id') : null;

  const fetchEvents = useCallback(async () => {
    if (!window.gcalToken || !gapiReady) return;
    window.gapi.client.setToken?.({ access_token: window.gcalToken });
    const y = date.getFullYear(), m = date.getMonth();
    const res = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date(y, m, 1).toISOString(),
      timeMax: new Date(y, m + 1, 0, 23, 59).toISOString(),
      singleEvents: true, orderBy: 'startTime', maxResults: 100,
    });
    setGcalEvents(res.result.items.map((ev) => ({
      id: ev.id,
      title: ev.summary,
      start: (ev.start.date || ev.start.dateTime || '').slice(0, 10),
    })));
  }, [date, gapiReady]);

  useEffect(() => { if (gcalConnected) fetchEvents(); }, [date, gcalConnected, fetchEvents]);

  function onGapiLoad() {
    window.gapi.load('client', async () => {
      await window.gapi.init({ discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'] });
      setGapiReady(true);
    });
  }

  function onGisLoad() {
    if (!clientId) return;
    window.gcalClientId = clientId;
    setGisReady(true);
  }

  function connect() {
    if (!clientId) { open('gcal-setup'); return; }
    if (!gisReady) { alert('Google APIs are still loading...'); return; }
    const tc = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (resp: { access_token?: string }) => {
        if (resp.access_token) {
          window.gcalToken = resp.access_token;
          setGcalConnected(true);
          fetchEvents();
        }
      },
    });
    tc.requestAccessToken({ prompt: 'consent' });
  }

  const year = date.getFullYear(), month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => {
    if (i < firstDay) return null;
    const d = i - firstDay + 1;
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  });

  const eventsFor = (ds: string) => {
    const taskEvs = tasks.filter((t) => t.dueDate === ds).map((t) => ({ id: t.id, title: t.title, cls: t.type }));
    const bookEvs = clientBookings.filter((b) => b.date === ds && b.status !== 'cancelled').map((b) => ({ id: b.id, title: b.clientName, cls: 'client' }));
    const gEvs = gcalEvents.filter((e) => e.start === ds).map((e) => ({ id: e.id, title: e.title, cls: 'google' }));
    return [...taskEvs, ...bookEvs, ...gEvs];
  };

  return (
    <PageTransition>
      <Script src="https://apis.google.com/js/api.js" onLoad={onGapiLoad} strategy="afterInteractive" />
      <Script src="https://accounts.google.com/gsi/client" onLoad={onGisLoad} strategy="afterInteractive" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="btn btn-secondary btn-sm" onClick={() => setDate(new Date(year, month - 1))}>← Prev</button>
            <h2 className="font-bold text-gray-800 text-lg min-w-[180px] text-center">
              {date.toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
            </h2>
            <button className="btn btn-secondary btn-sm" onClick={() => setDate(new Date(year, month + 1))}>Next →</button>
          </div>
          <div className="flex items-center gap-3">
            {gcalConnected
              ? <span className="gcal-badge connected">● Google Calendar synced <button className="gcal-disconnect" onClick={() => { window.gcalToken = null; setGcalConnected(false); setGcalEvents([]); }}>Disconnect</button></span>
              : <button className="gcal-badge disconnected" onClick={connect}>Connect Google Calendar</button>}
            {gcalConnected && <button className="btn btn-secondary btn-sm" onClick={fetchEvents}>↺ Sync</button>}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {DAYS.map((d) => <div key={d} className="calendar-header-day" style={{ background: 'white', padding: '0.5rem 0', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af' }}>{d}</div>)}
            {cells.map((ds, idx) => {
              if (!ds) return <div key={idx} className="calendar-day other-month" />;
              const isToday = ds === todayStr;
              const evs = eventsFor(ds);
              const dayNum = parseInt(ds.slice(8));
              return (
                <div key={ds} className={`calendar-day ${isToday ? 'today' : ''}`} onClick={() => open('task', { dueDate: ds })}>
                  <div className={`day-num ${isToday ? 'flex items-center justify-center' : ''}`}
                    style={isToday ? { background: '#4f46e5', color: 'white', width: '1.4rem', height: '1.4rem', borderRadius: '50%', fontSize: '0.75rem' } : {}}>
                    {dayNum}
                  </div>
                  {evs.slice(0, 3).map((ev) => (
                    <div key={ev.id} className={`cal-event ${ev.cls}`} title={ev.title}>{ev.title}</div>
                  ))}
                  {evs.length > 3 && <div className="text-xs text-gray-400">+{evs.length - 3} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-indigo-100"></span> Personal tasks</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-green-100"></span> Professional tasks</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#ede9fe' }}></span> Client sessions</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#e8f0fe' }}></span> Google Calendar</span>
        </div>
      </div>
    </PageTransition>
  );
}
