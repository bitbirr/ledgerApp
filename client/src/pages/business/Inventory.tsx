import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Plus, 
  Filter, 
  Package,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/auth-store';

export function Inventory() {
  const { role } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Mock inventory data
  const inventoryItems = [
    { id: 1, name: 'Laptop', sku: 'LAP-001', category: 'Electronics', stock: 15, lowStockAlert: 5, unitPrice: 25000 },
    { id: 2, name: 'Office Chair', sku: 'CHR-002', category: 'Furniture', stock: 8, lowStockAlert: 10, unitPrice: 3500 },
    { id: 3, name: 'Desk', sku: 'DSK-003', category: 'Furniture', stock: 12, lowStockAlert: 5, unitPrice: 8500 },
    { id: 4, name: 'Monitor', sku: 'MON-004', category: 'Electronics', stock: 3, lowStockAlert: 5, unitPrice: 12000 },
    { id: 5, name: 'Keyboard', sku: 'KBD-005', category: 'Electronics', stock: 25, lowStockAlert: 10, unitPrice: 1200 },
  ];

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'low-stock' && item.stock <= item.lowStockAlert);
    return matchesSearch && matchesStatus;
  });

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
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={statusFilter === 'all' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All Items
              </Button>
              <Button 
                variant={statusFilter === 'low-stock' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setStatusFilter('low-stock')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Low Stock
              </Button>
            </div>
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
              More Filters
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
                <div className="col-span-2">SKU</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2">Stock</div>
                <div className="col-span-2">Unit Price</div>
                <div className="col-span-1">Status</div>
              </div>
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className="grid grid-cols-12 gap-4 p-4 border-b hover:bg-muted/30 transition-colors"
                >
                  <div className="col-span-3 font-medium text-foreground">
                    {item.name}
                  </div>
                  <div className="col-span-2 text-muted-foreground">
                    {item.sku}
                  </div>
                  <div className="col-span-2 text-foreground">
                    {item.category}
                  </div>
                  <div className="col-span-2">
                    <span className={`font-medium ${
                      item.stock <= item.lowStockAlert ? 'text-destructive' : 'text-foreground'
                    }`}>
                      {item.stock} units
                    </span>
                    {item.stock <= item.lowStockAlert && (
                      <AlertTriangle className="h-4 w-4 text-destructive inline ml-2" />
                    )}
                  </div>
                  <div className="col-span-2 font-medium text-foreground">
                    {item.unitPrice.toLocaleString()} ETB
                  </div>
                  <div className="col-span-1">
                    <Badge variant={item.stock <= item.lowStockAlert ? 'destructive' : 'default'}>
                      {item.stock <= item.lowStockAlert ? 'Low' : 'In Stock'}
                    </Badge>
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
                <Badge variant={item.stock <= item.lowStockAlert ? 'destructive' : 'default'}>
                  {item.stock <= item.lowStockAlert ? 'Low' : 'In Stock'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU</span>
                  <span className="font-medium text-foreground">{item.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span>{item.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock</span>
                  <span className={`font-medium ${
                    item.stock <= item.lowStockAlert ? 'text-destructive' : 'text-foreground'
                  }`}>
                    {item.stock} units
                    {item.stock <= item.lowStockAlert && (
                      <AlertTriangle className="h-4 w-4 text-destructive inline ml-2" />
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unit Price</span>
                  <span className="font-medium text-foreground">
                    {item.unitPrice.toLocaleString()} ETB
                  </span>
                </div>
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