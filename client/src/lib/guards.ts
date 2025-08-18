// client/src/lib/guards.ts
import { useAuthStore } from "@/lib/auth-store";
import React from "react";

// Higher-order component for authentication guard
export const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  return function AuthGuard(props: any) {
    const { isAuthenticated, token } = useAuthStore();
    
    if (!isAuthenticated || !token) {
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
    
    // Check token expiration
    const { isTokenExpired } = useAuthStore.getState();
    if (isTokenExpired && isTokenExpired()) {
      // Try to refresh token
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
    
    // @ts-ignore
    return React.createElement(WrappedComponent, props);
  };
};

// Higher-order component for role-based guard
export const withRole = (allowedRoles: ('SuperAdmin' | 'Admin' | 'Staff')[]) => {
  return function RoleGuard(WrappedComponent: React.ComponentType<any>) {
    return function RoleGuardComponent(props: any) {
      const { role } = useAuthStore();
      
      if (!role || !allowedRoles.includes(role as any)) {
        // Show unauthorized page or redirect
        return React.createElement(
          'div',
          { className: 'p-8 text-center' },
          React.createElement('h1', { className: 'text-2xl font-bold mb-4' }, 'Access Denied'),
          React.createElement('p', { className: 'text-muted-foreground' }, "You don't have permission to access this page."),
          React.createElement(
            'button',
            {
              className: 'mt-4 text-primary hover:underline',
              onClick: () => {
                if (typeof window !== 'undefined') {
                  window.location.href = '/';
                }
              }
            },
            'Go back to dashboard'
          )
        );
      }
      
      // @ts-ignore
      return React.createElement(WrappedComponent, props);
    };
  };
};

// Higher-order component for branch scope guard
export const withBranchScope = (WrappedComponent: React.ComponentType<any>) => {
  return function BranchScopeGuard(props: any) {
    const { role, branchId, isAuthorizedForBranch } = useAuthStore();
    const requestedBranchId = props.branchId || (props.match && props.match.params && props.match.params.branchId);
    
    // SuperAdmin can access any branch
    if (role === 'SuperAdmin') {
      // @ts-ignore
      return React.createElement(WrappedComponent, props);
    }
    
    // Check if user can access the requested branch
    if (requestedBranchId && isAuthorizedForBranch && !isAuthorizedForBranch(requestedBranchId)) {
      return React.createElement(
        'div',
        { className: 'p-8 text-center' },
        React.createElement('h1', { className: 'text-2xl font-bold mb-4' }, 'Access Denied'),
        React.createElement('p', { className: 'text-muted-foreground' }, "You don't have permission to access this branch."),
        React.createElement(
          'button',
          {
            className: 'mt-4 text-primary hover:underline',
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }
          },
          'Go back to dashboard'
        )
      );
    }
    
    // @ts-ignore
    return React.createElement(WrappedComponent, props);
  };
};