import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { ClientOnly } from './ClientOnly';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title = 'TRACE HERB Dashboard' 
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="TRACE HERB Stakeholder Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="min-h-screen dashboard-container">
        {/* Enhanced Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="dashboard-header sticky top-0 z-50"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo Section */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex items-center space-x-4"
              >
                <div className="logo-container">
                  <div className="logo w-12 h-12 flex items-center justify-center shadow-xl">
                    <span className="text-white font-black text-lg">TH</span>
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black gradient-text-hero">
                    TRACE HERB
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    Stakeholder Dashboard
                  </p>
                </div>
              </motion.div>

              {/* Status & Actions */}
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex items-center space-x-6"
              >
                {/* Live Status Indicator */}
                <div className="live-indicator flex items-center space-x-3">
                  <div className="relative">
                    <div className="pulse-dot w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-1 font-semibold text-green-600">Live</span>
                  </div>
                </div>

                {/* Network Health Badge */}
                <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Network Healthy</span>
                </div>

                {/* Time Display */}
                <ClientOnly fallback={<div className="hidden md:block text-sm text-gray-600">--:--:--</div>}>
                  <div className="hidden md:block text-sm text-gray-600">
                    {new Date().toLocaleTimeString()}
                  </div>
                </ClientOnly>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Enhanced Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            {children}
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.6 }}
          className="bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-600">
                © 2024 TRACE HERB. Blockchain-powered herb traceability.
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <ClientOnly fallback={<span>Last updated: Loading...</span>}>
                  <span>Last updated: {new Date().toLocaleString()}</span>
                </ClientOnly>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span>Real-time monitoring active</span>
              </div>
            </div>
          </div>
        </motion.footer>
      </div>
    </>
  );
};
