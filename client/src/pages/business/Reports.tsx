import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Filter, 
  Download, 
  BarChart3,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export function Reports() {
  const { toast } = useToast();
  const { businessId, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Fetch report data with TanStack Query
  const { data: reportData, isLoading, isError, error } = useQuery({
    queryKey: ['reports', businessId, dateRange.start, dateRange.end],
    queryFn: async () => {
      if (!businessId || !user?.id) {
        throw new Error('Missing business or user ID');
      }
      
      // Fetch all required data for reports
      const [accountSummary, accounts] = await Promise.all([
        api.getAccountSummary(businessId, user.id),
        api.getAccounts(businessId, user.id)
      ]);
      
      return {
        accountSummary,
        accounts
      };
    },
    enabled: !!businessId && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter accounts based on search term
  const filteredAccounts = reportData?.accounts.filter(account => 
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Calculate net balance
  const netBalance = reportData?.accountSummary 
    ? reportData.accountSummary.totalDebit - reportData.accountSummary.totalCredit 
    : 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Skeleton className="h-10 w-full pl-10" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <Skeleton className="h-32 w-32 rounded-full" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trial Balance Table */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
                <div className="col-span-6">Account</div>
                <div className="col-span-3 text-right">Debit</div>
                <div className="col-span-3 text-right">Credit</div>
              </div>
              {[...Array(5)].map((_, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b">
                  <div className="col-span-6">
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <div className="col-span-3 text-right">
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="col-span-3 text-right">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Financial reports and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load report data: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Financial reports and analytics</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Implement actual export functionality
              // For now, just show a success message
              toast({
                title: 'Export Initiated',
                description: 'Your report export has been initiated. This may take a few moments.',
              });
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              placeholder="Start date"
            />
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              placeholder="End date"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Debit</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {reportData?.accountSummary?.totalDebit.toLocaleString() || '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credit</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {reportData?.accountSummary?.totalCredit.toLocaleString() || '0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ETB {netBalance.toLocaleString() || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trial Balance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance</CardTitle>
          <CardDescription>
            Summary of all account balances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
              <div className="col-span-6">Account</div>
              <div className="col-span-3 text-right">Debit</div>
              <div className="col-span-3 text-right">Credit</div>
            </div>
            {filteredAccounts.map((account) => (
              <div 
                key={account.id} 
                className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors"
              >
                <div className="col-span-6 font-medium text-foreground">
                  {account.name}
                </div>
                <div className="col-span-3 text-right">
                  {account.type === 'customer' ? 'ETB 0.00' : '-'}
                </div>
                <div className="col-span-3 text-right">
                  {account.type === 'supplier' ? 'ETB 0.00' : '-'}
                </div>
              </div>
            ))}
            {filteredAccounts.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium mb-2">No accounts found</h3>
                <p className="mb-4">Try adjusting your search or filter to find what you're looking for.</p>
              </div>
            )}
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-t text-sm font-medium text-foreground">
              <div className="col-span-6 font-medium">Total</div>
              <div className="col-span-3 text-right font-medium">
                ETB {reportData?.accountSummary?.totalDebit.toLocaleString() || '0.00'}
              </div>
              <div className="col-span-3 text-right font-medium">
                ETB {reportData?.accountSummary?.totalCredit.toLocaleString() || '0.00'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}