import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { convertFileToBase64, compressImage, validateImageFile } from '@/lib/photo-utils';
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
import { Plus, Minus, X, Camera, Upload, Eye, Paperclip } from 'lucide-react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, SelectLabel } from '@/components/ui/select';

const cashEntrySchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  note: z.string().optional(),
  cashAccountId: z.string().min(1, 'Select cash/bank account'),
  offsetAccountId: z.string().min(1, 'Select offset account'),
  partyId: z.string().optional(),
});

type CashEntryForm = z.infer<typeof cashEntrySchema>;

interface CashEntryModalProps {
  open: boolean;
  onClose: () => void;
  type: 'in' | 'out';
  onSubmit: (amount: number, note: string, attachmentUrl: string | undefined, cashAccountId: string, offsetAccountId: string, partyId?: string) => Promise<void>;
}

export function CashEntryModal({ open, onClose, type, onSubmit }: CashEntryModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [glAccounts, setGlAccounts] = useState<Array<{ id: string; code: string; name: string; type: string }>>([]);
  const isIn = type === 'in';

  const form = useForm<CashEntryForm>({
    resolver: zodResolver(cashEntrySchema),
    defaultValues: {
      amount: 0,
      note: '',
      cashAccountId: '',
      offsetAccountId: '',
      partyId: '',
    },
  });

  useEffect(() => {
    const ensureGLAccounts = async () => {
      try {
        // Try to fetch GL accounts for current business
        let res = await fetch('/api/gl/accounts', {
          headers: {
            'Content-Type': 'application/json',
            'business-id': 'default-business',
          }
        });
        if (!res.ok) return;
        let list = await res.json();
        // If empty, try bootstrap then refetch
        if (Array.isArray(list) && list.length === 0) {
          const boot = await fetch('/api/bootstrap', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'business-id': 'default-business',
            }
          });
          if (boot.ok) {
            res = await fetch('/api/gl/accounts', {
              headers: {
                'Content-Type': 'application/json',
                'business-id': 'default-business',
              }
            });
            if (res.ok) {
              list = await res.json();
            }
          }
        }
        if (Array.isArray(list)) {
          setGlAccounts(list);
        }
      } catch (e) {
        // ignore for offline; user can still enter but posting will require network/GL
      }
    };
    if (open) ensureGLAccounts();
  }, [open]);

  const handleSubmit = async (data: CashEntryForm) => {
    try {
      await onSubmit(
        data.amount,
        data.note || '',
        attachedImage || undefined,
        data.cashAccountId,
        data.offsetAccountId,
        data.partyId || undefined
      );
      form.reset();
      setAttachedImage(null);
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
    setAttachedImage(null);
    onClose();
  };

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
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process image',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
            Add a cash {isIn ? 'in' : 'out'} entry to your cash book with optional receipt attachment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Cash/Bank Account */}
            <FormField
              control={form.control}
              name="cashAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cash/Bank Account *</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cash/bank account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectLabel>Accounts</SelectLabel>
                        {glAccounts
                          .filter(a => a.type === 'asset') // simple heuristic
                          .map(acc => (
                            <SelectItem key={acc.id} value={acc.id}>{`${acc.code} - ${acc.name}`}</SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Offset Account */}
            <FormField
              control={form.control}
              name="offsetAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offset Account *</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select offset account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectLabel>Accounts</SelectLabel>
                        {glAccounts.map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>{`${acc.code} - ${acc.name}`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
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
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCameraCapture}
                    disabled={isProcessingImage}
                    className="flex items-center justify-center space-x-1"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Camera</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFileUpload}
                    disabled={isProcessingImage}
                    className="flex items-center justify-center space-x-1"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </Button>
                </div>
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