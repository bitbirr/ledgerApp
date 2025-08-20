import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Trash2,
  AlertTriangle,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, type CashbookEntry } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { useQueryClient } from '@tanstack/react-query';

interface DeleteCashbookEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: CashbookEntry | null;
}

export function DeleteCashbookEntryModal({ isOpen, onClose, entry }: DeleteCashbookEntryModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { businessId } = useAuthStore();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!businessId || !entry) {
      toast({
        title: 'Error',
        description: 'Business ID and entry are required',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      await api.deleteCashbookEntry(entry.id, businessId);

      // Invalidate and refetch cashbook entries
      queryClient.invalidateQueries({ queryKey: ['cashbook', businessId] });

      toast({
        title: 'Success',
        description: 'Cashbook entry deleted successfully',
      });

      onClose();
    } catch (error) {
      console.error('Failed to delete cashbook entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete cashbook entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  if (!entry) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: string | number) => {
    return `ETB ${Number(amount).toLocaleString()}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-2xl font-bold text-red-400 flex items-center gap-2">
                  <Trash2 className="h-6 w-6" />
                  Delete Cashbook Entry
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  This action cannot be undone. The entry will be permanently removed.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Warning */}
                <Card className="bg-red-900/20 border-red-700">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-8 w-8 text-red-400 flex-shrink-0" />
                      <div>
                        <h3 className="text-lg font-semibold text-red-400">Warning</h3>
                        <p className="text-red-200 text-sm">
                          This will permanently delete the cashbook entry and cannot be recovered.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Entry Summary */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-gray-400 mb-3">Entry to be deleted:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {entry.direction === 'in' ? (
                            <TrendingUp className="h-4 w-4 text-green-400" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-400" />
                          )}
                          <span className="text-white font-medium">
                            {entry.direction === 'in' ? 'Cash In' : 'Cash Out'}
                          </span>
                        </div>
                        <Badge
                          variant={entry.direction === 'in' ? 'default' : 'destructive'}
                          className={entry.direction === 'in'
                            ? 'bg-green-900 text-green-100 border-green-700'
                            : 'bg-red-900 text-red-100 border-red-700'
                          }
                        >
                          {formatAmount(entry.amount)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(entry.dateTime)}
                      </div>
                      
                      {entry.note && (
                        <div className="text-sm text-gray-300 bg-gray-900 p-2 rounded">
                          {entry.note}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Entry
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}