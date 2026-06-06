'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ModalType } from '@/lib/types';

interface ModalCtx {
  type: ModalType;
  data: Record<string, unknown>;
  open: (type: NonNullable<ModalType>, data?: Record<string, unknown>) => void;
  close: () => void;
}

const Ctx = createContext<ModalCtx | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [type, setType] = useState<ModalType>(null);
  const [data, setData] = useState<Record<string, unknown>>({});

  const open = useCallback((t: NonNullable<ModalType>, d: Record<string, unknown> = {}) => {
    setType(t);
    setData(d);
  }, []);

  const close = useCallback(() => {
    setType(null);
    setData({});
  }, []);

  return <Ctx.Provider value={{ type, data, open, close }}>{children}</Ctx.Provider>;
}

export function useModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useModal must be used inside ModalProvider');
  return ctx;
}
