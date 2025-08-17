import { Skeleton } from './skeleton';
import { Card, CardContent, CardHeader } from './card';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Dashboard Summary Cards Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid-responsive gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="financial-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-24 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Customer List */}
      <Card className="financial-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3 p-3 rounded-lg border">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// Form Loading Skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-16" />
      </div>
    </div>
  );
}

// Table Loading Skeleton (Enhanced version of existing TableSkeleton)
export function TableLoadingSkeleton({ 
  rows = 5, 
  columns = 4 
}: { 
  rows?: number; 
  columns?: number; 
}) {
  return (
    <div className="table-skeleton">
      {/* Header */}
      <div className="flex border-b pb-3 mb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="flex-1 px-3">
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex py-3 border-b border-border/50">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 px-3">
              <Skeleton 
                className={cn(
                  "h-4",
                  colIndex === 0 ? "w-24" : colIndex === columns - 1 ? "w-16" : "w-20"
                )} 
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Card List Skeleton (for Inventory, etc.)
export function CardListSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: items }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// Button Loading State
export function LoadingButton({ 
  children, 
  loading, 
  className,
  disabled,
  ...props 
}: {
  children: React.ReactNode;
  loading?: boolean;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}) {
  return (
    <Button 
      className={cn(
        "relative",
        loading && "opacity-70 cursor-not-allowed",
        className
      )}
      disabled={loading || disabled}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
      <span className={loading ? "opacity-0" : ""}>
        {children}
      </span>
    </Button>
  );
}

// Page Loading Overlay
export function PageLoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Inline Loading Spinner
export function LoadingSpinner({ 
  size = "sm", 
  className 
}: { 
  size?: "sm" | "md" | "lg"; 
  className?: string; 
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };
  
  return (
    <Loader2 className={cn(
      "animate-spin text-muted-foreground",
      sizeClasses[size],
      className
    )} />
  );
}

// Content Loading Wrapper
export function LoadingWrapper({ 
  loading, 
  children, 
  skeleton,
  className 
}: {
  loading: boolean;
  children: React.ReactNode;
  skeleton?: React.ReactNode;
  className?: string;
}) {
  if (loading && skeleton) {
    return <div className={className}>{skeleton}</div>;
  }
  
  return (
    <div className={cn(loading && "loading-container", className)}>
      {loading && (
        <div className="loading-overlay">
          <LoadingSpinner size="md" />
        </div>
      )}
      <div className={loading ? "opacity-50 pointer-events-none" : ""}>
        {children}
      </div>
    </div>
  );
}

// Financial Data Loading (for amounts, balances)
export function FinancialDataSkeleton({ 
  rows = 3,
  showHeader = true 
}: { 
  rows?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="space-y-3">
      {showHeader && (
        <div className="flex justify-between items-center pb-2 border-b">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-2">
          <div className="space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  );
}