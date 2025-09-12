import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  description?: string;
  delay?: number;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  description,
  delay = 0
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="dashboard-card metric-card group cursor-pointer relative overflow-hidden"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          {title}
        </h3>
        {icon && (
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="p-3 bg-gradient-to-br from-trace-green-100 to-trace-blue-100 rounded-xl text-trace-green-600 group-hover:from-trace-green-200 group-hover:to-trace-blue-200 transition-all duration-300"
          >
            {icon}
          </motion.div>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Value Display */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: delay + 0.2, duration: 0.5 }}
        >
          <p className="metric-value text-4xl font-black text-gray-900 leading-none">
            {value}
          </p>
        </motion.div>

        {/* Change Indicator */}
        {change && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.4, duration: 0.5 }}
            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${getChangeColor()}`}
          >
            <span className="text-lg leading-none">{getChangeIcon()}</span>
            <span>{change}</span>
          </motion.div>
        )}

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.6, duration: 0.5 }}
            className="text-sm text-gray-500 leading-relaxed"
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-trace-green-50/50 to-trace-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-trace-green-400 to-trace-blue-400 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </motion.div>
  );
};
