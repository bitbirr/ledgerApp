# Responsive Layout Implementation

## Overview
This document outlines the implementation of responsive layout components for the Credit Debit financial management application. The layout will support all screen sizes (mobile, tablet, desktop) with a mobile-first approach and include two shells (Business App and SuperAdmin App).

## Component Structure

### BusinessAppShell
This component serves as the main shell for the business application.

```tsx
BusinessAppShell
├── AppHeader
│   ├── Logo
│   ├── GlobalSearch
│   ├── BusinessBranchSelector
│   ├── UserMenu
│   │   ├── Profile
│   │   ├── RoleDisplay
│   │   ├── ThemeToggle
│   │   └── Logout
│   └── NotificationIndicator
├── DesktopSidebar (hidden on mobile)
│   ├── BusinessLogo
│   ├── NavigationMenu
│   │   ├── Dashboard
│   │   ├── Accounts
│   │   ├── Cashbook
│   │   ├── Invoices
│   │   ├── Inventory
│   │   ├── Reports
│   │   └── Settings
│   └── BusinessInfo
├── MobileNavigationDrawer (hidden on desktop)
│   ├── BusinessLogo
│   ├── NavigationMenu
│   │   ├── Dashboard
│   │   ├── Accounts
│   │   ├── Cashbook
│   │   ├── Invoices
│   │   ├── Inventory
│   │   ├── Reports
│   │   └── Settings
│   └── BusinessInfo
├── Breadcrumb (desktop/tablet only)
├── MainContent
└── MobileBottomNav (mobile only)
```

### SuperAdminAppShell
This component serves as the shell for the SuperAdmin application.

```tsx
SuperAdminAppShell
├── AppHeader
│   ├── Logo
│   ├── GlobalSearch
│   ├── UserMenu
│   │   ├── Profile
│   │   ├── RoleDisplay
│   │   ├── ThemeToggle
│   │   └── Logout
│   └── NotificationIndicator
├── DesktopSidebar (hidden on mobile)
│   ├── AppLogo
│   ├── NavigationMenu
│   │   ├── Businesses
│   │   ├── Branches
│   │   ├── UsersRoles
│   │   ├── AppSettings
│   │   ├── Audit
│   │   ├── Feedback
│   │   └── Diagnostics
│   └── BusinessInfo
├── MobileNavigationDrawer (hidden on desktop)
│   ├── AppLogo
│   ├── NavigationMenu
│   │   ├── Businesses
│   │   ├── Branches
│   │   ├── UsersRoles
│   │   ├── AppSettings
│   │   ├── Audit
│   │   ├── Feedback
│   │   └── Diagnostics
│   └── BusinessInfo
├── Breadcrumb (desktop/tablet only)
├── MainContent
└── MobileBottomNav (mobile only)
```

## Responsive Behavior

### Mobile (≤ 640px)
- Header with hamburger menu button
- Navigation drawer slides in from left
- Bottom navigation bar for primary navigation
- Single column layout for content
- Touch-friendly components with 44px minimum targets
- iOS safe area padding support

### Tablet (641px - 1024px)
- Header with business/branch selector
- Collapsible sidebar navigation
- Breadcrumb navigation above content
- Multi-column grid layout (12 columns)
- Larger touch targets and spacing

### Desktop (≥ 1025px)
- Full sidebar navigation
- Breadcrumb navigation above content
- Multi-column grid layout (12 columns)
- Larger spacing (24-32px gaps)
- Enhanced hover states and interactions

## Component Implementation

### AppHeader
The header component will include:
- Logo/app name
- Global search functionality
- Business/Branch selector dropdowns
- User menu with profile, role, and logout options
- Theme toggle button
- Notification indicator

### Sidebar Navigation
Features:
- Collapsible on desktop
- Active item highlighting
- Role-based menu items
- Badges for notifications/alerts

### Mobile Navigation Drawer
Features:
- Hamburger menu trigger
- Role-based menu items
- Business/Branch context display
- User profile section

### Bottom Navigation (Mobile)
Features:
- Icon-based navigation
- Active state indication
- Role-based navigation items

### Breadcrumb Navigation
Features:
- Dynamic breadcrumb generation
- Truncation for long paths
- Clickable segments

## Grid System

### Container Component
- Max width constraints (1200-1280px)
- Responsive padding adjustments
- Centered layout

### Grid Component
- 12-column grid on tablet/desktop
- Single column on mobile
- Responsive gap sizing (16px base, 24/32px on larger screens)

## Implementation Plan

### Phase 1: Enhanced AppHeader
1. Add business/branch selector dropdowns
2. Implement user menu with role display
3. Add theme toggle functionality
4. Add notification indicator

### Phase 2: BusinessAppShell
1. Create responsive layout container
2. Implement collapsible sidebar
3. Create mobile navigation drawer
4. Create mobile bottom navigation
5. Add breadcrumb navigation

### Phase 3: SuperAdminAppShell
1. Create responsive layout container
2. Implement collapsible sidebar
3. Create mobile navigation drawer
4. Create mobile bottom navigation
5. Add breadcrumb navigation

### Phase 4: Responsive Grid System
1. Create container component with max-width constraints
2. Implement 12-column grid with responsive behavior
3. Add gap sizing that adjusts based on screen size

### Phase 5: Navigation Components
1. Implement sidebar navigation with collapsible behavior
2. Create mobile navigation drawer with slide-in animation
3. Create bottom navigation bar for mobile
4. Implement breadcrumb navigation

## Technical Considerations

### State Management
- Use Zustand for UI state (sidebar collapsed, drawer open, etc.)
- Store user context (role, business, branch) in the global store
- Persist theme preference in localStorage

### Accessibility
- Ensure proper keyboard navigation
- Add ARIA attributes for navigation components
- Implement skip-to-content functionality
- Maintain focus traps for modals/drawers

### Performance
- Code split shell components
- Lazy load non-critical navigation elements
- Optimize CSS for minimal repaints
- Use CSS variables for consistent theming

### PWA Support
- Ensure layout works offline
- Cache shell components
- Show offline banner when appropriate

## File Structure
```
client/src/
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx
│   │   ├── BusinessAppShell.tsx
│   │   ├── SuperAdminAppShell.tsx
│   │   ├── SidebarNav.tsx
│   │   ├── MobileNavDrawer.tsx
│   │   ├── MobileBottomNav.tsx
│   │   ├── Breadcrumb.tsx
│   │   └── Container.tsx
│   └── ui/
│       └── (enhanced components based on design system)
├── hooks/
│   └── (responsive and theme hooks)
└── lib/
    └── (layout utilities and context providers)