# Credit Debit Frontend Architecture Documentation

## Overview
This document provides comprehensive documentation for the new frontend architecture of the Credit Debit financial management application. The architecture is designed to be responsive, accessible, performant, and secure while supporting role-based access control and offline-first capabilities.

## Architecture Principles
1. **Mobile-First Design** - Responsive layout that works on all device sizes
2. **Progressive Web App** - Offline capabilities with service worker support
3. **Role-Based Access Control** - Different experiences for SuperAdmin, Admin, and Staff roles
4. **Accessibility Compliance** - WCAG AA compliance for all users
5. **Performance Optimization** - Core Web Vitals optimization for fast loading
6. **Component-Driven Development** - Reusable, well-documented components
7. **Security First** - Proper authentication and authorization mechanisms

## Technology Stack
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query for server state management
- **UI Components**: shadcn/ui with Tailwind CSS
- **Icons**: lucide-react for consistent iconography
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **Internationalization**: Message files for future i18n support
- **Testing**: Jest and React Testing Library
- **Build Tool**: Vite for fast development and optimized builds

## Project Structure
```
client/
├── public/                 # Static assets
│   ├── manifest.json       # PWA manifest
│   ├── sw.js              # Service worker
│   └── icons/             # Application icons
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base shadcn/ui components
│   │   ├── atoms/         # Simple components (Button, Badge, etc.)
│   │   ├── inputs/        # Form input components
│   │   ├── forms/         # Form-specific components
│   │   ├── navigation/    # Navigation components
│   │   ├── surfaces/      # Content containers
│   │   ├── data-display/  # Data presentation components
│   │   ├── feedback/      # User feedback components
│   │   ├── utilities/     # Helper components
│   │   └── demo/          # Component showcase
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Business logic and utilities
│   │   ├── api/           # API client
│   │   ├── auth/          # Authentication utilities
│   │   ├── guards/        # Route guards
│   │   ├── offline/       # Offline data management
│   │   ├── permissions/   # Permission checking
│   │   └── utils/         # General utilities
│   ├── pages/             # Page components
│   │   ├── business/      # Business app pages
│   │   ├── admin/         # SuperAdmin app pages
│   │   └── auth/          # Authentication pages
│   ├── layout/            # Layout components
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── index.html             # HTML entry point
└── vite.config.ts         # Build configuration
```

## Design System

### Color Tokens
The application uses a comprehensive color system with light and dark themes:

#### Light Theme
- `--background`: `hsl(210, 20%, 98%)` - Page background
- `--foreground`: `hsl(222, 84%, 4.9%)` - Primary text
- `--card`: `hsl(0, 0%, 100%)` - Card backgrounds
- `--primary`: `hsl(221, 83%, 53%)` - Primary actions
- `--success`: `hsl(142, 76%, 36%)` - Success states
- `--warning`: `hsl(38, 92%, 50%)` - Warning states
- `--destructive`: `hsl(0, 84%, 60%)` - Error states

#### Dark Theme
- `--background`: `hsl(222, 84%, 4.9%)` - Page background
- `--foreground`: `hsl(210, 40%, 98%)` - Primary text
- `--card`: `hsl(222, 84%, 4.9%)` - Card backgrounds
- `--primary`: `hsl(217, 91%, 60%)` - Primary actions
- `--success`: `hsl(142, 76%, 36%)` - Success states
- `--warning`: `hsl(38, 92%, 50%)` - Warning states
- `--destructive`: `hsl(0, 84%, 60%)` - Error states

### Typography
- **Font Family**: Inter for body text, JetBrains Mono for code
- **Font Scale**: 12px to 36px with consistent line heights
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold), 800 (extrabold)

### Spacing System
Based on a 4px grid:
- `--spacing-1`: 4px
- `--spacing-2`: 8px
- `--spacing-3`: 12px
- `--spacing-4`: 16px
- `--spacing-5`: 20px
- `--spacing-6`: 24px
- `--spacing-8`: 32px
- `--spacing-10`: 40px

### Border Radius
- `--radius-sm`: 4px
- `--radius-md`: 6px
- `--radius-lg`: 8px
- `--radius-full`: 9999px

## Component Library

### Component Categories
1. **Atoms** - Basic building blocks (Button, Icon, Badge)
2. **Inputs** - Form controls (Input, Select, Checkbox)
3. **Forms** - Form-specific components (FormField, FormLabel)
4. **Navigation** - Navigation components (Sidebar, Breadcrumb)
5. **Surfaces** - Content containers (Card, Modal, Drawer)
6. **Data Display** - Data presentation (Table, Chart, List)
7. **Feedback** - User feedback (Toast, Loading, Error)
8. **Utilities** - Helper components (CopyToClipboard, ScrollArea)

### Component States
All components support the following states:
- Default
- Hover
- Focus
- Active
- Disabled
- Loading
- Error
- Success

### Component API Design
Components follow consistent API patterns:
```tsx
interface ComponentProps {
  // Standard HTML attributes
  className?: string;
  style?: React.CSSProperties;
  
  // Component-specific props
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isError?: boolean;
  
  // Event handlers
  onClick?: () => void;
  onChange?: (value: any) => void;
}
```

## Layout System

### Responsive Breakpoints
- **Mobile**: ≤ 640px
- **Tablet**: 641px - 1024px
- **Desktop**: ≥ 1025px

### Grid System
- **Mobile**: Single column layout
- **Tablet**: 12-column grid with 16px gutters
- **Desktop**: 12-column grid with 24px gutters

### Layout Components
1. **AppHeader** - Main application header with navigation
2. **SidebarNav** - Collapsible sidebar navigation
3. **MobileNavDrawer** - Mobile navigation drawer
4. **MobileBottomNav** - Mobile bottom navigation
5. **Breadcrumb** - Navigation path indicator
6. **Container** - Responsive content container

## Routing System

### Route Structure
```
Business App Routes:
/                    - Dashboard
/accounts           - Accounts list
/accounts/:id       - Account details
/cashbook           - Cashbook entries
/invoices           - Invoices list
/inventory          - Inventory items
/reports            - Financial reports
/settings           - User settings
/login              - Business user login

SuperAdmin App Routes:
/admin               - SuperAdmin dashboard
/admin/businesses    - Business management
/admin/branches      - Branch management
/admin/users         - User/Role management
/admin/settings      - App settings
/admin/audit         - Audit trail viewer
/admin/feedback      - Feedback management
/admin/diagnostics   - System diagnostics
/admin/login         - SuperAdmin login
```

### Route Guards
- **Authentication Guard** - Ensures user is logged in
- **Role Guard** - Ensures user has required role
- **Branch Scope Guard** - Ensures user can access requested branch data

### Navigation Components
1. **Business Navigation** - For Admin and Staff roles
2. **SuperAdmin Navigation** - For SuperAdmin role
3. **Contextual Navigation** - Based on user role and permissions

## Authentication System

### Login Flow
1. **Business User Login**
   - Email/password authentication
   - Business selection
   - Branch selection
   - Role selection
   - Session creation

2. **SuperAdmin Login**
   - Email/password authentication
   - Session creation

### Session Management
- JWT tokens with 24-hour expiration
- HttpOnly and Secure cookies
- Refresh token mechanism
- Session invalidation on logout

### User Context
- User role (SuperAdmin, Admin, Staff)
- Business context (businessId)
- Branch context (branchId)
- Permission set

## RBAC Implementation

### Roles
1. **SuperAdmin** - System-wide administrator
2. **Admin** - Business-level administrator
3. **Staff** - Branch-specific user

### Permissions Model
- Role-based navigation filtering
- Component-level permission checking
- API request authorization
- Data visibility enforcement

### Branch Scoping
- Staff: Can only access their assigned branch
- Admin: Can access all branches within their business
- SuperAdmin: Can access all branches globally

## Data Management

### API Client
- RESTful API communication
- Automatic header injection (business-id, user-id)
- Error handling and retry logic
- Request/response caching

### State Management
- **Server State**: TanStack Query for API data
- **Client State**: Zustand for UI and session state
- **Offline State**: IndexedDB for local data storage

### Data Fetching Patterns
```typescript
// Query for data with automatic caching
const { data, isLoading, error } = useQuery({
  queryKey: ['accounts', businessId],
  queryFn: () => api.getAccounts(businessId),
  staleTime: 60000, // 1 minute
});

// Mutation for data changes
const mutation = useMutation({
  mutationFn: (newAccount) => api.createAccount(newAccount),
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries(['accounts']);
  },
});
```

## PWA Implementation

### Service Worker Features
- Static asset caching
- API response caching
- Background sync for offline operations
- Push notifications
- Offline fallback pages

### Offline Capabilities
- Offline banner indicator
- Local data storage with IndexedDB
- Pending operations queue
- Automatic sync when online

### Installation
- Web App Manifest
- Install prompt handling
- Splash screen support
- Icon generation for all devices

## Accessibility

### WCAG AA Compliance
- Minimum contrast ratio of 4.5:1 for normal text
- Minimum contrast ratio of 3:1 for large text
- Proper focus indicators
- Keyboard navigation support
- Screen reader compatibility

### Accessibility Features
- Semantic HTML structure
- ARIA attributes for interactive elements
- Skip to content functionality
- Proper heading hierarchy
- Alternative text for images
- Focus management

## Performance Optimization

### Core Web Vitals Targets
- **LCP**: < 2.5 seconds
- **FID**: < 100 milliseconds
- **CLS**: < 0.1

### Optimization Techniques
- Route-based code splitting
- Component-based lazy loading
- Asset optimization (images, fonts, icons)
- Bundle size reduction
- Virtualized lists for large datasets
- Memoization of expensive components

### Performance Monitoring
- Lighthouse integration in CI pipeline
- Web Vitals reporting
- Bundle size tracking
- Performance budget enforcement

## Security

### Authentication Security
- Secure JWT token handling
- Password complexity requirements
- Rate limiting for login attempts
- Session expiration and refresh

### Data Security
- HTTPS enforcement
- Input validation and sanitization
- CORS policy configuration
- Content Security Policy headers

### Client-Side Security
- Role-based UI filtering
- Permission checking for actions
- Secure storage of sensitive data
- Prevention of XSS and CSRF attacks

## Testing Strategy

### Test Types
1. **Unit Tests** - Component and utility testing
2. **Integration Tests** - API and state management
3. **E2E Tests** - User journey testing
4. **Accessibility Tests** - WCAG compliance
5. **Performance Tests** - Core Web Vitals

### Testing Tools
- **Jest** - Unit testing framework
- **React Testing Library** - React component testing
- **Cypress** - E2E testing
- **axe-core** - Accessibility testing
- **Lighthouse** - Performance testing

### Test Coverage Goals
- 90%+ code coverage for critical components
- 85%+ code coverage for business logic
- 100% coverage for authentication and authorization
- Comprehensive accessibility testing
- Performance testing for all critical paths

## Deployment

### Build Process
- Vite for fast builds
- TypeScript compilation
- CSS optimization
- Asset minification
- Bundle analysis

### Environment Configuration
- Environment-specific variables
- Feature flags
- API endpoint configuration
- Analytics integration

### Deployment Targets
- Static hosting (Netlify, Vercel, etc.)
- Self-hosted servers
- Docker containerization

## Maintenance

### Update Strategy
- Dependency update monitoring
- Security vulnerability scanning
- Performance monitoring
- User feedback collection

### Monitoring
- Error tracking (Sentry, etc.)
- Performance monitoring
- User behavior analytics
- System health checks

### Documentation
- Component documentation
- API documentation
- User guides
- Developer guides

## Future Enhancements

### Planned Features
1. **Internationalization** - Multi-language support
2. **Advanced Reporting** - Custom report builder
3. **Mobile App** - Native mobile application
4. **AI Assistant** - Financial insights and recommendations
5. **Integration Platform** - Third-party service integrations

### Technical Improvements
1. **Micro Frontends** - Modular architecture for large teams
2. **Real-time Updates** - WebSocket-based live data
3. **Advanced Caching** - Redis-based caching layer
4. **Server Components** - React Server Components adoption
5. **Edge Computing** - CDN-based edge functions

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies with `npm install`
3. Start development server with `npm run dev`
4. Run tests with `npm test`
5. Build for production with `npm run build`

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for changelog
- Semantic versioning for releases

### Pull Request Process
1. Create feature branch from main
2. Implement changes with tests
3. Update documentation if needed
4. Submit pull request with description
5. Code review and approval required
6. Merge to main after CI passes

## Support

### Getting Help
- Check documentation first
- Search existing issues
- Join community discussions
- Contact support team

### Reporting Issues
- Use issue templates
- Provide reproduction steps
- Include environment information
- Add relevant screenshots/logs

### Feature Requests
- Check roadmap first
- Submit detailed request
- Include use cases
- Engage in discussion

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Thanks to all contributors
- Inspired by modern financial applications
- Built with open source technologies