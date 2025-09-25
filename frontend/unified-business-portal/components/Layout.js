import { useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser, logout } from '../utils/auth';
import { 
  Bars3Icon, 
  XMarkIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const getNavigationItems = (role) => {
  const baseItems = [
    { name: 'Dashboard', href: `/${role}`, icon: HomeIcon },
    { name: 'Batches', href: `/${role}/batches`, icon: DocumentTextIcon },
    { name: 'Analytics', href: `/${role}/analytics`, icon: ChartBarIcon },
  ];

  const roleSpecificItems = {
    processor: [
      { name: 'Processing Queue', href: '/processor/queue', icon: DocumentTextIcon },
      { name: 'Quality Control', href: '/processor/quality', icon: ChartBarIcon },
    ],
    laboratory: [
      { name: 'Test Results', href: '/laboratory/tests', icon: DocumentTextIcon },
      { name: 'Quality Reports', href: '/laboratory/reports', icon: ChartBarIcon },
    ],
    regulatory: [
      { name: 'Compliance Review', href: '/regulatory/compliance', icon: DocumentTextIcon },
      { name: 'Approvals', href: '/regulatory/approvals', icon: ChartBarIcon },
    ],
    stakeholder: [
      { name: 'Supply Chain View', href: '/stakeholder/supply-chain', icon: DocumentTextIcon },
      { name: 'Performance Metrics', href: '/stakeholder/metrics', icon: ChartBarIcon },
    ],
    management: [
      { name: 'User Management', href: '/management/users', icon: UserCircleIcon },
      { name: 'System Settings', href: '/management/settings', icon: CogIcon },
    ],
  };

  return [...baseItems, ...(roleSpecificItems[role] || [])];
};

export default function Layout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const user = getCurrentUser();

  if (!user) {
    return <div>{children}</div>;
  }

  const navigation = getNavigationItems(user.role);

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent navigation={navigation} user={user} onLogout={handleLogout} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent navigation={navigation} user={user} onLogout={handleLogout} />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            
            <h1 className="text-lg font-semibold text-gray-900">
              {title || `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Portal`}
            </h1>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.name}</span>
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ navigation, user, onLogout }) {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="ml-3 text-lg font-semibold text-gray-900">TRACE HERB</span>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <UserCircleIcon className="h-10 w-10 text-gray-400" />
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role} Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <a
              key={item.name}
              href={item.href}
              className={`nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </a>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
        <button
          onClick={onLogout}
          className="nav-link nav-link-inactive w-full text-left"
        >
          <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );
}
