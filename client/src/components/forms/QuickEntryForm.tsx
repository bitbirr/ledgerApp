import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertTransactionSchema, type InsertTransaction } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useToast } from '@/hooks/use-toast';
import { compressImage, validateImageFile } from '@/lib/photo-utils';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Paperclip, Camera, Upload, X, Eye } from 'lucide-react';

interface QuickEntryFormProps {
  accountId: string;
  type: 'received' | 'paid';
}

export function QuickEntryForm({ accountId, type }: QuickEntryFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Form omits fields we auto-set (accountId, kind come from props)
  type FormValues = Omit<InsertTransaction, 'accountId' | 'kind'>;

  const form = useForm<FormValues>({
    resolver: zodResolver(insertTransactionSchema.omit({ accountId: true, kind: true })),
    defaultValues: {
      amount: 0,
      note: '',
      dateTime: new Date(),
      imageUrl: undefined,
      // dueDate: undefined, // add if your schema has it
    },
  });

  // db.transactions.add() in your shim returns created id (string)
  const addTransactionMutation = useMutation<string, Error, FormValues>({
    mutationFn: async (data: FormValues) => {
      // IMPORTANT: pass only what the adapter expects.
      // It will inject businessId/userId/createdAt/updatedAt and convert dateTime.
      return db.transactions.add({
        accountId,
        kind: type === 'received' ? 'credit' : 'debit',
        amount: data.amount,
        note: data.note || undefined,
        dateTime: data.dateTime,
        imageUrl: attachedImage ?? undefined,
        // businessId will be injected by adapter
        // userId will be injected by adapter
        // dueDate: data.dueDate, // include if present in your schema
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['account-summary'] });
      toast({
        title: 'Success',
        description: `Transaction ${type} added successfully`,
      });
      form.reset();
      setAttachedImage(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add transaction',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: 'Invalid File',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingImage(true);
    try {
      const compressedImage = await compressImage(file);
      setAttachedImage(compressedImage);
      toast({
        title: 'Success',
        description: 'Image attached successfully',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to process image',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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

  const onSubmit = (data: FormValues) => {
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
                      step="0.01"
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

            {/* Image Attachment Preview */}
            {attachedImage && (
              <div className="relative">
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Image attached</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowImagePreview(true)}
                      data-testid={`button-preview-${type}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeAttachedImage}
                    data-testid={`button-remove-image-${type}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                type="submit"
                className={`flex-1 ${
                  isReceived ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
                disabled={addTransactionMutation.isPending}
                data-testid={`button-add-${type}`}
              >
                {addTransactionMutation.isPending ? 'Adding...' : 'Add Entry'}
              </Button>

              {/* Attachment Options */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isProcessingImage}
                    data-testid={`button-attach-${type}`}
                  >
                    <Paperclip className="h-4 w-4" />
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
                      Upload Image
                    </Button>
                  </div>
                  {isProcessingImage && (
                    <div className="text-center text-sm text-muted-foreground">
                      Processing image...
                    </div>
                  )}
                </DialogContent>
              </Dialog>
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
      </CardContent>
    </Card>
  );
}