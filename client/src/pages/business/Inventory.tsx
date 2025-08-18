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
  AlertCircle,
  Package,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Item } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function Inventory() {
  const { toast } = useToast();
  const { businessId, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  
  // Fetch inventory items with TanStack Query
  const { data: items = [], isLoading, isError, error } = useQuery<Item[], Error>({
    queryKey: ['items', businessId],
    queryFn: () => api.getItems(businessId!),
    enabled: !!businessId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Filter items based on search term
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle item deletion
  const handleDeleteItem = async (itemId: string) => {
    if (!businessId) return;
    
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.deleteItem(itemId, businessId);
        // Invalidate and refetch items
        queryClient.invalidateQueries({ queryKey: ['items', businessId] });
        
        // Show success message
        toast({
          title: 'Item Deleted',
          description: 'The inventory item has been deleted successfully.',
        });
      } catch (err) {
        console.error('Failed to delete item:', err);
        
        // Show error message
        toast({
          title: 'Error',
          description: 'Failed to delete item. Please try again.',
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
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Skeleton className="h-10 w-full pl-10" />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
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
                  <div className="col-span-3">Item Name</div>
                  <div className="col-span-2">Rate</div>
                  <div className="col-span-2">Unit</div>
                  <div className="col-span-2">Stock</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1">Actions</div>
                </div>
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 p-4 border-b">
                    <div className="col-span-3">
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="col-span-2">
                      <Skeleton className="h-6 w-20" />
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
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
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
            <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
            <p className="text-muted-foreground">Manage your inventory items</p>
          </div>
          <div className="flex gap-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load inventory items: {error instanceof Error ? error.message : 'Unknown error'}
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
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Manage your inventory items</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Items</CardTitle>
            <CardDescription>
              {filteredItems.length} items found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b text-sm font-medium text-foreground">
                <div className="col-span-3">Item Name</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-2">Unit</div>
                <div className="col-span-2">Stock</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-3 font-medium text-foreground">
                    {item.name}
                  </div>
                  <div className="col-span-2">
                    ETB {item.rate.toLocaleString()}
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    {item.uom}
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center gap-2">
                      <span>{item.openingStock}</span>
                      {item.openingStock <= item.lowStockAlert && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    {item.openingStock <= item.lowStockAlert ? (
                      <Badge variant="destructive">Low Stock</Badge>
                    ) : (
                      <Badge variant="default">In Stock</Badge>
                    )}
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
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No items found</h3>
                  <p className="mb-4">Try adjusting your search or filter to find what you're looking for.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredItems.map((item) => (
          <Card key={item.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.openingStock <= item.lowStockAlert ? (
                  <Badge variant="destructive">Low Stock</Badge>
                ) : (
                  <Badge variant="default">In Stock</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span>ETB {item.rate.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit</span>
                  <span>{item.uom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <div className="flex items-center gap-2">
                    <span>{item.openingStock}</span>
                    {item.openingStock <= item.lowStockAlert && (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                  </div>
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
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No items found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filter to find what you're looking for.
              </p>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}