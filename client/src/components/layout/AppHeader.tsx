import { useState } from 'react';
import { useAuthStore } from '@/lib/auth-store';
import { useTheme } from '@/lib/design-tokens';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Search, 
  Building2, 
  MapPin, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  ChevronDown,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  onMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function AppHeader({ onMenuToggle, isMobileMenuOpen }: AppHeaderProps) {
  const { user, role, businessId, branchId, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isBusinessSelectorOpen, setIsBusinessSelectorOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // In a real implementation, this would also call the API to invalidate the session
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section */}
        <div className="flex items-center space-x-3">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuToggle}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-foreground">Credit Debit</h1>
              <p className="text-xs text-muted-foreground">Financial Management</p>
            </div>
          </div>
        </div>

        {/* Center section - Search (desktop only) */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Business/Branch selector (desktop) */}
          <div className="hidden lg:flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Your Business</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Main Branch</span>
            </div>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </Button>

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center space-x-2"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {role?.toLowerCase() || 'role'}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>

            {/* User dropdown menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-md shadow-lg z-50">
                <div className="p-4 border-b border-border">
                  <p className="text-sm font-medium text-foreground">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {role?.toLowerCase() || 'role'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {businessId ? `Business: ${businessId}` : 'No business selected'}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Settings
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                    onClick={toggleTheme}
                  >
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </button>
                  <hr className="my-1 border-border" />
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-muted"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 inline mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </div>
    </header>
  );
}