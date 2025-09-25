import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getCurrentUser, requireRole } from '../../utils/auth';
import { 
  ChartBarIcon, 
  TruckIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function StakeholderDashboard() {
  const router = useRouter();
  const [metrics, setMetrics] = useState({
    totalBatches: 0,
    activeFarmers: 0,
    monthlyRevenue: 0,
    supplyChainEfficiency: 0,
    qualityScore: 0,
    complianceRate: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (!requireRole(['stakeholder'], router)) return;
    
    // Fetch stakeholder data
    fetchMetrics();
    fetchRecentActivity();
  }, [router]);

  const fetchMetrics = async () => {
    try {
      // Mock data for stakeholder portal
      const mockMetrics = {
        totalBatches: 156,
        activeFarmers: 42,
        monthlyRevenue: 125000,
        supplyChainEfficiency: 87,
        qualityScore: 94,
        complianceRate: 96
      };
      
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const mockActivity = [
        {
          id: 1,
          type: 'batch_approved',
          message: 'Batch BATCH001 approved by regulatory',
          timestamp: '2024-01-16 10:30 AM',
          status: 'success'
        },
        {
          id: 2,
          type: 'quality_test',
          message: 'Quality test completed for Turmeric batch',
          timestamp: '2024-01-16 09:15 AM',
          status: 'info'
        },
        {
          id: 3,
          type: 'farmer_joined',
          message: 'New farmer registered: Sarah Green',
          timestamp: '2024-01-16 08:45 AM',
          status: 'success'
        },
        {
          id: 4,
          type: 'compliance_alert',
          message: 'Compliance review required for BATCH005',
          timestamp: '2024-01-15 04:20 PM',
          status: 'warning'
        }
      ];
      
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'batch_approved':
        return <DocumentTextIcon className="h-5 w-5 text-green-500" />;
      case 'quality_test':
        return <ChartBarIcon className="h-5 w-5 text-blue-500" />;
      case 'farmer_joined':
        return <UserGroupIcon className="h-5 w-5 text-green-500" />;
      case 'compliance_alert':
        return <DocumentTextIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Layout title="Stakeholder Dashboard">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Batches</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalBatches}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+12% from last month</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeFarmers}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+5 new this month</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.monthlyRevenue)}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+8% from last month</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Supply Chain Efficiency</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full" 
                    style={{ width: `${metrics.supplyChainEfficiency}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-900">{metrics.supplyChainEfficiency}%</span>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quality Score</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ width: `${metrics.qualityScore}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-900">{metrics.qualityScore}%</span>
            </div>
          </div>
          
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Rate</h3>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${metrics.complianceRate}%` }}
                  ></div>
                </div>
              </div>
              <span className="ml-3 text-lg font-semibold text-gray-900">{metrics.complianceRate}%</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
            <button className="btn-secondary">
              View All Activity
            </button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id} 
                className={`p-4 rounded-lg border ${getActivityColor(activity.status)}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn-primary text-center py-4">
              <ChartBarIcon className="h-6 w-6 mx-auto mb-2" />
              View Analytics
            </button>
            <button className="btn-secondary text-center py-4">
              <TruckIcon className="h-6 w-6 mx-auto mb-2" />
              Supply Chain Map
            </button>
            <button className="btn-secondary text-center py-4">
              <UserGroupIcon className="h-6 w-6 mx-auto mb-2" />
              Farmer Network
            </button>
            <button className="btn-secondary text-center py-4">
              <DocumentTextIcon className="h-6 w-6 mx-auto mb-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
