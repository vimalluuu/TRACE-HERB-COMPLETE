import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  GlobeAltIcon,
  UserGroupIcon,
  CubeIcon,
  TruckIcon,
  BeakerIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

import { DashboardLayout } from '../components/DashboardLayout';
import { MetricCard } from '../components/MetricCard';
import { NetworkHealthChart } from '../components/NetworkHealthChart';
import { RealtimeMap } from '../components/RealtimeMap';
import { TransactionFeed } from '../components/TransactionFeed';
import { QualityMetrics } from '../components/QualityMetrics';
import { SustainabilityDashboard } from '../components/SustainabilityDashboard';
import { AlertsPanel } from '../components/AlertsPanel';
import { ClientOnly } from '../components/ClientOnly';

const StakeholderDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ClientOnly fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      }>
        <div className="space-y-8">
          {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Stakeholder Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Real-time monitoring of TRACE HERB blockchain network
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Collections"
            value="15,847"
            change="+12.5%"
            changeType="positive"
            icon={<CubeIcon className="h-6 w-6 text-green-600" />}
          />
          <MetricCard
            title="Active Collectors"
            value="342"
            change="+8.2%"
            changeType="positive"
            icon={<UserGroupIcon className="h-6 w-6 text-blue-600" />}
          />
          <MetricCard
            title="Quality Score"
            value="94.2%"
            change="+2.1%"
            changeType="positive"
            icon={<BeakerIcon className="h-6 w-6 text-purple-600" />}
          />
          <MetricCard
            title="Network Health"
            value="98.5%"
            change="+0.5%"
            changeType="positive"
            icon={<ShieldCheckIcon className="h-6 w-6 text-green-600" />}
          />
        </div>

        {/* Charts and Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <NetworkHealthChart />
          <RealtimeMap />
        </div>

        {/* Quality Metrics and Sustainability */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QualityMetrics />
          <SustainabilityDashboard />
        </div>

        {/* Transaction Feed and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TransactionFeed />
          </div>
          <AlertsPanel />
        </div>
        </div>
      </ClientOnly>
    </DashboardLayout>
  );
};

export default StakeholderDashboard;
