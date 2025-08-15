import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertTransactionSchema, type Transaction, type InsertTransaction } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { convertFileToBase64, compressImage, validateImageFile } from '@/lib/photo-utils';
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Paperclip, Camera, Upload, X, Eye } from 'lucide-react';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export function EditTransactionModal({ transaction, open, onClose }: EditTransactionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const form = useForm<Omit<InsertTransaction, 'accountId'>>({
    resolver: zodResolver(insertTransactionSchema.omit({ accountId: true })),
    defaultValues: {
      amount: 0,
      note: '',
      kind: 'credit',
      dateTime: new Date(),
      imageUrl: undefined,
    },
  });

  // Update form when transaction changes
  useEffect(() => {
    if (transaction) {
      form.reset({
        amount: transaction.amount,
        note: transaction.note || '',
        kind: transaction.kind,
        dateTime: new Date(transaction.dateTime),
        imageUrl: transaction.imageUrl,
      });
      setAttachedImage(transaction.imageUrl || null);
    }
  }, [transaction, form]);

  const updateTransactionMutation = useMutation({
    mutationFn: async (data: Omit<InsertTransaction, 'accountId'>) => {
      if (!transaction) throw new Error('No transaction to update');
      
      const updatedTransaction = {
        ...data,
        imageUrl: attachedImage || undefined,
        id: transaction.id,
        accountId: transaction.accountId,
      };
      
      await db.transactions.update(transaction.id, updatedTransaction);
      return updatedTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['account-balance'] });
      toast({
        title: 'Success',
        description: 'Transaction updated successfully',
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update transaction',
        variant: 'destructive',
      });
    },
  });

  const handleClose = () => {
    form.reset();
    setAttachedImage(null);
    onClose();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      toast({
        title: 'Invalid File',
        description: 'Please select a valid image file (JPEG, PNG, WebP) under 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingImage(true);
    try {
      // compressImage already returns base64 string, no need for convertFileToBase64
      const base64 = await compressImage(file);
      setAttachedImage(base64);
      toast({
        title: 'Image Attached',
        description: 'Receipt/bill has been attached successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process image',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const removeAttachedImage = () => {
    setAttachedImage(null);
    toast({
      title: 'Image Removed',
      description: 'Attached image has been removed',
    });
  };

  const onSubmit = (data: Omit<InsertTransaction, 'accountId'>) => {
    updateTransactionMutation.mutate(data);
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>
            Update the transaction details below.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="kind"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transaction type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="credit">Received (Credit)</SelectItem>
                      <SelectItem value="debit">Paid (Debit)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    <Textarea
                      placeholder="Enter a note for this transaction"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time *</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().slice(0, 16) : ''}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachment Section */}
            <div className="space-y-2">
              <FormLabel>Receipt/Bill (Optional)</FormLabel>
              
              {attachedImage ? (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Image attached</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowImagePreview(true)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeAttachedImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={isProcessingImage}
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach Receipt/Bill
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Attach Receipt/Bill</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                      <Button
                        variant="outline"
                        className="h-20 flex-col"
                        onClick={handleCameraCapture}
                        disabled={isProcessingImage}
                      >
                        <Camera className="h-6 w-6 mb-2" />
                        Take Photo
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex-col"
                        onClick={handleFileUpload}
                        disabled={isProcessingImage}
                      >
                        <Upload className="h-6 w-6 mb-2" />
                        Upload File
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {isProcessingImage && (
                <div className="text-center text-sm text-muted-foreground">
                  Processing image...
                </div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={updateTransactionMutation.isPending}
              >
                {updateTransactionMutation.isPending ? 'Updating...' : 'Update Transaction'}
              </Button>
            </div>
          </form>
        </Form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Image Preview Dialog */}
        <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Attached Receipt/Bill</DialogTitle>
            </DialogHeader>
            {attachedImage && (
              <div className="flex justify-center">
                <img
                  src={attachedImage}
                  alt="Attached receipt"
                  className="max-w-full max-h-96 object-contain rounded-md"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}