import { useState, useEffect } from 'react';

// Design Tokens for Credit Debit Financial App
export const designTokens = {
  // Light Theme
  light: {
    // Background colors
    background: '210 20% 98%',
    foreground: '222 84% 4.9%',
    card: '0 0% 100%',
    cardForeground: '222 84% 4.9%',
    popover: '0 0% 100%',
    popoverForeground: '222 84% 4.9%',
    
    // Primary colors
    primary: '221 83% 53%',
    primaryForeground: '210 40% 98%',
    secondary: '210 40% 96%',
    secondaryForeground: '222 84% 4.9%',
    
    // Neutral colors
    muted: '210 40% 96%',
    mutedForeground: '215 16% 47%',
    accent: '210 40% 96%',
    accentForeground: '222 84% 4.9%',
    
    // Status colors
    success: '142 76% 36%',
    successForeground: '355 100% 97%',
    warning: '38 92% 50%',
    warningForeground: '48 96% 89%',
    destructive: '0 84% 60%',
    destructiveForeground: '210 40% 98%',
    
    // Financial specific colors
    profit: '142 76% 36%',
    loss: '0 84% 60%',
    neutral: '215 16% 47%',
    credit: '142 76% 36%',
    debit: '0 84% 60%',
    
    // UI elements
    border: '214 32% 91%',
    input: '214 32% 91%',
    ring: '221 83% 53%',
    radius: '8px',
    
    // Shadows
    shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    shadowXl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    shadowPrimary25: '0 10px 15px -3px hsl(var(--primary) / 0.25), 0 4px 6px -4px hsl(var(--primary) / 0.25)',
  },
  
  // Dark Theme
  dark: {
    // Background colors
    background: '222 84% 4.9%',
    foreground: '210 40% 98%',
    card: '222 84% 4.9%',
    cardForeground: '210 40% 98%',
    popover: '222 84% 4.9%',
    popoverForeground: '210 40% 98%',
    
    // Primary colors
    primary: '217 91% 60%',
    primaryForeground: '222 84% 4.9%',
    secondary: '217 32% 17%',
    secondaryForeground: '210 40% 98%',
    
    // Neutral colors
    muted: '217 32% 17%',
    mutedForeground: '215 20% 65%',
    accent: '217 32% 17%',
    accentForeground: '210 40% 98%',
    
    // Status colors
    success: '142 76% 36%',
    successForeground: '355 100% 97%',
    warning: '38 92% 50%',
    warningForeground: '48 96% 89%',
    destructive: '0 84% 60%',
    destructiveForeground: '210 40% 98%',
    
    // Financial specific colors
    profit: '142 76% 36%',
    loss: '0 84% 60%',
    neutral: '215 20% 65%',
    credit: '142 76% 36%',
    debit: '0 84% 60%',
    
    // UI elements
    border: '217 32% 17%',
    input: '217 32% 17%',
    ring: '224 76% 78%',
    radius: '8px',
    
    // Shadows
    shadowSm: '0 1px 2px 0 rgb(0 0 0 / 0.1)',
    shadow: '0 1px 3px 0 rgb(0 0 0 / 0.2), 0 1px 2px -1px rgb(0 0 0 / 0.2)',
    shadowMd: '0 4px 6px -1px rgb(0 0 0 / 0.2), 0 2px 4px -2px rgb(0 0 0 / 0.2)',
    shadowLg: '0 10px 15px -3px rgb(0 0 0 / 0.2), 0 4px 6px -4px rgb(0 0 0 / 0.2)',
    shadowXl: '0 20px 25px -5px rgb(0 0 0 / 0.2), 0 8px 10px -6px rgb(0 0 0 / 0.2)',
    shadowPrimary25: '0 10px 15px -3px hsl(var(--primary) / 0.25), 0 4px 6px -4px hsl(var(--primary) / 0.25)',
  },
  
  // Typography
  typography: {
    fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    fontMono: "'JetBrains Mono', 'Fira Code', monospace",
    
    fontSizeXs: '0.75rem', // 12px
    fontSizeSm: '0.875rem', // 14px
    fontSizeBase: '1rem', // 16px
    fontSizeLg: '1.125rem', // 18px
    fontSizeXl: '1.25rem', // 20px
    fontSize2Xl: '1.5rem', // 24px
    fontSize3Xl: '1.875rem', // 30px
    fontSize4Xl: '2.25rem', // 36px
  },
  
  // Spacing
  spacing: {
    spacing0: '0',
    spacing1: '0.25rem', // 4px
    spacing2: '0.5rem', // 8px
    spacing3: '0.75rem', // 12px
    spacing4: '1rem', // 16px
    spacing5: '1.25rem', // 20px
    spacing6: '1.5rem', // 24px
    spacing8: '2rem', // 32px
    spacing10: '2.5rem', // 40px
    spacing12: '3rem', // 48px
    spacing16: '4rem', // 64px
    spacing20: '5rem', // 80px
    spacing24: '6rem', // 96px
    spacing32: '8rem', // 128px
    spacing40: '10rem', // 160px
    spacing48: '12rem', // 192px
    spacing56: '14rem', // 224px
    spacing64: '16rem', // 256px
  },
  
  // Breakpoints
  breakpoints: {
    mobile: '640px',
    tablet: '1024px',
    desktop: '1280px',
  },
  
  // Z-Index
  zIndex: {
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modalBackdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
  },
};

// Helper function to get CSS variables
export const getCSSVariables = (theme: 'light' | 'dark' = 'light') => {
  const tokens = designTokens[theme];
  const cssVars: Record<string, string> = {};
  
  // Convert token object to CSS variables
  Object.entries(tokens).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      // Skip nested objects for now
      return;
    }
    cssVars[`--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`] = value as string;
  });
  
  return cssVars;
};

// Helper function to apply theme
export const applyTheme = (theme: 'light' | 'dark') => {
  const root = document.documentElement;
  const cssVars = getCSSVariables(theme);
  
  Object.entries(cssVars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  // Add/remove dark class
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Hook for theme management
export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  useEffect(() => {
    // Check system preference
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  return { theme, toggleTheme };
};