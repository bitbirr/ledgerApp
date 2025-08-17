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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

// Local types to match client shape
type Item = InsertItem & { id: string };
type Category = { id: string; name: string };

export function Inventory() {
  const { setCurrentScreen } = useAppStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddItem, setShowAddItem] = useState(false);

  /* =========================
     Queries
  ========================= */

  const { data: items, isLoading } = useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async (): Promise<Item[]> => {
      return await db.items.toArray();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async (): Promise<Category[]> => {
      return await db.categories.toArray();
    },
  });

  /* =========================
     Form
  ========================= */

  const form = useForm<InsertItem>({
    resolver: zodResolver(insertItemSchema),
    defaultValues: {
      name: '',
      rate: 0,
      uom: 'pcs',
      categoryId: '',
      openingStock: 0,
      lowStockAlert: 0,
      // If InsertItem includes businessId and your DB requires it, you can prefill it:
      // businessId: 'default-business',
    } as any, // in case InsertItem is stricter in your shared schema
  });

  /* =========================
     Mutations
  ========================= */

  const createItemMutation = useMutation<Item, Error, InsertItem>({
    mutationFn: async (data: InsertItem): Promise<Item> => {
      const id = crypto.randomUUID();
      const item: Item = {
        id,
        ...data,
        // Ensure businessId exists if your table requires it
        ...(data as any).businessId ? {} : { businessId: 'default-business' },
      } as Item;

      await db.items.add(item);
      return item;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast({ title: 'Success', description: 'Item added successfully' });
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
    // Normalize numbers and empty strings if your schema is strict
    const payload: InsertItem = {
      ...data,
      rate: Number(data.rate) || 0,
      openingStock: Number(data.openingStock) || 0,
      lowStockAlert: Number(data.lowStockAlert) || 0,
      categoryId: data.categoryId || '', // leave empty if unassigned
    } as any;

    createItemMutation.mutate(payload);
  };

  /* =========================
     Helpers
  ========================= */

  const isLowStock = (item: Item) =>
    Number(item.openingStock) <= Number(item.lowStockAlert) &&
    Number(item.lowStockAlert) > 0;

  /* =========================
     Render
  ========================= */

  return (
    <div className="min-h-screen bg-background">
      <AppBar
        title="Items & Inventory"
        showBack
        showSearch
        onBack={() => setCurrentScreen('dashboard')}
      />

      <main className="pb-20 p-4">
        {isLoading ? (
          <div className="space-y-3">
            {/* simple skeleton without external dependency */}
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-6 w-1/3 bg-muted animate-pulse rounded mb-2" />
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item: Item) => (
              <Card key={item.id} data-testid={`card-item-${item.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div
                          className="font-medium"
                          data-testid={`text-item-name-${item.id}`}
                        >
                          {item.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(Number(item.rate))} per {item.uom}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Stock: {item.openingStock} {item.uom}
                          {isLowStock(item) && (
                            <span className="ml-2 text-orange-600 inline-flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Low Stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className="font-medium"
                        data-testid={`text-item-rate-${item.id}`}
                      >
                        {formatCurrency(Number(item.rate))}
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
            <Button
              onClick={() => setShowAddItem(true)}
              data-testid="button-add-first-item"
            >
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
        <DialogContent className="dialog-form">
          <DialogHeader>
            <DialogTitle className="heading-financial">Add Item</DialogTitle>
            <DialogDescription className="body-financial text-muted-foreground">
              Add a new item to your inventory with pricing and stock information.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="form-enhanced financial-form form-animate-in"
            >
              <div className="form-section">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="form-field-enhanced">
                      <FormLabel className="form-label required">Item Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter item name"
                          className="form-input"
                          {...field}
                          data-testid="input-item-name"
                        />
                      </FormControl>
                      <FormMessage className="form-message error" />
                    </FormItem>
                  )}
                />

                <div className="form-row-2">
                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem className="form-field-enhanced">
                        <FormLabel className="form-label required">Rate</FormLabel>
                        <div className="amount-field">
                          <span className="currency-symbol">₹</span>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="form-input amount-input"
                              value={field.value ?? 0}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                              data-testid="input-item-rate"
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="form-message error" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="uom"
                    render={({ field }) => (
                      <FormItem className="form-field-enhanced">
                        <FormLabel className="form-label">Unit of Measure</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="pcs, kg, ltr"
                            className="form-input"
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            data-testid="input-item-uom"
                          />
                        </FormControl>
                        <FormMessage className="form-message error" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="form-field-enhanced">
                      <FormLabel className="form-label">Category</FormLabel>
                      <Select value={field.value ?? ''} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger
                            className="form-select"
                            data-testid="select-item-category"
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="form-message error" />
                    </FormItem>
                  )}
                />

                <div className="form-row-2">
                  <FormField
                    control={form.control}
                    name="openingStock"
                    render={({ field }) => (
                      <FormItem className="form-field-enhanced">
                        <FormLabel className="form-label">Opening Stock</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className="form-input"
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            data-testid="input-opening-stock"
                          />
                        </FormControl>
                        <FormMessage className="form-message error" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lowStockAlert"
                    render={({ field }) => (
                      <FormItem className="form-field-enhanced">
                        <FormLabel className="form-label">Low Stock Alert</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            className="form-input"
                            value={field.value ?? 0}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            data-testid="input-low-stock-alert"
                          />
                        </FormControl>
                        <FormMessage className="form-message error" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="form-actions">
                <Button
                  type="button"
                  variant="outline"
                  className="btn-secondary"
                  onClick={() => setShowAddItem(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="btn-primary"
                  disabled={createItemMutation.isPending}
                >
                  {createItemMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Item'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
