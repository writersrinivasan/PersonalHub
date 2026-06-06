'use client';

import { useState } from 'react';
import { useModal } from '@/context/ModalContext';

export default function GCalSetup() {
  const { close } = useModal();
  const [cid, setCid] = useState(() => localStorage.getItem('gcal_client_id') || '');

  function save() {
    if (!cid.trim()) return;
    localStorage.setItem('gcal_client_id', cid.trim());
    close();
    window.location.reload();
  }

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-1">Connect Google Calendar</h2>
      <p className="text-sm text-gray-500 mb-5">Enter your OAuth 2.0 Client ID from Google Cloud Console.</p>
      <div className="form-group">
        <label className="form-label">Client ID</label>
        <input
          className="form-input"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          placeholder="xxxx.apps.googleusercontent.com"
        />
      </div>
      <p className="text-xs text-gray-400 mb-4">
        See SETUP_GOOGLE_CALENDAR.md for step-by-step instructions.
      </p>
      <div className="flex gap-3 justify-end">
        <button className="btn btn-secondary" onClick={close}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>Save &amp; Authorize</button>
      </div>
    </div>
  );
}
