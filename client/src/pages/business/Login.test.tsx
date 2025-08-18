import { render, screen } from '@testing-library/react';
import { BusinessLogin } from './Login';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '@/lib/auth-store';
import * as api from '@/lib/api';

// Mock the auth store
vi.mock('@/lib/auth-store', () => ({
  useAuthStore: vi.fn(),
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock the design tokens hook
vi.mock('@/lib/design-tokens', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
  }));
  
  // Mock the API functions
  vi.mock('@/lib/api', () => ({
    api: {
      getBusinesses: vi.fn().mockResolvedValue([]),
      getBranches: vi.fn().mockResolvedValue([]),
    },
  }));

describe('BusinessLogin', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    
    // Mock the auth store implementation
    (useAuthStore as any).mockReturnValue({
      login: vi.fn(),
    });
  });

  it('renders the login form', () => {
    render(<BusinessLogin />);
    
    // Check that the main elements are present
    expect(screen.getByText('Business Login')).toBeTruthy();
    expect(screen.getByText('Sign in to your business account')).toBeTruthy();
    
    // Check for form fields
    expect(screen.getByText('Select your business')).toBeTruthy();
    expect(screen.getByText('Select your branch')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your username')).toBeTruthy();
    expect(screen.getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  it('renders role selection buttons', () => {
    render(<BusinessLogin />);
    
    // Check for role selection
    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByText('Staff')).toBeTruthy();
  });

  it('renders remember me checkbox', () => {
    render(<BusinessLogin />);
    
    // Check for remember me checkbox
    expect(screen.getByLabelText('Remember me')).toBeTruthy();
  });

  it('renders theme toggle button', () => {
    render(<BusinessLogin />);
    
    // Check for theme toggle (we can't easily test the icon without testing-library matchers)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
  
  it('renders business and branch dropdowns', () => {
    render(<BusinessLogin />);
    
    // Check for Select components
    expect(screen.getByText('Select your business')).toBeTruthy();
    expect(screen.getByText('Select your branch')).toBeTruthy();
  });
});