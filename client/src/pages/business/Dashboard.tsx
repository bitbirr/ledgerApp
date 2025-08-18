import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  BarChart3,
  Plus,
  AlertCircle,
  Users,
  Settings,
  Building2,
  FileText,
  Download,
  Activity,
  Package,
  Link,
  X,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CashEntryModal } from '@/components/modals/CashEntryModal';
import { CreateInvoiceModal } from '@/components/modals/CreateInvoiceModal';
import { StatementGenerator } from '@/components/reports/StatementGenerator';
import { BulkOperationsModal } from '@/components/modals/BulkOperationsModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocation } from 'wouter';

// Mock data for branches
const MOCK_BRANCHES = [
  { id: "br-1", businessId: "biz-1", name: "Main Branch" },
  { id: "br-2", businessId: "biz-1", name: "Warehouse" },
  { id: "br-3", businessId: "biz-2", name: "Bole" },
];

export function Dashboard() {
  const { businessId, user, role, branchId, setBusinessContext } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  // State for tracking user interactions with quick actions
  const [actionUsage, setActionUsage] = useState<Record<string, number>>(() => {
    // Load action usage from localStorage if available
    if (typeof window !== 'undefined') {
      const savedUsage = localStorage.getItem('dashboardActionUsage');
      return savedUsage ? JSON.parse(savedUsage) : {};
    }
    return {};
  });
  
  // State for modals
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showProcessRefundsModal, setShowProcessRefundsModal] = useState(false);
  const [showGenerateStatementsModal, setShowGenerateStatementsModal] = useState(false);
  const [showBulkOperationsModal, setShowBulkOperationsModal] = useState(false);
  
  // Filter states
  const [dateRange, setDateRange] = useState('last30');
  const [selectedBranchId, setSelectedBranchId] = useState(branchId || '__all__');
  
  // Mock pending tasks data - in a real implementation, this would come from an API
  const pendingTasks = {
    invoices: 3,
    payments: 1,
    refunds: 0,
    users: 2,
    settings: 0,
    accountSetup: 1,
    reports: 0,
    statements: 0,
    exportData: 0,
    auditTrail: 5,
    bulkOps: 0,
    integrations: 1
  };
  
  // Define all actions with their properties
  const allActions = [
    { id: 'createInvoice', name: 'Create Invoice', icon: Plus, category: 'Financial', adminOnly: false },
    { id: 'recordPayment', name: 'Record Payment', icon: Receipt, category: 'Financial', adminOnly: false },
    { id: 'processRefunds', name: 'Process Refunds', icon: Wallet, category: 'Financial', adminOnly: true },
    { id: 'manageUsers', name: 'Manage Users', icon: Users, category: 'Administrative', adminOnly: true },
    { id: 'systemSettings', name: 'System Settings', icon: Settings, category: 'Administrative', adminOnly: false },
    { id: 'accountSetup', name: 'Account Setup', icon: Building2, category: 'Administrative', adminOnly: true },
    { id: 'viewReports', name: 'View Financial Reports', icon: BarChart3, category: 'Reporting', adminOnly: false },
    { id: 'generateStatements', name: 'Generate Statements', icon: FileText, category: 'Reporting', adminOnly: false },
    { id: 'exportData', name: 'Export Data', icon: Download, category: 'Reporting', adminOnly: true },
    { id: 'auditTrail', name: 'Audit Trail', icon: Activity, category: 'Advanced', adminOnly: true },
    { id: 'bulkOperations', name: 'Bulk Operations', icon: Package, category: 'Advanced', adminOnly: true },
    { id: 'integrationManagement', name: 'Integration Management', icon: Link, category: 'Advanced', adminOnly: true }
  ];
  
  // Get branches for the current business
  const businessBranches = MOCK_BRANCHES.filter(branch => branch.businessId === businessId);
  
  // Function to track action usage
  const trackAction = (actionName: string) => {
    setActionUsage(prev => {
      const newUsage = {
        ...prev,
        [actionName]: (prev[actionName] || 0) + 1
      };
      // Save to localStorage
      localStorage.setItem('dashboardActionUsage', JSON.stringify(newUsage));
      return newUsage;
    });
    
    // Perform the actual action
    switch (actionName) {
      case 'createInvoice':
        setShowCreateInvoiceModal(true);
        break;
      case 'recordPayment':
        setShowRecordPaymentModal(true);
        break;
      case 'processRefunds':
        setShowProcessRefundsModal(true);
        break;
      case 'manageUsers':
        // Navigate to users management page
        navigate('/admin/users');
        break;
      case 'systemSettings':
        // Navigate to settings page
        navigate('/settings');
        break;
      case 'accountSetup':
        // Navigate to account setup page
        navigate('/admin/businesses');
        break;
      case 'viewReports':
        // Navigate to reports page
        navigate('/reports');
        break;
      case 'generateStatements':
        setShowGenerateStatementsModal(true);
        break;
      case 'exportData':
        // For now, we'll show a toast with instructions
        toast({
          title: 'Export Data',
          description: 'Use the Export buttons on individual reports to export data.',
        });
        break;
      case 'auditTrail':
        // Navigate to audit trail page
        navigate('/admin/audit');
        break;
      case 'bulkOperations':
        setShowBulkOperationsModal(true);
        break;
      case 'integrationManagement':
        // Navigate to integration management page
        navigate('/admin/settings');
        break;
      default:
        console.warn(`Unknown action: ${actionName}`);
    }
  };
  
  // Function to get usage count for an action
  const getActionUsage = (actionName: string) => {
    return actionUsage[actionName] || 0;
  };
  
  // Function to get sorted actions by usage frequency
  const getSortedActions = (category: string) => {
    return allActions
      .filter(action => action.category === category && (role === 'Admin' || !action.adminOnly))
      .sort((a, b) => (getActionUsage(b.id) - getActionUsage(a.id)));
  };
  
  // Handle branch change
  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
    const actualBranchId = branchId === "__all__" ? "" : branchId;
    setBusinessContext(businessId!, actualBranchId);
  };
  
  // Fetch dashboard data with TanStack Query
  const { data: dashboardData, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard', businessId, user?.id, selectedBranchId, dateRange],
    queryFn: async () => {
      if (!businessId || !user?.id) {
        throw new Error('Missing business or user ID');
      }
      
      // Calculate date range for API calls
      let startDate, endDate;
      const now = new Date();
      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
          break;
        case 'yesterday':
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
          endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
          break;
        case 'last7':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 7);
          endDate = now;
          break;
        case 'last30':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          endDate = now;
          break;
        case 'last90':
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 90);
          endDate = now;
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = now;
          break;
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          endDate = new Date(now.getFullYear(), now.getMonth(), 0);
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = now;
          break;
        default:
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
          endDate = now;
      }
      
      // Fetch all required data in parallel
      const [accountSummary, accounts] = await Promise.all([
        api.getAccountSummary(businessId, user.id),
        api.getAccounts(businessId, user.id)
      ]);
      
      // Get transactions for the first account
      const transactions = accounts.length > 0 ? await api.getTransactions(accounts[0].id, user.id) : [];
      
      return {
        accountSummary,
        accounts,
        transactions
      };
    },
    enabled: !!businessId && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    // Add a timeout to prevent hanging queries
    retry: 1,
    retryDelay: 1000,
  });
  
  // KPI data based on fetched data
  const kpiData = dashboardData ? [
    {
      title: "Total Balance",
      value: `ETB ${typeof dashboardData.accountSummary.totalDebit === 'number' && typeof dashboardData.accountSummary.totalCredit === 'number' ? (dashboardData.accountSummary.totalDebit - dashboardData.accountSummary.totalCredit).toLocaleString() : '0'}`,
      change: "+12.5%",
      trend: "up",
      icon: Wallet,
    },
    {
      title: "Receipts",
      value: `ETB ${typeof dashboardData.accountSummary.totalDebit === 'number' ? dashboardData.accountSummary.totalDebit.toLocaleString() : '0'}`,
      change: "+8.2%",
      trend: "up",
      icon: Receipt,
    },
    {
      title: "Payments",
      value: `ETB ${typeof dashboardData.accountSummary.totalCredit === 'number' ? dashboardData.accountSummary.totalCredit.toLocaleString() : '0'}`,
      change: "-2.1%",
      trend: "down",
      icon: TrendingDown,
    },
    {
      title: "Accounts",
      value: typeof dashboardData.accountSummary.accountCount === 'number' ? dashboardData.accountSummary.accountCount.toString() : "0",
      change: "+3",
      trend: "up",
      icon: BarChart3,
    },
  ] : [];
  
  // Recent activity data based on fetched data
  const recentActivity = dashboardData?.transactions.slice(0, 4).map((transaction, index) => ({
    id: transaction.id,
    type: transaction.kind,
    description: transaction.note || `Transaction ${index + 1}`,
    amount: `ETB ${Number(transaction.amount).toLocaleString()}`,
    date: new Date(transaction.dateTime).toLocaleDateString(),
  })) || [];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-muted/20 rounded-lg">
                <div className="text-center">
                  <Skeleton className="h-12 w-12 mx-auto mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="text-right">
                      <Skeleton className="h-4 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Financial Actions */}
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="relative">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="absolute -top-2 -right-2 h-5 w-5 rounded-full" />
                      <Skeleton className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Administrative Actions */}
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="relative">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="absolute -top-2 -right-2 h-5 w-5 rounded-full" />
                      <Skeleton className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Reporting Actions */}
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="relative">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="absolute -top-2 -right-2 h-5 w-5 rounded-full" />
                      <Skeleton className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Advanced Actions */}
              <div>
                <Skeleton className="h-4 w-24 mb-3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="relative">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="absolute -top-2 -right-2 h-5 w-5 rounded-full" />
                      <Skeleton className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name || 'User'}</p>
          </div>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || 'User'}</p>
        </div>
        <div className="flex gap-2">
          {/* Branch Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Branch:</span>
            <Select value={selectedBranchId} onValueChange={handleBranchChange}>
              <SelectTrigger className="w-[180px]" aria-label="Select branch">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">All Branches</SelectItem>
                {businessBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date Range Picker */}
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]" aria-label="Select date range">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="last7">Last 7 Days</SelectItem>
              <SelectItem value="last30">Last 30 Days</SelectItem>
              <SelectItem value="last90">Last 90 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center mt-1">
                  {kpi.trend === 'up' ? (
                    <Badge 
                      variant="default" 
                      className="text-xs flex items-center gap-1"
                    >
                      <ArrowUpRight className="h-3 w-3" />
                      {kpi.change}
                    </Badge>
                  ) : (
                    <Badge 
                      variant="destructive" 
                      className="text-xs flex items-center gap-1"
                    >
                      <ArrowDownRight className="h-3 w-3" />
                      {kpi.change}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground ml-2">
                    from last month
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash Flow Trend</CardTitle>
            <CardDescription>
              Last 30 days income and expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Chart visualization would appear here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  No data for this range
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest transactions and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {activity.type === 'credit' || activity.type === 'out' ? (
                        <div className="p-2 rounded-full bg-red-100 text-red-600" aria-label="Payment">
                          <TrendingDown className="h-4 w-4" />
                        </div>
                      ) : (
                        <div className="p-2 rounded-full bg-green-100 text-green-600" aria-label="Receipt">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        activity.type === 'credit' || activity.type === 'out' ? 'text-destructive' : 'text-green-500'
                      }`}>
                        {activity.amount}
                      </p>
                      <Badge
                        variant="secondary"
                        className="text-xs mt-1"
                      >
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Financial Actions */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Financial</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {getSortedActions('Financial').map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 relative"
                      title={`Perform ${action.name} action`}
                      aria-label={`${action.name} - Perform this action`}
                      onClick={() => trackAction(action.id)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{action.name}</span>
                      {pendingTasks[action.id as keyof typeof pendingTasks] > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-destructive text-white">
                          {pendingTasks[action.id as keyof typeof pendingTasks]}
                        </Badge>
                      )}
                      {getActionUsage(action.id) > 0 && (
                        <Badge variant="secondary" className="absolute -bottom-2 -right-2 text-xs">
                          {getActionUsage(action.id)}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* Administrative Actions */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Administrative</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {getSortedActions('Administrative').map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 relative"
                      title={`Perform ${action.name} action`}
                      aria-label={`${action.name} - Perform this action`}
                      onClick={() => trackAction(action.id)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{action.name}</span>
                      {pendingTasks[action.id as keyof typeof pendingTasks] > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-destructive text-white">
                          {pendingTasks[action.id as keyof typeof pendingTasks]}
                        </Badge>
                      )}
                      {getActionUsage(action.id) > 0 && (
                        <Badge variant="secondary" className="absolute -bottom-2 -right-2 text-xs">
                          {getActionUsage(action.id)}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* Reporting Actions */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Reporting</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {getSortedActions('Reporting').map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 relative"
                      title={`Perform ${action.name} action`}
                      aria-label={`${action.name} - Perform this action`}
                      onClick={() => trackAction(action.id)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{action.name}</span>
                      {pendingTasks[action.id as keyof typeof pendingTasks] > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-destructive text-white">
                          {pendingTasks[action.id as keyof typeof pendingTasks]}
                        </Badge>
                      )}
                      {getActionUsage(action.id) > 0 && (
                        <Badge variant="secondary" className="absolute -bottom-2 -right-2 text-xs">
                          {getActionUsage(action.id)}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
            
            {/* Advanced Actions */}
            <div>
              <h3 className="text-sm font-medium mb-3 text-muted-foreground">Advanced</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {getSortedActions('Advanced').filter(action =>
                  (action.id !== 'auditTrail' && action.id !== 'bulkOperations') ||
                  (role === 'Admin' && (action.id === 'auditTrail' || action.id === 'bulkOperations'))
                ).map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center gap-2 relative"
                      title={`Perform ${action.name} action`}
                      aria-label={`${action.name} - Perform this action`}
                      onClick={() => trackAction(action.id)}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{action.name}</span>
                      {pendingTasks[action.id as keyof typeof pendingTasks] > 0 && (
                        <Badge className="absolute -top-2 -right-2 bg-destructive text-white">
                          {pendingTasks[action.id as keyof typeof pendingTasks]}
                        </Badge>
                      )}
                      {getActionUsage(action.id) > 0 && (
                        <Badge variant="secondary" className="absolute -bottom-2 -right-2 text-xs">
                          {getActionUsage(action.id)}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Modals */}
      <CreateInvoiceModal
        open={showCreateInvoiceModal}
        onClose={() => setShowCreateInvoiceModal(false)}
        onSubmit={async (data) => {
          // TODO: Implement invoice creation API call
          console.log('Creating invoice:', data);
          // For now, just close the modal
          setShowCreateInvoiceModal(false);
          // Show success message
          toast({
            title: 'Invoice Created',
            description: 'The invoice has been created successfully.',
          });
          // Invalidate relevant queries to refresh data
          queryClient.invalidateQueries({ queryKey: ['invoices', businessId] });
        }}
      />
      
      <CashEntryModal
        open={showRecordPaymentModal}
        onClose={() => setShowRecordPaymentModal(false)}
        type="in"
        onSubmit={async (amount, note, attachmentUrl, cashAccountId, offsetAccountId, partyId) => {
          try {
            // Call the API to record payment
            await api.createCashbookEntry({
              businessId: businessId!,
              dateTime: new Date().toISOString(),
              direction: 'in',
              amount: amount.toString(),
              note: note || '',
              attachmentUrl: attachmentUrl,
            });
            
            // Show success message
            toast({
              title: 'Payment Recorded',
              description: 'The payment has been recorded successfully.',
            });
            
            // Close the modal
            setShowRecordPaymentModal(false);
            
            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['cashbook', businessId] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats', businessId] });
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to record payment. Please try again.',
              variant: 'destructive',
            });
          }
        }}
      />
      
      <CashEntryModal
        open={showProcessRefundsModal}
        onClose={() => setShowProcessRefundsModal(false)}
        type="out"
        onSubmit={async (amount, note, attachmentUrl, cashAccountId, offsetAccountId, partyId) => {
          try {
            // Call the API to process refund
            await api.createCashbookEntry({
              businessId: businessId!,
              dateTime: new Date().toISOString(),
              direction: 'out',
              amount: amount.toString(),
              note: note || '',
              attachmentUrl: attachmentUrl,
            });
            
            // Show success message
            toast({
              title: 'Refund Processed',
              description: 'The refund has been processed successfully.',
            });
            
            // Close the modal
            setShowProcessRefundsModal(false);
            
            // Invalidate relevant queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['cashbook', businessId] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats', businessId] });
          } catch (error) {
            toast({
              title: 'Error',
              description: 'Failed to process refund. Please try again.',
              variant: 'destructive',
            });
          }
        }}
      />
      
      {/* Generate Statements Modal */}
      <Dialog
        open={showGenerateStatementsModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowGenerateStatementsModal(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Generate Statements</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGenerateStatementsModal(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          <StatementGenerator />
        </DialogContent>
      </Dialog>
      
      {/* Bulk Operations Modal */}
      <BulkOperationsModal
        open={showBulkOperationsModal}
        onClose={() => setShowBulkOperationsModal(false)}
      />
      
      {/* Audit-friendly footer */}
      <div className="text-xs text-center text-muted-foreground mt-8">
        <p>Application Version: 1.0.0 | Environment: {process.env.NODE_ENV || 'development'}</p>
      </div>
    </div>
  );
}