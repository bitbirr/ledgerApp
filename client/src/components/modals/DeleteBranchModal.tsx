import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2, Trash2, AlertTriangle, Building2 } from 'lucide-react';
import type { Branch } from '@/lib/api';

interface DeleteBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  branch: Branch | null;
  businessId: string;
}

type DeleteVars = { id: string; name: string };

export function DeleteBranchModal({
  isOpen,
  onClose,
  branch,
  businessId,
}: DeleteBranchModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteBranchMutation = useMutation<unknown, Error, DeleteVars>({
    mutationFn: async ({ id }) => {
      if (!businessId) throw new Error('Missing business id');
      return api.deleteBranch(id, businessId);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['branches', businessId] });
      toast({
        title: 'Success',
        description: `Branch "${vars.name}" has been deleted successfully`,
        className: 'bg-green-900 border-green-700 text-green-100',
      });
      onClose();
    },
    onError: (error: any) => {
      const message =
        error?.message ||
        error?.response?.data?.error ||
        'Failed to delete branch';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
        className: 'bg-red-900 border-red-700 text-red-100',
      });
    },
  });

  const isDeleting = deleteBranchMutation.isPending;

  const handleDelete = () => {
    if (!branch) return;
    deleteBranchMutation.mutate({ id: branch.id, name: branch.name });
  };

  const handleClose = () => {
    if (isDeleting) {
      toast({ title: 'Please wait…', description: 'Deletion in progress.' });
      return;
    }
    onClose();
  };

  if (!branch) return null;

  // ✅ Safe access to code/branchCode if your API provides it
  const branchCode: string | undefined =
    (branch as any)?.code ?? (branch as any)?.branchCode ?? undefined;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(next) => !next && handleClose()}>
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
                  Delete Branch
                </DialogTitle>
                <DialogDescription className="text-gray-300">
                  This action cannot be undone. This will permanently delete the branch.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                {/* Warning */}
                <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-red-400 font-semibold mb-1">Warning</h4>
                      <p className="text-red-200 text-sm">
                        Deleting this branch will remove all associated data and cannot be recovered.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Branch Info */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{branch.name}</h3>
                      {/* 🔧 Only render if code exists */}
                      {branchCode && (
                        <p className="text-gray-400">Code: {branchCode}</p>
                      )}
                      {(branch as any).address && (
                        <p className="text-gray-400 text-sm">
                          {(branch as any).address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Confirmation */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 text-sm">
                    Are you sure you want to delete{' '}
                    <span className="font-semibold text-white">"{branch.name}"</span>? This action
                    is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isDeleting}
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Branch
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
