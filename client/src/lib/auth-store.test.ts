import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';

describe('Auth Store', () => {
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
      currentScreen: 'login',
      login: useAuthStore.getState().login,
      logout: useAuthStore.getState().logout,
      refreshSession: useAuthStore.getState().refreshSession,
      setRole: useAuthStore.getState().setRole,
      setBusinessContext: useAuthStore.getState().setBusinessContext,
      hasPermission: useAuthStore.getState().hasPermission,
      isAuthorizedForBranch: useAuthStore.getState().isAuthorizedForBranch,
      isTokenExpired: useAuthStore.getState().isTokenExpired,
      setCurrentScreen: useAuthStore.getState().setCurrentScreen,
      setPreloginData: useAuthStore.getState().setPreloginData,
      setSelectedBusiness: useAuthStore.getState().setSelectedBusiness,
      setSelectedBranch: useAuthStore.getState().setSelectedBranch,
      setBusinessBranchData: useAuthStore.getState().setBusinessBranchData,
      completeLogin: useAuthStore.getState().completeLogin,
    });
  });

  it('should initialize with default values', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.role).toBeNull();
    expect(state.currentScreen).toBe('login');
  });

  it('should login a user', () => {
    const state = useAuthStore.getState();
    state.login({
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
    });

    const newState = useAuthStore.getState();
    expect(newState.isAuthenticated).toBe(true);
    expect(newState.user).not.toBeNull();
    expect(newState.user?.name).toBe('Test User');
    expect(newState.role).toBe('Admin');
  });

  it('should logout a user', () => {
    // First login
    const state = useAuthStore.getState();
    state.login({
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
    });

    // Then logout
    state.logout();

    const newState = useAuthStore.getState();
    expect(newState.isAuthenticated).toBe(false);
    expect(newState.user).toBeNull();
    expect(newState.role).toBeNull();
    expect(newState.currentScreen).toBe('login');
  });

  it('should set current screen', () => {
    const state = useAuthStore.getState();
    state.setCurrentScreen('chooseBusiness');

    const newState = useAuthStore.getState();
    expect(newState.currentScreen).toBe('chooseBusiness');
  });

  it('should complete login and set current screen to dashboard', () => {
    const state = useAuthStore.getState();
    state.completeLogin({
      token: 'fake-token',
      refreshToken: 'fake-refresh-token',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      role: 'Admin',
      businessId: 'business-123',
      branchId: 'branch-123',
    });

    const newState = useAuthStore.getState();
    expect(newState.isAuthenticated).toBe(true);
    expect(newState.currentScreen).toBe('dashboard');
  });
});