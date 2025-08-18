# Integration Testing Implementation

## Overview
This document outlines the implementation of integration testing for critical workflows in the Credit Debit application. Integration tests validate the interaction between different modules and services, particularly focusing on API integration with real data.

## Integration Testing Strategy

### Test Scope
Integration tests cover:
1. API client integration with backend services
2. Authentication flow (login, logout, token refresh)
3. Data fetching and mutation workflows
4. RBAC validation across different user roles
5. Form submission and validation
6. Navigation and routing
7. State synchronization between components and stores

### Critical Workflows

#### Authentication Flow
- Business user login with business/branch/role selection
- SuperAdmin login
- Session management and token refresh
- Logout and session cleanup
- Unauthorized access handling

#### Account Management
- Account creation and listing
- Account details retrieval
- Account updates and deletion
- Account search and filtering

#### Transaction Processing
- Transaction creation (debit/credit)
- Transaction listing and filtering
- Transaction details retrieval
- Transaction updates and deletion

#### Cashbook Operations
- Cashbook entry creation
- Cashbook entry listing with date filtering
- Cashbook totals calculation
- Cashbook export functionality

#### Invoice Management
- Invoice creation and listing
- Invoice status updates
- Invoice details retrieval
- Invoice payment processing

#### Inventory Management
- Item creation and listing
- Item details retrieval
- Item updates and deletion
- Stock level monitoring

#### Reporting
- Financial report generation
- Trial balance calculation
- Export functionality
- Data aggregation

## Test Implementation

### API Integration Testing
```typescript
describe('API Integration', () => {
  // Mock the fetch function
  const mockFetch = vi.fn();

  beforeEach(() => {
    // Reset the mock before each test
    mockFetch.mockReset();
    // @ts-ignore - We're replacing the global fetch for testing
    global.fetch = mockFetch;
  });

  it('should fetch accounts with correct headers', async () => {
    // Mock the response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: '1', name: 'Test Account' }]),
    });

    // Call the API function
    const accounts = await api.getAccounts('business-123', 'user-123');

    // Check that fetch was called with the correct parameters
    expect(mockFetch).toHaveBeenCalledWith('/api/accounts', {
      headers: {
        'Content-Type': 'application/json',
        'business-id': 'business-123',
        'user-id': 'user-123',
      },
    });

    // Check the result
    expect(accounts).toHaveLength(1);
    expect(accounts[0].name).toBe('Test Account');
  });

  it('should handle API errors', async () => {
    // Mock an error response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    // Check that the function throws an error
    await expect(api.getAccounts('business-123', 'user-123')).rejects.toThrow('404 Not Found');
  });
});
```

### Authentication Flow Testing
```typescript
describe('Authentication Flow', () => {
  beforeEach(() => {
    // Reset the store before each test
    useAuthStore.setState({ 
      isAuthenticated: false, 
      user: null, 
      role: null, 
      businessId: null, 
      branchId: null, 
      permissions: [],
      token: null,
      tokenExpiry: null,
      refreshToken: null,
      login: useAuthStore.getState().login,
      logout: useAuthStore.getState().logout,
      refreshSession: useAuthStore.getState().refreshSession,
      setRole: useAuthStore.getState().setRole,
      setBusinessContext: useAuthStore.getState().setBusinessContext,
      hasPermission: useAuthStore.getState().hasPermission,
      isAuthorizedForBranch: useAuthStore.getState().isAuthorizedForBranch,
      isTokenExpired: useAuthStore.getState().isTokenExpired
    });
  });

  it('should complete business user login flow', async () => {
    // Mock API response for login
    const mockLoginResponse = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      token: 'fake-token',
      refreshToken: 'fake-refresh-token',
      role: 'Admin',
      businessId: 'business-123',
      branchId: 'branch-123',
    };

    // Mock the API client
    api.login = vi.fn().mockResolvedValue(mockLoginResponse);

    // Execute login
    const loginData = {
      username: 'testuser',
      password: 'password123',
      businessId: 'business-123',
      branchId: 'branch-123',
      role: 'Admin' as const,
    };

    await useAuthStore.getState().login(loginData);

    // Validate state changes
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.name).toBe('Test User');
    expect(state.role).toBe('Admin');
    expect(state.businessId).toBe('business-123');
    expect(state.branchId).toBe('branch-123');
  });
});
```

### Data Flow Testing
```typescript
describe('Data Flow Integration', () => {
  it('should synchronize account data between API and store', async () => {
    // Mock API response
    const mockAccounts = [
      { id: '1', name: 'Account 1', type: 'customer' },
      { id: '2', name: 'Account 2', type: 'supplier' },
    ];

    api.getAccounts = vi.fn().mockResolvedValue(mockAccounts);

    // Execute data fetching
    const queryClient = new QueryClient();
    const accounts = await queryClient.fetchQuery({
      queryKey: ['accounts', 'business-123'],
      queryFn: () => api.getAccounts('business-123', 'user-123'),
    });

    // Validate data consistency
    expect(accounts).toHaveLength(2);
    expect(accounts[0].name).toBe('Account 1');
    expect(accounts[1].type).toBe('supplier');
  });
});
```

## Test Environment Setup

### Mocking Strategy
- Network requests mocked with MSW or fetch mock
- External services stubbed
- Time-dependent functions mocked
- Random value generators controlled

### Test Data Management
- Realistic test data sets
- Data isolation between tests
- Test data cleanup
- Data consistency validation

### Performance Considerations
- Test execution time monitoring
- Parallel test execution
- Resource cleanup between tests
- Memory leak prevention

## Test Coverage Goals

### API Integration
- 100% of API endpoints tested
- All HTTP methods covered
- Error response handling
- Authentication header validation

### Authentication
- All login scenarios
- Session management
- Token refresh
- Logout functionality

### Data Workflows
- CRUD operations for all entities
- Data validation
- Business logic enforcement
- Error handling

### RBAC Validation
- Role-based access control
- Permission checking
- Branch scoping
- Unauthorized access handling

## Continuous Integration

### Test Execution
Integration tests are run:
- On every pull request
- Before production deployments
- On scheduled builds
- On demand for debugging

### Test Reporting
- Detailed test results
- Performance metrics
- Coverage reports
- Failure analysis

### Quality Gates
- Minimum coverage thresholds
- Performance benchmarks
- Security checks
- Accessibility validation

## Maintenance Strategy

### Test Updates
- Tests updated with API changes
- New tests added for new endpoints
- Obsolete tests removed
- Test refactoring for maintainability

### Monitoring
- Test execution time tracking
- Failure rate monitoring
- Coverage trend analysis
- Performance regression detection

This integration testing approach ensures that all critical workflows in the Credit Debit application function correctly when components and services work together, providing confidence in the application's reliability and data integrity.