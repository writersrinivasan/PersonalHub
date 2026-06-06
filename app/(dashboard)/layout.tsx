'use client';

import { AppProvider } from '@/context/AppContext';
import { ModalProvider } from '@/context/ModalContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AppProvider>
      <ModalProvider>
        <div className="flex h-screen overflow-hidden bg-gray-50">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait" initial={false}>
                <div key={pathname}>{children}</div>
              </AnimatePresence>
            </main>
          </div>
          <Modal />
        </div>
      </ModalProvider>
    </AppProvider>
  );
}
