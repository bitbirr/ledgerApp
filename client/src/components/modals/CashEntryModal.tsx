import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus, X } from 'lucide-react';

const cashEntrySchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  note: z.string().optional(),
});

type CashEntryForm = z.infer<typeof cashEntrySchema>;

interface CashEntryModalProps {
  open: boolean;
  onClose: () => void;
  type: 'in' | 'out';
  onSubmit: (amount: number, note: string) => Promise<void>;
}

export function CashEntryModal({ open, onClose, type, onSubmit }: CashEntryModalProps) {
  const { toast } = useToast();
  const isIn = type === 'in';

  const form = useForm<CashEntryForm>({
    resolver: zodResolver(cashEntrySchema),
    defaultValues: {
      amount: 0,
      note: '',
    },
  });

  const handleSubmit = async (data: CashEntryForm) => {
    try {
      await onSubmit(data.amount, data.note || '');
      form.reset();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to add cash ${type} entry`,
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className={isIn ? 'text-green-600' : 'text-red-600'}>
              <div className="flex items-center">
                {isIn ? <Plus className="mr-2 h-5 w-5" /> : <Minus className="mr-2 h-5 w-5" />}
                Cash {isIn ? 'In' : 'Out'}
              </div>
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              data-testid="button-close-cash-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>
            Add a cash {isIn ? 'in' : 'out'} entry to your cash book.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      data-testid={`input-cash-${type}-amount`}
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
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a note for this transaction"
                      {...field}
                      data-testid={`input-cash-${type}-note`}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
                data-testid="button-cancel-cash-entry"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className={`flex-1 ${
                  isIn 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                } text-white`}
                data-testid={`button-submit-cash-${type}`}
              >
                Add Cash {isIn ? 'In' : 'Out'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}