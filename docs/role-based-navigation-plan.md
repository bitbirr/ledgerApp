# Role-Based Navigation and Routing System Plan

## Overview
This document outlines the implementation plan for creating a role-based navigation and routing system that separates the Business App and SuperAdmin App with appropriate navigation patterns for each role.

## Current State Analysis
The existing application has:
- A basic routing system using Wouter
- Simple screen-based navigation using Zustand state
- No role-based access control in the frontend
- No separation between business and admin applications

## RBAC Requirements
Based on the RBAC design document, we have three roles:
1. **SuperAdmin** - System-wide administrator with full access
2. **Admin** - Business-level administrator
3. **Staff** - Branch-specific users

Each role has different navigation requirements:
- SuperAdmin accesses via `/admin/*` routes
- Admin and Staff access via `/` routes
- Navigation items should be filtered based on user role
- Branch scoping: Staff sees only their branch; Admin sees all branches for their business; SuperAdmin sees global

## New Routing Structure

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

## Role-Based Navigation Components

### Business Navigation Items
```typescript
const businessNavigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['Admin', 'Staff'] },
  { id: 'accounts', label: 'Accounts', icon: Users, roles: ['Admin', 'Staff'] },
  { id: 'cashbook', label: 'Cashbook', icon: Wallet, roles: ['Admin', 'Staff'] },
  { id: 'invoices', label: 'Invoices', icon: Receipt, roles: ['Admin', 'Staff'] },
  { id: 'inventory', label: 'Inventory', icon: Package, roles: ['Admin', 'Staff'] },
  { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Staff'] },
  { id: 'settings', label: 'Settings', icon: Settings, roles: ['Admin', 'Staff'] },
];
```

### SuperAdmin Navigation Items
```typescript
const superAdminNavigationItems = [
  { id: 'businesses', label: 'Businesses', icon: Building2, roles: ['SuperAdmin'] },
  { id: 'branches', label: 'Branches', icon: MapPin, roles: ['SuperAdmin'] },
  { id: 'users', label: 'Users & Roles', icon: Users, roles: ['SuperAdmin'] },
  { id: 'settings', label: 'App Settings', icon: Settings, roles: ['SuperAdmin'] },
  { id: 'audit', label: 'Audit Trail', icon: FileText, roles: ['SuperAdmin'] },
  { id: 'feedback', label: 'Feedback', icon: MessageCircle, roles: ['SuperAdmin'] },
  { id: 'diagnostics', label: 'Diagnostics', icon: Activity, roles: ['SuperAdmin'] },
];
```

## Implementation Details

### 1. Enhanced Routing System

#### AppRouter Component
The main router component will be enhanced to:
- Separate business app and superadmin app routes
- Implement route guards for role-based access
- Handle redirects for unauthorized access

#### Route Structure
```
AppRouter
├── BusinessAppRoutes (protected routes for business users)
│   ├── DashboardRoute
│   ├── AccountsRoute
│   ├── CashbookRoute
│   ├── InvoicesRoute
│   ├── InventoryRoute
│   ├── ReportsRoute
│   ├── SettingsRoute
│   └── NotFoundRoute
├── SuperAdminAppRoutes (protected routes for superadmin users)
│   ├── SuperAdminDashboardRoute
│   ├── BusinessesRoute
│   ├── BranchesRoute
│   ├── UsersRolesRoute
│   ├── AppSettingsRoute
│   ├── AuditRoute
│   ├── FeedbackRoute
│   ├── DiagnosticsRoute
│   └── NotFoundRoute
├── PublicRoutes
│   ├── BusinessLoginRoute
│   ├── SuperAdminLoginRoute
│   └── NotFoundRoute
└── Redirects
    ├── / → /dashboard (default business app route)
    └── /admin → /admin/businesses (default superadmin route)
```

### 2. Route Guards Implementation

#### Authentication Guard
- Check if user is authenticated
- Redirect to appropriate login page if not authenticated
- Validate session token

#### Role Guard
- Check if user has required role for the route
- Hide unauthorized navigation items
- Show "No access" state if deep-linked to restricted page

#### Branch Scope Guard
- For Staff role, ensure they can only access their assigned branch data
- For Admin role, ensure they can only access branches within their business
- For SuperAdmin role, allow access to all branches

### 3. Navigation Filtering

#### Navigation Component Enhancement
- Filter navigation items based on user role
- Show/hide navigation components based on current route
- Implement proper active state highlighting

#### Business App Navigation
- Filter based on user role (Admin/Staff)
- Show branch-specific items for Staff
- Show all business items for Admin

#### SuperAdmin Navigation
- Only visible to SuperAdmin users
- All navigation items available to SuperAdmin

## Technical Implementation

### 1. User Context Management
Create a user context store that includes:
- User role (SuperAdmin, Admin, Staff)
- Business ID
- Branch ID
- Authentication status
- User profile information

### 2. Route Guard HOCs
Implement higher-order components for route protection:
- `withAuth` - Ensures user is authenticated
- `withRole` - Ensures user has required role
- `withBranchScope` - Ensures user can access requested branch data

### 3. Navigation Components
Enhance existing navigation components:
- `BusinessAppShell` - Contains business app navigation
- `SuperAdminAppShell` - Contains superadmin navigation
- `AppHeader` - Shows appropriate business/branch selector based on role
- `SidebarNav` - Filters navigation items based on role
- `MobileNavDrawer` - Filters navigation items based on role
- `MobileBottomNav` - Filters navigation items based on role

### 4. Login Flow Implementation
- `/login` - Business user login with Business → Branch → Role selection
- `/admin/login` - SuperAdmin login
- Session management with JWT tokens
- User context initialization after login

## File Structure
```
client/src/
├── components/
│   ├── layout/
│   │   ├── BusinessAppShell.tsx
│   │   ├── SuperAdminAppShell.tsx
│   │   ├── AppHeader.tsx
│   │   ├── SidebarNav.tsx
│   │   ├── MobileNavDrawer.tsx
│   │   └── MobileBottomNav.tsx
│   └── routes/
│       ├── BusinessAppRoutes.tsx
│       ├── SuperAdminAppRoutes.tsx
│       └── PublicRoutes.tsx
├── hooks/
│   └── useAuth.ts
├── lib/
│   ├── auth.ts
│   └── guards.ts
└── pages/
    ├── business/
    │   ├── Dashboard.tsx
    │   ├── Accounts.tsx
    │   ├── Cashbook.tsx
    │   ├── Invoices.tsx
    │   ├── Inventory.tsx
    │   ├── Reports.tsx
    │   └── Settings.tsx
    ├── admin/
    │   ├── SuperAdminDashboard.tsx
    │   ├── Businesses.tsx
    │   ├── Branches.tsx
    │   ├── UsersRoles.tsx
    │   ├── AppSettings.tsx
    │   ├── AuditTrail.tsx
    │   ├── Feedback.tsx
    │   └── Diagnostics.tsx
    └── auth/
        ├── BusinessLogin.tsx
        └── SuperAdminLogin.tsx
```

## Implementation Steps

### Step 1: User Context Store
- Create enhanced Zustand store for user context
- Add role, businessId, branchId to the store
- Implement session management functions

### Step 2: Route Guard Implementation
- Create authentication guard
- Create role-based guard
- Create branch scope guard

### Step 3: Enhanced Routing
- Separate business and superadmin routes
- Implement protected routes with guards
- Add proper redirects for unauthorized access

### Step 4: Login Pages
- Create business login with Business/Branch/Role selection
- Create superadmin login
- Implement session initialization

### Step 5: Navigation Components
- Enhance AppHeader with role-based business/branch selector
- Create BusinessAppShell with role-filtered navigation
- Create SuperAdminAppShell with superadmin navigation
- Implement navigation filtering in all navigation components

## API Integration

### Authentication Endpoints
- `POST /api/auth/login` - Business user login
- `POST /api/auth/admin/login` - SuperAdmin login
- `GET /api/auth/me` - Session validation
- `POST /api/auth/select-context` - Business/Branch/Role selection

### Data Filtering
- All API calls must include appropriate headers:
  - `business-id` header for all requests
  - `user-id` header where required
  - `branch-id` header for branch-scoped requests

## Security Considerations

### Frontend Security
- Never hardcode business IDs; always read from store
- Implement proper route guards to prevent unauthorized access
- Hide navigation items for unauthorized routes
- Show appropriate error messages for forbidden access

### Session Management
- Secure JWT token handling
- Session expiration and refresh
- Concurrent session limit enforcement
- Proper logout functionality

## Testing Strategy

### Unit Tests
- Route guard logic
- Navigation filtering based on roles
- Session management functions

### Integration Tests
- Login flows for different roles
- Navigation item visibility based on roles
- Unauthorized access attempts
- Branch scoping enforcement

### E2E Tests
- Complete user journeys for each role
- Deep-link access to restricted pages
- Business/Branch/Role selection flow