import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertItemSchema, type InsertItem } from '@shared/schema';
import { db } from '@/lib/db';
import { useAppStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { AppBar } from '@/components/layout/AppBar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Package, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function Inventory() {
  const { setCurrentScreen } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddItem, setShowAddItem] = useState(false);

  const { data: items } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      return await db.items.toArray();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      return await db.categories.toArray();
    },
  });

  const form = useForm<InsertItem>({
    resolver: zodResolver(insertItemSchema),
    defaultValues: {
      name: '',
      rate: 0,
      uom: 'pcs',
      categoryId: '',
      openingStock: 0,
      lowStockAlert: 0,
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertItem) => {
      const id = crypto.randomUUID();
      const item = { ...data, id };
      await db.items.add(item);
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast({
        title: 'Success',
        description: 'Item added successfully',
      });
      form.reset();
      setShowAddItem(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add item',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InsertItem) => {
    createItemMutation.mutate(data);
  };

  const isLowStock = (item: any) => {
    return item.openingStock <= item.lowStockAlert && item.lowStockAlert > 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppBar 
        title="Items & Inventory"
        showBack={true}
        showSearch={true}
        onBack={() => setCurrentScreen('dashboard')}
      />

      <main className="pb-20 p-4">
        {/* Items List */}
        {items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} data-testid={`card-item-${item.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium" data-testid={`text-item-name-${item.id}`}>
                          {item.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(item.rate)} per {item.uom}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Stock: {item.openingStock} {item.uom}
                          {isLowStock(item) && (
                            <span className="ml-2 text-orange-600 flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Low Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium" data-testid={`text-item-rate-${item.id}`}>
                        {formatCurrency(item.rate)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        per {item.uom}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <div className="text-muted-foreground mb-4">
              No items added yet. Add your first item to start managing inventory.
            </div>
            <Button onClick={() => setShowAddItem(true)} data-testid="button-add-first-item">
              Add Item
            </Button>
          </Card>
        )}
      </main>

      {/* Add Item FAB */}
      <Button
        className="fixed bottom-24 right-4 w-14 h-14 rounded-full shadow-lg"
        onClick={() => setShowAddItem(true)}
        data-testid="button-add-item-fab"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Item Modal */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle>Add Item</DialogTitle>
            <DialogDescription>
              Add a new item to your inventory with pricing and stock information.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Item name"
                        {...field}
                        data-testid="input-item-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-item-rate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="uom"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="pcs, kg, ltr"
                          {...field}
                          data-testid="input-item-uom"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-item-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="openingStock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Opening Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-opening-stock"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lowStockAlert"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Low Stock Alert</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid="input-low-stock-alert"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAddItem(false)}
                  data-testid="button-cancel-add-item"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createItemMutation.isPending}
                  data-testid="button-save-item"
                >
                  {createItemMutation.isPending ? 'Saving...' : 'Save Item'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
