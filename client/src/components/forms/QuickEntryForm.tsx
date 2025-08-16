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
    <Card className="financial-card">
      <CardHeader>
        <CardTitle className={`heading-financial ${
          isReceived ? 'text-profit' : 'text-loss'
        }`}>
          You {isReceived ? 'Received' : 'Paid'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="form-enhanced financial-form"
          >
            <div className="form-section">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="form-field-enhanced">
                    <FormControl className="form-label required">Amount</FormControl>
                    <div className="amount-field">
                      <span className="currency-symbol">₹</span>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="form-input amount-input"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          data-testid={`input-${type}-amount`}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="form-message error" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem className="form-field-enhanced">
                    <FormControl className="form-label">Note</FormControl>
                    <FormControl>
                      <Input
                        placeholder="Add a note (optional)"
                        className="form-input"
                        {...field}
                        data-testid={`input-${type}-note`}
                      />
                    </FormControl>
                    <FormMessage className="form-message error" />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Attachment Preview */}
            {attachedImage && (
              <div className="form-section">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-dashed">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Image attached</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
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
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={removeAttachedImage}
                    data-testid={`button-remove-image-${type}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="form-actions">
              <Button
                type="submit"
                className={`btn-primary ${
                  isReceived ? 'bg-profit hover:bg-profit/90' : 'bg-loss hover:bg-loss/90'
                }`}
                disabled={addTransactionMutation.isPending}
                data-testid={`button-add-${type}`}
              >
                {addTransactionMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  'Add Entry'
                )}
              </Button>

              {/* Attachment Options */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="btn-secondary"
                    disabled={isProcessingImage}
                    data-testid={`button-attach-${type}`}
                  >
                    {isProcessingImage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="dialog-form">
                  <DialogHeader>
                    <DialogTitle>Attach Receipt</DialogTitle>
                  </DialogHeader>
                  <div className="form-section">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex flex-col items-center gap-2 h-20"
                        onClick={handleCameraCapture}
                        data-testid={`button-camera-${type}`}
                      >
                        <Camera className="h-5 w-5" />
                        <span className="text-xs">Camera</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="flex flex-col items-center gap-2 h-20"
                        onClick={handleFileUpload}
                        data-testid={`button-upload-${type}`}
                      >
                        <Upload className="h-5 w-5" />
                        <span className="text-xs">Upload</span>
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  {/* Image Preview Dialog */}
  <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Attached Receipt/Bill</DialogTitle>
      </DialogHeader>
      {attachedImage && (
        <div className="flex justify-center">
          <img
            src={attachedImage || undefined}
            alt="Attached receipt"
            className="max-w-full max-h-96 object-contain rounded-md"
          />
        </div>
      )}
    </DialogContent>
  </Dialog>
}