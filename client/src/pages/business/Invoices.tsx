import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
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
import { Invoice } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function Invoices() {
  const { toast } = useToast();
  const { businessId, branchId, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();
  
  // Fetch invoices with TanStack Query
  const { data: invoices = [], isLoading, isError, error } = useQuery<Invoice[], Error>({
    queryKey: ['invoices', businessId, branchId],
    queryFn: () => api.getInvoices(businessId!, branchId || undefined),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter invoices based on search term and status
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          invoice.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handle invoice deletion
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!businessId) return;
    
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.deleteInvoice(invoiceId, businessId);
        // Invalidate and refetch invoices
        queryClient.invalidateQueries({ queryKey: ['invoices', businessId, branchId] });
        
        // Show success message
        toast({
          title: 'Invoice Deleted',
          description: 'The invoice has been deleted successfully.',
        });
      } catch (err) {
        console.error('Failed to delete invoice:', err);
        
        // Show error message
        toast({
          title: 'Error',
          description: 'Failed to delete invoice. Please try again.',
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
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Skeleton className="h-10 w-full pl-10" />
              </div>
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-8 w-20" />
          ))}
        </div>

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
                  <div className="col-span-2">Invoice #</div>
                  <div className="col-span-2">Customer</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Due Date</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b">
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="col-span-1">
                      <Skeleton className="h-6 w-16" />
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
            <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
            <p className="text-muted-foreground">Manage your invoices</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load invoices: {error instanceof Error ? error.message : 'Unknown error'}
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
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage your invoices</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Invoice
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
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setStatusFilter('all')}>
              All Statuses
            </Button>
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

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        <Button 
          variant={statusFilter === 'all' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setStatusFilter('all')}
        >
          All
        </Button>
        <Button 
          variant={statusFilter === 'draft' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setStatusFilter('draft')}
        >
          Draft
        </Button>
        <Button 
          variant={statusFilter === 'sent' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setStatusFilter('sent')}
        >
          Sent
        </Button>
        <Button 
          variant={statusFilter === 'paid' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setStatusFilter('paid')}
        >
          Paid
        </Button>
        <Button 
          variant={statusFilter === 'overdue' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setStatusFilter('overdue')}
        >
          Overdue
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Invoice List</CardTitle>
            <CardDescription>
              {filteredInvoices.length} invoices found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
                <div className="col-span-2">Invoice #</div>
                <div className="col-span-2">Customer</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2">Amount</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
              {filteredInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-2 font-medium text-foreground">
                    {invoice.invoiceNumber}
                  </div>
                  <div className="col-span-2 text-foreground">
                    {invoice.customerId}
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    {new Date(invoice.issueDate).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </div>
                  <div className="col-span-2 font-medium">
                    ETB {Number(invoice.total).toLocaleString()}
                  </div>
                  <div className="col-span-1">
                    <Badge variant={
                      invoice.status === 'paid' ? 'default' :
                      invoice.status === 'overdue' ? 'destructive' :
                      invoice.status === 'sent' ? 'secondary' : 'outline'
                    }>
                      {invoice.status}
                    </Badge>
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
                        onClick={() => handleDeleteInvoice(invoice.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredInvoices.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No invoices found</h3>
                  <p className="mb-4">Try adjusting your search or filter to find what you're looking for.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {invoice.invoiceNumber}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {invoice.customerId}
                  </p>
                </div>
                <Badge variant={
                  invoice.status === 'paid' ? 'default' :
                  invoice.status === 'overdue' ? 'destructive' :
                  invoice.status === 'sent' ? 'secondary' : 'outline'
                }>
                  {invoice.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Date</span>
                  <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">
                    ETB {Number(invoice.total).toLocaleString()}
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
                  onClick={() => handleDeleteInvoice(invoice.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredInvoices.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No invoices found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}