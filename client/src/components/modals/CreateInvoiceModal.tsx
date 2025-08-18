import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

const invoiceItemSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  description: z.string().optional(),
  quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  rate: z.number().min(0.01, 'Rate must be greater than 0'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
});

const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  subtotal: z.number().min(0.01, 'Subtotal must be greater than 0'),
  tax: z.number().min(0, 'Tax must be 0 or greater'),
  total: z.number().min(0.01, 'Total must be greater than 0'),
});

type InvoiceItemForm = z.infer<typeof invoiceItemSchema>;
type CreateInvoiceForm = z.infer<typeof createInvoiceSchema>;

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvoiceForm) => Promise<void>;
}

export function CreateInvoiceModal({ open, onClose, onSubmit }: CreateInvoiceModalProps) {
  const { toast } = useToast();
  const { businessId, branchId } = useAuthStore();
  const queryClient = useQueryClient();
  const [items, setItems] = useState<InvoiceItemForm[]>([{ 
    itemId: '', 
    description: '', 
    quantity: 1, 
    rate: 0, 
    amount: 0 
  }]);

  // Fetch customers and items for dropdowns
  const { data: customers = [] } = useQuery({
    queryKey: ['accounts', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      const accounts = await api.getAccounts(businessId, 'default-user');
      return accounts.filter(account => account.type === 'customer');
    },
    enabled: !!businessId,
  });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ['items', businessId],
    queryFn: async () => {
      if (!businessId) return [];
      return await api.getItems(businessId);
    },
    enabled: !!businessId,
  });

  const form = useForm<CreateInvoiceForm>({
    resolver: zodResolver(createInvoiceSchema),
    defaultValues: {
      customerId: '',
      invoiceNumber: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ itemId: '', description: '', quantity: 1, rate: 0, amount: 0 }],
      notes: '',
      subtotal: 0,
      tax: 0,
      total: 0,
    },
  });

  // Calculate amounts when items change
  const calculateAmounts = (itemItems: InvoiceItemForm[]) => {
    const subtotal = itemItems.reduce((sum, item) => sum + item.amount, 0);
    const tax = 0; // For simplicity, we're not implementing tax calculation
    const total = subtotal + tax;
    
    form.setValue('subtotal', subtotal);
    form.setValue('tax', tax);
    form.setValue('total', total);
    
    return { subtotal, tax, total };
  };

  // Add a new item row
  const addItem = () => {
    const newItems = [...items, { itemId: '', description: '', quantity: 1, rate: 0, amount: 0 }];
    setItems(newItems);
    form.setValue('items', newItems);
  };

  // Remove an item row
  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    form.setValue('items', newItems);
    calculateAmounts(newItems);
  };

  // Update an item
  const updateItem = (index: number, field: keyof InvoiceItemForm, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // If we're updating itemId, get the item details
    if (field === 'itemId') {
      const item = inventoryItems.find(i => i.id === value);
      if (item) {
        newItems[index].description = item.name;
        newItems[index].rate = item.rate;
        newItems[index].amount = newItems[index].quantity * item.rate;
      }
    }
    
    // If we're updating quantity or rate, recalculate amount
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }
    
    setItems(newItems);
    form.setValue('items', newItems);
    calculateAmounts(newItems);
  };

  const handleSubmit = async (data: CreateInvoiceForm) => {
    try {
      await onSubmit(data);
      toast({
        title: 'Success',
        description: 'Invoice created successfully',
      });
      form.reset();
      setItems([{ itemId: '', description: '', quantity: 1, rate: 0, amount: 0 }]);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Create Invoice</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Create a new invoice for your customer
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Customer and Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Invoice Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Items</h3>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-4">
                      <Select
                        value={item.itemId}
                        onValueChange={(value) => updateItem(index, 'itemId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select item" />
                        </SelectTrigger>
                        <SelectContent>
                          {inventoryItems.map((inventoryItem) => (
                            <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                              {inventoryItem.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Quantity"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="Rate"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="col-span-3">
                      <Input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                      />
                    </div>
                    
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        disabled={items.length <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Input placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-start-2 md:col-span-2 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>ETB {form.watch('subtotal').toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>ETB {form.watch('tax').toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>ETB {form.watch('total').toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Invoice
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}