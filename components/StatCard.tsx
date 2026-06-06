'use client';

import { motion } from 'framer-motion';

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
  delay?: number;
}

export default function StatCard({ label, value, sub, iconBg, iconColor, icon, delay = 0 }: Props) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="stat-icon" style={{ background: iconBg }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={iconColor}>
            {icon}
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
