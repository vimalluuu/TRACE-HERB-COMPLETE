import Cookies from 'js-cookie';

// Portal user credentials
export const PORTAL_USERS = {
  processor: {
    username: 'processor_admin',
    password: 'processor123',
    role: 'processor',
    name: 'Processor Administrator',
    permissions: ['view_batches', 'process_batches', 'update_status']
  },
  laboratory: {
    username: 'lab_analyst',
    password: 'lab123',
    role: 'laboratory',
    name: 'Laboratory Analyst',
    permissions: ['view_batches', 'conduct_tests', 'approve_quality']
  },
  regulatory: {
    username: 'regulator_officer',
    password: 'regulatory123',
    role: 'regulatory',
    name: 'Regulatory Officer',
    permissions: ['view_batches', 'approve_batches', 'reject_batches', 'compliance_check']
  },
  stakeholder: {
    username: 'stakeholder_manager',
    password: 'stakeholder123',
    role: 'stakeholder',
    name: 'Stakeholder Manager',
    permissions: ['view_analytics', 'view_reports', 'monitor_supply_chain']
  },
  management: {
    username: 'system_admin',
    password: 'admin123',
    role: 'management',
    name: 'System Administrator',
    permissions: ['full_access', 'user_management', 'system_config', 'view_all']
  }
};

// Authentication functions
export const authenticateUser = (username, password) => {
  const user = Object.values(PORTAL_USERS).find(
    u => u.username === username && u.password === password
  );
  
  if (user) {
    const authData = {
      username: user.username,
      role: user.role,
      name: user.name,
      permissions: user.permissions,
      loginTime: new Date().toISOString()
    };
    
    // Store in cookie (expires in 24 hours)
    Cookies.set('auth_user', JSON.stringify(authData), { expires: 1 });
    return authData;
  }
  
  return null;
};

export const getCurrentUser = () => {
  try {
    const authCookie = Cookies.get('auth_user');
    return authCookie ? JSON.parse(authCookie) : null;
  } catch (error) {
    console.error('Error parsing auth cookie:', error);
    return null;
  }
};

export const logout = () => {
  Cookies.remove('auth_user');
  window.location.href = '/login';
};

export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

export const hasPermission = (permission) => {
  const user = getCurrentUser();
  return user && user.permissions.includes(permission);
};

export const requireAuth = (router) => {
  if (typeof window !== 'undefined' && !isAuthenticated()) {
    router.push('/login');
    return false;
  }
  return true;
};

export const requireRole = (allowedRoles, router) => {
  const user = getCurrentUser();
  if (!user || !allowedRoles.includes(user.role)) {
    router.push('/unauthorized');
    return false;
  }
  return true;
};
