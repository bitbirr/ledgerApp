import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define User type inline since we don't have a separate types file
interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Role = 'SuperAdmin' | 'Admin' | 'Staff' | null;

export type Screen = 
  // shared 
  | 'login' | 'chooseBusiness' | 'chooseBranch' | 'dashboard' 
  // business app 
  | 'accounts' | 'cashbook' | 'invoices' | 'inventory' | 'reports' | 'settings' 
  // superadmin app 
  | 'businesses' | 'branches' | 'users' | 'audit' | 'feedback' | 'diagnostics' | 'settings';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  role: Role;
  businessId: string | null;
  branchId: string | null;
  permissions: string[];
  token: string | null;
  tokenExpiry: number | null; // Unix timestamp
  refreshToken: string | null;
  
  // New properties for multi-step auth flow
  preloginToken: string | null;
  businesses: Array<{ id: string; name: string }> | null;
  branches: Array<{ id: string; name: string }> | null;
  selectedBusinessId: string | null;
  selectedBranchId: string | null;
  
  // UI state for auth flow
  currentScreen: Screen;
  
  // Actions
  login: (data: {
    user: User;
    token: string;
    refreshToken: string;
    role: Role;
    businessId?: string;
    branchId?: string;
    expiresIn?: number;
  }) => void;
  
  // New actions for multi-step auth flow
  setPreloginData: (data: { token: string; businesses: Array<{ id: string; name: string }> }) => void;
  setSelectedBusiness: (businessId: string) => void;
  setSelectedBranch: (branchId: string) => void;
  setBusinessBranchData: (data: { 
    token: string; 
    branches: Array<{ id: string; name: string }> 
  }) => void;
  completeLogin: (data: {
    token: string;
    refreshToken: string;
    user: User;
    role: Role;
    expiresIn?: number;
    businessId: string;
    branchId: string;
  }) => void;
  
  logout: () => void;
  refreshSession: (newToken: string, newRefreshToken: string) => void;
  setRole: (role: Role) => void;
  setBusinessContext: (businessId: string, branchId: string) => void;
  hasPermission: (permission: string) => boolean;
  isAuthorizedForBranch: (branchId: string) => boolean;
  isTokenExpired: () => boolean;
  setCurrentScreen: (screen: Screen) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      role: null,
      businessId: null,
      branchId: null,
      permissions: [],
      token: null,
      tokenExpiry: null,
      refreshToken: null,
      
      // New properties for multi-step auth flow
      preloginToken: null,
      businesses: null,
      branches: null,
      selectedBusinessId: null,
      selectedBranchId: null,
      
      // UI state for auth flow
      currentScreen: 'login',
      
      // Actions
      login: (data) => set({
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        role: data.role,
        businessId: data.businessId || null,
        branchId: data.branchId || null,
        tokenExpiry: data.expiresIn ? Date.now() + data.expiresIn * 1000 : null,
      }),
      
      // New actions for multi-step auth flow
      setPreloginData: (data) => set({
        preloginToken: data.token,
        businesses: data.businesses,
        branches: null,
        selectedBusinessId: null,
        selectedBranchId: null,
      }),
      
      setSelectedBusiness: (businessId) => set({
        selectedBusinessId: businessId,
        branches: null,
        selectedBranchId: null,
      }),
      
      setBusinessBranchData: (data) => set({
        preloginToken: data.token,
        branches: data.branches,
      }),
      
      setSelectedBranch: (branchId) => set({
        selectedBranchId: branchId,
      }),
      
      completeLogin: (data) => set({
        isAuthenticated: true,
        user: data.user,
        token: data.token,
        refreshToken: data.refreshToken,
        role: data.role,
        businessId: data.businessId,
        branchId: data.branchId,
        tokenExpiry: data.expiresIn ? Date.now() + data.expiresIn * 1000 : null,
        // Clear prelogin data
        preloginToken: null,
        businesses: null,
        branches: null,
        selectedBusinessId: null,
        selectedBranchId: null,
        currentScreen: 'dashboard',
      }),
      
      logout: () => set({
        isAuthenticated: false,
        user: null,
        role: null,
        businessId: null,
        branchId: null,
        permissions: [],
        token: null,
        tokenExpiry: null,
        refreshToken: null,
        // Clear prelogin data
        preloginToken: null,
        businesses: null,
        branches: null,
        selectedBusinessId: null,
        selectedBranchId: null,
        currentScreen: 'login',
      }),
      
      refreshSession: (newToken: string, newRefreshToken: string) => set((state) => {
        // Calculate new expiry (assuming 1 hour like the original)
        const newExpiry = Date.now() + 60 * 60 * 1000;
        return {
          token: newToken,
          refreshToken: newRefreshToken,
          tokenExpiry: newExpiry,
        };
      }),
      
      setRole: (role) => set({ role }),
      
      setBusinessContext: (businessId, branchId) => set({ businessId, branchId }),
      
      hasPermission: (permission) => get().permissions.includes(permission),
      
      isAuthorizedForBranch: (branchId) => get().branchId === branchId,
      
      isTokenExpired: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return true;
        return Date.now() >= tokenExpiry;
      },
      
      setCurrentScreen: (screen) => set({ currentScreen: screen }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        role: state.role,
        businessId: state.businessId,
        branchId: state.branchId,
        token: state.token,
        tokenExpiry: state.tokenExpiry,
        refreshToken: state.refreshToken,
        currentScreen: state.currentScreen,
      }),
    }
  )
);