import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter, MapPin, Building2, Edit, Trash2, AlertCircle, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import type { Branch } from '@/lib/api';

// CRUD Modals
import { AddBranchModal } from '@/components/modals/AddBranchModal';
import { EditBranchModal } from '@/components/modals/EditBranchModal';
import { ViewBranchModal } from '@/components/modals/ViewBranchModal';
import { DeleteBranchModal } from '@/components/modals/DeleteBranchModal';

function safeLower(v: unknown): string {
  return typeof v === 'string' ? v.toLowerCase() : '';
}
function formatDateSafe(input: unknown) {
  if (!input) return '—';
  const d = new Date(input as any);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export function Branches() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user } = useAuthStore();

  // ✅ Derive businessId safely without depending on User type having that field
  const businessId: string = (() => {
    const u = (user ?? null) as unknown as Record<string, any> | null;
    return (u?.businessId as string) ?? (u?.business?.id as string) ?? 'default-business';
  })();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  // Fetch branches via React Query
  const {
    data: branches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Branch[], Error>({
    queryKey: ['branches', businessId],
    queryFn: () => api.getBranches(businessId),
  });

  // ✅ Defensive filtering (no direct access to Branch.city if type doesn't have it)
  const filteredBranches = useMemo(() => {
    const term = safeLower(searchTerm.trim());
    if (!term) return branches;

    return branches.filter((b) =>
      [
        b.name,                 // always exists on Branch
        (b as any)?.address,    // optional field
        (b as any)?.city,       // optional field (prevents TS2339)
      ].some((v) => safeLower(v).includes(term))
    );
  }, [branches, searchTerm]);

  const getStatusVariant = (isActive: boolean) => (isActive ? 'default' : 'destructive');
  const getStatusText = (isActive: boolean) => (isActive ? 'Active' : 'Inactive');

  // Modal handlers
  const handleAddBranch = () => setIsAddModalOpen(true);
  const handleEditBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsEditModalOpen(true);
  };
  const handleViewBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsViewModalOpen(true);
  };
  const handleDeleteBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDeleteModalOpen(true);
  };
  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedBranch(null);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-lime-400 flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              Branches
            </h1>
            <p className="text-gray-300 mt-1">Manage your business branches and locations</p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleAddBranch} className="bg-lime-500 hover:bg-lime-600 text-black font-semibold gap-2 shadow-lg hover:shadow-lime-500/25 transition-all duration-200">
              <Plus className="h-4 w-4" />
              Add Branch
            </Button>
          </motion.div>
        </motion.div>

        {/* Search / Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gray-900 border-gray-700 rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search branches by name, address, or city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-500 focus:ring-lime-500"
                  />
                </div>
                <Button
                  variant="outline"
                  className="gap-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  onClick={() => toast({ title: 'Filters', description: 'Advanced filters coming soon.' })}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500" />
          </motion.div>
        )}

        {/* Error */}
        {isError && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="bg-gray-900 border-red-700 rounded-2xl">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
                <h3 className="text-lg font-medium mb-2 text-white">Error Loading Branches</h3>
                <p className="mb-4 text-gray-300">{error?.message || 'Failed to load branches. Please try again.'}</p>
                <Button onClick={() => refetch()} className="gap-2 bg-lime-500 hover:bg-lime-600 text-black font-semibold">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Desktop table */}
        {!isLoading && !isError && (
          <div className="hidden md:block">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-gray-900 border-gray-700 rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-lime-400">Branch Directory</CardTitle>
                  <CardDescription className="text-gray-400">{filteredBranches.length} branches found</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-xl border border-gray-700 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 p-4 bg-gray-800 border-b border-gray-700 text-sm font-medium text-gray-300">
                      <div className="col-span-3">Branch Name</div>
                      <div className="col-span-3">Address</div>
                      <div className="col-span-2">Contact</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2">Actions</div>
                    </div>

                    <AnimatePresence>
                      {filteredBranches.map((branch, index) => (
                        <motion.div
                          key={branch.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="grid grid-cols-12 gap-4 p-4 border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="col-span-3 font-medium text-white flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-lime-400" />
                            {branch.name}
                          </div>
                          <div className="col-span-3 text-gray-300">
                            {(branch as any)?.address || 'No address provided'}
                          </div>
                          <div className="col-span-2 text-gray-300">
                            {(branch as any)?.phone || (branch as any)?.email || 'No contact info'}
                          </div>
                          <div className="col-span-2">
                            <Badge
                              variant={getStatusVariant((branch as any)?.isActive ?? true)}
                              className={
                                ((branch as any)?.isActive ?? true)
                                  ? 'bg-green-900 text-green-100 border-green-700'
                                  : 'bg-red-900 text-red-100 border-red-700'
                              }
                            >
                              {getStatusText((branch as any)?.isActive ?? true)}
                            </Badge>
                          </div>
                          <div className="col-span-2 flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewBranch(branch)}
                              className="hover:bg-gray-700 text-gray-300 hover:text-white"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditBranch(branch)}
                              className="hover:bg-gray-700 text-gray-300 hover:text-white"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteBranch(branch)}
                              className="hover:bg-red-800 text-gray-300 hover:text-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {filteredBranches.length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 text-center text-gray-400">
                        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-lg font-medium mb-2 text-white">No branches found</h3>
                        <p className="mb-4">Try adjusting your search or create a new branch.</p>
                        <Button onClick={handleAddBranch} className="gap-2 bg-lime-500 hover:bg-lime-600 text-black font-semibold">
                          <Plus className="h-4 w-4" />
                          Add Branch
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Mobile cards */}
        {!isLoading && !isError && (
          <div className="md:hidden space-y-4">
            <AnimatePresence>
              {filteredBranches.map((branch, index) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-900 border-gray-700 rounded-2xl">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                          <MapPin className="h-5 w-5 text-lime-400" />
                          {branch.name}
                        </CardTitle>
                        <Badge
                          variant={getStatusVariant((branch as any)?.isActive ?? true)}
                          className={
                            ((branch as any)?.isActive ?? true)
                              ? 'bg-green-900 text-green-100 border-green-700'
                              : 'bg-red-900 text-red-100 border-red-700'
                          }
                        >
                          {getStatusText((branch as any)?.isActive ?? true)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Address</span>
                          <span className="font-medium text-white text-right">
                            {(branch as any)?.address || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Phone</span>
                          <span className="text-gray-300">
                            {(branch as any)?.phone || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Email</span>
                          <span className="text-gray-300">
                            {(branch as any)?.email || 'Not provided'}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-gray-400">Created</span>
                          <span className="text-gray-300">
                            {formatDateSafe((branch as any)?.createdAt)}
                          </span>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewBranch(branch)}
                            className="hover:bg-gray-700 text-gray-300 hover:text-white"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditBranch(branch)}
                            className="hover:bg-gray-700 text-gray-300 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBranch(branch)}
                            className="hover:bg-red-800 text-gray-300 hover:text-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Developed by Ismail Mohamed - +251927802065</p>
        </footer>
      </div>

      {/* Modals */}
      <AddBranchModal isOpen={isAddModalOpen} onClose={handleModalClose} businessId={businessId} />
      {selectedBranch && (
        <>
          <EditBranchModal isOpen={isEditModalOpen} onClose={handleModalClose} branch={selectedBranch} businessId={businessId} />
          <ViewBranchModal isOpen={isViewModalOpen} onClose={handleModalClose} branch={selectedBranch} />
          <DeleteBranchModal isOpen={isDeleteModalOpen} onClose={handleModalClose} branch={selectedBranch} businessId={businessId} />
        </>
      )}
    </div>
  );
}
