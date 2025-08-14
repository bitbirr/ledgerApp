import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertTransactionSchema, type InsertTransaction } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Paperclip } from 'lucide-react';

interface QuickEntryFormProps {
  accountId: string;
  type: 'received' | 'paid';
}

export function QuickEntryForm({ accountId, type }: QuickEntryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<Omit<InsertTransaction, 'accountId' | 'kind'>>({
    resolver: zodResolver(insertTransactionSchema.omit({ accountId: true, kind: true })),
    defaultValues: {
      amount: 0,
      note: '',
      dateTime: new Date(),
    },
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (data: Omit<InsertTransaction, 'accountId' | 'kind'>) => {
      const id = crypto.randomUUID();
      const transaction = {
        ...data,
        id,
        accountId,
        kind: type === 'received' ? 'credit' : 'debit',
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
      } as const;
      
      await db.transactions.add(transaction);
      return transaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['account-summary'] });
      toast({
        title: 'Success',
        description: `Transaction ${type} added successfully`,
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: Omit<InsertTransaction, 'accountId' | 'kind'>) => {
    addTransactionMutation.mutate(data);
  };

  const isReceived = type === 'received';

  return (
    <Card>
      <CardHeader>
        <CardTitle className={isReceived ? 'text-green-600' : 'text-red-600'}>
          You {isReceived ? 'Received' : 'Paid'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Amount"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      data-testid={`input-${type}-amount`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Note (optional)"
                      {...field}
                      data-testid={`input-${type}-note`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-2">
              <Button
                type="submit"
                className={`flex-1 ${
                  isReceived 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={addTransactionMutation.isPending}
                data-testid={`button-add-${type}`}
              >
                {addTransactionMutation.isPending ? 'Adding...' : 'Add Entry'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                data-testid={`button-attach-${type}`}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
