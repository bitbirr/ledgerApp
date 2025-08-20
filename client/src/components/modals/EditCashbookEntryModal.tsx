// src/components/modals/EditCashbookEntryModal.tsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import {
  Edit,
  DollarSign,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { api, type CashbookEntry } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useQueryClient } from '@tanstack/react-query';

const cashbookEntrySchema = z.object({
  dateTime: z.string().min(1, 'Date and time is required'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be a positive number'),
  direction: z.enum(['in', 'out'], { required_error: 'Transaction type is required' }),
  note: z.string().optional(),
  // These two are **form-only** helpers; they are NOT part of CashbookEntry
  reference: z.string().optional(),
  category: z.string().optional(),
});

type CashbookEntryFormData = z.infer<typeof cashbookEntrySchema>;

interface EditCashbookEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: CashbookEntry | null;
}

export function EditCashbookEntryModal({ isOpen, onClose, entry }: EditCashbookEntryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // If your auth store doesn't type businessId, this still compiles:
  const { businessId } = useAuthStore() as unknown as { businessId?: string };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CashbookEntryFormData>({
    resolver: zodResolver(cashbookEntrySchema),
    defaultValues: {
      dateTime: '',
      amount: '',
      direction: 'in',
      note: '',
      reference: '',
      category: '',
    },
  });

  const direction = watch('direction');

  // Populate form when entry changes
  useEffect(() => {
    if (entry && isOpen) {
      const dateTimeLocal = new Date(entry.dateTime).toISOString().slice(0, 16);
      reset({
        dateTime: dateTimeLocal,
        amount: entry.amount?.toString() ?? '',
        direction: entry.direction as 'in' | 'out',
        note: entry.note ?? '',
        // These are not on CashbookEntry; keep as form-only fields
        reference: '',
        category: '',
      });
    }
  }, [entry, isOpen, reset]);

  const onSubmit = async (data: CashbookEntryFormData) => {
    if (!businessId || !entry) {
      toast({
        title: 'Error',
        description: 'Business ID and entry are required',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Send ONLY fields that exist on CashbookEntry (amount is a string)
      const payload: Partial<Omit<CashbookEntry, 'id' | 'businessId'>> = {
        dateTime: new Date(data.dateTime).toISOString(),
        amount: data.amount.trim(), // string per API type
        direction: data.direction,  // 'in' | 'out'
        note: data.note?.trim() || undefined,
      };

      // api.updateCashbookEntry expects (id, payload, businessId)
      await api.updateCashbookEntry(entry.id, payload, businessId);

      // Invalidate and refetch cashbook entries
      queryClient.invalidateQueries({ queryKey: ['cashbook', businessId] });

      toast({
        title: 'Success',
        description: 'Cashbook entry updated successfully',
      });

      onClose();
    } catch (error) {
      console.error('Failed to update cashbook entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to update cashbook entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  if (!entry) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open={isOpen}
          onOpenChange={(next) => {
            if (!next) handleClose();
          }}
        >
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-bold text-lime-400 flex items-center gap-2">
                  <Edit className="h-6 w-6" />
                  Edit Cashbook Entry
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Update the cashbook entry details
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
                {/* Transaction Type Selection */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <Label className="text-sm font-medium text-gray-200 mb-3 block">
                      Transaction Type *
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          variant={direction === 'in' ? 'default' : 'outline'}
                          className={`w-full h-16 flex flex-col items-center gap-2 ${
                            direction === 'in'
                              ? 'bg-green-600 hover:bg-green-700 text-white border-green-500'
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600'
                          }`}
                          onClick={() => setValue('direction', 'in')}
                        >
                          <TrendingUp className="h-5 w-5" />
                          <span className="text-sm font-medium">Cash In</span>
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          variant={direction === 'out' ? 'default' : 'outline'}
                          className={`w-full h-16 flex flex-col items-center gap-2 ${
                            direction === 'out'
                              ? 'bg-red-600 hover:bg-red-700 text-white border-red-500'
                              : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-600'
                          }`}
                          onClick={() => setValue('direction', 'out')}
                        >
                          <TrendingDown className="h-5 w-5" />
                          <span className="text-sm font-medium">Cash Out</span>
                        </Button>
                      </motion.div>
                    </div>
                    {errors.direction && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.direction.message}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Amount and Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm font-medium text-gray-200 flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Amount *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-lime-500 focus:ring-lime-500"
                      {...register('amount')}
                    />
                    {errors.amount && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.amount.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateTime" className="text-sm font-medium text-gray-200 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Date & Time *
                    </Label>
                    <Input
                      id="dateTime"
                      type="datetime-local"
                      className="bg-gray-800 border-gray-600 text-white focus:border-lime-500 focus:ring-lime-500"
                      {...register('dateTime')}
                    />
                    {errors.dateTime && (
                      <p className="text-red-400 text-sm flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.dateTime.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reference and Category (form-only helpers) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="reference" className="text-sm font-medium text-gray-200">
                      Reference Number
                    </Label>
                    <Input
                      id="reference"
                      placeholder="e.g., REF-001, INV-123"
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-lime-500 focus:ring-lime-500"
                      {...register('reference')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium text-gray-200">
                      Category
                    </Label>
                    <Select onValueChange={(value) => setValue('category', value)}>
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white focus:border-lime-500 focus:ring-lime-500">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="sales" className="text-white hover:bg-gray-700">
                          Sales
                        </SelectItem>
                        <SelectItem value="purchases" className="text-white hover:bg-gray-700">
                          Purchases
                        </SelectItem>
                        <SelectItem value="expenses" className="text-white hover:bg-gray-700">
                          Expenses
                        </SelectItem>
                        <SelectItem value="other" className="text-white hover:bg-gray-700">
                          Other
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="note" className="text-sm font-medium text-gray-200 flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Description
                  </Label>
                  <Textarea
                    id="note"
                    placeholder="Enter transaction description or notes..."
                    rows={3}
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-lime-500 focus:ring-lime-500 resize-none"
                    {...register('note')}
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-lime-500 hover:bg-lime-600 text-black font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-lime-500/25"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="h-4 w-4 mr-2" />
                        Update Entry
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
