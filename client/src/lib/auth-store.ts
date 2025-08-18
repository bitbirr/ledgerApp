import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Business, BusinessUser } from '@shared/schema';

interface AuthState {
  // Authentication status
  isAuthenticated: boolean;
  user: User | null;
  
  // RBAC information
  role: 'SuperAdmin' | 'Admin' | 'Staff' | null;
  businessId: string | null;
  branchId: string | null;
  permissions: string[];
  
  // Session management
  token: string | null;
  tokenExpiry: Date | null;
  refreshToken: string | null;
  
  // Business context
  currentBusiness: Business | null;
  businessUsers: BusinessUser[];
  
  // UI State
  currentScreen: string;
  
  // Actions
  login: (userData: {
    user: User;
    token: string;
    refreshToken: string;
    role: 'SuperAdmin' | 'Admin' | 'Staff';
    businessId?: string;
    branchId?: string;
  }) => void;
  
  logout: () => void;
  setRole: (role: 'SuperAdmin' | 'Admin' | 'Staff') => void;
  setBusinessContext: (businessId: string, branchId?: string) => void;
  hasPermission: (permission: string) => boolean;
  isAuthorizedForBranch: (branchId: string) => boolean;
  isTokenExpired: () => boolean;
  refreshSession: (newToken: string, newRefreshToken: string) => void;
  setCurrentScreen: (screen: string) => void;
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
      currentBusiness: null,
      businessUsers: [],
      currentScreen: 'dashboard',
      
      // Actions
      login: (userData) => {
        // Validate that businessId is provided
        if (!userData.businessId) {
          throw new Error('Business ID is required for login');
        }

        // Normalize role to title case to avoid casing mismatches
        const rawRole = (userData.role as any)?.toString?.() ?? '';
        const roleLower = rawRole.toLowerCase();
        const normalizedRole =
          roleLower === 'superadmin' ? 'SuperAdmin' :
          roleLower === 'admin' ? 'Admin' :
          roleLower === 'staff' ? 'Staff' :
          null;

        if (!normalizedRole) {
          console.warn('[AuthStore] Unknown role received from API:', rawRole);
        }
        
        // Validate that branchId (if provided) belongs to the business
        if (userData.branchId) {
          // In a real implementation, we would verify the branch belongs to the business
          // For now, we'll just ensure it's not an empty string
          if (userData.branchId.trim() === '') {
            throw new Error('Invalid branch ID');
          }
        }
        
        const newState = {
          isAuthenticated: true,
          user: userData.user,
          role: (normalizedRole as 'SuperAdmin' | 'Admin' | 'Staff') ?? userData.role,
          businessId: userData.businessId || null,
          branchId: userData.branchId || null,
          token: userData.token,
          refreshToken: userData.refreshToken,
          tokenExpiry: userData.token ? new Date(Date.now() + 3600000) : null, // 1 hour expiry
        };
        
        set(newState);

        // Diagnostics
        try {
          console.debug('[AuthStore] login state', newState);
        } catch {}
      },
      
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
        currentBusiness: null,
        businessUsers: [],
        currentScreen: 'dashboard',
      }),
      
      setRole: (role) => set({ role }),
      
      setBusinessContext: (businessId, branchId) => set({ 
        businessId, 
        branchId: branchId || null 
      }),
      
      hasPermission: (permission) => {
        const { permissions } = get();
        return permissions.includes(permission);
      },
      
      isAuthorizedForBranch: (branchId) => {
        const { role, branchId: userBranchId } = get();
        // SuperAdmin can access any branch
        if (role === 'SuperAdmin') return true;
        // Staff can only access their assigned branch
        if (role === 'Staff' && userBranchId) {
          return userBranchId === branchId;
        }
        // Admin can access all branches within their business
        if (role === 'Admin') return true;
        return false;
      },
      
      isTokenExpired: () => {
        const { tokenExpiry } = get();
        if (!tokenExpiry) return true;
        return new Date() > tokenExpiry;
      },
      
      refreshSession: (newToken, newRefreshToken) => set({
        token: newToken,
        refreshToken: newRefreshToken,
        tokenExpiry: new Date(Date.now() + 3600000), // 1 hour expiry
      }),
      
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
        refreshToken: state.refreshToken,
        tokenExpiry: state.tokenExpiry,
        currentScreen: state.currentScreen,
      }),
    }
  )
);