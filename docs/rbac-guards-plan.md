# RBAC Guards and Permission Checking Implementation Plan

## Overview
This document outlines the implementation plan for creating RBAC guards and permission checking mechanisms for the Credit Debit financial management application. These guards will ensure proper access control based on user roles (SuperAdmin, Admin, Staff) and branch scoping.

## Current State Analysis
The existing application has:
- Basic authentication but no role-based access control in the frontend
- No route guards to protect routes based on user roles
- No permission checking for UI elements
- No branch scoping enforcement

## RBAC Requirements
Based on the RBAC design document, we need to implement:
1. **Route-level guards** - Prevent unauthorized access to routes
2. **Component-level guards** - Hide/show UI elements based on permissions
3. **Branch scoping** - Ensure users only see data for their authorized branches
4. **Role-based navigation** - Filter navigation items based on user roles

## Implementation Approach

### 1. Authentication State Management
Create a comprehensive authentication state management system that tracks:
- User authentication status
- User role (SuperAdmin, Admin, Staff)
- Business context (businessId)
- Branch context (branchId)
- Session expiration
- Token refresh mechanism

### 2. Route Guards
Implement higher-order components (HOCs) and hooks for route protection:
- `withAuth` - Ensures user is authenticated
- `withRole` - Ensures user has required role
- `withBranchScope` - Ensures user can access requested branch data

### 3. Component Guards
Implement hooks and utility functions for component-level permission checking:
- `usePermission` - Check if user has specific permission
- `useRole` - Get current user role
- `useBranchScope` - Check if user can access specific branch

### 4. API Integration
Enhance API calls to include proper headers and handle permission errors:
- Add `business-id` and `user-id` headers to all requests
- Handle 403 Forbidden responses appropriately
- Implement retry mechanisms for expired sessions

## Technical Implementation

### 1. Authentication Store
Enhance the existing Zustand store to include RBAC information:

```typescript
interface AuthState {
  // Existing state
  isAuthenticated: boolean;
  user: User | null;
  
  // New RBAC state
  role: 'SuperAdmin' | 'Admin' | 'Staff' | null;
  businessId: string | null;
  branchId: string | null;
  permissions: string[];
  
  // Session management
  token: string | null;
  tokenExpiry: Date | null;
  refreshToken: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  setRole: (role: 'SuperAdmin' | 'Admin' | 'Staff') => void;
  setBusinessContext: (businessId: string, branchId: string) => void;
  hasPermission: (permission: string) => boolean;
  isAuthorizedForBranch: (branchId: string) => boolean;
}
```

### 2. Route Guard Implementation

#### withAuth HOC
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

#### withRole HOC
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

#### withBranchScope HOC
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

### 3. Hook-based Guards

#### usePermission Hook
```typescript
const usePermission = (permission: string) => {
  const { permissions } = useAuthStore();
  return permissions.includes(permission);
};
```

#### useRole Hook
```typescript
const useRole = () => {
  const { role } = useAuthStore();
  return role;
};
```

#### useBranchScope Hook
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

### 4. Navigation Guards
Implement functions to filter navigation items based on user roles:

```typescript
const filterNavigationItems = (items: NavigationItem[], userRole: string) => {
  return items.filter(item => 
    item.roles.includes(userRole as 'SuperAdmin' | 'Admin' | 'Staff')
  );
};

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

## API Integration Enhancements

### 1. Enhanced API Client
Modify the existing API client to include proper headers and handle permission errors:

```typescript
class ApiClient {
  private baseUrl: string;
  private getAuthHeaders: () => Record<string, string>;
  
  constructor(baseUrl: string, getAuthHeaders: () => Record<string, string>) {
    this.baseUrl = baseUrl;
    this.getAuthHeaders = getAuthHeaders;
  }
  
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = {
      ...this.getAuthHeaders(),
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Handle authentication errors
    if (response.status === 401) {
      // Redirect to login
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
    
    // Handle authorization errors
    if (response.status === 403) {
      // Show forbidden page
      throw new Error('Access forbidden');
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  // API methods with proper error handling
  async getAccounts(businessId: string, userId: string) {
    try {
      return await this.request<Account[]>(`/accounts`, {
        headers: {
          'business-id': businessId,
          'user-id': userId,
        },
      });
    } catch (error) {
      // Handle specific error cases
      if (error.message === 'Access forbidden') {
        // Show appropriate UI for forbidden access
        throw new Error('You do not have permission to access accounts');
      }
      throw error;
    }
  }
}
```

### 2. Error Handling
Implement comprehensive error handling for permission-related issues:

```typescript
const handleApiError = (error: any) => {
  if (error.message === 'Access forbidden') {
    // Show user-friendly message
    showToast('You do not have permission to perform this action', 'error');
    return;
  }
  
  if (error.message === 'Authentication required') {
    // Redirect to login
    window.location.href = '/login';
    return;
  }
  
  // Handle other errors
  showToast('An error occurred. Please try again.', 'error');
};
```

## Branch Scoping Implementation

### 1. Data Filtering
Implement functions to filter data based on user's branch scope:

```typescript
const filterDataByBranchScope = <T extends { branchId?: string }>(
  data: T[],
  userRole: string,
  userBranchId: string | null
): T[] => {
  // SuperAdmin can see all data
  if (userRole === 'SuperAdmin') {
    return data;
  }
  
  // Staff can only see data from their branch
  if (userRole === 'Staff' && userBranchId) {
    return data.filter(item => item.branchId === userBranchId);
  }
  
  // Admin can see all data within their business (assuming business context)
  if (userRole === 'Admin') {
    return data; // This would be filtered by business on the server side
  }
  
  return [];
};
```

### 2. Query Parameter Injection
Automatically inject branch context into API queries:

```typescript
const useBranchScopedQuery = (queryKey: string[], queryFn: () => Promise<any>) => {
  const { role, branchId } = useAuthStore();
  
  return useQuery({
    queryKey: [...queryKey, role, branchId],
    queryFn: async () => {
      const data = await queryFn();
      
      // Filter data based on branch scope if needed
      if (role === 'Staff' && branchId) {
        return data.filter((item: any) => item.branchId === branchId);
      }
      
      return data;
    },
  });
};
```

## UI Component Integration

### 1. Permission-Based Rendering
Create utility components for conditional rendering based on permissions:

```tsx
interface PermissionGuardProps {
  permission: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  fallback = null, 
  children 
}) => {
  const hasPermission = usePermission(permission);
  
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

interface RoleGuardProps {
  allowedRoles: ('SuperAdmin' | 'Admin' | 'Staff')[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  allowedRoles, 
  fallback = null, 
  children 
}) => {
  const userRole = useRole();
  
  return userRole && allowedRoles.includes(userRole) ? <>{children}</> : <>{fallback}</>;
};
```

### 2. Disabled State for Actions
Implement disabled states for actions based on permissions:

```tsx
const ActionButton: React.FC<{ 
  permission: string; 
  onClick: () => void; 
  children: React.ReactNode 
}> = ({ permission, onClick, children }) => {
  const hasPermission = usePermission(permission);
  
  return (
    <Button 
      onClick={onClick} 
      disabled={!hasPermission}
      title={!hasPermission ? "You don't have permission to perform this action" : undefined}
    >
      {children}
    </Button>
  );
};
```

## File Structure
```
client/src/
├── hooks/
│   ├── useAuth.ts
│   ├── usePermission.ts
│   └── useRole.ts
├── lib/
│   ├── auth.ts
│   ├── guards.ts
│   └── permissions.ts
├── components/
│   └── guards/
│       ├── PermissionGuard.tsx
│       ├── RoleGuard.tsx
│       └── BranchScopeGuard.tsx
└── utils/
    └── rbac-utils.ts
```

## Implementation Steps

### Step 1: Enhanced Authentication Store
- Add RBAC fields to the existing Zustand store
- Implement session management functions
- Add permission checking utilities

### Step 2: Route Guard Implementation
- Create HOCs for authentication and role-based protection
- Implement branch scope guards
- Integrate with existing routing system

### Step 3: Component Guard Implementation
- Create hooks for permission and role checking
- Implement utility components for conditional rendering
- Add disabled states for unauthorized actions

### Step 4: API Integration
- Enhance API client with proper headers
- Implement error handling for permission issues
- Add branch context to API queries

### Step 5: UI Integration
- Integrate guards into existing components
- Update navigation to filter based on roles
- Add appropriate feedback for unauthorized access

## Testing Strategy

### Unit Tests
- Authentication store functionality
- Route guard logic
- Permission checking functions
- Branch scoping enforcement

### Integration Tests
- Login flows with role assignment
- Navigation filtering based on roles
- Unauthorized access attempts
- Branch-scoped data access

### E2E Tests
- Complete user journeys for each role
- Permission-based UI element visibility
- Error handling for forbidden access
- Session expiration and refresh

## Security Considerations

### Frontend Security
- Never rely solely on frontend guards for security
- Always validate permissions on the server side
- Implement proper error handling for forbidden access
- Sanitize and validate all user inputs

### Session Management
- Secure JWT token storage
- Implement token refresh mechanisms
- Handle session expiration gracefully
- Prevent concurrent session abuse

### Data Protection
- Filter sensitive data based on user permissions
- Implement proper data isolation
- Log unauthorized access attempts
- Provide appropriate feedback to users