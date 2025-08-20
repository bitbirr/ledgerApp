// src/pages/Dashboard.tsx
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db, type Account } from '@/lib/db';
import { useAppStore } from '@/lib/store';

import { AddCustomerModal } from '@/components/modals/AddCustomerModal';
import { EditCustomerModal } from '@/components/modals/EditCustomerModal';
import { ViewCustomerModal } from '@/components/modals/ViewCustomerModal';
import { DeleteCustomerModal } from '@/components/modals/DeleteCustomerModal';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Plus,
  TrendingUp,
  Users,
  Search,
  MoreHorizontal,
  Eye,
  Edit3,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingDown,
  Wallet,
  UserPlus,
} from 'lucide-react';

import { formatCurrency, cn } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/ui/loading';
import { motion } from 'framer-motion';

type NormalizedSummary = {
  totalAdvance: number;
  totalDue: number;
  netBalance: number;
};

type SortField = 'name' | 'balance' | 'createdAt' | 'phone';
type SortDirection = 'asc' | 'desc';

function normalizeSummary(raw: any): NormalizedSummary {
  if (raw && typeof raw === 'object') {
    if ('totalAdvance' in raw && 'totalDue' in raw && 'netBalance' in raw) {
      return {
        totalAdvance: Number(raw.totalAdvance) || 0,
        totalDue: Number(raw.totalDue) || 0,
        netBalance: Number(raw.netBalance) || 0,
      };
    }
    if ('totalCredit' in raw && 'totalDebit' in raw) {
      const net = (Number(raw.totalCredit) || 0) - (Number(raw.totalDebit) || 0);
      return {
        totalAdvance: Math.max(net, 0),
        totalDue: Math.max(-net, 0),
        netBalance: net,
      };
    }
  }
  return { totalAdvance: 0, totalDue: 0, netBalance: 0 };
}

function fmtDate(val: unknown) {
  if (!val) return '—';
  const d = new Date(val as any);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

// EmptyState component
function EmptyState({ onAddCustomer }: { onAddCustomer: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="p-4 bg-gray-700/50 rounded-full mb-4">
        <Users className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No customers found</h3>
      <p className="text-gray-400 mb-6 max-w-sm">
        Get started by adding your first customer to begin managing your business relationships.
      </p>
      <Button
        onClick={onAddCustomer}
        className="bg-lime-500 hover:bg-lime-600 text-black font-medium transition-all duration-200 hover:shadow-lg hover:shadow-lime-500/25"
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Add Your First Customer
      </Button>
    </motion.div>
  );
}

export function Dashboard() {
  const { accounts, setAccounts, setAccountSummary } = useAppStore();

  // Modal states
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showEditCustomer, setShowEditCustomer] = useState(false);
  const [showViewCustomer, setShowViewCustomer] = useState(false);
  const [showDeleteCustomer, setShowDeleteCustomer] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Account | null>(null);

  // Table states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterType, setFilterType] = useState<'all' | 'customer' | 'supplier'>('all');

  // Fetch accounts via facade (REST/Dexie-backed)
  const { data: accountsData, isLoading: accountsLoading } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const all = await db.accounts.toArray();
      return all.filter((a: Account) => a.archived !== true);
    },
  });

  // Fetch summary (can return either shape; normalize below)
  const { data: rawSummary, isLoading: summaryLoading } = useQuery<any>({
    queryKey: ['account-summary'],
    queryFn: () => db.getAccountSummary(),
    staleTime: 30_000,
  });

  const summaryData = useMemo<NormalizedSummary>(() => normalizeSummary(rawSummary), [rawSummary]);

  // Keep store in sync
  useEffect(() => {
    if (accountsData) setAccounts(accountsData);
  }, [accountsData, setAccounts]);

  useEffect(() => {
    if (summaryData) setAccountSummary(summaryData);
  }, [summaryData, setAccountSummary]);

  // Batch fetch balances once
  const accountIds = useMemo(() => (accountsData ?? []).map((a) => a.id), [accountsData]);
  const { data: balances, isLoading: balancesLoading } = useQuery<Record<string, number>>({
    queryKey: ['account-balances', accountIds],
    enabled: accountIds.length > 0,
    staleTime: 30_000,
    queryFn: async () => {
      if ('getAccountBalancesMap' in db && typeof (db as any).getAccountBalancesMap === 'function') {
        return (db as any).getAccountBalancesMap(accountIds) as Promise<Record<string, number>>;
      }
      const vals = await Promise.all(accountIds.map((id) => db.getAccountBalance(id)));
      return Object.fromEntries(accountIds.map((id, i) => [id, vals[i] ?? 0]));
    },
  });

  // Filter + sort
  const filteredAndSortedCustomers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    let filtered = accounts.filter((account) => {
      const matchesSearch =
        account.name.toLowerCase().includes(term) ||
        (!!account.phone && account.phone.toLowerCase().includes(term));
      const matchesFilter = filterType === 'all' || account.type === filterType;
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'balance':
          aValue = balances?.[a.id] ?? 0;
          bValue = balances?.[b.id] ?? 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0).getTime();
          bValue = new Date(b.createdAt || 0).getTime();
          break;
        case 'phone':
          aValue = (a.phone || '').toLowerCase();
          bValue = (b.phone || '').toLowerCase();
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [accounts, searchTerm, filterType, sortField, sortDirection, balances]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCustomers.length / itemsPerPage));
  const paginatedCustomers = filteredAndSortedCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    setCurrentPage(1);
    if (sortField === field) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCustomerAction = (action: 'view' | 'edit' | 'delete', customer: Account) => {
    setSelectedCustomer(customer);
    if (action === 'view') setShowViewCustomer(true);
    if (action === 'edit') setShowEditCustomer(true);
    if (action === 'delete') setShowDeleteCustomer(true);
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0]!)
      .join('')
      .toUpperCase();

  const isLoading = accountsLoading || summaryLoading || balancesLoading;

  // Skeleton while loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  // KPIs
  const totalRevenue = summaryData.totalAdvance;
  const totalExpenses = summaryData.totalDue;
  const profit = summaryData.netBalance;
  const cashBalance = profit; // Simplified

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-lime-500/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Revenue</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">Total advances</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-lime-500/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Expenses</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(totalExpenses)}</p>
                  <p className="text-xs text-gray-500 mt-1">Total dues</p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-full">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-lime-500/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Profit</p>
                  <p className={`text-2xl font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(profit)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Net balance</p>
                </div>
                <div className={`p-3 rounded-full ${profit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <DollarSign className={`h-6 w-6 ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-lime-500/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Cash Balance</p>
                  <p className="text-2xl font-bold text-lime-400">{formatCurrency(cashBalance)}</p>
                  <p className="text-xs text-gray-500 mt-1">Available funds</p>
                </div>
                <div className="p-3 bg-lime-500/20 rounded-full">
                  <Wallet className="h-6 w-6 text-lime-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Customer Management */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-lime-500/20 rounded-lg">
                  <Users className="h-6 w-6 text-lime-400" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-white">Customer Management</CardTitle>
                  <p className="text-gray-400 text-sm">{filteredAndSortedCustomers.length} customers found</p>
                </div>
              </div>
              <Button
                onClick={() => setShowAddCustomer(true)}
                className="bg-lime-500 hover:bg-lime-600 text-black font-medium transition-all duration-200 hover:shadow-lg hover:shadow-lime-500/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-lime-400 focus:ring-lime-400"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterType('all');
                    setCurrentPage(1);
                  }}
                  className={
                    filterType === 'all'
                      ? 'bg-lime-500 text-black hover:bg-lime-600'
                      : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700'
                  }
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'customer' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterType('customer');
                    setCurrentPage(1);
                  }}
                  className={
                    filterType === 'customer'
                      ? 'bg-lime-500 text-black hover:bg-lime-600'
                      : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700'
                  }
                >
                  Customers
                </Button>
                <Button
                  variant={filterType === 'supplier' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilterType('supplier');
                    setCurrentPage(1);
                  }}
                  className={
                    filterType === 'supplier'
                      ? 'bg-lime-500 text-black hover:bg-lime-600'
                      : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700'
                  }
                >
                  Suppliers
                </Button>
              </div>
            </div>

            {/* Table */}
            {filteredAndSortedCustomers.length === 0 ? (
              <EmptyState onAddCustomer={() => setShowAddCustomer(true)} />
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-700/50 hover:bg-gray-700/50">
                        <TableHead className="text-gray-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('name')}
                            className="h-auto p-0 font-medium text-gray-300 hover:text-white"
                          >
                            Name
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-gray-300">Contact</TableHead>
                        <TableHead className="text-gray-300">Type</TableHead>
                        <TableHead className="text-gray-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('balance')}
                            className="h-auto p-0 font-medium text-gray-300 hover:text-white"
                          >
                            Balance
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-gray-300">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSort('createdAt')}
                            className="h-auto p-0 font-medium text-gray-300 hover:text-white"
                          >
                            Created
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-gray-300 w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCustomers.map((customer, index) => {
                        const balance = balances?.[customer.id] ?? 0;
                        return (
                          <motion.tr
                            key={customer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-gray-700 hover:bg-gray-700/30 transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {customer.photoUrl ? (
                                    <AvatarImage src={customer.photoUrl} alt={customer.name} />
                                  ) : null}
                                  <AvatarFallback className="bg-lime-500/20 text-lime-400 text-xs">
                                    {getInitials(customer.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-white">{customer.name}</p>
                                  <p className="text-sm text-gray-400">ID: {customer.id.slice(0, 8)}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="text-white">{customer.phone || 'No phone'}</p>
                                <p className="text-gray-400">Contact info</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  'capitalize',
                                  customer.type === 'customer'
                                    ? 'border-green-500/50 text-green-400 bg-green-500/10'
                                    : customer.type === 'supplier'
                                    ? 'border-blue-500/50 text-blue-400 bg-blue-500/10'
                                    : 'border-gray-500/50 text-gray-400 bg-gray-500/10'
                                )}
                              >
                                {customer.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className={cn('font-medium', balance >= 0 ? 'text-green-400' : 'text-red-400')}>
                                  {formatCurrency(balance)}
                                </p>
                                <p className="text-gray-400">{balance >= 0 ? 'Credit' : 'Debit'}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm text-gray-400">{fmtDate(customer.createdAt)}</p>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                  <DropdownMenuItem
                                    onClick={() => handleCustomerAction('view', customer)}
                                    className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleCustomerAction('edit', customer)}
                                    className="text-gray-300 hover:text-white hover:bg-gray-700 cursor-pointer"
                                  >
                                    <Edit3 className="mr-2 h-4 w-4" />
                                    Edit Customer
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleCustomerAction('delete', customer)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Customer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, filteredAndSortedCustomers.length)} of{' '}
                      {filteredAndSortedCustomers.length} customers
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              className={
                                currentPage === pageNum
                                  ? 'bg-lime-500 text-black hover:bg-lime-600'
                                  : 'bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700'
                              }
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Modals (use onClose, not onOpenChange) */}
      <AddCustomerModal open={showAddCustomer} onClose={() => setShowAddCustomer(false)} />

      {selectedCustomer && (
        <>
          <EditCustomerModal
            open={showEditCustomer}
            onClose={() => setShowEditCustomer(false)}
            customer={selectedCustomer}
          />

          <ViewCustomerModal
            open={showViewCustomer}
            onClose={() => setShowViewCustomer(false)}
            customer={selectedCustomer}
          />

          <DeleteCustomerModal
            open={showDeleteCustomer}
            onClose={() => setShowDeleteCustomer(false)}
            customer={selectedCustomer}
          />
        </>
      )}
    </div>
  );
}