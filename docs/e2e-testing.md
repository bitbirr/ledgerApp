# End-to-End Testing Implementation

## Overview
This document outlines the implementation of a robust end-to-end testing framework for the Credit Debit application using Cypress. E2E tests simulate real user workflows to ensure the entire application functions correctly from the user's perspective.

## E2E Testing Strategy

### Test Scope
End-to-end tests cover:
1. User authentication workflows
2. Core business workflows
3. Navigation and routing
4. Form submissions and validations
5. Data display and manipulation
6. Error handling and recovery
7. Responsive behavior
8. Accessibility features

### Critical User Workflows

#### Authentication Workflows
- Business user login with business/branch/role selection
- SuperAdmin login
- Session timeout and refresh
- Logout functionality
- Password reset flow

#### Account Management
- Create new customer/supplier account
- View account list and details
- Edit account information
- Archive/unarchive accounts
- Search and filter accounts

#### Transaction Processing
- Record new debit/credit transaction
- View transaction history
- Edit transaction details
- Delete transactions
- Filter transactions by date/type

#### Cashbook Operations
- Add cash receipt/payment entries
- View cashbook with date range filtering
- Export cashbook data
- View cashbook totals and balance

#### Invoice Management
- Create new invoices
- View invoice list with status filtering
- Process invoice payments
- Generate invoice reports
- Send invoices to customers

#### Inventory Management
- Add new inventory items
- Update stock levels
- View low stock alerts
- Track item movements
- Generate inventory reports

#### Reporting
- Generate trial balance report
- View financial summaries
- Export reports to CSV/PDF
- Customize report parameters

## Test Framework Setup

### Cypress Configuration
```javascript
// cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
    fixturesFolder: 'cypress/fixtures',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    setupNodeEvents(on, config) {
      // Implement node event listeners
      return config;
    },
  },
});
```

### Test Structure
```
cypress/
├── e2e/
│   ├── auth/
│   │   ├── business-login.cy.ts
│   │   ├── admin-login.cy.ts
│   │   └── logout.cy.ts
│   ├── accounts/
│   │   ├── create-account.cy.ts
│   │   ├── view-accounts.cy.ts
│   │   └── edit-account.cy.ts
│   ├── transactions/
│   │   ├── record-transaction.cy.ts
│   │   └── view-transactions.cy.ts
│   ├── cashbook/
│   │   ├── add-entry.cy.ts
│   │   └── view-cashbook.cy.ts
│   ├── invoices/
│   │   ├── create-invoice.cy.ts
│   │   └── process-payment.cy.ts
│   ├── inventory/
│   │   ├── add-item.cy.ts
│   │   └── update-stock.cy.ts
│   └── reports/
│       └── generate-report.cy.ts
├── fixtures/
│   ├── users.json
│   ├── accounts.json
│   └── transactions.json
├── support/
│   ├── commands.ts
│   └── e2e.ts
└── plugins/
    └── index.js
```

## Test Implementation Examples

### Authentication Test
```typescript
// cypress/e2e/auth/business-login.cy.ts
describe('Business User Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('successfully logs in as business admin', () => {
    // Fill in login form
    cy.get('[data-testid="business-input"]').type('test-business');
    cy.get('[data-testid="branch-input"]').type('test-branch');
    cy.get('[data-testid="role-admin"]').click();
    cy.get('[data-testid="username-input"]').type('admin');
    cy.get('[data-testid="password-input"]').type('password123');
    
    // Submit form
    cy.get('[data-testid="login-button"]').click();
    
    // Verify successful login
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="user-menu"]').should('contain', 'admin');
    cy.get('[data-testid="business-selector"]').should('contain', 'test-business');
  });

  it('shows error for invalid credentials', () => {
    // Fill in invalid credentials
    cy.get('[data-testid="username-input"]').type('invalid');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    
    // Submit form
    cy.get('[data-testid="login-button"]').click();
    
    // Verify error message
    cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
  });
});
```

### Account Management Test
```typescript
// cypress/e2e/accounts/create-account.cy.ts
describe('Account Creation', () => {
  beforeEach(() => {
    // Login as admin
    cy.loginAsAdmin();
    cy.visit('/accounts');
  });

  it('creates a new customer account', () => {
    // Navigate to create account form
    cy.get('[data-testid="create-account-button"]').click();
    
    // Fill in account details
    cy.get('[data-testid="account-name"]').type('Test Customer');
    cy.get('[data-testid="account-type"]').select('customer');
    cy.get('[data-testid="account-phone"]').type('123-456-7890');
    
    // Submit form
    cy.get('[data-testid="save-account-button"]').click();
    
    // Verify account was created
    cy.get('[data-testid="account-list"]').should('contain', 'Test Customer');
    cy.get('[data-testid="success-message"]').should('contain', 'Account created successfully');
  });

  it('shows validation errors for incomplete form', () => {
    // Try to submit empty form
    cy.get('[data-testid="create-account-button"]').click();
    cy.get('[data-testid="save-account-button"]').click();
    
    // Verify validation errors
    cy.get('[data-testid="error-message"]').should('contain', 'Account name is required');
  });
});
```

### Transaction Processing Test
```typescript
// cypress/e2e/transactions/record-transaction.cy.ts
describe('Transaction Recording', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.visit('/cashbook');
  });

  it('records a new debit transaction', () => {
    // Open transaction form
    cy.get('[data-testid="add-transaction-button"]').click();
    
    // Fill in transaction details
    cy.get('[data-testid="transaction-type"]').select('debit');
    cy.get('[data-testid="transaction-amount"]').type('1000');
    cy.get('[data-testid="transaction-description"]').type('Test debit transaction');
    cy.get('[data-testid="transaction-date"]').type('2023-01-15');
    
    // Submit form
    cy.get('[data-testid="save-transaction-button"]').click();
    
    // Verify transaction was recorded
    cy.get('[data-testid="transaction-list"]').should('contain', 'Test debit transaction');
    cy.get('[data-testid="transaction-amount"]').should('contain', '1,000.00');
  });
});
```

## Test Data Management

### Fixtures
```json
// cypress/fixtures/users.json
{
  "businessAdmin": {
    "username": "admin",
    "password": "password123",
    "business": "test-business",
    "branch": "test-branch",
    "role": "Admin"
  },
  "businessStaff": {
    "username": "staff",
    "password": "password123",
    "business": "test-business",
    "branch": "test-branch",
    "role": "Staff"
  },
  "superAdmin": {
    "username": "superadmin",
    "password": "adminpassword",
    "role": "SuperAdmin"
  }
}
```

### Custom Commands
```typescript
// cypress/support/commands.ts
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/login');
  cy.fixture('users').then((users) => {
    cy.get('[data-testid="business-input"]').type(users.businessAdmin.business);
    cy.get('[data-testid="branch-input"]').type(users.businessAdmin.branch);
    cy.get('[data-testid="role-admin"]').click();
    cy.get('[data-testid="username-input"]').type(users.businessAdmin.username);
    cy.get('[data-testid="password-input"]').type(users.businessAdmin.password);
    cy.get('[data-testid="login-button"]').click();
  });
});

Cypress.Commands.add('loginAsSuperAdmin', () => {
  cy.visit('/admin/login');
  cy.fixture('users').then((users) => {
    cy.get('[data-testid="username-input"]').type(users.superAdmin.username);
    cy.get('[data-testid="password-input"]').type(users.superAdmin.password);
    cy.get('[data-testid="login-button"]').click();
  });
});
```

## Responsive Testing

### Viewport Testing
```typescript
describe('Responsive Behavior', () => {
  it('adapts to mobile viewport', () => {
    cy.viewport('iphone-6');
    cy.visit('/');
    cy.loginAsAdmin();
    
    // Verify mobile-specific elements
    cy.get('[data-testid="mobile-nav"]').should('be.visible');
    cy.get('[data-testid="desktop-sidebar"]').should('not.be.visible');
  });

  it('adapts to tablet viewport', () => {
    cy.viewport('ipad-2');
    cy.visit('/');
    cy.loginAsAdmin();
    
    // Verify tablet-specific elements
    cy.get('[data-testid="tablet-nav"]').should('be.visible');
    cy.get('[data-testid="desktop-sidebar"]').should('be.visible');
  });

  it('adapts to desktop viewport', () => {
    cy.viewport(1280, 720);
    cy.visit('/');
    cy.loginAsAdmin();
    
    // Verify desktop-specific elements
    cy.get('[data-testid="desktop-sidebar"]').should('be.visible');
    cy.get('[data-testid="mobile-nav"]').should('not.be.visible');
  });
});
```

## Accessibility Testing

### axe-core Integration
```typescript
describe('Accessibility', () => {
  it('passes accessibility checks on dashboard', () => {
    cy.loginAsAdmin();
    cy.visit('/dashboard');
    
    // Run axe accessibility checks
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has proper color contrast', () => {
    cy.loginAsAdmin();
    cy.visit('/accounts');
    
    // Check specific elements for contrast
    cy.get('[data-testid="account-name"]').should('have.attr', 'data-contrast', 'pass');
  });
});
```

## Performance Testing

### Load Time Testing
```typescript
describe('Performance', () => {
  it('loads dashboard within acceptable time', () => {
    cy.loginAsAdmin();
    
    // Measure page load time
    cy.visit('/dashboard', {
      onBeforeLoad: (win) => {
        win.performance.mark('start-loading');
      },
      onLoad: (win) => {
        win.performance.mark('end-loading');
        const loadTime = win.performance
          .measure('page-load', 'start-loading', 'end-loading')
          .duration;
        expect(loadTime).to.be.lessThan(3000); // 3 seconds
      }
    });
  });
});
```

## Test Execution

### Continuous Integration
```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Start development server
        run: npm run dev &
      - name: Wait for server to start
        run: sleep 10
      - name: Run E2E tests
        run: npx cypress run
      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots
      - name: Upload videos
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: cypress-videos
          path: cypress/videos
```

### Parallel Test Execution
```javascript
// cypress.config.js (continued)
export default defineConfig({
  e2e: {
    // ... other config
  },
  projectId: 'your-project-id',
  retries: {
    runMode: 2,
    openMode: 0,
  },
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 60000,
});
```

## Test Maintenance

### Test Updates
- Update tests when UI changes
- Add new tests for new features
- Remove obsolete tests
- Refactor tests for maintainability

### Flaky Test Management
- Identify and isolate flaky tests
- Add proper waits and retries
- Fix timing issues
- Monitor test stability

### Reporting and Analytics
- Test execution reports
- Performance metrics
- Failure analysis
- Coverage tracking

This end-to-end testing framework provides comprehensive coverage of user workflows, ensuring the Credit Debit application functions correctly across all user interactions and scenarios.