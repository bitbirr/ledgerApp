import { useAuthStore } from '@/lib/auth-store';
import { useAppStore } from '@/lib/store';

// Authentication guard HOC
export const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { isAuthenticated, token, isTokenExpired } = useAuthStore();
    
    if (!isAuthenticated || !token) {
      // Redirect to login
      return null; // In a real implementation, this would redirect to login
    }
    
    // Check token expiration
    if (isTokenExpired()) {
      // Try to refresh token
      return null; // In a real implementation, this would redirect to login
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Role guard HOC
export const withRole = (allowedRoles: ('SuperAdmin' | 'Admin' | 'Staff')[]) => {
  return (WrappedComponent: React.ComponentType) => {
    return (props: any) => {
      const { role } = useAuthStore();
      
      if (!role || !allowedRoles.includes(role)) {
        // Show unauthorized page or redirect
        return null; // In a real implementation, this would redirect to unauthorized page
      }
      
      return <WrappedComponent {...props} />;
    };
  };
};

// Branch scope guard HOC
export const withBranchScope = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { role, branchId, isAuthorizedForBranch } = useAuthStore();
    const requestedBranchId = props.branchId || props.match?.params?.branchId;
    
    // SuperAdmin can access any branch
    if (role === 'SuperAdmin') {
      return <WrappedComponent {...props} />;
    }
    
    // Check if user can access the requested branch
    if (requestedBranchId && !isAuthorizedForBranch(requestedBranchId)) {
      return null; // In a real implementation, this would redirect to forbidden page
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Hook-based guards
export const usePermission = (permission: string) => {
  const { permissions } = useAuthStore();
  return permissions.includes(permission);
};

export const useRole = () => {
  const { role } = useAuthStore();
  return role;
};

export const useBranchScope = () => {
  const { role, branchId, businessId, isAuthorizedForBranch } = useAuthStore();
  
  return {
    role,
    branchId,
    businessId,
    canAccessBranch: isAuthorizedForBranch,
    isSuperAdmin: role === 'SuperAdmin',
    isAdmin: role === 'Admin',
    isStaff: role === 'Staff'
  };
};

// Navigation guards
export const filterNavigationItems = (items: any[], userRole: string) => {
  return items.filter(item => 
    item.roles.includes(userRole as 'SuperAdmin' | 'Admin' | 'Staff')
  );
};

export const getAvailableRoutes = (userRole: string) => {
  const allRoutes = [
    { path: '/dashboard', roles: ['Admin', 'Staff'] },
    { path: '/accounts', roles: ['Admin', 'Staff'] },
    { path: '/cashbook', roles: ['Admin', 'Staff'] },
    { path: '/invoices', roles: ['Admin', 'Staff'] },
    { path: '/inventory', roles: ['Admin', 'Staff'] },
    { path: '/reports', roles: ['Admin', 'Staff'] },
    { path: '/settings', roles: ['Admin', 'Staff'] },
    { path: '/admin/businesses', roles: ['SuperAdmin'] },
    { path: '/admin/branches', roles: ['SuperAdmin'] },
    { path: '/admin/users', roles: ['SuperAdmin'] },
    { path: '/admin/settings', roles: ['SuperAdmin'] },
    { path: '/admin/audit', roles: ['SuperAdmin'] },
    { path: '/admin/feedback', roles: ['SuperAdmin'] },
    { path: '/admin/diagnostics', roles: ['SuperAdmin'] },
  ];
  
  return allRoutes.filter(route => 
    route.roles.includes(userRole as 'SuperAdmin' | 'Admin' | 'Staff')
  );
};

// Protected route component
export const ProtectedRoute = ({ 
  component: Component, 
  allowedRoles,
  requireAuth = true
}: { 
  component: React.ComponentType; 
  allowedRoles?: ('SuperAdmin' | 'Admin' | 'Staff')[];
  requireAuth?: boolean;
}) => {
  const { isAuthenticated, role } = useAuthStore();
  
  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return null; // In a real implementation, this would redirect to login
  }
  
  // Check role permissions
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return null; // In a real implementation, this would redirect to unauthorized page
  }
  
  return <Component />;
};