import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CashbookEntry } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function Cashbook() {
  const { toast } = useToast();
  const { businessId, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const queryClient = useQueryClient();
  
  // Fetch cashbook entries with TanStack Query
  const { data: entries = [], isLoading, isError, error } = useQuery<CashbookEntry[], Error>({
    queryKey: ['cashbook', businessId, dateRange.start, dateRange.end],
    queryFn: () => api.getCashbookEntries(businessId!, dateRange.start, dateRange.end),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter entries based on search term
  const filteredEntries = entries.filter(entry => 
    (entry.note?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     entry.amount.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate totals
  const totals = entries.reduce((acc, entry) => {
    const amount = parseFloat(entry.amount);
    if (entry.direction === 'in') {
      acc.totalIn += amount;
    } else {
      acc.totalOut += amount;
    }
    return acc;
  }, { totalIn: 0, totalOut: 0 });

  // Handle entry deletion
  const handleDeleteEntry = async (entryId: string) => {
    if (!businessId) return;
    
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await api.deleteCashbookEntry(entryId, businessId);
        // Invalidate and refetch entries
        queryClient.invalidateQueries({ queryKey: ['cashbook', businessId, dateRange.start, dateRange.end] });
        
        // Show success message
        toast({
          title: 'Entry Deleted',
          description: 'The cashbook entry has been deleted successfully.',
        });
      } catch (err) {
        console.error('Failed to delete entry:', err);
        
        // Show error message
        toast({
          title: 'Error',
          description: 'Failed to delete entry. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

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
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Skeleton className="h-10 w-full pl-10" />
              </div>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Totals Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
                  <div className="col-span-2">Date</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Amount In</div>
                  <div className="col-span-2">Amount Out</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b">
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="col-span-3">
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="col-span-1">
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {[...Array(3)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cashbook</h1>
            <p className="text-muted-foreground">Track your cash transactions</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load cashbook entries: {error instanceof Error ? error.message : 'Unknown error'}
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
          <h1 className="text-2xl font-bold text-foreground">Cashbook</h1>
          <p className="text-muted-foreground">Track your cash transactions</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search entries..."
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
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Totals Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-success/10 border-success/20">
              <CardContent className="pt-4">
                <div className="text-sm text-success font-medium">Total In</div>
                <div className="text-2xl font-bold text-success">
                  ETB {totals.totalIn.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-destructive/10 border-destructive/20">
              <CardContent className="pt-4">
                <div className="text-sm text-destructive font-medium">Total Out</div>
                <div className="text-2xl font-bold text-destructive">
                  ETB {totals.totalOut.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-primary/10 border-primary/20">
              <CardContent className="pt-4">
                <div className="text-sm text-primary font-medium">Net Balance</div>
                <div className="text-2xl font-bold text-primary">
                  ETB {(totals.totalIn - totals.totalOut).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Cashbook Entries</CardTitle>
            <CardDescription>
              {filteredEntries.length} entries found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
                <div className="col-span-2">Date</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Amount In</div>
                <div className="col-span-2">Amount Out</div>
                <div className="col-span-1">Actions</div>
              </div>
              {filteredEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-2 text-foreground">
                    {new Date(entry.dateTime).toLocaleDateString()}
                  </div>
                  <div className="col-span-3 font-medium text-foreground">
                    {entry.note || 'No description'}
                  </div>
                  <div className="col-span-2">
                    <Badge variant={entry.direction === 'in' ? 'default' : 'secondary'}>
                      {entry.direction === 'in' ? 'Receipt' : 'Payment'}
                    </Badge>
                  </div>
                  <div className="col-span-2 font-medium text-success">
                    {entry.direction === 'in' ? `ETB ${Number(entry.amount).toLocaleString()}` : '-'}
                  </div>
                  <div className="col-span-2 font-medium text-destructive">
                    {entry.direction === 'out' ? `ETB ${Number(entry.amount).toLocaleString()}` : '-'}
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Delete"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredEntries.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No entries found</h3>
                  <p className="mb-4">Try adjusting your search or filter to find what you're looking for.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredEntries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {new Date(entry.dateTime).toLocaleDateString()}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {entry.note || 'No description'}
                  </p>
                </div>
                <Badge variant={entry.direction === 'in' ? 'default' : 'secondary'}>
                  {entry.direction === 'in' ? 'Receipt' : 'Payment'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount In</span>
                  <span className="font-medium text-success">
                    {entry.direction === 'in' ? `ETB ${Number(entry.amount).toLocaleString()}` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Out</span>
                  <span className="font-medium text-destructive">
                    {entry.direction === 'out' ? `ETB ${Number(entry.amount).toLocaleString()}` : '-'}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-1">
                <Button variant="ghost" size="sm" title="View">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" title="Edit">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  title="Delete"
                  onClick={() => handleDeleteEntry(entry.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredEntries.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No entries found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}