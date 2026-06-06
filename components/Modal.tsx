'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useModal } from '@/context/ModalContext';
import TaskForm from './forms/TaskForm';
import ExpenseForm from './forms/ExpenseForm';
import RevenueForm from './forms/RevenueForm';
import BookingForm from './forms/BookingForm';
import QuickAdd from './forms/QuickAdd';
import GCalSetup from './forms/GCalSetup';

export default function Modal() {
  const { type, data, close } = useModal();

  const content: Record<string, React.ReactNode> = {
    task: <TaskForm data={data} />,
    expense: <ExpenseForm data={data} />,
    revenue: <RevenueForm data={data} />,
    booking: <BookingForm data={data} />,
    quickadd: <QuickAdd />,
    'gcal-setup': <GCalSetup />,
  };

  return (
    <AnimatePresence>
      {type && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0, transition: { duration: 0.2 } }}
            exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.15 } }}
          >
            {type && content[type]}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
