// src/components/modals/ViewCashbookEntryModal.tsx

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
  Eye,
  DollarSign,
  Calendar,
  FileText,
  Hash,
  Tag,
  TrendingUp,
  TrendingDown,
  Clock,
} from 'lucide-react';
import type { CashbookEntry } from '@/lib/api';

interface ViewCashbookEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: CashbookEntry | null;
}

export function ViewCashbookEntryModal({ isOpen, onClose, entry }: ViewCashbookEntryModalProps) {
  if (!entry) return null;

  const formatDate = (dateLike: string | number | Date) => {
    const d = new Date(dateLike);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: string | number) => {
    const n = typeof amount === 'number' ? amount : Number(amount);
    return `ETB ${Number.isFinite(n) ? n.toLocaleString() : '0'}`;
  };

  // Optional fields that may exist in your backend but aren't typed on CashbookEntry
  const reference: string | undefined = (entry as any)?.reference;
  const category: string | undefined = (entry as any)?.category;
  const createdAt: string | undefined = (entry as any)?.createdAt;
  const updatedAt: string | undefined = (entry as any)?.updatedAt;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open={isOpen}
          onOpenChange={(next) => {
            if (!next) onClose();
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
                  <Eye className="h-6 w-6" />
                  Cashbook Entry Details
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  Complete information about this transaction
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                {/* Transaction Type and Amount */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {entry.direction === 'in' ? (
                          <TrendingUp className="h-8 w-8 text-green-400" />
                        ) : (
                          <TrendingDown className="h-8 w-8 text-red-400" />
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {entry.direction === 'in' ? 'Cash In' : 'Cash Out'}
                          </h3>
                          <p className="text-gray-400">Transaction Type</p>
                        </div>
                      </div>
                      <Badge
                        variant={entry.direction === 'in' ? 'default' : 'destructive'}
                        className={`text-lg px-4 py-2 ${
                          entry.direction === 'in'
                            ? 'bg-green-900 text-green-100 border-green-700'
                            : 'bg-red-900 text-red-100 border-red-700'
                        }`}
                      >
                        {formatAmount(entry.amount)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Transaction Details */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Transaction Details
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Date & Time
                          </label>
                          <p className="text-white font-medium">{formatDate(entry.dateTime)}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Amount
                          </label>
                          <p
                            className={`font-bold text-lg ${
                              entry.direction === 'in' ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {formatAmount(entry.amount)}
                          </p>
                        </div>
                      </div>

                      {reference && (
                        <div>
                          <label className="text-sm text-gray-400 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            Reference Number
                          </label>
                          <p className="text-white font-medium">{reference}</p>
                        </div>
                      )}

                      {category && (
                        <div>
                          <label className="text-sm text-gray-400 flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            Category
                          </label>
                          <Badge
                            variant="outline"
                            className="bg-gray-700 text-gray-200 border-gray-600"
                          >
                            {category}
                          </Badge>
                        </div>
                      )}

                      {entry.note && (
                        <div>
                          <label className="text-sm text-gray-400 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            Description
                          </label>
                          <p className="text-white bg-gray-900 p-3 rounded-lg">{entry.note}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Timestamps */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <h4 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Timeline
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400">Created</label>
                          <p className="text-white font-medium">
                            {formatDate(createdAt ?? entry.dateTime)}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Last Updated</label>
                          <p className="text-white font-medium">
                            {formatDate(updatedAt ?? entry.dateTime)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-6 border-t border-gray-700">
                <Button
                  onClick={onClose}
                  className="bg-lime-500 hover:bg-lime-600 text-black font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-lime-500/25"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
