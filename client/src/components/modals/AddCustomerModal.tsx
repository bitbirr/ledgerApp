import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertAccountSchema, type InsertAccount } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
      // Normalize payload for API (avoid sending empty strings)
      const payload = {
        name: data.name.trim(),
        phone: data.phone?.trim() || undefined,
        type: data.type, // 'customer' | 'supplier' | 'other'
        categoryId:
          data.categoryId && data.categoryId !== 'general' ? data.categoryId : undefined,
        photoUrl: data.photoUrl || undefined,
      };

      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': 'default-user',
          'business-id': 'default-business',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create account');
      }

      return await res.json();
    },
    onSuccess: () => {
      // Invalidate any related caches
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account-summary'] });

      toast({ title: 'Success', description: 'Customer added successfully' });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to add customer',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: InsertAccount) => {
    createAccountMutation.mutate(data);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Close only when dialog transitions to closed
        if (!next) onClose();
      }}
    >
      <DialogContent className="dialog-form">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="heading-financial">Add Customer</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription className="body-financial text-muted-foreground">
            Add a new customer to your ledger with their contact information.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="form-enhanced form-animate-in">
            <div className="form-section">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="form-field-enhanced">
                    <FormLabel className="form-label required">Customer Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter customer name"
                        className="form-input"
                        {...field}
                        data-testid="input-customer-name"
                      />
                    </FormControl>
                    <FormMessage className="form-message error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="form-field-enhanced">
                    <FormLabel className="form-label">Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+251 9XX XX XX XX"
                        className="form-input"
                        {...field}
                        data-testid="input-customer-phone"
                      />
                    </FormControl>
                    <FormMessage className="form-message error" />
                  </FormItem>
                )}
              />

              <div className="form-field-enhanced">
                <FormLabel className="form-label">Profile Photo</FormLabel>
                <div className="flex items-center space-x-4 mt-2">
                  <Avatar className="w-16 h-16 border-2 border-border">
                    <AvatarFallback className="bg-muted">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="btn-secondary"
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
                  <FormItem className="form-field-enhanced">
                    <FormLabel className="form-label">Account Type</FormLabel>
                    {/* Controlled Select: use value, not defaultValue */}
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="form-select" data-testid="select-customer-type">
                          <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="form-message error" />
                  </FormItem>
                )}
              />
            </div>

            <div className="form-actions">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createAccountMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="btn-primary" disabled={createAccountMutation.isPending}>
                {createAccountMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Saving...
                  </>
                ) : (
                  'Add Customer'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
