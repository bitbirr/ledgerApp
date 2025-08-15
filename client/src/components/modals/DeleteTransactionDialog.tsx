import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Transaction } from '@shared/schema';

interface DeleteTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export function DeleteTransactionDialog({ transaction, open, onClose }: DeleteTransactionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteTransactionMutation = useMutation({
    mutationFn: async () => {
      if (!transaction) throw new Error('No transaction to delete');
      
      // Soft delete by setting deleted flag
      await db.transactions.update(transaction.id, { deleted: true });
      return transaction.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['account-balance'] });
      toast({
        title: 'Success',
        description: 'Transaction deleted successfully',
      });
      onClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = () => {
    deleteTransactionMutation.mutate();
  };

  if (!transaction) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transaction? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="my-4 p-4 bg-muted rounded-md">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Date:</span>
              <span>{formatDate(transaction.dateTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              <span className={transaction.kind === 'credit' ? 'text-green-600' : 'text-red-600'}>
                {transaction.kind === 'credit' ? 'Received' : 'Paid'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Amount:</span>
              <span className={`font-bold ${transaction.kind === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(transaction.amount)}
              </span>
            </div>
            {transaction.note && (
              <div className="flex justify-between">
                <span className="font-medium">Note:</span>
                <span className="text-right max-w-48 truncate">{transaction.note}</span>
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteTransactionMutation.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleteTransactionMutation.isPending ? 'Deleting...' : 'Delete Transaction'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}