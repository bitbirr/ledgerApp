import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, MoreVertical, Search, ArrowUpDown, SkipBack, Phone } from 'lucide-react';

interface AppBarProps {
  title: string;
  showBack?: boolean;
  showSort?: boolean;
  showSearch?: boolean;
  showMore?: boolean;
  subtitle?: string;
  onBack?: () => void;
  rightActions?: React.ReactNode;
}

export function AppBar({ 
  title, 
  showBack = false, 
  showSort = false, 
  showSearch = false, 
  showMore = false,
  subtitle,
  onBack,
  rightActions 
}: AppBarProps) {
  const { setDrawerOpen, setSortBy } = useAppStore();

  const handleSort = (sortOption: string) => {
    setSortBy(sortOption as any);
  };

  return (
    <header className="bg-primary text-primary-foreground shadow-elevation-2 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          {showBack ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 mr-2 hover:bg-white hover:bg-opacity-10"
              data-testid="button-back"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDrawerOpen(true)}
              className="p-2 mr-2 hover:bg-white hover:bg-opacity-10"
              data-testid="button-menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-lg font-medium" data-testid="text-title">{title}</h1>
            {subtitle && (
              <p className="text-sm opacity-90" data-testid="text-subtitle">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {rightActions}
          
          {showSort && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-white hover:bg-opacity-10"
                  data-testid="button-sort"
                >
                  <ArrowUpDown className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => handleSort('name-asc')}>
                  Name (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('name-desc')}>
                  Name (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('amount-desc')}>
                  Amount (High to Low)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('amount-asc')}>
                  Amount (Low to High)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {showSearch && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-white hover:bg-opacity-10"
              data-testid="button-search"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {showMore && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-white hover:bg-opacity-10"
              data-testid="button-more"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
