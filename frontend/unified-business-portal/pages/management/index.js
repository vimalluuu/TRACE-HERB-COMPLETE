import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { getCurrentUser, requireRole } from '../../utils/auth';
import { 
  UserGroupIcon, 
  CogIcon, 
  ServerIcon, 
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function ManagementDashboard() {
  const router = useRouter();
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    systemUptime: 0,
    totalTransactions: 0,
    pendingApprovals: 0,
    systemAlerts: 0
  });

  const [users, setUsers] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);

  useEffect(() => {
    if (!requireRole(['management'], router)) return;
    
    // Fetch management data
    fetchSystemStats();
    fetchUsers();
    fetchSystemAlerts();
  }, [router]);

  const fetchSystemStats = async () => {
    try {
      // Mock data for management portal
      const mockStats = {
        totalUsers: 89,
        activeUsers: 67,
        systemUptime: 99.8,
        totalTransactions: 1247,
        pendingApprovals: 12,
        systemAlerts: 3
      };
      
      setSystemStats(mockStats);
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const mockUsers = [
        {
          id: 1,
          name: 'John Farmer',
          email: 'john@example.com',
          role: 'farmer',
          status: 'active',
          lastLogin: '2024-01-16 10:30 AM'
        },
        {
          id: 2,
          name: 'Processor Admin',
          email: 'processor@example.com',
          role: 'processor',
          status: 'active',
          lastLogin: '2024-01-16 09:15 AM'
        },
        {
          id: 3,
          name: 'Lab Analyst',
          email: 'lab@example.com',
          role: 'laboratory',
          status: 'active',
          lastLogin: '2024-01-16 08:45 AM'
        },
        {
          id: 4,
          name: 'Regulatory Officer',
          email: 'regulator@example.com',
          role: 'regulatory',
          status: 'inactive',
          lastLogin: '2024-01-15 04:20 PM'
        }
      ];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSystemAlerts = async () => {
    try {
      const mockAlerts = [
        {
          id: 1,
          type: 'warning',
          message: 'High server load detected',
          timestamp: '2024-01-16 10:30 AM',
          severity: 'medium'
        },
        {
          id: 2,
          type: 'info',
          message: 'Scheduled maintenance in 24 hours',
          timestamp: '2024-01-16 09:15 AM',
          severity: 'low'
        },
        {
          id: 3,
          type: 'error',
          message: 'Failed backup process',
          timestamp: '2024-01-16 08:45 AM',
          severity: 'high'
        }
      ];
      
      setSystemAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'farmer':
        return 'bg-green-100 text-green-800';
      case 'processor':
        return 'bg-blue-100 text-blue-800';
      case 'laboratory':
        return 'bg-purple-100 text-purple-800';
      case 'regulatory':
        return 'bg-yellow-100 text-yellow-800';
      case 'management':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Layout title="Management Dashboard">
      <div className="space-y-6">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                <p className="text-sm text-green-600">{systemStats.activeUsers} active</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ServerIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">System Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.systemUptime}%</p>
                <p className="text-sm text-green-600">Excellent</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.totalTransactions}</p>
                <p className="text-sm text-blue-600">This month</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts and Pending Items */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">System Alerts</h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {systemStats.systemAlerts} active
              </span>
            </div>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border ${getAlertColor(alert.severity)}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Pending Approvals</h3>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {systemStats.pendingApprovals} pending
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">User Registration Requests</p>
                  <p className="text-xs text-gray-500">5 pending</p>
                </div>
                <button className="btn-primary text-xs">Review</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">System Configuration Changes</p>
                  <p className="text-xs text-gray-500">3 pending</p>
                </div>
                <button className="btn-primary text-xs">Review</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Role Permission Updates</p>
                  <p className="text-xs text-gray-500">4 pending</p>
                </div>
                <button className="btn-primary text-xs">Review</button>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">User Management</h2>
            <button className="btn-primary">
              Add New User
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.lastLogin}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-6">System Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn-primary text-center py-4">
              <UserGroupIcon className="h-6 w-6 mx-auto mb-2" />
              User Management
            </button>
            <button className="btn-secondary text-center py-4">
              <CogIcon className="h-6 w-6 mx-auto mb-2" />
              System Settings
            </button>
            <button className="btn-secondary text-center py-4">
              <ShieldCheckIcon className="h-6 w-6 mx-auto mb-2" />
              Security Audit
            </button>
            <button className="btn-secondary text-center py-4">
              <ServerIcon className="h-6 w-6 mx-auto mb-2" />
              System Logs
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
