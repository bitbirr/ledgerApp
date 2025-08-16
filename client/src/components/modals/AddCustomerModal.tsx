import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertAccountSchema, type InsertAccount } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, X } from 'lucide-react';

interface AddCustomerModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddCustomerModal({ open, onClose }: AddCustomerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<InsertAccount>({
    resolver: zodResolver(insertAccountSchema),
    defaultValues: {
      name: '',
      phone: '',
      type: 'customer',
      categoryId: 'general',
      photoUrl: '',
      archived: false,
    },
  });

const createAccountMutation = useMutation({
  mutationFn: async (data: InsertAccount) => {
    // Build only fields the API expects
    const payload = {
      name: data.name.trim(),
      phone: data.phone?.trim() || undefined,
      type: data.type, // 'customer' | 'supplier' | 'other'
      // send a category id only if it's a real id, not your placeholder
      categoryId: data.categoryId && data.categoryId !== 'general' ? data.categoryId : undefined,
      photoUrl: data.photoUrl || undefined,
    };

    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // your server relies on these headers
        'user-id': 'default-user',
        'business-id': 'default-business',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create account');
    }

    const created = await res.json();
    return created; // shape is whatever your API returns
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['accounts'] });
    // If you also cache summaries, invalidate those too:
    queryClient.invalidateQueries({ queryKey: ['account-summary'] });
    toast({ title: 'Success', description: 'Customer added successfully' });
    form.reset();
    onClose();
  },
  onError: () => {
    toast({
      title: 'Error',
      description: 'Failed to add customer',
      variant: 'destructive',
    });
  },
});

  const onSubmit = (data: InsertAccount) => {
    createAccountMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Add Customer</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Add a new customer to your ledger with their contact information.
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
                      placeholder="Customer name"
                      {...field}
                      data-testid="input-customer-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1 234 567 8900"
                      {...field}
                      data-testid="input-customer-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Photo</FormLabel>
              <div className="flex items-center space-x-4 mt-2">
                <Avatar className="w-16 h-16">
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="button-choose-photo"
                >
                  Choose Photo
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-customer-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={createAccountMutation.isPending}
                data-testid="button-save-customer"
              >
                {createAccountMutation.isPending ? 'Saving...' : 'Save Customer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
