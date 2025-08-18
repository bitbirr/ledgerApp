# Route Guards Implementation

## Overview
This document outlines the implementation of route guards for role-based access control in the Credit Debit financial management application. These guards will protect routes based on user authentication status, roles, and branch scoping.

## Guard Types

### 1. Authentication Guard
Protects routes that require user authentication.

```typescript
const withAuth = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { isAuthenticated, token } = useAuthStore();
    
    if (!isAuthenticated || !token) {
      // Redirect to login
      return <Redirect to="/login" />;
    }
    
    // Check token expiration
    if (isTokenExpired(token)) {
      // Try to refresh token
      return <TokenRefreshHandler />;
    }
    
    return <WrappedComponent {...props} />;
  };
};
```

### 2. Role Guard
Protects routes based on user roles.

```typescript
const withRole = (allowedRoles: ('SuperAdmin' | 'Admin' | 'Staff')[]) => {
  return (WrappedComponent: React.ComponentType) => {
    return (props: any) => {
      const { role } = useAuthStore();
      
      if (!role || !allowedRoles.includes(role)) {
        // Show unauthorized page or redirect
        return <UnauthorizedPage />;
      }
      
      return <WrappedComponent {...props} />;
    };
  };
};
```

### 3. Branch Scope Guard
Ensures users can only access data for their authorized branches.

```typescript
const withBranchScope = (WrappedComponent: React.ComponentType) => {
  return (props: any) => {
    const { role, branchId, isAuthorizedForBranch } = useAuthStore();
    const requestedBranchId = props.branchId || props.match?.params?.branchId;
    
    // SuperAdmin can access any branch
    if (role === 'SuperAdmin') {
      return <WrappedComponent {...props} />;
    }
    
    // Check if user can access the requested branch
    if (requestedBranchId && !isAuthorizedForBranch(requestedBranchId)) {
      return <ForbiddenPage />;
    }
    
    return <WrappedComponent {...props} />;
  };
};
```

## Hook-Based Guards

### 1. usePermission Hook
Check if user has specific permission.

```typescript
const usePermission = (permission: string) => {
  const { permissions } = useAuthStore();
  return permissions.includes(permission);
};
```

### 2. useRole Hook
Get current user role.

```typescript
const useRole = () => {
  const { role } = useAuthStore();
  return role;
};
```

### 3. useBranchScope Hook
Check branch access permissions.

```typescript
const useBranchScope = () => {
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
```

## Navigation Guards

### Filter Navigation Items
Filter navigation items based on user roles.

```typescript
const filterNavigationItems = (items: NavigationItem[], userRole: string) => {
  return items.filter(item => 
    item.roles.includes(userRole as 'SuperAdmin' | 'Admin' | 'Staff')
  );
};
```

### Get Available Routes
Determine which routes are available to the current user.

```typescript
const getAvailableRoutes = (userRole: string) => {
  const allRoutes = [
    { path: '/dashboard', roles: ['Admin', 'Staff'] },
    { path: '/accounts', roles: ['Admin', 'Staff'] },
    { path: '/admin/businesses', roles: ['SuperAdmin'] },
    // ... other routes
  ];
  
  return allRoutes.filter(route => 
    route.roles.includes(userRole as 'SuperAdmin' | 'Admin' | 'Staff')
  );
};
```

## Route Structure

### Business App Routes
```
/ - Dashboard (default)
/accounts - Accounts list
/accounts/:id - Account details
/cashbook - Cashbook entries
/invoices - Invoices list
/inventory - Inventory items
/reports - Financial reports
/settings - User settings
/login - Business user login
```

### SuperAdmin App Routes
```
/admin - SuperAdmin dashboard (default)
/admin/businesses - Business management
/admin/branches - Branch management
/admin/users - User/Role management
/admin/settings - App settings
/admin/audit - Audit trail viewer
/admin/feedback - Feedback management
/admin/diagnostics - System diagnostics
/admin/login - SuperAdmin login
```

## Implementation Plan

### Phase 1: Core Guards
1. Implement authentication guard
2. Create role-based guard
3. Add branch scope guard
4. Integrate with existing routing system

### Phase 2: Hook Implementation
1. Create usePermission hook
2. Implement useRole hook
3. Add useBranchScope hook
4. Create navigation filtering utilities

### Phase 3: Route Structure
1. Separate business app and superadmin app routes
2. Implement protected routes with guards
3. Add proper redirects for unauthorized access
4. Create route configuration files

### Phase 4: Integration
1. Integrate guards with existing components
2. Update navigation to filter based on roles
3. Add appropriate feedback for unauthorized access
4. Implement proper error handling

## Testing Strategy

### Unit Tests
- Authentication guard logic
- Role guard functionality
- Branch scope enforcement
- Navigation filtering

### Integration Tests
- Login flows with role assignment
- Navigation item visibility
- Unauthorized access attempts
- Branch-scoped data access

### E2E Tests
- Complete user journeys for each role
- Deep-link access to restricted pages
- Session expiration and refresh
- Permission-based UI element visibility