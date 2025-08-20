import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { type Account } from '@/lib/db';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Trash2,
  AlertTriangle,
  Loader2,
  Phone,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type CustomerAccount = Account & {
  // Optional profile fields that often live alongside Account
  profilePhoto?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  accountType?: string | null;
  type?: string | null;
  createdAt?: string | number | Date | null;
  updatedAt?: string | number | Date | null;
};

interface DeleteCustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer: CustomerAccount | null;
  balance?: number;
}

export function DeleteCustomerModal({
  open,
  onClose,
  customer,
  balance = 0,
}: DeleteCustomerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getInitials = (name: string) =>
    String(name || '')
      .trim()
      .split(/\s+/)
      .map((n) => n[0] || '')
      .join('')
      .toUpperCase() || 'U';

  const deleteCustomerMutation = useMutation({
    mutationFn: async () => {
      if (!customer) throw new Error('No customer to delete');

      const res = await fetch(`/api/accounts/${customer.id}`, {
        method: 'DELETE',
        // If your API requires auth/context headers, uncomment and fill:
        // headers: {
        //   'user-id': 'default-user',
        //   'business-id': 'default-business',
        // },
      });

      if (!res.ok) {
        // Try to read JSON error first; fall back to text/status
        let msg = '';
        try {
          const body = await res.json();
          msg = body?.error || '';
        } catch {
          msg = await res.text();
        }
        throw new Error(msg || `Failed to delete customer (${res.status})`);
      }

      // You don't use the result, but return for completeness
      try {
        return await res.json();
      } catch {
        return null;
      }
    },
    onSuccess: () => {
      // Invalidate anything that lists/aggregates accounts
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['account-summary'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });

      toast({
        title: 'Success!',
        description: 'Customer deleted successfully.',
        className: 'bg-gray-900 border-lime-500 text-white',
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete customer. Please try again.',
        variant: 'destructive',
        className: 'bg-gray-900 border-red-500 text-white',
      });
    },
  });

  const isDeleting = deleteCustomerMutation.isPending;
  const hasBalance = Number.isFinite(balance) && Math.abs(balance || 0) > 0;

  if (!customer) return null;

  return (
    <AnimatePresence>
      {open && (
        <Dialog
          open={open}
          // IMPORTANT: shadcn/ui expects (nextOpen: boolean) => void
          onOpenChange={(next) => {
            if (!next) {
              // prevent closing while deleting
              if (isDeleting) {
                toast({
                  title: 'Please wait…',
                  description: 'Deletion in progress.',
                });
                return;
              }
              onClose();
            }
          }}
        >
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Trash2 className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-semibold text-white">
                      Delete Customer
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      This action cannot be undone
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Customer Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <Avatar className="w-12 h-12">
                    {customer.profilePhoto ? (
                      <AvatarImage src={customer.profilePhoto} alt={customer.name} />
                    ) : (
                      <AvatarFallback className="bg-gray-700 text-lime-400">
                        {getInitials(customer.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white truncate">{customer.name}</h3>
                    {customer.phone && (
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="truncate">{customer.phone}</span>
                      </p>
                    )}
                    {hasBalance && (
                      <p
                        className={`text-sm font-medium ${
                          (balance || 0) > 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {(balance || 0) > 0 ? 'Advance' : 'Due'}: {formatCurrency(Math.abs(balance || 0))}
                      </p>
                    )}
                  </div>
                </div>

                {/* Warning when balance exists */}
                {hasBalance && (
                  <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-400 mb-1">Outstanding Balance</p>
                      <p className="text-sm text-gray-300">
                        This customer has an outstanding balance. Deleting will remove all transaction history.
                      </p>
                    </div>
                  </div>
                )}

                {/* Permanent deletion warning */}
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400 mb-1">Permanent Deletion</p>
                    <p className="text-sm text-gray-300">
                      This will permanently delete the customer and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (isDeleting) {
                        toast({ title: 'Please wait…', description: 'Deletion in progress.' });
                        return;
                      }
                      onClose();
                    }}
                    className="flex-1 bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      if (!isDeleting) deleteCustomerMutation.mutate();
                    }}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Customer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
