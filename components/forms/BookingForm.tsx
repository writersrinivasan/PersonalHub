'use client';

import { useApp } from '@/context/AppContext';
import { useModal } from '@/context/ModalContext';
import { uid, today } from '@/lib/utils';
import type { ClientBooking } from '@/lib/types';

const SERVICES = ['UI/UX Design', 'Web Development', 'Brand Identity', 'Consultation', 'Coaching', 'Photography', 'Other'];

export default function BookingForm({ data }: { data: Record<string, unknown> }) {
  const { clientBookings, setClientBookings } = useApp();
  const { close } = useModal();
  const existing = data as Partial<ClientBooking>;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const booking: ClientBooking = {
      id: existing.id || uid(),
      clientName: f.get('clientName') as string,
      email: f.get('email') as string,
      service: f.get('service') as string,
      date: f.get('date') as string,
      time: f.get('time') as string,
      duration: parseInt(f.get('duration') as string),
      status: (f.get('status') as ClientBooking['status']) || 'pending',
      notes: f.get('notes') as string,
    };
    if (existing.id) setClientBookings(clientBookings.map((b) => (b.id === existing.id ? booking : b)));
    else setClientBookings([...clientBookings, booking]);
    close();
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">{existing.id ? 'Edit Booking' : 'Add Client Booking'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Client Name *</label>
            <input name="clientName" className="form-input" defaultValue={existing.clientName} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-input" defaultValue={existing.email} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Service</label>
          <select name="service" className="form-select" defaultValue={existing.service || SERVICES[0]}>
            {SERVICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input name="date" type="date" className="form-input" defaultValue={existing.date || today()} />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input name="time" type="time" className="form-input" defaultValue={existing.time || '10:00'} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Duration (min)</label>
            <input name="duration" type="number" min="15" step="15" className="form-input" defaultValue={existing.duration || 60} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select name="status" className="form-select" defaultValue={existing.status || 'pending'}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea name="notes" className="form-textarea" defaultValue={existing.notes} />
        </div>
        <div className="flex gap-3 justify-end mt-2">
          <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
          <button type="submit" className="btn btn-primary">Save Booking</button>
        </div>
      </form>
    </div>
  );
}
